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
BASE_DIR      = Path(__file__).resolve().parent.parent
TEST_DIR      = BASE_DIR / "test"
TESTS_FILE    = TEST_DIR / "test_cases.json"
RESULTS_DIR   = BASE_DIR / "results"
ENV_FILE      = BASE_DIR / ".env"
RUNNER_SCRIPT = TEST_DIR / "runner.py"

# State file lives OUTSIDE results/ so CLEAN_OLD_RESULTS in test_layout.py
# never wipes it.
STATE_RUN_DIR = BASE_DIR / ".test_run"
STATE_FILE    = STATE_RUN_DIR / "_run_state.json"

logger.info("BASE_DIR   = %s", BASE_DIR)
logger.info("TEST_DIR   = %s", TEST_DIR)
logger.info("TESTS_FILE = %s  exists=%s", TESTS_FILE, TESTS_FILE.exists())
logger.info("RUNNER     = %s  exists=%s", RUNNER_SCRIPT, RUNNER_SCRIPT.exists())
logger.info("RESULTS    = %s", RESULTS_DIR)
logger.info("STATE_FILE = %s", STATE_FILE)

test_run_bp = Blueprint("test_run", __name__)

# ── Shared state ──────────────────────────────────────────────────────────────
_run_lock     = threading.Lock()
_run_active   = False
_event_queues = []


# ── SSE broadcast ─────────────────────────────────────────────────────────────
def _broadcast(event: str, data: dict):
    msg = f"event: {event}\ndata: {json.dumps(data)}\n\n"
    for q in list(_event_queues):
        try:
            q.put_nowait(msg)
        except queue.Full:
            logger.warning("SSE queue full — dropping event '%s'", event)


# ── State file helpers ────────────────────────────────────────────────────────
def _write_state(state: dict):
    """Atomically persist run state to disk."""
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
        logger.info(
            "State file loaded: status=%s  tests=%d",
            data.get("status"),
            len(data.get("tests", {})),
        )
        return data
    except Exception as exc:
        logger.error("Failed to read state file: %s", exc)
        return None


def _build_initial_state(tests: dict) -> dict:
    return {
        "status": "running",
        "started_at": time.time(),
        "finished_at": None,
        "exit_code": None,
        "report": None,
        "logs": [],
        "tests": {
            tid: {
                "test_name": t.get("test_name", tid),
                "uri": t.get("uri", ""),
                "status": "queued",
                "matching_percentage": None,
                "cl_load_time_ms": None,
                "ox_load_time_ms": None,
                "duration_ms": None,
                "execution_error": None,
                "cl_site_url": None,
                "ox_site_url": None,
                "artifacts": {
                    "cl_site_image": None,
                    "ox_site_image": None,
                    "diff_image": None,
                },
            }
            for tid, t in tests.items()
        },
    }


# ── UI ────────────────────────────────────────────────────────────────────────
@test_run_bp.route("/test-run")
def testRun():
    logger.info("Serving UI from %s", TEST_DIR)
    return send_from_directory(str(TEST_DIR), "index.html")


# ── Test cases CRUD ───────────────────────────────────────────────────────────
@test_run_bp.route("/api/tests", methods=["GET"])
def get_tests():
    if not TESTS_FILE.exists():
        logger.warning("test_cases.json not found at %s", TESTS_FILE)
        return jsonify({})
    with open(TESTS_FILE) as f:
        data = json.load(f)
    logger.info("Returning %d test cases", len(data))
    return jsonify(data)


@test_run_bp.route("/api/tests", methods=["POST"])
def save_tests():
    data = request.get_json(force=True)
    with open(TESTS_FILE, "w") as f:
        json.dump(data, f, indent=2)
    logger.info("Saved %d test cases", len(data))
    return jsonify({"ok": True})


# ── Settings (.env) ───────────────────────────────────────────────────────────
def _parse_env(path: Path) -> dict:
    env = {}
    if not path.exists():
        logger.warning(".env not found at %s", path)
        return env
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, _, v = line.partition("=")
        env[k.strip()] = v.strip().strip('"').strip("'")
    return env


