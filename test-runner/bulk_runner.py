#!/usr/bin/env python3
"""
Parallel bulk runner — processes tests from SQLite using N Playwright workers.
Each worker keeps its own browser alive for the lifetime of the run.

Emits structured lines to stdout (read by bulk_run_bp.py):
  ##BULK_START##   {run_id, total}
  ##BULK_RESULT##  {test_id, run_id, status, match_pct, ...}
  ##BULK_PROGRESS## {run_id, total, completed, passed, failed, exec_errors}
  ##BULK_DONE##    {run_id, total, completed, passed, failed, exec_errors}
"""
from __future__ import annotations

import argparse
import errno
import json
import shutil
import sys
import threading
import time
from io import BytesIO
from pathlib import Path
from queue import Empty, Queue

from PIL import Image
from pixelmatch.contrib.PIL import pixelmatch
from playwright.sync_api import Page, sync_playwright

import bulk_db

BASE_DIR       = Path(__file__).resolve().parent
CONFIG_FILE    = BASE_DIR / "runner_config.json"
SCREENSHOT_DIR = BASE_DIR / ".bulk_run" / "results"

SCREENSHOT_THRESHOLD = 99.0  # save screenshots only when match < this %
PROGRESS_EVERY       = 25    # emit BULK_PROGRESS after every N completions


# ── Helpers ───────────────────────────────────────────────────────────────────

def emit(tag: str, data: dict):
    print(f"##{tag}## {json.dumps(data)}", flush=True)


def load_config() -> dict:
    if not CONFIG_FILE.exists():
        print("ERROR: runner_config.json not found", flush=True)
        sys.exit(1)
    with open(CONFIG_FILE) as f:
        return json.load(f)


def build_context_args(site_auth: dict, viewport: dict) -> dict:
    args: dict = {"viewport": viewport}
    if site_auth.get("required") and site_auth.get("username"):
        args["http_credentials"] = {
            "username": site_auth["username"],
            "password": site_auth.get("password", ""),
        }
    return args


def wait_for_content(page: Page, timeout: int = 30_000, idle_for: float = 1.5):
    try:
        page.wait_for_load_state("networkidle", timeout=timeout)
    except Exception:
        pass

    LOADING_SELECTORS = [
        "[class*='loading']", "[class*='spinner']", "[class*='loader']",
        "[id*='loading']", "[aria-label*='Loading']", "[aria-busy='true']",
    ]
    selector = ", ".join(LOADING_SELECTORS)
    deadline = time.time() + 10
    while time.time() < deadline:
        try:
            still = page.evaluate(f"""
                () => {{
                    const els = document.querySelectorAll('{selector}');
                    return Array.from(els).some(el => {{
                        const s = window.getComputedStyle(el);
                        return s.display!=='none' && s.visibility!=='hidden' && s.opacity!=='0';
                    }});
                }}
            """)
            if not still:
                break
        except Exception:
            break
        time.sleep(0.3)

    try:
        page.evaluate("""
            () => {
                if (window.__pendingRequests===undefined) {
                    window.__pendingRequests=0;
                    const _fetch=window.fetch;
                    window.fetch=function(...a){
                        window.__pendingRequests++;
                        return _fetch.apply(this,a).finally(()=>window.__pendingRequests--);
                    };
                    const _open=XMLHttpRequest.prototype.open;
                    XMLHttpRequest.prototype.open=function(...a){
                        window.__pendingRequests++;
                        this.addEventListener('loadend',()=>window.__pendingRequests--);
                        return _open.apply(this,a);
                    };
                }
            }
        """)
        deadline = time.time() + 10
        idle_since: float | None = None
        while time.time() < deadline:
            pending = page.evaluate("() => window.__pendingRequests || 0")
            if pending == 0:
                if idle_since is None:
                    idle_since = time.time()
                elif time.time() - idle_since >= idle_for:
                    break
            else:
                idle_since = None
            time.sleep(0.2)
    except Exception:
        pass


def capture_viewport(page: Page, viewport: dict) -> bytes:
    return page.screenshot(
        full_page=False,
        clip={"x": 0, "y": 0, "width": viewport["width"], "height": viewport["height"]},
    )


SCREENSHOT_MIN_BYTES = 50 * 1024 * 1024  # 50 MB — below this, skip screenshot saves


