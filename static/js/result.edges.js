import emlo from "./edges.js";
import { searchQueryObj } from "./search.js";

try {
  const queryObj = searchQueryObj();

  if (queryObj && queryObj.openingQuery != null) {
    emlo.openingQuery = queryObj.openingQuery;
  }
  emlo.selector = "emlo-results";

  if (queryObj && queryObj.collection != "") {
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
  let currentDoc = document.getElementById("result-header");

  if (emlo && emlo.active && emlo.active[selector]) {
    const activeRes = emlo.active[selector];

    if (
      activeRes.result &&
      activeRes.result.data &&
      activeRes.result.data.response &&
      activeRes.result.data.response.numFound
    ) {
      if (activeRes.result.data.response.numFound > 50) {
        currentDoc.innerHTML = `${activeRes.result.data.response.numFound} results (50 result per page)`;
        return;
      } else {
        currentDoc.innerHTML = `${activeRes.result.data.response.numFound} results`;
        return;
      }
    }
  }
  currentDoc.innerHTML = "";
}

window.onload = () => {
  generateResultHeader("emlo-results");
};
