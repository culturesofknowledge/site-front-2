from flask import Blueprint, render_template, redirect, url_for, request

browse_bp = Blueprint('browse', __name__ , url_prefix='/browse')


@browse_bp.route('/')
def browse():
    return redirect(url_for('browse.people'))


@browse_bp.route('/people')
def people():
    # Check if 'filter' is in the query string; if not, append it automatically
    filter_param = request.args.get('filters', None)

    # If filter is not present, add it with a default value (you can customize this value)
    if not filter_param:
        # Redirect with the filter query appended, this ensures the 'filter' param is always present
        return redirect(url_for('browse.people', **{**request.args, 'filters': 'fe,ma,un,re,wr,me'}))
    
    letter = request.args.get('letter', '').lower()
    return render_template('/pages/browse/people.jinja2', title="Browse: People" , letter=letter , filters=filter_param)


@browse_bp.route('/locations')
def locations():
    # Check if 'filter' is in the query string; if not, append it automatically
    filter_param = request.args.get('filters', None)

    # If filter is not present, add it with a default value (you can customize this value)
    if not filter_param:
        # Redirect with the filter query appended, this ensures the 'filter' param is always present
        return redirect(url_for('browse.locations', **{**request.args, 'filters': 'fe,ma,un,re,wr,me'}))
    
    letter = request.args.get('letter', '').lower()
    return render_template('/pages/browse/locations.jinja2', title="Browse: Locations" , letter=letter, filters=filter_param)


@browse_bp.route('/organizations')
def organisations():
     # Check if 'filter' is in the query string; if not, append it automatically
    filter_param = request.args.get('filters', None)

    # If filter is not present, add it with a default value (you can customize this value)
    if not filter_param:
        # Redirect with the filter query appended, this ensures the 'filter' param is always present
        return redirect(url_for('browse.organisations', **{**request.args, 'filters': 'fe,ma,un,re,wr,me'}))
    
    letter = request.args.get('letter', '').lower()
    return render_template('/pages/browse/organisations.jinja2', title="Browse: Organizations", letter=letter, filters=filter_param)


@browse_bp.route('/repositories')
def institutions():
    return render_template('/pages/browse/institutions.jinja2', title="Browse: Repositories")


@browse_bp.route('/works')
def works():
    current_year = request.args.get('year', default=1600, type=int)
    current_decade = (current_year // 10) * 10

    years_range = range(current_decade, current_decade + 10)
    
    return render_template('/pages/browse/works.jinja2', title="Browse: Works" ,current_year=current_year, current_decade=current_decade, years_range=years_range)