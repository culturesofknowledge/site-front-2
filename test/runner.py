import os
import sys
import json
import time
import shutil
from io import BytesIO
from datetime import datetime, timezone
from pathlib import Path

from playwright.sync_api import sync_playwright, Page
from PIL import Image
from pixelmatch.contrib.PIL import pixelmatch


# ===================== CONFIG =====================

SCHEMA_VERSION = "1.3"

BASE_DIR       = Path(__file__).resolve().parent
PROJECT_ROOT   = BASE_DIR.parent

CONFIG_FILE    = BASE_DIR / "runner_config.json"
TESTS_FILE     = BASE_DIR / "test_cases.json"
SCREENSHOT_DIR = PROJECT_ROOT / "results"


# ===================== HELPERS =====================

def fatal(msg: str):
    print(f"\n❌ {msg}", flush=True)
    sys.exit(1)


def emit_result(result: dict):
    """
    Print a structured result line immediately after each test completes.
    Prefixed with ##RESULT## so test_run.py can parse it unambiguously.
    flush=True is critical — without it Python buffers stdout until process exit.
    """
    print(f"##RESULT## {json.dumps(result)}", flush=True)


# ===================== LOAD CONFIG =====================

if not CONFIG_FILE.exists():
    fatal(f"runner_config.json not found at {CONFIG_FILE}")

with open(CONFIG_FILE) as f:
    CFG = json.load(f)

sites       = CFG.get("sites", {})
CL_CFG      = sites.get("cl", {})
OX_CFG      = sites.get("ox", {})
CL_NAME     = CL_CFG.get("name", "Site A")
OX_NAME     = OX_CFG.get("name", "Site B")
CL_BASE_URL = CL_CFG.get("base_url", "").rstrip("/")
OX_BASE_URL = OX_CFG.get("base_url", "").rstrip("/")

auth_cfg = CFG.get("auth", {})
CL_AUTH  = auth_cfg.get("cl", {})
OX_AUTH  = auth_cfg.get("ox", {})

run_cfg  = CFG.get("config", {})
VIEWPORT = {
    "width":  run_cfg.get("viewport_width",  1440),
    "height": run_cfg.get("viewport_height", 900),
}
DIFF_THRESHOLD          = run_cfg.get("diff_threshold",          0.1)
MAX_DIFF_PIXELS         = run_cfg.get("max_diff_pixels",         0)
FAIL_FAST               = run_cfg.get("fail_fast",               False)
CLEAN_OLD_RESULTS       = run_cfg.get("clean_old_results",       True)
CAPTURE_ALL_SCREENSHOTS = run_cfg.get("capture_all_screenshots", False)
# Timeout in ms for page load + wait_for_content — default 120s to handle slow pages
PAGE_TIMEOUT_MS         = int(run_cfg.get("page_timeout_ms",     120_000))


# ===================== VALIDATION =====================

if not CL_BASE_URL or not OX_BASE_URL:
    fatal("Missing base_url for cl or ox in runner_config.json → sites section")

if not TESTS_FILE.exists():
    fatal(f"test_cases.json not found at {TESTS_FILE}")


# ===================== STORAGE SETUP =====================

if CLEAN_OLD_RESULTS and SCREENSHOT_DIR.exists():
    shutil.rmtree(SCREENSHOT_DIR)

SCREENSHOT_DIR.mkdir(exist_ok=True)


# ===================== LOAD TEST CASES =====================

with open(TESTS_FILE) as f:
    TESTS = json.load(f)

if not TESTS:
    fatal("No test cases found in test_cases.json")


# ===================== HELPERS =====================

def build_context_args(site_auth: dict) -> dict:
    """Build Playwright browser context kwargs, adding HTTP auth if required."""
    args = {"viewport": VIEWPORT}
    if site_auth.get("required") and site_auth.get("username"):
        args["http_credentials"] = {
            "username": site_auth["username"],
            "password": site_auth.get("password", ""),
        }
    return args


