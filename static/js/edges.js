const emlo = {
  active: {},
  selector: "",
  solrURL: "",
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

    if (!this.template) {
      console.warn(
        "Template is missing we are using the default template for edges"
      );
      this.template = new edges.templates.bs3.Facetview();
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

    let selected_facets = "";
    let selectedFacetComponents = edge.category("selected_facets");
    for (let i = 0; i < selectedFacetComponents.length; i++) {
      selected_facets += `<div id="${selectedFacetComponents[i].id}"></div>`;
    }

    let refine_search = "";
    let refineSearchComponents = edge.category("refine_search");
    for (let i = 0; i < refineSearchComponents.length; i++) {
      refine_search += `<div id="${refineSearchComponents[i].id}"></div>`;
    }

    let top = "";
    let topComponents = edge.category("top");
    for (let i = 0; i < topComponents.length; i++) {
      top += `<div id="${topComponents[i].id}"></div>`;
    }

    let bottom = "";
    let bottomComponents = edge.category("bottom");
    for (let i = 0; i < bottomComponents.length; i++) {
      bottom += `<div id="${bottomComponents[i].id}"></div>`;
    }

    let frag = `<div class="row row-with-side">
      <div class="side-nav"> 
        <h2 class="main">Search</h2>
       
          <div id="modify_search" style="display:none;">
              <button onclick="modifyCurrentSearch()">Modify search</button>
          </div>

         <div id="current_search">
            <h3 class="main">Your current search</h3>
            ${selected_facets}
        </div>

        <div id="refine_search">
            <h3 class="main">Refine your results</h3>
            ${refine_search}
        </div>
      </div>

      <div class="row row-with-side">

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
              <div>
                ${top}
              </div>

              <div>
                ${results}
              </div>

              <div>
                ${bottom}
              </div>
            </div>
        </div>
      </div>
    </div>`;

    this.edge.context.html(frag);
  }
};

emlo.ProfileTemplate = class extends edges.Template {
  constructor(params) {
    // TODO: Needs to be added for results page
    // this.showControlSection = edges.util.getParam(
    //   params,
    //   "showControlSection",
    //   false
    // );
    super(params);
  }

  draw(edge) {
    this.edge = edge;
    let results = "";

    let resultComponents = edge.category("results");
    for (let i = 0; i < resultComponents.length; i++) {
      results += `<div id="${resultComponents[i].id}"></div>`;
    }

    let sidebar = "";
    let sidebarComponents = edge.category("sidebar");
    for (let i = 0; i < sidebarComponents.length; i++) {
      sidebar += `<div id="${sidebarComponents[i].id}"></div>`;
    }

    let sidebarTitle = "";
    let sidebarTitleComponents = edge.category("sidebarTitle");
    for (let i = 0; i < sidebarTitleComponents.length; i++) {
      sidebarTitle += `<div id="${sidebarTitleComponents[i].id}"></div>`;
    }

    let frag = `<div class="row row-with-side">
      <div class="side-nav"> 
        <div id="sidebar-title">
          ${sidebarTitle}
        </div>
        
        <div id="sidebar-actions">
            <div>
              <img src="../../static/img/icon-short-url.png" alt="short-url" />
              Short URL:
              <span id="shor-url-link">
              </span>
            </div>

            <div id="send-comment">
              <img src="../../static/img/icon-send-comment.png" alt="short-url" />
              <a> Send Comment </a>
            </div>
        </div>
        
        <div id="more-options">
            ${sidebar}
        </div>
      </div>

      <div class="row row-with-side">
        <div class="large-12 columns" style="margin-left:25px">
            <div id="profile">
                <br/>
                <h2 class="main">
                    <span id="profile-header" class="font-18">
                    </span>
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

  _sendComment() {
    alert("sending");
  }
};

emlo.HomeStatsTemplate = class extends edges.Template {
  constructor(params) {
    // TODO: Needs to be added for results page
    // this.showControlSection = edges.util.getParam(
    //   params,
    //   "showControlSection",
    //   false
    // );
    super(params);
  }

  draw(edge) {
    this.edge = edge;
    let stats = "";

    let statsComponents = edge.category("stats");
    for (let i = 0; i < statsComponents.length; i++) {
      stats += `<div id="${statsComponents[i].id}"></div>`;
    }

    let frag = `
    <div class="row">
      <div class="large-12 columns">
          <ul class="stats-row small-block-grid-2 medium-block-grid-5 large-block-grid-10">
              ${stats}
          </ul>
      </div>
    </div>
    `;
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
          val = field.valueFunction(val, res, field.field, this);
        }
        if (!val && this.omitFieldIfEmpty) {
          return "<td></td>";
        }

        if (field.type) {
          const type = field.type;
          if (field.type == "date") {
            return `<td>${this._formatDate(val)}</td>`;
          }

          if (field.type == "pre") {
            return `
            <td>
              <pre>
                ${val}
              </pre>
            </td>`;
          }

          if (field.type == "link") {
            // Setting href for the link tag in the table
            let href = "#";
            if (field.linkHref) {
              href = this._getValue(field.linkHref, res, val);
            } else {
              href = val;
            }

            // Setting the display name for the link
            let linkText = "Link";

            if (field.linkText) {
              linkText = field.linkText;
            } else if (val) {
              linkText = val;
            }

            // Setting link prefix
            let prefix = "";

            if (field.linkHrefPrefix) {
              // TODO: Hotfix will not work for all the cases, find  better code for this
              if (
                field.field &&
                field.field != "uuid" &&
                field.linkHrefPrefix.split("/").length <= 2
              ) {
                const new_val = this._getValue(field.field, res, val);
                prefix = `${field.linkHrefPrefix}/${new_val}`;
              } else {
                prefix = field.linkHrefPrefix;
              }
            }

            return `<td><a href="${prefix}/${href}">${linkText}</a></td>`;
          }

          if (field.type == "multiple") {
            if (field.multipleFields && field.multipleFields.length > 0) {
              const self = this;
              const multipleFieldDisplay = field.multipleFields
                .map((item) => {
                  const value = this._getValue(item.field, res, "");
                  return value ? `<div>${item.label}: ${value}</div>` : "";
                })
                .join(""); // Join without separators for a stacked display

              return `<td>${multipleFieldDisplay}</td>`;
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

emlo.Facet = class extends edges.components.RefiningANDTermSelector {
  constructor(params) {
    super(params);
  }

  synchronise() {
    // reset the state of the internal variables
    if (this.lifecycle === "update") {
      // if we are in the "update" lifecycle, then reset and read all the values
      this.values = [];
      if (this.edge.result) {
        this._readValues({ result: this.edge.result });
      }
    } else if (this.lifecycle === "static" && this.syncCounts) {
      if (this.edge.result) {
        this._syncCounts({ result: this.edge.result });
      }
    }
    this.filters = [];

    // extract all the filter values that pertain to this selector
    let filters = this.edge.currentQuery.listMust(
      new es.TermFilter({ field: this.field })
    );

    for (let i = 0; i < filters.length; i++) {
      let val = filters[i].value;
      let translate_val = this._translate(val);
      let displayValue = val !== translate_val ? translate_val : val;

      this.filters.push({
        display: displayValue,
        term: val,
        field: filters[i].field,
      });
    }
  }

  removeFilter(field, term) {
    let nq = this.edge.cloneQuery();

    nq.removeMust(
      new es.TermFilter({
        field: field,
        value: term,
      })
    );

    // reset the search page to the start and then trigger the next query
    nq.from = 0;
    this.edge.pushQuery(nq);
    this.edge.cycle();
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
    this.hideCount = edges.util.getParam(params, "hideCount", 0); //  this will hide the facets after mentioned count entries are selected.
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

    // If there are no values for the facet, hide the entire facet
    if (!ts.values || ts.values.length === 0) {
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
      results = `
        <tr>
          <td>
            None
          </td>
        </tr>
      `;
    }

    const filterTerms = ts.filters.map((filter) =>
      filter.term ? filter.term.toString() : ""
    );

    const filterFields = ts.filters.map((filter) =>
      filter.field ? filter.field.toString() : ""
    );

    if (ts.values && ts.values.length > 0) {
      results = "";

      ts.values.forEach((val, idx) => {
        // Skip facets where count is zero
        if (!filterTerms.includes(val.term.toString()) && val.count > 0) {
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

    // If no results were found, hide the facet altogether
    if (results === "Loading..." || results === "" || ts.values.length === 0) {
      ts.context.html(""); // Remove the entire facet from the DOM
      return; // Stop execution as no content is needed
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

    let isHideCount = false;

    const filterFieldsCount = filterFields.reduce((acc, item) => {
      return item === this.component.field ? acc + 1 : acc;
    }, 0);

    if (filterFieldsCount >= this.hideCount && this.hideCount > 0) {
      isHideCount = true;
    }

    let frag = `<div class="${facetClass}" style="${
      isHideCount ? "display:none;" : ""
    }">
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

  termSelected(element) {
    var term = this.component.jq(element).attr("data-key");
    this.component.selectTerm(term);
  }

  removeFilter(element) {
    var term = this.component.jq(element).attr("data-key");
    this.component.removeFilter(term);
  }

  toggleOpen(element) {
    this.open = !this.open;
    this.setUIOpen();
  }

  changeSize(element) {
    var newSize = prompt(
      "Currently displaying " +
        this.component.size +
        " results per page. How many would you like instead?"
    );
    if (newSize) {
      this.component.changeSize(parseInt(newSize));
    }
  }

  changeSort(element) {
    var current = this.component.orderBy + " " + this.component.orderDir;
    var idx = $.inArray(current, this.sortCycle);
    var next = this.sortCycle[(idx + 1) % 4];
    var bits = next.split(" ");
    this.component.changeSort(bits[0], bits[1]);
  }

  toggleTooltip(element) {
    var tooltipSpanSelector = edges.util.idSelector(
      this.namespace,
      "tooltip-span",
      this.component.id
    );
    var container = this.component.jq(tooltipSpanSelector).parent();
    var tt = "";
    if (this.tooltipState === "closed") {
      tt = this._longTooltip();
      this.tooltipState = "open";
    } else {
      tt = this._shortTooltip();
      this.tooltipState = "closed";
    }
    container.html(tt);
    var tooltipSelector = edges.util.idSelector(
      this.namespace,
      "tooltip-toggle",
      this.component.id
    );
    // refresh the event binding
    edges.on(tooltipSelector, "click", this, "toggleTooltip");
  }
};

