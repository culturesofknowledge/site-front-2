import os
import sys
import json
import time
import shutil
from io import BytesIO
from datetime import datetime
from pathlib import Path

from playwright.sync_api import sync_playwright
from PIL import Image
from pixelmatch.contrib.PIL import pixelmatch
from dotenv import load_dotenv


# ===================== CONFIG =====================

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent

load_dotenv(PROJECT_ROOT / ".env")

CL_BASE_URL = os.getenv("CL_BASE_URL")
OX_BASE_URL = os.getenv("OX_BASE_URL")

AUTH_USER = os.getenv("SITEA_USER")
AUTH_PASS = os.getenv("SITEA_PASS")

VIEWPORT = {"width": 1440, "height": 900}
DIFF_THRESHOLD = 0.1
MAX_DIFF_PIXELS = 0

FAIL_FAST = False            # Stop immediately on first failure
CLEAN_OLD_RESULTS = True     # 🔥 Delete old screenshots/reports before run

SCREENSHOT_DIR = PROJECT_ROOT / "screenshots"
TESTS_FILE = BASE_DIR / "test_cases.json"


# ===================== VALIDATION =====================

def fatal(msg: str):
    print(f"\n❌ {msg}")
    sys.exit(1)


if not CL_BASE_URL or not OX_BASE_URL:
    fatal("Missing CL_BASE_URL or OX_BASE_URL in environment")

if not TESTS_FILE.exists():
    fatal(f"test_cases.json not found at {TESTS_FILE}")


# ===================== SETUP STORAGE =====================

if CLEAN_OLD_RESULTS and SCREENSHOT_DIR.exists():
    shutil.rmtree(SCREENSHOT_DIR)

SCREENSHOT_DIR.mkdir(exist_ok=True)


# ===================== LOAD TEST CASES =====================

with open(TESTS_FILE, "r") as f:
    TESTS = json.load(f)

if not TESTS:
    fatal("No test cases found in test_cases.json")


# ===================== HELPERS =====================

def capture_viewport(page):
    """Capture viewport screenshot as bytes (no file written)."""
    return page.screenshot(
        full_page=False,
        clip={
            "x": 0,
            "y": 0,
            "width": VIEWPORT["width"],
            "height": VIEWPORT["height"],
        },
    )


# ===================== MAIN RUNNER =====================

def main():
    run_id = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    results = []
    failed_count = 0

    print(f"\n🚀 UI Layout Test Run: {run_id}")
    print(f"📄 Loaded {len(TESTS)} test cases")

    with sync_playwright() as p:
        browser = p.chromium.launch()

        context_args = {"viewport": VIEWPORT}

        if AUTH_USER and AUTH_PASS:
            context_args["http_credentials"] = {
                "username": AUTH_USER,
                "password": AUTH_PASS,
            }

        context = browser.new_context(**context_args)
        page = context.new_page()

        for _, test in TESTS.items():
            uri = test["uri"]
            test_name = test["test_name"]
            desc = test.get("desc", "")

            print(f"\n▶ Executing test: {test_name}")
            if desc:
                print(f"  ↳ {desc}")

            start_time = time.time()
            status = "passed"
            diff_image = None

            try:
                print("  → Loading Cottagelabs")
                page.goto(CL_BASE_URL + uri, wait_until="networkidle")
                img_a_bytes = capture_viewport(page)

                print("  → Loading Bodleian")
                page.goto(OX_BASE_URL + uri, wait_until="networkidle")
                img_b_bytes = capture_viewport(page)

                img_a = Image.open(BytesIO(img_a_bytes))
                img_b = Image.open(BytesIO(img_b_bytes))

                diff_img = Image.new("RGBA", img_a.size)
                diff_pixels = pixelmatch(
                    img_a,
                    img_b,
                    diff_img,
                    threshold=DIFF_THRESHOLD,
                )

                if diff_pixels > MAX_DIFF_PIXELS:
                    status = "failed"
                    failed_count += 1
                    diff_image = f"diff_{test_name}.png"
                    diff_img.save(SCREENSHOT_DIR / diff_image)
                    print(f"  ❌ FAILED ({diff_pixels} pixels differ)")
                else:
                    print("  ✅ PASSED")

            except Exception as e:
                status = "failed"
                failed_count += 1
                print(f"  ❌ ERROR: {e}")

                if FAIL_FAST:
                    raise

            duration_ms = int((time.time() - start_time) * 1000)

            results.append({
                "test_name": test_name,
                "uri": uri,
                "desc": desc,
                "status": status,
                "duration_ms": duration_ms,
                "diff_image": diff_image,
            })

            if status == "failed" and FAIL_FAST:
                break

        browser.close()

    # ===================== REPORT =====================

    report = {
        "run_id": run_id,
        "summary": {
            "total": len(results),
            "passed": len([r for r in results if r["status"] == "passed"]),
            "failed": len([r for r in results if r["status"] == "failed"]),
        },
        "tests": results,
    }

    report_path = SCREENSHOT_DIR / f"reports_{run_id}.json"

    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)

    print(f"\n📄 Report generated: {report_path}")

    if failed_count > 0:
        print(f"❌ Test run completed with {failed_count} failures")
        sys.exit(1)

    print("\n✅ All tests passed successfully")
    sys.exit(0)


# ===================== ENTRY POINT =====================

if __name__ == "__main__":
    main()
