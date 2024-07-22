import emloEdges from "./edges.js";

try {
  emloEdges.selector = "emlo-search";
  emloEdges.collection = "/solr/works/select";
  emloEdges.components = [
    new edges.components.FullSearchController({
      id: "search-controller",
      category: "controller",
      defaultOperator: "AND",
      defaultField: "author_sort",
      renderer: new edges.renderers.bs3.FullSearchController({
        freetextSubmitDelay: 0,
        searchButton: false,
        searchPlaceholder: "Search for anything",
        clearButton: false,
        searchButtonText: "Search",
      }),
    }),
    new edges.components.ResultsDisplay({
      id: "results",
      category: "results",
      renderer: new edges.renderers.bs3.ResultsFieldsByRow({
        rowDisplay: [
          [{ field: "cito_Catalog" }],
          [
            {
              pre: "<strong>Editor Group</strong>: ",
              field: "author_sort",
            },
          ],
        ],
      }),
    }),
  ];

  emloEdges.init();
} catch (error) {
  console.error(error.message);
}
