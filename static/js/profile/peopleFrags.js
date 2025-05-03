// import { getLabel } from "../../js/helper/getFieldLabls.js";
import {
  defListItem,
  hasAnyFieldValue,
  decodeUncertaintyFlags,
  totalLinkingToListWork,
} from "../../js/helper/helper.js";

export function _renderPeopleProfile(profile, tableData) {
  let frag = "";
  console.log("tableData", tableData);
  frag += _renderDetailsSection(profile);
  frag += _renderDateSection(profile);
  frag += _renderContentStatsSection(profile);
  _renderLettersWritten(profile);
  return frag;
}

// START: Rendering section
function _renderDetailsSection(profile) {
  let detailFrag = "";
  const altLabelField = "skos_altLabel",
    titlesRoleField = "ox_titlesRolesOccupations",
    genderField = "foaf_gender";

  if (
    profile.hasOwnProperty(altLabelField) ||
    profile.hasOwnProperty(titlesRoleField)
  ) {
    detailFrag += `
      <div class="column profilepart">
	      <h3><img src="/static/img/icon-people.png" class=""/>Details</h3>
		    <div class="content">
			    <dl>
            ${defListItem(profile, altLabelField)}
            ${defListItem(profile, titlesRoleField)}
    `;

    // if (
    //   profile.hasOwnProperty("ox_isOrganisation") &&
    //   !profile["ox_isOrganisation"]
    // ) {
    //   detailFrag += `${defListItem(profile, genderField)}</dl>`;
    // } else {
    //   detailFrag += "</dl>";
    // }

    detailFrag += "</dl></div></div>";

    return detailFrag;
  } else {
    return "";
  }
}

function _renderDateSection(profile) {
  let dateSectionFrag = "";

  const keys = {
    birthYear: "bio_Birth-ox_year",
    birthMonth: "bio_Birth-ox_month",
    birthDay: "bio_Birth-ox_day",
    flagsBirth: "bioBirth-indef_",
    deathYear: "bio_Death-ox_year",
    deathMonth: "bio_Death-ox_month",
    deathDay: "bio_Death-ox_day",
    flagsDeath: "bioDeath-indef_",
  };

  if (hasAnyFieldValue(profile, keys)) {
    dateSectionFrag += `<div class="column profilepart">
	    <h3><img src="/static/img/icon-calendar.png" class=""/>Dates</h3>
		  <div class="content"><dl>${writeDate(profile, keys)}</dl></div>
		  <br>
	  </div>`;

    return dateSectionFrag;
  } else {
    return "";
  }
}

function _renderContentStatsSection(profile) {
  let sectionFrag = `
    <div class="column profilepart">
      <h3><img src="/static/img/icon-statistics.png" class=""/>Catalogue Statistics</h3>
      <div class="content">${totalLinkingToListWork(profile, "person")}`;

  // Rendering graph
  let counts = {};
  // setYearCountsForGraphs(profile, "frbr_creatorOf-work", "", counts);

  // PENDING HOLD THE DEVELOPMENT OF GRAPH -

  sectionFrag += "</div></div>";
  return sectionFrag;
}

function _renderLettersWritten(profile) {
  const field = "frbr_creatorOf-work";

  if (profile.hasOwnProperty(field)) {
    // We need to generate table data first so that we can re use its
  } else {
    return "";
  }
}

// END: Rendering section

function writeDate(profile, keys) {
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
    "",
  ];

  // Get birth details
  const year_b = profile[keys.birthYear] || "";
  const month_b =
    profile[keys.birthMonth] !== undefined ? profile[keys.birthMonth] : 13;
  const day_b = profile[keys.birthDay] || "";

  const date_b = `${day_b} ${
    months[month_b - 1]
  } ${year_b} ${decodeUncertaintyFlags(keys.flagsBirth, profile)}`.trim();

  // Get death details
  const year_d = profile[keys.deathYear] || "";
  const month_d =
    profile[keys.deathMonth] !== undefined ? profile[keys.deathMonth] : 13;
  const day_d = profile[keys.deathDay] || "";

  const date_d = `${day_d} ${
    months[month_d - 1]
  } ${year_d} ${decodeUncertaintyFlags(keys.flagsDeath, profile)}`.trim();

  // Build HTML
  let html = "";

  if (date_b.trim()) {
    if (profile["ox_isOrganisation"]) {
      html += `<dt>Date of formation</dt>\n<dd>${date_b}</dd>`;
    } else {
      html += `<dt>Date of birth</dt>\n<dd>${date_b}</dd>`;
    }
  }

  if (date_d.trim()) {
    if (profile["ox_isOrganisation"]) {
      html += `<dt>Date of disbandment</dt>\n<dd>${date_b}</dd>`;
    } else {
      html += `<dt>Date of death</dt>\n<dd>${date_d}</dd>`;
    }
  }

  return html;
}
