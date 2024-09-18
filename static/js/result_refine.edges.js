import emlo from "./edges.js";

try {
  emlo.selector = "emlo-refine-search";
  emlo.collection = "/solr/works/select";
  emlo.components = [
    new edges.components.RefiningANDTermSelector({
        id: "author_sort",
        category: "facet",
        field: "author_sort",
        display: "Authors",
        renderer: new edges.renderers.bs3.RefiningANDTermSelector({
            open: true,
            title : "Authors",
            showSelected : false,
        }),
    }),

    new edges.components.RefiningANDTermSelector({
        id: "cito_Catalog",
        category: "facet",
        field: "cito_Catalog",
        display: "Nanu",
        renderer: new edges.renderers.bs3.RefiningANDTermSelector({
            open: true,
            title : "Receveirs",
            showSelected : false
        }),
    }),
  ];

  emlo.init();
} catch (error) {
  console.error(error.message);
}
