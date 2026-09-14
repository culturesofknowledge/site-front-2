from flask import Blueprint, jsonify, request
import requests
import os
from concurrent.futures import ThreadPoolExecutor, as_completed
from dotenv import load_dotenv
from urllib.parse import urlparse

load_dotenv()

solr_bp = Blueprint("solr", __name__)

# Fields that hold a person's/location's own full correspondence list —
# e.g. a prolific letter-writer's `mail_recipientOf-work` can be hundreds of
# KB of work URIs on its own. The profile UI renders these only from the
# *primary* record's own tableData (see people.js / location.js
# tableDataFields and their _renderLetters* functions) — never off an entry
# in a "relations" / "related images" list. Stripping them there is a
# byte-for-byte no-op for every page that reads this response; see
# [[perf_edges_bundle_refactor]] memory for how this was verified.
_BULK_CORRESPONDENCE_FIELDS = {
    "uuid_related",
    "frbr_creatorOf-work",
    "mail_recipientOf-work",
    "mail_originOf-work",
    "mail_destinationOf-work",
    "dcterms_isReferencedBy-work",
}


def _strip_bulk_correspondence_fields(solr_json):
    """Drop _BULK_CORRESPONDENCE_FIELDS from every doc in a Solr response, in place."""
    for doc in solr_json.get("response", {}).get("docs", []):
        for field in _BULK_CORRESPONDENCE_FIELDS:
            doc.pop(field, None)
    return solr_json


def _proxy_to_solr(subpath):
    """GET-and-forward to Solr, preserving the incoming query string
    byte-for-byte. Raises requests.HTTPError / other exceptions — callers
    translate those to a JSON error response."""
    SOLR_URL = getSolrURL()
    full_url = SOLR_URL + subpath.lstrip('/')
    query_string = request.query_string.decode("utf-8")

    response = requests.request(method=request.method, url=f"{full_url}?{query_string}")
    response.raise_for_status()
    return response


def _solr_route(handler):
    """Runs `handler()` -> (json_body, status_code) and turns a Solr/network
    failure into the JSON error shape every route here has always returned."""
    try:
        body, status = handler()
        return jsonify(body), status
    except requests.exceptions.HTTPError as http_err:
        print(f"Got HTTP error: {http_err}")
        return jsonify({"error": str(http_err)}), http_err.response.status_code
    except Exception as err:
        print(f"Got error: {err}")
        return jsonify({"error": str(err)}), 500


# GET /solr/all/select and /solr/images/select are matched by Flask before
# the generic /solr/<path:subpath> proxy below (a static rule always wins
# over a <path:...> one). Both cores are queried with `q=uuid_related:{uuid}`
# by static/js/edges.js (_fetchRelations / _fetchImages) to build a profile
# page's "relations" / related-images list — a request that measured up to
# ~13 MB for a single popular record because Solr returns full documents
# with no `fl` restriction. Any *other* caller (e.g. the home/search "search
# everything" collection, which also targets /solr/all/select) keeps
# identical behaviour: fields are only stripped when the query matches that
# exact uuid_related pattern and the caller didn't already ask for specific
# fields via `fl`.
def _uuid_related_select(subpath):
    response = _proxy_to_solr(subpath)
    body = response.json()

    q = request.args.get('q', '')
    if q.startswith('uuid_related:') and 'fl' not in request.args:
        body = _strip_bulk_correspondence_fields(body)

    return body, response.status_code


@solr_bp.route('/solr/all/select', methods=['GET'])
def solr_all_select():
    return _solr_route(lambda: _uuid_related_select('all/select'))


@solr_bp.route('/solr/images/select', methods=['GET'])
def solr_images_select():
    return _solr_route(lambda: _uuid_related_select('images/select'))


@solr_bp.route('/solr/<path:subpath>', methods=['GET'])  # Include methods you need
def solr_proxy(subpath):
    def call():
        response = _proxy_to_solr(subpath)
        return response.json(), response.status_code

    return _solr_route(call)

# Only used internally 
# def check_profile(collection_name , uuid):
#     try:
#         # Check for empty or None inputs
#         if not collection_name or not uuid:
#             print("Invalid input: collection_name or uuid is empty.")
#             return False

#         SOLR_URL = getSolrURL()

