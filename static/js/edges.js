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

        <div id="return_browse" style="display:none;">
              <button onclick="returnToBrowse()">Return to Browse</button>
          </div>
       
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

        <div class="large-12 columns">
            <div id="result-header-section" class="large-12 columns">
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
   
             <div id="" class="large-12 columns">
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

    console.log;

    let frag = `
 
              ${stats}
   
   
   
    `;
    this.edge.context.html(frag);
  }
};

emlo.DropDown = class extends edges.Component {
  constructor(params) {
    super(params);
    this.results = false;
    this.size = edges.util.getParam(params, "size", 0);
    this.sortOptions = edges.util.getParam(params, "sortOptions", []);
    this.hitCount = 0;
  }

  contrib(query) {
    query.size = this.size ? this.size : 10;

    if (this.sortOptions.length > 0) {
      query.sort = this.sortOptions;
    }
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

      const dropdownClass = edges.util.allClasses(
        this.namespace,
        "repo-dropdown",
        this
      );

      // Create dropdown element
      frag = `
        <select id="repository" class="${dropdownClass} form-control">
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

    // Attach the event listener for the dropdown change
    const dropdownSelector = edges.util.jsClassSelector(
      this.namespace,
      "repo-dropdown",
      this
    );

    edges.on(dropdownSelector, "change", this, "changeRepoValue");
  }

  // This function is called when the user changes the sort option
  changeRepoValue = function (element) {
    _addUrlParam("repository", element.value);
  };

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

    this.updateHeader = edges.util.getParam(params, "updateHeader", false);
    this.headerSelector = edges.util.getParam(
      params,
      "headerSelector",
      "header"
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

    if (this.updateHeader) {
      this._updateHeader();
    }
  }

  _updateHeader() {
    let currentDoc = document.getElementById(this.headerSelector);
    try {
      if (!currentDoc) {
        return;
      }

      // Check if the fetching process is active
      if (this.results === false) {
        currentDoc.innerHTML = "Loading results...";
        return;
      }

      // Check if results are fetched correctly
      if (this.hitCount && this.hitCount >= 0) {
        if (this.hitCount > 50) {
          currentDoc.innerHTML = `${this.hitCount} results (50 results per page)`;
        } else {
          currentDoc.innerHTML = `${this.hitCount} results`;
        }
      } else {
        // Fallback message when results are not fetched
        currentDoc.innerHTML = "";
      }
    } catch (err) {
      console.error(err);
      currentDoc.innerHTML = "";
    }
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

    this.tableDisplay = edges.util.getParam(params, "tableDisplay", []);
    this.showIndex = edges.util.getParam(params, "showIndex", true);
    this.serialHeader = edges.util.getParam(params, "serialHeader", "#");
    this.arrayValueJoin = edges.util.getParam(params, "arrayValueJoin", ", ");
    this.omitFieldIfEmpty = edges.util.getParam(
      params,
      "omitFieldIfEmpty",
      true
    );

    // New parameters for selection functionality
    this.defaultSelected = edges.util.getParam(params, "defaultSelected", []);
    this.showCheckbox = edges.util.getParam(params, "showCheckbox", false);
    this.selectField = edges.util.getParam(params, "selectField", "uuid");
    this.checkboxLimit = edges.util.getParam(params, "checkboxLimit", 10);
    this.displayField = edges.util.getParam(params, "displayField", "");

    this.selectedRows = new Set(); // Track selected rows by UUID
    this.namespace = "edges-bs3-results-fields-by-table";

    // Restore selection from URL on page load
    this._restoreSelectionFromURL();
  }

  total() {
    return this.component.hitCount;
  }

  draw() {
    let frag = this.noResultsText;
    if (this.component.results === false) {
      frag = "Loading results... Please wait";
    }
    const resultHeader = document.getElementById("result-header-section");

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
        ? `<tr>${this.showCheckbox ? "<th></th>" : ""}<th>${
            this.serialHeader
          }</th>${headers}</tr>`
        : `<tr>${this.showCheckbox ? "<th></th>" : ""}${headers}</tr>`;

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

      if (resultHeader) {
        resultHeader.style.display = "inline";
      }

      this._renderSideNav();
    } else {
      if (resultHeader) {
        resultHeader.style.display = "none";
      }
    }

    const containerClasses = edges.util.styleClasses(
      this.namespace,
      "container",
      this.component.id
    );
    const container = `<div class="${containerClasses}">${frag}</div>`;
    this.component.context.html(container);

    // Attach event handlers for row selection
    if (this.showCheckbox) {
      this._attachRowSelectionHandlers();
    }
  }

  _renderResult(res, index) {
    const rowClasses = edges.util.styleClasses(
      this.namespace,
      "row",
      this.component.id
    );

    const pageSize = this.component.infiniteScrollPageSize || 50;
    let pageNumber = 1;

    const paginationComponent = this.component.edge.components.find(
      (comp) => comp.id === "top-pager"
    );
    if (paginationComponent && paginationComponent.page) {
      pageNumber = paginationComponent.page;
    }

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
          val = field.valueFunction(val, res, field.field, this, index);
        }
        if (!val && this.omitFieldIfEmpty) {
          return "<td></td>";
        }

        if (field.type) {
          if (field.type === "date") {
            return `<td>${this._formatDate(val)}</td>`;
          }

          if (field.type === "pre") {
            return `<td><pre>${val}</pre></td>`;
          }

          if (field.type === "link") {
            let href = field.linkHref
              ? this._getValue(field.linkHref, res, val)
              : val;
            let linkText = field.linkText || val;
            let prefix = field.linkHrefPrefix || "";
            return `<td><a href="${prefix}/${href}">${linkText}</a></td>`;
          }

          if (field.type === "multiple" && field.multipleFields) {
            const multipleFieldDisplay = field.multipleFields
              .map((item) => {
                const value = this._getValue(item.field, res, "");
                return value ? `<div>${item.label}: ${value}</div>` : "";
              })
              .join("");
            return `<td>${multipleFieldDisplay}</td>`;
          }
        }

        return `<td>${val}</td>`;
      })
      .join("");

    const data = this._getSelectField(res[this.selectField], this.selectField);
    const isChecked = this.defaultSelected.includes(data) ? "checked" : "";
    if (isChecked) {
      this.selectedRows.add(data);
    }

    const checkboxCell = this.showCheckbox
      ? `<td><input type="checkbox" class="select-row" data-uuid="${data}" data-display="${
          res[this.displayField]
        }" ${isChecked}></td>`
      : "";

    return this.showIndex
      ? `<tr class="${rowClasses}">${checkboxCell}<td>${continuousIndex}</td>${row}</tr>`
      : `<tr class="${rowClasses}">${checkboxCell}${row}</tr>`;
  }

  _getSelectField(data, selectField) {
    if (selectField == "uuid") {
      return data;
    } else {
      if (Array.isArray(data) && data.length > 0) {
        return data.map((url) => url.split("/").pop()).join(", ");
      }
      return "";
    }
  }

  _renderSideNav() {
    const selectedItems = Array.from(this.selectedRows)
      .slice(0, this.checkboxLimit)
      .map((uuid) => {
        const displayName = this._getDisplayName(uuid) || uuid;
        return `<div><input type="checkbox" class="side-nav-item" data-uuid="${uuid}" checked> ${displayName}</div>`;
      })
      .join("");

    const selectedList = document.getElementById("selected-items-list");
    const sideNavDoc = document.getElementById("side-nav");
    if (selectedList) {
      selectedList.innerHTML = selectedItems;
    }

    if (sideNavDoc) {
      if (this.selectedRows.size > 0) {
        sideNavDoc.style.display = "inline";
      } else {
        sideNavDoc.style.display = "none";
      }

      // Update the URL
      this._updateURL();

      // Attach event handlers for side nav items
      this._attachSideNavHandlers();
    }
  }

  _attachRowSelectionHandlers() {
    const context = this.component.context;
    const renderer = this;

    context.find(".select-row").on("change", function () {
      const uuid = $(this).data("uuid");
      const displayName = $(this).data("display");

      // Check the current selection count
      if ($(this).is(":checked")) {
        if (renderer.selectedRows.size >= renderer.checkboxLimit) {
          // Prevent additional selections if limit is reached
          $(this).prop("checked", false);

          // Display a message to the user
          alert(`You can only select up to ${renderer.checkboxLimit} items.`);
          return;
        }

        // Add the UUID to the selected set
        renderer.selectedRows.add(uuid);
      } else {
        // Remove the UUID from the selected set if unchecked
        renderer.selectedRows.delete(uuid);
      }

      // Update the side navigation and URL
      renderer._renderSideNav();
    });
  }

  _attachSideNavHandlers() {
    const renderer = this;

    // Attach event handlers to the side navigation items
    const sideNavItems = document.querySelectorAll(".side-nav-item");

    sideNavItems.forEach((item) => {
      item.addEventListener("change", function () {
        const uuid = this.getAttribute("data-uuid");

        if (!this.checked) {
          // Remove the UUID from the selected set
          renderer.selectedRows.delete(uuid);

          // Uncheck the corresponding checkbox in the table
          const tableCheckbox = renderer.component.context.find(
            `.select-row[data-uuid='${uuid}']`
          );
          if (tableCheckbox.length) {
            tableCheckbox.prop("checked", false);
          }

          // Update the URL to reflect the change
          renderer._updateURL();

          renderer._renderSideNav();
        }
      });
    });
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

  _getDisplayName(uuid) {
    const results = this.component.results || [];
    const result = results.find((res) => res.uuid === uuid);
    return result ? result[this.displayField] : null;
  }

  _updateURL() {
    const uuids = Array.from(this.selectedRows).join(",");
    const url = new URL(window.location);
    if (uuids) {
      url.searchParams.set("uuids", uuids);
    } else {
      url.searchParams.delete("uuids");
    }

    window.history.replaceState({}, "", url);
  }

  _restoreSelectionFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const uuids = urlParams.get("uuids");
    if (uuids) {
      this.defaultSelected = uuids.split(",");
    }
  }

  _formatDate(timestamp) {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return "";
    }

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

    const day = date.getDate().toString().padStart(2, "0");
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return year === 9999 ? `${day} ${month}` : `${day} ${month} ${year}`;
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
    let keys = []; // to keep the url in sync

    // Object containing the field mappings (example)
    const fieldMapping = {
      aut: "person-author",
      rec: "person-recipient",
      let_con: "Contents",
      locations: "Locations",
      // Add more mappings as needed
    };

    // Extract all the filter values that pertain to this selector
    let filters = this.edge.currentQuery.listMust(
      new es.TermFilter({ field: this.field })
    );

    // Iterate through the existing filters
    for (let i = 0; i < filters.length; i++) {
      let val = filters[i].value;
      let translate_val = this._translate(val);
      let displayValue = val !== translate_val ? translate_val : val;

      if (!keys.includes(filters[i].field)) {
        keys.push(filters[i].field);

        this.filters.push({
          display: displayValue,
          term: val,
          field: filters[i].field,
        });
      }
    }

    // Check if there are query parameters in the URL
    const urlParams = new URLSearchParams(window.location.search);

    // Loop through all URL query parameters
    for (const [key, value] of urlParams.entries()) {
      const notToBeAdded = [
        "start",
        "sort",
        "browsing",
        "uuids",
        "letter",
        "rec",
      ];

      if (fieldMapping.hasOwnProperty(key) && !keys.includes(key)) {
        keys.push(key);

        this.filters.push({
          display: value,
          term: value,
          field: fieldMapping[key],
        });
      } else if (!keys.includes(key) && !notToBeAdded.includes(key)) {
        keys.push(key);

        this.filters.push({
          display: value,
          term: value,
          field: key,
        });
      }
    }
  }

  removeFilter(field, term) {
    let nq = this.edge.cloneQuery();
    // Remove the filter from the "must" clause
    nq.removeMust(
      new es.TermFilter({
        field: field,
        value: term,
      })
    );

    // Remove matching query strings
    nq.removeQueryStrings(
      new es.TermFilter({
        field: field,
        value: term,
      })
    );

    _removeUrlParam(field);

    // Reset the search page to the start and trigger the next query
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
      tog = `<h4 class="main">${this.title}</h4>`;
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
    _addUrlParam(this.component.field, term);
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
          <td style="min-width: 100px;">
            <a href="#" class="${filterRemoveClass} selected-facets" data-key="${edges.util.escapeHtml(
        filt.term
      )}" data-field="${edges.util.escapeHtml(filt.field)}" >
                   ${edges.util.escapeHtml(
                     this._getDisplayValue(filt.field, filt.display)
                   )}
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

  // PATCH: currently we do not have anything in edges that can help us with this.
  _getDisplayValue(field, value) {
    const colMap = {
      "mail_origin-location": "locations",
      "mail_destination-location": "locations",
      "dcterms_references-location": "locations",
      "frbr_creator-person": "people",
      "mail_recipient-person": "people",
      "dcterms_references-person": "people",
    };

    const validFields = [
      "uuid_related",
      "dcterms_references-location",
      "mail_destination-location",
      "mail_origin-location",
      "frbr_creator-person",
      "mail_recipient-person",
      "dcterms_references-person",
    ];

    if (validFields.includes(field)) {
      // Return a placeholder value immediately
      const placeholder = "Loading...";

      if (value && value.startsWith("*") && value.endsWith("*")) {
        value = value.slice(1, -1);
      }

      let collectionName = "";

      if (colMap.hasOwnProperty(field)) {
        collectionName = colMap[field];
      }

      // Fetch names asynchronously
      this._fetchNames(value, collectionName).then((names) => {
        if (names) {
          // Find all matching elements dynamically and update their content
          document
            .querySelectorAll(`[data-field="${edges.util.escapeHtml(field)}"]`)
            .forEach((el) => {
              el.innerHTML = `
                ${edges.util.escapeHtml(names)}
                <img class="facet" src="../../static/img/minus-facet.png" style="height:15px;" />
              `;
            });
        }
      });

      return placeholder;
    } else {
      return value;
    }
  }

  async _fetchNames(value, colName) {
    let collectionName = "";
    let fl = "browse";

    if (colName) {
      collectionName = colName;
    } else {
      const urlParams = new URLSearchParams(window.location.search);
      const browsing = urlParams.get("browsing");

      collectionName =
        browsing && browsing != "organisations" ? `${browsing}` : `people`;
    }

    if (!collectionName) {
      console.error("Collection name not found in the URL.");
      return "";
    }

    const response = await fetch(
      `/solr/${collectionName}/select?q=uuid:${value}&fl=${fl}&wt=json`
    );
    const data = await response.json();

    // Extract and process `browse` values
    const browseNames = data.response.docs.map((doc) => doc[fl]);

    const browseNamesString = browseNames.join(", ");

    return browseNamesString;
  }

  _getSelectedFieldLabel(field) {
    switch (field) {
      case "author_sort":
      case "frbr_creator-person":
        return "Author";
      case "recipient_sort":
      case "mail_recipient-person":
        return "Recipient";
      case "dcterms_references-person":
        return "Mentions";
      case "origin_sort":
        return "Origin of letter";
      case "destination_sort":
        return "Destination of letter";
      case "cito_Catalog":
        return "Catalogue";
      case "ox_started-ox_year":
        return "Year";
      case "mail_origin-location":
      case "pla_ori_name":
        return " Origin of letter";
      case "mail_destination-location":
      case "pla_des_name":
        return " Origin of letter";
      case "dcterms_references-location":
      case "pla_ment_name":
        return " Places mentioned";
      case "uuid_related":
        return "Any from list";
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
    this.primaryResultKey = edges.util.getParam(params, "primaryResultKey", "");
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
        case "date-people":
          frag = this._renderDatesForPeople();
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
        case "repo-version":
          frag = this._renderRepoVersion();
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
    if (
      this.component.results &&
      this.component.results.length > 0 &&
      this.sectionTitle
    ) {
      const imageTag = this.sectionTitleImage
        ? `<img style="float:left;" src="${edges.util.escapeHtml(
            this.sectionTitleImage
          )}" alt="${edges.util.escapeHtml(
            this.sectionTitle
          )}" class="title-image">`
        : "";

      return `
          <div class="column profilepart">
      <${this.sectionTitleStyle}>
      ${imageTag} ${edges.util.escapeHtml(this.sectionTitle)}
    </${this.sectionTitleStyle}> </div><br/>`;
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
      <strong>${edges.util.escapeHtml(this.contentTitle)}</strong>
    </h4>
    <hr class="yellow-divider" />`;
  }

  _renderRepoVersion() {
    const sectionHeading = "Versions (originals, copies, digital, etc.)";
    let frag = `<h2>${sectionHeading}</h2>`;
    this.component.results[0][this.primaryField].forEach((item) => {
      if (item.dcterms_type == "Letter") {
        frag += this._getLetterReopContent(item);
        this._getInstituteData(item["ox_resourceAt-institution"]);
      } else {
        frag += `
          <h3>Version: ${item.dcterms_type}</h3>
				  <p> ${item.ox_printedEditionDetails}</p>
        `;
      }
    });

    return `
      <div style="margin-left:25px"> ${frag} </div>
    `;
  }

  _getLetterReopContent(content) {
    return `
  <div class="display_details_of_one_object False">
	  <h3>Version: Letter</h3>
		
    <p><span class="fieldlabel">Repository:</span></p>
      <div id="repo-section"></p>
		  <p>
        <span class="fieldlabel">Shelfmark:</span> ${content["dcterms_identifier-shelf_"]} 
      </p>
      <p>
        <span class="fieldlabel">Postage mark:</span>${content.mail_postageMark}
      </p>
	</div>
    `;
  }

  _getInstituteData(institutions) {
    institutions.forEach(async (url) => {
      const parts = url.split("/");
      const institutionId = parts.at(-1); // Last part is the ID
      const field =
        "geonames_officialName,geonames_locatedIn,geonames_inCountry";

      try {
        // Fetch institution details from API
        const response = await fetch(
          `/solr/institutions/select?q=uuid:${institutionId}&fl=${field}&wt=json`
        );
        if (!response.ok)
          throw new Error(`Failed to fetch details for ${institutionId}`);

        const data = await response.json();
        const institutionData = data?.response?.docs?.[0] || {};

        // Conditionally build name, city, and country sections
        const nameHTML = institutionData.geonames_officialName
          ? `<a href="/profile/institution/${institutionId}">${institutionData.geonames_officialName}</a><br>`
          : "";
        const cityHTML = institutionData.geonames_locatedIn
          ? `<span style="color:#172854;">City</span>:<br>&nbsp;&nbsp;&nbsp; ${institutionData.geonames_locatedIn}<br>`
          : "";
        const countryHTML = institutionData.geonames_inCountry
          ? `<span style="color:#172854;">Country</span>:<br>&nbsp;&nbsp;&nbsp; ${institutionData.geonames_inCountry}<br>`
          : "";

        // Only return non-empty sections
        if (!nameHTML && !cityHTML && !countryHTML) return;

        // Return the constructed HTML for this institution
        const frag = `
          <div class="display_details_of_one_object True">
            ${nameHTML}
            ${cityHTML}
            ${countryHTML}
          </div>
        `;

        const repo = document.getElementById("repo-section");
        if (repo) {
          repo.innerHTML = frag;
        }
      } catch (error) {
        console.error(`Error fetching institution details for ${url}:`, error);
      }
    });
    // return `<div class="display_details_of_one_object True">
    //     <a href="/profile/institution/id">
    //       Institute vakue needs to be added.
    //     </a>
    //     <br>
    // 	  <span style="color:#172854;">
    //       City
    //     </span>:<br>&nbsp;&nbsp;&nbsp; Basel<br>
    // 	  <span style="color:#172854;">Country</span>:<br>&nbsp;&nbsp;&nbsp; Switzerland<br>
    //   </div>`
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
              value = this._formatDate(this.component.results[0][field.key]);
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
      const result = this.component.results[0][this.field];

      if (result) {
        if (this.field == "ox_locationAlternateName") {
          const alt_name = result.split("\n").join("; ");

          return `
            <div class="custom-content">
              ${edges.util.escapeHtml(alt_name)}
            </div>`;
        } else {
          return `
            <div class="custom-content">
              ${edges.util.escapeHtml(result)}
            </div>`;
        }
      } else {
        return "";
      }
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

    if (lat && lon) {
      // Generate a unique ID for the map container (to avoid clashes if multiple maps are rendered)
      const mapContainerId = `map-${Math.random().toString(36).substr(2, 9)}`;

      // Render the location and include a map container
      return `<div class="content">
    <div class="content">
        <dl>  
            <dt> 
              <strong> Latitude </strong>
            </dt>
            <dd>
              ${lat}
            </dd>
            
            <dt> 
              <strong> Longitude </strong>
            </dt>
            <dd>
              ${lon}
            </dd>
        </dl>
        <div id="location-map" data-lat="${lat}" data-long="${lon}" style="height: 300px; width: 100%; margin-top: 10px;"></div>
    </div></div>
    `;
    } else {
      return "";
    }
  }

  _renderDates() {
    let content = "";
    this.fields.map((field) => {
      const val = this.component.results[0][field.key];

      if (val) {
        content += `
          <dt>
            <strong> ${field.title} </strong>
          </dt>
          <dd> 
            ${this._formatDate(val)}
          </dd>
        `;
      }
    });

    if (content) {
      return `<div class="content"><dl> ${content} </dl></div>`;
    } else {
      return "";
    }
  }

  // Specific for people on profile
  _renderDatesForPeople() {
    let content = "";
    let resultObj = this.component.results[0];

    this.fields.map((field) => {
      let displayValue = "";

      if (field.keys.date) {
        let day = field.keys.date.day
          ? resultObj[field.keys.date.day] || ""
          : "";
        let month = field.keys.date.month
          ? resultObj[field.keys.date.month]
            ? this._getMonthName(resultObj[field.keys.date.month])
            : ""
          : "";
        let year =
          field.keys.date.year && resultObj[field.keys.date.year] !== 9999
            ? resultObj[field.keys.date.year]
            : "";

        let dateParts = [day, month, year].filter(Boolean).join(" ");
        if (dateParts) {
          displayValue = dateParts;
        }
      }

      if (field.keys.flag) {
        Object.keys(field.keys.flag).forEach((item) => {
          // const key = field.keys.flag[item];
          if (resultObj[item]) {
            displayValue += ` ${field.keys.flag[item]}`;
          }
        });
      }

      if (displayValue) {
        content += `
      <dt>
        <strong> ${field.title || ""} </strong>
      </dt>
      <dd> 
        ${displayValue}
      </dd>
    `;
      }
    });

    if (content) {
      return `<div class="content"><dl> ${content} </dl></div>`;
    } else {
      return "";
    }
  }

  _getMonthName(monthKey) {
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
    return months[monthKey - 1] || "";
  }

  _formatDate(timestamp) {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return "";
    }

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

    const day = date.getDate().toString().padStart(2, "0");
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    // return `${day} ${month} ${year}`;
    return year === 9999 ? `${day} ${month}` : `${day} ${month} ${year}`;
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
                  ? `<a href='${
                      field.redirectUrl
                        ? `${field.redirectUrl}${
                            this.component.results[0][field.redirectQueryName]
                          }`
                        : ""
                    }' id="stats" data-key='${field.key}'>${escapedValue}  ${
                      field.title
                    } </a>`
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
      let queryVal = "";
      let queryKey = this.field;

      const decadeSummary = allParentObjects.reduce((acc, parentObject) => {
        if (!parentObject) return acc;

        const year =
          parentObject["ox_started-ox_year"] ||
          parentObject["ox_completed-ox_year"];

        if (this.primaryResultKey) {
          queryVal = this.component.results[0][this.primaryResultKey];
        } else {
          queryVal = parentObject["author_sort"];
        }

        if (year) {
          const decade = Math.floor(year / 10) * 10; // Calculate decade

          if (!acc[decade]) acc[decade] = {};
          acc[decade][year] = (acc[decade][year] || 0) + 1;
        } else {
          if (!acc["????"]) acc["????"] = {};
          acc["????"]["Unknown year"] = (acc["????"]["Unknown year"] || 0) + 1;
        }

        return acc;
      }, {});

      // Generate summarized table rows
      const rows = Object.entries(decadeSummary)
        .map(([decade, years]) => {
          const yearCounts = Object.entries(years)
            .map(
              ([year, count]) =>
                `<a href="/forms/advance?${queryKey}=${queryVal}&dat_sin_year=${year}"> ${year}: ${count} </a>`
            )
            .join(" ♦ ");
          return `
          <tr>
            <td>${decade}s</td>
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
        let parentObjects = result[parentField];
        if (!parentObjects || parentObjects.length === 0) return "";

        parentObjects.sort(
          (a, b) => a["ox_started-ox_year"] - b["ox_started-ox_year"]
        );
        let lastfieldKey = 0;

        return parentObjects
          .map((parentObject) => {
            if (!parentObject) return "";

            const cells = [];
            // if (field) {
            //   const value = parentObject[field];
            //   cells.push(`<td>${edges.util.escapeHtml(value || "")}</td>`);
            // }
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
                  if (
                    subField.key == "ox_started-ox_year" ||
                    subField.key == "ox_completed-ox_year"
                  ) {
                    if (lastfieldKey !== value) {
                      lastfieldKey = value;
                      cells.push(
                        `<td>${edges.util.escapeHtml(value || "")}</td>`
                      );
                    } else {
                      cells.push(`<td></td>`);
                    }
                  }
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
                  cells.push(
                    `<li style="white-space: break-spaces;">${edges.util.escapeHtml(
                      value || ""
                    )}</li>`
                  );
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
                      <dd><p>
                        <a  href="/profile/${collectionName}/${
                      parentObject["uuid"]
                    }" class="clickable-row">${edges.util.escapeHtml(
                      value || ""
                    )}</a>
                      ${otherInfoDiv}
                      </p></dd>
                    `);
                  } else {
                    cells.push(`
                      <dd><p>
                        <a target="_blank" href="${edges.util.escapeHtml(
                          parentObject[subField.linkKey]
                        )}" class="clickable-row">${edges.util.escapeHtml(
                      value || ""
                    )}</a>
                      ${otherInfoDiv}
                      </p></dd>
                    `);
                  }
                } else {
                  // Create non-clickable cell
                  cells.push(
                    `
                    <dd><p>
                    <div>${edges.util.escapeHtml(
                      value || ""
                    )}</div> ${otherInfoDiv} </p> </dd>`
                  );
                }
              });
            }
            // Return the row
            return `<dl>${cells.join("")}</dl>`;
          })
          .join(""); // Combine all rows for the parent objects
      })
      .filter((row) => row) // Remove empty rows
      .join(""); // Combine all rows into a single HTML string

    const labelsList = `
      <div>
        <dt> 
          <strong> ${this.contentTitle} </strong> 
        </dt>
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
//     this.facetFields = edges.util.getParam(params, "facetFields", []);
//     this.facetField = edges.util.getParam(params, "facetField", "");
//   }

//   async synchronise() {
//     this.hitCount = 0;

//     // Fetch data from Solr and update the hit count
//     const hitCount = await this._fetchHitCount(this.solrCore);
//     if (hitCount !== null) {
//       this.hitCount = hitCount;
//     }

//     this.renderer.draw();
//   }

//   async _fetchHitCount(collectionName) {
//     // Base Solr query
//     let url = `/solr/${collectionName}/select?q=*:*&rows=0&wt=json`;

//     // Add facet fields to the query if they exist, in case multiple facet field support is needed
//     // if (this.facetFields.length > 0) {
//     //   const facetQuery = this.facetFields
//     //     .map((field) => ``)
//     //     .join("&");
//     //   url += `&facet=true&${facetQuery}`;
//     // }

//     if (this.facetField) {
//       url += `&facet=true&facet.field=${encodeURIComponent(this.facetField)}`;
//     }

//     try {
//       const response = await fetch(url);
//       if (!response.ok) {
//         console.error(
//           `Error fetching data from ${url}: ${response.statusText}`
//         );
//         return null;
//       }

//       const data = await response.json();

//       // Log facet counts if available
//       if (data.facet_counts && data.facet_counts.facet_fields) {
//         if (
//           this.facetField &&
//           data.facet_counts.facet_fields[this.facetField]
//         ) {
//           if (this.facetField == "cito_Catalog") {
//             return data.facet_counts.facet_fields["cito_Catalog"].length / 2;
//           } else if (this.facetField == "ox_isOrganisation") {
//             for (
//               let i = 0;
//               i < data.facet_counts.facet_fields["ox_isOrganisation"].length;
//               i += 2
//             ) {
//               if (
//                 data.facet_counts.facet_fields["ox_isOrganisation"][i] ===
//                 "true"
//               ) {
//                 return data.facet_counts.facet_fields["ox_isOrganisation"][
//                   i + 1
//                 ];
//               }
//             }
//           }
//         }
//       }

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
    this.statsFields = edges.util.getParam(params, "statsFields", []);

    this.statsObject = {};
  }

  contrib(query) {
    if (this.facetFields.length > 0) {
      query.aggs = this.facetFields;
    }
  }

  synchronise() {
    const facets = this.edge.result.buckets("object_type") || [];
    const orgBucket = this.edge.result.buckets("ox_isOrganisation") || [];
    const citoCatalogBucket = this.edge.result.buckets("cito_Catalog") || [];
    const orgCount =
      orgBucket.find((item) => item.key === "true")?.doc_count || 0;

    // Create a map for faster lookups
    const facetsMap = facets.reduce((acc, item) => {
      acc[item.key] = item.doc_count || 0; // Ensure we always get a number
      return acc;
    }, {});

    this.statsFields.forEach((field) => {
      if (field === "person") {
        this.statsObject[field] = (facetsMap[field] || 0) - orgCount;
      } else if (field === "organizations") {
        this.statsObject[field] = orgCount;
      } else if (field == "cito_Catalog") {
        this.statsObject[field] = citoCatalogBucket.length;
      } else {
        this.statsObject[field] = facetsMap[field] || 0;
      }
    });
  }
};

emlo.StatsRenderer = class extends edges.Renderer {
  constructor(params) {
    super(params);
    this.statsEntries = edges.util.getParam(params, "statsEntries", []); // TODO: Better naming
    this.namespace = "edges-stats-display";
  }

  draw() {
    let container = `
      <div class="row">
        <div class="large-12 columns">
          <ul class="small-block-grid-2 medium-block-grid-5 large-block-grid-10">
    `;

    if (this.statsEntries.length > 0) {
      this.statsEntries.forEach((item) => {
        const imageTag = item.titleImage
          ? `<img src="${edges.util.escapeHtml(
              item.titleImage
            )}" alt="${edges.util.escapeHtml(item.title)}" class="stats-image">`
          : "";

        const redirectLink = item.redirectURL
          ? `<a href="${edges.util.escapeHtml(item.redirectURL)}"> 
      ${edges.util.escapeHtml(item.title)}
      </a>`
          : `<p style="font-size: inherit;"> 
      ${edges.util.escapeHtml(item.title)}
      </p>`;

        // Appending list to container
        container += `
        <li class="stats-text text-center">
          ${imageTag}
          <br />
          
          <span>
            ${
              item.dontFetch
                ? item.hardCodedCount
                : this._getStatCount(
                    item.statKey,
                    item.tweakCount,
                    item.upperLimit
                  )
            }
          </span>
          
          <br />
          
          ${redirectLink}
        </li>
      `;
      });
    }

    container += `
      </ul>
		</div> 
	</div>
    `;
    this.component.context.html(container);
  }

  _getStatCount(key, tweak, upperLimit) {
    if (key && this.component.statsObject.hasOwnProperty(key)) {
      if (this.component.statsObject[key] > upperLimit)
        return this.component.statsObject[key] - (upperLimit - tweak);
    } else {
      return 0;
    }
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

    if (this.results.length === 0) {
      console.warn("No results found.");
      this.loading = false;
      this.renderer.draw();
      return;
    }

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

    // Iterate over solrCoreMap and fetch data
    for (const [solrCore, uuids] of solrCoreMap.entries()) {
      if (uuids.size === 0) continue; // Skip empty UUID sets
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
    if (uuidArray.length === 0) {
      console.warn("No UUIDs provided for Solr core:", solrCore);
      return {};
    }

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
emlo.BarGraphRenderer = class extends edges.Renderer {
  constructor(params) {
    super(params);
    this.namespace = "edges-custom-bargraph-display";
    this.currentView = "separate"; // Default view
    this.maxPoints = 20; // Max number of data points
    this.graphHeight = 150;
    this.graphWidth = 600;
    this.barColor = "#007bff"; // Default bar color
    this.hoverColor = "#EFC319"; // Hover bar color
    this.marginAbove = 10; // Margin above the max value
    this.margin = { top: 50, right: 20, bottom: 40, left: 40 }; // Margins for the chart
    this.graphConfig = edges.util.getParam(params, "graphConfig", {});
  }

  // You can set this graphConfig object externally
  setGraphConfig(config) {
    this.graphConfig = config;
  }

  draw() {
    const container = this.component.loading
      ? `<div class="loading-indicator">Loading, please wait...</div>`
      : `
      ${this._renderControls()}
        <div id="${
          this.namespace
        }-container" class="custom-bar-graph-container">
          <div id="${this.namespace}-chart" style="display:grid"></div>
        </div>
      `;

    this.component.context.html(container);
    this.bindGraphEvents();
    if (!this.component.loading) {
      this._renderGraphs();
    }
  }

  _renderControls() {
    const graphDataKeys = Object.keys(this.component.graphData);

    const fullscreenClass = edges.util.allClasses(
      this.namespace,
      "fullscreen",
      this
    );

    const splitBarClass = edges.util.allClasses(
      this.namespace,
      "splitBar",
      this
    );
    const stackBarClass = edges.util.allClasses(
      this.namespace,
      "stackBar",
      this
    );
    const separateClass = edges.util.allClasses(
      this.namespace,
      "separate",
      this
    );

    if (graphDataKeys.length <= 1)
      return `<button  class="${fullscreenClass} tiny">Full Screen</button>`;

    return `
      <div class="graph-controls">
        <button class="${separateClass} tiny">Separate Charts</button>
        <button class="${stackBarClass} tiny">Stacked Bar</button>
        <button class="${splitBarClass} tiny">Split Bar</button>
        <button  class="${fullscreenClass} tiny">Full Screen</button>
      </div>
    `;
  }

  _renderGraphs() {
    const graphContainer = document.getElementById(`${this.namespace}-chart`);
    graphContainer.innerHTML = ""; // Clear existing graphs

    const datasets = [];
    const labels = []; // Unified x-axis labels
    let maxYValue = 0; // Unified y-axis max value

    for (const [fieldKey, fieldData] of Object.entries(
      this.component.graphData
    )) {
      const reducedData = this._reduceData(fieldData);
      const valueCounts = this._countOccurrences(
        reducedData,
        this.component.xAxisField
      );

      // Get the configuration for this fieldKey, or use defaults if not found
      const config = this.graphConfig[fieldKey] || {
        barColor: this.barColor,
        graphTitle: fieldKey,
      }; // Default to fieldKey as title and default bar color

      // Update x-axis labels to ensure they are uniform and sorted
      for (const label in valueCounts) {
        if (!labels.includes(label)) {
          let i = 0;
          while (i < labels.length && labels[i] < label) {
            i++;
          }
          labels.splice(i, 0, label); // Insert at position i
        }
      }

      const localMax = Math.max(...Object.values(valueCounts));
      maxYValue = Math.max(maxYValue, localMax);

      datasets.push({
        label: fieldKey,
        data: valueCounts,
        config: config, // Include the config for this dataset
      });

      if (this.currentView === "separate") {
        this._drawGraph(
          valueCounts,
          labels,
          maxYValue,
          fieldKey,
          graphContainer,
          config
        );
      }
    }

    if (this.currentView !== "separate") {
      this._drawCombinedGraph(datasets, labels, maxYValue, graphContainer);
    }
  }

  _drawGraph(valueCounts, labels, maxYValue, fieldKey, container, config) {
    // Set up SVG for the D3 chart
    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", this.graphWidth + this.margin.left + this.margin.right)
      .attr("height", this.graphHeight + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

    // Define scales
    const x = d3
      .scaleBand()
      .domain(labels)
      .range([0, this.graphWidth])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, maxYValue])
      .nice()
      .range([this.graphHeight, 0]);

    // Add X-axis
    svg
      .append("g")
      .attr("transform", `translate(0,${this.graphHeight})`)
      .call(d3.axisBottom(x));

    // Add Y-axis (with no decimal values)
    svg.append("g").call(d3.axisLeft(y).ticks(Math.ceil(maxYValue / 10))); // Adjust number of ticks based on the max value

    // Draw bars
    svg
      .selectAll(".bar")
      .data(labels)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d))
      .attr("y", (d) => y(valueCounts[d] || 0))
      .attr("width", x.bandwidth())
      .attr("height", (d) => this.graphHeight - y(valueCounts[d] || 0))
      .attr("fill", config.barColor) // Use the custom bar color (or default)
      .on("mouseover", (event, d) => {
        // Hover effect
        d3.select(event.target).attr("fill", this.hoverColor);
        this._showTooltip(
          event,
          `${d}: ${valueCounts[d]} ${config.graphTitle}`
        );
      })
      .on("mouseout", (event) => {
        // Reset hover effect
        d3.select(event.target).attr("fill", config.barColor);
        this._hideTooltip();
      });

    // Title
    svg
      .append("text")
      .attr("class", "chart-title")
      .attr("x", -10)
      .attr("y", -20)
      .attr("text-anchor", "left")
      .text(config.graphTitle); // Use the custom graph title (or default to fieldKey)
  }

  _drawCombinedGraph(datasets, labels, maxYValue, container) {
    // Clear existing content
    container.innerHTML = "";

    // Set up SVG for the D3 chart
    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", this.graphWidth + this.margin.left + this.margin.right)
      .attr("height", this.graphHeight + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

    // Define scales
    const x = d3
      .scaleBand()
      .domain(labels)
      .range([0, this.graphWidth])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, maxYValue])
      .nice()
      .range([this.graphHeight, 0]);

    const colorScale = d3
      .scaleOrdinal()
      .domain(datasets.map((d) => d.label))
      .range(datasets.map((d) => d.config.barColor || this.barColor));

    // Add X-axis
    svg
      .append("g")
      .attr("transform", `translate(0,${this.graphHeight})`)
      .call(d3.axisBottom(x));

    // Add Y-axis
    svg.append("g").call(d3.axisLeft(y));

    if (this.currentView === "stacked") {
      // Clear existing content
      container.innerHTML = "";

      // Set up SVG for the D3 chart
      const svg = d3
        .select(container)
        .append("svg")
        .attr("width", this.graphWidth + this.margin.left + this.margin.right)
        .attr("height", this.graphHeight + this.margin.top + this.margin.bottom)
        .append("g")
        .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

      // Define scales
      const x = d3
        .scaleBand()
        .domain(labels)
        .range([0, this.graphWidth])
        .padding(0.1);

      const y = d3
        .scaleLinear()
        .domain([0, maxYValue])
        .nice()
        .range([this.graphHeight, 0]);

      const colorScale = d3
        .scaleOrdinal()
        .domain(datasets.map((d) => d.label))
        .range(datasets.map((d) => d.config.barColor || this.barColor));

      // Add X-axis
      svg
        .append("g")
        .attr("transform", `translate(0,${this.graphHeight})`)
        .call(d3.axisBottom(x));

      // Add Y-axis
      svg.append("g").call(d3.axisLeft(y));

      // Prepare stacked data
      const stackedData = labels.map((label) => {
        let cumulative = 0;
        return datasets.map((dataset) => {
          const value = dataset.data[label] || 0;
          const startY = cumulative;
          cumulative += value;
          return {
            label: dataset.label,
            startY,
            endY: cumulative,
            value,
            barColor: dataset.config.barColor || this.barColor,
          };
        });
      });

      // Draw stacked bars
      stackedData.forEach((stack, labelIndex) => {
        stack.forEach((segment, datasetIndex) => {
          svg
            .append("rect")
            .attr("x", x(labels[labelIndex]))
            .attr("y", y(segment.endY)) // Y position of the top of the segment
            .attr("height", y(segment.startY) - y(segment.endY)) // Height of the segment
            .attr("width", x.bandwidth())
            .attr("fill", segment.barColor)
            .on("mouseover", (event) => {
              d3.select(event.target).attr("fill", this.hoverColor);
              this._showTooltip(event, `${segment.label}: ${segment.value}`);
            })
            .on("mouseout", (event) => {
              d3.select(event.target).attr("fill", segment.barColor);
              this._hideTooltip();
            });
        });
      });
    } else if (this.currentView === "split") {
      // Split (grouped) bar chart
      const subX = d3
        .scaleBand()
        .domain(datasets.map((d) => d.label))
        .range([0, x.bandwidth()])
        .padding(0.05);

      datasets.forEach((dataset, datasetIndex) => {
        svg
          .selectAll(`.bar-group-${datasetIndex}`)
          .data(labels)
          .enter()
          .append("rect")
          .attr("class", `bar-group-${datasetIndex}`)
          .attr("x", (d) => x(d) + subX(dataset.label))
          .attr("y", (d) => y(dataset.data[d] || 0))
          .attr("width", subX.bandwidth())
          .attr("height", (d) => this.graphHeight - y(dataset.data[d] || 0))
          .attr("fill", dataset.config.barColor || this.barColor)
          .on("mouseover", (event, d) => {
            d3.select(event.target).attr("fill", this.hoverColor);
            this._showTooltip(
              event,
              `${dataset.label}: ${dataset.data[d] || 0}`
            );
          })
          .on("mouseout", (event) => {
            d3.select(event.target).attr(
              "fill",
              dataset.config.barColor || this.barColor
            );
            this._hideTooltip();
          });
      });
    }
  }

  bindGraphEvents() {
    const fullscreenSelector = edges.util.jsClassSelector(
      this.namespace,
      "fullscreen",
      this
    );

    var splitBarSelector = edges.util.jsClassSelector(
      this.namespace,
      "splitBar",
      this
    );
    var separateSelector = edges.util.jsClassSelector(
      this.namespace,
      "separate",
      this
    );
    var stackedBarSelector = edges.util.jsClassSelector(
      this.namespace,
      "stackBar",
      this
    );
    edges.on(fullscreenSelector, "click", this, "toggleFullscreen");
    edges.on(stackedBarSelector, "click", this, "stackedView");
    edges.on(separateSelector, "click", this, "separateView");
    edges.on(splitBarSelector, "click", this, "splitView");
  }

  separateView() {
    this.currentView = "separate";
    this.draw();
  }

  stackedView() {
    this.currentView = "stacked";
    this.draw();
  }

  splitView() {
    this.currentView = "split";
    this.draw();
  }

  // toggleFullscreen(containerId) {
  //   const container = document.getElementById(`${this.namespace}-container`);
  //   const isExpanded = container.classList.contains("fullscreen-mode");

  //   if (isExpanded) {
  //     // Shrink back to original size
  //     container.style.width = "";
  //     container.style.height = "";
  //     container.style.position = "";
  //     container.style.zIndex = "";
  //     container.style.backgroundColor = "";
  //     container.style.overflow = ""; // Reset overflow
  //     container.classList.remove("fullscreen-mode");

  //     // Remove close button
  //     const closeButton = container.querySelector(".close-button");
  //     if (closeButton) {
  //       closeButton.remove();
  //     }
  //   } else {
  //     // Expand to full screen
  //     container.style.width = "100%";
  //     container.style.height = "100%"; // Full height to ensure all content is visible
  //     container.style.position = "fixed";
  //     container.style.top = "0";
  //     container.style.left = "0";
  //     container.style.zIndex = "1000";
  //     container.style.backgroundColor = "#fff"; // Optional: Set a background color
  //     container.style.overflow = "auto"; // Ensure scrollable if content overflows
  //     container.classList.add("fullscreen-mode");

  //     // Add a close button
  //     const closeButton = document.createElement("button");
  //     closeButton.innerHTML = "Close";
  //     closeButton.className = "close-button";
  //     closeButton.style.position = "absolute";
  //     closeButton.style.top = "10px";
  //     closeButton.style.right = "10px";
  //     closeButton.style.zIndex = "1100";
  //     closeButton.style.backgroundColor = "#ff0000";
  //     closeButton.style.color = "#fff";
  //     closeButton.style.border = "none";
  //     closeButton.style.padding = "10px";
  //     closeButton.style.cursor = "pointer";
  //     closeButton.onclick = () => this.toggleFullscreen(containerId);
  //     container.appendChild(closeButton);
  //   }
  // }

  toggleFullscreen(containerId) {
    const container = document.getElementById(`${this.namespace}-container`);
    const isExpanded = container.classList.contains("fullscreen-mode");

    if (isExpanded) {
      // Shrink back to original size
      container.style.width = "";
      container.style.height = "";
      container.style.position = "";
      container.style.zIndex = "";
      container.style.backgroundColor = "";
      container.style.overflow = ""; // Reset overflow
      container.style.display = ""; // Reset display
      container.style.alignItems = ""; // Reset alignment
      container.style.justifyContent = ""; // Reset alignment
      container.classList.remove("fullscreen-mode");

      // Remove close button
      const closeButton = container.querySelector(".close-button");
      if (closeButton) {
        closeButton.remove();
      }
    } else {
      // Expand to full screen
      container.style.width = "100%";
      container.style.height = "100%"; // Full height to ensure all content is visible
      container.style.maxHeight = "100%";
      container.style.position = "fixed";
      container.style.top = "0";
      container.style.left = "0";
      container.style.zIndex = "1000";
      container.style.backgroundColor = "#fff"; // Optional: Set a background color
      container.style.overflow = "auto"; // Ensure scrollable if content overflows
      container.style.display = "grid"; // Set grid layout
      container.style.alignItems = "center"; // Center content vertically
      container.style.justifyContent = "center"; // Center content horizontally
      container.classList.add("fullscreen-mode");

      // Add a close button
      const closeButton = document.createElement("button");
      closeButton.innerHTML = "Close";
      closeButton.className = "close-button";
      closeButton.style.position = "absolute";
      closeButton.style.top = "0"; // Position at the very top
      closeButton.style.right = "10px";
      closeButton.style.zIndex = "1100";
      closeButton.style.backgroundColor = "#ff0000";
      closeButton.style.color = "#fff";
      closeButton.style.border = "none";
      closeButton.style.padding = "10px";
      closeButton.style.cursor = "pointer";
      closeButton.onclick = () => this.toggleFullscreen(containerId);
      container.appendChild(closeButton);
    }
  }

  _reduceData(data) {
    if (data.length <= this.maxPoints) return data;
    const step = Math.ceil(data.length / this.maxPoints);
    return data.filter((_, index) => index % step === 0);
  }

  _countOccurrences(data, field) {
    return data.reduce((acc, item) => {
      const value = item[field];
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }

  _showTooltip(event, text) {
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "graph-tooltip")
      .text(text)
      .style("left", `${event.pageX + 10}px`)
      .style("top", `${event.pageY - 10}px`);
  }

  _hideTooltip() {
    d3.select(".graph-tooltip").remove();
  }
};