emlo.SelectedFacetRenderer = class extends edges.Renderer {
  constructor(params) {
    super(params);

    ///////////////////////////////////////
    // parameters that can be passed in
    this.title = edges.util.getParam(params, "title", "");
    this.namespace = "emlo-selected-facet-view";
  }

  draw() {
    let ts = this.component;

    // Clear the context if no filters are active
    if (ts.filters.length === 0) {
      ts.context.html(
        "<table class='facet'><tbody><tr><td>None</td></tr></tbody></table>"
      );
      return;
    }

    // Class selectors for styling
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
    const resultClass = edges.util.styleClasses(
      this.namespace,
      "result",
      this.component.id
    );
    const filterRemoveClass = edges.util.allClasses(
      this.namespace,
      "filter-remove",
      this.component.id
    );

    // Build the selected filters display
    let filterFrag = "";
    ts.filters.forEach((filt) => {
      filterFrag += `
        <tr class="${resultClass}">
          <td>
          ${this._getSelectedFieldLabel(filt.field)}
          </td>
          <td>
            <a href="#" class="${filterRemoveClass} selected-facets" data-key="${edges.util.escapeHtml(
        filt.term
      )}" data-field="${edges.util.escapeHtml(filt.field)}" >
                   ${edges.util.escapeHtml(filt.display)}
                  <img class="facet" src="../../static/img/minus-facet.png" style="height:15px;" />
                </a>
          </td>
        </tr>
      `;
    });

    let frag = `<div class="${facetClass}">
                  <div class="${headerClass}">
                    <h4>${this.title}</h4>
                  </div>
                  <div class="${selectedClass}">
                  <table class="facet">
                    <tbody>
                      ${filterFrag}
                    </tbody>
                  </table>
                  </div>
                </div>`;

    // Render the HTML in the component context
    ts.context.html(frag);

    // Set event handler for removing selected filters
    const filterRemoveSelector = edges.util.jsClassSelector(
      this.namespace,
      "filter-remove",
      this.component.id
    );
    edges.on(filterRemoveSelector, "click", this, "removeFilter");
  }

  removeFilter(element) {
    const term = element.getAttribute("data-key");
    const field = element.getAttribute("data-field");

    this.component.removeFilter(field, term);
    this.draw(); // Redraw the component to reflect the changes
  }

  _getSelectedFieldLabel(field) {
    switch (field) {
      case "author_sort":
        return "Author";
      case "recipient_sort":
        return "Recipient";
      case "origin_sort":
        return "Origin of letter";
      case "destination_sort":
        return "Destination of letter";
      case "cito_Catalog":
        return "Catalogue";
      case "ox_started-ox_year":
        return "Year";
      default:
        return field;
    }
  }
};

emlo.MultiFields = class extends edges.Component {
  constructor(params) {
    super(params);
    this.results = [];
    this.hitCount = 0;
    this.primaryField = edges.util.getParam(params, "primaryField", "");
    this.fetchSecondaryData = edges.util.getParam(
      params,
      "fetchSecondaryData",
      false
    ); // Enable/disable secondary data fetch

    this.loading = true; // Track loading state
    this.errorMessage = ""; // Track error message
  }

  async synchronise() {
    this.results = [];
    this.hitCount = 0;
    this.loading = true; // Start loading
    this.errorMessage = ""; // Reset any previous error messages

    const source = this.edge.result;

    if (!source) {
      this.loading = false; // Stop loading if no source
      return;
    }

    const results = source.results();

    try {
      await this._appendResults({ results: results });
      this.hitCount = source.total();
    } catch (error) {
      this.errorMessage = "Error fetching data.";
    } finally {
      this.loading = false; // Stop loading
    }

    this.renderer.draw();

    this.hitCount = source.total();
  }

  async _appendResults(params) {
    const results = params.results;

    if (this.fetchSecondaryData) {
      for (const result of results) {
        const fieldData = result[this.primaryField];
        if (fieldData && Array.isArray(fieldData)) {
          // Fetching secondary data for each fieldData URL
          const secondaryResults = await Promise.all(
            fieldData.map((url) => {
              const collection = url.split("/")[3];
              let collectionName = "";

              if (collection == "person") {
                collectionName = "people";
              } else {
                collectionName = collection;
              }

              const id = url.split("/")[4];

              return this._fetchAndExtractSecondaryData(collectionName, id); // Await the result
            })
          );

          result[this.primaryField] = secondaryResults; // Replace with fetched data
        }
      }
    }

    this.results = this.results.concat(results);
  }

  async _fetchAndExtractSecondaryData(collectionName, ID) {
    try {
      let url = "";

      if (collectionName == "people") {
        url = `/solr/${collectionName}/select?q=uuid:${ID}&wt=json`;
      } else {
        url = `/solr/${collectionName}s/select?q=uuid:${ID}&wt=json`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        console.error(
          `Error fetching data from ${url}: ${response.statusText}`
        );
        return null;
      }
      const data = await response.json();

      // Extract and return the relevant field from secondary data
      return data.response.docs[0] || null;
    } catch (error) {
      console.error(`Error fetching data from ${url}: ${error}`);
      return null;
    }
  }
};

