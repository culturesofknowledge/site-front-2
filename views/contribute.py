from flask import Blueprint, render_template, redirect
import os
from dotenv import load_dotenv

contribute_bp = Blueprint('contribute', __name__)

load_dotenv()

PORTAL_URL = os.getenv("PORTAL_URL")

@contribute_bp.route('/contribute')
def contribute():
    return redirect(PORTAL_URL + "collections/?page_id=913", code=302)
    #return render_template('contribute.jinja2', title="Contribute")
