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
from dotenv import load_dotenv


# ===================== CONFIG =====================

SCHEMA_VERSION = "1.1"

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent

load_dotenv(PROJECT_ROOT / ".env")

CL_BASE_URL = os.getenv("CL_BASE_URL")
OX_BASE_URL = os.getenv("OX_BASE_URL")

AUTH_USER = os.getenv("CL_TESTSERVER_USER")
AUTH_PASS = os.getenv("CL_TESTSERVER_PASS")

VIEWPORT = {"width": 1440, "height": 900}
DIFF_THRESHOLD = 0.1
MAX_DIFF_PIXELS = 0

FAIL_FAST = False
CLEAN_OLD_RESULTS = True
CAPTURE_ALL_SCREENSHOTS = False

SCREENSHOT_DIR = PROJECT_ROOT / "results"
TESTS_FILE = BASE_DIR / "test_cases.json"


# ===================== VALIDATION =====================

def fatal(msg: str):
    print(f"\n❌ {msg}")
    sys.exit(1)


if not CL_BASE_URL or not OX_BASE_URL:
    fatal("Missing CL_BASE_URL or OX_BASE_URL")

if not TESTS_FILE.exists():
    fatal(f"test_cases.json not found at {TESTS_FILE}")


# ===================== STORAGE SETUP =====================

if CLEAN_OLD_RESULTS and SCREENSHOT_DIR.exists():
    shutil.rmtree(SCREENSHOT_DIR)

SCREENSHOT_DIR.mkdir(exist_ok=True)


# ===================== LOAD TEST CASES =====================

with open(TESTS_FILE, "r") as f:
    TESTS = json.load(f)

if not TESTS:
    fatal("No test cases found in test_cases.json")


# ===================== HELPERS =====================