emlo.MultiFieldsRenderer = class extends edges.Renderer {
  constructor(params) {
    super(params);

    // Rendering configuration
    this.type = edges.util.getParam(params, "type", ""); // Render type: list, table, bar, label
    this.field = edges.util.getParam(params, "field", ""); // Field value to display
    this.sectionTitle = edges.util.getParam(params, "sectionTitle", ""); // Title for the section
    this.sectionTitleStyle = edges.util.getParam(
      params,
      "sectionTitleStyle",
      "h3"
    ); // Title style: h1, h2, etc.
    this.sectionTitleImage = edges.util.getParam(
      params,
      "sectionTitleImage",
      null
    ); // Optional image for title
    this.noResultsText = edges.util.getParam(
      params,
      "noResultsText",
      "No results to display"
    );
    this.contentTitle = edges.util.getParam(params, "contentTitle", "");
    this.contentTitleImage = edges.util.getParam(
      params,
      "contentTitleImage",
      null
    );
    this.fields = edges.util.getParam(params, "fields", []);
    this.primaryField = edges.util.getParam(params, "primaryField", "");
    this.lat_field = edges.util.getParam(params, "lat_field", "");
    this.long_field = edges.util.getParam(params, "long_field", "");
    this.divider = edges.util.getParam(params, "divider", false); // Whether to include a divider
    this.message = edges.util.getParam(params, "message", "");
    this.namespace = "edges-custom-display";
  }

  draw() {
    let frag = "";

    if (this.component.loading) {
      frag = "<div class='loading-message'>Loading...</div>"; // Show loading message
    } else if (this.component.errorMessage) {
      frag = `<div class='error-message'>${this.component.errorMessage}</div>`; // Show error message
    } else if (this.component.results && this.component.results.length > 0) {
      switch (this.type) {
        case "heading":
          frag = this._pageHeading();
          break;
        case "side-title":
          frag = this._sideTitle();
          break;
        case "links":
          frag = this._renderLinks();
          break;
        case "nested":
          frag = this._renderNestedTable();
          break;
        case "nested-label":
          frag = this._renderNestedLabel();
          break;
        case "nested-list":
          frag = this._renderNestedList();
          break;
        case "table":
          frag = this._renderTable();
          break;
        case "bar":
          frag = this._renderBarGraph();
          break;
        case "label":
          frag = this._renderLabelValue();
          break;
        case "content":
          frag = this._renderContent();
          break;
        case "dates":
          frag = this._renderDates();
          break;
        case "stats":
          frag = this._renderStats();
          break;
        case "text":
          frag = this._renderText();
          break;
        case "plain-text":
          frag = this._renderPlainText();
          break;
        case "location":
          frag = this._renderLocation();
          break;
        case "side-nested-links":
          frag = this._sidebarNestedLinks();
          break;
        case "images":
          frag = this._renderImages();
          break;
        case "img":
          frag = this._renderImage();
          break;
        case "dummy-message":
          frag = this._renderDummyText();
          break;
        default:
          frag = "<div></div>";
      }
    }

    const sectionTitleFrag = this._renderSectionTitle();
    const dividerFrag = this.divider ? ' <hr class="yellow-divider" />' : "";

    const containerClasses = edges.util.styleClasses(
      this.namespace,
      "container",
      this.component.id
    );

    let container = "";

    if (frag) {
      container = `<div class="${containerClasses}">
        ${dividerFrag}  
        ${sectionTitleFrag}
        ${frag}
      </div>`;
    }

    this.component.context.html(container);
  }

  _renderSectionTitle() {
    if (this.component.results && this.component.results.length > 0) {
      const imageTag = this.sectionTitleImage
        ? `<img src="${edges.util.escapeHtml(
            this.sectionTitleImage
          )}" alt="${edges.util.escapeHtml(
            this.sectionTitle
          )}" class="title-image">`
        : "";

      return `<${this.sectionTitleStyle} class="section-title">
      ${imageTag} ${edges.util.escapeHtml(this.sectionTitle)}
    </${this.sectionTitleStyle}>`;
    } else {
      return "";
    }
  }

  _pageHeading() {
    return `
      <h2 class="main">
        <span id="result-header" class="font-18">
          ${edges.util.escapeHtml(this.component.results[0][this.field] || "")}
        </span>
      </h2>`;
  }

  _sideTitle() {
    const imageTag = this.contentTitleImage
      ? `<img src="${edges.util.escapeHtml(
          this.contentTitleImage
        )}" alt="${edges.util.escapeHtml(
          this.contentTitle
        )}" class="profile-icon">`
      : "";

    return `
    <h4 class="main">
      ${imageTag}
      ${edges.util.escapeHtml(this.contentTitle)}
    </h4>
    <hr class="yellow-divider" />`;
  }

  _renderBarGraph() {
    // Render a basic bar graph
    return `<div class="bar-graph-container">
      ${this.component.results
        .map((result) => {
          const value = result[this.field];
          return `<div class="bar">
          <span>${edges.util.escapeHtml(value || 0)}</span>
        </div>`;
        })
        .join("")}
    </div>`;
  }

  _renderLabelValue() {
    // Render label-value pairs
    return this.fields
      ? this.fields
          .map((field) => {
            let value = "";

            let additionalInfo = "";

            if (field.additonalInfo && field.additonalInfo.length > 0) {
              // Handle additionalInfo array
              additionalInfo = field.additonalInfo
                .map((info) => {
                  let displayValue = "";
                  if (info.mainKey in this.component.results[0]) {
                    const mainValue = this.component.results[0][info.mainKey];
                    if (typeof mainValue === "boolean") {
                      displayValue = mainValue ? info.text : "";
                    } else if (mainValue) {
                      displayValue = `Marked as:   ${mainValue}`;
                    }
                  }

                  if (
                    !displayValue &&
                    info.secondaryKey in this.component.results[0]
                  ) {
                    const secondaryValue =
                      this.component.results[0][info.secondaryKey];
                    if (typeof secondaryValue === "boolean") {
                      displayValue = secondaryValue ? info.text : "";
                    } else if (secondaryValue) {
                      displayValue = `Marked as:   ${secondaryValue}`;
                    }
                  }

                  return edges.util.escapeHtml(displayValue || "");
                })
                .join("<br/>");
            }

            if (field.type == "date") {
              const rawDate = new Date(this.component.results[0][field.key]);
              const formattedDate = rawDate.toLocaleDateString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
              });

              value = formattedDate;
            } else {
              value = this.component.results[0][field.key];
            }

            return additionalInfo || value
              ? `<div class="content">
                 ${
                   value
                     ? `<span>${edges.util.escapeHtml(
                         field.title
                       )} </span><span>${edges.util.escapeHtml(value)}</span>`
                     : ""
                 }
                 ${additionalInfo ? `<span>${additionalInfo}</span>` : ""}
               </div>`
              : "";
          })
          .join("")
      : "";
  }

  _renderContent() {
    // Render custom content

    if (this.field) {
      return this.component.results[0][this.field]
        ? ` 
    <div class="custom-content">
      ${edges.util.escapeHtml(this.component.results[0][this.field])}
    </div>
    `
        : "";
    }

    if (this.fields.length > 0) {
      return `<div class="content">
      ${this.fields
        .map(
          (field) =>
            `
               <strong> ${field.title} </strong>
               <dd> ${edges.util.escapeHtml(
                 this.component.results[0][field.key] || ""
               )} </dd>
              <br/>
            `
        )
        .join("")}</div>
      `;
    }
  }

  // _renderLocation() {
  //   // Render a location
  //   return `<div class="location">
  //     <span>${edges.util.escapeHtml(
  //       this.component.results[0][this.field] || ""
  //     )}</span>
  //   </div>`;
  // }

  _renderLocation() {
    // Extract the latitude and longitude from your component's results
    const lat = this.component.results[0][this.lat_field];
    const lon = this.component.results[0][this.long_field];

    // Generate a unique ID for the map container (to avoid clashes if multiple maps are rendered)
    const mapContainerId = `map-${Math.random().toString(36).substr(2, 9)}`;

    // Render the location and include a map container
    return `<div class="location">
        <span>  
            <div>
              <dl> 
                <strong> Latitude </strong>
              </dl>
              <dd>
                ${lat}
              </dd>
            </div>
            <div>
              <dl> 
                <strong> Longitude </strong>
              </dl>
              <dd>
                ${lon}
              </dd>
            </div>
        </span>
        <div id="location-map" data-lat="${lat}" data-long="${lon}" style="height: 300px; width: 100%; margin-top: 10px;"></div>
    </div>
    `;
  }

  _renderDates() {
    return `<div class="content">
      ${this.fields
        .map(
          (field) =>
            `
               <strong> ${field.title} </strong>
               <dd> ${edges.util.escapeHtml(
                 this.component.results[0][field.key] || ""
               )} </dd>
            `
        )
        .join("")}</div>
      `;
  }

  _renderStats() {
    // Collect stats and graph fields separately
    const statsHtml = this.fields
      .filter((field) => field.name !== "graph") // Exclude graph fields
      .map((field) => {
        const value = this.component.results[0][field.key] || 0;
        const escapedValue = edges.util.escapeHtml(value);
        const isClickable = value > 0;

        return `
            <span class="stat-item">
              ${
                isClickable
                  ? `<a href='#' id="stats" data-key='${field.key}'>${escapedValue}  ${field.title} </a>`
                  : `${escapedValue} ${field.title}`
              }
            </span>
          `;
      })
      .join(" ♦ ");

    // Handle graph fields separately
    const graphHtml = this.fields
      .filter((field) => field.name === "graph")
      .map((field) => {
        this._renderBarGraph(field.key); // Call the graph rendering function
        return ""; // Exclude graphs from stats string
      })
      .join("");

    return `
        <div class="content">
          ${statsHtml}
        </div>
        ${graphHtml ? `<div class="graph-section">${graphHtml}</div>` : ""}
      `;
  }

  // _renderNestedTable() {
  //   const parentField = this.primaryField;
  //   const field = this.field;
  //   const subFields = this.fields;

  //   // Validate required fields
  //   if (!parentField || (!field && !(subFields && subFields.length > 0))) {
  //     return "";
  //   }

  //   // Iterate through results and build rows
  //   const rows = this.component.results
  //     .map((result) => {
  //       const parentObjects = result[parentField]; // Get all objects in the primary field array
  //       if (!parentObjects || parentObjects.length === 0) return ""; // Skip if no data in primary field

  //       // Iterate over each object in the parent field array
  //       return parentObjects
  //         .map((parentObject) => {
  //           if (!parentObject) return ""; // Skip if the object is invalid

  //           // Generate row content
  //           const cells = [];
  //           if (field) {
  //             // Handle single field
  //             const value = parentObject[field];
  //             cells.push(`<td>${edges.util.escapeHtml(value || "")}</td>`);
  //           }

  //           if (subFields) {
  //             // Handle multiple fields
  //             subFields.forEach((subField) => {
  //               const value = parentObject[subField.key]; // Access value directly using the key

  //               if (subField.clickable) {
  //                 // Create clickable cell
  //                 cells.push(`
  //                   <td>
  //                     <a href="/profile/${subField.collectionName}/${
  //                   parentObject["uuid"]
  //                 }" class="clickable-row">${edges.util.escapeHtml(
  //                   value || ""
  //                 )}</a>
  //                   </td>
  //                 `);
  //               } else {
  //                 // Create non-clickable cell
  //                 cells.push(`<td>${edges.util.escapeHtml(value || "")}</td>`);
  //               }
  //             });
  //           }

  //           // Return the row
  //           return `<tr>${cells.join("")}</tr>`;
  //         })
  //         .join(""); // Combine all rows for the parent objects
  //     })
  //     .filter((row) => row) // Remove empty rows
  //     .join(""); // Combine all rows into a single HTML string

  //   // Wrap rows into table structure
  //   const table = `
  //     <table class="nested-table">
  //       <tbody>
  //         ${rows}
  //       </tbody>
  //     </table>
  //   `;

  //   return rows ? table : ""; // Return table or no results
  // }

  _renderNestedTable() {
    const parentField = this.primaryField;
    const field = this.field;
    const subFields = this.fields;

    // Validate required fields
    if (!parentField || (!field && !(subFields && subFields.length > 0))) {
      return "";
    }

    // Flatten all parentObjects for row count
    const allParentObjects = this.component.results.flatMap(
      (result) => result[parentField] || []
    );

    // Check if total parentObject count exceeds 30
    if (allParentObjects.length > 30) {
      // Summarized format for large datasets
      let aut = "";
      const decadeSummary = allParentObjects.reduce((acc, parentObject) => {
        if (!parentObject) return acc;

        const year = parentObject["ox_started-ox_year"];
        aut = parentObject["author_sort"];

        if (year) {
          const decade = Math.floor(year / 10) * 10; // Calculate decade
          if (!acc[decade]) acc[decade] = {};
          acc[decade][year] = (acc[decade][year] || 0) + 1;
        } else {
          console.log("Unkown year");
        }

        return acc;
      }, {});

      // Generate summarized table rows
      const rows = Object.entries(decadeSummary)
        .map(([decade, years]) => {
          const yearCounts = Object.entries(years)
            .map(
              ([year, count]) =>
                `<a href="/forms/advance?aut=${aut}&dat_sin_year=${year}"> ${year}: ${count} </a>`
            )
            .join(" ♦ ");
          return `
          <tr>
            <td>${decade}</td>
            <td> ${yearCounts} </td>
          </tr>`;
        })
        .join("");

      return `
        <table class="nested-table">
          <thead>
            <tr>
              <th>
                Decade
              </th>
              <th>
                Letters per year
              </th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      `;
    }

    // Current format for datasets with parentObject count <= 30
    const rows = this.component.results
      .map((result) => {
        const parentObjects = result[parentField];
        if (!parentObjects || parentObjects.length === 0) return "";

        return parentObjects
          .map((parentObject) => {
            if (!parentObject) return "";

            const cells = [];
            if (field) {
              const value = parentObject[field];
              cells.push(`<td>${edges.util.escapeHtml(value || "")}</td>`);
            }

            if (subFields) {
              subFields.forEach((subField) => {
                const value = parentObject[subField.key];
                if (subField.clickable) {
                  cells.push(`
                    <td>
                      <a href="/profile/${subField.collectionName}/${
                    parentObject["uuid"]
                  }" class="clickable-row">${edges.util.escapeHtml(
                    value || ""
                  )}</a>
                    </td>
                  `);
                } else {
                  cells.push(`<td>${edges.util.escapeHtml(value || "")}</td>`);
                }
              });
            }

            return `<tr>${cells.join("")}</tr>`;
          })
          .join("");
      })
      .filter((row) => row)
      .join("");

    const table = `
      <table class="nested-table">
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;

    return rows ? table : "";
  }

  _renderNestedList() {
    const parentField = this.primaryField;
    const field = this.field;
    const subFields = this.fields;

    // Validate required fields
    if (!parentField || (!field && !(subFields && subFields.length > 0))) {
      return "";
    }

    // Iterate through results and build rows
    const rows = this.component.results
      .map((result) => {
        const parentObjects = result[parentField]; // Get all objects in the primary field array
        if (!parentObjects || parentObjects.length === 0) return ""; // Skip if no data in primary field

        // Iterate over each object in the parent field array
        return parentObjects
          .map((parentObject) => {
            if (!parentObject) return ""; // Skip if the object is invalid

            // Generate row content
            const cells = [];
            if (field) {
              // Handle single field
              const value = parentObject[field];
              cells.push(`<li>${edges.util.escapeHtml(value || "")}</li>`);
            }

            if (subFields) {
              // Handle multiple fields
              subFields.forEach((subField) => {
                const value = parentObject[subField.key]; // Access value directly using the key

                if (subField.clickable) {
                  // Create clickable cell
                  cells.push(`
                    <li>
                      <a href="/profile/${subField.collectionName}/${
                    parentObject["uuid"]
                  }" class="clickable-row">${edges.util.escapeHtml(
                    value || ""
                  )}</a>
                    </li>
                  `);
                } else {
                  // Create non-clickable cell
                  cells.push(`<li>${edges.util.escapeHtml(value || "")}</li>`);
                }
              });
            }

            // Return the row
            return `<tr>${cells.join("")}</tr>`;
          })
          .join(""); // Combine all rows for the parent objects
      })
      .filter((row) => row) // Remove empty rows
      .join(""); // Combine all rows into a single HTML string

    // Wrap rows into table structure
    const list = `
      <ul>
        ${rows}
      </ul>
    `;

    return rows ? list : ""; // Return table or no results
  }

  _renderNestedLabel() {
    const parentField = this.primaryField;
    const field = this.field;
    const subFields = this.fields;

    // Validate required fields
    if (!parentField || (!field && !(subFields && subFields.length > 0))) {
      return "";
    }

    // Iterate through results and build rows
    const rows = this.component.results
      .map((result) => {
        const parentObjects = result[parentField]; // Get all objects in the primary field array

        if (!parentObjects || parentObjects.length === 0) return ""; // Skip if no data in primary field

        // Iterate over each object in the parent field array
        return parentObjects
          .map((parentObject) => {
            if (!parentObject) return ""; // Skip if the object is invalid

            // Generate row content
            const cells = [];
            if (field) {
              // Handle single field
              const value = parentObject[field];
              cells.push(`<div>${edges.util.escapeHtml(value || "")}</div>`);
            }

            if (subFields) {
              // Handle multiple fields
              subFields.forEach((subField) => {
                const value = parentObject[subField.key]; // Access value directly using the key

                let additionalInfo = "";

                if (
                  subField.additonalInfo &&
                  subField.additonalInfo.length > 0
                ) {
                  // Handle additionalInfo array
                  additionalInfo = subField.additonalInfo
                    .map((info) => {
                      let displayValue = "";
                      if (info.mainKey in result) {
                        const mainValue = result[info.mainKey];
                        if (typeof mainValue === "boolean") {
                          displayValue = mainValue ? info.text : "";
                        } else if (mainValue) {
                          displayValue = `Marked as:   ${mainValue}`;
                        }
                      }

                      if (!displayValue && info.secondaryKey in result) {
                        const secondaryValue = result[info.secondaryKey];
                        if (typeof secondaryValue === "boolean") {
                          displayValue = secondaryValue ? info.text : "";
                        } else if (secondaryValue) {
                          displayValue = `Marked as:   ${secondaryValue}`;
                        }
                      }

                      return edges.util.escapeHtml(displayValue || "");
                    })
                    .join("<br/>");
                }

                if (subField.clickable) {
                  // Create clickable cell
                  cells.push(`
                    <div>
                      <a href="/profile/${subField.collectionName}/${
                    parentObject["uuid"]
                  }" class="clickable-row">${edges.util.escapeHtml(
                    value || ""
                  )}</a>
                      <br/>
                    ${additionalInfo}
                    </div>
                  `);
                } else {
                  // Create non-clickable cell
                  cells.push(
                    `<div>${edges.util.escapeHtml(value || "")}</div>  <br/>
                    ${additionalInfo}`
                  );
                }
              });
            }

            // Return the row
            return `<div>${cells.join("")}</div>`;
          })
          .join(""); // Combine all rows for the parent objects
      })
      .filter((row) => row) // Remove empty rows
      .join(""); // Combine all rows into a single HTML string

    const labelsList = `
      <div class="content">
        ${rows}
      </div>
    `;
    return rows ? labelsList : ""; // Return table or no results
  }

  _renderTable() {
    // Render a table with rows based on fields
    const headers = this.fields
      .map((field) => `<th>${edges.util.escapeHtml(field.title)}</th>`)
      .join("");
    const rows = this.component.results
      .map((result) => {
        const cells = this.fields
          .map(
            (field) =>
              `<td>${edges.util.escapeHtml(result[field.key] || "")}</td>`
          )
          .join("");
        return `<tr>${cells}</tr>`;
      })
      .join("");

    return `<table class="table">
      <thead><tr>${headers}</tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  }

  _sidebarNestedLinks() {
    const parentField = this.primaryField;
    const field = this.field;
    const subFields = this.fields;

    // Validate required fields
    if (!parentField || (!field && !(subFields && subFields.length > 0))) {
      return "";
    }

    // Iterate through results and build rows
    const rows = this.component.results
      .map((result) => {
        const parentObjects = result[parentField]; // Get all objects in the primary field array
        if (!parentObjects || parentObjects.length === 0) return ""; // Skip if no data in primary field

        // Iterate over each object in the parent field array
        return parentObjects
          .map((parentObject) => {
            if (!parentObject) return ""; // Skip if the object is invalid

            // Generate row content
            const cells = [];
            if (field) {
              // Handle single field
              const value = parentObject[field];
              cells.push(`<div>${edges.util.escapeHtml(value || "")}</div>`);
            }

            if (subFields) {
              // Handle multiple fields
              subFields.forEach((subField) => {
                const value = parentObject[subField.key]; // Access value directly using the key
                const otherInfo = parentObject[subField.otherInfo];

                const otherInfoDiv = otherInfo
                  ? `<span>- ${edges.util.escapeHtml(otherInfo)} </span>`
                  : "";
                if (subField.linkKey) {
                  if (subField.linkKey == "uuid") {
                    const collectionName = parentObject["object_type"];

                    cells.push(`
                      <div>
                        <a  href="/profile/${collectionName}/${
                      parentObject["uuid"]
                    }" class="clickable-row">${edges.util.escapeHtml(
                      value || ""
                    )}</a>
                      ${otherInfoDiv}
                      </div>
                    `);
                  } else {
                    cells.push(`
                      <div>
                        <a target="_blank" href="${edges.util.escapeHtml(
                          parentObject[subField.linkKey]
                        )}" class="clickable-row">${edges.util.escapeHtml(
                      value || ""
                    )}</a>
                      ${otherInfoDiv}
                      </div>
                    `);
                  }
                } else {
                  // Create non-clickable cell
                  cells.push(
                    `<div>${edges.util.escapeHtml(
                      value || ""
                    )}</div> ${otherInfoDiv}`
                  );
                }
              });
            }
            // Return the row
            return `<div>${cells.join("")}</div>`;
          })
          .join(""); // Combine all rows for the parent objects
      })
      .filter((row) => row) // Remove empty rows
      .join(""); // Combine all rows into a single HTML string

    const labelsList = `
      <div class="content">
        ${rows}
      </div>
    `;
    return rows ? labelsList : ""; // Return table or no results
  }

  _renderText() {
    const value = this.component.results[0][this.field];

    if (this.field == "cito_Catalog") {
      return value
        ? `
        <em>
          Collection details: 
          <a href="http://emlo-portal.bodleian.ox.ac.uk/collections/?catalogue=${value}"> The Correspondence ${value} </a>
        <em>
      `
        : "";
    }

    return value
      ? `
          <pre class="content" style="white-space: preserve-breaks;font-size:14px;">
            ${edges.util.escapeHtml(value)}
          </pre>
      `
      : "";
  }

  _renderPlainText() {
    return this.component.results[0][this.field]
      ? `
          <p style="margin-left:40px">
            ${edges.util.escapeHtml(
              this.component.results[0][this.field] || ""
            )}
          </p>
      `
      : "";
  }

  _renderImages() {
    const parentField = this.primaryField;
    const field = this.field;

    // Validate required fields
    if (!parentField || (!field && !(subFields && subFields.length > 0))) {
      return "";
    }

    // Iterate through results and build rows
    const rows = this.component.results
      .map((result) => {
        const parentObjects = result[parentField]; // Get all objects in the primary field array
        if (!parentObjects || parentObjects.length === 0) return ""; // Skip if no data in primary field

        // Iterate over each object in the parent field array
        return parentObjects
          .map((parentObject) => {
            if (!parentObject) return ""; // Skip if the object is invalid

            // Generate row content
            const cells = [];
            if (field) {
              // Handle single field
              const value = parentObject[field];
              if (value) {
                const imageId = `img-${Math.random()
                  .toString(36)
                  .substr(2, 9)}`; // Unique ID for the image
                cells.push(`
                  <div class="image-wrapper">
                    <span id="${imageId}-loading" class="loading-message">Loading...</span>
                    <a href="/profile/image/${parentObject["uuid"]}">
                      <img id="${imageId}" src="${edges.util.escapeHtml(
                  value
                )}" 
                        onload="document.getElementById('${imageId}-loading').style.display='none';" 
                        onerror="document.getElementById('${imageId}-loading').innerText='Failed to load';" />
                    </a>
                  </div>
                `);
              }
            }

            // Return the row
            if (cells.length > 0) {
              return `<div>${cells.join("")}</div>`;
            } else {
              return "";
            }
          })
          .join(""); // Combine all rows for the parent objects
      })
      .filter((row) => row) // Remove empty rows
      .join(""); // Combine all rows into a single HTML string

    const images = `
      <div class="content">
        ${rows}
      </div>
    `;
    return rows ? images : ""; // Return table or no results
  }

  _renderImage() {
    const imageTag = this.component.results[0][this.field]
      ? `<img src="${edges.util.escapeHtml(
          this.component.results[0][this.field]
        )}" alt="">
        `
      : "";

    return imageTag ? `${imageTag}` : "";
  }

  _renderLinks() {
    const fieldValue = this.component.results[0][this.field];

    if (!fieldValue) return ""; // If no value, return empty string

    // Check if the value is a string
    if (typeof fieldValue === "string") {
      return `
        <div>
          <a href="/profile/${this.component.results[0]["object_type"]}/${this.component.results[0]["uuid"]}">
            ${this.contentTitle}
          </a>
        </div>`;
    }

    // If the value is an array, iterate and render links
    if (Array.isArray(fieldValue)) {
      return fieldValue
        .map((value) => {
          const parts = value.split("/");
          if (parts.length < 4) return ""; // Ensure there are enough parts to avoid errors

          return `
            <p style="margin-left: 40px">
              <a href="/profile/${parts[3]}/${parts[4]}">
                ${this.contentTitle}
              </a>
            </p>`;
        })
        .join(""); // Combine all generated links into a single string
    }

    // Default return for unsupported types
    return "";
  }

  _renderDummyText() {
    return `${this.message}`;
  }
};

