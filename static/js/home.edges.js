import emloEdges from "./edges.js";

try {
  emloEdges.selector = "home-search";
  emloEdges.collection = "/solr/works/select";
  emloEdges.components = [
    new edges.components.FullSearchController({
      id: "search-controller",
      category: "controller",
      defaultOperator: "AND",
      defaultField: "author_sort",
      renderer: new edges.renderers.bs5.SearchBox({
        freetextSubmitDelay: -1,
        clearButton: false,
        searchPlaceholder: "all people",
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
