from __future__ import annotations

import json
import logging
import queue
import subprocess
import sys
import threading
import time
from pathlib import Path
from typing import Optional

from flask import Blueprint, Response, jsonify, request, send_from_directory

# ── Logging ───────────────────────────────────────────────────────────────────
logger = logging.getLogger("test_run")
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] test_run: %(message)s",
    datefmt="%H:%M:%S",
)

# ── Config ────────────────────────────────────────────────────────────────────
BASE_DIR       = Path(__file__).resolve().parent.parent
TEST_DIR       = BASE_DIR / "test"
TESTS_FILE     = TEST_DIR / "test_cases.json"
CONFIG_FILE    = TEST_DIR / "runner_config.json"

RUNNER_SCRIPT  = TEST_DIR / "runner.py"

STATE_RUN_DIR  = BASE_DIR / ".test_run"
RESULTS_DIR    = STATE_RUN_DIR / "results"
STATE_FILE     = STATE_RUN_DIR / "_run_state.json"

logger.info("BASE_DIR    = %s", BASE_DIR)
logger.info("TEST_DIR    = %s", TEST_DIR)
logger.info("TESTS_FILE  = %s  exists=%s", TESTS_FILE, TESTS_FILE.exists())
logger.info("CONFIG_FILE = %s  exists=%s", CONFIG_FILE, CONFIG_FILE.exists())
logger.info("RUNNER      = %s  exists=%s", RUNNER_SCRIPT, RUNNER_SCRIPT.exists())
logger.info("STATE_FILE  = %s", STATE_FILE)

test_run_bp = Blueprint("test_run", __name__)

_run_lock     = threading.Lock()
_run_active   = False
_event_queues = []

DEFAULT_CONFIG = {
    "sites": {
        "cl": {"name": "Cottagelabs", "base_url": ""},
        "ox": {"name": "Bodleian",    "base_url": ""},
    },
    "auth": {
        "cl": {"required": False, "username": "", "password": ""},
        "ox": {"required": False, "username": "", "password": ""},
    },
    "config": {
        "capture_all_screenshots": False,
        "fail_fast":               False,
        "clean_old_results":       True,
        "diff_threshold":          0.1,
        "max_diff_pixels":         0,
        "viewport_width":          1440,
        "viewport_height":         900,
    },
}


# ── Helpers ───────────────────────────────────────────────────────────────────
def _broadcast(event: str, data: dict):
    msg = f"event: {event}\ndata: {json.dumps(data)}\n\n"
    for q in list(_event_queues):
        try:
            q.put_nowait(msg)
        except queue.Full:
            logger.warning("SSE queue full — dropping '%s'", event)


def _write_state(state: dict):
    try:
        STATE_RUN_DIR.mkdir(parents=True, exist_ok=True)
        tmp = STATE_FILE.with_suffix(".tmp")
        tmp.write_text(json.dumps(state, indent=2))
        tmp.replace(STATE_FILE)
    except Exception as exc:
        logger.error("Failed to write state file: %s", exc)


def _read_state() -> Optional[dict]:
    if not STATE_FILE.exists():
        return None
    try:
        data = json.loads(STATE_FILE.read_text())
        logger.info("State loaded: status=%s  tests=%d", data.get("status"), len(data.get("tests", {})))
        return data
    except Exception as exc:
        logger.error("Failed to read state file: %s", exc)
        return None


def _read_config() -> dict:
    if not CONFIG_FILE.exists():
        logger.warning("runner_config.json not found — returning defaults")
        return DEFAULT_CONFIG
    try:
        with open(CONFIG_FILE) as f:
            return json.load(f)
    except Exception as exc:
        logger.error("Failed to read runner_config.json: %s", exc)
        return DEFAULT_CONFIG


def _write_config(data: dict):
    with open(CONFIG_FILE, "w") as f:
        json.dump(data, f, indent=2)


def _is_running() -> bool:
    """Check if a run is currently active (thread flag OR state file)."""
    if _run_active:
        return True
    state = _read_state()
    return bool(state and state.get("status") == "running")


def _build_initial_state(tests: dict) -> dict:
    return {
        "status":      "running",
        "started_at":  time.time(),
        "finished_at": None,
        "exit_code":   None,
        "report":      None,
        "logs":        [],
        "tests_snapshot": dict(tests),   # locked copy — immune to file edits during run
        "tests": {
            tid: {
                "test_name":          t.get("test_name", tid),
                "uri":                t.get("uri", ""),
                "status":             "queued",
                "matching_percentage": None,
                "cl_load_time_ms":    None,
                "ox_load_time_ms":    None,
                "duration_ms":        None,
                "execution_error":    None,
                "cl_site_url":        None,
                "ox_site_url":        None,
                "artifacts": {
                    "cl_site_image": None,
                    "ox_site_image": None,
                    "diff_image":    None,
                },
            }
            for tid, t in tests.items()
        },
    }


