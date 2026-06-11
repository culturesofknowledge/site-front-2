from flask import Blueprint, render_template, abort, redirect , url_for
from .solr import check_profile

profile_bp = Blueprint('profile', __name__, url_prefix='/profile')

# Aliases that must redirect to their canonical collection name.
# Institution-related aliases all redirect to "repository" since that term
# replaced "institution" in this site.
COLLECTION_ALIASES = {
    "works": "work",
    "institution": "repository",
    "institutions": "repository",
    "repositories": "repository",
    "repositorys": "repository",
    "locations": "location",
    "places": "location",
    "place": "location",
    "images": "image",
    "manifestations": "manifestation",
    "people": "person",
    "persons": "person",
    "resources": "resource",
}

@profile_bp.route('/<collection>/<id>')
def profile(collection, id):

    canonical = COLLECTION_ALIASES.get(collection)
    if canonical:
        return redirect(url_for("profile.profile", collection=canonical, id=id), code=301)

    solr_core = (
        "people" if collection == "person"
        else "institutions" if collection == "repository"
        else f"{collection}s"
    )

    pageTitle = collection.capitalize()

    try:
        is_valid , is_organisation = check_profile(solr_core , id)

        if is_valid:
            if is_organisation:
                pageTitle = "Organization"
            return render_template('profile.jinja2', title=pageTitle, collection=collection, id=id)
    except Exception as e:
        print("Exception occurred while querying Solr:", e)

    abort(404)
