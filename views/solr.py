from flask import Blueprint, jsonify, request
import requests
import os
from dotenv import load_dotenv
from urllib.parse import urljoin, urlencode

load_dotenv()

solr_bp = Blueprint("solr" ,__name__)

# External API endpoint you want to fetch data from
SOLR_URL = os.getenv('SOLR_URL')

if not SOLR_URL:
    raise ValueError("SOLR_URL environment variable is not set. Please configure it before starting the app.")

@solr_bp.route('/solr/<path:subpath>', methods=['GET'])  # Include methods you need
def solr_proxy(subpath):
    try:
        print(f"Got subpath as: {subpath}")
        # Construct the full URL for the external API request
        full_url =  urljoin(SOLR_URL, f"solr/{subpath}")    # Append the captured subpath

        # Convert query parameters to a query string for logging
        query_params = request.args.to_dict()
        query_string = urlencode(query_params)
        full_url_with_params = f"{full_url}?{query_string}" if query_string else full_url
        
        # Log the full URL with query parameters
        print(f"Requesting URL: {full_url_with_params}")

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
        return jsonify({"error": str(http_err)}), http_err.response.status_code
    except Exception as err:
        print(f"Got error: {err}")
        return jsonify({"error": str(err)}), 500

