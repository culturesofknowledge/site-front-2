// const emloEdges = {
//   active: {},
//   selector: "",
//   solrURL: ,
//   collection: "",
//   template: null,
//   components: [],

//   init: function () {
//     if (!this.selector || !this.solrURL || !this.collection) {
//       throw new Error("Selector, Solr URL, and collection must be provided.");
//     }

//     if (!this.template) {
//       this.template = new edges.templates.bs3.Facetview();
//     }

//     console.log("Initializing...");
//     this.active[this.selector] = new edges.Edge({
//       selector: `#${this.selector}`,
//       searchUrl: `${this.solrURL}${this.collection}`,
//       template: this.template,
//       queryAdapter: new edges.es.SolrQueryAdapter(),
//       components: this.components,
//     });
//   },
// };

// export default emloEdges;

let emlo = {};
emlo.active = {};
emlo.solrURL = "http://localhost:7812";
emlo.init = function (params) {
  let template = null;

  if (!params.selector) {
    throw new Error("Selector must be provided.");
  }

  if (!params.collection) {
    throw new Error("Collection must be provided.");
  }

  if (!params.template) {
    template = new edges.templates.bs3.Facetview();
  }

  if (params.components.length <= 0) {
    console.warn(
      `No components entry found for the selector: ${params.selector}`
    );
  }

  emlo.active[params.selector] = new edges.Edge({
    selector: `#${params.selector}`,
    searchUrl: `${emlo.solrURL}${params.collection}`,
    template: template,
    queryAdapter: new edges.es.SolrQueryAdapter(),
    components: params.components,
  });
};

emlo.ResultTable = class extends edges.Component {
  constructor(params) {
    super(params);

    // the secondary results to get the data from, if not using the primary
    this.secondaryResults = edges.util.getParam(
      params,
      "secondaryResults",
      false
    );

    // filter function that can be used to trim down the result set
    this.filter = edges.util.getParam(params, "filter", false);

    // a sort function that can be used to organise the results
    this.sort = edges.util.getParam(params, "sort", false);

    // the maximum number of results to be stored
    this.limit = edges.util.getParam(params, "limit", false);

    this.infiniteScroll = edges.util.getParam(params, "infiniteScroll", false);

    this.infiniteScrollPageSize = edges.util.getParam(
      params,
      "infiniteScrollPageSize",
      10
    );

    //////////////////////////////////////
    // variables for tracking internal state

    // the results retrieved from ES.  If this is "false" this means that no synchronise
    // has been called on this object, which in turn means that initial searching is still
    // going on.  Once initialised this will be a list (which may in turn be empty, meaning
    // that no results were found)
    this.results = false;

    this.infiniteScrollQuery = false;

    this.hitCount = 0;
  }

  synchronise() {
    // reset the state of the internal variables
    this.results = [];
    this.infiniteScrollQuery = false;
    this.hitCount = 0;

    var source = this.edge.result;
    if (this.secondaryResults !== false) {
      source = this.edge.secondaryResults[this.secondaryResults];
    }

    // if there are no sources to pull results from, leave us with an empty
    // result set
    if (!source) {
      return;
    }

    // first filter the results
    var results = source.results();
    this._appendResults({ results: results });

    // record the hit count for later use
    this.hitCount = source.total();
  }

  _appendResults(params) {
    var results = params.results;

    if (this.filter) {
      results = this.filter({ results: results });
    }

    if (this.sort) {
      results.sort(this.sort);
    }

    if (this.limit !== false) {
      results = results.slice(0, this.limit);
    }

    this.results = this.results.concat(results);
  }

  infiniteScrollNextPage(params) {
    var callback = params.callback;

    // if we have exhausted the result set, don't try to get the next page
    if (this.results.length >= this.hitCount) {
      return;
    }

    if (!this.infiniteScrollQuery) {
      this.infiniteScrollQuery = this.edge.cloneQuery();
      this.infiniteScrollQuery.clearAggregations();
    }

    // move the from/size parameters to get us the next page
    var currentSize = this.infiniteScrollQuery.getSize();
    var currentFrom = this.infiniteScrollQuery.getFrom();
    if (currentFrom === false) {
      currentFrom = 0;
    }
    this.infiniteScrollQuery.from = currentFrom + currentSize;
    this.infiniteScrollQuery.size = this.infiniteScrollPageSize;

    var successCallback = edges.util.objClosure(
      this,
      "infiniteScrollSuccess",
      ["result"],
      { callback: callback }
    );
    var errorCallback = edges.util.objClosure(
      this,
      "infiniteScrollError",
      false,
      { callback: callback }
    );

    this.edge.queryAdapter.doQuery({
      edge: this.edge,
      query: this.infiniteScrollQuery,
      success: successCallback,
      error: errorCallback,
    });
  }

  infiniteScrollSuccess(params) {
    var results = params.result.results();
    this._appendResults({ results: results });
    params.callback();
  }

  infiniteScrollError(params) {
    alert("error");
    params.callback();
  }
};

