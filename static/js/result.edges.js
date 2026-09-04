import emlo from "./edges.js";
import { getAddtionalFields } from "./helper/fields.js";
import { getLabel } from "./helper/getFieldLabls.js";
import {
  displayfields,
  stripValuePrefix,
  uuidFromUri,
} from "./helper/helper.js";
import { searchQueryObj } from "./search.js";

try {
  const queryObj = searchQueryObj();

  if (queryObj != null && queryObj.openingQuery != null) {
    emlo.openingQuery = queryObj.openingQuery;
  }
  emlo.selector = "emlo-results";
  emlo.template = new emlo.ResultTemplate();
  if (queryObj != null && queryObj.collection != "") {
    emlo.collection = queryObj.collection;

    emlo.components = [
      new emlo.Pagination({
        id: "top-pager",
        category: "top",
        renderer: new emlo.PaginationRenderer({
          scrollSelector: "#results",
        }),
      }),

      new emlo.Pagination({
        id: "bottom-pager",
        category: "bottom",
        renderer: new emlo.PaginationRenderer({
          scrollSelector: "#results",
        }),
      }),

      new emlo.Facet({
        id: "cito_Catalog",
        category: "refine_search",
        field: "cito_Catalog",
        display: "Catalogue  ",
        renderer: new emlo.FacetRenderer({
          open: true,
          title: "Catalogue ",
          showSelected: false,
          controls: false,
          displayLimit: 5,
          hideCount: 1,
        }),
      }),

      new emlo.Facet({
        id: "object_type",
        category: "refine_search",
        field: "object_type",
        display: "  Record Type  ",
        renderer: new emlo.FacetRenderer({
          open: true,
          title: "  Record Type  ",
          showSelected: false,
          controls: false,
          displayLimit: 5,
          hideCount: 1,
        }),
      }),

      new emlo.Facet({
        id: "selected",
        category: "selected_facets",
        renderer: new emlo.SelectedFacetRenderer({}),
      }),

      new emlo.ResultTable({
        id: "results",
        category: "results",
        secondaryResults: false,
        infiniteScroll: true,
        size: 20,
        infiniteScrollPageSize: 50,
        updateHeader: true,
        headerSelector: "result-header",
        renderer: new emlo.ResultTableRenderer({
          noResultsText: "No results to display",
          serialHeader: "",
          tableDisplay: [
            {
              header: "Type of record",
              field: "object_type",
              pre: "",
              post: "",
              type: "link",
              linkHref: "uuid",
              linkHrefPrefix: "/profile",
              valueFunction: _getTypeOfRecord,
            },
            {
              header: "Brief details",
              field: "_name",
              pre: "",
              post: "",
              valueFunction: _getBriefDetails,
            },
            {
              header: "Further details",
              field: "uuid",
              pre: "",
              post: "",
              type: "multiple",
              multipleFields: [
                { label: "Latitude", field: "geo_lat" },
                { label: "Longitude", field: "geo_long" },
                { label: "Alternative names", field: "skos_altLabel" },
                {
                  label: "Roles or titles",
                  field: "ox_titlesRolesOccupations",
                },
                {
                  label: "Year",
                  field: "ox_started-ox_year",
                },
                {
                  label: "",
                  field: "ox_titleOfResource",
                },
                {
                  label: "",
                  field: "bibo_Note",
                },
              ],
              valueFunction: _renderMultipleFields,
            },
            {
              header: "Where found",
              field: "",
              pre: "",
              post: "",
              valueFunction: _getAllMatchingFieldsHTML,
            },
            {
              header: "",
              field: "",
              pre: "*",
              post: "",
              valueFunction: null,
            },
          ],
          arrayValueJoin: ", ",
          omitFieldIfEmpty: true,
        }),
      }),
    ];
  } else {
    emlo.collection = "/solr/works/select";

    emlo.components = [
      new emlo.Sort({
        id: "sorting",
        category: "top",
        sortOptions: [
          {
            display: "Date Ascending",
            field: "started_date_sort",
            value: "date-a",
            order: "asc",
          },
          {
            display: "Date Descending",
            field: "started_date_sort",
            value: "date-d",
            order: "desc",
          },
          {
            display: "Author Ascending",
            field: "author_sort",
            value: "author-a",
            order: "asc",
          },
          {
            display: "Author Descending",
            field: "author_sort",
            value: "author-d",
            order: "desc",
          },
          {
            display: "Recipient Ascending",
            field: "recipient_sort",
            value: "recipient-a",
            order: "asc",
          },
          {
            display: "Recipient Descending",
            field: "recipient_sort",
            value: "recipient-d",
            order: "desc",
          },
          {
            display: "Origin Ascending",
            field: "origin_sort",
            value: "origin-a",
            order: "asc",
          },
          {
            display: "Origin Descending",
            field: "origin_sort",
            value: "origin-d",
            order: "desc",
          },
          {
            display: "Destination Ascending",
            field: "destination_sort",
            value: "destination-a",
            order: "asc",
          },
          {
            display: "Destination Descending",
            field: "destination_sort",
            value: "destination-d",
            order: "desc",
          },
        ],
        renderer: new emlo.SortRenderer({}),
      }),

      new emlo.Pagination({
        id: "top-pager",
        category: "top",
        renderer: new emlo.PaginationRenderer({
          scrollSelector: "#results",
        }),
      }),

      new emlo.Pagination({
        id: "bottom-pager",
        category: "bottom",
        renderer: new emlo.PaginationRenderer({
          scrollSelector: "#results",
        }),
      }),

      new emlo.Facet({
        id: "frbr_creator-person",
        category: "refine_search",
        field: "frbr_creator-person",
        display: "Author",
        renderer: new emlo.FacetRenderer({
          open: true,
          title: "Author",
          showSelected: false,
          controls: false,
          displayLimit: 5,
          hideCount: 1,
        }),
      }),

      new emlo.Facet({
        id: "mail_recipient-person",
        category: "refine_search",
        field: "mail_recipient-person",
        display: "Recipient",
        renderer: new emlo.FacetRenderer({
          open: true,
          title: "Recipient",
          showSelected: false,
          controls: false,
          displayLimit: 5,
          hideCount: 1,
        }),
      }),

      new emlo.Facet({
        id: "origin_sort",
        category: "refine_search",
        field: "origin_sort",
        display: "Origin of letter",
        renderer: new emlo.FacetRenderer({
          open: true,
          title: "Origin of letter",
          showSelected: false,
          controls: false,
          displayLimit: 5,
          hideCount: 1,
        }),
      }),

      new emlo.Facet({
        id: "destination_sort",
        category: "refine_search",
        field: "destination_sort",
        display: "Destination of letter ",
        renderer: new emlo.FacetRenderer({
          open: true,
          title: "Destination of letter ",
          showSelected: false,
          controls: false,
          displayLimit: 5,
          hideCount: 1,
        }),
      }),

      new emlo.Facet({
        id: "cito_Catalog",
        category: "refine_search",
        field: "cito_Catalog",
        display: "Catalogue ",
        renderer: new emlo.FacetRenderer({
          open: true,
          title: "Catalogue ",
          showSelected: false,
          controls: false,
          displayLimit: 5,
          hideCount: 1,
        }),
      }),

      new emlo.Facet({
        id: "ox_started-ox_year",
        category: "refine_search",
        field: "ox_started-ox_year",
        display: " Year ",
        renderer: new emlo.FacetRenderer({
          open: true,
          title: " Year ",
          showSelected: false,
          controls: false,
          displayLimit: 5,
          hideCount: 1,
        }),
      }),

      new emlo.Facet({
        id: "selected",
        category: "selected_facets",
        renderer: new emlo.SelectedFacetRenderer({}),
      }),

      new emlo.ResultTable({
        id: "results",
        category: "results",
        secondaryResults: false,
        infiniteScroll: true,
        updateHeader: true,
        headerSelector: "result-header",
        size: 20,
        infiniteScrollPageSize: 50,
        renderer: new emlo.ResultTableRenderer({
          noResultsText: `
          <div class="row small-12 large-9">
            <br>

            <p>
                No results found. We suggest that you...
                <button id="modify_search_result" class="small button modifysearchbtn">Modify your search</button>
            </p>
          </div>`,
          serialHeader: "",
          tableDisplay: [
            {
              header: "",
              field: "uuid",
              pre: "",
              post: "",
              linkText: "Letter",
              valueFunction: _redirectToProfile,
            },
            {
              header: "Date",
              field: "started_date_sort",
              pre: "",
              post: "",
              type: "date",
              valueFunction: _displayDate,
            },
            {
              header: "Author",
              field: "author_sort",
              pre: "",
              post: "",
              valueFunction: null,
            },
            {
              header: "Origin",
              field: "origin_sort",
              pre: "",
              post: "",
              valueFunction: null,
            },
            {
              header: "Addressee",
              field: "recipient_sort",
              pre: "",
              post: "",
              valueFunction: null,
            },
            {
              header: "Destination",
              field: "destination_sort",
              pre: "",
              post: "",
              valueFunction: null,
            },
            {
              header: "Repositories & Versions",
              field: "",
              pre: "",
              post: "",
              valueFunction: _displayRepoAndVersion,
            },
            {
              header: "Where found",
              field: "let_con",
              pre: "",
              post: "",
              valueFunction: _displayWhereFound,
            },
          ],
          arrayValueJoin: ", ",
          omitFieldIfEmpty: true,
        }),
      }),
    ];
  }

  emlo.init();
} catch (error) {
  console.error(error.message);
}

