from flask import Blueprint, render_template, request

advance_bp = Blueprint('advance', __name__)

@advance_bp.route('/advance')
def advance():
    people = request.args.get('people')
    locations = request.args.get('locations')
    dat_from_year = request.args.get('dat_from_year' , 'all years')
    dat_to_year = request.args.get('dat_to_year' , 'all years')
    let_con = request.args.get('let_con')

    return render_template('advance.jinja2', title="Search +", 
                           people=people, 
                           locations=locations, 
                           dat_from_year=dat_from_year, 
                           dat_to_year=dat_to_year,
                           let_con=let_con)
