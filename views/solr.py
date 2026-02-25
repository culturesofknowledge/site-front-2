from flask import Blueprint, jsonify, request , Response, abort
import requests
import os
from dotenv import load_dotenv
from urllib.parse import urlparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import gzip, json, time

load_dotenv()

solr_bp = Blueprint("solr", __name__)

@solr_bp.route('/solr/<path:subpath>', methods=['GET'])  # Include methods you need
def solr_proxy(subpath):
    try:
        SOLR_URL = getSolrURL()

        subpath = subpath.lstrip('/')
        full_url = SOLR_URL + subpath

        query_string = request.query_string.decode("utf-8")
        full_url_with_params = f"{full_url}?{query_string}"

        # Make the request to the external Solr API, including query parameters
        response = requests.request(
            method=request.method,
            url=full_url_with_params
        )

        # Raise an error if the external request failed
        response.raise_for_status()

        # Return the data as a JSON response
        return jsonify(response.json()), response.status_code

    except requests.exceptions.HTTPError as http_err:
        print(f"Got HTTP error: {http_err}")
        return jsonify({"error": str(http_err)}), http_err.response.status_code
    except Exception as err:
        print(f"Got error: {err}")
        return jsonify({"error": str(err)}), 500

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
    

@solr_bp.route('/stats-new', methods=['POST'])
def fetchStatsNew():
    try:
        SOLR_URL = getSolrURL()

        # Get data from the request
        data = request.json
        solr_core = data.get('solrCore')
        uuids = data.get('uuids', [])
        objectKey = data.get('objectKey', 'uuid')
        filter_query = data.get('filter', '')

        # Validate input
        if not solr_core or not uuids:
            return jsonify({'error': 'solrCore and uuids are required'}), 400

        # Split the uuids list into batches of 100
        batch_size = 100
        batches = [uuids[i:i + batch_size] for i in range(0, len(uuids), batch_size)]

        # Initialize an empty list to store results from each batch
        all_results = []

        # Loop through each batch and query Solr
        for batch in batches:
            # Construct the Solr query for the current batch
            uuid_query = ' OR '.join([f'"{uuid}"' for uuid in batch])  # Ensure UUIDs are quoted correctly
            solr_query = f'{objectKey}:({uuid_query})'

            # Build the Solr URL
            core = f"{solr_core}s" if solr_core not in ["people", "all"] else solr_core
            solr_url = f'{SOLR_URL}{core}/select'
            params = {
                'q': solr_query,
                'wt': 'json',
                'rows': len(batch),  # Fetch results only for the current batch
                'fl' : filter_query
            }

            # Make the request to Solr
            try:
                response = requests.get(solr_url, params=params)
                response.raise_for_status()  # Ensure we raise an error for bad responses
                solr_data = response.json()

                # Debugging: print the query and the response to check for issues
                # print(f"Solr Query: {solr_query}")
                # print(f"Solr Response: {solr_data}")
                
                # Append the results from the current batch
                all_results.extend(solr_data.get('response', {}).get('docs', []))  # Assuming 'docs' contains the results
                # Debugging: Print how many results we fetched for this batch
                # print(f"Results for batch: {len(solr_data.get('response', {}).get('docs', []))}")

            except requests.RequestException as e:
                return jsonify({'error': 'Error fetching data from Solr', 'details': str(e)}), 500

        # Return all collected results in one go
        return jsonify(all_results)

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
        
        # Fetch first entry
        first_entry = requests.get(solr_query_url, params={**solr_params, "start": 0})
        if first_entry.status_code != 200:
            return jsonify({'error': 'Error fetching first entry', 'details': first_entry.text}), 500

        # Fetch last entry (numFound is used to calculate the last entry)
        last_start = max(0, numFound - 1)  # Ensure we don't exceed available records
        last_entry = requests.get(solr_query_url, params={**solr_params, "start": last_start})
        if last_entry.status_code != 200:
            return jsonify({'error': 'Error fetching last entry', 'details': last_entry.text}), 500

        # Fetch previous, current, and next entries
        prev_entry = None if start <= 0 else requests.get(solr_query_url, params={**solr_params, "start": start - 1})
        if prev_entry and prev_entry.status_code != 200:
            return jsonify({'error': 'Error fetching previous entry', 'details': prev_entry.text}), 500

        current_entry = requests.get(solr_query_url, params={**solr_params, "start": start})
        if current_entry.status_code != 200:
            return jsonify({'error': 'Error fetching current entry', 'details': current_entry.text}), 500

        next_entry = None if start >= last_start else requests.get(solr_query_url, params={**solr_params, "start": start + 1})
        if next_entry and next_entry.status_code != 200:
            return jsonify({'error': 'Error fetching next entry', 'details': next_entry.text}), 500

        # Prepare the response data
        response_data = {
            "first_entry": first_entry.json().get('response').get('docs' , [])[0] if first_entry else None,  # Access JSON from the Response object
            "last_entry": last_entry.json().get('response').get('docs' , [])[0] if last_entry else None,  # Access JSON from the Response object
            "prev_entry": prev_entry.json().get('response').get('docs' , [])[0] if prev_entry else None,  # Access JSON from the Response object if exists
            "current_entry": current_entry.json().get('response').get('docs' , [])[0] if current_entry else None,  # Access JSON from the Response object
            "next_entry": next_entry.json().get('response').get('docs' , [])[0] if next_entry else None # Access JSON from the Response object
        }

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

