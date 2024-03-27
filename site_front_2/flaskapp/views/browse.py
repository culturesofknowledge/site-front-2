import json

from flask import Blueprint, render_template, redirect, url_for

from site_front_2.datasrc import solr_serv

bp = Blueprint('browse', __name__)

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


def get_people_rows():
    sol = solr_serv.conn('people')
    sol_response = sol.search("*:*", rows=1000)
    return sol_response


@bp.route('/')
def home():
    return redirect(url_for('browse.people'))


@bp.route('/people')
def people():
    rows = list(get_people_rows())
    for row in rows:
        print(json.dumps(row, indent=4))
    return render_template(
        'browse.jinja2',
        cur_browse_name=BROWSE_NAME_PEOPLE,
        browse_pages=create_browse_pages_data(),
        rows=rows,
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
