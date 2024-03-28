import json

from flask import Blueprint, render_template, redirect, url_for, request

from site_front_2.datasrc import solr_serv, fieldmap
from site_front_2.flaskapp.filters import browse_filters

bp = Blueprint('browse', __name__)
bp.add_app_template_filter(browse_filters.create_filter_values, 'create_filter_values')

BROWSE_NAME_PEOPLE = 'People'


def create_browse_pages_data():
    browse_pages = [
        {'name': BROWSE_NAME_PEOPLE, 'url': url_for('browse.people'),
         'image_url': url_for('static', filename='img/icon-stats-people.png')},
        {'name': 'Locations', 'url': url_for('browse.locations'),
         'image_url': url_for('static', filename='img/icon-stats-locations.png')},
        {'name': 'Organisations', 'url': url_for('browse.organisations'),
         'image_url': url_for('static', filename='img/icon-stats-organisations.png')},
        {'name': 'Repositories', 'url': url_for('browse.repositories'),
         'image_url': url_for('static', filename='img/icon-stats-repositories.png')},
        {'name': 'Years', 'url': url_for('browse.years'),
         'image_url': url_for('static', filename='img/icon-stats-calendar.png')}
    ]
    return browse_pages


def get_people_rows(browse, is_org, sort='browse asc', n_rows=1000):
    q = f"""
    {fieldmap.get_is_organisation_fieldname()}:{solr_serv.true_false(is_org)} AND
    browse:{browse} AND (
    {fieldmap.get_total_works_written_by_agent_fieldname()}:[1 TO *] OR
    {fieldmap.get_total_works_recd_by_agent_fieldname()}:[1 TO *] OR
    {fieldmap.get_total_works_mentioning_agent_fieldname()}:[1 TO *] 
    )
    """

    sol = solr_serv.conn('people')
    sol_response = sol.search(q, rows=n_rows, sort=sort)
    return sol_response


@bp.route('/')
def home():
    return redirect(url_for('browse.people'))


@bp.route('/people')
def people():
    letter = request.args.get('letter', 'a')

    rows = list(get_people_rows(f'{letter}*', is_org=False))
    for row in rows:
        print(json.dumps(row, indent=4))

    browse_pages = create_browse_pages_data()
    cur_browse_name = BROWSE_NAME_PEOPLE
    return render_template(
        'browse.jinja2',
        cur_browse_page=next(b for b in browse_pages if b['name'] == cur_browse_name),
        browse_pages=browse_pages,
        rows=rows,
        cur_letter=letter,
    )


@bp.route('/locations')
def locations():
    pass


@bp.route('/organisations')
def organisations():
    pass


@bp.route('/repositories')
def repositories():
    pass


@bp.route('/years')
def years():
    pass