def wait_for_content(page: Page, timeout: int = 30000, idle_for: float = 1.5):
    """
    Wait until the page content is truly ready — no spinners, no pending requests.

    Steps:
    1. wait for networkidle (Playwright built-in — no requests for 500ms)
    2. wait for common loading indicators to disappear
    3. poll until no pending XHR/fetch for `idle_for` consecutive seconds

    This handles 'Loading please wait…' overlays and async data fetching.
    """
    # Step 1 — networkidle: Playwright waits until no network requests for 500ms
    try:
        page.wait_for_load_state("networkidle", timeout=timeout)
    except Exception:
        pass  # timeout is acceptable — we continue with the other checks

    # Step 2 — wait for common loading selectors to disappear
    LOADING_SELECTORS = [
        "[class*='loading']",
        "[class*='spinner']",
        "[class*='loader']",
        "[id*='loading']",
        "[aria-label*='Loading']",
        "[aria-busy='true']",
    ]
    selector = ", ".join(LOADING_SELECTORS)
    deadline = time.time() + 10
    while time.time() < deadline:
        try:
            still_loading = page.evaluate(f"""
                () => {{
                    const els = document.querySelectorAll('{selector}');
                    return Array.from(els).some(el => {{
                        const s = window.getComputedStyle(el);
                        return s.display !== 'none'
                            && s.visibility !== 'hidden'
                            && s.opacity !== '0';
                    }});
                }}
            """)
            if not still_loading:
                break
        except Exception:
            break
        time.sleep(0.3)

    # Step 3 — inject request counter and wait until idle
    try:
        page.evaluate("""
            () => {
                if (window.__pendingRequests === undefined) {
                    window.__pendingRequests = 0;
                    const _fetch = window.fetch;
                    window.fetch = function(...args) {
                        window.__pendingRequests++;
                        return _fetch.apply(this, args)
                            .finally(() => window.__pendingRequests--);
                    };
                    const _open = XMLHttpRequest.prototype.open;
                    XMLHttpRequest.prototype.open = function(...args) {
                        window.__pendingRequests++;
                        this.addEventListener('loadend',
                            () => window.__pendingRequests--);
                        return _open.apply(this, args);
                    };
                }
            }
        """)
        deadline = time.time() + 10
        idle_since = None
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


def get_performance_timings(page: Page) -> dict:
    """
    Extract detailed performance timings from the Navigation Timing API.
    Returns a flat dict of all timing breakdowns in milliseconds.
    """
    try:
        return page.evaluate("""
            () => {
                const e = performance.getEntriesByType('navigation')[0];
                if (!e) return {};
                const r = (a, b) => Math.max(0, Math.round(a - b));
                return {
                    // Network
                    dns_ms:        r(e.domainLookupEnd,          e.domainLookupStart),
                    tcp_ms:        r(e.connectEnd,               e.connectStart),
                    tls_ms:        e.secureConnectionStart > 0
                                   ? r(e.requestStart,           e.secureConnectionStart)
                                   : 0,
                    ttfb_ms:       r(e.responseStart,            e.requestStart),
                    download_ms:   r(e.responseEnd,              e.responseStart),
                    network_ms:    r(e.responseEnd,              e.fetchStart),
                    // Rendering
                    dom_parse_ms:    r(e.domInteractive,         e.responseEnd),
                    dom_content_ms:  r(e.domContentLoadedEventEnd, e.responseEnd),
                    render_ms:       r(e.domComplete,            e.domInteractive),
                    // Totals
                    load_ms:         Math.round(e.loadEventEnd),
                    total_ms:        r(e.loadEventEnd,           e.fetchStart),
                };
            }
        """) or {}
    except Exception:
        return {}


def capture_viewport(page: Page) -> bytes:
    """Screenshot of exactly the configured viewport — no full-page scroll."""
    return page.screenshot(
        full_page=False,
        clip={
            "x": 0, "y": 0,
            "width":  VIEWPORT["width"],
            "height": VIEWPORT["height"],
        },
    )


def save_image(bytes_data: bytes, path: Path):
    Image.open(BytesIO(bytes_data)).save(path)


def normalize_id(value: str) -> str:
    return value.strip().lower().replace(" ", "_").replace("/", "_")


# ===================== MAIN RUNNER =====================

