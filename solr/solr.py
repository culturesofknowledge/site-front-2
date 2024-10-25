from flask import Blueprint, jsonify
import requests

solr_bp = Blueprint("solr" ,__name__)

# External API endpoint you want to fetch data from
EXTERNAL_API_URL = 'http://localhost:8983/solr/works/select?q=*:*&wt=json'  # Replace with the actual external API URL

@solr_bp.route('/proxy', methods=['GET'])
def proxy():
    try:
        # Fetch data from the external API
        response = requests.get(EXTERNAL_API_URL)
        print("making request")
        # Raise an error if the external request failed
        response.raise_for_status()

        # Optionally, you can process the response data here
        data = response.json()  # Assuming the response is in JSON format

        # Return the data as a JSON response
        return jsonify(data), 200

    except requests.exceptions.HTTPError as http_err:
        return jsonify({"error": str(http_err)}), http_err.response.status_code
    except Exception as err:
        print(f"got errpr {err}")
        return jsonify({"error": str(err)}), 500

