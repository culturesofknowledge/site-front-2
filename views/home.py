from flask import Blueprint, render_template, jsonify
import requests
import json

home_bp = Blueprint('home', __name__)


@home_bp.route('/')
def home():
    catalogue_data = "static/data/catalogue.json"
    variables = "static/data/variable.json"

    try:
        with open(catalogue_data, "r", encoding="utf-8") as file:
            data = json.load(file)
        
        with open(variables, "r", encoding="utf-8") as file:
            var_data = json.load(file)
        
        # Count the length of each array in the JSON
        catalogue_count = sum(len(value) for value in data.values() if isinstance(value, list))
        image_limit = var_data.get("image_limit")

    except (FileNotFoundError, json.JSONDecodeError) as e:
        catalogue_count = 0
        image_limit = 0
        print(f"Error loading JSON: {e}")
    return render_template('home.jinja2', title="Home" , catalogue_count = catalogue_count , image_limit=image_limit)

@home_bp.route('/catalogues')
def load_catalogues():
    api_url = "http://emlo-portal.bodleian.ox.ac.uk/collections/?json_route=/posts&type[]=catalogue&type[]=post&filter[orderby]=data&filter[order]=DESC&filter[posts_per_page]=3"
    response = requests.get(api_url)
    if response.status_code == 200:
        return jsonify(response.json())  # Return API data as JSON
    else:
        return jsonify({"error": "Failed to fetch data"}), 500