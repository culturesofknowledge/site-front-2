from flask import Blueprint, render_template

collections_bp = Blueprint('collections', __name__)

@collections_bp.route('/collections')
def collections():
    return render_template('collections.jinja2', title="Collections")
