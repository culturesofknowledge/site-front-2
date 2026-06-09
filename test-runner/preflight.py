"""
Preflight checks — runs at server startup.
Verifies all dependencies are present, auto-installs what it can,
and prints a clear status summary. Exits with code 1 if anything
critical is missing and cannot be fixed automatically.
"""
from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

PASS  = "  ✓"
FAIL  = "  ✗"
WARN  = "  !"
ARROW = "  →"

_errors:   list[str] = []
_warnings: list[str] = []


def _ok(msg: str):   print(f"{PASS} {msg}", flush=True)
def _warn(msg: str): print(f"{WARN} {msg}", flush=True); _warnings.append(msg)
def _fail(msg: str): print(f"{FAIL} {msg}", flush=True); _errors.append(msg)
def _info(msg: str): print(f"{ARROW} {msg}", flush=True)


# ── Python packages ────────────────────────────────────────────────────────────

REQUIRED_PACKAGES = {
    "flask":      "flask",
    "playwright": "playwright",
    "PIL":        "Pillow",
    "pixelmatch": "pixelmatch",
    "requests":   "requests",
}

def check_python_packages():
    print("\nPython packages:", flush=True)
    missing = []
    for import_name, install_name in REQUIRED_PACKAGES.items():
        try:
            __import__(import_name)
            import importlib.metadata as im
            version = im.version(install_name)
            _ok(f"{install_name} {version}")
        except ImportError:
            _warn(f"{install_name} not installed — will install now")
            missing.append(install_name)
        except Exception:
            _ok(install_name)

    if missing:
        _info(f"Running: pip install {' '.join(missing)}")
        result = subprocess.run(
            [sys.executable, "-m", "pip", "install"] + missing,
            capture_output=True, text=True,
        )
        if result.returncode == 0:
            _ok(f"Installed: {', '.join(missing)}")
        else:
            for pkg in missing:
                _fail(f"Could not install {pkg}: {result.stderr.strip()[:200]}")


# ── Playwright browsers ────────────────────────────────────────────────────────

def check_playwright_browsers():
    print("\nPlaywright browsers:", flush=True)
    try:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            exe = p.chromium.executable_path
            if Path(exe).exists():
                _ok(f"Chromium found at {exe}")
            else:
                raise FileNotFoundError(exe)
    except Exception:
        _warn("Chromium not installed — running: playwright install chromium")
        result = subprocess.run(
            [sys.executable, "-m", "playwright", "install", "chromium"],
            capture_output=True, text=True,
        )
        if result.returncode == 0:
            _ok("Chromium installed successfully")
        else:
            _fail(
                "Failed to install Chromium. Run manually:\n"
                "    playwright install --with-deps chromium\n"
                f"    Error: {result.stderr.strip()[:300]}"
            )


# ── Config files ───────────────────────────────────────────────────────────────

def check_config_files():
    print("\nConfig files:", flush=True)

    runner_config = BASE_DIR / "runner_config.json"
    template      = BASE_DIR / "runner_config.template.json"
    if runner_config.exists():
        try:
            with open(runner_config) as f:
                cfg = json.load(f)
            cl_url = cfg.get("sites", {}).get("cl", {}).get("base_url", "")
            ox_url = cfg.get("sites", {}).get("ox", {}).get("base_url", "")
            _ok("runner_config.json found")
            if not cl_url or not ox_url:
                _warn("runner_config.json: Site A or Site B base_url is empty — configure in Settings")
        except json.JSONDecodeError as exc:
            _fail(f"runner_config.json is invalid JSON: {exc}")
    elif template.exists():
        shutil.copy(template, runner_config)
        _ok("runner_config.json created from template — configure site URLs in Settings before running")
    else:
        _fail("runner_config.json missing and no template found — create it before running tests")

    test_cases = BASE_DIR / "test_cases.json"
    tc_template = BASE_DIR / "test_cases.template.json"
    if test_cases.exists():
        try:
            with open(test_cases) as f:
                tests = json.load(f)
            _ok(f"test_cases.json found ({len(tests)} test cases)")
        except json.JSONDecodeError as exc:
            _fail(f"test_cases.json is invalid JSON: {exc}")
    elif tc_template.exists():
        shutil.copy(tc_template, test_cases)
        _ok("test_cases.json created from template")
    else:
        _warn("test_cases.json missing — add test cases via the Test Cases tab")


# ── Directories ────────────────────────────────────────────────────────────────

def check_directories():
    print("\nDirectories:", flush=True)
    for d in [
        BASE_DIR / ".test_run",
        BASE_DIR / ".test_run" / "results",
        BASE_DIR / ".bulk_run",
        BASE_DIR / ".bulk_run" / "results",
    ]:
        d.mkdir(parents=True, exist_ok=True)
    _ok("Result directories ready")


# ── SQLite ─────────────────────────────────────────────────────────────────────

def check_database():
    print("\nDatabase:", flush=True)
    try:
        import sqlite3
        db_path = BASE_DIR / ".bulk_run" / "bulk.db"
        c = sqlite3.connect(str(db_path))
        c.execute("PRAGMA journal_mode=WAL")
        c.execute("SELECT 1")
        c.close()
        _ok(f"SQLite OK — {db_path}")
    except Exception as exc:
        _fail(f"SQLite error: {exc}")


# ── Entry point ────────────────────────────────────────────────────────────────

def run():
    print("\n" + "─" * 52, flush=True)
    print("  EMLO Test Runner — startup checks", flush=True)
    print("─" * 52, flush=True)

    check_python_packages()
    check_playwright_browsers()
    check_config_files()
    check_directories()
    check_database()

    print("\n" + "─" * 52, flush=True)
    if _errors:
        print(f"  {len(_errors)} error(s) — fix before running tests:", flush=True)
        for e in _errors:
            print(f"    • {e}", flush=True)
        print("─" * 52 + "\n", flush=True)
        sys.exit(1)
    elif _warnings:
        print(f"  Ready with {len(_warnings)} warning(s).", flush=True)
    else:
        print("  All checks passed — ready to run.", flush=True)
    print("─" * 52 + "\n", flush=True)


if __name__ == "__main__":
    run()