emlo.Pagination = class extends edges.Component {
  constructor(params) {
    super(params);

    this.from = false;
    this.to = false;
    this.total = false;
    this.page = false;
    this.pageSize = false;
    this.totalPages = false;
  }

  synchronise() {
    this.from = false;
    this.to = false;
    this.total = false;
    this.page = false;
    this.pageSize = false;
    this.totalPages = false;

    if (this.edge.currentQuery) {
      // Checking if start value is present in URL
      const url = new URL(window.location.href);
      const val = url.searchParams.get("start");
      const start = parseInt(val);
      const from = parseInt(this.edge.currentQuery.getFrom());

      if (start != from) {
        this.from = parseInt(this.edge.currentQuery.getFrom()) + 1;
      } else {
        this.from = start + 1;
      }

      this.pageSize = parseInt(this.edge.currentQuery.getSize());
    }

    if (this.edge.result) {
      this.total = this.edge.result.total();
    }

    if (this.from !== false && this.total !== false) {
      this.to = this.from + this.pageSize - 1;
      this.page = Math.ceil((this.from - 1) / this.pageSize) + 1;
      this.totalPages = Math.ceil(this.total / this.pageSize);
    }

    if (typeof this.from === "number") {
      _addUrlParam("start", this.from - 1);
    }
  }

  setFrom(from) {
    const nq = this.edge.cloneQuery();
    nq.from = from - 1; // 0-indexed for internal
    if (nq.from < 0) nq.from = 0;
    this.edge.pushQuery(nq);
    this.edge.cycle();
  }

  setSize(size) {
    const nq = this.edge.cloneQuery();
    nq.size = size;
    this.edge.pushQuery(nq);
    this.edge.cycle();
  }

  decrementPage() {
    const from = Math.max(this.from - 10 * this.pageSize, 1);
    this.setFrom(from);
  }

  incrementPage() {
    const from = Math.min(
      this.from + 10 * this.pageSize,
      (this.totalPages - 1) * this.pageSize + 1
    );
    this.setFrom(from);
  }

  goToPage(params) {
    const page = params.page;
    const nf = (page - 1) * this.pageSize + 1;
    this.setFrom(nf);
  }

  goToFirst() {
    this.setFrom(1);
  }

  goToLast() {
    this.setFrom((this.totalPages - 1) * this.pageSize + 1);
  }
};