#         solr_url = f'{collection_name}/select?q=uuid:{uuid}&wt=json&rows=1&fl=uuid'
#         full_url = SOLR_URL + solr_url

#         response = requests.get(full_url)
#         response.raise_for_status()

#         if response.status_code == 200:
#             data = response.json()
#             if data.get("response", {}).get("numFound", 0) > 0:
#                 return True
#             else:
#                 return False

#         return False

#     except requests.exceptions.HTTPError as http_err:
#         print(f"Got HTTP error: {http_err}")
#         return False
#     except Exception as err:
#         print(f"Got error: {err}")
#         return False

def check_profile(collection_name, uuid):
    try:
        # Check for empty or None inputs
        if not collection_name or not uuid:
            print("Invalid input: collection_name or uuid is empty.")
            return (False, False)

        SOLR_URL = getSolrURL()
        
        # Query both uuid and ox_isOrganisation fields
        solr_url = f'{collection_name}/select?q=uuid:{uuid}&wt=json&rows=1&fl=uuid,ox_isOrganisation'
        full_url = SOLR_URL + solr_url

        response = requests.get(full_url)
        response.raise_for_status()

        if response.status_code == 200:
            data = response.json()
            docs = data.get("response", {}).get("docs", [])
            if docs:
                doc = docs[0]
                # If field is missing, return False as value
                is_organisation = bool(doc.get('ox_isOrganisation', False))
                return (True, is_organisation)
            else:
                # Document not found
                return (False, False)

        return (False, False)

    except requests.exceptions.HTTPError as http_err:
        print(f"Got HTTP error: {http_err}")
        return (False, False)
    except Exception as err:
        print(f"Got error: {err}")
        return (False, False)
    

def _stats_new_lookup(solr_core, uuids, object_key='uuid', filter_query=''):
    """Batched uuid-list lookup: the logic /stats-new exposes over HTTP,
    factored out so /profile-data/<collection>/<uuid> can call it directly
    (no HTTP hop) for a profile's tableData fields."""
    SOLR_URL = getSolrURL()
    batch_size = 100
    batches = [uuids[i:i + batch_size] for i in range(0, len(uuids), batch_size)]
    all_results = []

    for batch in batches:
        uuid_query = ' OR '.join(f'"{u}"' for u in batch)
        solr_query = f'{object_key}:({uuid_query})'
        core = f"{solr_core}s" if solr_core not in ["people", "all"] else solr_core
        response = requests.get(
            f'{SOLR_URL}{core}/select',
            params={'q': solr_query, 'wt': 'json', 'rows': len(batch), 'fl': filter_query},
        )
        response.raise_for_status()
        all_results.extend(response.json().get('response', {}).get('docs', []))

    return all_results


@solr_bp.route('/stats-new', methods=['POST'])
def fetchStatsNew():
    try:
        data = request.json
        solr_core = data.get('solrCore')
        uuids = data.get('uuids', [])
        objectKey = data.get('objectKey', 'uuid')
        filter_query = data.get('filter', '')

        if not solr_core or not uuids:
            return jsonify({'error': 'solrCore and uuids are required'}), 400

        return jsonify(_stats_new_lookup(solr_core, uuids, objectKey, filter_query))

    except requests.RequestException as e:
        return jsonify({'error': 'Error fetching data from Solr', 'details': str(e)}), 500
    except Exception as e:
        return jsonify({'error': 'Internal Server Error', 'details': str(e)}), 500


