from flask import Blueprint, render_template, redirect, url_for

browse_bp = Blueprint('browse', __name__ , url_prefix='/browse')

@browse_bp.route('/')
def browse():
    return redirect(url_for('browse.people'))

@browse_bp.route('/people')
def people():
    return render_template('/pages/browse/people.jinja2', title="Browse:People")

@browse_bp.route('/location')
def location():
    return render_template('/pages/browse/location.jinja2', title="Browse:Location")