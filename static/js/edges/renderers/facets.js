import emlo from "/static/js/edges.js";

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
    this.additionalDataField = [];
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

    let uuidsToFetch = [];

    let limitedResults = "";
    ts.values.forEach((val, idx) => {
      if (val.count > 0) {
        const isHidden = idx >= this.displayLimit;
        const field = this.component.field;

        let displayVal = this._displayFacetValue(field, val.term);

        // Collect UUIDs for async update
        if (
          ["frbr_creator-person", "mail_recipient-person"].includes(field) &&
          displayVal === "Loading"
        ) {
          let UUID = val.term.startsWith('"')
            ? val.term.slice(1, -1).split("/").pop()
            : val.term.split("/").pop();
          if (UUID && !uuidsToFetch.includes(UUID)) {
            uuidsToFetch.push(UUID);
          }
        }

        limitedResults += `
      <tr style="${isHidden ? "display:none;" : ""}">
        <td>
          <a href="#" class="${valClass}" data-key="${edges.util.escapeHtml(
          val.term
        )}" data-changekey="${field}${edges.util.escapeHtml(val.term)}">
            <img class="facet" src="../../static/img/plus-facet.png" height="15px" width="15px" />
            ${displayVal}
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
        <div id="${modalId}" class="facet-modal hideEle">
            <div class="facet-modal-content">
                <div class="facet-modal-header">
                    <span>${this.title}</span>
                    <span id="${edges.util.htmlID(
                      this.namespace,
                      "facet-modal-close",
                      this.component.id
                    )}" class="facet-modal-close">&times;</span>
                </div>
                <div class="facet-modal-content-wrapper">
                    <div id="${modalContentId.slice(1)}">
                        <!-- Placeholder for fetched results -->
                    </div>
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

    this._fetchNamesNew(uuidsToFetch, "people").then((names) => {
      if (names && names.length > 0) {
        for (let name of names) {
          localStorage.setItem(name.uuid, name.browse);
          document
            .querySelectorAll(`[data-key*="${name.uuid}"]`)
            .forEach((el) => {
              // Protecting this from selected facet rendering since this is taken care there
              if (el.dataset.render && el.dataset.render == "selected") {
                return;
              }
              el.innerHTML = `
            <img class="facet" src="../../static/img/plus-facet.png" height="15px" width="15px" />
            ${edges.util.escapeHtml(name.browse)}
          `;
            });
        }
      }
    });

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
        person: "Person or organization",
      };
      return typeMap[val] || val.charAt(0).toUpperCase() + val.slice(1);
    } else if (
      ["frbr_creator-person", "mail_recipient-person"].includes(field)
    ) {
      let value = val;
      if (value && value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }

      let UUID = value.startsWith("http") ? value.split("/").pop() : "";

      if (!UUID) return "";

      const cached = localStorage.getItem(UUID);
      return cached ? cached : "Loading";
    } else {
      return val;
    }
  }

  async _fetchNamesNew(uuids, collectionName) {
    if (collectionName == "") {
      return [];
    }

    let payload = {};
    if (uuids.length > 0) {
      payload = {
        solrCore: collectionName,
        uuids: uuids,
        filter: "browse,uuid",
        objectKey: "uuid",
      };
    } else {
      return [];
    }

    try {
      const response = await fetch(`/stats-new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error(`Error fetching names: ${response.statusText}`);
        return [];
      }

      const json = await response.json();
      return json;
    } catch (err) {
      console.error("Error while fetching names", err);
      return [];
    }
  }

  async openModal() {
    const modalSelector = edges.util.idSelector(
      this.namespace,
      "facet-modal",
      this.component.id
    );
    const modalContentSelector = edges.util.htmlID(
      this.namespace,
      "facet-modal-content",
      this.component.id
    );

    console.log("modalContentSelector", modalContentSelector);
    const modalContentEl = document.getElementById(
      modalContentSelector.slice(1)
    );

    // Always show modal immediately
    this.component.jq(modalSelector).removeClass("hideEle").addClass("showEle");

    // Show loading message
    modalContentEl.innerHTML = `<p>Fetching more results, please wait...</p>`;

    try {
      let dataToRender = [];

      const q = buildSolrQuery(this.component.edge.currentQuery);

      // 2. Otherwise, fetch from Solr
      const solrUrl = `/solr/works/select?q=${q}&facet=true&facet.field=${this.component.field}&facet.limit=5000&rows=0&wt=json`;

      const response = await fetch(solrUrl);
      if (!response.ok)
        throw new Error(`Solr request failed: ${response.status}`);

      const solrData = await response.json();

      const facetArray =
        solrData.facet_counts.facet_fields[this.component.field] || [];

      // Convert alternating array into [{ term, count, display }]
      dataToRender = [];
      for (let i = 0; i < facetArray.length; i += 2) {
        const term = facetArray[i];
        const count = facetArray[i + 1];
        dataToRender.push({
          term,
          display: term, // fallback: display == term
          count,
        });
      }

      // Cache the result for next time
      this.additionalDataField = dataToRender;
      // }

      // 3. Handle empty results
      if (!dataToRender || dataToRender.length === 0) {
        modalContentEl.innerHTML = `<p>No results available.</p>`;
        return;
      }

      const valClass = edges.util.allClasses(
        this.namespace,
        "value",
        this.component.id
      );

      // 4. Build results table
      const fullResults = dataToRender
        .filter((val) => val.count > 0)
        .map(
          (val) => `
        <tr>
          <td>
            <a href="#"
               class="${valClass}"
               data-key="${edges.util.escapeHtml(val.term)}">
              <img class="facet" src="../../static/img/plus-facet.png" height="15" width="15" />
              ${this._displayFacetValue(this.component.field, val.display)}
            </a>
          </td>
          <td>${val.count}</td>
        </tr>
      `
        )
        .join("");

      if (fullResults) {
        modalContentEl.innerHTML = `<table class="facet"><tbody>${fullResults}</tbody></table>`;
      } else {
        modalContentEl.innerHTML = `<p class="info">No more results to display.</p>`;
      }

      const valueSelector = edges.util.jsClassSelector(
        this.namespace,
        "value",
        this.component.id
      );
      edges.on(valueSelector, "click", this, "termSelected");
    } catch (error) {
      console.error("Error rendering modal results:", error);
      modalContentEl.innerHTML = `<p class="error">An error occurred while fetching results. Please try again later.</p>`;
    }
  }

  closeModal() {
    const modalSelector = edges.util.idSelector(
      this.namespace,
      "facet-modal",
      this.component.id
    );
    this.component.jq(modalSelector).removeClass("showEle").addClass("hideEle");
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