$(document).ready(function () {
  function checkQueryParams() {
    // Get the current URL's search parameters
    const queryParams = new URLSearchParams(window.location.search);

    // Hide first so we don't accidentally show both
    $("#return_browse, #modify_search").hide();

    // Check if there are any query parameters
    if (queryParams.toString()) {
      if (queryParams.get("uuids") || queryParams.get("browsing")) {
        $("#return_browse").show();
      } else {
        if (queryParams.size > 1) {
          $("#modify_search").show();
        }
      }
    }
  }

  // Run once at startup
  checkQueryParams();

  // Watch for DOM changes
  const observer = new MutationObserver(() => {
    checkQueryParams();
  });

  // Observe entire document body
  observer.observe(document.body, { childList: true, subtree: true });
});

// $(document).ready(function () {
//   // Get the current URL's search parameters
//   const queryParams = new URLSearchParams(window.location.search);

//   // Check if there are any query parameters
//   if (queryParams.toString()) {
//     if (queryParams.get("uuids") || queryParams.get("browsing")) {
//       $("#return_browse").show();
//     } else {
//       $("#modify_search").show();
//     }
//   }
// });

function _displayWhereFound(val, res, fieldName, edge) {
  const urlParams = new URLSearchParams(window.location.search);
  const shouldCall = urlParams.has("let_con"); // replace with actual param name

  if (shouldCall) {
    return _getAllMatchingFieldsHTML(val, res, fieldName, edge);
  }
}

