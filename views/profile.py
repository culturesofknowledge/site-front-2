from flask import Blueprint, render_template, request
from .solr import check_profile

profile_bp = Blueprint('profile', __name__, url_prefix='/profile')

@profile_bp.route('/<collection>/<id>')
def profile(collection, id):
    solr_core = "people" if collection == "person" else f"{collection}s"

    try:
        is_valid = check_profile(solr_core , id)
        
        if is_valid:
            return render_template('profile.jinja2', title=collection.capitalize(), collection=collection, id=id)
    except Exception as e:
        print("Exception occurred while querying Solr:", e)

    return render_template('data_not_found.jinja2', title="Data not found"), 404
