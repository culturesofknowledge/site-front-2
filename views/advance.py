from flask import Blueprint, render_template

advance_bp = Blueprint('advance', __name__)

@advance_bp.route('/advance')
def advance():
    return render_template('advance.jinja2', title="About")