def capture_viewport(page) -> bytes:
    return page.screenshot(
        full_page=False,
        clip={
            "x": 0,
            "y": 0,
            "width": VIEWPORT["width"],
            "height": VIEWPORT["height"],
        },
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


def emit_result(result: dict):
    """
    Print a structured result line that test_run.py parses in real time.
    Prefixed with ##RESULT## so it is unambiguous in stdout.
    flush=True ensures it is not buffered — the parent process sees it immediately.
    """
    print(f"##RESULT## {json.dumps(result)}", flush=False)


# ===================== MAIN RUNNER =====================

def main():
    run_id = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    run_started_at = datetime.now(timezone.utc)

    results = []
    failed_count = 0

    print(f"\n🚀 UI Layout Test Run: {run_id}", flush=True)
    print(f"📄 Loaded {len(TESTS)} test cases", flush=True)

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

        browser_info = {
            "name": browser.browser_type.name,
            "version": browser.version,
            "headless": True,
            "viewport": VIEWPORT,
            "user_agent": page.evaluate("() => navigator.userAgent"),
        }

        for _, test in TESTS.items():
            uri = test["uri"]
            test_name = test["test_name"]
            test_id = test.get("id") or normalize_id(test_name)
            desc = test.get("desc", "")

            cl_site_url = CL_BASE_URL.rstrip("/") + uri
            ox_site_url = OX_BASE_URL.rstrip("/") + uri

            print(f"\n▶ Executing test: {test_name}", flush=True)
            if desc:
                print(f"  ↳ {desc}", flush=True)

            start_time = time.time()

            status = "passed"
            execution_error = None
            matching_percentage = None

            artifacts = {
                "cl_site_image": None,
                "ox_site_image": None,
                "diff_image": None,
            }

            cl_load_time = None
            ox_load_time = None

            try:
                print("  → Loading Cottagelabs", flush=True)
                page.goto(cl_site_url, wait_until="networkidle")
                cl_load_time = get_page_load_time(page)
                cl_img_bytes = capture_viewport(page)

                print("  → Loading Bodleian", flush=True)
                page.goto(ox_site_url, wait_until="networkidle")
                ox_load_time = get_page_load_time(page)
                ox_img_bytes = capture_viewport(page)

                if CAPTURE_ALL_SCREENSHOTS:
                    cl_name = f"{test_id}_cl_site.png"
                    ox_name = f"{test_id}_ox_site.png"
                    save_image(cl_img_bytes, SCREENSHOT_DIR / cl_name)
                    save_image(ox_img_bytes, SCREENSHOT_DIR / ox_name)
                    artifacts["cl_site_image"] = cl_name
                    artifacts["ox_site_image"] = ox_name

                img_cl = Image.open(BytesIO(cl_img_bytes))
                img_ox = Image.open(BytesIO(ox_img_bytes))

                diff_img = Image.new("RGBA", img_cl.size)
                diff_pixels = pixelmatch(
                    img_cl,
                    img_ox,
                    diff_img,
                    threshold=DIFF_THRESHOLD,
                )

                total_pixels = img_cl.size[0] * img_cl.size[1]
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
                status = "execution-error"
                execution_error = str(e)
                failed_count += 1
                print(f"  ❌ EXECUTION ERROR: {e}", flush=True)

                if FAIL_FAST:
                    raise

            duration_ms = int((time.time() - start_time) * 1000)

            result = {
                "id": test_id,
                "test_name": test_name,
                "uri": uri,
                "desc": desc,
                "cl_site_url": cl_site_url,
                "ox_site_url": ox_site_url,
                "cl_load_time_ms": cl_load_time,
                "ox_load_time_ms": ox_load_time,
                "status": status,
                "execution_error": execution_error,
                "matching_percentage": matching_percentage,
                "duration_ms": duration_ms,
                "artifacts": artifacts,
            }

            results.append(result)

            # ── Emit structured result immediately so the UI updates in real time ──
            emit_result(result)

            if status != "passed" and FAIL_FAST:
                break

        browser.close()

    run_completed_at = datetime.now(timezone.utc)
    run_duration = int(
        (run_completed_at - run_started_at).total_seconds() * 1000
    )

    # ===================== HTML REPORT =====================
    DASHBOARD_TEMPLATE = """<!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8" />
            <title>Visual Regression Report</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />

            <style>
            * { box-sizing: border-box; }
            body {
            margin: 0;
            font-family: system-ui, sans-serif;
            background: #0f172a;
            color: #e5e7eb;
            }
            header {
            padding: 14px 20px;
            background: #020617;
            border-bottom: 1px solid #1e293b;
            }
            .summary {
            font-size: 13px;
            color: #94a3b8;
            display: flex;
            gap: 16px;
            margin-top: 6px;
            flex-wrap: wrap;
            }
            main {
            display: grid;
            grid-template-columns: 1fr 2fr;
            height: calc(100vh - 110px);
            }
            .left {
            border-right: 1px solid #1e293b;
            display: flex;
            flex-direction: column;
            }
            .controls {
            padding: 10px;
            display: flex;
            gap: 8px;
            border-bottom: 1px solid #1e293b;
            }
            .controls input, .controls select {
            background: #020617;
            color: #e5e7eb;
            border: 1px solid #1e293b;
            padding: 6px;
            }
            .table-container { flex: 1; overflow-y: auto; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; }
            thead { position: sticky; top: 0; background: #020617; }
            th, td { padding: 8px; border-bottom: 1px solid #1e293b; white-space: nowrap; text-align: left; }
            tbody tr:hover { background: #020617; cursor: pointer; }
            .passed { color: #22c55e; font-weight: 600; }
            .failed { color: #ef4444; font-weight: 600; }
            .execution-error { color: #f97316; font-weight: 600; }
            .pagination { padding: 8px; display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; border-top: 1px solid #1e293b; }
            .right { padding: 16px; overflow-y: auto; }
            .image-box { border: 1px solid #1e293b; background: #020617; padding: 8px; margin-bottom: 16px; }
            .image-box img { width: 100%; border: 1px solid #1e293b; }
            .url { font-size: 12px; color: #94a3b8; word-break: break-all; }
            .note { font-size: 14px; color: #fff; margin-top: 20px; }
            .error-box { border: 1px solid #7c2d12; background: #2a0f0f; color: #fecaca; padding: 10px; margin-top: 12px; font-size: 13px; white-space: pre-wrap; }
            a { color: #fff; }
            </style>
            </head>
            <body>
            <header>
            <h2>EMLO Visual Regression Report</h2>
            <div class="summary" id="summary"></div>
            <div class="summary" id="runMeta"></div>
            </header>
            <main>
            <div class="left">
                <div class="controls">
                <input id="search" placeholder="Search test…" />
                <select id="statusFilter">
                    <option value="all">All</option>
                    <option value="passed">Passed</option>
                    <option value="failed">Failed</option>
                    <option value="execution-error">Execution Error</option>
                </select>
                </div>
                <div class="table-container">
                <table>
                    <thead><tr><th>Test</th><th>Status</th><th>Match %</th><th>URI</th><th>CL Load</th><th>OX Load</th><th>Time (ms)</th></tr></thead>
                    <tbody id="tableBody"></tbody>
                </table>
                </div>
                <div class="pagination">
                <button id="prev">Prev</button>
                <span id="pageInfo"></span>
                <button id="next">Next</button>
                </div>
            </div>
            <div class="right" id="details"><div class="note">Select a test to view details</div></div>
            </main>
            <script id="report-data" type="application/json">__REPORT_JSON__</script>
            <script>
            const PAGE_SIZE = 25;
            const report = JSON.parse(document.getElementById("report-data").textContent);
            let filtered = report.tests;
            let page = 1;
            const tbody = document.getElementById("tableBody");
            const details = document.getElementById("details");
            document.getElementById("summary").innerHTML = `<span><strong>Run:</strong> ${report.run_id}</span><span><strong>Total:</strong> ${report.summary.total}</span><span class="passed"><strong>Passed:</strong> ${report.summary.passed} (${report.summary.pass_percentage}%)</span><span class="failed"><strong>Failed:</strong> ${report.summary.failed} (${report.summary.fail_percentage}%)</span><span class="execution-error"><strong>Exec Errors:</strong> ${report.summary.execution_error} (${report.summary.execution_error_percentage}%)</span>`;
            document.getElementById("runMeta").innerHTML = `<span><strong>Started:</strong> ${report.run_started_at}</span><span><strong>Completed:</strong> ${report.run_completed_at}</span><span><strong>Duration:</strong> ${human(report.run_duration)}s</span><span><strong>Browser:</strong> ${report.config.browser.name} ${report.config.browser.version}</span><span><strong>Viewport:</strong> ${report.config.browser.viewport.width}x${report.config.browser.viewport.height}</span>`;
            function applyFilters() {
                const q = document.getElementById("search").value.toLowerCase();
                const status = document.getElementById("statusFilter").value;
                filtered = report.tests.filter(t => { if (status !== "all" && t.status !== status) return false; if (q && !t.test_name.toLowerCase().includes(q)) return false; return true; });
                page = 1; renderTable();
            }
            function renderTable() {
                tbody.innerHTML = "";
                const start = (page - 1) * PAGE_SIZE;
                const rows = filtered.slice(start, start + PAGE_SIZE);
                rows.forEach(t => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `<td>${t.test_name}</td><td class="${t.status}">${t.status}</td><td>${t.matching_percentage !== null ? t.matching_percentage + "%" : "-"}</td><td style="max-width:200px;overflow:hidden;">${t.uri}</td><td>${human(t.cl_load_time_ms) ?? "-"}</td><td>${human(t.ox_load_time_ms) ?? "-"}</td><td>${human(t.duration_ms)}</td>`;
                    tr.onclick = () => showDetails(t);
                    tbody.appendChild(tr);
                });
                document.getElementById("pageInfo").innerText = `Page ${page} of ${Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))}`;
            }
            function showDetails(t) {
                let html = `<h3>${t.test_name}</h3><p>${t.desc || ""}</p>`;
                if (t.status === "execution-error") { html += `<div class="error-box"><strong>Execution Error</strong><br/>${t.execution_error || "Unknown error"}</div>`; details.innerHTML = html; return; }
                html += `<div><h3>Sites compared:</h3><div>Cottage Labs: <a href="${t.cl_site_url}" target="_blank">${t.cl_site_url}</a></div><div>Oxford: <a href="${t.ox_site_url}" target="_blank">${t.ox_site_url}</a></div><div class="note">Matching: <span class="${t.status}">${t.matching_percentage}%</span> | Status: <span class="${t.status}">${t.status}</span></div></div>`;
                const captureAll = report.config.capture_all_screenshots;
                if (captureAll) { html += image("Screenshot - Cottagelabs", t.cl_site_url, t.artifacts.cl_site_image); html += image("Screenshot - Bodleian", t.ox_site_url, t.artifacts.ox_site_image); if (t.artifacts.diff_image) html += image("Diff comparison", null, t.artifacts.diff_image); }
                else { if (t.status === "failed") { html += image("Overlap comparison image.", null, t.artifacts.diff_image); html += `<div class="note">NOTE: CL and OX images were not captured due to configuration.</div>`; } else { html += `<div class="note">Overlap comparison passed. Images not captured.</div>`; } }
                details.innerHTML = html;
            }
            function image(title, url, file) { if (!file) return ""; return `<br/><div class="image-box"><strong>${title}</strong>${url ? `<div class="url">${url}</div>` : ""}<img src="${file}"></div>`; }
            document.getElementById("search").oninput = applyFilters;
            document.getElementById("statusFilter").onchange = applyFilters;
            document.getElementById("prev").onclick = () => { if (page > 1) page--; renderTable(); };
            document.getElementById("next").onclick = () => { if (page * PAGE_SIZE < filtered.length) page++; renderTable(); };
            renderTable();
            function human(ms) { if (ms === null || ms === undefined) return "-"; if (ms < 1000) return ms + " ms"; return (ms / 1000).toFixed(2) + " s"; }
            </script>
            </body>
            </html>"""

    # ===================== FINAL REPORT =====================

    total = len(results)
    passed = len([r for r in results if r["status"] == "passed"])
    failed = len([r for r in results if r["status"] == "failed"])
    exec_err = len([r for r in results if r["status"] == "execution-error"])

    pass_percentage = round((passed / total) * 100, 2) if total else 0.0
    fail_percentage = round((failed / total) * 100, 2) if total else 0.0
    execution_error_percentage = round((exec_err / total) * 100, 2) if total else 0.0

    report = {
        "schema_version": SCHEMA_VERSION,
        "run_id": run_id,
        "run_started_at": run_started_at.isoformat(),
        "run_completed_at": run_completed_at.isoformat(),
        "run_duration": run_duration,
        "config": {
            "fail_fast": FAIL_FAST,
            "clean_old_results": CLEAN_OLD_RESULTS,
            "capture_all_screenshots": CAPTURE_ALL_SCREENSHOTS,
            "viewport": VIEWPORT,
            "diff_threshold": DIFF_THRESHOLD,
            "max_diff_pixels": MAX_DIFF_PIXELS,
            "browser": browser_info,
        },
        "summary": {
            "total": total,
            "passed": passed,
            "failed": failed,
            "execution_error": exec_err,
            "pass_percentage": pass_percentage,
            "fail_percentage": fail_percentage,
            "execution_error_percentage": execution_error_percentage,
        },
        "tests": results,
    }

    report_path = SCREENSHOT_DIR / f"reports_{run_id}.json"
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)

    print(f"\n📄 Report generated: {report_path}", flush=True)

    html_path = SCREENSHOT_DIR / "report.html"
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(DASHBOARD_TEMPLATE.replace("__REPORT_JSON__", json.dumps(report, indent=2)))

    print(f"📄 HTML report generated: {html_path}", flush=True)

    sys.exit(1 if failed_count > 0 else 0)


# ===================== ENTRY POINT =====================

if __name__ == "__main__":
    main()