def _collection_year_data(institution_uuid):
    """Two-step server-side join: institution UUID → manifestation UUIDs →
    work year data. Avoids sending tens of thousands of UUIDs from the
    browser (which hits nginx body size limits). Factored out so
    /profile-data/<collection>/<uuid> can call it directly (no HTTP hop)."""
    SOLR_URL = getSolrURL()

    # Step 1: get all manifestation UUIDs related to this institution
    mani_resp = requests.get(
        f"{SOLR_URL}manifestations/select",
        params={'q': f'uuid_related:{institution_uuid}', 'fl': 'uuid', 'rows': 200000, 'wt': 'json'}
    )
    mani_resp.raise_for_status()
    mani_uuids = [doc['uuid'] for doc in mani_resp.json().get('response', {}).get('docs', [])]

    if not mani_uuids:
        return []

    # Step 2: query works by those manifestation UUIDs in parallel batches.
    # Use POST to Solr to avoid URL length limits with large UUID sets.
    BATCH_SIZE = 100

    def fetch_batch(batch):
        uuid_query = ' OR '.join([f'"{u}"' for u in batch])
        resp = requests.post(
            f"{SOLR_URL}works/select",
            data={
                'q': f'uuid_related:({uuid_query})',
                'fl': 'ox_started-ox_year,ox_completed-ox_year,uuid,dcterms_description',
                'rows': BATCH_SIZE,
                'wt': 'json'
            }
        )
        resp.raise_for_status()
        return resp.json().get('response', {}).get('docs', [])

    all_results = []
    batches = [mani_uuids[i:i + BATCH_SIZE] for i in range(0, len(mani_uuids), BATCH_SIZE)]
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(fetch_batch, b) for b in batches]
        for future in as_completed(futures):
            all_results.extend(future.result())

    # A work can have manifestations that fall into different batches above,
    # so the same work doc can come back more than once. Dedupe by uuid.
    return list({doc['uuid']: doc for doc in all_results}.values())


@solr_bp.route('/collection-year-data/<institution_uuid>', methods=['GET'])
def fetchCollectionYearData(institution_uuid):
    try:
        return jsonify(_collection_year_data(institution_uuid))
    except Exception as e:
        return jsonify({'error': 'Internal Server Error', 'details': str(e)}), 500


@solr_bp.route('/result-enrichment', methods=['POST'])
def fetchResultEnrichment():
    """
    Bulk manifestation -> institution enrichment for the search-results table
    ("Repositories & Versions" column).

    Replaces the old behaviour of ~1-2 /stats-new calls PER RESULT ROW
    (≈60 requests for a 50-row page) with ONE request that runs two batched
    Solr queries server-side.

    Body:    { "manifestation_uuids": ["<uuid>", ...] }
    Returns: { "<manifestation_uuid>": { "dcterms_type": <raw>,
                                         "shelf": <raw shelf_ value>,
                                         "repoName": <geonames_officialName> } }
             Keys are omitted when the underlying field is absent, mirroring the
             old client-side hasOwnProperty checks. All formatting
             (stripValuePrefix, bullet list) stays in the browser so output is
             byte-identical to the previous implementation.
    """
    try:
        SOLR_URL = getSolrURL()

        data = request.get_json(silent=True) or {}
        mani_uuids = data.get('manifestation_uuids', [])
        if not mani_uuids:
            return jsonify({})

        # dedupe, preserve order
        mani_uuids = list(dict.fromkeys(u for u in mani_uuids if u))

        def _first(v):
            """Solr multi-valued fields come back as lists; the old code used the raw value."""
            if isinstance(v, list):
                return v[0] if v else None
            return v

        def _as_list(v):
            if v is None:
                return []
            return v if isinstance(v, list) else [v]

        def solr_by_uuid(core, values, fl):
            """OR-query `core` for uuid:(v1 OR v2 ...) in batches; return the docs."""
            docs = []
            batch_size = 200
            for i in range(0, len(values), batch_size):
                chunk = values[i:i + batch_size]
                uuid_query = ' OR '.join(f'"{v}"' for v in chunk)
                resp = requests.post(
                    f"{SOLR_URL}{core}/select",
                    data={'q': f'uuid:({uuid_query})', 'fl': fl,
                          'rows': len(chunk), 'wt': 'json'},
                )
                resp.raise_for_status()
                docs.extend(resp.json().get('response', {}).get('docs', []))
            return docs

        mani_docs = solr_by_uuid(
            'manifestations', mani_uuids,
            'uuid,dcterms_type,dcterms_identifier-shelf_,ox_resourceAt-institution',
        )

        # collect the institution uuids referenced by those manifestations
        inst_uuids = set()
        for d in mani_docs:
            for uri in _as_list(d.get('ox_resourceAt-institution')):
                inst_uuids.add(uri.rstrip('/').split('/')[-1])

        inst_name = {}
        if inst_uuids:
            for d in solr_by_uuid('institutions', list(inst_uuids),
                                  'uuid,geonames_officialName'):
                inst_name[d.get('uuid')] = _first(d.get('geonames_officialName')) or ''

        out = {}
        for d in mani_docs:
            uid = d.get('uuid')
            if not uid:
                continue
            entry = {}
            if 'dcterms_type' in d:
                entry['dcterms_type'] = _first(d.get('dcterms_type'))
            if 'dcterms_identifier-shelf_' in d:
                entry['shelf'] = _first(d.get('dcterms_identifier-shelf_'))
            repo_name = ''
            for uri in _as_list(d.get('ox_resourceAt-institution')):
                iid = uri.rstrip('/').split('/')[-1]
                if inst_name.get(iid):
                    repo_name = inst_name[iid]
                    break
            if repo_name:
                entry['repoName'] = repo_name
            out[uid] = entry

        return jsonify(out)

    except Exception as e:
        return jsonify({'error': 'Internal Server Error', 'details': str(e)}), 500


