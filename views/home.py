from flask import Blueprint, render_template, jsonify
import requests

home_bp = Blueprint('home', __name__)


@home_bp.route('/')
def home():
    return render_template('home.jinja2', title="Home")

@home_bp.route('/catalogues')
def load_catalogues():
    api_url = "http://emlo-portal.bodleian.ox.ac.uk/collections/?json_route=/posts&type[]=catalogue&type[]=post&filter[orderby]=data&filter[order]=DESC&filter[posts_per_page]=3"
    response = requests.get(api_url)
    if response.status_code == 200:
        return jsonify(response.json())  # Return API data as JSON
    else:
        return jsonify({"error": "Failed to fetch data"}), 500