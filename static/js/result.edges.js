import emlo from "./edges.js";

try {
  emlo.selector = "emlo-results";
  emlo.collection = "/solr/works/select";
  emlo.components = [
    new emlo.ResultTable({
      id: "results",
      category: "results",
      secondaryResults: false,
      infiniteScroll: true,
      infiniteScrollPageSize: 10,
      renderer: new emlo.ResultTableRenderer({
        noResultsText: "No results to display",
        serialHeader: "",
        tableDisplay: [
          {
            header: "Cito catalog",
            field: "cito_Catalog",
            pre: '<a href="mailto:',
            post: '">',
            valueFunction: null,
          },
          {
            header: "Name",
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

  emlo.init();
} catch (error) {
  console.error(error.message);
}
