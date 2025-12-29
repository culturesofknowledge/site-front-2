import {
  PROFILE_DESCRIPTOR,
  loadFragment,
} from "./profile/profileFragLoader.js";

const _relationsPromiseMap = new Map();

let emlo = {
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
              <button class="small button modifysearchbtn">Modify your search</button>
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
      frag = "Loading...";
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
                filter:
                  "ox_started-ox_year,started_date_sort,dcterms_description,id,uuid",
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
      console.error("got error", error);
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
    console.log("New code");
    // reuse in-flight or resolved promise
    if (_relationsPromiseMap.has(uuid)) {
      return _relationsPromiseMap.get(uuid);
    }

    const promise = (async () => {
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
        return json.response.docs; // ✅ SAME AS ORIGINAL
      } catch (err) {
        console.error("Error while fetching relations", err);
        return [];
      }
    })();

    _relationsPromiseMap.set(uuid, promise);

    // if this call failed, allow retry next time
    promise.catch(() => {
      _relationsPromiseMap.delete(uuid);
    });

    return promise;
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
          ? `<a href="/profile/repository/${institutionId}">${institutionData.geonames_officialName}</a><br>`
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

    const currentDomain = window.location.origin;
    const result = this.component.results[0];
    const editIdValue = GetRecordID(this.footerType, result);
    const protocol = window.location.href;

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
        htmlContent += `<li class="footer-links"><a href="${url}" onclick="redirectShortURL(event)">${url}</a></li>`;
      }

      if (shortURL) {
        htmlContent += `<li class="footer-links"><a href="${shortURL}" onclick="redirectShortURL(event)">${shortURL}</a></li>`;
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

    const currentDomain = window.location.origin;
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

  async draw() {
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
      if (this.profileType != "") {
        const sidebarFn = await loadFragment(this.profileType, "sidebar");
        const desc = PROFILE_DESCRIPTOR[this.profileType];

        console.log("desc", desc, PROFILE_DESCRIPTOR, this.profileType);

        if (this.profileType == "people") {
          const isOrg = result?.["ox_isOrganisation"] === true;
          imageSrc = isOrg
            ? "/static/img/people_icon.png"
            : "/static/img/person-icon.png";
          theTitle = isOrg ? "Organization" : "Person";
          footerType = "p";
        } else {
          // Metadata
          footerType = desc.footerType;
          imageSrc = desc.icon;
          theTitle = desc.title;
        }

        frag += sidebarFn(
          result,
          this.component.gneratedData,
          this.component.relationships
        );
      }

      const currentDomain = window.location.origin;
      const editIdValue = GetRecordID(footerType, result);
      const currentHref = window.location.href;

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
          ["work"].includes(this.profileType)
            ? "overflow-wrap: anywhere;"
            : "overflow-wrap: anywhere;margin-bottom:20px;"
        }">
          <img src="../../static/img/icon-short-url.png" alt="short-url" />
          Short URL: <span id="short-url-link" class="showLink">
            <a href=${shortURL} onclick="redirectShortURL(event)"> ${shortURL} </a>
          </span>
        <p>

        <p style="${
          ["work"].includes(this.profileType) ? "" : "margin-bottom:20px;"
        }">
          <img class="opacity50 icon-tweak" src="../../static/img/icon-send-comment.png" alt="short-url" />
          <a href=/comment/index?id=${result.uuid}> Send Comment </a>           
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

  async draw() {
    let frag = "";
    const result = this.component.results[0];
    if (this.component.loading) {
      frag = "<div class='loading-message'>Loading...</div>"; // Show loading message
    } else if (this.component.errorMessage) {
      frag = `<div class='error-message'>${this.component.errorMessage}</div>`; // Show error message
    } else if (this.component.results && this.component.results.length > 0) {
      const renderFn = await loadFragment(this.profileType, "profile");

      if (this.profileType != "") {
        frag += renderFn(
          result,
          this.component.gneratedData,
          this.component.relationships
        );
      }

      // switch (this.profileType) {
      //   case "people":
      //     frag += _renderPeopleProfile();
      //     break;
      //   case "work":
      //     frag += _renderWorkProfile(
      //       result,
      //       this.component.relationships,
      //       this.component.gneratedData
      //     );
      //     break;
      //   case "location":
      //     frag += _renderLocationProfile(
      //       result,
      //       this.component.gneratedData,
      //       this.component.relationships
      //     );
      //     break;
      //   case "institution":
      //     frag += _renderInstitutionProfile(
      //       result,
      //       this.component.gneratedData
      //     );
      //     break;
      //   case "comment":
      //     frag += _renderCommentProfile();
      //     break;
      //   case "image":
      //     frag += _renderImageProfile(
      //       result,
      //       this.component.relationships,
      //       this.component.gneratedData
      //     );
      //     break;
      //   case "manifestation":
      //     frag += _renderManifestationSection(
      //       result,
      //       this.component.relationships,
      //       this.component.gneratedData
      //     );
      //     break;
      //   default:
      //     console.log("Nothing is valid");
      // }
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

      if (start && start != from) {
        this.from = start + 1;
      } else {
        this.from = parseInt(this.edge.currentQuery.getFrom()) + 1;
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
    _addUrlParam("start", from - 1);
  }

  incrementPage() {
    const from = Math.min(
      this.from + 10 * this.pageSize,
      (this.totalPages - 1) * this.pageSize + 1
    );
    this.setFrom(from);
    _addUrlParam("start", from - 1);
  }

  goToPage(params) {
    const page = params.page;
    const nf = (page - 1) * this.pageSize + 1;
    this.setFrom(nf);
    _addUrlParam("start", nf - 1);
  }

  goToFirst() {
    this.setFrom(1);
    _addUrlParam("start", 0);
  }

  goToLast() {
    const from = (this.totalPages - 1) * this.pageSize + 1;
    this.setFrom(from);
    _addUrlParam("start", from - 1);
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

  if (
    ["frbr_creator-person", "mail_recipient-person"].includes(field) &&
    term.startsWith("http")
  ) {
    let UUID = term.startsWith('"')
      ? term.slice(1, -1).split("/").pop()
      : term.split("/").pop();

    term = UUID;
  }

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

export function _removeUrlParam(field) {
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

  if (field == "Contents") {
    delete_field = "let_con";
  }

  if (field == "Locations") {
    delete_field = "locations";
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