# ── UI ────────────────────────────────────────────────────────────────────────
@test_run_bp.route("/test-run")
def testRun():
    return send_from_directory(str(TEST_DIR), "index.html")


# ── Test cases CRUD ───────────────────────────────────────────────────────────
@test_run_bp.route("/api/tests", methods=["GET"])
def get_tests():
    if not TESTS_FILE.exists():
        return jsonify({})
    with open(TESTS_FILE) as f:
        return jsonify(json.load(f))


@test_run_bp.route("/api/tests", methods=["POST"])
def save_tests():
    if _is_running():
        return jsonify({"error": "Cannot edit tests while a run is in progress"}), 409
    data = request.get_json(force=True)
    with open(TESTS_FILE, "w") as f:
        json.dump(data, f, indent=2)
    logger.info("Saved %d test cases", len(data))
    return jsonify({"ok": True})


# ── Runner config ─────────────────────────────────────────────────────────────
@test_run_bp.route("/api/settings", methods=["GET"])
def get_settings():
    return jsonify(_read_config())


@test_run_bp.route("/api/settings", methods=["POST"])
def save_settings():
    if _is_running():
        return jsonify({"error": "Cannot edit settings while a run is in progress"}), 409
    data = request.get_json(force=True)
    # Deep-merge into existing config so partial updates don't wipe unrelated keys
    existing = _read_config()
    for section in ("sites", "auth", "config"):
        if section in data:
            if isinstance(data[section], dict) and isinstance(existing.get(section), dict):
                for k, v in data[section].items():
                    if isinstance(v, dict) and isinstance(existing[section].get(k), dict):
                        existing[section][k].update(v)
                    else:
                        existing[section][k] = v
            else:
                existing[section] = data[section]
    _write_config(existing)
    logger.info("runner_config.json saved")
    return jsonify({"ok": True})


