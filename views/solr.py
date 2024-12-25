from flask import Blueprint, jsonify, request
import requests
import os
from dotenv import load_dotenv
from urllib.parse import urlencode

load_dotenv()

solr_bp = Blueprint("solr", __name__)

@solr_bp.route('/solr/<path:subpath>', methods=['GET'])  # Include methods you need
def solr_proxy(subpath):
    try:
        SOLR_URL = getSolrURL()

        subpath = subpath.lstrip('/')
        full_url = SOLR_URL + subpath

        query_string = request.query_string.decode("utf-8")
        full_url_with_params = f"{full_url}?{query_string}"

        # Make the request to the external Solr API, including query parameters
        response = requests.request(
            method=request.method,
            url=full_url_with_params
        )

        # Raise an error if the external request failed
        response.raise_for_status()

        # Return the data as a JSON response
        return jsonify(response.json()), response.status_code

    except requests.exceptions.HTTPError as http_err:
        print(f"Got HTTP error: {http_err}")
        return jsonify({"error": str(http_err)}), http_err.response.status_code
    except Exception as err:
        print(f"Got error: {err}")
        return jsonify({"error": str(err)}), 500
    
@solr_bp.route('/stats', methods=['POST'])  # Include methods you need
def fetchStats():
    try:

        SOLR_URL = getSolrURL()

        # Get data from the request
        data = request.json
        solr_core = data.get('solrCore')
        uuids = data.get('uuids', [])
        filter_query = data.get('filter', '')

        if not solr_core or not uuids:
            return jsonify({'error': 'solrCore and uuids are required'}), 400

        # Construct the Solr query
        uuid_query = ' OR '.join([f'{uuid}' for uuid in uuids])

        solr_query = f'uuid:({uuid_query})'

        if filter_query:
            solr_query += f' AND ({filter_query})'

        solr_url = f'{SOLR_URL}{solr_core}s/select'
        params = {
            'q': solr_query,
            'wt': 'json',
            'rows': len(uuids)  # Assuming you want a result for each UUID
        }

        # Make the request to Solr
        response = requests.get(solr_url, params=params)
        response.raise_for_status()

        # Return Solr response
        solr_data = response.json()
        return jsonify(solr_data)

    except requests.RequestException as e:
        return jsonify({'error': 'Error fetching data from Solr', 'details': str(e)}), 500
    except Exception as e:
        return jsonify({'error': 'Internal Server Error', 'details': str(e)}), 500
    

# Function to handle the solr url for each API call. 
# Todo: we can store solr URL in global variable instead of making call to multiple times to env file.
def getSolrURL():
    solr_url = os.getenv('SOLR_URL', '')

    if not solr_url:
        raise ValueError("SOLR_URL environment variable is not set. Please configure it before starting the app.")

    # Construct the full URL for the external API request
    # Append the captured subpath
    if not solr_url.endswith("/"):
        solr_url = solr_url + "/"
    
    return solr_url