@solr_bp.route('/image-heading/<uuid>', methods=['GET'])
def get_image_heading(uuid):
    try:
        # 1️⃣ First Solr call
        first_response = _solr_get(
            core="all",
            query=f"uuid_related:{uuid}",
            fl="uuid,frbr_Work-work",
            rows=1
        )

        docs = first_response.get("response", {}).get("docs", [])
        if not docs:
            return jsonify({"error": "UUID not found"}), 404

        first_doc = docs[0]

        work_links = first_doc.get("frbr_Work-work")
        if not work_links or not isinstance(work_links, list):
            return jsonify({"error": "frbr_Work-work not found"}), 404

        # 2️⃣ Extract linked UUID
        work_uuid = _uuid_from_uri(work_links[0])

        # 3️⃣ Second Solr call
        second_response = _solr_get(
            core="all",
            query=f"uuid:{work_uuid}",
            fl="uuid,dcterms_description",
            rows=1
        )

        second_docs = second_response.get("response", {}).get("docs", [])
        if not second_docs:
            return jsonify({"error": "Linked work not found"}), 404

        second_doc = second_docs[0]

        heading = second_doc.get("dcterms_description")
        if isinstance(heading, list):
            heading = heading[0]

        return jsonify({
            "uuid": uuid,
            "linked_uuid": work_uuid,
            "heading": heading
        }), 200

    except requests.RequestException as e:
        return jsonify({
            "error": "Solr request failed",
            "details": str(e)
        }), 500


# DEAD CODE- Will be removed by April 2026 - keeping for fallback
@solr_bp.route("/manifestation-data/<uuid>", methods=['GET'])
def get_manifestation_data(uuid):
    result = {}

    # Step 1: Query solr/all for all related objects by uuid
    all_data = solr_get("all", f"uuid_related:{uuid}")
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

    return jsonify(result)

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

# ---------------------------------------- Profile  API ----------------------------------------#
# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------


# Simple in-process cache: { cache_key: (timestamp, payload_bytes) }
# Avoids re-hitting Solr when the same profile is requested within TTL seconds.
_CACHE: dict = {}
_CACHE_TTL = 60   # seconds — safe for data that changes via an edit UI

# ---------------------------------------------------------------------------
# Field-list (fl) config — edit here, never in JS
# ---------------------------------------------------------------------------

_FL_RELATIONS = ",".join([
    "uuid", "id", "object_type",
    "dcterms_identifier-uri_",
    "dcterms_description", "dcterms_type", "foaf_name",
    "geonames_name", "geonames_officialName",
    "ox_titleOfResource", "bibo_Note", "dcterms_source",
    "ox_titlesRolesOccupations", "dcterms_relation", "ox_detailsOfResource",
    "frbr_Work-work", "ox_resourceAt-institution",
    "dcterms_identifier-shelf_", "ox_printedEditionDetails",
    "ox_isAnnotatedBy-comment",
    "dcterms_created-ox_year", "dcterms_created-ox_month", "dcterms_created-ox_day",
    "ox_dateAnnotate-comment", "mail_handwroteBy-person", "mail_destination",
    "ox_incipit", "ox_excipit", "mail_postageMark", "ox_endorsements",
    "mail_enclosedBy-manifestation", "mail_enclosureOf-manifestation",
    "ox_nonLetterEnclosures", "ox_accompaniments",
    "mail_seal", "mail_paper", "mail_paperSize",
    "bibo_numPages", "ox_numPageText", "dcterms_language", "ox_isTranslation",
    "ox_previouslyOwnedBy-person",
    "ox_opened", "ox_routing_mark_ms", "ox_routing_mark_stamp",
    "ox_handling_instructions", "ox_stored_folded",
    "ox_postage_costs_as_marked", "ox_postage_costs",
    "ox_non_delivery_reason", "ox_date_of_receipt_as_marked",
    "ox_manifestation_receipt_date_day", "ox_manifestation_receipt_date_month",
    "ox_manifestation_receipt_date_year", "ox_manifestation_receipt_calendar",
    "ox_manifestation_receipt_date", "ox_manifestation_receipt_date_gregorian",
    "ox_manifestation_receipt_date_inferred", "ox_manifestation_receipt_date_uncertain",
    "ox_manifestation_receipt_date_approx", "ox_dateReceiptAnnotate-comment",
])