// Relation keys used to find the record a comment/resource row points at.
const _RELATION_KEYS = {
  comment: {
    work: [
      "bibo_annotates-work",
      "ox_annotatesDate-work",
      "ox_annotatesAuthor-work",
      "ox_annotatesAddressee-work",
      "ox_annotatesAgentsReferenced-work",
    ],
    person: ["bibo_annotates-person"],
    location: ["bibo_annotates-location"],
    manifestation: ["bibo_annotates-manifestation"],
  },
  resource: {
    work: ["rdfs_seeAlso-work"],
    person: ["rdfs_seeAlso-person"],
  },
};

function _relatedRefForRow(res) {
  const rel = _RELATION_KEYS[res && res.object_type];
  if (!rel) return null;
  for (const [type, keys] of Object.entries(rel)) {
    for (const key of keys) {
      if (res[key]) return { type, uuid: uuidFromUri(res[key][0]) };
    }
  }
  return null;
}

// Bulk-fetch every related record referenced by comment/resource rows in ONE
// /stats-new call (solrCore "all") instead of one GET per row.
const _relatedEnrichmentCache = new Map(); // uuid -> doc | null
let _relatedEnrichmentInFlight = null;

async function _ensureRelatedEnrichment(renderer) {
  // Let any fetch already running finish before we decide what is still missing.
  while (_relatedEnrichmentInFlight) await _relatedEnrichmentInFlight;

  const results =
    (renderer && renderer.component && renderer.component.results) || [];

  const missing = new Set();
  for (const res of results) {
    const ref = _relatedRefForRow(res);
    if (ref && ref.uuid && !_relatedEnrichmentCache.has(ref.uuid)) {
      missing.add(ref.uuid);
    }
  }

  if (missing.size === 0) return;

  _relatedEnrichmentInFlight = (async () => {
    try {
      const response = await fetch("/stats-new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          solrCore: "all",
          objectKey: "uuid",
          uuids: [...missing],
          filter: "",
        }),
      });
      if (response.ok) {
        const docs = await response.json();
        for (const doc of Array.isArray(docs) ? docs : []) {
          if (doc && doc.uuid) _relatedEnrichmentCache.set(doc.uuid, doc);
        }
      } else {
        console.error(`Failed to fetch related records: ${response.status}`);
      }
    } catch (err) {
      console.error("Error while fetching related-record enrichment", err);
    } finally {
      for (const id of missing) {
        if (!_relatedEnrichmentCache.has(id)) {
          _relatedEnrichmentCache.set(id, null);
        }
      }
      _relatedEnrichmentInFlight = null;
    }
  })();

  return _relatedEnrichmentInFlight;
}

