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
import json
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


# ── Worker ────────────────────────────────────────────────────────────────────

def worker_fn(
    worker_id: int,
    work_q: Queue,
    result_q: Queue,
    cfg: dict,
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
                start    = time.time()

                status      = "passed"
                match_pct   = None
                diff_image  = None
                cl_image    = None
                ox_image    = None
                error       = None
                cl_load_ms  = None
                ox_load_ms  = None

                try:
                    cl_url = cl_base + uri
                    ox_url = ox_base + uri

                    cl_page.goto(cl_url, wait_until="domcontentloaded", timeout=page_timeout)
                    wait_for_content(cl_page, timeout=page_timeout)
                    cl_load_ms   = int(cl_page.evaluate("()=>Math.round(performance.now())") or 0)
                    cl_img_bytes = capture_viewport(cl_page, viewport)

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
                        status    = "failed"
                        safe_name = f"{test_id}"
                        diff_name = f"diff_{safe_name}.png"
                        cl_name   = f"cl_{safe_name}.png"
                        ox_name   = f"ox_{safe_name}.png"

                        SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)
                        diff_img.save(SCREENSHOT_DIR / diff_name)
                        Image.open(BytesIO(cl_img_bytes)).save(SCREENSHOT_DIR / cl_name)
                        Image.open(BytesIO(ox_img_bytes)).save(SCREENSHOT_DIR / ox_name)

                        diff_image = diff_name
                        cl_image   = cl_name
                        ox_image   = ox_name

                except Exception as exc:
                    status = "execution-error"
                    error  = str(exc)

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
    parser.add_argument("--run-id",  required=True)
    parser.add_argument("--workers", type=int, default=4)
    args = parser.parse_args()

    print(f"bulk_runner started — run={args.run_id}  workers={args.workers}", flush=True)

    cfg = load_config()
    bulk_db.init_db()

    tests = bulk_db.get_pending_tests(args.run_id)
    total = len(tests)

    if total == 0:
        print(f"No pending tests for run {args.run_id}", flush=True)
        bulk_db.finish_run(args.run_id)
        emit("BULK_DONE", bulk_db.get_run_stats(args.run_id))
        return

    # Mark every test 'running' immediately so the UI shows progress right away,
    # not only when a worker actually picks the test up from the queue.
    for test in tests:
        bulk_db.mark_test_running(test["id"])

    emit("BULK_START", {"run_id": args.run_id, "total": total})
    print(f"Bulk run {args.run_id}: {total} tests marked running, launching {args.workers} workers", flush=True)

    # Unbounded queue — tests are already marked running, no need to throttle
    work_q:   Queue = Queue()
    result_q: Queue = Queue()

    # Load the queue before starting workers so workers find work immediately
    for test in tests:
        work_q.put(test)
    for _ in range(args.workers):
        work_q.put(None)  # one poison pill per worker

    # Start worker threads
    workers = []
    for i in range(args.workers):
        t = threading.Thread(
            target=worker_fn,
            args=(i, work_q, result_q, cfg),
            daemon=True,
        )
        t.start()
        workers.append(t)

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
