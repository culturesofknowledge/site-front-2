from flask import Blueprint, render_template

browse_bp = Blueprint('browse', __name__)

@browse_bp.route('/browse')
def browse():
    return render_template('browse.jinja2', title="Browse")
