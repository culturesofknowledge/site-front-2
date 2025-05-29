import { getCollectionTitle } from "../js/profile/collectionDetails.js";
import PersonChart from "./chart.js";
import { _renderCommentProfile } from "./profile/commentFrag.js";
import {
  _renderImageProfile,
  _renderImageSidebar,
} from "./profile/imageFrag.js";
import {
  _renderInstitutionProfile,
  _renderInstitutionSidebar,
} from "./profile/institutionFrag.js";
import {
  _renderLocationProfile,
  _renderLocationSidebar,
} from "./profile/locationFrag.js";
import {
  _renderManifestationSection,
  _renderManifestationSidebar,
} from "./profile/manifestationFrag.js";
import {
  _renderGraphSection,
  _renderPeopleProfile,
  _renderPeopleSidebar,
} from "./profile/peopleFrags.js";
import { _renderWorkProfile, _renderWorkSidebar } from "./profile/workFrag.js";

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
              <button class="small button modifysearchbtn" onclick="modifyCurrentSearch()">Modify your search</button>
          </div>

         <div id="current_search">
            <h3 class="main">Your current search</h3>
            ${selected_facets}
        </div>

        <div id="refine_search" style="display:none;">
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

    // let frag = `<div class="row row-with-side">
    //   <div class="side-nav">
    //     <div id="sidebar-title">
    //       ${sidebarTitle}
    //     </div>

    //     <div id="sidebar-actions">
    //         <div>
    //           <img src="../../static/img/icon-short-url.png" alt="short-url" />
    //           Short URL:
    //           <span id="short-url-link">
    //           </span>
    //         </div>

    //         <div id="send-comment">
    //           <img src="../../static/img/icon-send-comment.png" alt="short-url" />
    //           <a> Send Comment </a>
    //         </div>
    //     </div>

    //     <div id="more-options">
    //         ${sidebar}
    //     </div>
    //   </div>

    //   <div id="main" class="" style="margin-left:5px;">
    //     <div class="large-12 columns">
    //       ${results}
    //     </div>
    //   </div>
    // </div>`;

    let frag = `
      <div id="main" class="row">
        <div class="columns large-9 large-push-3">

          <div id="pagination" class="pagination">
            <h4 id="count-heading" style="margin-top: 0.5rem;margin-bottom: 0.2rem;"></h4>
            <button class="small button" style="display:none;" id="back-to-browse">Back to Browse</button>
                
            <button class="small button" style="display:none;" id="modify-search">Modify your search</button>
            <button class="small button" style="display:none;" id="back-to-results">Back to Results</button>
            
            <span id="control" style="display:none;">
              <button class="small button" id="first-entry" title="First Entry"><<</button>
              <button class="small button" id="prev-entry" title="Previous Entry"><</button>
              <button class="small button" id="next-entry" title="Next Entry">></button>
              <button class="small button" id="last-entry" title="Last Entry">>></button>
            </span>
          </div>

          ${results}
        </div>

        <div class="columns large-3 large-pull-9 side">
          ${sidebar}
        </div>
      </div>
    `;

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
    this.isSelected = false;
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

      const selected = this.isSelected ? "" : "selected";
      // Add default option at the beginning
      options =
        `<option value="all repositories" ${selected}>all repositories</option>` +
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

    // Triggering the combo box logic
    const doc = document.getElementById("repository");

    if (doc) {
      enhanceSelect(doc);
    }

    edges.on(dropdownSelector, "change", this, "changeRepoValue");
  }

  // This function is called when the user changes the sort option
  changeRepoValue = function (element) {
    if (element.value == "all repositories") {
      _removeUrlParam("repository");
    } else {
      _addUrlParam("repository", element.value);
    }
  };

  _renderOption(result) {
    if (this.field) {
      const value = this._getValue(this.field, result, "");
      const displayText = this._getValue(this.field, result, "");

      if (this.defaultOptionText == value) {
        this.isSelected = true;
        return `<option value="${value}" selected>${displayText}</option>`;
      } else {
        return `<option value="${value}">${displayText}</option>`;
      }
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
    this.highlighting = {};
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

    if (source && source.data && source.data.hasOwnProperty("highlighting")) {
      this.highlighting = source.data["highlighting"];
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

      if (this.hitCount > 0) {
        let refineSearch = document.getElementById("refine_search");
        refineSearch.style.display = "inline";
      }

      // Check if results are fetched correctly
      if (this.hitCount && this.hitCount >= 0) {
        if (this.hitCount > 50) {
          currentDoc.innerHTML = `${this.hitCount} results (50 results per page)`;
        } else {
          currentDoc.innerHTML = `${this.hitCount} ${
            this.hitCount > 1 ? "results" : "result"
          }`;
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

          if (field.header == "Repositories & Versions") {
            return `<td id=repo-${index}> </td>`;
          } else {
            return `<td>${val}</td>`;
          }
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

            if (prefix) {
              let subPagen = res.hasOwnProperty("object_type")
                ? res["object_type"]
                : "";

              if (subPagen != "") {
                return `<td><a href="${prefix}/${subPagen}/${href}">${linkText}</a></td>`;
              }

              return `<td><a href="${prefix}/${href}">${linkText}</a></td>`;
            }

            return `<td><a href="${href}">${linkText}</a></td>`;
          }

          if (field.type === "multiple" && field.multipleFields) {
            const multipleFieldDisplay = field.multipleFields
              .map((item) => {
                let value = "";

                if (item.isSemiColon) {
                  if (
                    res &&
                    res.hasOwnProperty(item.field) &&
                    res[item.field]
                  ) {
                    value = res[item.field].split("\n").join("; ");
                  }
                } else {
                  value = this._getValue(item.field, res, "");
                }
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
        return `
          <input type="checkbox" class="side-nav-item" data-uuid="${uuid}" checked>
          <label> 
            <span> ${displayName} </span>
          </label>
          <br/>
        `;
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
      everything: "Text",
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

      if (!keys.includes(filters[i].field) && filters[i].field) {
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
        "search_type",
      ];

      if (fieldMapping.hasOwnProperty(key) && !keys.includes(key)) {
        if (value) {
          keys.push(key);

          this.filters.push({
            display: value,
            term: value,
            field: fieldMapping[key],
          });
        }
      } else if (!keys.includes(key) && !notToBeAdded.includes(key)) {
        if (value) {
          keys.push(key);

          this.filters.push({
            display: value,
            term: value,
            field: key,
          });
        }
      }
    }
  }

  removeFilter(field, term) {
    let nq = this.edge.cloneQuery();

    // Special case for handling everything
    if (field == "Text") {
      field = "default_search_field";
    }

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

    if (!ts.values || ts.values.length === 0) {
      ts.context.html("");
      return;
    }

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

    const valClass = edges.util.allClasses(
      this.namespace,
      "value",
      this.component.id
    );
    const showMoreId = edges.util.htmlID(
      this.namespace,
      "show-more",
      this.component.id
    );
    const modalId = edges.util.htmlID(
      this.namespace,
      "facet-modal",
      this.component.id
    );
    const modalCloseId = edges.util.htmlID(
      this.namespace,
      "facet-modal-close",
      this.component.id
    );
    const modalContentId = edges.util.htmlID(
      this.namespace,
      "facet-modal-content",
      this.component.id
    );

    const filterTerms = ts.filters.map((filter) =>
      filter.term ? filter.term.toString() : ""
    );

    const filterFields = ts.filters.map((filter) =>
      filter.field ? filter.field.toString() : ""
    );

    let limitedResults = "";
    ts.values.forEach((val, idx) => {
      if (val.count > 0) {
        const isHidden = idx >= this.displayLimit;
        limitedResults += `
                <tr style="${isHidden ? "display:none;" : ""}">
                  <td>
                    <a href="#" class="${valClass}" data-key="${edges.util.escapeHtml(
          val.term
        )}">
                    <img class="facet" src="../../static/img/plus-facet.png" height="15px" width="15px" />
                    ${this._displayFacetValue(this.component.field, val.term)}
                    </a>
                    </td>
                  <td>${val.count}</td>
                </tr>
            `;
      }
    });

    let fullResults = "";
    ts.values.forEach((val) => {
      if (val.count > 0) {
        fullResults += `
                <tr>
                  <td>
                  <a href="#" class="${valClass}" data-key="${edges.util.escapeHtml(
          val.term
        )}">
                  <img class="facet" src="../../static/img/plus-facet.png" height="15px" width="15px" />
                   ${this._displayFacetValue(this.component.field, val.display)}
                  </a>
                  </td>
                  <td>${val.count}</td>
                </tr>
            `;
      }
    });

    let showMoreFrag =
      ts.values.length > this.displayLimit
        ? `
        <tr>
          <td id="${showMoreId}" class="btn btn-link">Click to show more...</td>
        </tr>
    `
        : "";

    let modalFrag = `
        <div id="${modalId}" class="facet-modal">
            <div class="facet-modal-content">
                <div class="facet-modal-header">
                    <span>${this.title}</span>
                    <span id="${modalCloseId}" class="facet-modal-close">&times;</span>
                </div>
                <div class="facet-modal-content-wrapper">
                    <table class="facet">
                        <tbody>${fullResults}</tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    let isHideCount = false;

    const filterFieldsCount = filterFields.reduce((acc, item) => {
      return item === this.component.field ? acc + 1 : acc;
    }, 0);

    if (filterFieldsCount >= this.hideCount && this.hideCount > 0) {
      isHideCount = true;
    }

    let frag = `
        <div class="facet"  style="${isHideCount ? "display:none;" : ""}">
            <h4>${this.title}</h4>
            <table class="facet">
                <tbody>${limitedResults}${showMoreFrag}</tbody>
            </table>
        </div>
        ${modalFrag}
    `;

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

    const showMoreSelector = edges.util.idSelector(
      this.namespace,
      "show-more",
      this.component.id
    );
    const modalSelector = edges.util.idSelector(
      this.namespace,
      "facet-modal",
      this.component.id
    );
    const modalCloseSelector = edges.util.idSelector(
      this.namespace,
      "facet-modal-close",
      this.component.id
    );

    const sizeSelector = edges.util.idSelector(this.namespace, "size", this);
    const orderSelector = edges.util.idSelector(this.namespace, "order", this);

    edges.on(valueSelector, "click", this, "termSelected");
    edges.on(toggleSelector, "click", this, "toggleOpen");
    edges.on(filterRemoveSelector, "click", this, "removeFilter");
    edges.on(sizeSelector, "click", this, "changeSize");
    edges.on(orderSelector, "click", this, "changeSort");

    if (this.component.jq(showMoreSelector).length > 0) {
      edges.on(showMoreSelector, "click", this, "openModal");
    }
    edges.on(modalCloseSelector, "click", this, "closeModal");
  }

  _displayFacetValue(field, val) {
    if (field == "object_type") {
      const typeMap = {
        work: "Letter",
        manifestation: "Document",
        resource: "Related resource",
        person: "Person or organisation",
      };

      if (typeMap.hasOwnProperty(val)) {
        return typeMap[val];
      } else {
        return val.charAt(0).toUpperCase() + val.slice(1);
      }
    } else {
      return val;
    }
  }

  openModal() {
    const modalSelector = edges.util.idSelector(
      this.namespace,
      "facet-modal",
      this.component.id
    );
    this.component.jq(modalSelector).css("display", "block");
  }

  closeModal() {
    const modalSelector = edges.util.idSelector(
      this.namespace,
      "facet-modal",
      this.component.id
    );
    this.component.jq(modalSelector).css("display", "none");
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
        <tr class="${resultClass}" style="vertical-align: middle;">
          <td style="width:80px" class="capitalize-first-letter">
          ${this._getSelectedFieldLabel(filt.field)}
          </td>

          <td style="max-width:120px" class="${filterRemoveClass} selected-facets" data-key="${
        filt.term
      }" data-field="${filt.field}" >
              ${this._getDisplayValue(filt.field, filt.display)}
          </td>

          <td style="width:50px;padding:0;" class="${filterRemoveClass}" data-key="${
        filt.term
      }" data-field="${filt.field}" >
            <a title="Remove from your search criteria">
               <img class="facet" src="../../static/img/minus-facet.png" alt="Remove from your search criteria" height="15px" width="15px">
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

      if (
        typeof value === "string" &&
        value.startsWith('"http') &&
        value.endsWith('"')
      ) {
        value = value.split("/").filter(Boolean).pop();
        value = value.slice(0, -1);
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

  // _getSelectedFieldLabel(field) {
  //   switch (field) {
  //     case "author_sort":
  //     case "frbr_creator-person":
  //       return "Author";
  //     case "recipient_sort":
  //     case "mail_recipient-person":
  //       return "Recipient";
  //     case "dcterms_references-person":
  //       return "Mentions";
  //     case "origin_sort":
  //       return "Origin of letter";
  //     case "destination_sort":
  //       return "Destination of letter";
  //     case "cito_Catalog":
  //       return "Catalogue";
  //     case "ox_started-ox_year":
  //       return "Year";
  //     case "mail_origin-location":
  //     case "pla_ori_name":
  //       return " Origin of letter";
  //     case "mail_destination-location":
  //     case "pla_des_name":
  //       return " Origin of letter";
  //     case "dcterms_references-location":
  //     case "pla_ment_name":
  //       return " Places mentioned";
  //     case "uuid_related":
  //       return "Any from list";
  //     default:
  //       return field;
  //   }
  // }

  _getSelectedFieldLabel(field) {
    const fieldLabels = {
      aut: "Author",
      author_sort: "Author",
      aut_mark: "Author as marked",
      aut_org: "Author is organisation",
      agent_org: "Author, recipient etc is organisation",
      aut_gend: "Author Gender",
      aut_roles: "Roles or titles of author",
      rec: "Recipient",
      rec_roles: "Roles or titles of recipient",
      rec_mark: "Recipient as marked",
      rec_org: "Recipient is organisation",
      rec_gend: "Recipient Gender",
      ment: "Person or organisation mentioned",
      ment_gend: "Gender of person mentioned",
      ment_roles: "Roles or titles of person mentioned",
      ment_org: "Organisation is mentioned",
      recipient_sort: "Addressee",
      origin_sort: "Origin",
      pla_ori_name: "Origin",
      pla_ori_mark: "Origin as marked",
      pla_des_name: "Destination",
      pla_des_mark: "Destination as marked",
      pla_ment_name: "Place mentioned",
      let_ima: "Has images",
      let_trans: "Has transcription",
      let_abst: "Has abstract",
      let_shel: "Shelfmark",
      let_pe: "Has printed editions",
      let_pe_tex: "Printed editions",
      let_with_en: "Enclosed",
      let_en: "Encloses",
      let_pap_siz: "Has paper size",
      let_pap_siz_tex: "Paper size",
      let_pap_typ: "Has paper type",
      let_pap_typ_tex: "Paper type",
      let_page: "Has page count",
      let_page_min: "Minimum page count",
      let_seal: "Has seal",
      let_seal_tex: "Seal",
      let_pmark: "Has postmark",
      let_pmark_tex: "Postmark",
      let_end: "Has endorsement",
      let_end_tex: "Endorsement",
      let_con: "Contents",
      let_lang: "Language",
      destination_sort: "Destination",
      col_cat: "Catalogue",
      cat_group: "Catalogues",
      let_type: "Document type",
      started_date_sort: "Date",
      dat_sin_year: "Year",
      dat_sin_month: "Month",
      dat_sin_day: "Day",
      dat_from_year: "From year",
      dat_from_month: "From month",
      dat_from_day: "From day",
      dat_to_year: "To year",
      dat_to_month: "To month",
      dat_to_day: "To day",
      "dcterms_references-person": "Mentions",
      "mail_origin-location": "Origin",
      "mail_destination-location": "Destination",
      "dcterms_references-location": "Place mentioned",
      uuid_related: "Any from list",
      "frbr_creator-person": "Author",
      "ox_started-ox_year": "Year",
      cito_Catalog: "Catalogue",
      object_type: "Record Type",
      "object type": "Record Type",
      collection: "Collections",
      locations: "Locations",
      work: "Letter",
      person: "Person or organisation",
      manifestation: "Document",
      resource: "Related resource",
      cito_Catalog: "Catalogue",
      ox_keywords: "Keywords",
      dcterms_language: "Language",
      dcterms_abstract: "Abstract",
      ox_editStatus: "Edit Status",
      ox_incipit: "Incipit",
      ox_excipit: "Explicit",
      mail_postScript: "Postscript",
      ox_editorNotes: "Editors' Notes",
      "frbr_Manifestation-manifestation":
        "Versions (originals, copies, digital, etc.)",
      "rdfs_seeAlso-resource": "Related Resources",
      "ox_isAnnotatedBy-comment": "Comments",
      "ox_started-ox_year": "Year",
      "frbr_creator-person": "Author",
      "mail_recipient-person": "Recipient",
      "mail_authors-rdf_value": "Author (as marked)",
      "mail_addressees-rdf_value": "Recipient (as marked)",
      "dcterms_references-person": "Mentions",
      dcterms_relation: "Link",
      skos_altLabel: "Alternative names",
      foaf_name: "Name",
      "dcterms_identifier-shelf_": "Shelfmark",
      mail_destination: "Address",
      "frbr_Work-work": "Details of letter",
      "frbr_Image-image": "Image",
      "ox_resourceAt-institution": "Repository",
      geonames_officialName: "Repository",
      bibo_Note: "Comment",
      "bibo_annotates-work": "Comment on letter",
      "bibo_annotates-person": "Comment on person or organisation",
      "ox_annotatesAddressee-work": "Comment on addressee",
      "ox_annotatesAuthor-work": "Comment on author",
      "ox_annotatesDate-work": "Comment on date",
      ox_titleOfResource: "Resource title",
      dcterms_description: "Description of letter",
      "mail_origin-location": "Origin of letter",
      "mail_destination-location": "Destination of letter",
      "mail_destination-rdf_value": "Destination (as marked)",
      "mail_origin-rdf_value": "Origin (as marked)",
      "frbr_creatorOf-work": "Letters Written",
      "mail_recipientOf-work": "Letters Received",
      "ox_memberOf-person": "Member of",
      "foaf_member-person": "Members",
      "dcterms_isReferencedBy-work": "Letters Mentioning",
      foaf_gender: "Gender",
      mail_paperSize: "Paper size",
      mail_paper: "Paper type or watermark",
      ox_numPageText: "Number of pages of text",
      mail_seal: "Seal",
      ox_endorsements: "Endorsements",
      ox_nonLetterEnclosures: "Non-letter enclosures",
      mail_postageMark: "Postage mark",
      ox_printedEditionDetails: "",
      "mail_enclosedBy-manifestation": "Was enclosed in",
      "mail_enclosureOf-manifestation": "Had enclosure",
      "mail_originOf-work": "Letters Sent From",
      "mail_destinationOf-work": "Letters Sent To",
      "rdfs_seeAlso-work": "Resource related to letter",
      "rdfs_seeAlso-person": "Resource related to person or organisation",
      ox_titlesRolesOccupations: "Titles or roles",
      "rel_childOf-person": "Child of",
      "rel_parentOf-person": "Parent of",
      "rel_siblingOf-person": "Sibling of",
      "rel_spouseOf-person  ": "Spouse of",
      "rel_relativeOf-person": "Relative of",
      "ox_unspecifiedRelationshipWith-person": "Unspecified relationship with",
      "dcterms_identifier-editi_": "ID",
      "dcterms_identifier-uri_": "URI",
      "rdfs_seeAlso-work": "Letter with related resource",
      "rdfs_seeAlso-person": "Person with related resource",
      "dcterms_references-location": "Places mentioned",
      "dcterms_references-work": "Letters mentioned",
      "ox_authorAnnotate-comment": "Comments on author",
      "ox_addresseeAnnotate-comment": "Comments on addressee",
      "ox_dateAnnotate-comment": "Comments on creation date",
      "ox_dateReceiptAnnotate-comment": "Comments on receipt date",
      "ox_originAnnotate-comment": "Comments on origin",
      "ox_destinationAnnotate-comment": "Comments on destination",
      "person-author": "Author",
      "person-author-organisation": "Author is organisation",
      "person-author-gender": "Gender is author",
      "person-recipient": "Addressee",
      "person-recipient-organisation": "Addressee is organisation",
      "person-recipient-gender": "Gender is addressee",
      "location-origin": "Origin",
      "location-destination": "Destination",
      ox_day: "Day",
      ox_month: "Month",
      ox_year: "Year",
      ox_started: "Period start",
      ox_completed: "Period end",
      "ox_started-ox_day": "Start day",
      "ox_started-ox_month": "Start month",
      "ox_completed-ox_day": "End day",
      "ox_completed-ox_month": "End month",
      "ox_completed-ox_year": "End year",
      ox_dateIsRange: "Date range",
      ox_originalCalendar: "Original calendar",
      ox_dateMarked: "Date as marked",
      ox_internalAdded: "Date added",
      ox_internalCreated: "Date created",
      ox_internalModified: "Date changed",
      indef_uncertainDate: "Uncertainty flag",
      indef_uncertain: "Uncertain",
      indef_inferred: "Inferred",
      indef_approximate: "Approximate",
      mail_authors_uncertain: "Author uncertain",
      mail_authors_inferred: "Author inferred",
      mail_addressees_uncertain: "Addressee uncertain",
      mail_addressees_inferred: "Addressee inferred",
      mail_origin_uncertain: "Origin uncertain",
      mail_origin_inferred: "Origin inferred",
      mail_destination_uncertain: "Destination uncertain",
      mail_destination_inferred: "Destination inferred",
      ox_started_uncertain: "Date uncertain",
      ox_started_inferred: "Date inferred",
      ox_started_approximate: "Date approximate",
      dcterms_created: "Creation date",
      "dcterms_created-ox_year": "Creation date year",
      "dcterms_created-ox_month": "Creation date month",
      "dcterms_created-ox_day": "Creation date day",
      "dcterms_created-uncertain": "Creation date uncertain",
      "dcterms_created-inferred": "Creation date inferred",
      "dcterms_created-approximate": "Creation date approximate",
      dcterms_source: "Image source file",
      foaf_thumbnail: "Thumbnail file",
      "bibo_annotates-manifestation": "Document commented on",
      "bibo_annotates-location": "Place commented on",
      "foaf_name-firstletter": "First letter of name",
      geonames_name: "Location name",
      ox_locationAlternateName: "Alternative names",
      "ox_hasResource-manifestation": "Repository contents",
      geonames_alternateName: "Alternative names for repository",
      geonames_locatedIn: "City",
      ox_locatedInAlternate: "Alternative names for city",
      geonames_inCountry: "Country",
      ox_inCountryAlternate: "Alternative names for country",
      dcterms_type: "Document type",
      ox_detailsOfResource: "Resource details",
      bio_Birth: "Birth",
      "bio_Birth-ox_year": "Birth year",
      "bio_Birth-ox_month": "Birth month",
      "bio_Birth-ox_day": "Birth day",
      "bio_Birth-uncertain": "Birth date uncertain",
      "bio_Birth-inferred": "Birth date inferred",
      "bio_Birth-approximate": "Birth date approximate",
      bio_Death: "Death",
      "bio_Death-ox_year": "Death year",
      "bio_Death-ox_month": "Death month",
      "bio_Death-ox_day": "Death day",
      "bio_Death-uncertain": "Death date uncertain",
      "bio_Death-inferred": "Death date inferred",
      "bio_Death-approximate": "Death date approximate",
      ox_furtherReading: "Further reading",
      geo_lat: "Latitude",
      geo_long: "Longitude",
      ox_isOrganisation: "Is organisation",
      "manifestation-paper_size": "Paper size",
      "manifestation-paper_type": "paper type",
      bibo_numPages: "Number of pages of document",
      "manifestation-pages_number": "Number of pages",
      "manifestation-seal": "Seal",
      "manifestation-endorsements": "Endorsements",
      "manifestation-non_letter_enclosures": "Non-letter enclosures",
      "manifestation-postage_mark": "Postage mark",
      "manifestation-enclosed": "Enclosed",
      "manifestation-enclosure": "Document with enclosure",
      "mail_replyTo-work": "Reply to",
      "mail_hasReply-work": "Answered by",
      "owl_sameAs-work": "Matches",
      "manifestation-has_image": "Has image",
      get_manif_repository_fieldname: "Repository",
      "manifestation-doc_type": "Document type",
      "manifestation-shelfmark": "Shelfmark",
      "manifestation-printed_edition": "Printed edition",
      ox_isTranslation: "Is translation",
      "ox_previouslyOwned-manifestation": "Documents owned",
      "ox_previouslyOwnedBy-person": "Former owner",
      "mail_handwrote-manifestation": "Handwrote",
      "mail_handwroteBy-person": "Handwritten by",
      "ox_wasBornIn-location": "Place where born",
      "rel_wasBirthplaceOf-person": "People born at place",
      "ox_diedAt-location": "Place where died",
      "rel_wasPlaceOfDeathOf-person": "People who died at place",
      "ox_wasAt-location": "Places visited",
      "rel_wasVisitedBy-person": "People who visited place",
      "ox_annotatesAgentsReferenced-work":
        "Letters with comments on people mentioned",
      "ox_agentsReferencedAnnotatedBy-comment":
        "Comments on people mentioned in work",
      ox_totalWorksByAgent: "Letters Written",
      ox_totalWorksAddressedToAgent: "Letters Received",
      ox_totalWorksMentioningAgent: "Letters Mentioning",
      ox_totalWorksSentFromPlace: "Letters Sent From",
      ox_totalWorksSentToPlace: "Letters Sent To",
      ox_totalWorksMentioningPlace: "Letters Mentioning",
      ox_totalDocsInRepository: "Number of documents",
      ox_opened: "Opened",
      ox_routing_mark_ms: "Routing mark (MS)",
      ox_routing_mark_stamp: "Routing mark (stamp)",
      ox_handling_instructions: "Handling instructions",
      ox_stored_folded: "Stored folded",
      ox_postage_costs_as_marked: "Postage cost as marked",
      ox_postage_costs: "Postage cost",
      ox_non_delivery_reason: "Non-delivery reason",
      ox_date_of_receipt_as_marked: "Date of receipt as marked",
      ox_manifestation_receipt_calendar: "Date of receipt calendar",
      ox_manifestation_receipt_date: "Date of receipt",
      ox_manifestation_receipt_date_gregorian: "Date of receipt gregorian",
      ox_manifestation_receipt_date_inferred: "Date of receipt inferred",
      ox_manifestation_receipt_date_uncertain: "Date of receipt uncertain",
      ox_manifestation_receipt_date_approx: "Date of receipt approx",
      ox_accompaniments: "Accompaniments",
      "taught-person": "Taught",
      "was_taught_by-person": "Was taught by",
      "employed-person": "Employed",
      "was_employed_by-person": "Was employed by",
      "friend-person": "Friend of",
    };

    return fieldLabels[field] || field;
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
    this.optimizedCode = edges.util.getParam(params, "optimizedCode", false);
    this.relationships = [];
    this.loading = true; // Track loading state
    this.errorMessage = ""; // Track error message
    this.fetchTableData = edges.util.getParam(params, "fetchTableData", false);
    this.tableDataFields = edges.util.getParam(params, "tableDataFields", []);
    this.fetchImageData = edges.util.getParam(params, "fetchImageData", false);
    this.manifestationField = edges.util.getParam(
      params,
      "manifestationField",
      ""
    );
    this.gneratedData = {}; // this data will be used for displayig linked information
    this.graphData;
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
      if (results && results.length > 0) {
        let relations = await this._fetchRelations(results[0]["uuid"]);
        this.relationships = relations;
      }

      if (this.fetchTableData && this.tableDataFields.length > 0) {
        const result = results[0];

        for (const field of this.tableDataFields) {
          if (Object.prototype.hasOwnProperty.call(result, field)) {
            const val = result[field]; // Assuming val is an array of URIs
            const uuids = Array.from(
              new Set(val.map((uri) => uri.split("/").pop()))
            );

            if (uuids.length > 0) {
              let payload = {
                solrCore: "work",
                uuids: uuids,
                filter: "",
                objectKey: "uuid",
              };

              // In case of ox_hasResource-manifestation we need manifestation, core needs to be updated
              if (field == "ox_hasResource-manifestation") {
                payload.objectKey = "uuid_related";
              }

              this.gneratedData[field] = await this._fetchMoreWorkData(payload);
            }
          }
        }
      }

      // This will only work for manifestation since they are only fields which can have image values
      if (this.fetchImageData && this.manifestationField !== "") {
        const result = results[0];

        if (result.hasOwnProperty(this.manifestationField)) {
          const maniUris = result[this.manifestationField];

          if (Array.isArray(maniUris) && maniUris.length > 0) {
            for (const uri of maniUris) {
              const uuid = uri.split("/").pop();

              if (uuid) {
                if (!this.gneratedData.hasOwnProperty("imageData")) {
                  this.gneratedData["imageData"] = {};
                }

                const payload = {
                  solrCore: "image",
                  uuids: [uuid],
                  filter: "",
                  objectKey: "uuid_related",
                };

                this.gneratedData["imageData"][uuid] = await this._fetchImages(
                  uuid
                );

                if (!this.gneratedData.hasOwnProperty("manifestationData")) {
                  this.gneratedData["manifestationData"] = {};
                }

                let relationsArray = await this._fetchRelations(uuid);

                this.gneratedData["manifestationData"][uuid] =
                  relationsArray.reduce((acc, item) => {
                    acc[item.uuid] = item;
                    return acc;
                  }, {});
              }
            }
          }
        }
      }
    } catch (error) {
      console.log("got error", error);
      this.errorMessage = "Error fetching data.";
    } finally {
      this.loading = false; // Stop loading
    }

    this.renderer.draw();

    this.hitCount = source.total();
  }

  async _fetchMoreWorkData(payload) {
    try {
      const response = await fetch(`/stats-new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error(`Error fetching relations: ${response.statusText}`);
        return [];
      }

      const json = await response.json();
      return json;
    } catch (err) {
      console.error("Error while fetching relations", err);
      return [];
    }
  }

  async _fetchRelations(uuid) {
    try {
      const response = await fetch(
        `/solr/all/select?q=uuid_related:${uuid}&wt=json&rows=9999`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error(`Error fetching relations: ${response.statusText}`);
        return [];
      }

      const json = await response.json();
      return json.response.docs;
    } catch (err) {
      console.error("Error while fetching relations", err);
      return [];
    }
  }

  async _fetchImages(uuid) {
    try {
      const response = await fetch(
        `/solr/images/select?q=uuid_related:${uuid}&wt=json&rows=9999`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error(`Error fetching relations: ${response.statusText}`);
        return [];
      }

      const json = await response.json();
      return json.response.docs;
    } catch (err) {
      console.error("Error while fetching relations", err);
      return [];
    }
  }

  async _appendResults(params) {
    const results = params.results;

    if (this.fetchSecondaryData) {
      if (this.optimizedCode) {
        console.debug("running optimized code for:", this.primaryField);
        let objectKey = "uuid";
        const uuidArray = [];
        let collectionName = "work";
        for (const result of results) {
          const fieldData = result[this.primaryField];
          if (fieldData && Array.isArray(fieldData)) {
            fieldData.forEach((url) => {
              const parts = url.split("/");
              collectionName = parts[3] === "person" ? "people" : parts[3];
              const id = parts[4];
              uuidArray.push(id);
            });
          }
        }

        // Patch changing the collection name for specific primary key
        if (this.primaryField === "ox_hasResource-manifestation") {
          collectionName = "work";
          objectKey = "uuid_related";
        }

        const payload = {
          solrCore: collectionName,
          uuids: uuidArray,
          objectKey: objectKey,
          filter: "", // Adjust if a filter is required
        };

        try {
          const response = await fetch("/stats-new", {
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

          results[0][this.primaryField] = await response.json();
        } catch (err) {
          console.error("got error while fetching details ", err);
        }

        // console.log("got uuid", uuidArray);
      } else {
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
    this.dynamicTitle = edges.util.getParam(params, "dynamicTitle", "");
    this.dynamicTitleField = edges.util.getParam(
      params,
      "dynamicTitleField",
      ""
    );
    this.dynamicImage = edges.util.getParam(params, "dynamicImage", "");
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
    this.footerType = edges.util.getParam(params, "footerType", "");
    this.isSide = edges.util.getParam(params, "isSide", false); // Whether to render in a sidebar
    this.subSection = edges.util.getParam(params, "subSection", false);
    this.isDivider = edges.util.getParam(params, "isDivider", true);
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
        case "shortUrl":
          this._renderShortUrl();
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
        case "footer":
          frag = this._renderFooter();
          break;
        default:
          frag = "<div></div>";
      }
    }

    const sectionTitleFrag = this._renderSectionTitle();
    const dividerFrag = this.divider
      ? this.isSide
        ? '<hr class="yellow-divider"/>'
        : '<div class="yellow-divider"></div>'
      : "";

    const containerClasses = edges.util.styleClasses(
      this.namespace,
      "container",
      this.component.id
    );

    let container = "";

    if (frag) {
      // const content = this.isSide
      //   ? `${sectionTitleFrag}${frag}`
      //   : `<div class="" style="padding-bottom:20px;padding-left: 0.9375rem;padding-right: 0.9375rem">
      //        ${sectionTitleFrag}
      //        ${frag}
      //      </div>`;

      const content = this.isSide
        ? `${sectionTitleFrag}${frag}`
        : `<div class="" ${
            this.subSection
              ? 'style="padding-left:0.9375rem;padding-right:0.9375rem"'
              : 'style="padding-bottom:20px;padding-left:0.9375rem;padding-right:0.9375rem"'
          }>
       ${sectionTitleFrag}
       ${frag}
     </div>`;

      container = `<div class="${containerClasses}">
        ${dividerFrag} 
        ${content}
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
        ? `<img src="${edges.util.escapeHtml(
            this.sectionTitleImage
          )}" alt="${edges.util.escapeHtml(
            this.sectionTitle
          )}" class="title-image" />`
        : "";

      return `<${this.sectionTitleStyle}>${imageTag}${this.sectionTitle}</${this.sectionTitleStyle}>`;
    } else {
      return "";
    }
  }

  _pageHeading() {
    const params = new URLSearchParams(window.location.search);
    let extraBr = "<br/>";

    if (this.field == "frbr_Work-work") {
      const workUri = this.component.relationships[0]["frbr_Work-work"][0];

      const workUUID = workUri.split("/").pop();

      const apiUrl = `/solr/works/select?q=uuid:${workUUID}&wt=json&fl=dcterms_description,uuid`;

      fetch(apiUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          // Step 3: Use the data to update the DOM
          const element = document.getElementById("heading");

          if (
            data &&
            data.response &&
            data.response.docs &&
            data.response.docs.length > 0
          ) {
            const result = data.response.docs[0];

            if (element) {
              element.innerHTML = `
                <a href=/profile/work/${result.uuid}> ${result.dcterms_description} </a>
              `;
            }
          }

          console.log("data", data, element);

          //   if (element) {
          //     // Customize this part to match the structure of your API response
          //     element.innerHTML = `
          //   <h3>Title: ${data.title}</h3>
          //   <p>Author: ${data.author}</p>
          //   <p>Description: ${data.description}</p>
          // `;
          //   } else {
          //     console.warn("Element with ID 'work-info' not found.");
          //   }
        })
        .catch((error) => {
          console.error("Failed to fetch work info:", error);
        });
    }

    if (params.get("type")) {
      extraBr = "";
    } else {
      // Hiding pagination just to remove extra space
      const paginationDoc = document.getElementById("pagination");

      if (paginationDoc) {
        paginationDoc.style.display = "none";
      }
    }

    return `
      ${extraBr}
      <h2 id="heading">
        ${edges.util.escapeHtml(this.component.results[0][this.field] || "")}
      </h2> 
      <br/>
      `;
  }

  _sideTitle() {
    let title = "";
    let imageTag = "";

    const result = this.component.results[0];
    if (this.dynamicTitle != "" && this.dynamicTitleField != "") {
      let val;
      if (result.hasOwnProperty(this.dynamicTitleField)) {
        val = result[this.dynamicTitleField];
      }

      if (typeof val === "boolean") {
        title = val ? this.dynamicTitle : "";

        if (val && this.dynamicImage) {
          imageTag = this.dynamicImage
            ? `<img src="${edges.util.escapeHtml(
                this.dynamicImage
              )}" alt="${edges.util.escapeHtml(title)}" class="profile-icon">`
            : "";
        }
      } else {
        title = val != "" ? val : this.dynamicTitle;
      }
    }

    if (title == "") {
      title = this.contentTitle;
    }

    if (imageTag == "") {
      imageTag = this.contentTitleImage
        ? `<img src="${edges.util.escapeHtml(
            this.contentTitleImage
          )}" alt="${edges.util.escapeHtml(title)}" class="profile-icon">`
        : "";
    }

    return `
    <div style="padding-bottom: 21px; padding-top:5px">
      ${imageTag}
      <strong style="font-family: Helvetica Neue,Helvetica,Roboto,Arial,sans-serif;cursor: auto;">${edges.util.escapeHtml(
        title
      )}</strong>
    </div>
    <div class="yellow-divider"></div><br>`;
  }

  _renderRepoVersion() {
    const sectionHeading = "Versions (originals, copies, digital, etc.)";
    let frag = `<h2>${sectionHeading}</h2>`;
    this.component.results[0][this.primaryField].forEach((item) => {
      if (item.dcterms_type == "Letter") {
        frag += this._getLetterReopContent(item);

        if (item.hasOwnProperty("ox_resourceAt-institution")) {
          this._getInstituteData(item["ox_resourceAt-institution"]);
        }
      } else if (item.dcterms_type == "Manuscript copy") {
        frag += this.__getManuRepoContent(item);
        if (item.hasOwnProperty("ox_resourceAt-institution")) {
          this._getInstituteData(item["ox_resourceAt-institution"]);
        }
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
      <div id="repo-section"></div>
		  <p>
        <span class="fieldlabel">Shelfmark:</span> ${content["dcterms_identifier-shelf_"]} 
      </p>
      <p>
        <span class="fieldlabel">Postage mark:</span>${content.mail_postageMark}
      </p>
	</div>
  <br/>
    `;
  }

  __getManuRepoContent(content) {
    return `
    <div class="display_details_of_one_object False">
      <h3>Version:  Manuscript copy </h3>
      
      <p><span class="fieldlabel">Repository:</span></p>
        <div id="repo-section"></div>
        <p>
          <span class="fieldlabel">Shelfmark:</span> ${content["dcterms_identifier-shelf_"]} 
        </p>
        <p>
          <span class="fieldlabel">Paper size:</span> ${content["mail_paperSize"]} 
        </p>
        <p>
          <span class="fieldlabel">Number of pages of document:</span> ${content["bibo_numPages"]} 
        </p>
        <p>
          <span class="fieldlabel">Number of pages of text:</span>${content.ox_numPageText}
        </p>
    </div>
    <br/>
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

                  if (info.mainKey == "ox_locatedInAlternate") {
                    if (
                      this.component.results[0].hasOwnProperty(info.mainKey)
                    ) {
                      displayValue = this.component.results[0][info.mainKey];
                    }
                  } else {
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
                  }

                  return edges.util.escapeHtml(displayValue || "");
                })
                .join("");
            }

            if (field.type == "date") {
              value = this._formatDate(this.component.results[0][field.key]);
            } else if (field.type == "work-date") {
              value = this._getWorkDate();
            } else if (field.key == "geonames_locatedIn") {
              value = this.component.results[0][field.key];

              let html = `<div class="content">`;

              if (value) {
                html += `<span class="${field.hideClass ? "" : "fieldlabel"}">${
                  field.title
                }: ${value}`;

                if (additionalInfo) {
                  html += ` (${additionalInfo})</span>`;
                } else {
                  html += `</span>`;
                }
              }
              html += `</div>`;

              return html;
            } else {
              value = this.component.results[0][field.key];
            }

            // Hide class is a patch code for institution location section.
            return additionalInfo || value
              ? `<div class="content">
              ${
                value
                  ? `
                  ${
                    field.title
                      ? `<p class="${
                          field.hideClass ? "" : "fieldlabel"
                        }">${edges.util.escapeHtml(field.title)}: `
                      : ""
                  }
                    ${edges.util.escapeHtml(value)}</p>`
                  : ""
              }
              
                 ${
                   additionalInfo
                     ? `<p style="font-size:smaller">${additionalInfo}</p>`
                     : ""
                 }
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
      return `<div class="content"><dl>
      ${this.fields
        .map((field) => {
          const value = this.component.results[0][field.key] || "";
          if (!value.trim()) return "";

          return ` 
               <dt><strong> ${field.title} </strong></dt>
               <dd> ${edges.util.escapeHtml(
                 this.component.results[0][field.key] || ""
               )} </dd>
            `;
        })
        .join("")}</dl></div>
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
    <div class="">
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

  _getWorkDate() {
    // Data from this.component.results[0]
    const result = this.component.results[0];

    // Month names array
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

    // Get the date fields
    const startDay = result["ox_started-ox_day"] || "";
    const startMonth = result["ox_started-ox_month"] || 13; // Default to 13 (invalid month)
    const startYear = result["ox_started-ox_year"] || "";

    const endDay = result["ox_completed-ox_day"] || "";
    const endMonth = result["ox_completed-ox_month"] || 13; // Default to 13 (invalid month)
    const endYear = result["ox_completed-ox_year"] || "";

    // Construct the date string for the start
    let date = `${startDay} ${months[startMonth - 1]} ${startYear}`;

    // Check if the date is a range
    const isRange = result["ox_dateIsRange"] || false;

    // Construct the date string for the end
    let dateTo = `${endDay} ${months[endMonth - 1]} ${endYear}`;

    // Remove spaces from the date strings
    const dateNoSpaces = date.replace(" ", "");
    const dateToNoSpaces = dateTo.replace(" ", "");

    // Handle cases where the date strings are empty
    if (dateNoSpaces + dateToNoSpaces === "") {
      date = "Unknown date";
    }

    // Output the date information
    if (!isRange) {
      return `${date}`;
    } else if (dateNoSpaces > "" && dateToNoSpaces > "") {
      return `Between ${date} and ${dateTo}`;
    } else if (dateNoSpaces > "") {
      return `On or after ${date}`;
    } else {
      return `On or before ${dateTo}`;
    }
  }

  // Specific for people on profile
  _renderDatesForPeople() {
    let content = "";
    let resultObj = this.component.results[0];

    this.fields.map((field) => {
      let displayValue = "";
      let title = "";

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

      if (
        resultObj.hasOwnProperty("ox_isOrganisation") &&
        resultObj["ox_isOrganisation"]
      ) {
        if (field.core == "birth") {
          title = "Date of formation";
        } else {
          title = "Date of disbandment";
        }
      }

      if (displayValue) {
        content += `
      <dt>
        <strong> ${title || field.title} </strong>
      </dt>
      <dd> 
        ${displayValue}
      </dd>
    `;
      }
    });

    if (content) {
      return `<div class="content"><dl> ${content} </dl></div><br/>`;
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
        // Determine the value: if it's an array, use its length; if it's a number, use it directly; otherwise, use 0
        let value = this.component.results[0][field.key];

        if (Array.isArray(value)) {
          value = value.length; // Use the length if it's an array
        } else if (typeof value !== "number") {
          value = 0; // If it's neither a number nor an array, set it to 0
        }

        const escapedValue = edges.util.escapeHtml(value);
        const isClickable = value > 0;

        return `
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
          <p class="highlight-box" style="font-family:sans-serif;">
            ${statsHtml}
            </span>
          </p>
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
        // console.log("acc", acc, parentObject);
        if (!parentObject) return acc;

        const year =
          parentObject["ox_started-ox_year"] ||
          parentObject["ox_completed-ox_year"];

        if (this.primaryResultKey) {
          queryVal = this.component.results[0][this.primaryResultKey];
        } else {
          if (this.field == "repository") {
            queryVal = this.component.results[0]["browse"];
          } else {
            queryVal = parentObject["author_sort"];
          }
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
                `<a href="/forms/advanced?${queryKey}=${queryVal}&dat_sin_year=${year}"> ${year}: ${count} </a>`
            )
            .join(" ♦ ");
          return `
          <tr>
            <td>
              ${decade === "????" ? `????` : `${decade}s`}
            </td>
            <td> ${yearCounts} </td>
          </tr>`;
        })
        .join("");

      let countFrag = "";
      if (this.primaryField == "ox_hasResource-manifestation") {
        countFrag += `${allParentObjects.length} records`;
      }

      return `
        <div style="margin-left:35px">
          ${countFrag}
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
        </div>
      `;
    }

    // Current format for datasets with parentObject count <= 30
    const rows = this.component.results
      .map((result) => {
        let parentObjects = result[parentField];
        if (!parentObjects || parentObjects.length === 0) return "";

        parentObjects.sort((a, b) => {
          const startA = a["ox_started-ox_year"] ?? a["0x_completed-ox_year"];
          const startB = b["ox_started-ox_year"] ?? b["0x_completed-ox_year"];

          // If both values are undefined, consider them equal
          if (startA === undefined && startB === undefined) return 0;

          // If one value is undefined, treat it as larger (to push it to the end)
          if (startA === undefined) return 1;
          if (startB === undefined) return -1;

          // Otherwise, compare the values normally
          return startA - startB;
        });

        let lastfieldKey = 0;

        // return parentObjects
        //   .map((parentObject) => {
        //     if (!parentObject) return "";

        //     const cells = [];
        //     // if (field) {
        //     //   const value = parentObject[field];
        //     //   cells.push(`<td>${edges.util.escapeHtml(value || "")}</td>`);
        //     // }
        //     if (subFields) {
        //       subFields.forEach((subField) => {
        //         const value = parentObject[subField.key];
        //         if (subField.clickable) {
        //           cells.push(`
        //             <td>
        //               <a href="/profile/${subField.collectionName}/${
        //             parentObject["uuid"]
        //           }" class="clickable-row">${edges.util.escapeHtml(
        //             value || ""
        //           )}</a>
        //             </td>
        //           `);
        //         } else {
        //           if (
        //             subField.key == "ox_started-ox_year" ||
        //             subField.key == "ox_completed-ox_year"
        //           ) {
        //             if (lastfieldKey !== value) {
        //               lastfieldKey = value;
        //               cells.push(
        //                 `<td>${edges.util.escapeHtml(value || "")}</td>`
        //               );
        //             } else {
        //               cells.push(`<td></td>`);
        //             }
        //           }
        //         }
        //       });
        //     }

        //     return `<tr>${cells.join("")}</tr>`;
        //   })
        //   .join("");

        return parentObjects
          .map((parentObject) => {
            if (!parentObject) return "";

            const cells = [];
            let rowStyle = ""; // Variable to hold the style for the row

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
                    // Add dotted separation when current year is not the same as the last year
                    if (lastfieldKey !== value) {
                      lastfieldKey = value;
                      // Use "????" if value is undefined
                      cells.push(
                        `<td>${edges.util.escapeHtml(
                          value !== undefined ? value : "????"
                        )}</td>`
                      );
                      rowStyle =
                        "border-top: #999 dashed 1px; padding: 5px 0px 5px 10px;"; // Apply dotted separation on the top of the row
                    } else {
                      cells.push(`<td></td>`);
                    }
                  }
                }
              });
            }
            // Add row style if the condition is met
            return `<tr style="${rowStyle}">${cells.join("")}</tr>`;
          })
          .join("");
      })
      .filter((row) => row)
      .join("");

    let countFrag = "";
    if (
      this.primaryField == "ox_hasResource-manifestation" &&
      allParentObjects.length > 0
    ) {
      countFrag += `${allParentObjects.length} ${
        allParentObjects.length > 1 ? "records" : "record"
      }`;
    }

    const table = `
      <div style="margin-left:35px">
        ${countFrag}
        <table class="nested-table" style="border-collapse: collapse;">
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
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
                    `<li style="list-style: none;margin-left:20px">
                      ${value}
                    </li>`
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
                let additionalInfoVal = "";
                let secondaryField = false;

                // Hot fix for multiple fields inside work
                let valueAdded = false;
                if (
                  subField.additonalInfo &&
                  subField.additonalInfo.length > 0
                ) {
                  // Handle additionalInfo array
                  additionalInfo = subField.additonalInfo
                    .map((info) => {
                      if (valueAdded != "") return;

                      let displayValue = "";
                      if (info.mainKey in result) {
                        const mainValue = result[info.mainKey];
                        if (typeof mainValue === "boolean") {
                          displayValue = mainValue ? info.text : "";
                        } else if (mainValue) {
                          displayValue = mainValue;
                        }
                      }

                      if (!displayValue && info.secondaryKey in result) {
                        const secondaryValue = result[info.secondaryKey];
                        if (typeof secondaryValue === "boolean") {
                          displayValue = secondaryValue ? info.text : "";
                        } else if (secondaryValue) {
                          displayValue = secondaryValue;
                          secondaryField = true;
                        }
                      }

                      if (displayValue != "") {
                        valueAdded = true;
                      }

                      return edges.util.escapeHtml(displayValue || "");
                    })
                    .join("");
                }

                if (subField.additionalInfoKey) {
                  additionalInfoVal = parentObject[subField.additionalInfoKey];
                }

                if (subField.clickable) {
                  if (subField.collectionName == "dcterms_relation") {
                    if (parentObject.hasOwnProperty("dcterms_relation")) {
                      cells.push(`
                      <span>
                        <a href="${
                          parentObject.dcterms_relation
                        }" class="clickable-row">${edges.util.escapeHtml(
                        value || ""
                      )}</a>
  
                      ${
                        additionalInfoVal
                          ? `- ${edges.util.escapeHtml(additionalInfoVal)}`
                          : edges.util.escapeHtml(additionalInfo || "")
                      }
                      </span>
                    `);
                    } else {
                      cells.push(`
                        <span>${edges.util.escapeHtml(value || "")} - 
    
                        ${
                          additionalInfoVal
                            ? `- ${edges.util.escapeHtml(additionalInfoVal)}`
                            : edges.util.escapeHtml(additionalInfo || "")
                        }
                        </span>
                      `);
                    }
                  } else {
                    cells.push(`
                      <span>
                        <a href="/profile/${subField.collectionName}/${
                      parentObject["uuid"]
                    }" class="clickable-row">${edges.util.escapeHtml(
                      value || ""
                    )}</a>
  
                      ${
                        additionalInfoVal
                          ? `- ${edges.util.escapeHtml(additionalInfoVal)}`
                          : edges.util.escapeHtml(additionalInfo || "")
                      }
                      </span>
                    `);
                  }
                } else {
                  // Create non-clickable cell
                  cells.push(
                    `<div>${edges.util.escapeHtml(value || "")}</div>
                     ${
                       additionalInfo
                         ? secondaryField
                           ? `<span class="fieldlabel">Marked as: </span> <span class="as-marked">${edges.util.escapeHtml(
                               additionalInfo
                             )}</span>`
                           : `<span style="font-size: smaller">${additionalInfo}</span>`
                         : ""
                     }
                    `
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
        let parentObjects = result[parentField]; // Get all objects in the primary field array
        if (!parentObjects || parentObjects.length === 0) return ""; // Skip if no data in primary field

        // Sorting list on the basis of field name
        parentObjects = parentObjects.sort((a, b) => {
          const nameA = a["browse"] || "";
          const nameB = b["browse"] || "";
          return nameA.localeCompare(nameB);
        });

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
                  ? `- ${edges.util.escapeHtml(otherInfo)} `
                  : "";
                if (subField.linkKey) {
                  if (subField.linkKey == "uuid") {
                    const collectionName = parentObject["object_type"];

                    cells.push(`
                      <dd><p style="font-family:sans-serif;">
                        <a  href="/profile/${collectionName}/${
                      parentObject["uuid"]
                    }" class="clickable-row">${edges.util.escapeHtml(
                      value || ""
                    )}</a>
                      ${otherInfoDiv}
                      </p></dd>
                    `);
                  } else {
                    if (parentObject[subField.linkKey]) {
                      cells.push(`
                        <dd><p style="font-family:sans-serif;">
                          <a target="_blank" href="${edges.util.escapeHtml(
                            parentObject[subField.linkKey]
                          )}" class="clickable-row">${edges.util.escapeHtml(
                        value || ""
                      )}</a>
                        ${otherInfoDiv}
                        </p></dd>
                      `);
                    } else {
                      cells.push(
                        `
                        <dd><p style="font-family:sans-serif;">
                        <div>${edges.util.escapeHtml(
                          value || ""
                        )}</div> ${otherInfoDiv} </p> </dd>`
                      );
                    }
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
        <dl>
        <dt> 
          <strong> ${this.contentTitle} </strong> 
        </dt>
        ${rows}
        </dl>
      </div>
    `;
    return rows ? labelsList : ""; // Return table or no results
  }

  _renderText() {
    const value = this.component.results[0][this.field];

    if (this.field == "cito_Catalog") {
      return "";
      // return value
      //   ? `
      //   <p style="margin-top: 10px;font-style: oblique;">
      //     Collection details:
      //     <a href="http://emlo-portal.bodleian.ox.ac.uk/collections/?catalogue=${
      //       getCollectionTitle(value).href
      //     }"> ${getCollectionTitle(value).title} </a>
      //   <p>
      // `
      //   : "";
    }

    if (this.field == "geonames_alternateName") {
      return value
        ? `
        <div class="content">
          <pre>${value}</pre>
        </div>
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
          <dt>
            <strong> ${this.contentTitle} </strong>
          </dt>
          <p>
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

  _renderFooter() {
    if (this.footerType == "") {
      return;
    }

    const currentDomain = window.location.host;
    const result = this.component.results[0];
    const editIdValue = GetRecordID(this.footerType, result);
    const currentHref = window.location.href;

    const shortURL = GenerateShortURL(
      editIdValue,
      this.footerType,
      currentDomain
    );
    const url = this._generateURL(result, this.footerType, currentDomain);

    let htmlContent = `<div class="${
      this.isDivider ? "yellow-divider" : ""
    }"><br/><br/><br/><br/><div class="change">`;

    // Check for Source of Data
    if (
      result &&
      result.hasOwnProperty("ox_sourceOfData") &&
      result["ox_sourceOfData"]
    ) {
      htmlContent += `<span class="provenance">Source of data: ${result["ox_sourceOfData"]}</span><br/>`;
    }

    // Check for Changed By User
    if (
      result &&
      result.hasOwnProperty("ox_internalModifiedByUser") &&
      result["ox_internalModifiedByUser"]
    ) {
      let changeUser =
        result["ox_internalModifiedByUser"] === "Initial import"
          ? "initial import"
          : result["ox_internalModifiedByUser"];

      // Check if there's an edit ID value
      if (editIdValue) {
        htmlContent += `Record ID ${editIdValue}, last altered <!-- not changed --> by ${changeUser}`;
      } else {
        htmlContent += `Record last altered <!-- not changed --> by ${changeUser}`;
      }

      // Check for Date Changed
      if (
        result &&
        result.hasOwnProperty("ox_internalModified") &&
        result["ox_internalModified"]
      ) {
        let changeTimestamp = result["ox_internalModified"];
        let changeYear = changeTimestamp.substring(0, 4);
        let changeMonth = changeTimestamp.substring(5, 7);
        let changeDay = changeTimestamp.substring(8, 10);
        htmlContent += ` on ${changeDay}/${changeMonth}/${changeYear}.`;
      }

      htmlContent += `<br/><br/>Alternative urls for this record:<ul>`;

      if (url) {
        htmlContent += `<li class="footer-links"><a href="${url}">${url}</a></li>`;
      }

      if (shortURL) {
        htmlContent += `<li class="footer-links"><a href="${currentHref}">${shortURL}</a></li>`;
      }

      htmlContent += `</ul>`;

      // If there's an editing URL, show the link
      const key = this._getKey(this.footerType);

      if (key) {
        htmlContent += `
      <span style="font-size:smaller">
        <a href="https://emlo-edit.bodleian.ox.ac.uk/interface/union.php?${key}=${editIdValue}" target="_blank" rel="nofollow">
          Editing interface
        </a> (requires login)
      </span>`;
      }
    }

    htmlContent += `</div></div>`;

    return `${htmlContent}`;
  }

  _renderShortUrl() {
    if (this.footerType == "") {
      return "";
    }

    const currentDomain = window.location.host;
    const result = this.component.results[0];
    const editIdValue = GetRecordID(this.footerType, result);
    const currentHref = window.location.href;

    const shortURL = GenerateShortURL(
      editIdValue,
      this.footerType,
      currentDomain
    );

    const doc = document.getElementById("short-url-link");

    if (doc) {
      doc.innerHTML = `<a href=${currentHref}> ${shortURL} </a>`;
    }
  }

  _getKey(type) {
    switch (type) {
      case "p":
        return "iperson_id";
      case "l":
        return "location_id";
      case "r":
        return "institution_id";
      case "w":
        return "iwork_id";
      default:
        return "";
    }
  }

  _generateURL(result, type, currentDomain) {
    const map = {
      p: "person",
      m: "manifestation",
      w: "work",
      r: "institution",
      l: "location",
      i: "image",
      re: "resource",
      c: "comment",
    };

    if (map.hasOwnProperty(type)) {
      return `${currentDomain}/${result["uuid"]}`;
    } else {
      return "";
    }
  }
};