def main():
    run_id         = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    run_started_at = datetime.now(timezone.utc)

    results      = []
    failed_count = 0

    print(f"\n🚀 UI Layout Test Run: {run_id}", flush=True)
    print(f"   {CL_NAME}: {CL_BASE_URL}", flush=True)
    print(f"   {OX_NAME}: {OX_BASE_URL}", flush=True)
    print(f"📄 Loaded {len(TESTS)} test cases", flush=True)

    with sync_playwright() as p:
        browser = p.chromium.launch()

        # Separate contexts per site so each gets its own session and auth
        cl_context = browser.new_context(**build_context_args(CL_AUTH))
        ox_context = browser.new_context(**build_context_args(OX_AUTH))

        cl_page = cl_context.new_page()
        ox_page = ox_context.new_page()

        browser_info = {
            "name":       browser.browser_type.name,
            "version":    browser.version,
            "headless":   True,
            "viewport":   VIEWPORT,
            "user_agent": cl_page.evaluate("() => navigator.userAgent"),
        }

        try:
            for _, test in TESTS.items():
                uri       = test["uri"]
                test_name = test["test_name"]
                test_id   = test.get("id") or normalize_id(test_name)
                desc      = test.get("desc", "")

                cl_site_url = CL_BASE_URL + uri
                ox_site_url = OX_BASE_URL + uri

                print(f"\n▶ Executing test: {test_name}", flush=True)
                if desc:
                    print(f"  ↳ {desc}", flush=True)

                start_time = time.time()

                status              = "passed"
                execution_error     = None
                matching_percentage = None
                cl_timings          = {}
                ox_timings          = {}
                artifacts = {
                    "cl_site_image": None,
                    "ox_site_image": None,
                    "diff_image":    None,
                }

                try:
                    print(f"  → Loading {CL_NAME}", flush=True)
                    cl_page.goto(cl_site_url, wait_until="domcontentloaded", timeout=PAGE_TIMEOUT_MS)
                    wait_for_content(cl_page, timeout=PAGE_TIMEOUT_MS)
                    cl_timings   = get_performance_timings(cl_page)
                    cl_img_bytes = capture_viewport(cl_page)

                    print(f"  → Loading {OX_NAME}", flush=True)
                    ox_page.goto(ox_site_url, wait_until="domcontentloaded", timeout=PAGE_TIMEOUT_MS)
                    wait_for_content(ox_page, timeout=PAGE_TIMEOUT_MS)
                    ox_timings   = get_performance_timings(ox_page)
                    ox_img_bytes = capture_viewport(ox_page)

                    if CAPTURE_ALL_SCREENSHOTS:
                        cl_name = f"{test_id}_cl_site.png"
                        ox_name = f"{test_id}_ox_site.png"
                        save_image(cl_img_bytes, SCREENSHOT_DIR / cl_name)
                        save_image(ox_img_bytes, SCREENSHOT_DIR / ox_name)
                        artifacts["cl_site_image"] = cl_name
                        artifacts["ox_site_image"] = ox_name

                    img_cl = Image.open(BytesIO(cl_img_bytes))
                    img_ox = Image.open(BytesIO(ox_img_bytes))

                    # Ensure same dimensions before diffing
                    if img_cl.size != img_ox.size:
                        img_ox = img_ox.resize(img_cl.size, Image.LANCZOS)

                    diff_img    = Image.new("RGBA", img_cl.size)
                    diff_pixels = pixelmatch(
                        img_cl, img_ox, diff_img,
                        threshold=DIFF_THRESHOLD,
                    )

                    total_pixels        = img_cl.size[0] * img_cl.size[1]
                    matching_percentage = round(
                        ((total_pixels - diff_pixels) / total_pixels) * 100, 2
                    )

                    diff_name = f"diff_{test_id}.png"
                    diff_img.save(SCREENSHOT_DIR / diff_name)
                    artifacts["diff_image"] = diff_name

                    if diff_pixels > MAX_DIFF_PIXELS:
                        status = "failed"
                        failed_count += 1
                        print(f"  ❌ FAILED ({matching_percentage}% match)", flush=True)
                    else:
                        print("  ✅ PASSED", flush=True)

                except Exception as e:
                    status          = "execution-error"
                    execution_error = str(e)
                    failed_count   += 1
                    print(f"  ❌ EXECUTION ERROR: {e}", flush=True)
                    if FAIL_FAST:
                        raise

                duration_ms = int((time.time() - start_time) * 1000)

                result = {
                    "id":                  test_id,
                    "test_name":           test_name,
                    "uri":                 uri,
                    "desc":                desc,
                    "cl_site_url":         cl_site_url,
                    "ox_site_url":         ox_site_url,
                    # Flat fields for backwards compat with UI sidebar
                    "cl_load_time_ms":     cl_timings.get("load_ms"),
                    "ox_load_time_ms":     ox_timings.get("load_ms"),
                    # Full breakdowns shown in detail panel
                    "cl_timings":          cl_timings,
                    "ox_timings":          ox_timings,
                    "status":              status,
                    "execution_error":     execution_error,
                    "matching_percentage": matching_percentage,
                    "duration_ms":         duration_ms,
                    "artifacts":           artifacts,
                }

                results.append(result)
                emit_result(result)   # real-time UI update via ##RESULT##

                if status != "passed" and FAIL_FAST:
                    break

        finally:
            # Mark any tests that never ran as execution-error so the UI
            # doesn't leave them stuck in queued state
            completed_ids = {r["id"] for r in results}
            for _, test in TESTS.items():
                tid  = test.get("id") or normalize_id(test.get("test_name", ""))
                name = test.get("test_name", tid)
                if tid not in completed_ids:
                    skipped = {
                        "id":                  tid,
                        "test_name":           name,
                        "uri":                 test.get("uri", ""),
                        "desc":                test.get("desc", ""),
                        "cl_site_url":         CL_BASE_URL + test.get("uri", ""),
                        "ox_site_url":         OX_BASE_URL + test.get("uri", ""),
                        "cl_load_time_ms":     None,
                        "ox_load_time_ms":     None,
                        "cl_timings":          {},
                        "ox_timings":          {},
                        "status":              "execution-error",
                        "execution_error":     "Test did not run — script exited early",
                        "matching_percentage": None,
                        "duration_ms":         0,
                        "artifacts": {
                            "cl_site_image": None,
                            "ox_site_image": None,
                            "diff_image":    None,
                        },
                    }
                    results.append(skipped)
                    emit_result(skipped)

            cl_context.close()
            ox_context.close()
            browser.close()

    run_completed_at = datetime.now(timezone.utc)
    run_duration     = int((run_completed_at - run_started_at).total_seconds() * 1000)

    # ===================== FINAL REPORT =====================

    total    = len(results)
    passed   = sum(1 for r in results if r["status"] == "passed")
    failed   = sum(1 for r in results if r["status"] == "failed")
    exec_err = sum(1 for r in results if r["status"] == "execution-error")

    report = {
        "schema_version":   SCHEMA_VERSION,
        "run_id":           run_id,
        "run_started_at":   run_started_at.isoformat(),
        "run_completed_at": run_completed_at.isoformat(),
        "run_duration":     run_duration,
        "config": {
            "fail_fast":               FAIL_FAST,
            "clean_old_results":       CLEAN_OLD_RESULTS,
            "capture_all_screenshots": CAPTURE_ALL_SCREENSHOTS,
            "viewport":                VIEWPORT,
            "diff_threshold":          DIFF_THRESHOLD,
            "max_diff_pixels":         MAX_DIFF_PIXELS,
            "browser":                 browser_info,
            "sites": {
                "cl": {"name": CL_NAME, "base_url": CL_BASE_URL},
                "ox": {"name": OX_NAME, "base_url": OX_BASE_URL},
            },
        },
        "summary": {
            "total":                      total,
            "passed":                     passed,
            "failed":                     failed,
            "execution_error":            exec_err,
            "pass_percentage":            round((passed   / total) * 100, 2) if total else 0.0,
            "fail_percentage":            round((failed   / total) * 100, 2) if total else 0.0,
            "execution_error_percentage": round((exec_err / total) * 100, 2) if total else 0.0,
        },
        "tests": results,
    }

    report_path = SCREENSHOT_DIR / f"reports_{run_id}.json"
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)
    print(f"\n📄 Report generated: {report_path}", flush=True)

    sys.exit(1 if failed_count > 0 else 0)


# ===================== ENTRY POINT =====================

if __name__ == "__main__":
    main()