emlo.ResultTableRenderer = class extends edges.Renderer {
  constructor(params) {
    super(params);

    //////////////////////////////////////////////
    // parameters that can be passed in

    // what to display when there are no results
    this.noResultsText = edges.util.getParam(
      params,
      "noResultsText",
      "No results to display"
    );

    // ordered list of fields with headers, pre and post wrappers, and a value function
    this.tableDisplay = edges.util.getParam(params, "tableDisplay", []);

    // if a multi-value field is found that needs to be displayed, which character
    // to use to join
    this.arrayValueJoin = edges.util.getParam(params, "arrayValueJoin", ", ");

    // if a field does not have a value, don't display anything from its part of the render
    this.omitFieldIfEmpty = edges.util.getParam(
      params,
      "omitFieldIfEmpty",
      true
    );

    //////////////////////////////////////////////
    // variables for internal state

    this.renderFields = [];

    this.displayMap = {};

    this.namespace = "edges-bs3-results-fields-by-table";
  }

  draw() {
    let frag = this.noResultsText;
    if (this.component.results === false) {
      frag = "";
    }

    const results = this.component.results;
    if (results && results.length > 0) {
      // list the css classes we'll require
      const recordClasses = edges.util.styleClasses(
        this.namespace,
        "record",
        this.component.id
      );

      // create table headers
      const headers = this.tableDisplay
        .map((field) => `<th>${edges.util.escapeHtml(field.header)}</th>`)
        .join("");
      let rows = results.map((result) => this._renderResult(result)).join("");

      frag = `
            <table class="table table-bordered">
                <thead>
                    <tr>${headers}</tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        `;
    }

    // finally stick it all together into the container
    const containerClasses = edges.util.styleClasses(
      this.namespace,
      "container",
      this.component.id
    );
    const container = `<div class="${containerClasses}">${frag}</div>`;
    this.component.context.html(container);
  }

  _renderResult(res) {
    // get a list of the fields on the object to display
    const rowClasses = edges.util.styleClasses(
      this.namespace,
      "row",
      this.component.id
    );
    const row = this.tableDisplay
      .map((field) => {
        let val = "";
        if (field.field) {
          val = this._getValue(field.field, res, val);
        }
        if (val) {
          val = edges.util.escapeHtml(val);
        }
        if (field.valueFunction) {
          val = field.valueFunction(val, res, this);
        }
        if (!val && this.omitFieldIfEmpty) {
          return "<td></td>";
        }

        return `<td>${field.pre || ""}${val}${field.post || ""}</td>`;
      })
      .join("");

    return `<tr class="${rowClasses}">${row}</tr>`;
  }

  _getValue(path, rec, def) {
    if (def === undefined) {
      def = false;
    }
    const bits = path.split(".");
    let val = rec;
    for (let i = 0; i < bits.length; i++) {
      const field = bits[i];
      if (field in val) {
        val = val[field];
      } else {
        return def;
      }
    }
    if ($.isArray(val)) {
      val = val.join(this.arrayValueJoin);
    } else if ($.isPlainObject(val)) {
      val = def;
    }
    return val;
  }
};

export default emlo;
