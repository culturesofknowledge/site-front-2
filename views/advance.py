from flask import Blueprint, render_template, request

advance_bp = Blueprint('advance', __name__)

@advance_bp.route('/advance')
def advance():
    people = request.args.get('people')
    locations = request.args.get('locations')
    dat_from_year = request.args.get('dat_from_year' , 'all years')
    dat_to_year = request.args.get('dat_to_year' , 'all years')
    let_con = request.args.get('let_con')

    start_year = 1500
    end_year = 1841
    months_map = {
        "January": "01",
        "February": "02",  
        "March": "03",
        "April": "04",
        "May": "05",
        "June": "06",
        "July": "07",
        "August": "08",
        "September": "09",
        "October": "10",
        "November": "11",
        "December": "12"
    }

    return render_template('advance.jinja2', title="Search +", 
                           people=people, 
                           locations=locations, 
                           dat_from_year=dat_from_year, 
                           dat_to_year=dat_to_year,
                           let_con=let_con,
                           months_map=months_map,
                           start_year=start_year,
                           end_year=end_year)
