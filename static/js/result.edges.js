import emlo from "./edges.js";
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
                  label: "Titles or roles",
                  field: "ox_titlesRolesOccupations",
                },
                {
                  label: "Year",
                  field: "ox_started-ox_year",
                },
              ],
              valueFunction: null,
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
      // new emlo.SortSelect({
      //   id: "sorting",
      //   category: "top",
      //   sortOptions: [
      //     {
      //       display: "Name Ascending",
      //       value: "name_asc",
      //       field: "started_date_sort",
      //       order: "asc",
      //     },
      //     {
      //       display: "Name Descending",
      //       value: "name_desc",
      //       field: "started_date_sort",
      //       order: "desc",
      //     },
      //   ],
      //   renderer: new emlo.SortSelectRenderer({}),
      // }),

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
        id: "author_sort",
        category: "refine_search",
        field: "author_sort",
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
        id: "recipient_sort",
        category: "refine_search",
        field: "recipient_sort",
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
        size: 20,
        infiniteScrollPageSize: 50,
        renderer: new emlo.ResultTableRenderer({
          noResultsText: "No results to display",
          serialHeader: "",
          tableDisplay: [
            {
              header: "",
              field: "uuid",
              pre: "",
              post: "",
              type: "link",
              linkHrefPrefix: "/profile/work",
              linkText: "Letter",
              valueFunction: null,
            },
            {
              header: "Date",
              field: "started_date_sort",
              pre: "",
              post: "",
              type: "date",
              valueFunction: null,
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
              valueFunction: null,
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

function generateResultHeader(selector) {
  try {
    let currentDoc = document.getElementById("result-header");

    // Check if the fetching process is active
    if (!emlo || !emlo.active || !emlo.active[selector]) {
      currentDoc.innerHTML = "Loading results...";
      return;
    }

    const activeRes = emlo.active[selector];

    // Check if results are fetched correctly
    if (
      activeRes.result &&
      activeRes.result.data &&
      activeRes.result.data.response &&
      activeRes.result.data.response.numFound
    ) {
      const numFound = activeRes.result.data.response.numFound;
      if (numFound > 50) {
        currentDoc.innerHTML = `${numFound} results (50 results per page)`;
      } else {
        currentDoc.innerHTML = `${numFound} results`;
      }
    } else {
      // Fallback message when results are not fetched
      currentDoc.innerHTML = "No results found.";
    }
  } catch (err) {
    console.error(err);
  }
}

// Retry fetching results after a delay
function checkResultsWithRetry(selector, retries = 5, delay = 2000) {
  let attempt = 0;

  const intervalId = setInterval(() => {
    generateResultHeader(selector);
    attempt++;
    if (attempt >= retries) {
      clearInterval(intervalId);
    }
  }, delay);
}

window.onload = () => {
  // Call the function initially
  generateResultHeader("emlo-results");

  // Set up a retry mechanism to check results
  checkResultsWithRetry("emlo-results");
};

$(document).ready(function () {
  // Get the current URL's search parameters
  const queryParams = new URLSearchParams(window.location.search);

  // Check if there are any query parameters
  if (queryParams.toString()) {
    $("#modify_search").show();
  }
});

function _testValueFunction(val, res, self) {
  // console.log("got vals", val, res, self);
}

function _getTypeOfRecord(val, res, fieldName) {
  const objectMap = {
    comment: "Document commented on ",
    person: " Person or organisation ",
    location: "Location",
    work: "Letter",
  };

  if (objectMap[val]) {
    return objectMap[val];
  }

  return val;
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

  // TODO:L write a better code to handle this values from the object not hardcoded
  // Returning hardcoded bibo_Note - this is default in case of comment, since rest of the object have _name and for work
  if (res["bibo_Note"]) {
    return res["bibo_Note"];
  }

  if (res["dcterms_description"]) {
    return res["dcterms_description"];
  }

  return "";
}
function _getAllMatchingFieldsHTML(val, res, fieldName) {
  if (typeof res !== "object" || res === null) {
    console.log("Invalid input: res is not an object");
    return "<div>Invalid input</div>";
  }

  let currentVal = val;

  if (!currentVal) {
    currentVal = _getBriefDetails("", res, "_name");
  }

  const results = [];
  for (const key in res) {
    if (Object.hasOwn(res, key)) {
      if (
        currentVal != "" &&
        typeof res[key] == "string" &&
        res[key].includes(currentVal)
      ) {
        results.push(
          `Found in <strong>${key}</strong>: ${key} = ${currentVal}`
        );
      }
    }
  }

  // Join results with \n\n and wrap in a div
  return `<div>${results.join("\n\n")}</div>`;
}