emlo.ProfileLeftSideRenderer = class extends edges.Renderer {
  constructor(params) {
    super(params);
    this.profileType = edges.util.getParam(params, "profileType", "");
  }

  draw() {
    let frag = "";
    const result = this.component.results[0];
    let imageSrc = "/static/img/resources-icon.png",
      theTitle = "";

    let footerType = "";

    let container = "";

    if (this.component.loading) {
      frag = "<div class='loading-message'>Loading...</div>"; // Show loading message
    } else if (this.component.errorMessage) {
      frag = `<div class='error-message'>${this.component.errorMessage}</div>`; // Show error message
    } else if (this.component.results && this.component.results.length > 0) {
      switch (this.profileType) {
        case "people":
          frag += _renderPeopleSidebar(
            result,
            this.component.gneratedData,
            this.component.relationships
          );

          const isOrg = result?.["ox_isOrganisation"] === true;
          imageSrc = isOrg
            ? "/static/img/people_icon.png"
            : "/static/img/person-icon.png";
          theTitle = isOrg ? "Organisation" : "Person";
          footerType = "p";

          break;
        case "work":
          frag += _renderWorkSidebar(
            result,
            this.component.relationships,
            this.component.gneratedData
          );
          footerType = "w";
          imageSrc = "/static/img/letter_icon.png";
          theTitle = "Letter";
          break;
        case "location":
          frag += _renderLocationSidebar(
            result,
            this.component.gneratedData,
            this.component.relationships
          );

          footerType = "l";
          imageSrc = "/static/img/places-icon.png";
          theTitle = "Location";
          break;
        case "institution":
          frag += _renderInstitutionSidebar(
            result,
            this.component.relationships
          );
          imageSrc = "/static/img/repository-icon.png";
          footerType = "r";
          theTitle = "Institution";
          break;
        case "comment":
          frag += _renderCommentProfile();
          footerType = "c";
          theTitle = "Comment";
          break;
        case "image":
          frag += _renderImageSidebar(
            result,
            this.component.relationships,
            this.component.gneratedData
          );
          footerType = "i";
          imageSrc = "/static/img/images-icon.png";
          theTitle = "Image";
          break;
        case "manifestation":
          frag += _renderManifestationSidebar(
            result,
            this.component.relationships,
            this.component.gneratedData
          );
          footerType = "m";
          imageSrc = "/static/img/resources-icon.png";
          theTitle = "Document";
          break;
        default:
          console.log("Nothing is valid");
      }

      const currentDomain = window.location.host;
      const editIdValue = GetRecordID(footerType, result);
      const currentHref = window.location.href;
      console.debug("Current URL: ", currentHref);
      const shortURL = GenerateShortURL(editIdValue, footerType, currentDomain);

      container += `
        <div style="border-bottom:1px solid #efc319; padding-bottom: 21px; padding-top:5px">
          <img src="${imageSrc}" id="profile-icon" style="float:left;height:25px;width:25px;margin-right:15px;">
            <div>
              <strong>${theTitle}</strong>
            </div>
        </div>
        <br/>

        <p style="${
          ["work"].includes(this.profileType) ? "" : "margin-bottom:20px;"
        }">
          <img src="../../static/img/icon-short-url.png" alt="short-url" />
          Short URL: <span id="short-url-link" class="showLink">
            <a href=${currentHref}> ${shortURL} </a>
          </span>
        <p>

        <p style="${
          ["work"].includes(this.profileType) ? "" : "margin-bottom:20px;"
        }">
          <img class="opacity50 icon-tweak" src="../../static/img/icon-send-comment.png" alt="short-url" />
          <a> Send Comment </a>
        </p>


        <div class="addthis_toolbox addthis_default_style " style="border-bottom:1px solid #efc319; padding-bottom: 10px; padding-top:5px">
					<span style="text-align:center;"><a class="addthis_button_preferred_1" style="border-bottom:none;"></a>
					<a class="addthis_button_preferred_2" style="border-bottom:none;"></a>
					<a class="addthis_button_preferred_3" style="border-bottom:none;"></a>
					<a class="addthis_button_preferred_4" style="border-bottom:none;"></a>
					<a class="addthis_button_compact" style="border-bottom:none;"></a>
					<a class="addthis_counter addthis_bubble_style" style="border-bottom:none;"></a></span>
				</div>

        <br/>
      `;
    }

    const containerClasses = edges.util.styleClasses(
      this.namespace,
      "container",
      this.component.id
    );

    if (frag) {
      container += `${frag}`;
    }

    this.component.context.html(container);
  }
};

