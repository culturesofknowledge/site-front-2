from flask import Blueprint, render_template, redirect
import os
from dotenv import load_dotenv

about_bp = Blueprint('about', __name__)

load_dotenv()

PORTAL_URL = os.getenv("PORTAL_URL")

@about_bp.route('/about')
def about():
    return redirect(PORTAL_URL + "collections/?page_id=907", code=302)
    #return render_template('about.jinja2', title="About")