_FL_IMAGES = ",".join([
    "uuid", "uuid_related", "object_type",
    "dcterms_source", "foaf_thumbnail", "dcterms_identifier-uri_",
])

_FL_MANI_RELATED = ",".join([
    "uuid", "id", "object_type", "frbr_Work-work",
    "dcterms_type", "dcterms_identifier-uri_",
    "dcterms_identifier-shelf_", "ox_resourceAt-institution", "ox_printedEditionDetails",
])

_FL_MANI_WORK = ",".join([
    "uuid", "dcterms_description", "object_type", "dcterms_identifier-uri_",
])

_FL_TABLE_DOCS = ",".join([
    "uuid", "id", "dcterms_description",
    "ox_started-ox_year", "ox_completed-ox_year", "started_date_sort",
])

# ---------------------------------------------------------------------------
# tableData field config — server-side allowlist
# ---------------------------------------------------------------------------
_TABLE_FIELD_CONFIG = {
    "frbr_creatorOf-work":          {"core": "works", "objectKey": "uuid"},
    "mail_recipientOf-work":        {"core": "works", "objectKey": "uuid"},
    "dcterms_isReferencedBy-work":  {"core": "works", "objectKey": "uuid"},
    "mail_originOf-work":           {"core": "works", "objectKey": "uuid_related"},
    "mail_destinationOf-work":      {"core": "works", "objectKey": "uuid_related"},
    "ox_hasResource-manifestation": {"core": "works", "objectKey": "uuid_related"},
}

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_solr_url():
    url = os.getenv("SOLR_URL", "")
    if not url:
        raise ValueError("SOLR_URL environment variable is not set.")
    return url.rstrip("/") + "/"


def _solr_get(core, query, fl="", rows=9999, extra_params=None):
    url = _get_solr_url() + f"{core}/select"
    params = {"q": query, "wt": "json", "rows": rows}
    if fl:
        params["fl"] = fl
    if extra_params:
        params.update(extra_params)
    resp = requests.get(url, params=params, timeout=15)
    resp.raise_for_status()
    return resp.json()


def _uuid_from_uri(uri):
    return urlparse(uri).path.rstrip("/").split("/")[-1]


def _extract_uuids_from_field(core_doc, field_name):
    raw = core_doc.get(field_name, [])
    if not isinstance(raw, list):
        raw = [raw]
    return [v.split("/").pop() if v and "/" in v else v for v in raw if v]


def _gzip_json(data: dict) -> bytes:
    return gzip.compress(json.dumps(data, separators=(",", ":")).encode("utf-8"), compresslevel=6)


# ---------------------------------------------------------------------------
# Sub-query workers (all run in parallel)
# ---------------------------------------------------------------------------

def _fetch_core(collection, uuid):
    data = _solr_get(collection, f"uuid:{uuid}", rows=1)
    docs = data.get("response", {}).get("docs", [])
    return docs[0] if docs else None


def _fetch_relations(uuid):
    data = _solr_get("all", f"uuid_related:{uuid}", fl=_FL_RELATIONS)
    return data.get("response", {}).get("docs", [])


def _fetch_images_for_mani(mani_uuid):
    data = _solr_get("images", f"uuid_related:{mani_uuid}", fl=_FL_IMAGES)
    return data.get("response", {}).get("docs", [])


def _fetch_manifestation_data(mani_uuid):
    result = {}
    all_data = _solr_get("all", f"uuid_related:{mani_uuid}", "")
    docs = all_data.get("response", {}).get("docs", [])

    work_uuids = []
    for doc in docs:
        doc_uuid = doc.get("uuid")
        if not doc_uuid:
            continue
        result[doc_uuid] = doc
        if doc.get("object_type") == "manifestation" and doc.get("frbr_Work-work"):
            for uri in doc["frbr_Work-work"]:
                work_uuids.append(_uuid_from_uri(uri))

    if work_uuids:
        unique = list(set(work_uuids))
        q = "uuid:(" + " OR ".join(f'"{u}"' for u in unique) + ")"
        work_data = _solr_get("works", q, fl=_FL_MANI_WORK, rows=len(unique))
        for wdoc in work_data.get("response", {}).get("docs", []):
            result[wdoc["uuid"]] = wdoc

    return result


