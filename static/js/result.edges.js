import emlo from "./edges.js";
import { searchQueryObj } from "./search.js";

try {
  const queryObj = searchQueryObj();

  if (queryObj != null && queryObj.openingQuery != null) {
    emlo.openingQuery = queryObj.openingQuery;
  }
  emlo.selector = "emlo-results";

  if (queryObj != null && queryObj.collection != "") {
    emlo.collection = queryObj.collection;

    emlo.components = [
      new edges.components.Pager({
        id: "top-pager",
        category: "top-pager",
        renderer: new edges.renderers.bs3.Pager({
          scrollSelector: "#results",
          showSizeSelector: false,
          showRecordCount: false,
          showChevrons: true,
        }),
      }),

      new edges.components.Pager({
        id: "bottom-pager",
        category: "bottom-pager",
        renderer: new edges.renderers.bs3.Pager({
          scrollSelector: "#results",
          showSizeSelector: false,
          showRecordCount: false,
          showChevrons: true,
        }),
      }),

      new emlo.ResultTable({
        id: "results",
        category: "main",
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
              valueFunction: null,
            },
            {
              header: "Brief details",
              field: "bibo_Note",
              pre: "",
              post: "",
              valueFunction: null,
            },
            {
              header: "Further details",
              field: "author_sort",
              pre: "",
              post: "",
              valueFunction: null,
            },
            {
              header: "Where found",
              field: "",
              pre: "",
              post: "",
              valueFunction: null,
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
      new edges.components.Pager({
        id: "top-pager",
        category: "top-pager",
        renderer: new edges.renderers.bs3.Pager({
          scrollSelector: "#results",
          showSizeSelector: false,
          showRecordCount: false,
          showChevrons: true,
        }),
      }),

      new edges.components.Pager({
        id: "bottom-pager",
        category: "bottom-pager",
        renderer: new edges.renderers.bs3.Pager({
          scrollSelector: "#results",
          showSizeSelector: false,
          showRecordCount: false,
          showChevrons: true,
        }),
      }),

      new edges.components.RefiningANDTermSelector({
        id: "author_sort",
        category: "refine_search",
        field: "author_sort",
        display: "Author",
        renderer: new emlo.FacetRenderer({
          open: true,
          title: "Author",
          showSelected: false,
          controls: false,
        }),
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
              field: "resources",
              pre: "",
              post: "",
              type: "link",
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
              field: "pla_des_name",
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
