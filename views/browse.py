from flask import Blueprint, render_template, redirect, url_for, request

browse_bp = Blueprint('browse', __name__ , url_prefix='/browse')

@browse_bp.route('/')
def browse():
    return redirect(url_for('browse.people'))

@browse_bp.route('/people')
def people():
    letter = request.args.get('letter', '').lower()
    return render_template('/pages/browse/people.jinja2', title="Browse:People" , letter=letter)

@browse_bp.route('/locations')
def locations():
    letter = request.args.get('letter', '').lower()
    return render_template('/pages/browse/locations.jinja2', title="Browse:Locations" , letter=letter)

@browse_bp.route('/organisations')
def organisations():
    return render_template('/pages/browse/organisations.jinja2', title="Browse:Organisations")

@browse_bp.route('/institutions')
def institutions():
    return render_template('/pages/browse/institutions.jinja2', title="Browse:Institutions")

@browse_bp.route('/works')
def works():
    return render_template('/pages/browse/works.jinja2', title="Browse:Works")