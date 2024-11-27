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
        SOLR_URL = os.getenv('SOLR_URL', '')

        if not SOLR_URL:
            raise ValueError("SOLR_URL environment variable is not set. Please configure it before starting the app.")

        # Construct the full URL for the external API request
        # Append the captured subpath
        if not SOLR_URL.endswith("/"):
            SOLR_URL = SOLR_URL + "/"
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