# ── Run tests ─────────────────────────────────────────────────────────────────
@test_run_bp.route("/api/run", methods=["POST"])
def run_tests():
    global _run_active

    with _run_lock:
        existing = _read_state()
        if existing and existing.get("status") == "running":
            return jsonify({"error": "A run is already in progress"}), 409
        _run_active = True

    # Validate
    for label, path in [("test_cases.json", TESTS_FILE), ("runner_config.json", CONFIG_FILE), ("test_layout.py", RUNNER_SCRIPT)]:
        if not path.exists():
            _run_active = False
            msg = f"{label} not found at {path}"
            logger.error(msg)
            return jsonify({"error": msg}), 500

    try:
        with open(TESTS_FILE) as f:
            tests = json.load(f)
    except Exception as exc:
        _run_active = False
        return jsonify({"error": f"Could not parse test_cases.json: {exc}"}), 500

    if not tests:
        _run_active = False
        return jsonify({"error": "No test cases found"}), 400

    # Write initial state before thread starts
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    run_state = _build_initial_state(tests)
    _write_state(run_state)
    logger.info("Initial state written — %d tests queued", len(tests))

    def _stream_run():
        global _run_active
        logger.info("Run thread started")
        try:
            _broadcast("run_start", {"ts": run_state["started_at"]})
            # Use the snapshot so the UI shows exactly what was locked in at run start
            snapshot = run_state["tests_snapshot"]
            _broadcast("test_list", {"ids": list(snapshot.keys()), "tests": snapshot})

            proc = subprocess.Popen(
                [sys.executable, str(RUNNER_SCRIPT)],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                cwd=str(BASE_DIR),
            )
            logger.info("Subprocess PID: %s", proc.pid)

            current_test = None

            for raw_line in proc.stdout:
                line = raw_line.rstrip()
                if not line:
                    continue

                run_state["logs"].append(line)
                if len(run_state["logs"]) > 300:
                    run_state["logs"] = run_state["logs"][-300:]

                _broadcast("log", {"line": line})

                # ── Structured result (rich, immediate) ───────────────────────
                if "##RESULT##" in line:
                    try:
                        json_part = line[line.index("##RESULT##") + len("##RESULT##"):].strip()
                        result    = json.loads(json_part)
                        result_name = result.get("test_name")
                        normalized  = result.get("id")
                        if result_name or normalized:
                            status = result.get("status", "unknown")
                            # Map back to test_cases.json key
                            state_key = next(
                                (k for k, v in run_state["tests"].items()
                                 if v.get("test_name") == result_name or k == normalized),
                                normalized,
                            )
                            logger.info("  ##RESULT## %s (key=%s) => %s  match=%s",
                                        result_name, state_key, status,
                                        result.get("matching_percentage"))
                            run_state["tests"][state_key] = {
                                **run_state["tests"].get(state_key, {}),
                                "status":              status,
                                "matching_percentage": result.get("matching_percentage"),
                                "cl_load_time_ms":     result.get("cl_load_time_ms"),
                                "ox_load_time_ms":     result.get("ox_load_time_ms"),
                                "duration_ms":         result.get("duration_ms"),
                                "execution_error":     result.get("execution_error"),
                                "cl_site_url":         result.get("cl_site_url"),
                                "ox_site_url":         result.get("ox_site_url"),
                                "artifacts":           result.get("artifacts", {
                                    "cl_site_image": None,
                                    "ox_site_image": None,
                                    "diff_image":    None,
                                }),
                            }
                            _write_state(run_state)
                            _broadcast("test_result", {
                                "id":     state_key,
                                "status": status,
                                "pct":    result.get("matching_percentage"),
                                "error":  result.get("execution_error"),
                                "result": {**result, "id": state_key},
                            })
                            current_test = None
                    except Exception as exc:
                        logger.error("Failed to parse ##RESULT##: %s | %s", line, exc)

                # ── Test start marker ─────────────────────────────────────────
                elif "Executing test:" in line:
                    name = line.split("Executing test:", 1)[1].strip()
                    tid  = next(
                        (k for k, v in tests.items() if v.get("test_name") == name),
                        name,
                    )
                    current_test = tid
                    logger.info("  → Running: %s (%s)", name, tid)
                    if tid not in run_state["tests"]:
                        run_state["tests"][tid] = {"test_name": name, "status": "running"}
                    else:
                        run_state["tests"][tid]["status"] = "running"
                    _write_state(run_state)
                    _broadcast("test_start", {"id": tid, "name": name})

            proc.wait()
            exit_code = proc.returncode
            logger.info("Subprocess exited — code=%s", exit_code)

            # Load final report for summary
            report_data = None
            reports = sorted(RESULTS_DIR.glob("reports_*.json"), reverse=True)
            if reports:
                try:
                    with open(reports[0]) as f:
                        report_data = json.load(f)
                    logger.info("Loaded final report: %s", reports[0].name)
                except Exception as exc:
                    logger.error("Failed to read report: %s", exc)
            else:
                logger.warning("No reports_*.json found in %s", RESULTS_DIR)

            run_state["status"]      = "finished"
            run_state["finished_at"] = time.time()
            run_state["exit_code"]   = exit_code
            run_state["report"]      = report_data
            _write_state(run_state)
            logger.info("Run finished — state saved")

            _broadcast("run_end", {
                "exit_code": exit_code,
                "report":    report_data,
                "run_state": run_state,
            })

        except Exception as exc:
            logger.exception("Unexpected error in run thread: %s", exc)
            try:
                run_state["status"] = "error"
                run_state["logs"].append(f"[INTERNAL ERROR] {exc}")
                _write_state(run_state)
            except Exception:
                pass
            _broadcast("run_error", {"error": str(exc)})

        finally:
            with _run_lock:
                _run_active = False
            logger.info("Run thread exiting")

    threading.Thread(target=_stream_run, daemon=True).start()
    return jsonify({"ok": True})


# ── Run status (for UI to check if locked) ───────────────────────────────────
@test_run_bp.route("/api/run/status", methods=["GET"])
def run_status():
    return jsonify({"running": _is_running()})


# ── SSE ───────────────────────────────────────────────────────────────────────
@test_run_bp.route("/api/events")
def events():
    q = queue.Queue(maxsize=200)
    _event_queues.append(q)
    logger.info("SSE client connected (total=%d)", len(_event_queues))

    def generate():
        try:
            yield "event: connected\ndata: {}\n\n"
            while True:
                try:
                    yield q.get(timeout=30)
                except queue.Empty:
                    yield ": ping\n\n"
        finally:
            if q in _event_queues:
                _event_queues.remove(q)
            logger.info("SSE client disconnected (total=%d)", len(_event_queues))

    return Response(
        generate(),
        mimetype="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


# ── Last report ───────────────────────────────────────────────────────────────
@test_run_bp.route("/api/last-report", methods=["GET"])
def last_report():
    state = _read_state()
    if state:
        return jsonify(state)
    if not RESULTS_DIR.exists():
        return jsonify(None)
    reports = sorted(RESULTS_DIR.glob("reports_*.json"), reverse=True)
    if not reports:
        return jsonify(None)
    try:
        with open(reports[0]) as f:
            return jsonify(json.load(f))
    except Exception as exc:
        logger.error("Failed to read fallback report: %s", exc)
        return jsonify(None)


# ── Serve result images ───────────────────────────────────────────────────────
@test_run_bp.route("/results/<path:filename>")
def result_file(filename):
    return send_from_directory(str(RESULTS_DIR), filename)