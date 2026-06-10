"""
Pre-run safety checks — called synchronously before a bulk run starts.

Each check returns None (ok) or a human-readable error string.
run_all() aggregates them into {"errors": [...], "warnings": [...], "workers": clamped_int}.
"""
from __future__ import annotations

import os
import shutil
from pathlib import Path

import requests

_CPU_COUNT     = os.cpu_count() or 1
MAX_WORKERS    = min(8, _CPU_COUNT)   # hard cap: 8 or available cores, whichever is lower
MIN_DISK_GB    = 1.0   # minimum free space required in the results directory
SOLR_TIMEOUT   = 5     # seconds
SITE_TIMEOUT   = 8     # seconds


def check_solr(solr_url: str) -> str | None:
    """Ping the Solr admin endpoint. Returns error string or None."""
    try:
        url = f"{solr_url.rstrip('/')}/solr/admin/info/system"
        resp = requests.get(url, params={"wt": "json"}, timeout=SOLR_TIMEOUT)
        resp.raise_for_status()
        return None
    except requests.exceptions.ConnectionError:
        return f"Cannot connect to Solr at {solr_url} — is it running?"
    except requests.exceptions.HTTPError as exc:
        return f"Solr returned HTTP {exc.response.status_code} at {solr_url} — check the URL"
    except requests.exceptions.Timeout:
        return f"Solr at {solr_url} timed out ({SOLR_TIMEOUT}s) — is it overloaded?"
    except Exception as exc:
        return f"Solr check failed: {exc}"


def check_site_url(url: str, name: str) -> str | None:
    """GET the site root and check it responds. Returns error string or None."""
    try:
        resp = requests.get(url, timeout=SITE_TIMEOUT, allow_redirects=True)
        if resp.status_code >= 500:
            return f"{name} ({url}) returned HTTP {resp.status_code}"
        return None
    except requests.exceptions.ConnectionError:
        return f"Cannot reach {name} at {url} — check the URL"
    except requests.exceptions.Timeout:
        return f"{name} ({url}) timed out ({SITE_TIMEOUT}s)"
    except Exception as exc:
        return f"{name} check failed: {exc}"


def check_disk_space(directory: Path) -> str | None:
    """Verify at least MIN_DISK_GB free in directory. Returns error string or None."""
    try:
        usage = shutil.disk_usage(str(directory))
        free_gb = usage.free / (1024 ** 3)
        if free_gb < MIN_DISK_GB:
            return (
                f"Low disk space: {free_gb:.2f} GB free in {directory} "
                f"(need at least {MIN_DISK_GB} GB for screenshots)"
            )
        return None
    except Exception as exc:
        return f"Disk space check failed: {exc}"


def clamp_workers(workers: int, total_tests: int | None = None) -> tuple[int, str | None]:
    """
    Returns (clamped_count, warning_or_None).
    Caps to MAX_WORKERS; optionally further caps to total_tests.
    """
    clamped = workers
    warning = None

    if workers > MAX_WORKERS:
        clamped = MAX_WORKERS
        reason = f"{_CPU_COUNT} CPU core(s) detected, hard cap is 8" if _CPU_COUNT < 8 else "hard cap is 8"
        warning = f"Workers capped from {workers} to {MAX_WORKERS} ({reason})"

    if total_tests is not None and clamped > total_tests > 0:
        prev = clamped
        clamped = total_tests
        if warning is None:
            warning = f"Workers reduced from {prev} to {clamped} to match test count"

    return clamped, warning


def run_all(
    solr_url: str,
    cl_url: str,
    ox_url: str,
    workers: int,
    results_dir: Path,
) -> dict:
    """
    Run all pre-flight checks.

    Returns::
        {
            "errors":   [...],   # blocking — run should not start
            "warnings": [...],   # informational — run can proceed
            "workers":  int,     # clamped worker count to use
        }
    """
    errors:   list[str] = []
    warnings: list[str] = []

    clamped, w_warn = clamp_workers(workers)
    if w_warn:
        warnings.append(w_warn)

    if err := check_solr(solr_url):
        errors.append(err)

    if err := check_site_url(cl_url, "Site A"):
        errors.append(err)

    if err := check_site_url(ox_url, "Site B"):
        errors.append(err)

    if err := check_disk_space(results_dir):
        errors.append(err)

    return {"errors": errors, "warnings": warnings, "workers": clamped}