## Will be deleted by next deployment, keeping this untill that time
@solr_bp.route('/stats', methods=['POST'])  # Include methods you need
def fetchStats():
    try:

        SOLR_URL = getSolrURL()

        # Get data from the request
        data = request.json
        solr_core = data.get('solrCore')
        uuids = data.get('uuids', [])
        filter_query = data.get('filter', '')

        if not solr_core or not uuids:
            return jsonify({'error': 'solrCore and uuids are required'}), 400

        # Construct the Solr query
        uuid_query = ' OR '.join([f'{uuid}' for uuid in uuids])

        solr_query = f'uuid:({uuid_query})'

        if filter_query:
            solr_query += f' AND ({filter_query})'

        solr_url = f'{SOLR_URL}{solr_core}s/select'
        params = {
            'q': solr_query,
            'wt': 'json',
            'rows': len(uuids)  # Assuming you want a result for each UUID
        }

        # Make the request to Solr
        response = requests.get(solr_url, params=params)
        response.raise_for_status()

        # Return Solr response
        solr_data = response.json()
        return jsonify(solr_data)

    except requests.RequestException as e:
        return jsonify({'error': 'Error fetching data from Solr', 'details': str(e)}), 500
    except Exception as e:
        return jsonify({'error': 'Internal Server Error', 'details': str(e)}), 500

# This functions fetches the three results based on the search type, this results are used for navigation purpose on 
# profile page. This will have of three results, in the manner, prev, current and next. Any modification made for this function
# needs to ne handled inside profile.jinja2. 
@solr_bp.route('/results')
def fetchNextResults():
    try:
        SOLR_URL = getSolrURL()

        # Sort options mapping
        SORT_OPTIONS = {
            "date-a": {"field": "started_date_sort", "order": "asc"},
            "date-d": {"field": "started_date_sort", "order": "desc"},
            "author-a": {"field": "author_sort", "order": "asc"},
            "author-d": {"field": "author_sort", "order": "desc"},
            "recipient-a": {"field": "recipient_sort", "order": "asc"},
            "recipient-d": {"field": "recipient_sort", "order": "desc"},
            "origin-a": {"field": "origin_sort", "order": "asc"},
            "origin-d": {"field": "origin_sort", "order": "desc"},
            "destination-a": {"field": "destination_sort", "order": "asc"},
            "destination-d": {"field": "destination_sort", "order": "desc"}
        }

        # Retrieve query parameters
        search_type = request.args.get('type', '')
        start = int(request.args.get('start', '0'))  # Default to "0" if not provided
        sort = request.args.get('sort', '')  # Optional sort query
        uuids = request.args.getlist('uuids')  # List of UUIDs
        numFound = int(request.args.get('numFound', '0'))
        q = request.args.get('q' , '')

        if numFound == 0:
            return jsonify({'error': 'Error fetching data from Solr', 'details': "numFound is missing or invalid"}), 400

        # Set the Solr collection based on search_type
        solr_collection = "all" if search_type == "quick" else "works"

        # Build the Solr query base URL
        solr_query_url = f"{SOLR_URL}{solr_collection}/select"

        # Default query and sort options
        query = "*:*"

        if q:
            query = q 

        sort_query = "" if search_type == "quick" else "started_date_sort asc"

        # Add sort parameter if provided
        if sort and sort in SORT_OPTIONS:
            sort_field = SORT_OPTIONS[sort]["field"]
            sort_order = SORT_OPTIONS[sort]["order"]
            sort_query = f"{sort_field} {sort_order}"

        # Handle UUID-related queries based on search_type
        if uuids:
            # Split the single string into a list of UUIDs
            uuid_list = uuids[0].split(',')

            # Format UUIDs correctly for Solr query
            uuid_queries = [f'"{uuid.strip()}"' for uuid in uuid_list]  # Strip any extra whitespace
            query = f"uuid_related:({' OR '.join(uuid_queries)})"


        # Build Solr query parameters
        solr_params = {
            "q": query,
            "sort": sort_query,
            "start": start,
            "wt" : "json",
            "fl" : "uuid, object_type",
            "rows": 1  # Only fetch a single document at a time for pagination
        }
        
        last_start = max(0, numFound - 1)  # Ensure we don't exceed available records

        # first / last / prev / current / next are independent single-doc
        # look-ups. Previously these were up to five sequential round trips to
        # Solr on every profile page that carries navigation params; run them
        # concurrently instead.
        entry_starts = {
            "first_entry": 0,
            "last_entry": last_start,
            "current_entry": start,
        }
        if start > 0:
            entry_starts["prev_entry"] = start - 1
        if start < last_start:
            entry_starts["next_entry"] = start + 1

        def _fetch_entry(entry_start):
            resp = requests.get(solr_query_url, params={**solr_params, "start": entry_start}, timeout=15)
            resp.raise_for_status()
            docs = resp.json().get('response', {}).get('docs', [])
            return docs[0] if docs else None

        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = {key: executor.submit(_fetch_entry, s) for key, s in entry_starts.items()}
            response_data = {key: fut.result() for key, fut in futures.items()}

        # prev/next are omitted at the edges — keep the response shape stable.
        response_data.setdefault("prev_entry", None)
        response_data.setdefault("next_entry", None)

        return jsonify(response_data), 200

    except requests.RequestException as e:
        return jsonify({'error': 'Error fetching data from Solr', 'details': str(e)}), 500
    except Exception as e:
        print(e)
        return jsonify({'error': 'Internal Server Error', 'details': str(e)}), 500

