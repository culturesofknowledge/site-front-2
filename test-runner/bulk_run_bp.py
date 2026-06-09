"""Flask Blueprint for bulk run — parallel full-database visual regression testing."""
from __future__ import annotations

import json
import logging
import os
import queue
import signal
import subprocess
import sys
import threading
from pathlib import Path
from typing import Optional

from flask import Blueprint, Response, jsonify, request, send_from_directory

import bulk_db
import solr_url_gen

logger   = logging.getLogger("bulk_run")
BASE_DIR = Path(__file__).resolve().parent
RESULTS_DIR = BASE_DIR / ".bulk_run" / "results"

bulk_run_bp = Blueprint("bulk_run", __name__)

_event_queues: list[queue.Queue] = []
_run_active    = False
_run_lock      = threading.Lock()
_stop_event    = threading.Event()
_current_proc: Optional[subprocess.Popen] = None
_current_run_id: Optional[str] = None

# In-memory log ring-buffer — survives page refreshes within the same server session
_log_buffer: list[str] = []
_LOG_MAX = 500

def init_bulk():
    """Call once from create_app() — not at module level to avoid firing on reloads."""
    bulk_db.init_db()
    bulk_db.reset_interrupted_runs()


# ── Broadcast ─────────────────────────────────────────────────────────────────

def _log(run_id: str, msg: str):
    """Print to terminal AND broadcast to SSE clients."""
    line = f"[{run_id}] {msg}"
    print(line, flush=True)
    _broadcast("bulk_log", {"line": line})


def _broadcast(event: str, data: dict):
    msg = f"event: {event}\ndata: {json.dumps(data)}\n\n"
    for q in list(_event_queues):
        try:
            q.put_nowait(msg)
        except queue.Full:
            pass
    if event == "bulk_log":
        line = data.get("line", "")
        _log_buffer.append(line)
        if len(_log_buffer) > _LOG_MAX:
            del _log_buffer[:-_LOG_MAX]


# ── Pages ─────────────────────────────────────────────────────────────────────

@bulk_run_bp.route("/bulk-run")
def bulk_run_page():
    return send_from_directory(str(BASE_DIR), "bulk_run.html")


# ── Status ────────────────────────────────────────────────────────────────────

@bulk_run_bp.route("/api/bulk/status")
def get_status():
    bulk_db.init_db()
    run = bulk_db.get_latest_run()
    eta_ms = None
    if run and _run_active:
        eta_ms = bulk_db.estimate_remaining_ms(run["run_id"])
    return jsonify({"running": _run_active, "run": run, "eta_ms": eta_ms})


@bulk_run_bp.route("/api/bulk/logs")
def get_logs():
    return jsonify({"logs": list(_log_buffer)})


@bulk_run_bp.route("/api/bulk/runs")
def list_runs():
    bulk_db.init_db()
    return jsonify(bulk_db.list_runs())


# ── Preview (count only — no run started) ─────────────────────────────────────

@bulk_run_bp.route("/api/bulk/preview", methods=["POST"])
def preview():
    data     = request.get_json(force=True) or {}
    solr_url = data.get("solr_url", "").strip()
    cores    = data.get("cores") or None

    if not solr_url:
        return jsonify({"error": "solr_url is required"}), 400

    try:
        counts = solr_url_gen.count_urls(solr_url, cores=cores)
        return jsonify({"counts": counts, "total": sum(v for v in counts.values() if v >= 0)})
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


# ── Start run ─────────────────────────────────────────────────────────────────

