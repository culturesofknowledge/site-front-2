"""SQLite backend for bulk runs — handles 10k+ test records with pagination."""
from __future__ import annotations

import json
import sqlite3
import time
from pathlib import Path
from typing import Optional

DB_DIR  = Path(__file__).resolve().parent / ".bulk_run"
DB_PATH = DB_DIR / "bulk.db"


def _conn() -> sqlite3.Connection:
    DB_DIR.mkdir(parents=True, exist_ok=True)
    c = sqlite3.connect(str(DB_PATH), check_same_thread=False, timeout=30)
    c.row_factory = sqlite3.Row
    c.execute("PRAGMA journal_mode=WAL")
    c.execute("PRAGMA synchronous=NORMAL")
    return c


def init_db():
    with _conn() as c:
        c.executescript("""
            CREATE TABLE IF NOT EXISTS bulk_runs (
                run_id       TEXT PRIMARY KEY,
                started_at   REAL NOT NULL,
                finished_at  REAL,
                status       TEXT DEFAULT 'running',
                total        INTEGER DEFAULT 0,
                completed    INTEGER DEFAULT 0,
                passed       INTEGER DEFAULT 0,
                failed       INTEGER DEFAULT 0,
                exec_errors  INTEGER DEFAULT 0,
                config_json  TEXT
            );

            CREATE TABLE IF NOT EXISTS bulk_tests (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                run_id      TEXT NOT NULL,
                uri         TEXT NOT NULL,
                record_type TEXT,
                record_id   TEXT,
                status      TEXT DEFAULT 'queued',
                match_pct   REAL,
                diff_image  TEXT,
                cl_image    TEXT,
                ox_image    TEXT,
                error_msg   TEXT,
                duration_ms INTEGER,
                cl_load_ms  INTEGER,
                ox_load_ms  INTEGER,
                started_at  REAL,
                finished_at REAL,
                FOREIGN KEY(run_id) REFERENCES bulk_runs(run_id)
            );

            CREATE INDEX IF NOT EXISTS idx_bt_run_status
                ON bulk_tests(run_id, status);
            CREATE INDEX IF NOT EXISTS idx_bt_run_id
                ON bulk_tests(run_id, id);
        """)


def reset_interrupted_runs():
    """
    On startup: mark any unfinished runs as 'interrupted'.
    We do NOT change individual test statuses — tests keep their last-known
    state so the user can see what happened. Starting a new run creates a
    fresh run_id with fresh tests, so old stale statuses don't interfere.
    """
    with _conn() as c:
        c.execute(
            "UPDATE bulk_runs SET status='interrupted', finished_at=? "
            "WHERE status IN ('running', 'generating')",
            (time.time(),),
        )


def create_run(config: dict, status: str = "generating") -> str:
    run_id = time.strftime("%Y-%m-%d_%H-%M-%S")
    with _conn() as c:
        c.execute(
            "INSERT INTO bulk_runs (run_id, started_at, status, config_json) "
            "VALUES (?, ?, ?, ?)",
            (run_id, time.time(), status, json.dumps(config)),
        )
    return run_id


def insert_tests(run_id: str, tests: list[dict]):
    """tests: list of {uri, record_type, record_id}"""
    with _conn() as c:
        c.executemany(
            "INSERT INTO bulk_tests (run_id, uri, record_type, record_id) "
            "VALUES (?, ?, ?, ?)",
            [(run_id, t["uri"], t.get("record_type"), t.get("record_id")) for t in tests],
        )
        c.execute(
            "UPDATE bulk_runs SET total=? WHERE run_id=?",
            (len(tests), run_id),
        )


def get_pending_tests(run_id: str) -> list[dict]:
    with _conn() as c:
        rows = c.execute(
            "SELECT * FROM bulk_tests WHERE run_id=? AND status='queued' ORDER BY id",
            (run_id,),
        ).fetchall()
        return [dict(r) for r in rows]


def mark_test_running(test_id: int):
    with _conn() as c:
        c.execute(
            "UPDATE bulk_tests SET status='running', started_at=? WHERE id=?",
            (time.time(), test_id),
        )


def update_test_result(test_id: int, run_id: str, result: dict):
    status = result.get("status", "execution-error")
    with _conn() as c:
        c.execute(
            """UPDATE bulk_tests SET
                status=?, match_pct=?, diff_image=?, cl_image=?, ox_image=?,
                error_msg=?, duration_ms=?, cl_load_ms=?, ox_load_ms=?, finished_at=?
               WHERE id=?""",
            (
                status,
                result.get("match_pct"),
                result.get("diff_image"),
                result.get("cl_image"),
                result.get("ox_image"),
                result.get("error"),
                result.get("duration_ms"),
                result.get("cl_load_ms"),
                result.get("ox_load_ms"),
                time.time(),
                test_id,
            ),
        )
        if status == "passed":
            c.execute(
                "UPDATE bulk_runs SET completed=completed+1, passed=passed+1 WHERE run_id=?",
                (run_id,),
            )
        elif status == "failed":
            c.execute(
                "UPDATE bulk_runs SET completed=completed+1, failed=failed+1 WHERE run_id=?",
                (run_id,),
            )
        else:
            c.execute(
                "UPDATE bulk_runs SET completed=completed+1, exec_errors=exec_errors+1 WHERE run_id=?",
                (run_id,),
            )


