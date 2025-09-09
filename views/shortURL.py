from flask import Blueprint, jsonify, request, url_for, abort, redirect, render_template
import requests
from views.solr import getSolrURL

shortURL_bp = Blueprint("shortURL", __name__)

# Core mappings for each type
CORE_MAP = {
    "p": "people",  # Person Core
    "w": "works",     # Work Core
    "r": "institutions",  # Institution Core
    "l": "locations",  # Location Core
    "i" : "images",
    "c" : "comments",
    "re" : "resources", 
    "m" : "manifestations"
}

# Solr query patterns for each type
QUERY_MAP = {
    "p": lambda id: f"dcterms_identifier-editi_:editi_{id}",  # Person query pattern
    "w": lambda id: f"dcterms_identifier-editi_:editi_{id}",  # Work query pattern (can change based on actual query structure)
    "r": lambda id: f"dcterms_identifier-edit_:edit_cofk_union_institution-{id}",  # Institution query pattern (adjust as needed)
    "l": lambda id: f"dcterms_identifier-edit_:edit_cofk_union_location-{id}",  # Location query pattern (adjust as needed)
    "i" : lambda id : f"dcterms_identifier-edit_:edit_cofk_union_image-{id}",
    "c" : lambda id : f"dcterms_identifier-edit_:edit_cofk_union_comment-{id}",
    "re" : lambda id : f"dcterms_identifier-edit_:edit_cofk_union_resource-{id}",
    "m": lambda id: f'dcterms_identifier-edit_:\"edit_cofk_union_manifestation-cofk_edit_interface-iwork_id:{id}\"'
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
    print(f"solr_url {solr_url}")
    return response.json() if response.status_code == 200 else None

# URL mappings for redirection
REDIRECT_COLLECTION_MAP = {
    "p": "person",  # Person profile
    "w": "work",     # Work profile
    "r": "repository",  # Institution profile
    "l": "location",  # Location profile
    "i" : "image",
    "c" : "comment",
    "re" : "resource",
    "m" : "manifestation"
}

@shortURL_bp.route('/<type>/<id>', methods=['GET'])
def index(type, id):
    # Check if the type exists in the core map
    if type not in CORE_MAP:
        return render_template('data_not_found.jinja2', title="Data not found"), 404
    
    # Special case for type 'm'
    if type == 'm' and 2 <= len(id) <= 10:
        # Append leading zeros to make id length 10
        id = id.zfill(10)

    core = CORE_MAP[type]  # Get the core name based on type
    return redirect_function(type, id, core)

# Modular redirect functions for each type
def redirect_function(type, id, core):
    # Generate the query based on the type
    if type not in QUERY_MAP:
        return "Invalid query pattern", 400
    solr_query = QUERY_MAP[type](id)
    
    solr_data = query_solr(core, solr_query)

    if solr_data is None or solr_data['response']['numFound'] == 0:
        return f"{type.capitalize()} not found", 404

    uuid = solr_data['response']['docs'][0]['uuid']

    collection = REDIRECT_COLLECTION_MAP.get(type)

    if collection:
        return redirect(url_for("profile.profile", collection=collection, id=uuid), code=301)
    else:
        return render_template('data_not_found.jinja2', title="Data not found"), 404
