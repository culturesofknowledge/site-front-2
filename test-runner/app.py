"""
Standalone Flask app for the test-runner service.
Runs internally on port 8085.
"""
import preflight
preflight.run()

from flask import Flask, send_from_directory
from test_run import test_run_bp
from bulk_run_bp import bulk_run_bp, init_bulk
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def create_app():
    app = Flask(__name__)
    app.register_blueprint(test_run_bp)
    app.register_blueprint(bulk_run_bp)
    init_bulk()

    @app.route("/")
    def landing():
        return send_from_directory(BASE_DIR, "landing.html")

    @app.errorhandler(404)
    def not_found(e):
        return send_from_directory(BASE_DIR, "error.html"), 404

    return app

app = create_app()

if __name__ == "__main__":
    debug_mode = os.getenv("DEBUG", "false").lower() == "true"
    app.run(host="0.0.0.0", port=8085, debug=debug_mode)
