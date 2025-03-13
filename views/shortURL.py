from flask import Blueprint, jsonify, request, url_for, abort, redirect
import requests
from views.solr import getSolrURL

shortURL_bp = Blueprint("shortURL", __name__)

# Core mappings for each type
CORE_MAP = {
    "p": "people",  # Person Core
    "w": "works",     # Work Core
}

# Function to query Solr based on type and ID
def query_solr(core, solr_query):
    solr_url = f"{getSolrURL()}{core}/select?q={solr_query}&wt=json"  # Construct the full Solr URL

    params = {
        'q': solr_query,
        'fl': 'uuid',  # We're only interested in the uuid field
        'rows': 1,  # We only need the first result
        'start': 0
    }
    
    # Make Solr request
    response = requests.get(solr_url, params=params)

    return response.json() if response.status_code == 200 else None

@shortURL_bp.route('/<type>/<id>', methods=['GET'])
def index(type, id):
    # Check if the type exists in the core map
    if type in CORE_MAP:
        core = CORE_MAP[type]  # Get the core name based on type
        return redirect_function(type, id, core)
    else:
        return "Invalid type", 400
    
# Modular redirect functions for each type
def redirect_function(type, id, core):
    solr_query = f"dcterms_identifier-editi_:editi_{id}"
    solr_data = query_solr(core, solr_query)

    if solr_data is None:
        abort(404) 

    print(f"{type}")

    if solr_data and solr_data['response']['numFound'] > 0:
        uuid = solr_data['response']['docs'][0]['uuid']
        # Redirect to the appropriate profile URL based on type
        if type == "p":
            print(f"redirecting")
            return redirect(url_for('profile.profile',  collection="people", id=uuid), code=301)
        elif type == "w":
            return redirect(url_for('profile_work', uuid=uuid), code=301)
        elif type == "r":
            return redirect(url_for('profile_institution', uuid=uuid), code=301)
        elif type == "l":
            return redirect(url_for('profile_location', uuid=uuid), code=301)
    else:
        return f"{type.capitalize()} not found", 404
