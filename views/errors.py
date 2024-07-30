from flask import Blueprint, render_template

errors_bp = Blueprint('errors', __name__)

@errors_bp.app_errorhandler(404)
def route_not_found(err):
    return render_template('page_not_found.jinja2', title="Page not found"), 404

@errors_bp.app_errorhandler(500)
def internal_server_error(err):
    return render_template('internal_server_error.jinja2', err=str(err), title="Internal error"), 500