// emlo.Stats = class extends edges.Component {
//   constructor(params) {
//     super(params);
//     this.hitCount = 0;
//     this.solrCore = edges.util.getParam(params, "solrCore", "");
//   }

//   async synchronise() {
//     this.hitCount = 0;

//     // Fetch data from Solr and update the hit count
//     const hitCount = await this._fetchHitCount(this.solrCore);
//     if (hitCount !== null) {
//       this.hitCount = hitCount;
//     }

//     console.log("soirce", this.edge.result);

//     this.renderer.draw();
//   }

//   async _fetchHitCount(collectionName) {
//     const url = `/solr/${collectionName}/select?q=*:*&rows=0&wt=json`;

//     try {
//       const response = await fetch(url);
//       if (!response.ok) {
//         console.error(
//           `Error fetching data from ${url}: ${response.statusText}`
//         );
//         return null;
//       }

//       const data = await response.json();
//       console.log("fa", data);
//       return data.response.numFound || 0; // Return hit count
//     } catch (error) {
//       console.error(`Error fetching data from ${url}: ${error}`);
//       return null;
//     }
//   }
// };
emlo.Stats = class extends edges.Component {
  constructor(params) {
    super(params);
    this.hitCount = 0;
    this.solrCore = edges.util.getParam(params, "solrCore", "");
    this.facetFields = edges.util.getParam(params, "facetFields", []);
    this.facetField = edges.util.getParam(params, "facetField", "");
  }

  async synchronise() {
    this.hitCount = 0;

    // Fetch data from Solr and update the hit count
    const hitCount = await this._fetchHitCount(this.solrCore);
    if (hitCount !== null) {
      this.hitCount = hitCount;
    }

    this.renderer.draw();
  }

  async _fetchHitCount(collectionName) {
    // Base Solr query
    let url = `/solr/${collectionName}/select?q=*:*&rows=0&wt=json`;

    // Add facet fields to the query if they exist, in case multiple facet field support is needed
    // if (this.facetFields.length > 0) {
    //   const facetQuery = this.facetFields
    //     .map((field) => ``)
    //     .join("&");
    //   url += `&facet=true&${facetQuery}`;
    // }

    if (this.facetField) {
      url += `&facet=true&facet.field=${encodeURIComponent(this.facetField)}`;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error(
          `Error fetching data from ${url}: ${response.statusText}`
        );
        return null;
      }

      const data = await response.json();

      // Log facet counts if available
      if (data.facet_counts && data.facet_counts.facet_fields) {
        if (
          this.facetField &&
          data.facet_counts.facet_fields[this.facetField]
        ) {
          if (this.facetField == "cito_Catalog") {
            return data.facet_counts.facet_fields["cito_Catalog"].length / 2;
          } else if (this.facetField == "ox_isOrganisation") {
            for (
              let i = 0;
              i < data.facet_counts.facet_fields["ox_isOrganisation"].length;
              i += 2
            ) {
              if (
                data.facet_counts.facet_fields["ox_isOrganisation"][i] ===
                "true"
              ) {
                return data.facet_counts.facet_fields["ox_isOrganisation"][
                  i + 1
                ];
              }
            }
          }
        }
        // for (const field of this.facetFields) {
        //   console.log(
        //     `Counts for facet field "${field}":`,
        //     data.facet_counts.facet_fields[field]
        //   );
        // }
      }

      return data.response.numFound || 0; // Return hit count
    } catch (error) {
      console.error(`Error fetching data from ${url}: ${error}`);
      return null;
    }
  }
};

