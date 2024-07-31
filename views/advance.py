from flask import Blueprint, render_template, request

advance_bp = Blueprint('advance', __name__)

@advance_bp.route('/advance')
def advance():
    people = request.args.get('people')
    locations = request.args.get('locations')

    return render_template('advance.jinja2', title="Search +", people=people, locations=locations)