emlo.PaginationRenderer = class extends edges.Renderer {
  constructor(params) {
    super(params);
    this.scroll = edges.util.getParam(params, "scroll", true);
    this.scrollSelector = edges.util.getParam(params, "scrollSelector", "body");
    this.namespace = "edges-bs3-pager";

    this.total = false;
  }

  draw() {
    // Sync the pagination data from the component
    this.component.synchronise();

    // Render the navigation UI with page information
    var nav = this._renderNavigation();
    var pageInfo = `<p>Page ${this.component.page} of ${this.component.totalPages}. (The arrows will jump blocks of 10 pages.)  </p>`;
    var container =
      this.component.totalPages > 1
        ? `
          <div>${pageInfo}</div>
          <div class="${this.namespace}-container">
              ${nav}
          </div>
      `
        : "";
    this.component.context.html(container);
    this.bindEvents();
  }

  _renderNavigation() {
    var firstClass = edges.util.allClasses(this.namespace, "first", this);
    var prevBlockClass = edges.util.allClasses(
      this.namespace,
      "prev-block",
      this
    );
    var pageNumClass = edges.util.allClasses(this.namespace, "page-num", this);
    var nextBlockClass = edges.util.allClasses(
      this.namespace,
      "next-block",
      this
    );
    var lastClass = edges.util.allClasses(this.namespace, "last", this);
    var ellipsisClass = edges.util.allClasses(this.namespace, "ellipsis", this);

    // Generate first, prev, next, last buttons
    var firstBtn = `<div class="button-wrapper ${firstClass}">First</div>`;
    var prevBlockBtn = `<div class="button-wrapper ${prevBlockClass}"><<<</div>`;
    var nextBlockBtn = `<div class="button-wrapper ${nextBlockClass}">>>></div>`;
    var lastBtn = `<div class="button-wrapper ${lastClass}">Last</div>`;

    // Ellipsis buttons for indicating more pages to the back or forward
    var prevEllipsis =
      this.component.page > 3
        ? `<div class="button-wrapper ${ellipsisClass}">...</div>`
        : "";
    var nextEllipsis =
      this.component.page < this.component.totalPages - 2
        ? `<div class="button-wrapper ${ellipsisClass}">...</div>`
        : "";

    // Dynamically create page number buttons based on the current page and total pages
    var pageBtns = "";
    const pageCount = this.component.totalPages;
    const currentPage = this.component.page;

    // Ensure we always have at least 5 pages to display
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(pageCount, currentPage + 2);

    // Generate page number buttons with appropriate range
    if (startPage > 1) {
      pageBtns += prevEllipsis; // Show ellipsis if there are pages before the current range
    }

    for (let i = startPage; i <= endPage; i++) {
      let activeClass = i === currentPage ? "active" : "";
      pageBtns += `<div class="button-wrapper ${pageNumClass} ${activeClass}" data-page="${i}">${i}</div>`;
    }

    if (endPage < pageCount) {
      pageBtns += nextEllipsis; // Show ellipsis if there are pages after the current range
    }

    return `${firstBtn} ${prevBlockBtn} ${pageBtns} ${nextBlockBtn} ${lastBtn}`;
  }

  bindEvents() {
    var firstSelector = edges.util.jsClassSelector(
      this.namespace,
      "first",
      this
    );
    var lastSelector = edges.util.jsClassSelector(this.namespace, "last", this);
    var prevBlockSelector = edges.util.jsClassSelector(
      this.namespace,
      "prev-block",
      this
    );
    var nextBlockSelector = edges.util.jsClassSelector(
      this.namespace,
      "next-block",
      this
    );
    var pageSelector = edges.util.jsClassSelector(
      this.namespace,
      "page-num",
      this
    );

    edges.on(firstSelector, "click", this, "goToFirst");
    edges.on(lastSelector, "click", this, "goToLast");
    edges.on(prevBlockSelector, "click", this, "decrementPage");
    edges.on(nextBlockSelector, "click", this, "incrementPage");
    edges.on(pageSelector, "click", this, "goToPage");
  }

  goToFirst() {
    this.component.goToFirst();
  }

  goToLast() {
    this.component.goToLast();
  }

  incrementPage() {
    this.component.incrementPage();
  }

  decrementPage() {
    this.component.decrementPage();
  }

  goToPage(element) {
    var page = parseInt($(element).attr("data-page"));
    this.component.goToPage({ page });
  }
};

