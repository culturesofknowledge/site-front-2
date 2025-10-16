from flask import Blueprint, render_template, jsonify, send_from_directory
import requests
import json
import os

home_bp = Blueprint('home', __name__)


@home_bp.route('/')
@home_bp.route('/home')
def home():
    catalogue_data = "static/data/catalogue.json"
    variables = "static/data/variable.json"

    try:
        with open(catalogue_data, "r", encoding="utf-8") as file:
            data = json.load(file)
        
        with open(variables, "r", encoding="utf-8") as file:
            var_data = json.load(file)
        
        # Count the length of each array in the JSON
        curated = data.get("curated")
        starter = data.get("starter")
        # catalogue_count = sum(len(value) for value in data.values() if isinstance(value, list))
        image_limit = var_data.get("image_limit")
        
    except (FileNotFoundError, json.JSONDecodeError) as e:
        # catalogue_count = 0
        starter = 0
        curated = 0
        image_limit = 0
        print(f"Error loading JSON: {e}")
    return render_template('home.jinja2', title="Home" , curated = len(curated) , starter = len(starter), image_limit=image_limit)


@home_bp.route('/catalogues')
def load_catalogues():
    api_url = "http://emlo-portal.bodleian.ox.ac.uk/collections/?json_route=/posts&type[]=catalogue&type[]=post&filter[orderby]=data&filter[order]=DESC&filter[posts_per_page]=3"
    response = requests.get(api_url)
    if response.status_code == 200:
        return jsonify(response.json())  # Return API data as JSON
    else:
        return jsonify({"error": "Failed to fetch data"}), 500


@home_bp.route('/img/<filename>')
@home_bp.route('/images/<filename>')
def img(filename):
    """Serve stock images"""
    return send_from_directory(os.path.join('static', 'img'), filename)
