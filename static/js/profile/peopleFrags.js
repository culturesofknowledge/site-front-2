import { getLabel } from "../../js/helper/getFieldLabls.js";

export function _renderPeopleProfile(profile) {
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
        <hr class="yellow-divider" />
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