def _fetch_table_field(core_doc, field_name):
    """
    Fetch all docs for a tableData field and return them as a flat list.
    This matches the original format the frags and graph code expect:
    a plain array of work docs each with ox_started-ox_year, dcterms_description, etc.
    """
    config = _TABLE_FIELD_CONFIG[field_name]
    uuids = _extract_uuids_from_field(core_doc, field_name)

    if not uuids:
        return []

    object_key = config["objectKey"]
    solr_core  = config["core"]
    batch_size = 100
    docs = []

    for i in range(0, len(uuids), batch_size):
        batch = uuids[i : i + batch_size]
        q = f"{object_key}:(" + " OR ".join(f'"{u}"' for u in batch) + ")"
        data = _solr_get(solr_core, q, fl=_FL_TABLE_DOCS, rows=len(batch))
        docs.extend(data.get("response", {}).get("docs", []))

    return docs


# ---------------------------------------------------------------------------
# Main endpoint
# ---------------------------------------------------------------------------

@solr_bp.route("/profile-data/<collection>/<uuid>", methods=["GET"])
def get_profile_data(collection, uuid):
    if not uuid or not collection:
        return jsonify({"error": "collection and uuid are required"}), 400

    requested_sections = {
        s.strip()
        for s in request.args.get(
            "sections", "relations,images,manifestations,tableData"
        ).split(",")
        if s.strip()
    }

    requested_table_fields = [
        f.strip()
        for f in request.args.get("tableFields", "").split(",")
        if f.strip() in _TABLE_FIELD_CONFIG
    ]

    # Cache key includes all parameters that affect the response
    cache_key = f"{collection}:{uuid}:{','.join(sorted(requested_sections))}:{','.join(sorted(requested_table_fields))}"
    now = time.time()

    cached = _CACHE.get(cache_key)
    if cached and (now - cached[0]) < _CACHE_TTL:
        payload_bytes = cached[1]
        return Response(
            payload_bytes,
            status=200,
            headers={
                "Content-Type": "application/json",
                "Content-Encoding": "gzip",
                "Cache-Control": f"public, max-age={_CACHE_TTL}",
                "X-Cache": "HIT",
            }
        )

    try:
        core_doc = _fetch_core(collection, uuid)
        if not core_doc:
            return jsonify({"error": "Record not found"}), 404

        response_data = {
            "core":           core_doc,
            "relations":      [],
            "images":         {},
            "manifestations": {},
            "tableData":      {},
        }

        futures = {}

        with ThreadPoolExecutor(max_workers=16) as executor:

            if "relations" in requested_sections:
                futures["relations"] = executor.submit(_fetch_relations, uuid)

            mani_uris = (
                core_doc.get("frbr_Manifestation-manifestation")
                or core_doc.get("manifestations")
                or []
            )
            mani_uuids = [uri.split("/").pop() for uri in mani_uris if uri]

            if "images" in requested_sections and mani_uuids:
                for mu in mani_uuids:
                    futures[f"images:{mu}"] = executor.submit(_fetch_images_for_mani, mu)

            if "manifestations" in requested_sections and mani_uuids:
                for mu in mani_uuids:
                    futures[f"manifestations:{mu}"] = executor.submit(_fetch_manifestation_data, mu)

            if "tableData" in requested_sections and requested_table_fields:
                for field_name in requested_table_fields:
                    futures[f"tableData:{field_name}"] = executor.submit(
                        _fetch_table_field, core_doc, field_name
                    )

            for key, future in futures.items():
                try:
                    result = future.result()
                    if key == "relations":
                        response_data["relations"] = result
                    elif key.startswith("images:"):
                        response_data["images"][key.split(":", 1)[1]] = result
                    elif key.startswith("manifestations:"):
                        response_data["manifestations"][key.split(":", 1)[1]] = result
                    elif key.startswith("tableData:"):
                        response_data["tableData"][key.split(":", 1)[1]] = result
                except Exception as e:
                    print(f"[profile-data] sub-query '{key}' failed: {e}")

        # Compress and cache
        payload_bytes = _gzip_json(response_data)
        _CACHE[cache_key] = (now, payload_bytes)

        # Prune stale cache entries (simple GC — only runs on writes)
        if len(_CACHE) > 500:
            cutoff = now - _CACHE_TTL
            stale = [k for k, (t, _) in _CACHE.items() if t < cutoff]
            for k in stale:
                del _CACHE[k]

        return Response(
            payload_bytes,
            status=200,
            headers={
                "Content-Type": "application/json",
                "Content-Encoding": "gzip",
                "Cache-Control": f"public, max-age={_CACHE_TTL}",
                "X-Cache": "MISS",
            }
        )

    except Exception as e:
        print(f"[profile-data] error for {collection}/{uuid}: {e}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500