def skip_remaining_tests(run_id: str, include_queued: bool = True) -> int:
    """
    Mark unfinished tests as skipped. Returns the count skipped.
    include_queued=True  → skip both 'queued' and 'running' (use for stop/interrupt)
    include_queued=False → skip only 'running' (use for crashes; leave 'queued' alone)
    """
    with _conn() as c:
        if include_queued:
            c.execute(
                "UPDATE bulk_tests SET status='skipped', finished_at=? "
                "WHERE run_id=? AND status IN ('queued', 'running')",
                (time.time(), run_id),
            )
        else:
            c.execute(
                "UPDATE bulk_tests SET status='skipped', finished_at=? "
                "WHERE run_id=? AND status='running'",
                (time.time(), run_id),
            )
        return c.execute(
            "SELECT COUNT(*) FROM bulk_tests WHERE run_id=? AND status='skipped'",
            (run_id,),
        ).fetchone()[0]


def finish_run(run_id: str, status: str = "finished"):
    with _conn() as c:
        c.execute(
            "UPDATE bulk_runs SET status=?, finished_at=? WHERE run_id=?",
            (status, time.time(), run_id),
        )


def estimate_remaining_ms(run_id: str) -> int | None:
    """
    Returns estimated ms to completion based on avg duration of finished tests.
    Returns None if not enough data yet.
    """
    with _conn() as c:
        row = c.execute(
            "SELECT AVG(duration_ms) as avg_ms, COUNT(*) as done "
            "FROM bulk_tests WHERE run_id=? AND duration_ms IS NOT NULL",
            (run_id,),
        ).fetchone()
        if not row or not row["done"] or not row["avg_ms"]:
            return None
        remaining = c.execute(
            "SELECT COUNT(*) FROM bulk_tests WHERE run_id=? AND status IN ('queued','running')",
            (run_id,),
        ).fetchone()[0]
        return int(row["avg_ms"] * remaining)


def get_run_stats(run_id: str) -> dict:
    with _conn() as c:
        row = c.execute(
            "SELECT * FROM bulk_runs WHERE run_id=?", (run_id,)
        ).fetchone()
        if not row:
            return {}
        result = dict(row)
        result["skipped"] = c.execute(
            "SELECT COUNT(*) FROM bulk_tests WHERE run_id=? AND status='skipped'",
            (run_id,),
        ).fetchone()[0]
        return result


def get_results_page(
    run_id: str,
    page: int = 1,
    per_page: int = 50,
    status_filter: Optional[str] = None,
    record_type_filter: Optional[str] = None,
) -> dict:
    offset = (page - 1) * per_page
    clauses = ["run_id=?"]
    params: list = [run_id]
    if status_filter:
        clauses.append("status=?")
        params.append(status_filter)
    if record_type_filter:
        clauses.append("record_type=?")
        params.append(record_type_filter)
    where = "WHERE " + " AND ".join(clauses)

    with _conn() as c:
        total = c.execute(
            f"SELECT COUNT(*) FROM bulk_tests {where}", params
        ).fetchone()[0]
        rows = c.execute(
            f"SELECT * FROM bulk_tests {where} ORDER BY id LIMIT ? OFFSET ?",
            params + [per_page, offset],
        ).fetchall()

    return {
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": max(1, (total + per_page - 1) // per_page),
        "items": [dict(r) for r in rows],
    }


def list_runs() -> list[dict]:
    with _conn() as c:
        rows = c.execute(
            "SELECT * FROM bulk_runs ORDER BY started_at DESC LIMIT 30"
        ).fetchall()
        return [dict(r) for r in rows]


def get_latest_run() -> Optional[dict]:
    with _conn() as c:
        row = c.execute(
            "SELECT * FROM bulk_runs ORDER BY started_at DESC LIMIT 1"
        ).fetchone()
        return dict(row) if row else None


def get_distinct_types(run_id: str) -> list[str]:
    with _conn() as c:
        rows = c.execute(
            "SELECT DISTINCT record_type FROM bulk_tests WHERE run_id=? AND record_type IS NOT NULL",
            (run_id,),
        ).fetchall()
        return [r[0] for r in rows]