emlo.StatsRenderer = class extends edges.Renderer {
  constructor(params) {
    super(params);
    this.title = edges.util.getParam(params, "title", ""); // Title for the section
    this.titleImage = edges.util.getParam(params, "titleImage", null); // Optional image for title
    this.redirectURL = edges.util.getParam(params, "redirectURL", ""); // This URL will be provided in jinja format
    this.namespace = "edges-stats-display";
  }

  draw() {
    let container = "";

    const imageTag = this.titleImage
      ? `<img src="${edges.util.escapeHtml(
          this.titleImage
        )}" alt="${edges.util.escapeHtml(this.title)}" class="title-image">`
      : "";

    const redirectLink = this.redirectURL
      ? `<a href="${edges.util.escapeHtml(this.redirectURL)}"> 
      ${edges.util.escapeHtml(this.title)}
      </a>`
      : `<p style="font-size: inherit;"> 
      ${edges.util.escapeHtml(this.title)}
      </p>`;

    container = `
    <br />
    <li class="stats-text text-center">
        ${imageTag}
        <br />
        
        <span>
          ${edges.util.escapeHtml(this.component.hitCount)}
        </span>
        
        <br />
        
        ${redirectLink}
      </li>
      <br />
      `;

    this.component.context.html(container);
  }
};

