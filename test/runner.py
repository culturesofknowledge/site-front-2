import os
import sys
import json
import time
import shutil
from io import BytesIO
from datetime import datetime, timezone
from pathlib import Path

from playwright.sync_api import sync_playwright
from PIL import Image
from pixelmatch.contrib.PIL import pixelmatch


# ===================== CONFIG =====================

SCHEMA_VERSION = "1.2"

BASE_DIR     = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent

CONFIG_FILE = BASE_DIR / "runner_config.json"
TESTS_FILE  = BASE_DIR / "test_cases.json"
SCREENSHOT_DIR = PROJECT_ROOT / "results"


# ===================== HELPERS =====================

def fatal(msg: str):
    print(f"\n❌ {msg}", flush=True)
    sys.exit(1)


def emit_result(result: dict):
    """
    Print a structured result line immediately after each test.
    ##RESULT## prefix lets test_run.py parse it unambiguously from stdout.
    flush=True is critical — without it Python buffers and parent sees nothing until exit.
    """
    print(f"##RESULT## {json.dumps(result)}", flush=False)


# ===================== LOAD CONFIG =====================

if not CONFIG_FILE.exists():
    fatal(f"runner_config.json not found at {CONFIG_FILE}")

with open(CONFIG_FILE) as f:
    CFG = json.load(f)

# Sites
sites = CFG.get("sites", {})
CL_CFG = sites.get("cl", {})
OX_CFG = sites.get("ox", {})

CL_NAME     = CL_CFG.get("name", "Site A")
OX_NAME     = OX_CFG.get("name", "Site B")
CL_BASE_URL = CL_CFG.get("base_url", "").rstrip("/")
OX_BASE_URL = OX_CFG.get("base_url", "").rstrip("/")

# Auth — per site
auth_cfg = CFG.get("auth", {})
CL_AUTH = auth_cfg.get("cl", {})
OX_AUTH = auth_cfg.get("ox", {})

# Runner config
run_cfg = CFG.get("config", {})
VIEWPORT = {
    "width":  run_cfg.get("viewport_width", 1440),
    "height": run_cfg.get("viewport_height", 900),
}
DIFF_THRESHOLD       = run_cfg.get("diff_threshold", 0.1)
MAX_DIFF_PIXELS      = run_cfg.get("max_diff_pixels", 0)
FAIL_FAST            = run_cfg.get("fail_fast", False)
CLEAN_OLD_RESULTS    = run_cfg.get("clean_old_results", True)
CAPTURE_ALL_SCREENSHOTS = run_cfg.get("capture_all_screenshots", False)


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

def capture_viewport(page) -> bytes:
    return page.screenshot(
        full_page=False,
        clip={"x": 0, "y": 0, "width": VIEWPORT["width"], "height": VIEWPORT["height"]},
    )


def get_page_load_time(page) -> int:
    try:
        nav = page.evaluate("""
            () => {
                const nav = performance.getEntriesByType('navigation')[0];
                if (!nav) return null;
                return Math.round(nav.loadEventEnd);
            }
        """)
        return int(nav) if nav else None
    except Exception:
        return None


def save_image(bytes_data: bytes, path: Path):
    Image.open(BytesIO(bytes_data)).save(path)


def normalize_id(value: str) -> str:
    return value.strip().lower().replace(" ", "_").replace("/", "_")


def build_context_args(site_auth: dict) -> dict:
    """Build Playwright context kwargs, adding HTTP auth if required for this site."""
    args = {"viewport": VIEWPORT}
    if site_auth.get("required") and site_auth.get("username"):
        args["http_credentials"] = {
            "username": site_auth["username"],
            "password": site_auth.get("password", ""),
        }
    return args


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

        # Build separate contexts per site so each can have its own auth
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

            status          = "passed"
            execution_error = None
            matching_percentage = None
            cl_load_time    = None
            ox_load_time    = None

            artifacts = {
                "cl_site_image": None,
                "ox_site_image": None,
                "diff_image":    None,
            }

            try:
                print(f"  → Loading {CL_NAME}", flush=True)
                cl_page.goto(cl_site_url, wait_until="networkidle")
                cl_load_time  = get_page_load_time(cl_page)
                cl_img_bytes  = capture_viewport(cl_page)

                print(f"  → Loading {OX_NAME}", flush=True)
                ox_page.goto(ox_site_url, wait_until="networkidle")
                ox_load_time  = get_page_load_time(ox_page)
                ox_img_bytes  = capture_viewport(ox_page)

                if CAPTURE_ALL_SCREENSHOTS:
                    cl_name = f"{test_id}_cl_site.png"
                    ox_name = f"{test_id}_ox_site.png"
                    save_image(cl_img_bytes, SCREENSHOT_DIR / cl_name)
                    save_image(ox_img_bytes, SCREENSHOT_DIR / ox_name)
                    artifacts["cl_site_image"] = cl_name
                    artifacts["ox_site_image"] = ox_name

                img_cl   = Image.open(BytesIO(cl_img_bytes))
                img_ox   = Image.open(BytesIO(ox_img_bytes))
                diff_img = Image.new("RGBA", img_cl.size)

                diff_pixels = pixelmatch(img_cl, img_ox, diff_img, threshold=DIFF_THRESHOLD)

                total_pixels        = img_cl.size[0] * img_cl.size[1]
                matching_percentage = round(((total_pixels - diff_pixels) / total_pixels) * 100, 2)

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
                "id":                 test_id,
                "test_name":          test_name,
                "uri":                uri,
                "desc":               desc,
                "cl_site_url":        cl_site_url,
                "ox_site_url":        ox_site_url,
                "cl_load_time_ms":    cl_load_time,
                "ox_load_time_ms":    ox_load_time,
                "status":             status,
                "execution_error":    execution_error,
                "matching_percentage": matching_percentage,
                "duration_ms":        duration_ms,
                "artifacts":          artifacts,
            }

            results.append(result)

            # Emit immediately so test_run.py updates the UI per-test
            emit_result(result)

            if status != "passed" and FAIL_FAST:
                break

        cl_context.close()
        ox_context.close()
        browser.close()

    run_completed_at = datetime.now(timezone.utc)
    run_duration     = int((run_completed_at - run_started_at).total_seconds() * 1000)

    # ===================== FINAL REPORT =====================

    total   = len(results)
    passed  = sum(1 for r in results if r["status"] == "passed")
    failed  = sum(1 for r in results if r["status"] == "failed")
    exec_err = sum(1 for r in results if r["status"] == "execution-error")

    pass_percentage             = round((passed   / total) * 100, 2) if total else 0.0
    fail_percentage             = round((failed   / total) * 100, 2) if total else 0.0
    execution_error_percentage  = round((exec_err / total) * 100, 2) if total else 0.0

    report = {
        "schema_version":   SCHEMA_VERSION,
        "run_id":           run_id,
        "run_started_at":   run_started_at.isoformat(),
        "run_completed_at": run_completed_at.isoformat(),
        "run_duration":     run_duration,
        "config": {
            "fail_fast":              FAIL_FAST,
            "clean_old_results":      CLEAN_OLD_RESULTS,
            "capture_all_screenshots": CAPTURE_ALL_SCREENSHOTS,
            "viewport":               VIEWPORT,
            "diff_threshold":         DIFF_THRESHOLD,
            "max_diff_pixels":        MAX_DIFF_PIXELS,
            "browser":                browser_info,
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
            "pass_percentage":            pass_percentage,
            "fail_percentage":            fail_percentage,
            "execution_error_percentage": execution_error_percentage,
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