const emlo = {
  active: {},
  selector: "",
  solrURL: "http://localhost:7812",
  collection: "",
  template: null,
  openingQuery: null,
  components: [],

  init: function () {
    if (!this.selector) {
      throw new Error("Selector must be provided.");
    }

    if (!this.collection) {
      throw new Error("Collection must be provided.");
    }

    if (!this.solrURL) {
      throw new Error("Solr URL must be provided.");
    }

    if (!this.template) {
      console.warn(
        "Template is missing we are using the default template for edges"
      );
      this.template = new emlo.ResultTemplate();
    }

    if (this.components.length <= 0) {
      console.warn(
        `No components entry found for the selector: ${params.selector}`
      );
    }

    if (this.openingQuery) {
      this.active[this.selector] = new edges.Edge({
        selector: `#${this.selector}`,
        searchUrl: `${this.solrURL}${this.collection}`,
        openingQuery: new es.Query(this.openingQuery),
        template: this.template,
        queryAdapter: new edges.es.SolrQueryAdapter(),
        components: this.components,
      });
    } else {
      this.active[this.selector] = new edges.Edge({
        selector: `#${this.selector}`,
        searchUrl: `${this.solrURL}${this.collection}`,
        template: this.template,
        queryAdapter: new edges.es.SolrQueryAdapter(),
        components: this.components,
      });
    }
  },
};

emlo.ResultTemplate = class extends edges.Template {
  constructor(params) {
    super(params);
  }

  draw(edge) {
    this.edge = edge;
    let results = "";

    let resultComponents = edge.category("results");
    for (let i = 0; i < resultComponents.length; i++) {
      results += `<div id="${resultComponents[i].id}"></div>`;
    }

    let refine_search = "";
    let refineSearchComponents = edge.category("refine_search");
    for (let i = 0; i < refineSearchComponents.length; i++) {
      refine_search += `<div id="${refineSearchComponents[i].id}"></div>`;
    }

    let frag = `<div class="row">
      <div class="side-nav"> 
        <h2 class="main">Search</h2>
       
          <div id="modify_search" style="display:none;">
              <button onclick="modifyCurrentSearch()">Modify search</button>
          </div>

         <div id="current_search">
            <h3 class="main">Your current search</h3>
        </div>

        <div id="refine_search">
            <h3 class="main">Refine your results</h3>
            ${refine_search}
        </div>
      </div>

      <div class="row">
        <div class="large-2 columns"><!-- dummy column -->&nbsp;</div>

        <div class="large-10 columns" style="margin-left:25px">
            <div id="about">
                <br/>
                <h2 class="main">
                    <span id="result-header" class="font-18">
                    </span>

                    <br><br>
                    
                    <div data-alert="" class="alert-box secondary radius">
                        EMLO is an active, collaborative project in continual development, and as such may contain errors/duplicates. 
                        We rely on feedback from the scholarly community: if you spot an error, please 
                        <a href="/about#contact">get in touch</a>.
                    </div>

                </h2>
            </div>
   
             <div id="" class="large-12 columns" style="margin-left:25px">
              ${results}
            </div>
        </div>
      </div>
    </div>`;

    this.edge.context.html(frag);
  }
};
emlo.DropDown = class extends edges.Component {
  constructor(params) {
    super(params);
    this.results = false;

    this.hitCount = 0;
  }

  synchronise() {
    this.results = [];
    this.hitCount = 0;

    var source = this.edge.result;

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

    this.results = this.results.concat(results);
  }
};

