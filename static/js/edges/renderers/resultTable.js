import emlo from "/static/js/edges.js";

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

      const urlParams = new URLSearchParams(window.location.search);
      const shouldCall = urlParams.has("let_con"); // replace with actual param name

      if (!shouldCall) {
        this.tableDisplay = this.tableDisplay.filter(
          (item) => item.field !== "let_con"
        );
      }

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

    // Retrieve existing query parameters from the current URL
    const urlParams = new URLSearchParams(window.location.search);

    // Initialize a query string for new or updated parameters
    let queryParams = new URLSearchParams(urlParams);

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
          val = field.valueFunction(
            val,
            res,
            field.field,
            this,
            continuousIndex
          );

          if (field.header == "Repositories & Versions") {
            return `<td id=repo-${continuousIndex}> </td>`;
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
                if (subPagen == "institution") {
                  return `<td><a href="${prefix}/repository/${href}">${linkText}</a></td>`;
                }
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