function _renderMultipleFields(val, res, fieldName, edge) {
  if (!res?.object_type) return "";

  let objectType = res.object_type;


  if (objectType === "image") return "";

  const htmlParts = [];

  let inferredType = objectType;
  let uuid = "";
  const possibleRelation = _RELATION_KEYS[objectType];

  if (possibleRelation) {
    const ref = _relatedRefForRow(res);
    if (ref) {
      inferredType = ref.type;
      uuid = ref.uuid;
      _ensureRelatedEnrichment(edge).then(() => {
        const doc = _relatedEnrichmentCache.get(uuid);
        const fields = displayfields[inferredType];
        let data = [];

        for (const [label, fieldKey] of Object.entries(fields)) {
          if (doc?.[fieldKey]) {
            data.push(`${doc[fieldKey]}`);
          }
        }
        const div = document.getElementById(uuid);
        if (div) {
          div.innerHTML = data.join("");
        }
      });
    }
  }

  const fields = getAddtionalFields(inferredType);
  for (const [label, fieldKey] of Object.entries(fields)) {
    if (res?.[fieldKey]) {
      let lines = res[fieldKey];

      if(typeof lines == "string") {
        lines = lines.replace(/shelf_/g, '');
      }
      
      htmlParts.push(`<div>${label}: ${lines}</div>`);
    } else {
      if (["comment", "resource"].includes(res["object_type"])) {
        htmlParts.push(`<p id=${uuid}></p>`);
      }
    }
  }

  return htmlParts.join("");
}