emlo.DropDownRenderer = class extends edges.Renderer {
  constructor(params) {
    super(params);

    // parameters that can be passed in
    this.noResultsText = edges.util.getParam(
      params,
      "noResultsText",
      "No results to display"
    );

    this.field = edges.util.getParam(params, "field", "");
    // ordered list of fields with headers, pre and post wrappers, and a value function
    this.dropdownDisplay = edges.util.getParam(params, "dropdownDisplay", []);

    // default option text for dropdown
    this.defaultOptionText = edges.util.getParam(
      params,
      "defaultOptionText",
      "Please select an option"
    );

    // variables for internal state
    this.namespace = "edges-bs3-results-dropdown";
  }

  draw() {
    let frag = this.noResultsText;
    if (this.component.results === false) {
      frag = "";
    }

    const results = this.component.results;
    if (results && results.length > 0) {
      // Create dropdown options
      let options = results
        .map((result) => this._renderOption(result))
        .join("");

      // Add default option at the beginning
      options =
        `<option value="" disabled selected>${this.defaultOptionText}</option>` +
        options;

      // Create dropdown element
      frag = `
        <select class="form-control">
          ${options}
        </select>
      `;
    }

    const containerClasses = edges.util.styleClasses(
      this.namespace,
      "container",
      this.component.id
    );
    const container = `<div class="${containerClasses}">${frag}</div>`;
    this.component.context.html(container);
  }

  _renderOption(result) {
    if (this.field) {
      const value = this._getValue(this.field, result, "");
      const displayText = this._getValue(this.field, result, "");

      return `<option value="${edges.util.escapeHtml(
        value
      )}">${edges.util.escapeHtml(displayText)}</option>`;
    }
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

    // parameters that can be passed in
    this.noResultsText = edges.util.getParam(
      params,
      "noResultsText",
      "No results to display"
    );

    // ordered list of fields with headers, pre and post wrappers, and a value function
    this.tableDisplay = edges.util.getParam(params, "tableDisplay", []);

    // flag to control whether the index column is displayed
    this.showIndex = edges.util.getParam(params, "showIndex", true);
    this.serialHeader = edges.util.getParam(params, "serialHeader", "#");
    // if a multi-value field is found that needs to be displayed, which character to use to join
    this.arrayValueJoin = edges.util.getParam(params, "arrayValueJoin", ", ");

    // if a field does not have a value, don't display anything from its part of the render
    this.omitFieldIfEmpty = edges.util.getParam(
      params,
      "omitFieldIfEmpty",
      true
    );

    // variables for internal state
    this.namespace = "edges-bs3-results-fields-by-table";
  }

  draw() {
    let frag = this.noResultsText;
    if (this.component.results === false) {
      frag = "";
    }

    const results = this.component.results;
    if (results && results.length > 0) {
      const recordClasses = edges.util.styleClasses(
        this.namespace,
        "record",
        this.component.id
      );

      // create table headers
      const headers = this.tableDisplay
        .map((field) => `<th>${edges.util.escapeHtml(field.header)}</th>`)
        .join("");
      const headerRow = this.showIndex
        ? `<tr><th>${this.serialHeader}</th>${headers}</tr>`
        : `<tr>${headers}</tr>`;
      let rows = results
        .map((result, index) => this._renderResult(result, index))
        .join("");

      frag = `
            <table class="table table-bordered">
                <thead>
                    ${headerRow}
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        `;
    }

    const containerClasses = edges.util.styleClasses(
      this.namespace,
      "container",
      this.component.id
    );
    const container = `<div class="${containerClasses}">${frag}</div>`;
    this.component.context.html(container);
  }

  // _renderResult(res, index) {
  //   const rowClasses = edges.util.styleClasses(
  //     this.namespace,
  //     "row",
  //     this.component.id
  //   );
  //   const row = this.tableDisplay
  //     .map((field) => {
  //       let val = "";
  //       if (field.field) {
  //         val = this._getValue(field.field, res, val);
  //       }
  //       if (val) {
  //         val = edges.util.escapeHtml(val);
  //       }
  //       if (field.valueFunction) {
  //         val = field.valueFunction(val, res, this);
  //       }
  //       if (!val && this.omitFieldIfEmpty) {
  //         return "<td></td>";
  //       }

  //       if (field.type) {
  //         if (field.type == "date") {
  //           return `<td>${this._formatDate(val)}</td>`;
  //         } else if (field.type == "link") {
  //           if (field.linkText) {
  //             return `<td><a href=${val}>${field.linkText}</a></td>`;
  //           } else {
  //             return `<td><a href=${val}>Link</a></td>`;
  //           }
  //         }
  //       }

  //       return `<td>${field.pre || ""}${val}${field.post || ""}</td>`;
  //     })
  //     .join("");

  //   return this.showIndex
  //     ? `<tr class="${rowClasses}"><td>${index + 1}</td>${row}</tr>`
  //     : `<tr class="${rowClasses}">${row}</tr>`;
  // }

  _renderResult(res, index) {
    const rowClasses = edges.util.styleClasses(
      this.namespace,
      "row",
      this.component.id
    );

    // Default page size if not defined
    const pageSize = this.component.infiniteScrollPageSize || 50;

    // Safely retrieve the pagination component
    let pageNumber = 1; // Default to the first page

    const paginationComponent = this.component.edge.components.find(
      (comp) => comp.id === "top-pager"
    );
    if (paginationComponent && paginationComponent.page) {
      pageNumber = paginationComponent.page;
    }

    // Calculate the continuous serial number using the pageNumber and pageSize
    const continuousIndex = (pageNumber - 1) * pageSize + index + 1;

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

        if (field.type) {
          if (field.type == "date") {
            return `<td>${this._formatDate(val)}</td>`;
          } else if (field.type == "link") {
            if (field.linkText) {
              return `<td><a href=${val}>${field.linkText}</a></td>`;
            } else {
              return `<td><a href=${val}>Link</a></td>`;
            }
          }
        }

        return `<td>${field.pre || ""}${val}${field.post || ""}</td>`;
      })
      .join("");

    // Add continuous serial number as the first cell in the row if showIndex is enabled
    return this.showIndex
      ? `<tr class="${rowClasses}"><td>${continuousIndex}</td>${row}</tr>`
      : `<tr class="${rowClasses}">${row}</tr>`;
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

  _formatDate(timestamp) {
    // Create a new Date object using the timestamp
    const date = new Date(timestamp);

    // Check if the date is invalid
    if (isNaN(date.getTime())) {
      return ""; // Return empty string if date is invalid
    }

    // Define an array of month names
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // Extract day, month, and year
    const day = date.getDate().toString().padStart(2, "0");
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    // Format date as dd month yyyy
    return `${day} ${month} ${year}`;
  }
};