emlo.BarGraph = class extends edges.Component {
  constructor(params) {
    super(params);
    this.solrCore = "";
    this.fieldKeys = edges.util.getParam(params, "fieldKeys", []);
    this.xAxisField = edges.util.getParam(params, "xAxisField", "");
    this.results = [];
    this.graphData = {};
    this.cache = {};
    this.loading = false; // To track loading state
  }

  async synchronise() {
    this.graphData = {};
    this.loading = true;
    this.renderer.draw();

    const source = this.edge.result;

    if (!source) {
      this.loading = false;
      return;
    }

    this.results = source.results();

    const solrCoreMap = new Map();
    const uuidToFieldKeyMap = new Map();

    // Collect UUIDs grouped by solrCore and track fieldKeys
    for (const fieldKey of this.fieldKeys) {
      const value = this.results[0]?.[fieldKey];

      if (!value) {
        console.warn(`No value found for fieldKey: ${fieldKey}`);
        continue;
      }

      const valuesArray = Array.isArray(value) ? value : [value];

      for (const val of valuesArray) {
        const [solrCore, uuid] = val.split("/").slice(-2);

        uuidToFieldKeyMap.set(uuid, fieldKey);

        if (!solrCoreMap.has(solrCore)) {
          solrCoreMap.set(solrCore, new Set());
        }
        solrCoreMap.get(solrCore).add(uuid);
      }
    }

    for (const [solrCore, uuids] of solrCoreMap.entries()) {
      const uuidArray = Array.from(uuids);
      const fieldData = await this._fetchGraphData(solrCore, uuidArray);

      for (const doc of fieldData.response.docs) {
        const fieldKey = uuidToFieldKeyMap.get(doc.uuid);
        if (fieldKey) {
          if (!this.graphData[fieldKey]) {
            this.graphData[fieldKey] = [];
          }
          this.graphData[fieldKey].push(doc);
        }
      }
    }

    this.loading = false;
    this.renderer.draw();
  }

  async _fetchGraphData(solrCore, uuidArray) {
    const payload = {
      solrCore: solrCore,
      uuids: uuidArray,
      filter: "", // Adjust if a filter is required
    };

    try {
      const response = await fetch("/stats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error(
          `Error fetching data for ${solrCore}: ${response.statusText}`
        );
        return {};
      }

      return await response.json();
    } catch (error) {
      console.error(`Error in fetchSolrData API call: ${error}`);
      return {};
    }
  }
};
// emlo.BarGraphRenderer = class extends edges.Renderer {
//   constructor(params) {
//     super(params);
//     this.namespace = "edges-bargraph-display";
//     this.fullScreen = false;
//     this.currentView = "separate"; // Default view for graphs
//   }