emlo.Sort = class extends edges.Component {
  constructor(params) {
    super(params);

    // Sorting options array: {display, value, field, order}
    this.sortOptions = edges.util.getParam(params, "sortOptions", false);

    // Current sorting field and order
    this.sortBy = false;
    this.sortDir = "desc"; // Default to descending order
  }

  synchronise() {
    this.sortDir = "desc"; // Default to descending
    this.sortBy = false;

    // Create a lookup map for sortOptions
    const sortLookUpMap = new Map(
      this.sortOptions.map((sort) => [sort.value, sort])
    );

    let selectedOption = null; // Initialize selectedOption
    const url = new URL(window.location.href); // Get the current URL
    const urlSortValue = url.searchParams.get("sort"); // Get 'sort' param from URL

    // Check if a sort value exists in the URL
    if (urlSortValue && sortLookUpMap.has(urlSortValue)) {
      selectedOption = sortLookUpMap.get(urlSortValue);
    } else if (this.edge.currentQuery) {
      // Get sorts from the query
      const sorts = this.edge.currentQuery.getSortBy();
      if (sorts.length > 0) {
        // Use the first sort value from the query
        selectedOption = {
          field: sorts[0].field,
          order: sorts[0].order,
        };
      }
    }

    // Fallback to the first sortOption if no sort is found
    if (!selectedOption) {
      selectedOption = this.sortOptions[0];
    }

    if (this.edge.result) {
      this.total = this.edge.result.total();
    }

    // Set the sort values
    this.sortBy = selectedOption.field;
    this.sortDir = selectedOption.order || "desc"; // Default to "desc" if order is not provided

    // Apply the selected sort
    this.setSortBy(this.sortBy);
  }

  setSortBy(field) {
    var nq = this.edge.cloneQuery();
    // If no field is provided, default to "score"
    if (!field || field === "") {
      field = "score";
    }

    // Set the sort by field and order (based on current sortDir)
    nq.setSortBy(
      new es.Sort({
        field: field,
        order: this.sortDir, // Use the stored sortDir (asc/desc)
      })
    );

    // Reset the search page to the start and trigger the next query
    // nq.from = 0;
    this.edge.pushQuery(nq);
    this.edge.cycle();
  }
};

