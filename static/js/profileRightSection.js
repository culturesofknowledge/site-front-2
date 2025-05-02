import emlo from "./edges";
import { getLabel } from "./helper/getFieldLabls";

if (!window.hasOwnProperty("edges")) {
  edges = {};
}

emlo.ProfileRightRenderer = class extends edges.Renderer {
  constructor(params) {
    super(params);
    this.profileType = edges.util.getParam(params, "profileType", "");
    this.dividerFrag = ` <hr class="yellow-divider" />`;
  }

  draw() {
    let frag = "";

    if (this.component.loading) {
      frag = "<div class='loading-message'>Loading...</div>"; // Show loading message
    } else if (this.component.errorMessage) {
      frag = `<div class='error-message'>${this.component.errorMessage}</div>`; // Show error message
    } else if (this.component.results && this.component.results.length > 0) {
      switch (this.profileType) {
        case "people":
          frag += this._renderPeopleProfile();
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

    if (frag) {
      container = `
        <div id="details" class="${containerClasses} ">
          ${frag}
        </div>`;
    }

    this.component.context.html(container);
  }

  _renderPeopleProfile() {
    const profile = this.component.results[0]; // assume single profile object
    let frag = "";

    // Helper to safely fetch values
    const getFieldValue = (field) => profile[field];

    // Renders a definition list item only if the field has a value
    const renderDefListItem = (field, options = {}) => {
      const value = getFieldValue(field);
      if (!value) return "";

      const label = getLabel(field); // Assuming translate is available
      const displayValue = options.capitalize
        ? value.charAt(0).toUpperCase() + value.slice(1)
        : value;

      if (options.link) {
        const fullLink = options.link + value;
        return `<dt>${label}</dt><dd><a href="${fullLink}">${displayValue}</a></dd>`;
      }

      return `<dt>${label}</dt><dd>${displayValue}</dd>`;
    };

    // First column - Details
    let details = "";
    details += renderDefListItem("skos_altLabel");
    details += renderDefListItem("ox_titlesRolesOccupations");

    if (!getFieldValue("ox_isOrganisation")) {
      details += renderDefListItem("foaf_gender", {
        capitalize: true,
      });
    }

    if (details) {
      frag += `
          <div class="column profilepart">
            <h3><img src="/static/img/icon-people.png" class=""/>Details</h3>
            <div class="content">
              <dl>${details}</dl>
            </div>
          </div>
          ${this.dividerFrag}
        `;
    }

    // Second column - Dates
    const hasDateInfo = [
      "get_birth_year_fieldname",
      "get_birth_month_fieldname",
      "get_birth_day_fieldname",
      "get_death_year_fieldname",
      "get_death_month_fieldname",
      "get_death_day_fieldname",
    ].some((field) => getFieldValue(field));

    if (hasDateInfo) {
      const dateInfo = this._renderBirthAndDeathDates(profile); // Assume this helper is implemented
      frag += `
          <div class="column profilepart">
            <h3><img src="/img/icon-calendar.png" class=""/>Dates</h3>
            <div class="content">
              <dl>${dateInfo}</dl>
            </div>
            <br>
          </div>
        `;
    }

    return frag;
  }
};
