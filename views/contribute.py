from flask import Blueprint, render_template

contribute_bp = Blueprint('contribute', __name__)

@contribute_bp.route('/contribute')
def contribute():
    return render_template('contribute.jinja2', title="Contribute")
