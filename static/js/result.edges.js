import emlo from "./edges.js";

try {

  // Fetching URL params
  const queryString = window.location.search

  if(queryString) {
    const params = new URLSearchParams(queryString)
   
    emlo.openingQuery = {
      must: [],
    }

    const people = params.get("people")
    const fromDate = params.get("dat_from_year")
    const toDate = params.get("dat_to_year")
    const locations = params.get("locations")
    const content = params.get("let_con")

    if(people) {
      emlo.openingQuery.must.push({
        term : { "author_sort" : people }
      })
    }

    if(fromDate && toDate) {
      emlo.openingQuery.must.push({
        term : { "author_sort" : people }
      })
    }

    if(locations) {
      emlo.openingQuery.must.push({
        term : { "author_sort" : people }
      })
    }

    if(content) {
      emlo.openingQuery.must.push({
        term : { "author_sort" : people }
      })
    }
    
  }

  emlo.selector = "emlo-results";
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
      })
    }),

    new edges.components.Pager({
      id: "bottom-pager",
      category: "bottom-pager",
      renderer: new edges.renderers.bs3.Pager({
        scrollSelector: "#results",
        showSizeSelector: false,
        showRecordCount: false,
        showChevrons: true,
      })
    }),

    new emlo.ResultTable({
      id: "results",
      category: "results",
      secondaryResults: false,
      infiniteScroll: true,
      infiniteScrollPageSize: 50,
      renderer: new emlo.ResultTableRenderer({
        noResultsText: "No results to display",
        serialHeader: "",
        tableDisplay: [
          {
            header: "Date",
            field: "cito_Catalog",
            pre: '<a href="mailto:',
            post: '">',
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
            field: "author_sort",
            pre: "",
            post: "",
            valueFunction: null,
          },
          {
            header: "Addressee",
            field: "author_sort",
            pre: "",
            post: "",
            valueFunction: null,
          },
          {
            header: "Destination",
            field: "author_sort",
            pre: "",
            post: "",
            valueFunction: null,
          },
          {
            header: "Repositories & Versions",
            field: "author_sort",
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
  console.log("emlo" , emlo)
  emlo.init();
} catch (error) {
  console.error(error.message);
}