emlo.SortRenderer = class extends edges.Renderer {
  constructor(params) {
    super(params);
    this.label = edges.util.getParam(params, "label", "Sort");
    this.namespace = "edges-sort-renderer";
  }

  draw() {
    // Get the component and its state
    const comp = this.component;

    if (comp.sortOptions && comp.sortOptions.length > 0 && comp.total > 0) {
      // Build the sorting dropdown
      const dropdownClass = edges.util.allClasses(
        this.namespace,
        "dropdown",
        this
      );

      const dropdown = `
      <label> ${this.label} </label>
      <select class="${dropdownClass} form-control">
          ${comp.sortOptions
            .map(
              (opt, index) =>
                `<option value="${opt.value}" data-field="${
                  opt.field
                }" data-order="${opt.order}">
                    ${edges.util.escapeHtml(opt.display)}
                </option>`
            )
            .join("")}
      </select>`;

      // Render the dropdown into the component context
      comp.context.html(dropdown);

      // Set the selectedIndex to reflect the current sortBy and sortDir
      this.setUISortField(comp);

      // Attach the event listener for the dropdown change
      const dropdownSelector = edges.util.jsClassSelector(
        this.namespace,
        "dropdown",
        this
      );
      edges.on(dropdownSelector, "change", this, "changeSortBy");
    }
  }

  // This function sets the selected index based on the current sortBy field and order
  setUISortField(comp) {
    // Ensure the component has sort options and the current field/order
    if (!comp.sortOptions || comp.sortOptions.length === 0 || !comp.sortBy) {
      return;
    }

    // Find the index of the selected sort option based on field and order
    const selectedIndex = comp.sortOptions.findIndex(
      (option) => option.field === comp.sortBy && option.order === comp.sortDir
    );

    // Get the dropdown element and set the selected index
    const dropdownSelector = edges.util.jsClassSelector(
      this.namespace,
      "dropdown",
      this
    );
    const dropdown = comp.jq(dropdownSelector);
    if (dropdown) {
      dropdown[0].selectedIndex = selectedIndex;
    }
  }

  // This function is called when the user changes the sort option
  changeSortBy = function (element) {
    const selectedIndex = element.selectedIndex;
    const selectedOption = this.component.sortOptions[selectedIndex];

    // Update the component's sortBy and sortDir based on the selected option
    this.component.sortBy = selectedOption.field;
    this.component.sortDir = selectedOption.order;

    _addUrlParam("sort", selectedOption.value);
    // Trigger the sort logic (update the query or API call)
    this.component.synchronise(selectedOption.field);
  };
};

