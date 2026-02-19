import os
import sys
import json
import time
import shutil
from io import BytesIO
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image
from pixelmatch.contrib.PIL import pixelmatch
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service


# ===================== CONFIG =====================

SCHEMA_VERSION = "1.2"

BASE_DIR     = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent

CONFIG_FILE    = BASE_DIR / "runner_config.json"
TESTS_FILE     = BASE_DIR / "test_cases.json"
SCREENSHOT_DIR = PROJECT_ROOT / "results"


# ===================== HELPERS =====================

def fatal(msg: str):
    print(f"\n❌ {msg}", flush=True)
    sys.exit(1)


def emit_result(result: dict):
    """
    Structured per-test result line parsed by test_run.py in real time.
    flush=True is critical — Python buffers stdout otherwise.
    """
    print(f"##RESULT## {json.dumps(result)}", flush=False)


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


# ===================== SELENIUM HELPERS =====================

def make_driver(auth: dict) -> webdriver.Chrome:
    """
    Create a headless Chromium driver.
    On Alpine: chromium lives at /usr/bin/chromium-browser
    On Debian/Ubuntu: chromedriver is on PATH after `playwright install` or apt install
    We try common paths and let Selenium find chromedriver automatically.
    """
    opts = Options()
    opts.add_argument("--headless")
    opts.add_argument("--no-sandbox")           # required in containers
    opts.add_argument("--disable-dev-shm-usage") # /dev/shm is often small in containers
    opts.add_argument("--disable-gpu")
    opts.add_argument(f"--window-size={VIEWPORT['width']},{VIEWPORT['height']}")
    opts.add_argument("--hide-scrollbars")

    # Inject HTTP basic auth via URL credentials if required
    # Stored on driver instance for use when building URLs
    auth_prefix = ""
    if auth.get("required") and auth.get("username"):
        u = auth["username"]
        p = auth.get("password", "")
        auth_prefix = f"{u}:{p}@"

    # Find Chromium binary — Alpine vs Debian
    for candidate in [
        "/usr/bin/chromium-browser",   # Alpine
        "/usr/bin/chromium",           # Alpine (some versions)
        "/usr/bin/google-chrome",      # Debian/Ubuntu Chrome
        "/usr/bin/google-chrome-stable",
    ]:
        if Path(candidate).exists():
            opts.binary_location = candidate
            break

    # chromedriver — try common locations, fall back to PATH
    chromedriver_candidates = [
        "/usr/bin/chromedriver",
        "/usr/lib/chromium/chromedriver",       # Alpine
        "/usr/lib/chromium-browser/chromedriver",
    ]
    service = None
    for cd in chromedriver_candidates:
        if Path(cd).exists():
            service = Service(cd)
            break

    driver = webdriver.Chrome(service=service, options=opts) if service else webdriver.Chrome(options=opts)
    driver.set_window_size(VIEWPORT["width"], VIEWPORT["height"])
    driver._auth_prefix = auth_prefix   # stash for URL building
    return driver


def build_url(base: str, uri: str, auth_prefix: str) -> str:
    """Inject basic auth credentials into URL if required."""
    if not auth_prefix:
        return base + uri
    # Insert credentials after the scheme: https://user:pass@host/path
    scheme, rest = base.split("://", 1)
    return f"{scheme}://{auth_prefix}{rest}{uri}"


def get_page_load_time(driver) -> int:
    """Return loadEventEnd in ms from Navigation Timing API."""
    try:
        val = driver.execute_script(
            "const e = performance.getEntriesByType('navigation')[0];"
            "return e ? Math.round(e.loadEventEnd) : null;"
        )
        return int(val) if val else None
    except Exception:
        return None


def capture_viewport(driver) -> bytes:
    """Screenshot clipped to exactly the viewport (not the full page)."""
    return driver.get_screenshot_as_png()


def save_image(png_bytes: bytes, path: Path):
    Image.open(BytesIO(png_bytes)).save(path)


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

    # Create two separate drivers so each site keeps its own session/auth
    print("  → Starting browsers…", flush=True)
    try:
        cl_driver = make_driver(CL_AUTH)
        ox_driver = make_driver(OX_AUTH)
    except Exception as e:
        fatal(f"Failed to start Chromium: {e}\n"
              "On Alpine run: apk add --no-cache chromium chromium-chromedriver\n"
              "On Debian run: apt-get install -y chromium chromium-driver")

    # Capture browser info for the report
    browser_info = {
        "name":       "chromium",
        "version":    cl_driver.capabilities.get("browserVersion", "unknown"),
        "headless":   True,
        "viewport":   VIEWPORT,
        "user_agent": cl_driver.execute_script("return navigator.userAgent"),
    }

    try:
        for _, test in TESTS.items():
            uri       = test["uri"]
            test_name = test["test_name"]
            test_id   = test.get("id") or normalize_id(test_name)
            desc      = test.get("desc", "")

            cl_site_url = build_url(CL_BASE_URL, uri, cl_driver._auth_prefix)
            ox_site_url = build_url(OX_BASE_URL, uri, ox_driver._auth_prefix)

            # Public URLs for the report (no embedded credentials)
            cl_display_url = CL_BASE_URL + uri
            ox_display_url = OX_BASE_URL + uri

            print(f"\n▶ Executing test: {test_name}", flush=True)
            if desc:
                print(f"  ↳ {desc}", flush=True)

            start_time = time.time()

            status              = "passed"
            execution_error     = None
            matching_percentage = None
            cl_load_time        = None
            ox_load_time        = None
            artifacts = {
                "cl_site_image": None,
                "ox_site_image": None,
                "diff_image":    None,
            }

            try:
                print(f"  → Loading {CL_NAME}", flush=True)
                cl_driver.get(cl_site_url)
                # Wait for page to settle (networkidle equivalent)
                time.sleep(1)
                cl_load_time = get_page_load_time(cl_driver)
                cl_img_bytes = capture_viewport(cl_driver)

                print(f"  → Loading {OX_NAME}", flush=True)
                ox_driver.get(ox_site_url)
                time.sleep(1)
                ox_load_time = get_page_load_time(ox_driver)
                ox_img_bytes = capture_viewport(ox_driver)

                if CAPTURE_ALL_SCREENSHOTS:
                    cl_name = f"{test_id}_cl_site.png"
                    ox_name = f"{test_id}_ox_site.png"
                    save_image(cl_img_bytes, SCREENSHOT_DIR / cl_name)
                    save_image(ox_img_bytes, SCREENSHOT_DIR / ox_name)
                    artifacts["cl_site_image"] = cl_name
                    artifacts["ox_site_image"] = ox_name

                img_cl   = Image.open(BytesIO(cl_img_bytes))
                img_ox   = Image.open(BytesIO(ox_img_bytes))

                # Ensure both images are same size before diffing
                if img_cl.size != img_ox.size:
                    img_ox = img_ox.resize(img_cl.size, Image.LANCZOS)

                diff_img    = Image.new("RGBA", img_cl.size)
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
                "id":                  test_id,
                "test_name":           test_name,
                "uri":                 uri,
                "desc":                desc,
                "cl_site_url":         cl_display_url,
                "ox_site_url":         ox_display_url,
                "cl_load_time_ms":     cl_load_time,
                "ox_load_time_ms":     ox_load_time,
                "status":              status,
                "execution_error":     execution_error,
                "matching_percentage": matching_percentage,
                "duration_ms":         duration_ms,
                "artifacts":           artifacts,
            }

            results.append(result)
            emit_result(result)   # real-time update to UI

            if status != "passed" and FAIL_FAST:
                break

    finally:
        cl_driver.quit()
        ox_driver.quit()

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