@solr_bp.route('/repos', methods=['GET'])
def fetch_institutions():
    SOLR_URL = getSolrURL()
    COLLECTION = "institutions"

    # Solr query parameters
    params = {
        'q': '*:*',              # match all documents
        'fl': 'browse,geonames_officialName',          # only fetch the 'browse' field
        'rows': 1000,            # fetch 1000 rows
        'sort': 'browse asc',    # sort by 'browse' ascending
        'wt': 'json'             # response format
    }

    solr_query_url = f"{SOLR_URL}{COLLECTION}/select"

    try:
        response = requests.get(solr_query_url, params=params)
        response.raise_for_status()
        
        return jsonify(response.json()), response.status_code

    except requests.RequestException as e:
        return jsonify({'error': str(e)}), 500

def _manifestation_data(uuid):
    """Two-step server-side join: manifestation uuid -> its related objects,
    with each related manifestation's own work pulled in too. Used directly
    (no HTTP hop) by /profile-data/<collection>/<uuid> below, and by the
    /manifestation-data/<uuid> route for callers not yet migrated to that."""
    result = {}

    # Step 1: Query solr/all for all related objects by uuid
    all_data = _strip_bulk_correspondence_fields(solr_get("all", f"uuid_related:{uuid}"))
    docs = all_data.get("response", {}).get("docs", [])

    for doc in docs:
        doc_uuid = doc.get("uuid")
        doc_type = doc.get("object_type")

        if not doc_uuid:
            continue

        # Step 2: If object is a manifestation, check for frbr_Work-work field
        if doc_type == "manifestation" and doc.get("frbr_Work-work"):
            work_uris = doc.get("frbr_Work-work", [])

            for work_uri in work_uris:
                work_uuid = uuid_from_uri(work_uri)

                # Fetch the work object from the work core
                work_data = solr_get("works", f"uuid:{work_uuid}")
                work_docs = work_data.get("response", {}).get("docs", [])

                if work_docs:
                    result[work_uuid] = work_docs[0]

        # Always add the doc itself to the result
        result[doc_uuid] = doc

    return result


@solr_bp.route("/manifestation-data/<uuid>", methods=['GET'])
def get_manifestation_data(uuid):
    return jsonify(_manifestation_data(uuid))


