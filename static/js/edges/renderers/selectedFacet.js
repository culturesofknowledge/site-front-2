import emlo from "/static/js/edges.js";
import { getLabel } from "/static/js/helper/getFieldLabls.js";

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

          <td class="${filterRemoveClass} selected-facets" data-key='${
        filt.term
      }' data-field='${filt.field}' data-render="selected">
              <span data-val='${filt.field}'  style="width:100px">
              ${this._getDisplayValue(filt.field, filt.display)}
              </span>
              <span style="margin-left:15px;widht:50px">
                <img class="facet" src="../../static/img/minus-facet.png" style="height:15px;" />
              </span>
            </td>
        </tr>
      `;
    });

    let frag = `<div class="${facetClass}">
                  <div class="${headerClass}">
                    <h4>${this.title}</h4>
                    <p id="remove-message"> Please wait, we are updating the results. </p>
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

    const displayFieldMapping = {
      work: "Letter",
      manifestation: "Document",
      resource: "Related resource",
      person: "Person or organization",
      location: "Location",
      image: "Image",
      institution: "Repository",
      comment: "Comment",
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
      this._fetchNamesSelected(value, collectionName).then((names) => {
        if (names) {
          // Find all matching elements dynamically and update their content
          document
            .querySelectorAll(`[data-val="${edges.util.escapeHtml(field)}"]`)
            .forEach((el) => {
              el.innerHTML = `
                ${edges.util.escapeHtml(names)}
              `;
            });
        }
      });

      return placeholder;
    } else {
      if (value && value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }

      if (field == "object_type" && displayFieldMapping.hasOwnProperty(value)) {
        return displayFieldMapping[value];
      }

      return value;
    }
  }

  async _fetchNamesSelected(value, colName) {
    let collectionName = "";
    let fl = "browse";

    if (colName) {
      collectionName = colName;
    } else {
      const urlParams = new URLSearchParams(window.location.search);
      const browsing = urlParams.get("browsing");

      collectionName =
        browsing && browsing != "organizations" ? `${browsing}` : `people`;
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
    const label = getLabel(field);

    return label == "-" ? field : label;
  }
};
