from flask import Blueprint, jsonify, request
import requests
import os
from concurrent.futures import ThreadPoolExecutor, as_completed
from dotenv import load_dotenv
from urllib.parse import urlparse

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


@solr_bp.route('/collection-year-data/<institution_uuid>', methods=['GET'])
def fetchCollectionYearData(institution_uuid):
    """
    Two-step server-side join: institution UUID → manifestation UUIDs → work year data.
    Avoids sending tens of thousands of UUIDs from the browser (which hits nginx body size limits).
    """
    try:
        SOLR_URL = getSolrURL()

        # Step 1: get all manifestation UUIDs related to this institution
        mani_resp = requests.get(
            f"{SOLR_URL}manifestations/select",
            params={'q': f'uuid_related:{institution_uuid}', 'fl': 'uuid', 'rows': 200000, 'wt': 'json'}
        )
        mani_resp.raise_for_status()
        mani_uuids = [doc['uuid'] for doc in mani_resp.json().get('response', {}).get('docs', [])]

        if not mani_uuids:
            return jsonify([])

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