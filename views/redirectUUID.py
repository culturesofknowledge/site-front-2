from flask import Blueprint, url_for, request, redirect, render_template
import requests
from views.solr import getSolrURL

redirect_uuid_bp = Blueprint("redirect_uuid", __name__)

# Function to query Solr based on type and ID
def query_solr(solr_query):
    solr_url = f"{getSolrURL()}all/select?q={solr_query}&wt=json"  # Construct the full Solr URL

    params = {
        'q': solr_query,
        'fl': 'object_type',  # We're only interested in the uuid field
        'rows': 1,  # We only need the first result
        'start': 0
    }
    
    # Make Solr request
    response = requests.get(solr_url, params=params)
    return response.json() if response.status_code == 200 else None

@redirect_uuid_bp.route('/<id>', methods=['GET'])
def index(id):
    solr_query = f"uuid:{id}"
    solr_data = query_solr(solr_query)

    if solr_data is None or solr_data['response']['numFound'] == 0:
        return render_template('page_not_found.jinja2', title="Page not found" , base_url=request.host_url), 404

    object_type = solr_data['response']['docs'][0]['object_type']


    if object_type == "institution":
        object_type = "repository"

    return redirect(url_for("profile.profile", collection=object_type, id=id), code=301)