def _write_env(path: Path, env: dict):
    path.write_text("\n".join(f"{k}={v}" for k, v in env.items()) + "\n")


@test_run_bp.route("/api/settings", methods=["GET"])
def get_settings():
    return jsonify(_parse_env(ENV_FILE))


@test_run_bp.route("/api/settings", methods=["POST"])
def save_settings():
    data = request.get_json(force=True)
    existing = _parse_env(ENV_FILE)
    existing.update(data)
    _write_env(ENV_FILE, existing)
    logger.info("Settings saved")
    return jsonify({"ok": True})


# ── Run tests ─────────────────────────────────────────────────────────────────
@test_run_bp.route("/api/run", methods=["POST"])
def run_tests():
    global _run_active

    # Block concurrent runs using file state as source of truth
    with _run_lock:
        existing = _read_state()
        if existing and existing.get("status") == "running":
            logger.warning("Run already active per state file")
            return jsonify({"error": "A run is already in progress"}), 409
        _run_active = True

    # Validate before spawning thread
    if not TESTS_FILE.exists():
        _run_active = False
        msg = f"test_cases.json not found at {TESTS_FILE}"
        logger.error(msg)
        return jsonify({"error": msg}), 500

    try:
        with open(TESTS_FILE) as f:
            tests = json.load(f)
    except Exception as exc:
        _run_active = False
        msg = f"Could not parse test_cases.json: {exc}"
        logger.error(msg)
        return jsonify({"error": msg}), 500

    if not tests:
        _run_active = False
        logger.warning("test_cases.json is empty")
        return jsonify({"error": "No test cases found in test_cases.json"}), 400

    if not RUNNER_SCRIPT.exists():
        _run_active = False
        msg = f"Runner script not found: {RUNNER_SCRIPT}"
        logger.error(msg)
        return jsonify({"error": msg}), 500

    # Write initial state to disk BEFORE spawning the thread.
    # This guarantees the state file exists even if the thread crashes immediately.
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    run_state = _build_initial_state(tests)
    _write_state(run_state)
    logger.info("Initial state written — %d tests queued", len(tests))

    # Background thread
    def _stream_run():
        global _run_active
        logger.info("Run thread started")
        try:
            _broadcast("run_start", {"ts": run_state["started_at"]})
            _broadcast("test_list", {"ids": list(tests.keys()), "tests": tests})

            logger.info("Launching subprocess: %s", RUNNER_SCRIPT)
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

                # Keep rolling log in state (capped at 300 lines)
                run_state["logs"].append(line)
                if len(run_state["logs"]) > 300:
                    run_state["logs"] = run_state["logs"][-300:]

                _broadcast("log", {"line": line})

                # ── ##RESULT## — rich per-test result from test_layout.py ────────
                # Emitted immediately after each test with full data.
                if "##RESULT##" in line:
                    try:
                        json_part = line[line.index("##RESULT##") + len("##RESULT##"):].strip()
                        result = json.loads(json_part)
                        tid = result.get("id")
                        if tid:
                            status = result.get("status", "unknown")
                            logger.info("  ##RESULT## %s => %s  match=%s", tid, status, result.get("matching_percentage"))
                            run_state["tests"][tid] = {
                                **run_state["tests"].get(tid, {}),
                                "status": status,
                                "matching_percentage": result.get("matching_percentage"),
                                "cl_load_time_ms": result.get("cl_load_time_ms"),
                                "ox_load_time_ms": result.get("ox_load_time_ms"),
                                "duration_ms": result.get("duration_ms"),
                                "execution_error": result.get("execution_error"),
                                "cl_site_url": result.get("cl_site_url"),
                                "ox_site_url": result.get("ox_site_url"),
                                "artifacts": result.get("artifacts", {
                                    "cl_site_image": None,
                                    "ox_site_image": None,
                                    "diff_image": None,
                                }),
                            }
                            _write_state(run_state)
                            _broadcast("test_result", {
                                "id": tid,
                                "status": status,
                                "pct": result.get("matching_percentage"),
                                "error": result.get("execution_error"),
                                "result": result,
                            })
                            current_test = None
                        else:
                            logger.warning("##RESULT## line missing id: %s", line)
                    except Exception as exc:
                        logger.error("Failed to parse ##RESULT## line: %s | error: %s", line, exc)

                # ── Test start marker ──────────────────────────────────────────
                # NOTE: No fallback pass/fail handlers — ##RESULT## is the only
                # place we set final status. Fallbacks caused double-fires and
                # left current_test=None before ##RESULT## could merge full data.
                elif "Executing test:" in line:
                    name = line.split("▶ Executing test:", 1)[1].strip()
                    tid = next(
                        (k for k, v in tests.items() if v.get("test_name") == name),
                        name,
                    )
                    current_test = tid
                    logger.info("  → Running: %s (%s)", name, tid)
                    if tid not in run_state["tests"]:
                        logger.warning("Unknown test id '%s' — adding to state", tid)
                        run_state["tests"][tid] = {"test_name": name, "status": "running"}
                    else:
                        run_state["tests"][tid]["status"] = "running"
                    _write_state(run_state)
                    _broadcast("test_start", {"id": tid, "name": name})

            proc.wait()
            exit_code = proc.returncode
            logger.info("Subprocess exited — code=%s", exit_code)

            # Load the final report for the summary strip.
            # All rich per-test data is already in run_state via ##RESULT## lines.
            report_data = None
            reports = sorted(RESULTS_DIR.glob("reports_*.json"), reverse=True)
            if reports:
                logger.info("Loading final report: %s", reports[0].name)
                try:
                    with open(reports[0]) as f:
                        report_data = json.load(f)
                except Exception as exc:
                    logger.error("Failed to read final report: %s", exc)
            else:
                logger.warning(
                    "No reports_*.json in %s — summary will be empty. "
                    "Check test_layout.py ran without crashing.",
                    RESULTS_DIR,
                )

            run_state["status"] = "finished"
            run_state["finished_at"] = time.time()
            run_state["exit_code"] = exit_code
            run_state["report"] = report_data
            _write_state(run_state)
            logger.info("Run finished — state saved")

            _broadcast("run_end", {
                "exit_code": exit_code,
                "report": report_data,
                "run_state": run_state,
            })

        except Exception as exc:
            logger.exception("Unexpected error in run thread: %s", exc)
            try:
                run_state["status"] = "error"
                run_state["logs"].append(f"[INTERNAL ERROR] {exc}")
                _write_state(run_state)
            except Exception as inner:
                logger.error("Also failed to write error state: %s", inner)
            _broadcast("run_error", {"error": str(exc)})

        finally:
            with _run_lock:
                _run_active = False
            logger.info("Run thread exiting")

    threading.Thread(target=_stream_run, daemon=True).start()
    logger.info("Run thread spawned — returning 200")
    return jsonify({"ok": True})


# ── SSE stream ────────────────────────────────────────────────────────────────
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
                    msg = q.get(timeout=30)
                    yield msg
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
    """
    Called by the UI on every page load / refresh.
    Returns _run_state.json (has live + merged per-test data).
    Falls back to the latest reports_*.json if no state file exists yet.
    """
    run_state = _read_state()
    if run_state:
        logger.info("Returning state file: status=%s", run_state.get("status"))
        return jsonify(run_state)

    if not RESULTS_DIR.exists():
        logger.info("No results dir — returning null")
        return jsonify(None)

    reports = sorted(RESULTS_DIR.glob("reports_*.json"), reverse=True)
    if not reports:
        logger.info("No reports_*.json — returning null")
        return jsonify(None)

    logger.info("Falling back to report: %s", reports[0].name)
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