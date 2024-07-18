const emloEdges = {
  active: {},
  selector: "",
  solrURL: "http://localhost:7812",
  collection: "",
  template: null,
  components: [],

  init: function () {
    if (!this.selector || !this.solrURL || !this.collection) {
      throw new Error("Selector, Solr URL, and collection must be provided.");
    }

    if (!this.template) {
      this.template = new edges.templates.bs3.Facetview();
    }

    console.log("Initializing...");
    this.active[this.selector] = new edges.Edge({
      selector: `#${this.selector}`,
      searchUrl: `${this.solrURL}${this.collection}`,
      template: this.template,
      queryAdapter: new edges.es.SolrQueryAdapter(),
      components: this.components,
    });
  },
};

export default emloEdges;