//   draw() {
//     let container = "";

//     if (this.component.loading) {
//       container = `<div class="loading-indicator">Loading, please wait...</div>`;
//     } else {
//       const graphDataKeys = Object.keys(this.component.graphData);
//       const showGraphControls = graphDataKeys.length > 1;

//       container = `
//         <div id="${this.namespace}-container" class="bar-graph-container"></div>
//         ${
//           showGraphControls
//             ? `
//           <div class="graph-controls">
//             <button onclick="window.edges_bargraph_display.toggleView('separate')">Separate Charts</button>
//             <button onclick="window.edges_bargraph_display.toggleView('stacked')">Stacked Bar</button>
//             <button onclick="window.edges_bargraph_display.toggleView('split')">Split Bar</button>
//           </div>
//         `
//             : ""
//         }
//         <button onclick="window.edges_bargraph_display.toggleFullscreen('${
//           this.namespace
//         }-container')">Full Screen</button>
//       `;
//     }

//     this.component.context.html(container);

//     if (!this.component.loading) {
//       this._renderGraphs();
//     }
//   }

//   _renderGraphs() {
//     const graphContainer = document.getElementById(
//       `${this.namespace}-container`
//     );
//     graphContainer.innerHTML = ""; // Clear existing graphs

//     const datasets = [];
//     const labelsSet = new Set();

//     for (const [fieldKey, fieldData] of Object.entries(
//       this.component.graphData
//     )) {
//       const valueCounts = this._countOccurrences(
//         fieldData,
//         this.component.xAxisField
//       );

//       datasets.push({
//         label: fieldKey,
//         data: Object.values(valueCounts),
//         backgroundColor: this._generateBarColor(fieldKey),
//       });

//       Object.keys(valueCounts).forEach((label) => labelsSet.add(label));

