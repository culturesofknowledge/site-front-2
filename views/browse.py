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
    letter = request.args.get('letter', '').lower()
    return render_template('/pages/browse/organisations.jinja2', title="Browse:Organisations", letter=letter)

@browse_bp.route('/institutions')
def institutions():
    return render_template('/pages/browse/institutions.jinja2', title="Browse:Institutions")

@browse_bp.route('/works')
def works():
    current_year = request.args.get('year', default=1600, type=int)
    current_decade = (current_year // 10) * 10

    years_range = range(current_decade, current_decade + 10)
    
    return render_template('/pages/browse/works.jinja2', title="Browse:Works" ,current_year=current_year, current_decade=current_decade, years_range=years_range)