# Path segment (as used in /profile/<collection>/<uuid>, see views/profile.py)
# -> Solr core name (as used in static/js/profile.edges.js collectionMap).
_PROFILE_SOLR_CORE = {
    "person": "people",
    "location": "locations",
    "work": "works",
    "repository": "institutions",
    "manifestation": "manifestations",
    "image": "images",
    "comment": "comments",
    "resource": "resources",
}

# Collections whose profile page mounts a MultiFields component with
# fetchImageData:true — the field(s) on the primary doc holding manifestation
# URIs to fetch images/manifestation-data for. See static/js/profile/work.js
# and the _getImageComponents() image-profile config in static/js/profile.js.
_IMAGE_FIELDS = {
    "work": ("manifestations", "frbr_Manifestation-manifestation"),
    "image": ("frbr_Manifestation-manifestation",),
}

# Collections whose profile page mounts a MultiFields component with
# fetchTableData:true — the field(s) it fetches "this record's own volume of
# correspondence" data for. See tableDataFields in static/js/profile/people.js,
# location.js, and _getInstitutionComponents() in static/js/profile.js.
_TABLE_DATA_FIELDS = {
    "person": ("frbr_creatorOf-work", "mail_recipientOf-work", "dcterms_isReferencedBy-work"),
    "location": ("mail_originOf-work", "mail_destinationOf-work", "dcterms_isReferencedBy-work"),
    "repository": ("ox_hasResource-manifestation",),
}

# Collections whose relations list is only ever consumed by walking a fixed,
# enumerable set of profile[field] uri lists and matching each against
# `relations` — resourceRelation() (rdfs_seeAlso-resource), relationshipList()
# (the field lists below), and h4RelationshipList() (ox_isAnnotatedBy-comment)
# in static/js/helper/helper.js. For these, the generic `uuid_related:{uuid}`
# sweep — every *other* record pointing at this one, in any direction, which
# for a repository means every manifestation it holds and for a prolific
# person means every letter they ever wrote/received — is fetched and shipped
# for nothing beyond that small matched set. Verified per collection by
# reading every function its profile+sidebar render (profileFragLoader.js
# names them): institutionFrag.js (repository), peopleFrags.js (person),
# locationFrag.js (location) — none of the three read `relations` any other
# way. work/image/manifestation/comment also call resourceRelation but use
# `relations` for other things too (image/manifestation lookups, ...), so
# narrowing theirs needs the same audit before it's safe — not done yet.
_RELATIONS_FILTER_FIELDS = {
    "repository": ("rdfs_seeAlso-resource",),
    "person": (
        "rdfs_seeAlso-resource", "ox_isAnnotatedBy-comment",
        "ox_wasBornIn-location", "ox_diedAt-location", "ox_wasAt-location",
        "rel_childOf-person", "rel_parentOf-person", "rel_siblingOf-person",
        "rel_spouseOf-person", "rel_relativeOf-person",
        "ox_unspecifiedRelationshipWith-person", "taught-person",
        "was_taught_by-person", "employed-person", "was_employed_by-person",
        "friend-person", "ox_memberOf-person", "foaf_member-person",
    ),
    "location": (
        "rdfs_seeAlso-resource", "ox_isAnnotatedBy-comment",
        "rel_wasBirthplaceOf-person", "rel_wasPlaceOfDeathOf-person",
        "rel_wasVisitedBy-person",
    ),
}

# Fields the client only ever reads through h4WorkList() / the correspondence
# graph (static/js/helper/helper.js summaryByYear/summaryByDetail,
# static/js/profile/peopleFrags.js _renderGraphSection) — uuid,
# dcterms_description and the two year fields, nothing else, whether the list
# renders as a >30-item year summary or a <=30-item detail table. The
# existing /collection-year-data join already restricts to exactly this set
# for repository; this applies the same restriction to the equivalent
# person/location uuid-list lookup, which had no `fl` at all.
_TABLE_DATA_WORK_FIELDS = "uuid,dcterms_description,ox_started-ox_year,ox_completed-ox_year"


def _profile_table_data(field, primary):
    """Mirrors MultiFields.synchronise()'s fetchTableData branch in
    static/js/edges.js: "ox_hasResource-manifestation" (repository only) goes
    through the existing collection-year-data two-hop join; every other field
    is a plain uuid-list lookup against the works core, same as /stats-new."""
    if field == "ox_hasResource-manifestation":
        return _collection_year_data(primary.get("uuid"))

    uuids = list({uuid_from_uri(v) for v in (primary.get(field) or [])})
    return _stats_new_lookup("work", uuids, "uuid", _TABLE_DATA_WORK_FIELDS) if uuids else []