@bulk_run_bp.route("/api/bulk/start", methods=["POST"])
def start_run():
    global _run_active

    with _run_lock:
        if _run_active:
            return jsonify({"error": "A bulk run is already in progress"}), 409
        _run_active = True

    data     = request.get_json(force=True) or {}
    solr_url = data.get("solr_url", "").strip()
    limit    = data.get("limit")        # per-core limit; None = all
    cores               = data.get("cores") or None
    workers             = int(data.get("workers", 4))
    capture_passed_diff = bool(data.get("capture_passed_diff", False))
    cl_name  = data.get("cl_name", "").strip()
    cl_url   = data.get("cl_url",  "").strip()
    ox_name  = data.get("ox_name", "").strip()
    ox_url   = data.get("ox_url",  "").strip()

    if not solr_url:
        _run_active = False
        return jsonify({"error": "solr_url is required"}), 400

    if not cl_url or not ox_url:
        _run_active = False
        return jsonify({"error": "Site A and Site B base URLs are required"}), 400

    # Save site URLs synchronously (fast — just writes a small JSON file)
    try:
        from test_run import _read_config, _write_config
        cfg = _read_config()
        cfg.setdefault("sites", {})
        cfg["sites"]["cl"] = {**cfg["sites"].get("cl", {}), "name": cl_name or "Site A", "base_url": cl_url}
        cfg["sites"]["ox"] = {**cfg["sites"].get("ox", {}), "name": ox_name or "Site B", "base_url": ox_url}
        _write_config(cfg)
        logger.info("Sites saved — cl=%s  ox=%s", cl_url, ox_url)
    except Exception as exc:
        _run_active = False
        return jsonify({"error": f"Failed to save site config: {exc}"}), 500

    _stop_event.clear()
    _log_buffer.clear()

    # Create the run record NOW so the browser gets a run_id immediately
    bulk_db.init_db()
    run_id = bulk_db.create_run({
        "solr_url": solr_url, "workers": workers, "limit": limit,
        "cl_url": cl_url, "ox_url": ox_url,
    }, status="generating")
    logger.info("Run %s created (status=generating)", run_id)

    # All slow work (Solr queries + subprocess) happens in this background thread
    def _run_thread():
        global _run_active, _current_proc, _current_run_id
        _current_run_id = run_id

        def _stopped(reason: str):
            """Shared cleanup when the run is cancelled at any phase."""
            skipped = bulk_db.skip_remaining_tests(run_id, include_queued=True)
            bulk_db.finish_run(run_id, "interrupted")
            stats = bulk_db.get_run_stats(run_id)
            logger.warning("Run %s stopped: %s — %d skipped", run_id, reason, skipped)
            _log(run_id, f"Stopped: {reason} — {skipped} tests skipped")
            _broadcast("bulk_done", {**stats, "exit_code": -1})

        try:
            # Phase 1 — query Solr for all record IDs
            _log(run_id, f"Querying Solr at {solr_url} ...")
            _broadcast("bulk_generating", {"run_id": run_id, "phase": "solr"})

            try:
                tests = solr_url_gen.generate_urls(solr_url, cores=cores, limit=limit)
            except Exception as exc:
                err = str(exc)
                logger.error("Solr error for run %s: %s", run_id, err)
                bulk_db.finish_run(run_id, "error")
                _log(run_id, f"ERROR: {err}")
                _broadcast("bulk_error", {"run_id": run_id, "error": err})
                return

            if _stop_event.is_set():
                _stopped("cancelled during Solr query")
                return

            if not tests:
                err = "No records returned from Solr — check the Solr URL and selected collections."
                bulk_db.finish_run(run_id, "error")
                _log(run_id, f"ERROR: {err}")
                _broadcast("bulk_error", {"run_id": run_id, "error": err})
                return

            # Phase 2 — write tests to SQLite
            _log(run_id, f"Inserting {len(tests):,} tests into database ...")
            _broadcast("bulk_generating", {"run_id": run_id, "phase": "db", "total": len(tests)})
            bulk_db.insert_tests(run_id, tests)

            if _stop_event.is_set():
                _stopped("cancelled before tests started")
                return

            bulk_db.finish_run(run_id, "running")
            stats = bulk_db.get_run_stats(run_id)
            _broadcast("bulk_run_start", {**stats})
            logger.info("Run %s: %d tests queued, launching runner", run_id, len(tests))

            # Phase 3 — launch the parallel Playwright runner subprocess
            cmd = [
                sys.executable, str(BASE_DIR / "bulk_runner.py"),
                "--run-id", run_id,
                "--workers", str(workers),
            ]
            if capture_passed_diff:
                cmd.append("--capture-passed-diff")

            proc = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                cwd=str(BASE_DIR),
                start_new_session=True,   # own process group → clean kill
            )
            _current_proc = proc
            logger.info("bulk_runner.py PID=%s  run=%s", proc.pid, run_id)

            for raw_line in proc.stdout:
                line = raw_line.rstrip()
                if not line:
                    continue

                print(f"[bulk_runner] {line}", flush=True)
                _broadcast("bulk_log", {"line": line})

                for tag in ("BULK_START", "BULK_RESULT", "BULK_PROGRESS", "BULK_DONE"):
                    marker = f"##{tag}##"
                    if marker in line:
                        try:
                            json_part = line[line.index(marker) + len(marker):].strip()
                            _broadcast(tag.lower(), json.loads(json_part))
                        except Exception as parse_exc:
                            logger.warning("Parse error for %s: %s", tag, parse_exc)
                        break

            proc.wait()
            _current_proc = None

            was_stopped = _stop_event.is_set() or proc.returncode == -signal.SIGTERM

            if was_stopped:
                # User requested stop — skip everything still pending
                skipped = bulk_db.skip_remaining_tests(run_id, include_queued=True)
                final_status = "interrupted"
            elif proc.returncode != 0:
                # Subprocess crashed — skip only tests already marked 'running';
                # leave 'queued' tests alone so they don't silently disappear
                skipped = bulk_db.skip_remaining_tests(run_id, include_queued=False)
                final_status = "error"
            else:
                # Clean exit — all tests should already have final statuses
                skipped = 0
                final_status = "finished"

            bulk_db.finish_run(run_id, final_status)
            stats = bulk_db.get_run_stats(run_id)
            if skipped:
                _log(run_id, f"{skipped} tests skipped")
            _broadcast("bulk_done", {**stats, "exit_code": proc.returncode})
            logger.info("Run %s %s — exit_code=%s  skipped=%d", run_id, final_status, proc.returncode, skipped)
            _log(run_id, f"Run {final_status} — passed={stats.get('passed',0)} failed={stats.get('failed',0)} errors={stats.get('exec_errors',0)} skipped={skipped}")

        except Exception as exc:
            logger.exception("Run thread error for %s: %s", run_id, exc)
            try:
                bulk_db.skip_remaining_tests(run_id)
                bulk_db.finish_run(run_id, "error")
                stats = bulk_db.get_run_stats(run_id)
            except Exception:
                stats = {}
            _log(run_id, f"INTERNAL ERROR: {exc}")
            _broadcast("bulk_error", {"run_id": run_id, "error": str(exc)})
            _broadcast("bulk_done",  {**stats, "exit_code": -1})

        finally:
            _current_proc   = None
            _current_run_id = None
            with _run_lock:
                _run_active = False

    threading.Thread(target=_run_thread, daemon=True).start()

    # Return immediately — Solr querying and everything else happens in the background
    return jsonify({"ok": True, "run_id": run_id, "status": "generating"})