function _getTypeOfRecord(val, res, fieldName, edge, currentIndex) {
  const total = edge.total(); // Total number of items
  const start = currentIndex;

  if (!val) {
    return "";
  }

  const objectMap = {
    comment: "Document commented on ",
    person: "Person or organization ",
    location: "Location",
    work: "Letter",
    institution: "Repository",
    image: "Image",
    manifestation: "Document",
  };

  let profileKey = val;
  let uuid = res["uuid"];
  let value = "";

  if (objectMap[val]) {
    value = objectMap[val];
  }

  const label = getLabel(val);

  if (label != "-") {
    value = label;
  }

  let relation = "";

  const relationMap = {
    comment: {
      work: [
        "bibo_annotates-work",
        "ox_annotatesDate-work",
        "ox_annotatesAuthor-work",
        "ox_annotatesAddressee-work",
        "ox_annotatesAgentsReferenced-work",
      ],
      person: ["bibo_annotates-person"],
      location: ["bibo_annotates-location"],
      manifestation: ["bibo_annotates-manifestation"],
    },
    resource: {
      work: ["rdfs_seeAlso-work"],
      person: ["rdfs_seeAlso-person"],
    },
  };

  const possibleRelation = relationMap[val];

  if (possibleRelation) {
    outer: for (const [type, keys] of Object.entries(possibleRelation)) {
      for (const key of keys) {
        if (res?.[key]) {
          relation = key;
          uuid = uuidFromUri(res[key][0]);
          profileKey = type;
          break outer;
        }
      }
    }
  }

  if (relation) {
    value = getLabel(relation);
  }

  // Retrieve existing query parameters from the current URL
  const urlParams = new URLSearchParams(window.location.search);

  // Initialize a query string for new or updated parameters
  let queryParams = new URLSearchParams(urlParams);

  // Always set 'start' and 'numFound' if they are relevant
  queryParams.set("start", start - 1);
  queryParams.set("numFound", total);
  queryParams.set("type", "quick");

  // Ensure all other parameters from the current URL are maintained
  ["sort", "letter", "browsing", "uuids"].forEach((param) => {
    if (urlParams.has(param)) {
      queryParams.set(param, urlParams.get(param)); // Keep the existing query value
    }
  });

  let baseURL = `/profile/${profileKey}/${uuid}`;

  // Final URL construction: Base URL + query parameters
  const finalUrl = `${baseURL}?${queryParams.toString()}`;

  return `<a href='${finalUrl}'> ${value} </a> `;
}

function _getBriefDetails(val, res, fieldName) {
  if (typeof res !== "object" || res === null) {
    console.log("Invalid input: res is not an object");
    return null;
  }

  for (const key in res) {
    if (Object.hasOwn(res, key)) {
      if (key.endsWith(fieldName)) {
        return res[key];
      }
    }
  }

  if (res && res.hasOwnProperty("object_type")) {
    const objectType = res["object_type"];
    if (displayfields.hasOwnProperty(objectType)) {
      const field = displayfields[objectType]?.value;

      if (res.hasOwnProperty(field)) {
        return res[field];
      }

      return "";
    }
  }

  // Fail safe code since the above one added later
  // Returning hardcoded bibo_Note - this is default in case of comment, since rest of the object have _name and for work
  if (res["bibo_Note"]) {
    return res["bibo_Note"];
  }

  if (res["dcterms_description"]) {
    return res["dcterms_description"];
  }

  if (res && res.hasOwnProperty("foaf_thumbnail")) {
    return res["foaf_thumbnail"];
  }

  if (res && res.hasOwnProperty("dcterms_type")) {
    return res["dcterms_type"];
  }

  return "";
}
function _getAllMatchingFieldsHTML(val, res, fieldName, edge) {
  if (typeof res !== "object" || res === null) {
    console.log("Invalid input: res is not an object");
    return "<div>Invalid input</div>";
  }

  if (edge && edge.component && edge.component.highlighting) {
    if (res["id"] && edge.component.highlighting.hasOwnProperty(res["id"])) {
      const highlights = edge.component.highlighting[res.id];
      const results = [];

      // Convert to entries and map to include label
      const entriesWithLabels = Object.entries(highlights).map(
        ([key, value]) => ({
          key,
          label: getLabel(key),
          value,
        })
      );

      // Sort by label
      entriesWithLabels.sort((a, b) => a.label.localeCompare(b.label));

      // Build results
      for (const { label, value } of entriesWithLabels) {
        const lines = value.join("");

        const result = lines.replace(/shelf_/g, '');
        results.push(
          `<p class="highlighter">Found in <strong>${label}</strong>:<br>${result}<p>`
        );
      }

      return `<div>${results.join("")}</div>`;
    } else {
      return "";
    }
  } else {
    return "";
  }
}