emlo.Checkbox = class extends edges.Component {
  constructor(params) {
    super(params);

    // Define groups for filters with valueMap
    this.filterGroups = edges.util.getParam(params, "filterGroups", {});
    this.selectedFilters = {}; // To store selected filters by group
    this.urlParam = edges.util.getParam(params, "urlParam", "filters");
    this.previousSelectedRange = [];
  }

  synchronise() {
    this.selectedFilters = {}; // Reset selected filters

    // Parse the URL for the parameter
    const url = new URL(window.location.href);
    const filterValues = url.searchParams.get(this.urlParam);

    if (filterValues) {
      const filters = filterValues.split(",");

      // Assign filters to their respective groups
      for (const filter of filters) {
        for (const field of Object.keys(this.filterGroups)) {
          const group = this.filterGroups[field];
          if (group.paramvalues.includes(filter)) {
            if (!this.selectedFilters[field]) {
              this.selectedFilters[field] = [];
            }
            this.selectedFilters[field].push(filter);
          }
        }
      }
    }

    // Update the query based on selected filters
    this.applyFilters();
  }

  applyFilters() {
    const nq = this.edge.cloneQuery();

    // cleaning range if present, if not creating new
    if (!nq.query.range) {
      nq.query.range = {};
    } else {
      Object.keys(nq.query.range).forEach((key) => delete nq.query.range[key]);
    }

    const textFields = ["foaf_gender"];
    const rangeFields = [
      "ox_totalWorksAddressedToAgent",
      "ox_totalWorksByAgent",
      "ox_totalWorksMentioningAgent",
      "ox_totalWorksSentFromPlace",
      "ox_totalWorksSentToPlace",
      "ox_totalWorksMentioningPlace",
    ];

    // Apply new filters from selectedFilters using must
    for (const [field, filters] of Object.entries(this.selectedFilters)) {
      if (textFields.includes(field)) {
        if (filters.length > 0) {
          const group = this.filterGroups[field];
          const valueMap = group.valueMap;
          const values = filters
            .map((paramValue) => valueMap[paramValue])
            .join(" OR ");

          // Create or update the term in nq.must
          const existingTermIndex = nq.must.findIndex(
            (item) => item.term && item.term[field]
          );
          if (existingTermIndex !== -1) {
            nq.must[existingTermIndex] = { term: { [field]: `(${values})` } };
          } else {
            nq.must.push({ term: { [field]: `(${values})` } });
          }
        } else {
          // Remove the term if no filters are selected
          nq.must = nq.must.filter((item) => !(item.term && item.term[field]));
        }
      } else if (rangeFields.includes(field)) {
        nq.query.range[field] = {
          gte: 1,
          lte: "*",
        };
      }
    }

    // Push the updated query
    this.edge.pushQuery(nq);
    this.edge.cycle();
  }
};

