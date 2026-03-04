"""

Proxy blueprint for the test-runner service.
"""
import os

import requests as _http
from flask import Blueprint, Response, request

# Docker sets this via docker-compose. Locally falls back to localhost.
TEST_RUNNER_URL = os.getenv("TEST_RUNNER_URL", "http://test-runner:8085")

test_runner_bp = Blueprint("test_runner", __name__)

ERROR_PAGE_HTML = """
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Service Unavailable — EMLO Tests</title>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>
<style>
:root {
  --bg: #f5f4f0;
  --surface: #ffffff;
  --border: #e2ddd8;
  --text: #1a1814;
  --text2: #6b6560;
  --text3: #9e9890;
  --accent: #2563eb;
  --warn: #d97706;
  --warn-bg: #fffbeb;
  --radius: 12px;
  --shadow: 0 10px 30px rgba(0,0,0,.04), 0 1px 8px rgba(0,0,0,.02);
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'DM Sans', sans-serif;
  background-color: var(--bg);
  color: var(--text);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
}

.error-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  max-width: 440px;
  width: 100%;
  padding: 40px 32px;
  text-align: center;
}

.icon-box {
  width: 64px;
  height: 64px;
  background: var(--warn-bg);
  color: var(--warn);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  position: relative;
}

.icon-box::after {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid var(--warn);
  opacity: 0.2;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.2; }
  100% { transform: scale(1.5); opacity: 0; }
}

h1 {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 12px;
  letter-spacing: -0.02em;
}

p {
  font-size: 15px;
  color: var(--text2);
  line-height: 1.6;
  margin-bottom: 32px;
}

.command-container {
  background: #1a1814;
  border-radius: 8px;
  padding: 16px;
  text-align: left;
  margin-bottom: 24px;
  position: relative;
}

.command-header {
  font-size: 10px;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
  font-weight: 600;
}

code {
  font-family: 'DM Mono', monospace;
  font-size: 13px;
  color: #f5f4f0;
  display: block;
}

code::before {
  content: "$ ";
  color: var(--accent);
}

.btn-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn {
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary {
  background: var(--accent);
  color: white;
  border: none;
}

.btn-primary:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.btn-ghost {
  background: transparent;
  color: var(--text2);
  border: 1px solid var(--border);
}

.btn-ghost:hover {
  background: var(--bg);
  color: var(--text);
}
</style>
</head>
<body>

<div class="error-card">
  <div class="icon-box">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  </div>

  <h1>Test Runner Unavailable</h1>
  <p>The service is not running. Start the backend container to resume visual regression testing.</p>

  <div class="command-container">
    <div class="command-header">Terminal Action Required</div>
    <code>docker compose up test-runner</code>
  </div>

  <div class="btn-group">
    <button class="btn btn-primary" onclick="window.location.reload()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
      Retry Connection
    </button>
    <a href="/" class="btn btn-ghost">Return to Dashboard</a>
  </div>
</div>

</body>
</html>
"""

def _proxy(path: str):
    url = f"{TEST_RUNNER_URL}/{path}"
    print(f"starting test runner proxy on {url}")
    try:
        resp = _http.request(
            method=request.method,
            url=url,
            headers={k: v for k, v in request.headers if k.lower() != "host"},
            data=request.get_data(),
            params=request.args,
            stream=True,   # required for SSE /api/events
            timeout=None,  # SSE streams are long-lived
        )
        return Response(
            resp.iter_content(chunk_size=1),
            status=resp.status_code,
            content_type=resp.headers.get("Content-Type", "application/octet-stream"),
            headers={
                "X-Accel-Buffering": "no",
                "Cache-Control": "no-cache",
            },
        )
    except _http.exceptions.ConnectionError:
        return Response(
           ERROR_PAGE_HTML,
            status=503,
            content_type="text/html",
        )


@test_runner_bp.route("/test-run", methods=["GET", "POST"])
def proxy_page():
    return _proxy("test-run")


@test_runner_bp.route("/api/tests", methods=["GET", "POST"])
@test_runner_bp.route("/api/settings", methods=["GET", "POST"])
@test_runner_bp.route("/api/run", methods=["POST"])
@test_runner_bp.route("/api/run/status", methods=["GET"])
@test_runner_bp.route("/api/events", methods=["GET"])
@test_runner_bp.route("/api/last-report", methods=["GET"])
def proxy_api():
    return _proxy(request.path.lstrip("/"))


@test_runner_bp.route("/results/<path:filename>")
def proxy_results(filename):
    return _proxy(f"results/{filename}")