function _redirectToProfile(val, res, fieldName, edge, currentIndex) {
  const total = edge.total(); // Total number of items
  let start = currentIndex - 1; // Current start index
  const baseURL = `/profile/work/${val}`;

  if (start < 0) {
    start = 0;
  }
  // Retrieve existing query parameters from the current URL
  const urlParams = new URLSearchParams(window.location.search);

  // Initialize a query string for new or updated parameters
  let queryParams = new URLSearchParams(urlParams);

  // Always set 'start' and 'numFound' if they are relevant
  queryParams.set("start", start);
  queryParams.set("numFound", total);
  queryParams.set("type", "advanced");

  // Ensure all other parameters from the current URL are maintained
  ["sort", "letter", "browsing", "uuids"].forEach((param) => {
    if (urlParams.has(param)) {
      queryParams.set(param, urlParams.get(param)); // Keep the existing query value
    }
  });

  // Final URL construction: Base URL + query parameters
  const finalUrl = `${baseURL}?${queryParams.toString()}`;

  // Return the anchor tag with the correct URL
  return `<a href='${finalUrl}'> Letter </a>`;
}

function _displayDate(val, res) {
  // Data from this.component.results[0]
  const result = res;
  // Month names array
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Get the date fields
  const startDay = result["ox_started-ox_day"] || "";
  const startMonth = result["ox_started-ox_month"] || ""; // Default to 13 (invalid month)
  const startYear = result["ox_started-ox_year"] || "";

  const endDay = result["ox_completed-ox_day"] || "";
  const endMonth = result["ox_completed-ox_month"] || 13; // Default to 13 (invalid month)
  const endYear = result["ox_completed-ox_year"] || "";

  const isValidMonth = (m) => Number.isInteger(m) && m >= 1 && m <= 12;

  const formatDate = (day, month, year) => {
    const parts = [];
    if (day) parts.push(day);
    if (isValidMonth(month)) parts.push(months[month - 1]);
    if (year) parts.push(year);

    return parts.join(" ");
  };

  // Construct the date string for the start
  let date = formatDate(startDay, startMonth, startYear);

  // Check if the date is a range
  const isRange = result["ox_dateIsRange"] || false;

  // Construct the date string for the end
  let dateTo = formatDate(endDay, endMonth, endYear);

  // Remove spaces from the date strings
  const dateNoSpaces = date.replace(" ", "");
  const dateToNoSpaces = dateTo.replace(" ", "");

  // Handle cases where the date strings are empty
  if (dateNoSpaces + dateToNoSpaces === "") {
    date = "Unknown date";
  }

  // Output the date information
  if (!isRange) {
    return `${date}`;
  } else if (dateNoSpaces > "" && dateToNoSpaces > "") {
    return `Between ${date} and ${dateTo}`;
  } else if (dateNoSpaces > "") {
    return `On or after ${date}`;
  } else {
    return `On or before ${dateTo}`;
  }
}

// Per-manifestation enrichment cache (uuid -> { dcterms_type?, shelf?, repoName? } | null).
// Shared across all rows and across infinite-scroll pages so a manifestation is
// only ever fetched once.
const _manifEnrichmentCache = new Map();
let _manifEnrichmentInFlight = null;

const MANIF_FIELD = "frbr_Manifestation-manifestation";

