from flask import Blueprint, render_template, redirect, url_for, request

forms_bp = Blueprint('forms', __name__ , url_prefix='/forms')

@forms_bp.route('/', methods=['POST'])
def forms():
    people = request.form.get('people')
    dat_from_year = request.form.get('dat_from_year')
    dat_to_year = request.form.get('dat_to_year')
    locations = request.form.get('locations')
    let_con = request.form.get('let_con')

    # Construct the query parameters
    query_params = {}
    if people:
        query_params['people'] = people
    if dat_from_year:
        query_params['dat_from_year'] = dat_from_year
    if dat_to_year:
        query_params['dat_to_year'] = dat_to_year
    if locations:
        query_params['locations'] = locations
    if let_con:
        query_params['let_con'] = dat_from_year

    # Redirect to the new URL with query parameters
    return redirect(url_for('forms.results', **query_params))

@forms_bp.route('/results')
def results():
    people = request.args.get('people')
    locations = request.args.get('locations')

    print("Received query parameters: field1=")

    return render_template('/results.jinja2', title="Results" , people=people, locations=locations)
