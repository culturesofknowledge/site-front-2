from flask import Blueprint, render_template, request
import json

advance_bp = Blueprint('advance', __name__)

# Constants
START_YEAR = 1450
END_YEAR = 1861

MONTHS_MAP = {
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

LANGUAGES = [
    "Ancient Greek", "Basque", "Cornish", "Czech", "Danish", "Dutch", "English",
    "French", "German", "Hebrew", "Irish", "Italian", "Latin", "Old French",
    "Polish", "Scottish Gaelic", "Spanish", "Swedish", "Welsh"
]

DOCUMENT_TYPES = [
    "Digital copy", "Draft", "Extract", "Letter", "Manuscript copy", "Printed copy", "Other"
]

@advance_bp.route('/advanced')
def advance():
    # Default values for query parameters
    default_values = {
        'people': None,
        'people_roles' : None,
        'aut': None,
        'aut_roles' : None,
        'rec': None,
        'rec_roles' : None,
        'ment' : None,
        'ment_roles' : None,
        'locations': None,
        'pla_ment_name' : None,
        'pla_ori_name' : None,
        'pla_des_name' : None,
        'dat_from_year': 'all years',
        'dat_to_year': 'all years',
        'let_con': None,
        'let_pmark_tex' : None,
        'let_end_tex' : None,
        'let_with_en_tex' : None,
        'let_seal_tex' : None,
        'let_pap_typ_tex' : None,
        'let_pap_siz_tex' : None,
        'let_shel' : None,
        'let_pe_tex' : None,
    }

    lang_data = "static/data/language.json"

    try:
        with open(lang_data, "r", encoding="utf-8") as file:
            languages = json.load(file)

    except (FileNotFoundError, json.JSONDecodeError) as e:
        languages = []
        print(f"Error loading JSON: {e}")

    # Extract query parameters with defaults
    query_params = {key: request.args.get(key, default) for key, default in default_values.items()}

    # Add static and derived values to context
    context = {
        **query_params,
        'title': "Search +",
        'months_map': MONTHS_MAP,
        'start_year': START_YEAR,
        'end_year': END_YEAR,
        'languages': languages,
        'document_types': DOCUMENT_TYPES
    }

    # Render the template with the context
    return render_template('advance.jinja2', **context)
