import emloEdges from "./edges.js";

try {
  emloEdges.selector = "emlo-browse-list";
  emloEdges.collection = "/solr/works/select";
  emloEdges.components = [
    new edges.components.RefiningANDTermSelector({
      id: "author_sort",
      category: "facet",
      field: "author_sort",
      display: "Authors",
      renderer: new edges.renderers.bs3.RefiningANDTermSelector({
        open: true,
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
