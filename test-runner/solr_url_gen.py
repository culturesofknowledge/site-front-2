"""
Queries Solr cores and generates profile URLs for all records.
Returns list of {uri, record_type, record_id} dicts.
"""
from __future__ import annotations

import sys
from typing import Generator, Optional

import requests

# Maps Solr core name → (URI template, record_type label)
CORE_URL_MAP: dict[str, tuple[str, str]] = {
    "works":          ("/profile/work/{id}",         "work"),
    "people":         ("/profile/person/{id}",        "person"),
    "locations":      ("/profile/location/{id}",      "location"),
    "manifestations": ("/profile/manifestation/{id}", "manifestation"),
    "images":         ("/profile/image/{id}",         "image"),
    "resources":      ("/profile/repository/{id}",    "repository"),
    "institutions":   ("/profile/person/{id}",        "institution"),
}


def _iter_ids(solr_base: str, core: str, batch: int = 500) -> Generator[str, None, None]:
    """Yield every document ID from a Solr core using simple offset pagination."""
    url = f"{solr_base.rstrip('/')}/solr/{core}/select"
    start = 0
    while True:
        resp = requests.get(url, params={
            "q": "*:*", "fl": "id", "rows": batch, "start": start, "wt": "json",
        }, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        docs = data["response"]["docs"]
        if not docs:
            break
        for doc in docs:
            yield doc["id"]
        start += len(docs)
        if start >= data["response"]["numFound"]:
            break


def generate_urls(
    solr_base: str,
    cores: Optional[list[str]] = None,
    limit: Optional[int] = None,
) -> list[dict]:
    """
    Returns [{uri, record_type, record_id}, ...] for all records.
    Raises on the first core that fails — surfaces the real error rather than
    silently returning empty results.
    cores: which Solr cores to query (None = all known cores)
    limit: max records *per core* (None = all)
    """
    if cores is None:
        cores = list(CORE_URL_MAP.keys())

    results: list[dict] = []
    for core in cores:
        if core not in CORE_URL_MAP:
            print(f"WARNING: unknown core '{core}' — skipping", file=sys.stderr)
            continue
        uri_template, rtype = CORE_URL_MAP[core]
        count = 0
        try:
            for record_id in _iter_ids(solr_base, core):
                results.append({
                    "uri":         uri_template.format(id=record_id),
                    "record_type": rtype,
                    "record_id":   record_id,
                })
                count += 1
                if limit and count >= limit:
                    break
            print(f"  {core}: {count} records", file=sys.stderr)
        except requests.exceptions.ConnectionError as exc:
            raise ConnectionError(
                f"Could not connect to Solr at {solr_base} — is it running? ({exc})"
            ) from exc
        except requests.exceptions.HTTPError as exc:
            raise RuntimeError(
                f"Solr returned an error for core '{core}': {exc}"
            ) from exc
        except Exception as exc:
            raise RuntimeError(f"Failed to fetch core '{core}': {exc}") from exc

    return results


def count_urls(solr_base: str, cores: Optional[list[str]] = None) -> dict[str, int]:
    """Returns {core: numFound} without fetching all IDs — fast preview. Raises on connection error."""
    if cores is None:
        cores = list(CORE_URL_MAP.keys())
    counts: dict[str, int] = {}
    for core in cores:
        if core not in CORE_URL_MAP:
            continue
        try:
            url = f"{solr_base.rstrip('/')}/solr/{core}/select"
            resp = requests.get(url, params={"q": "*:*", "rows": 0, "wt": "json"}, timeout=8)
            resp.raise_for_status()
            counts[core] = resp.json()["response"]["numFound"]
        except requests.exceptions.ConnectionError as exc:
            raise ConnectionError(
                f"Could not connect to Solr at {solr_base} — is it running? ({exc})"
            ) from exc
        except Exception as exc:
            counts[core] = -1
            print(f"WARNING: count failed for '{core}': {exc}", file=sys.stderr)
    return counts