emlo.FacetRenderer = class extends edges.Renderer {
  constructor(params) {
    super(params);

    ///////////////////////////////////////
    // parameters that can be passed in
    this.title = edges.util.getParam(params, "title", "Select");
    this.hideInactive = edges.util.getParam(params, "hideInactive", false);
    this.controls = edges.util.getParam(params, "controls", true);
    this.open = edges.util.getParam(params, "open", false);
    this.togglable = edges.util.getParam(params, "togglable", true);
    this.showSelected = edges.util.getParam(params, "showSelected", true);
    this.displayLimit = edges.util.getParam(params, "displayLimit", 10);
    this.sortCycle = edges.util.getParam(params, "sortCycle", [
      "count desc",
      "count asc",
      "term desc",
      "term asc",
    ]);
    this.countFormat = edges.util.getParam(params, "countFormat", false);
    this.tooltipText = edges.util.getParam(params, "tooltipText", false);
    this.tooltip = edges.util.getParam(params, "tooltip", false);
    this.tooltipState = "closed";
    this.namespace = "emlo-facet-view";

    this.showAll = false; // Track whether to show all entries
  }

  draw() {
    let ts = this.component;

    if (!ts.active && this.hideInactive) {
      ts.context.html("");
      return;
    }

    const valClass = edges.util.allClasses(
      this.namespace,
      "value",
      this.component.id
    );
    const filterRemoveClass = edges.util.allClasses(
      this.namespace,
      "filter-remove",
      this.component.id
    );

    const resultsListClass = edges.util.styleClasses(
      this.namespace,
      "results-list",
      this.component.id
    );
    const resultClass = edges.util.styleClasses(
      this.namespace,
      "result",
      this.component.id
    );
    const controlClass = edges.util.styleClasses(
      this.namespace,
      "controls",
      this.component.id
    );
    const facetClass = edges.util.styleClasses(
      this.namespace,
      "facet",
      this.component.id
    );
    const headerClass = edges.util.styleClasses(
      this.namespace,
      "header",
      this.component.id
    );
    const selectedClass = edges.util.styleClasses(
      this.namespace,
      "selected",
      this.component.id
    );

    const controlId = edges.util.htmlID(
      this.namespace,
      "controls",
      this.component.id
    );
    const sizeId = edges.util.htmlID(this.namespace, "size", this.component.id);
    const orderId = edges.util.htmlID(
      this.namespace,
      "order",
      this.component.id
    );
    const toggleId = edges.util.htmlID(
      this.namespace,
      "toggle",
      this.component.id
    );
    const resultsId = edges.util.htmlID(
      this.namespace,
      "results",
      this.component.id
    );
    const showMoreId = edges.util.htmlID(
      this.namespace,
      "show-more",
      this.component.id
    );

    let results = "Loading...";
    if (ts.values !== false) {
      results = "No data available";
    }

    if (ts.values && ts.values.length > 0) {
      results = "";
      const filterTerms = ts.filters.map((filter) => filter.term.toString());

      ts.values.forEach((val, idx) => {
        if (!filterTerms.includes(val.term.toString())) {
          let count = val.count;
          if (this.countFormat) {
            count = this.countFormat(count);
          }
          const isHidden = idx >= this.displayLimit && !this.showAll;
          results += `
            <tr style="${isHidden ? "display:none;" : ""}">
              <td>
                <a href="#" class="${valClass}" data-key="${edges.util.escapeHtml(
            val.term
          )}">
                  <img class="facet" src="../../static/img/plus-facet.png" height="15px" width="15px" />
                  ${edges.util.escapeHtml(val.display)}
                </a>
              </td>
              <td>
                ${count}
              </td>
            </tr>
            `;
        }
      });
    }

    // Add "Show more" button if there are more than 10 entries
    let showMoreFrag = "";
    if (ts.values.length > this.displayLimit) {
      showMoreFrag = `
        <tr>
          <td id="${showMoreId}" class="btn btn-link">
            ${this.showAll ? "Click to hide" : "Click to show more..."}
          </td>
          <td>
          </td>
        </tr>
      `;
    }

    let tooltipFrag = "";
    if (this.tooltipText) {
      const tt = this._shortTooltip();
      const tooltipClass = edges.util.styleClasses(
        this.namespace,
        "tooltip",
        this.component.id
      );
      const tooltipId = edges.util.htmlID(
        this.namespace,
        "tooltip",
        this.component.id
      );
      tooltipFrag = `<div id="${tooltipId}" class="${tooltipClass}" style="display:none"><div class="row"><div class="col-md-12">${tt}</div></div></div>`;
    }

    let controlFrag = "";
    if (this.controls) {
      controlFrag = `<div class="${controlClass}" style="display:none" id="${controlId}"><div class="row">
                      <div class="col-md-12">
                          <div class="btn-group">
                              <button type="button" class="btn btn-default btn-sm" id="${sizeId}" title="List Size">0</button>
                              <button type="button" class="btn btn-default btn-sm" id="${orderId}" title="List Order"></button>
                          </div>
                      </div>
                  </div></div>`;
    }

    let filterFrag = "";
    if (ts.filters.length > 0 && this.showSelected) {
      ts.filters.forEach((filt) => {
        filterFrag += `<div class="${resultClass}"><strong>${edges.util.escapeHtml(
          filt.display
        )}&nbsp;`;
        filterFrag += `<a href="#" class="${filterRemoveClass}" data-key="${edges.util.escapeHtml(
          filt.term
        )}">`;
        filterFrag += '<i class="fas fa-times"></i></a>';
        filterFrag += "</strong></a></div>";
      });
    }

    let tog = this.title;
    if (this.togglable) {
      tog = `<p class="main">${this.title}</p>`;
    }

    let frag = `<div class="${facetClass}">
                      <div class="${headerClass}"><div class="row">
                          <div class="col-md-12">
                              ${tog}
                          </div>
                      </div></div>
                      ${tooltipFrag}
                      {{CONTROLS}}
                      <div class="row" style="display:none" id="${resultsId}">
                          <div class="col-md-12">
                            <table class="facet">
                              <tbody>
                                {{RESULTS}}
                                {{SHOWMOREFRAG}}
                              </tbody>
                            </table>
                          </div>
                      </div></div>`;

    frag = frag
      .replace(/{{RESULTS}}/g, results)
      .replace(/{{CONTROLS}}/g, controlFrag)
      .replace(/{{SELECTED}}/g, filterFrag)
      .replace(/{{SHOWMOREFRAG}}/g, showMoreFrag);

    ts.context.html(frag);

    this.setUISize();
    this.setUISort();
    this.setUIOpen();

    const valueSelector = edges.util.jsClassSelector(
      this.namespace,
      "value",
      this.component.id
    );
    const filterRemoveSelector = edges.util.jsClassSelector(
      this.namespace,
      "filter-remove",
      this
    );
    const toggleSelector = edges.util.idSelector(
      this.namespace,
      "toggle",
      this
    );
    const sizeSelector = edges.util.idSelector(this.namespace, "size", this);
    const orderSelector = edges.util.idSelector(this.namespace, "order", this);
    const showMoreSelector = edges.util.idSelector(
      this.namespace,
      "show-more",
      this
    );

    edges.on(valueSelector, "click", this, "termSelected");
    edges.on(toggleSelector, "click", this, "toggleOpen");
    edges.on(filterRemoveSelector, "click", this, "removeFilter");
    edges.on(sizeSelector, "click", this, "changeSize");
    edges.on(orderSelector, "click", this, "changeSort");

    if (this.component.jq(showMoreSelector).length > 0) {
      edges.on(showMoreSelector, "click", this, "showMoreEntries");
    }
  }

  showMoreEntries() {
    this.showAll = !this.showAll;
    this.draw(); // Re-draw the component to show all entries
  }

  setUIOpen() {
    const resultsSelector = edges.util.idSelector(
      this.namespace,
      "results",
      this.component.id
    );
    const controlsSelector = edges.util.idSelector(
      this.namespace,
      "controls",
      this.component.id
    );
    const tooltipSelector = edges.util.idSelector(
      this.namespace,
      "tooltip",
      this.component.id
    );
    const toggleSelector = edges.util.idSelector(
      this.namespace,
      "toggle",
      this.component.id
    );

    const results = this.component.jq(resultsSelector);
    const controls = this.component.jq(controlsSelector);
    const tooltip = this.component.jq(tooltipSelector);
    const toggle = this.component.jq(toggleSelector);

    if (this.open) {
      toggle.find("i").removeClass("fa-plus").addClass("fa-minus");
      controls.show();
      results.show();
      tooltip.show();
    } else {
      toggle.find("i").removeClass("fa-minus").addClass("fa-plus");
      controls.hide();
      results.hide();
      tooltip.hide();
    }
  }

  setUISize() {
    const sizeSelector = edges.util.idSelector(
      this.namespace,
      "size",
      this.component.id
    );
    const size = this.component.jq(sizeSelector);
    size.html(this.component.size);
  }

  setUISort() {
    const orderSelector = edges.util.idSelector(
      this.namespace,
      "order",
      this.component.id
    );
    const order = this.component.jq(orderSelector);
    order.html(this.component.currentSort);
  }
};

export default emlo;
