from flask import Blueprint, jsonify, request
import requests
import os
from dotenv import load_dotenv
from urllib.parse import urljoin

load_dotenv()

solr_bp = Blueprint("solr" ,__name__)

# External API endpoint you want to fetch data from
SOLR_URL = os.getenv('SOLR_URL')

if not SOLR_URL:
    raise ValueError("SOLR_URL environment variable is not set. Please configure it before starting the app.")

@solr_bp.route('/solr/<path:subpath>', methods=['GET'])  # Include methods you need
def solr_proxy(subpath):
    try:
        # Construct the full URL for the external API request
        full_url =  urljoin(SOLR_URL, "solr", subpath)  # Append the captured subpath

        # Forward the request to the external API
        response = requests.request(
            method=request.method,  # Forward the original request method
            url=full_url,
            headers={key: value for key, value in request.headers if key != 'Host'},  # Forward headers
            params=request.args  # Forward query parameters
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