# ── Stop run ──────────────────────────────────────────────────────────────────

@bulk_run_bp.route("/api/bulk/stop", methods=["POST"])
def stop_run():
    """
    Signal the background thread to stop and terminate the runner subprocess.
    Works in both phases:
      - generating: stop_event fires; thread checks it between phases and exits
      - running:    SIGTERM sent to the subprocess process group; browsers close cleanly
    The background thread's finally block resets _run_active and updates the DB.
    """
    if not _run_active:
        return jsonify({"error": "No run is in progress"}), 409

    _stop_event.set()
    logger.info("Stop requested for run %s", _current_run_id)

    proc = _current_proc
    if proc is not None and proc.poll() is None:
        try:
            # Kill the entire process group so Chromium children die too
            os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
            logger.info("SIGTERM sent to process group of PID %s", proc.pid)
        except (ProcessLookupError, OSError) as exc:
            logger.warning("Could not signal process: %s", exc)

    return jsonify({"ok": True, "run_id": _current_run_id})


# ── Results (paginated) ────────────────────────────────────────────────────────

@bulk_run_bp.route("/api/bulk/results")
def get_results():
    run_id  = request.args.get("run_id")
    page    = max(1, int(request.args.get("page", 1)))
    per_page = min(200, max(10, int(request.args.get("per_page", 50))))
    status_f = request.args.get("status") or None
    type_f   = request.args.get("record_type") or None

    bulk_db.init_db()

    if not run_id:
        latest = bulk_db.get_latest_run()
        run_id = latest["run_id"] if latest else None

    if not run_id:
        return jsonify({"total": 0, "page": 1, "pages": 1, "items": []})

    data = bulk_db.get_results_page(run_id, page, per_page, status_f, type_f)
    types = bulk_db.get_distinct_types(run_id)
    data["record_types"] = types
    data["run_id"]       = run_id
    return jsonify(data)


# ── SSE ───────────────────────────────────────────────────────────────────────

@bulk_run_bp.route("/api/bulk/events")
def events():
    q: queue.Queue = queue.Queue(maxsize=500)
    _event_queues.append(q)
    logger.info("Bulk SSE client connected (total=%d)", len(_event_queues))

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
            logger.info("Bulk SSE client disconnected (total=%d)", len(_event_queues))

    return Response(
        generate(),
        mimetype="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


# ── Serve result images ───────────────────────────────────────────────────────

@bulk_run_bp.route("/bulk-results/<path:filename>")
def result_file(filename):
    return send_from_directory(str(RESULTS_DIR), filename)