@solr_bp.route('/profile-data/<collection>/<uuid>', methods=['GET'])
def profile_data(collection, uuid):
    """
    Single combined call for a profile page. Replaces what used to be up to
    4 sequential client-side round trips — primary query, then (waterfalled
    behind it) relations, then per-manifestation images/manifestation-data
    or a tableData fetch — with one request that runs the same lookups
    server-side, in parallel. Consumed by emlo.PrefetchedQueryAdapter /
    emlo.prefetchedExtras in static/js/edges.js, wired up from
    static/js/profile.edges.js for every profile collection.

    Returns:
      {
        "primary": {...record, or null if not found...},
        "relations": [...same shape /solr/all/select?q=uuid_related:...
                       returns, already field-stripped...],
        "images": {"<manifestation_uuid>": [...stripped image docs...]},
        "manifestationData": {"<manifestation_uuid>": {...}},
        "tableData": {"<field name>": [...docs...]}
      }
    """
    core = _PROFILE_SOLR_CORE.get(collection)
    if not core:
        return jsonify({'error': f'unknown collection: {collection}'}), 404

    try:
        SOLR_URL = getSolrURL()

        def fetch_primary():
            resp = requests.get(
                f"{SOLR_URL}{core}/select",
                params={'q': f'uuid:{uuid}', 'start': 0, 'rows': 10, 'wt': 'json'},
            )
            resp.raise_for_status()
            docs = resp.json().get('response', {}).get('docs', [])
            return docs[0] if docs else None

        def fetch_relations():
            resp = requests.get(
                f"{SOLR_URL}all/select",
                params={'q': f'uuid_related:{uuid}', 'rows': 9999, 'wt': 'json'},
            )
            resp.raise_for_status()
            return _strip_bulk_correspondence_fields(resp.json()).get('response', {}).get('docs', [])

        def fetch_targeted_relations(primary, filter_fields):
            """Only the docs relationshipList()/resourceRelation()/
            h4RelationshipList() will actually look up — id:(...) lookups for
            the union of every filter field's uris, instead of sweeping every
            uuid_related match (for a repository that sweep is every
            manifestation it holds; for a prolific person, every letter they
            ever wrote or received)."""
            ids = sorted({
                f"uuid_{uuid_from_uri(u)}"
                for field in filter_fields
                for u in (primary.get(field) or [])
            })
            if not ids:
                return []
            docs = []
            BATCH = 100
            for i in range(0, len(ids), BATCH):
                batch = ids[i:i + BATCH]
                id_query = ' OR '.join(f'"{i}"' for i in batch)
                resp = requests.get(
                    f"{SOLR_URL}all/select",
                    params={'q': f'id:({id_query})', 'rows': len(batch), 'wt': 'json'},
                )
                resp.raise_for_status()
                docs.extend(_strip_bulk_correspondence_fields(resp.json()).get('response', {}).get('docs', []))
            return docs

        filter_fields = _RELATIONS_FILTER_FIELDS.get(collection)
        if filter_fields:
            # The targeted query needs primary's own field values first, so
            # this can't run in parallel with fetch_primary like the
            # default path below does.
            primary = fetch_primary()
            relations = fetch_targeted_relations(primary, filter_fields) if primary else []
        else:
            # Primary and relations both key off the record's own uuid and
            # don't depend on each other's result, so run them together.
            with ThreadPoolExecutor(max_workers=2) as executor:
                f_primary = executor.submit(fetch_primary)
                f_relations = executor.submit(fetch_relations)
                primary = f_primary.result()
                relations = f_relations.result()

        empty = {'primary': None, 'relations': [], 'images': {}, 'manifestationData': {}, 'tableData': {}}
        if primary is None:
            return jsonify(empty), 404

        # Never read anywhere off a doc (primary or relations) — only ever
        # used as a facet field name / query key, confirmed by grepping
        # every reference to it in static/js/. Safe to drop unconditionally.
        primary.pop('uuid_related', None)

        # Every manifestation the old client-side code would have fetched
        # images/manifestation-data for — union+dedupe across every field
        # this collection's components read (work mounts two components
        # reading two differently-named, usually identical fields; their
        # own promise maps deduped the resulting fetches the same way).
        mani_uuids = set()
        for field in _IMAGE_FIELDS.get(collection, ()):
            for mani_uri in (primary.get(field) or []):
                mani_uuids.add(uuid_from_uri(mani_uri))

        # Only fields actually present on this record get fetched — matches
        # the `result.hasOwnProperty(field)` guard in synchronise().
        table_fields = [f for f in _TABLE_DATA_FIELDS.get(collection, ()) if primary.get(f)]

        def fetch_images(mani_uuid):
            resp = requests.get(
                f"{SOLR_URL}images/select",
                params={'q': f'uuid_related:{mani_uuid}', 'rows': 9999, 'wt': 'json'},
            )
            resp.raise_for_status()
            docs = _strip_bulk_correspondence_fields(resp.json()).get('response', {}).get('docs', [])
            return mani_uuid, docs

        images = {}
        manifestation_data = {}
        table_data = {}

        # Every follow-up lookup (images + manifestation-data per
        # manifestation, plus any tableData field) runs in the same pool so
        # they're all concurrent rather than one after another.
        pool_size = max(1, len(mani_uuids) * 2 + len(table_fields))
        with ThreadPoolExecutor(max_workers=pool_size) as executor:
            image_futures = {executor.submit(fetch_images, mu): mu for mu in mani_uuids}
            mani_futures = {executor.submit(_manifestation_data, mu): mu for mu in mani_uuids}
            table_futures = {executor.submit(_profile_table_data, f, primary): f for f in table_fields}

            for future in as_completed(image_futures):
                mani_uuid, docs = future.result()
                images[mani_uuid] = docs
            for future in as_completed(mani_futures):
                manifestation_data[mani_futures[future]] = future.result()
            for future in as_completed(table_futures):
                table_data[table_futures[future]] = future.result()

        # MultiFields.synchronise()'s fetchTableData branch only reads a
        # resolved field's raw value on `primary` as an existence check
        # once `tableData[field]` is populated in prefetch mode — EXCEPT
        # totalLinkingToListWork() (static/js/helper/helper.js), which
        # reads profile[field].length directly for the "N letters sent
        # from/received/mentioning" stats line on person and location
        # profiles specifically (peopleFrags.js / locationFrag.js) —
        # clearing the field there zeroes that count. Only clear it for
        # collections verified not to do that: repository's
        # institutionFrag.js doesn't call totalLinkingToListWork at all, so
        # its ox_hasResource-manifestation (every manifestation URI the
        # institution holds — often the majority of this response's size)
        # is genuinely dead weight once tableData has been computed above.
        _SAFE_TO_CLEAR_TABLE_FIELDS_ON_PRIMARY = {"repository"}
        if collection in _SAFE_TO_CLEAR_TABLE_FIELDS_ON_PRIMARY:
            for field in table_fields:
                primary[field] = []

        return jsonify({
            'primary': primary,
            'relations': relations,
            'images': images,
            'manifestationData': manifestation_data,
            'tableData': table_data,
        })

    except requests.RequestException as e:
        return jsonify({'error': 'Error fetching data from Solr', 'details': str(e)}), 500
    except Exception as e:
        return jsonify({'error': 'Internal Server Error', 'details': str(e)}), 500


def uuid_from_uri(uri):
    # Extracts UUID from e.g. "http://localhost/work/d1f33b3c-22a5-4d02-a511-1a140e570590"
    return urlparse(uri).path.rstrip("/").split("/")[-1]

def solr_get(core, query, rows=9999):
    SOLR_URL = getSolrURL()
    url = f"{SOLR_URL}{core}/select"
    params = {
        "q": query,
        "wt": "json",
        "rows": rows
    }
    response = requests.get(url, params=params)
    response.raise_for_status()
    return response.json()

# Function to handle the solr url for each API call. 
# Todo: we can store solr URL in global variable instead of making call to multiple times to env file.
def getSolrURL():
    solr_url = os.getenv('SOLR_URL', '')

    if not solr_url:
        raise ValueError("SOLR_URL environment variable is not set. Please configure it before starting the app.")

    # Construct the full URL for the external API request
    # Append the captured subpath
    if not solr_url.endswith("/"):
        solr_url = solr_url + "/"
    
    return solr_url