def _check_disk_space(directory: Path):
    """Raise OSError(ENOSPC) if free space in directory is below the minimum."""
    try:
        free = shutil.disk_usage(str(directory)).free
        if free < SCREENSHOT_MIN_BYTES:
            raise OSError(errno.ENOSPC, f"Only {free // (1024*1024)} MB free — need 50 MB for screenshots")
    except OSError:
        raise
    except Exception:
        pass  # if the check itself fails, let the save attempt surface any real error


# ── Worker ────────────────────────────────────────────────────────────────────

def worker_fn(
    worker_id: int,
    work_q: Queue,
    result_q: Queue,
    cfg: dict,
    capture_passed_diff: bool = False,
):
    sites    = cfg.get("sites", {})
    cl_base  = sites.get("cl", {}).get("base_url", "").rstrip("/")
    ox_base  = sites.get("ox", {}).get("base_url", "").rstrip("/")
    run_cfg  = cfg.get("config", {})
    auth_cfg = cfg.get("auth", {})

    viewport       = {"width": run_cfg.get("viewport_width", 1440), "height": run_cfg.get("viewport_height", 900)}
    diff_threshold = float(run_cfg.get("diff_threshold", 0.1))
    page_timeout   = int(run_cfg.get("page_timeout_ms", 120_000))

    with sync_playwright() as p:
        browser  = p.chromium.launch()
        cl_ctx   = browser.new_context(**build_context_args(auth_cfg.get("cl", {}), viewport))
        ox_ctx   = browser.new_context(**build_context_args(auth_cfg.get("ox", {}), viewport))
        cl_page  = cl_ctx.new_page()
        ox_page  = ox_ctx.new_page()

        try:
            while True:
                try:
                    test = work_q.get(timeout=10)
                except Empty:
                    continue

                if test is None:          # poison pill — this worker is done
                    break

                test_id  = test["id"]
                uri      = test["uri"]
                bulk_db.mark_test_running(test_id)
                start    = time.time()

                status      = "passed"
                match_pct   = None
                diff_image  = None
                cl_image    = None
                ox_image    = None
                error       = None
                cl_load_ms  = None
                ox_load_ms  = None
                cl_t0 = ox_t0 = None

                try:
                    cl_url = cl_base + uri
                    ox_url = ox_base + uri

                    cl_t0 = time.time()
                    cl_page.goto(cl_url, wait_until="domcontentloaded", timeout=page_timeout)
                    wait_for_content(cl_page, timeout=page_timeout)
                    cl_load_ms   = int(cl_page.evaluate("()=>Math.round(performance.now())") or 0)
                    cl_img_bytes = capture_viewport(cl_page, viewport)

                    ox_t0 = time.time()
                    ox_page.goto(ox_url, wait_until="domcontentloaded", timeout=page_timeout)
                    wait_for_content(ox_page, timeout=page_timeout)
                    ox_load_ms   = int(ox_page.evaluate("()=>Math.round(performance.now())") or 0)
                    ox_img_bytes = capture_viewport(ox_page, viewport)

                    img_cl = Image.open(BytesIO(cl_img_bytes))
                    img_ox = Image.open(BytesIO(ox_img_bytes))
                    if img_cl.size != img_ox.size:
                        img_ox = img_ox.resize(img_cl.size, Image.LANCZOS)

                    diff_img    = Image.new("RGBA", img_cl.size)
                    diff_pixels = pixelmatch(img_cl, img_ox, diff_img, threshold=diff_threshold)

                    total_pixels = img_cl.size[0] * img_cl.size[1]
                    match_pct    = round(((total_pixels - diff_pixels) / total_pixels) * 100, 2)

                    if match_pct < SCREENSHOT_THRESHOLD:
                        # Failed — save diff + both screenshots
                        status    = "failed"
                        safe_name = str(test_id)
                        SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)

                        diff_name = f"diff_{safe_name}.png"
                        cl_name   = f"cl_{safe_name}.png"
                        ox_name   = f"ox_{safe_name}.png"

                        try:
                            _check_disk_space(SCREENSHOT_DIR)
                            diff_img.save(SCREENSHOT_DIR / diff_name)
                            Image.open(BytesIO(cl_img_bytes)).save(SCREENSHOT_DIR / cl_name)
                            Image.open(BytesIO(ox_img_bytes)).save(SCREENSHOT_DIR / ox_name)
                            diff_image = diff_name
                            cl_image   = cl_name
                            ox_image   = ox_name
                        except OSError as save_exc:
                            # Disk full — comparison result is still valid, just no images
                            error = f"Disk full — screenshots not saved ({save_exc})"

                    elif capture_passed_diff:
                        # Passed but user asked for diff images — save diff only (no screenshots)
                        SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)
                        diff_name = f"diff_{test_id}.png"
                        try:
                            _check_disk_space(SCREENSHOT_DIR)
                            diff_img.save(SCREENSHOT_DIR / diff_name)
                            diff_image = diff_name
                        except OSError:
                            pass  # disk full — skip the optional diff image silently

                except Exception as exc:
                    status = "execution-error"
                    now = time.time()
                    if cl_load_ms is None and cl_t0 is not None:
                        cl_load_ms = int((now - cl_t0) * 1000)
                        error = f"[site-a: {cl_url}] {exc}"
                    elif ox_load_ms is None and ox_t0 is not None:
                        ox_load_ms = int((now - ox_t0) * 1000)
                        error = f"[site-b: {ox_url}] {exc}"
                    else:
                        error = str(exc)

                duration_ms = int((time.time() - start) * 1000)

                result_q.put({
                    "test_id":    test_id,
                    "status":     status,
                    "match_pct":  match_pct,
                    "diff_image": diff_image,
                    "cl_image":   cl_image,
                    "ox_image":   ox_image,
                    "error":      error,
                    "duration_ms": duration_ms,
                    "cl_load_ms": cl_load_ms,
                    "ox_load_ms": ox_load_ms,
                })

        finally:
            try:
                cl_ctx.close()
                ox_ctx.close()
                browser.close()
            except Exception:
                pass


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--run-id",           required=True)
    parser.add_argument("--workers",          type=int, default=4)
    parser.add_argument("--capture-passed-diff", action="store_true")
    args = parser.parse_args()

    print(f"bulk_runner started — run={args.run_id}  workers={args.workers}", flush=True)

    # Abort early if disk is already too full to save any screenshots
    try:
        SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)
        _check_disk_space(SCREENSHOT_DIR)
    except OSError as exc:
        print(f"FATAL: {exc}", flush=True)
        sys.exit(1)

    try:
        cfg = load_config()
    except Exception as exc:
        print(f"FATAL: failed to load config — {exc}", flush=True)
        sys.exit(1)

    try:
        bulk_db.init_db()
    except Exception as exc:
        print(f"FATAL: failed to init DB — {exc}", flush=True)
        sys.exit(1)

    tests = bulk_db.get_pending_tests(args.run_id)
    total = len(tests)

    if total == 0:
        print(f"No pending tests for run {args.run_id}", flush=True)
        bulk_db.finish_run(args.run_id)
        emit("BULK_DONE", bulk_db.get_run_stats(args.run_id))
        return

    # Clamp workers to the actual test count — spinning up more threads than
    # tests wastes resources and can exhaust browser memory on large machines.
    num_workers = min(args.workers, total)
    if num_workers != args.workers:
        print(f"Workers clamped from {args.workers} to {num_workers} (test count={total})", flush=True)

    emit("BULK_START", {"run_id": args.run_id, "total": total})
    print(f"Bulk run {args.run_id}: {total} tests, {num_workers} workers", flush=True)

    # Unbounded queue so the feeder can mark tests running as fast as possible
    work_q:   Queue = Queue()
    result_q: Queue = Queue()

    # Start worker threads first
    workers = []
    for i in range(num_workers):
        t = threading.Thread(
            target=worker_fn,
            args=(i, work_q, result_q, cfg, args.capture_passed_diff),
            daemon=True,
        )
        t.start()
        workers.append(t)

    # Feed the queue — workers mark each test 'running' when they dequeue it
    def _feed():
        for test in tests:
            work_q.put(test)
        for _ in range(num_workers):
            work_q.put(None)  # one poison pill per worker

    threading.Thread(target=_feed, daemon=True).start()
    print(f"Workers started — waiting for results", flush=True)

    # Collect results
    completed = 0
    while completed < total:
        result = result_q.get()
        test_id = result.pop("test_id")
        bulk_db.update_test_result(test_id, args.run_id, result)
        emit("BULK_RESULT", {"test_id": test_id, "run_id": args.run_id, **result})
        completed += 1
        if completed % PROGRESS_EVERY == 0:
            emit("BULK_PROGRESS", bulk_db.get_run_stats(args.run_id))

    for t in workers:
        t.join(timeout=30)

    bulk_db.finish_run(args.run_id)
    stats = bulk_db.get_run_stats(args.run_id)
    emit("BULK_DONE", stats)
    print(
        f"Done — passed={stats.get('passed')} failed={stats.get('failed')} "
        f"errors={stats.get('exec_errors')}",
        flush=True,
    )


if __name__ == "__main__":
    main()