emlo.CheckboxRenderer = class extends edges.Renderer {
  constructor(params) {
    super(params);
    this.namespace = "edges-checkbox-renderer";
    this.label = edges.util.getParam(params, "label", "Filters");
    this.seprator = edges.util.getParam(params, "seprator", true);
  }

  draw() {
    const comp = this.component;

    // Create checkboxes for each group and filter
    let html = `<div class="${this.namespace}" style="display:flex;justify-content: center;">`;

    for (const field of Object.keys(comp.filterGroups)) {
      html += `<div class="filter-group" style="display:flex">
      <br/>`;

      const group = comp.filterGroups[field];
      const selectedFilters = comp.selectedFilters[field] || [];

      for (const paramValue of group.paramvalues) {
        const isChecked = selectedFilters.includes(paramValue);
        html += `<label style="margin:0px 10px; text-transform: capitalize;">
                          <input type="checkbox" value="${paramValue}" data-field="${field}" ${
          isChecked ? "checked" : ""
        }>
                          ${group.valueMap[paramValue]}
                      </label>`;
      }

      html += `</div>`;
    }

    html += `</div>`;

    // Render the HTML
    comp.context.html(html);

    // Attach event listeners
    const checkboxes = comp.context.find(`input[type='checkbox']`);
    checkboxes
      .off("change")
      .on("change", (event) => this.handleCheckboxChange(event));
  }

  handleCheckboxChange(event) {
    const comp = this.component;
    const checkbox = event.target;
    const field = checkbox.dataset.field;
    const value = checkbox.value;

    if (!comp.selectedFilters[field]) {
      comp.selectedFilters[field] = [];
    }

    if (checkbox.checked) {
      // Add filter to the group
      comp.selectedFilters[field].push(value);
    } else {
      // Remove filter from the group

      comp.selectedFilters[field] = comp.selectedFilters[field].filter(
        (filter) => filter !== value
      );
    }

    // Update the URL
    this.updateUrl();

    // Apply the filters
    comp.synchronise();
  }

  updateUrl() {
    const comp = this.component;
    const allFilters = [];

    // Collect all selected filters
    for (const [field, filters] of Object.entries(comp.selectedFilters)) {
      allFilters.push(...filters);
    }

    const url = new URL(window.location.href);
    if (allFilters.length > 0) {
      url.searchParams.set(comp.urlParam, allFilters.join(","));
    } else {
      url.searchParams.delete(comp.urlParam);
    }

    // Update the browser URL without reloading
    window.history.replaceState({}, "", url);
  }
};