// Collect every manifestation uuid still missing from the cache across the
// currently-loaded result rows, and fetch them all in ONE /result-enrichment
// request. All rows rendered in the same pass await the same promise.
async function _ensureManifEnrichment(renderer) {
  // Let any fetch already running finish before we decide what is still missing.
  while (_manifEnrichmentInFlight) await _manifEnrichmentInFlight;

  const results =
    (renderer && renderer.component && renderer.component.results) || [];

  const missing = new Set();
  for (const res of results) {
    const uris = res && res[MANIF_FIELD];
    if (!uris) continue;
    for (const uri of Array.isArray(uris) ? uris : [uris]) {
      const id = uri.split("/").pop();
      if (id && !_manifEnrichmentCache.has(id)) missing.add(id);
    }
  }

  if (missing.size === 0) return;

  _manifEnrichmentInFlight = (async () => {
    try {
      const response = await fetch("/result-enrichment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manifestation_uuids: [...missing] }),
      });
      if (response.ok) {
        const data = await response.json();
        for (const [id, entry] of Object.entries(data || {})) {
          _manifEnrichmentCache.set(id, entry);
        }
      } else {
        console.error(
          `Failed to fetch result enrichment: ${response.status}`
        );
      }
    } catch (err) {
      console.error("Error while fetching result enrichment", err);
    } finally {
      // Anything Solr didn't return: cache as null so we don't retry forever.
      for (const id of missing) {
        if (!_manifEnrichmentCache.has(id)) _manifEnrichmentCache.set(id, null);
      }
      _manifEnrichmentInFlight = null;
    }
  })();

  return _manifEnrichmentInFlight;
}

async function _displayRepoAndVersion(val, item, field, element, index) {
  const reposDetails = [];

  if (!item.hasOwnProperty(MANIF_FIELD)) {
    return "";
  }

  const manifUris = item[MANIF_FIELD];
  const manifUriList = Array.isArray(manifUris) ? manifUris : [manifUris];

  if (manifUriList.length > 0) {
    await _ensureManifEnrichment(element);

    let numPrintedEds = 0;

    for (const uri of manifUriList) {
      const manifUuid = uri.split("/").pop();
      const manifFieldDict = _manifEnrichmentCache.get(manifUuid);
      if (!manifFieldDict) continue;

      let documentLocationString = "";
      let reposNameAndLocation = "";
      let shelfmark = "";
      let documentType = "";

      if (manifFieldDict.hasOwnProperty("dcterms_type")) {
        documentType = manifFieldDict["dcterms_type"];
      }

      if (manifFieldDict.hasOwnProperty("shelf")) {
        shelfmark = stripValuePrefix(manifFieldDict["shelf"], "shelf_");
      }

      if (manifFieldDict.hasOwnProperty("repoName")) {
        const reposFieldList = [];
        if (manifFieldDict["repoName"]) {
          reposFieldList.push(manifFieldDict["repoName"]);
        }
        reposNameAndLocation = reposFieldList.join(", ");
      }

      if (reposNameAndLocation && shelfmark) {
        documentLocationString = `${reposNameAndLocation}: ${shelfmark}`;
      } else if (reposNameAndLocation) {
        documentLocationString = reposNameAndLocation;
      } else if (shelfmark) {
        documentLocationString = shelfmark;
      } else if (documentType.startsWith("Printed")) {
        numPrintedEds += 1;
      }

      if (documentLocationString) {
        reposDetails.push(documentLocationString);
      }
    }

    if (numPrintedEds > 1) {
      reposDetails.push(`${numPrintedEds} printed editions`);
    } else if (numPrintedEds === 1) {
      reposDetails.push(`1 printed edition`);
    }
  }

  if (reposDetails.length === 0) return "";

  const listItems = reposDetails
    .map((detail) => `${reposDetails.length > 1 ? "• " : ""}${detail} <br/>`)
    .join("");

  const el = document.getElementById(`repo-${index}`);

  if (el) {
    el.innerHTML = `${listItems}`;
  }
}
