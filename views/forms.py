from flask import Blueprint, render_template, redirect, url_for, request

forms_bp = Blueprint('forms', __name__ , url_prefix='/forms')

@forms_bp.route('/', methods=['POST'])
def forms():
    dat_from_year = request.form.get('dat_from_year')
    dat_to_year = request.form.get('dat_to_year')
    locations = request.form.get('locations')
    let_con = request.form.get('let_con')

    # Handle dynamic fields
    filter_data = []
    for key, value in request.form.items():
        if key.startswith("filter_type_"):
            index = key.split("_")[-1]
            filter_type = value
            filter_value = request.form.get(f"filter_value_{index}")
            if filter_value:
                filter_data.append((filter_type, filter_value))

    print(f"{request.form.items()}")

    # Construct the query parameters
    query_params = {}
    if dat_from_year and dat_from_year != "all years":
        query_params["dat_from_year"] = dat_from_year
    if dat_to_year and dat_from_year != "all years":
        query_params["dat_to_year"] = dat_to_year
    if locations and locations != "all places":
        query_params["locations"] = locations
    if let_con and let_con != "all content":
        query_params["let_con"] = let_con

    # Add dynamic fields to query parameters
    excluded_values = ["all people", "all sender", "all receiver", "all people mentioned"]
    for filter_type, filter_value in filter_data:
        if filter_value not in excluded_values:
            if filter_type not in query_params:
                query_params[filter_type] = []
            query_params[filter_type].append(filter_value)


    # Convert lists to query strings
    for key in query_params:
        if isinstance(query_params[key], list):
            query_params[key] = ",".join(query_params[key])

    # Redirect to the new URL with query parameters
    return redirect(url_for("forms.results", **query_params))


@forms_bp.route('/advance')
def results():
    return render_template('results.jinja2', title="Results")