function _addUrlParam(field, term) {
  let url_param_field = field;
  const url = new URL(window.location.href);

  const fieldMap = {
    author_sort: "aut",
    recipient_sort: "rec",
  };

  if (fieldMap.hasOwnProperty(field)) {
    if (url.searchParams.has(fieldMap[field])) {
      url_param_field = field;
    } else {
      url_param_field = fieldMap[field];
    }
  }

  const currentValue = url.searchParams.get(url_param_field);
  if (currentValue !== term) {
    url.searchParams.set(url_param_field, term); // Update or add the parameter
    window.history.replaceState(null, "", url); // Update the browser URL without reloading
  }
}

function _removeUrlParam(field) {
  let delete_field = "";
  let secondaryField = "";

  const fieldMap = {
    "person-author": {
      primary: "aut",
      secondary: "author_sort",
    },
    "person-recipient": {
      primary: "rec",
      secondary: "recipient_sort",
    },
  };

  if (field == "uuid_related") {
    delete_field = "uuids";
  }

  const validFields = [
    "dcterms_references-location",
    "mail_destination-location",
    "mail_origin-location",
    "frbr_creator-person",
    "mail_recipient-person",
    "dcterms_references-person",
  ];

  if (validFields.includes(field)) {
    delete_field = field;
  }

  if (fieldMap.hasOwnProperty(field)) {
    delete_field = fieldMap[field].primary;
    secondaryField = fieldMap[field].secondary;
  } else {
    delete_field = field;
  }
  const url = new URL(window.location.href);

  if (url.searchParams.has(delete_field)) {
    url.searchParams.delete(delete_field); // Remove the parameter
    window.history.replaceState(null, "", url); // Update the browser URL without reloading

    if (secondaryField && url.searchParams.has(secondaryField)) {
      const currentValue = url.searchParams.get(secondaryField);

      url.searchParams.delete(secondaryField);
      url.searchParams.set(delete_field, currentValue); // Update or add the parameter
      window.history.replaceState(null, "", url); // Update the browser URL without reloading
    }
  }
}

export default emlo;
