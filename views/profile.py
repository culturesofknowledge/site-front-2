from flask import Blueprint, render_template, request
from .solr import solr_proxy

profile_bp = Blueprint('profile', __name__, url_prefix='/profile')

@profile_bp.route('/<collection>/<id>')
def profile(collection, id):
    solr_core = "people" if collection == "person" else f"{collection}s"

    solr_url = f'/{solr_core}/select?q=uuid:{id}&wt=json&rows=1&fl=uuid'  # Adjust if needed

    try:
        response_obj, status_code = solr_proxy(solr_url)
        
        if status_code == 200:
            return render_template('profile.jinja2', title=collection.capitalize(), collection=collection, id=id)
    except Exception as e:
        print("Exception occurred while querying Solr:", e)

    return render_template('data_not_found.jinja2', title="Data not found"), 404