emlo.ProfileRightRenderer = class extends edges.Renderer {
  constructor(params) {
    super(params);
    // this.fields = edges.util.getParam(params, "fields", []);
    // this.primaryField = edges.util.getParam(params, "primaryField", "");
    // this.sectionTitle = edges.util.getParam(params, "sectionTitle", "");
    // this.sectionTitleImage = edges.util.getParam(
    //   params,
    //   "sectionTitleImage",
    //   ""
    // );
    // this.subSections = edges.util.getParam(params, "subSections", []);
    this.profileType = edges.util.getParam(params, "profileType", "");
    // this.divider = edges.util.getParam(params, "divider", false);
    this.dividerFrag = ` <hr class="yellow-divider" />`;
  }

  draw() {
    let frag = "";
    const result = this.component.results[0];
    if (this.component.loading) {
      frag = "<div class='loading-message'>Loading...</div>"; // Show loading message
    } else if (this.component.errorMessage) {
      frag = `<div class='error-message'>${this.component.errorMessage}</div>`; // Show error message
    } else if (this.component.results && this.component.results.length > 0) {
      switch (this.profileType) {
        case "people":
          frag += _renderPeopleProfile(
            result,
            this.component.gneratedData,
            this.component.relationships
          );
          break;
        case "work":
          frag += _renderWorkProfile(
            result,
            this.component.relationships,
            this.component.gneratedData
          );
          break;
        case "location":
          frag += _renderLocationProfile(
            result,
            this.component.gneratedData,
            this.component.relationships
          );
          break;
        case "institution":
          frag += _renderInstitutionProfile(
            result,
            this.component.gneratedData
          );
          break;
        case "comment":
          frag += _renderCommentProfile();
          break;
        case "image":
          frag += _renderImageProfile(
            result,
            this.component.relationships,
            this.component.gneratedData
          );
          break;
        case "manifestation":
          frag += _renderManifestationSection(
            result,
            this.component.relationships,
            this.component.gneratedData
          );
          break;
        default:
          console.log("Nothing is valid");
      }
    }

    const containerClasses = edges.util.styleClasses(
      this.namespace,
      "container",
      this.component.id
    );

    let container = "";

    let row = ["work", "location"].includes(this.profileType)
      ? "row"
      : "row-no-margin";

    if (frag) {
      container = `
      <div id="details" class="${containerClasses} ${row}">
        ${frag}
      </div>`;
    }

    this.component.context.html(container);
    // _renderGraphSection(this.tableData);
    // this.draw();
  }
};

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
          <ul class="small-block-grid-2 medium-block-grid-6 large-block-grid-12">
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
    this.showUnkown = false;
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

      for (const doc of fieldData) {
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
      const response = await fetch("/stats-new", {
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
    this.personChart;
  }

  // You can set this graphConfig object externally
  setGraphConfig(config) {
    this.graphConfig = config;
  }

  draw() {
    const container = this.component.loading
      ? `<div class="loading-indicator">Loading, please wait...</div>`
      : `
      
        <div id="${
          this.namespace
        }-container" class="custom-bar-graph-container content" style="padding-bottom:20px">
          <div id="chart">
            ${this._renderControls()}
          </div>
          <br/>
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
    const unkownClass = edges.util.allClasses(this.namespace, "unkown", this);

    if (graphDataKeys.length <= 1)
      return `
      <div class="button-bar">
      <ul class="button-group screen">
						<li>
              <button id="fullscreen" class="${fullscreenClass} button tiny">Full Screen</button>
            </li>
					</ul>
      </div> <br/>`;

    return `
    <div class="button-bar">
					<ul class="button-group unknown">
						<li><button id="show_unknown" class="${unkownClass} button tiny">Show unknown</button></li>
					</ul>


					<ul class="button-group bars">
						<li>
              <button id="bars_seperate" class="${separateClass} button tiny">Separate Charts</button>
            </li>
						<li>
              <button id="bars_stacked" class="${stackBarClass} button tiny">Stacked Bar</button>
            </li>
						<li>
              <button id="bars_split" class="${splitBarClass} button tiny">Split Bar</button>
            </li>
					</ul>

					<ul class="button-group screen">
						<li>
              <button id="fullscreen" class="${fullscreenClass} button tiny">Full Screen</button>
            </li>
					</ul>
				</div><br/>
    `;
  }

  setYearCountsForGraphs(relevantWorksFieldname, data, counts) {
    // Check if relevantWorksFieldname exists in profile
    // if (profile.hasOwnProperty(relevantWorksFieldname)) {
    let relationshipType;

    // Determine relationship type based on the fieldname
    if (relevantWorksFieldname === "frbr_creatorOf-work") {
      relationshipType = "creator";
    } else if (relevantWorksFieldname === "mail_recipientOf-work") {
      relationshipType = "recipient";
    } else if (relevantWorksFieldname === "dcterms_isReferencedBy-work") {
      relationshipType = "mentioned";
    } else {
      // Invalid input
      return;
    }

    const yearOfWorkFieldname = "ox_started-ox_year";

    // Iterate through the data array
    data.forEach((item) => {
      const obj = item;

      let year = "?";
      if (obj.hasOwnProperty(yearOfWorkFieldname)) {
        year = obj[yearOfWorkFieldname];
      }

      // Initialize year in counts if not already present
      if (!counts.hasOwnProperty(year)) {
        counts[year] = { creator: 0, recipient: 0, mentioned: 0 };
      }

      // Increment the value for the current type of work
      counts[year][relationshipType] += 1;
    });
  }

  _toLongFormat(d, p, i, z) {
    for (i = 0, z = d.length; i < z; i++) {
      p.push({
        year: d[i][0],
        mentioned: d[i][1],
        recipient: d[i][2],
        creator: d[i][3],
      });
    }
    return p;
  }

  setFirstAndLastYearsForGraphs(counts) {
    let maxYear = 1;
    let minYear = 9999;

    // Iterate through the keys of the counts object
    for (let year in counts) {
      if (counts.hasOwnProperty(year)) {
        if (year === "?") {
          year = 9999;
        } else {
          year = parseInt(year); // Convert the year to an integer (since the keys are strings)
        }

        if (year !== "?" && year !== 9999) {
          if (year > maxYear) {
            maxYear = year;
          }
          if (year < minYear) {
            minYear = year;
          }
        }
      }
    }

    return { minYear, maxYear };
  }

  setYearsWithZeroForGraphs(minYear, maxYear, counts) {
    let year = minYear;

    while (year < maxYear) {
      if (!counts.hasOwnProperty(year)) {
        counts[year] = { creator: 0, recipient: 0, mentioned: 0 };
      }
      year++;
    }
  }

  _renderGraphs() {
    const graphContainer = document.getElementById(`${this.namespace}-chart`);
    graphContainer.innerHTML = ""; // Clear existing graphs

    const counts = {};
    for (const key in this.component.graphData) {
      this.setYearCountsForGraphs(key, this.component.graphData[key], counts);
    }

    let first_and_last = this.setFirstAndLastYearsForGraphs(counts);

    this.setYearsWithZeroForGraphs(
      first_and_last.minYear,
      first_and_last.maxYear,
      counts
    );

    // Sort the years numerically
    let sortedYears = Object.keys(counts).sort((yearA, yearB) => yearA - yearB);

    let person_data = this._toLongFormat(
      sortedYears.map(function (year) {
        return [
          year === "?" ? 9999 : parseInt(year, 10),
          counts[year].mentioned,
          counts[year].recipient,
          counts[year].creator,
        ];
      }),
      []
    );

    if (person_data.length > 0) {
      // const person_chart = new PersonChart(person_data);
      this.personChart = new PersonChart(person_data);
      // person_chart.updateCharts(500, 0);
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

    const unknownSelector = edges.util.jsClassSelector(
      this.namespace,
      "unkown",
      this
    );

    edges.on(fullscreenSelector, "click", this, "toggleFullscreen");
    edges.on(stackedBarSelector, "click", this, "stackedView");
    edges.on(separateSelector, "click", this, "separateView");
    edges.on(splitBarSelector, "click", this, "splitView");
    edges.on(unknownSelector, "click", this, "toggleUnknown");
  }

  separateView() {
    this.personChart.switchBars(3);
  }

  toggleUnknown() {
    this.personChart.unknownShow(this.showUnkown);
    this.showUnkown = !this.showUnkown;
  }

  stackedView() {
    this.personChart.switchBars(1);
  }

  splitView() {
    this.personChart.switchBars(2);
  }

  toggleFullscreen() {
    this.personChart.launchFullScreen();
  }

  _reduceData(data) {
    if (data.length <= this.maxPoints) return data;
    const step = Math.ceil(data.length / this.maxPoints);
    return data.filter((_, index) => index % step === 0);
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
    const jumpMessage =
      this.component.totalPages > 10
        ? "(The arrows will jump blocks of 10 pages.)"
        : "";
    var pageInfo = `<p>Page ${this.component.page} of ${this.component.totalPages}. ${jumpMessage}  </p>`;
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

    let firstActive = this.component.page == 1 ? "active" : "";
    let lastActive =
      this.component.totalPages == this.component.page ? "active" : "";

    // Generate first, prev, next, last buttons
    var firstBtn = `<div class="button-wrapper ${firstClass} ${firstActive}">First</div>`;
    var prevBlockBtn = `<div class="button-wrapper ${prevBlockClass}"> « </div>`;
    var nextBlockBtn = `<div class="button-wrapper ${nextBlockClass}"> » </div>`;
    var lastBtn = `<div class="button-wrapper ${lastClass} ${lastActive}">Last</div>`;

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

emlo.AlertBox = class extends edges.Component {
  constructor(params) {
    super(params);
  }
};

emlo.AlertBoxRenderer = class extends edges.Renderer {
  constructor(params) {
    super(params);
    this.namespace = "edges-alert-renderer";
    this.message = edges.util.getParam(params, "message", "");
  }

  draw() {
    let frag = `
          <div data-alert="" class="alert-box info radius">
            ${this.message}
			      <a href="#" class="close">×</a>
				  </div>
    `;

    this.component.context.html(frag);
  }
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

function GetRecordID(type, result) {
  const QUERY_MAP = {
    p: { field: "dcterms_identifier-editi_", splitValue: "editi_" }, // Person query pattern
    w: { field: "dcterms_identifier-editi_", splitValue: "editi_" }, // Work query pattern
    r: {
      field: "dcterms_identifier-edit_",
      splitValue: "edit_cofk_union_institution-",
    }, // Institution query pattern
    l: {
      field: "dcterms_identifier-edit_",
      splitValue: "edit_cofk_union_location-",
    }, // Location query pattern
    i: {
      field: "dcterms_identifier-edit_",
      splitValue: "edit_cofk_union_image-",
    }, // Image query pattern
    c: {
      field: "dcterms_identifier-edit_",
      splitValue: "edit_cofk_union_comment-",
    }, // Comment query pattern
    re: {
      field: "dcterms_identifier-edit_",
      splitValue: "edit_cofk_union_resource-",
    }, // Resource query pattern
    m: {
      field: "dcterms_identifier-edit_",
      splitValue: "edit_cofk_union_manifestation-cofk_edit_interface-iwork_id:",
    }, // Manifestation query pattern
  };

  const queryConfig = QUERY_MAP[type];
  if (queryConfig) {
    // Retrieve the value from the result object for the given field
    const fieldValue = result[queryConfig.field];
    if (fieldValue) {
      // Split the value using the delimiter (e.g., "editi_") and get the last part
      const splitValue = fieldValue.split(queryConfig.splitValue).pop();
      // Return the query by combining the split value and the id
      return `${splitValue}`;
    } else {
      throw new Error(`Field ${queryConfig.field} not found in result object`);
    }
  } else {
    throw new Error(`Unknown query type: ${type}`);
  }
}

function GenerateShortURL(id, type, currentDomain) {
  if (id) {
    return `${currentDomain}/${type}/${id}`;
  } else {
    return "";
  }
}

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

  if (field == "default_search_field") {
    delete_field = "everything";
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
  }

  if (delete_field == "") {
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