//       if (this.currentView === "separate") {
//         const graphId = `${this.namespace}-${fieldKey}`;
//         graphContainer.innerHTML += `<canvas id="${graphId}" class="graph"></canvas>`;

//         new Chart(document.getElementById(graphId), {
//           type: "bar",
//           data: {
//             labels: Object.keys(valueCounts),
//             datasets: [
//               {
//                 label: fieldKey,
//                 data: Object.values(valueCounts),
//                 backgroundColor: this._generateBarColor(fieldKey),
//               },
//             ],
//           },
//           options: {
//             responsive: true,
//           },
//         });
//       }
//     }

//     if (this.currentView !== "separate") {
//       const combinedGraphId = `${this.namespace}-combined`;
//       graphContainer.innerHTML = `<canvas id="${combinedGraphId}" class="graph"></canvas>`;

//       const isStacked = this.currentView === "stacked";

//       new Chart(document.getElementById(combinedGraphId), {
//         type: "bar",
//         data: {
//           labels: Array.from(labelsSet),
//           datasets: datasets,
//         },
//         options: {
//           responsive: true,
//           plugins: {
//             tooltip: { mode: "index", intersect: false },
//           },
//           scales: {
//             x: {
//               stacked: isStacked,
//               title: { display: true, text: "Categories" },
//             },
//             y: {
//               stacked: isStacked,
//               title: { display: true, text: "Counts" },
//             },
//           },
//         },
//       });
//     }
//   }

//   toggleView(view) {
//     this.currentView = view;
//     this.draw();
//   }

//   toggleFullscreen(containerId) {
//     const container = document.getElementById(containerId);
//     if (!document.fullscreenElement) {
//       container.requestFullscreen().catch((err) => {
//         console.warn(
//           `Error attempting to enable full-screen mode: ${err.message}`
//         );
//       });
//     } else {
//       document.exitFullscreen();
//     }
//   }

//   _countOccurrences(data, xAxis) {
//     const counts = {};
//     for (const item of data) {
//       const value = item[xAxis];
//       counts[value] = (counts[value] || 0) + 1;
//     }
//     return counts;
//   }

//   _generateBarColor(xAxis) {
//     if (xAxis) {
//       switch (xAxis) {
//         case "frbr_creatorOf-work":
//           return "#2E527E";
//         case "mail_recipientOf-work":
//           return "#5A7CA5";
//         default:
//           return "#A7BFD6";
//       }
//     }

//     return "#" + Math.floor(Math.random() * 16777215).toString(16);
//   }
// };

emlo.BarGraphRenderer = class extends edges.Renderer {
  constructor(params) {
    super(params);
    this.namespace = "edges-bargraph-display";
    this.fullScreen = false;
    this.currentView = "separate"; // Default view for graphs
    this.chartInstances = []; // To store active Chart.js instances
    this.graphHeight = 150; // Fixed height for the graphs (can adjust this value)
    this.graphWidth = 600; // Fixed width for the graphs (can adjust this value)
  }

  draw() {
    let container = "";

    if (this.component.loading) {
      container = `<div class="loading-indicator">Loading, please wait...</div>`;
    } else {
      const graphDataKeys = Object.keys(this.component.graphData);
      const showGraphControls = graphDataKeys.length > 1;

      container = `
        <div id="${this.namespace}-container" class="bar-graph-container"></div>
        ${
          showGraphControls
            ? `
          <div class="graph-controls">
            <button onclick="window.edges_bargraph_display.toggleView('separate')">Separate Charts</button>
            <button onclick="window.edges_bargraph_display.toggleView('stacked')">Stacked Bar</button>
            <button onclick="window.edges_bargraph_display.toggleView('split')">Split Bar</button>
          </div>
        `
            : ""
        }
        <button onclick="window.edges_bargraph_display.toggleFullscreen('${
          this.namespace
        }-container')">Full Screen</button>
      `;
    }

    this.component.context.html(container);

    if (!this.component.loading) {
      this._renderGraphs();
    }
  }

  _renderGraphs() {
    const graphContainer = document.getElementById(
      `${this.namespace}-container`
    );
    graphContainer.innerHTML = ""; // Clear existing graphs

    // Destroy previous charts to free memory and prevent duplication
    this.chartInstances.forEach((chart) => chart.destroy());
    this.chartInstances = []; // Clear chart instances

    const datasets = [];
    const labelsSet = new Set();

    for (const [fieldKey, fieldData] of Object.entries(
      this.component.graphData
    )) {
      const valueCounts = this._countOccurrences(
        fieldData,
        this.component.xAxisField
      );

      datasets.push({
        label: fieldKey,
        data: Object.values(valueCounts),
        backgroundColor: this._generateRandomColor(),
      });

      Object.keys(valueCounts).forEach((label) => labelsSet.add(label));

      if (this.currentView === "separate") {
        const graphId = `${this.namespace}-${fieldKey}`;
        const canvas = document.createElement("canvas");
        canvas.id = graphId;
        canvas.className = "graph";
        canvas.style.height = `${this.graphHeight}px`; // Set fixed height
        canvas.style.width = `${this.graphWidth}px`; // Set fixed width
        graphContainer.appendChild(canvas);

        const chartInstance = new Chart(canvas, {
          type: "bar",
          data: {
            labels: Object.keys(valueCounts),
            datasets: [
              {
                label: fieldKey,
                data: Object.values(valueCounts),
                backgroundColor: this._generateRandomColor(),
              },
            ],
          },
          options: {
            responsive: true,
            scales: {
              x: { title: { display: true, text: "Categories" } },
              y: { title: { display: true, text: "Counts" } },
            },
          },
        });

        this.chartInstances.push(chartInstance); // Save instance
      }
    }

    if (this.currentView !== "separate") {
      const combinedGraphId = `${this.namespace}-combined`;
      const combinedCanvas = document.createElement("canvas");
      combinedCanvas.id = combinedGraphId;
      combinedCanvas.className = "graph";
      combinedCanvas.style.height = `${this.graphHeight}px`; // Set fixed height
      combinedCanvas.style.width = `${this.graphWidth}px`; // Set fixed width
      graphContainer.appendChild(combinedCanvas);

      const isStacked = this.currentView === "stacked";

      const chartInstance = new Chart(combinedCanvas, {
        type: "bar",
        data: {
          labels: Array.from(labelsSet),
          datasets: datasets,
        },
        options: {
          responsive: true,
          plugins: {
            tooltip: { mode: "index", intersect: false },
          },
          scales: {
            x: {
              stacked: isStacked,
              title: { display: true, text: "Categories" },
            },
            y: {
              stacked: isStacked,
              title: { display: true, text: "Counts" },
            },
          },
        },
      });

      this.chartInstances.push(chartInstance); // Save combined chart instance
    }
  }

  toggleView(view) {
    this.currentView = view;
    this.draw();
  }

  toggleFullscreen(containerId) {
    const container = document.getElementById(containerId);
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch((err) => {
        console.warn(
          `Error attempting to enable full-screen mode: ${err.message}`
        );
      });
    } else {
      document.exitFullscreen();
    }
  }

  _countOccurrences(data, xAxis) {
    const counts = {};
    for (const item of data) {
      const value = item[xAxis];
      counts[value] = (counts[value] || 0) + 1;
    }
    return counts;
  }

  _generateRandomColor() {
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
  }
};

export default emlo;
