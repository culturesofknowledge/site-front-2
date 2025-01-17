from flask import Blueprint, render_template

profile_bp = Blueprint('profile', __name__, url_prefix='/profile')

@profile_bp.route('/<collection>/<id>')
def profile(collection, id):
    return render_template('profile.jinja2', title="Profile", collection=collection, id=id)
