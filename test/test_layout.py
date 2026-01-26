import os
import re
import sys
from io import BytesIO
import json
from pathlib import Path
from dotenv import load_dotenv
from playwright.sync_api import sync_playwright
from PIL import Image
from pixelmatch.contrib.PIL import pixelmatch

load_dotenv() 

CL_BASE_URL = "https://emlo.cottagelabs.com/"
OX_BASE_URL = "https://emlo.bodleian.ox.ac.uk/"

URI = "forms/advanced"

# Only for CL test server since that is protected
AUTH_USER = os.getenv("CL_TESTSERVER_USER")
AUTH_PASS = os.getenv("CL_TESTSERVER_PASS")

VIEWPORT = {"width": 1440, "height": 900}
DIFF_THRESHOLD = 0.1
MAX_DIFF_PIXELS = 0


SCREENSHOT_DIR = "screenshots"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)
# ----------------------------

BASE_DIR = Path(__file__).parent
TESTS_FILE = BASE_DIR / "test_cases.json"




def fail(msg):
    print(f"\n❌ TEST FAILED: {msg}")
    sys.exit(1)


def pass_test():
    print("\n✅ TEST PASSED: Layouts match")
    sys.exit(0)


if not TESTS_FILE.exists():
    fail(f"test cases not found at {TESTS_FILE}")

with open(TESTS_FILE, "r") as f:
    TESTS = json.load(f)


def test_name_from_uri(uri: str) -> str:
    if uri in ("", "/"):
        return "home"
    return re.sub(r"[^a-zA-Z0-9]+", "_", uri.strip("/"))

def capture_viewport(page):
    """Capture viewport screenshot as bytes (no file written)."""
    return page.screenshot(
        full_page=False,
        clip={
            "x": 0,
            "y": 0,
            "width": VIEWPORT["width"],
            "height": VIEWPORT["height"]
        }
    )


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch()

        context = browser.new_context(
            viewport=VIEWPORT,
            http_credentials={
                "username": AUTH_USER,
                "password": AUTH_PASS
            }
        )

        page = context.new_page()

        for key, test in TESTS.items():
            uri = test["uri"]
            test_name = test["test_name"]
            desc = test.get("desc", "")

            print(f"\n▶ Executing test: {test_name}")
            if desc:
                print(f"  ↳ {desc}")

            # ---- Site A ----
            print("  → Loading Cottagelabs")
            page.goto(CL_BASE_URL + uri, wait_until="networkidle")
            img_a_bytes = capture_viewport(page)

            # ---- Site B ----
            print("  → Loading Bodliean")
            page.goto(OX_BASE_URL + uri, wait_until="networkidle")
            img_b_bytes = capture_viewport(page)

            # ---- Compare ----
            img_a = Image.open(BytesIO(img_a_bytes))
            img_b = Image.open(BytesIO(img_b_bytes))

            diff_img = Image.new("RGBA", img_a.size)
            diff_pixels = pixelmatch(
                img_a,
                img_b,
                diff_img,
                threshold=DIFF_THRESHOLD
            )

            if diff_pixels > MAX_DIFF_PIXELS:
                diff_path = os.path.join(
                    SCREENSHOT_DIR,
                    f"diff_{test_name}.png"
                )
                diff_img.save(diff_path)
                fail(f"[{test_name}] {diff_pixels} pixels differ → {diff_path}")

            print(f"  ✅ {test_name} passed")

        browser.close()

    pass_test()


if __name__ == "__main__":
    main()
