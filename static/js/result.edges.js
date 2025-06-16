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
        size: 5000,
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
        size: 5000,
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
        size: 5000,
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
        size: 5000,
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
        size: 5000,
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
        size: 5000,
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
                <button class="small button modifysearchbtn" onclick="modifyCurrentSearch()">Modify your search</button>
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
  // Get the current URL's search parameters
  const queryParams = new URLSearchParams(window.location.search);

  // Check if there are any query parameters
  if (queryParams.toString()) {
    if (queryParams.get("uuids") || queryParams.get("browsing")) {
      $("#return_browse").show();
    } else {
      $("#modify_search").show();
    }
  }
});

function _testValueFunction(val, res, self) {
  // console.log("got vals", val, res, self);
}

function _displayWhereFound(val, res, fieldName, edge) {
  const urlParams = new URLSearchParams(window.location.search);
  const shouldCall = urlParams.has("let_con"); // replace with actual param name

  if (shouldCall) {
    return _getAllMatchingFieldsHTML(val, res, fieldName, edge);
  }
}

function _renderMultipleFields(val, res, fieldName) {
  if (res && res.hasOwnProperty("object_type")) {
    // New requirement don't want further details for images
    if (res["object_type"] == "image") {
      return "";
    }

    const htmlParts = [];

    const fields = getAddtionalFields(res["object_type"]);

    for (const key in fields) {
      const fieldKey = fields[key];

      if (res.hasOwnProperty(fieldKey) && res[fieldKey]) {
        const value = res[fieldKey];
        htmlParts.push(`<div>${key}: ${value}</div>`);
      }
    }

    return htmlParts.join("");
  } else {
    return "";
  }
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
    institution: "Institution",
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
  queryParams.set("start", start);
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
  console.log("displayfields", displayfields, val, res["object_type"]);
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
        results.push(
          `<p class="highlighter">Found in <strong>${label}</strong>:<br>${lines}<p>`
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
  const start = currentIndex; // Current start index
  const baseURL = `/profile/work/${val}`;

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

async function _displayRepoAndVersion(val, item, field, element, index) {
  const reposDetails = [];

  const manifFieldname = "frbr_Manifestation-manifestation";
  if (!item.hasOwnProperty(manifFieldname)) {
    return "";
  }

  const manifUris = item[manifFieldname];
  if (manifUris.length > 0) {
    const fieldsToGet = [
      "dcterms_type",
      "ox_resourceAt-institution",
      "dcterms_identifier-shelf_",
    ];

    const manifUuidDict = await getRecordsFromSolr(
      Array.isArray(manifUris) ? manifUris : [manifUris],
      fieldsToGet,
      "manifestation"
    );

    const repoFieldsToGet = ["geonames_officialName"];

    let numPrintedEds = 0;

    for (const [manifUuid, manifFieldDict] of Object.entries(manifUuidDict)) {
      let documentLocationString = "";
      let reposNameAndLocation = "";
      let shelfmark = "";
      let documentType = "";

      if (manifFieldDict.hasOwnProperty("dcterms_type")) {
        documentType = manifFieldDict["dcterms_type"];
      }

      if (manifFieldDict.hasOwnProperty("dcterms_identifier-shelf_")) {
        const val = manifFieldDict["dcterms_identifier-shelf_"];
        shelfmark = stripValuePrefix(val, "shelf_");
      }

      if (manifFieldDict.hasOwnProperty("ox_resourceAt-institution")) {
        const reposUriList = manifFieldDict["ox_resourceAt-institution"];
        if (reposUriList.length > 0) {
          const reposUuidDict = await getRecordsFromSolr(
            Array.isArray(reposUriList) ? reposUriList : [reposUriList],
            repoFieldsToGet,
            "institution"
          );

          for (const [reposUuid, reposFieldDict] of Object.entries(
            reposUuidDict
          )) {
            let reposName = "";
            let reposCity = "";
            let reposCountry = "";

            for (const [reposFieldname, reposFieldval] of Object.entries(
              reposFieldDict
            )) {
              if (reposFieldname === "geonames_officialName") {
                reposName = reposFieldval;
              } else if (reposFieldname === "geonames_locatedIn") {
                reposCity = reposFieldval;
              } else if (reposFieldname === "geonames_inCountry") {
                reposCountry = reposFieldval;
              }
            }

            const reposFieldList = [];
            if (reposName) reposFieldList.push(reposName);
            if (reposCity) reposFieldList.push(reposCity);
            if (reposCountry) reposFieldList.push(reposCountry);
            reposNameAndLocation = reposFieldList.join(", ");
          }
        }
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

  // Build <ul><li>...</li></ul> HTML
  if (reposDetails.length === 0) return "";

  const listItems = reposDetails
    .map((detail) => `${reposDetails.length > 1 ? "• " : ""}${detail} <br/>`)
    .join("");

  // FIXME: Need a better code for rendering the data
  const el = document.getElementById(`repo-${index}`);

  if (el) {
    el.innerHTML = `${listItems}`;
  }
}

async function getRecordsFromSolr(uris, fieldsToGet, core) {
  const uuids = uris.map((uri) => uri.split("/").pop());

  const payload = {
    solrCore: core,
    uuids: uuids,
    filter: fieldsToGet,
  };

  const response = await fetch("/stats-new", {
    // <-- Update your actual API endpoint
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch records from Solr: ${response.status}`);
  }

  return await response.json();
}
