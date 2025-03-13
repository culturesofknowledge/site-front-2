from flask import Blueprint, render_template

profile_bp = Blueprint('profile', __name__, url_prefix='/profile')

@profile_bp.route('/<collection>/<id>')
def profile(collection, id):
    print(f"Got collection name as: {collection}")
    return render_template('profile.jinja2', title=collection.capitalize(), collection=collection, id=id)
