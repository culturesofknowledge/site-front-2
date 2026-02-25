// import { getLabel } from "../../js/helper/getFieldLabls.js";
import {
  defListItem,
  hasAnyFieldValue,
  decodeUncertaintyFlags,
  totalLinkingToListWork,
  h4WorkList,
  h4RelationshipList,
  relationshipList,
  resourceRelation,
} from "../../js/helper/helper.js";
import { getLabel } from "../helper/getFieldLabls.js";
import PersonChart from "../chart.js";

let personChart;
let showUnkown = true;
let isDisplayUnkown = false;

export function _renderPeopleProfile(profile, tableData, relations) {
  // Reset chart instance on each full profile render so navigation to a new
  // person doesn't carry over the previous page's chart reference.
  personChart = null;

  let frag = "";

  frag += _renderDetailsSection(profile);
  frag += _renderDateSection(profile);
  frag += _renderContentStatsSection(profile, tableData);
  frag += _renderLettersWritten(profile, tableData);
  frag += _renderLettersRec(profile, tableData);
  frag += _renderLettersMent(profile, tableData);
  frag += _renderComment(profile, relations);

  return frag;
}

export function _renderPeopleSidebar(profile, tableData, relations) {
  let sideFrag = "";

  sideFrag += _renderSideSection(profile, relations);

  return sideFrag;
}

function _renderSideSection(profile, relations) {
  let frag = `<dl style="-margin-top:25px;">`;

  const relatedResourceField = "rdfs_seeAlso-resource";

  if (profile.hasOwnProperty(relatedResourceField)) {
    let label = getLabel(relatedResourceField);

    frag += `
        <dt>
          ${label}
        </dt>
        <dd>
          ${resourceRelation(profile, relations, relatedResourceField)}
        </dd>
      `;
  }

  const relationList = [
    "ox_wasBornIn-location",
    "ox_diedAt-location",
    "ox_wasAt-location",
    "rel_childOf-person",
    "rel_parentOf-person",
    "rel_siblingOf-person",
    "rel_spouseOf-person",
    "rel_relativeOf-person",
    "ox_unspecifiedRelationshipWith-person",
    "taught-person",
    "was_taught_by-person",
    "employed-person",
    "was_employed_by-person",
    "friend-person",
    "ox_memberOf-person",
    "foaf_member-person",
  ];

  for (let relation of relationList) {
    frag += `${relationshipList(relations, profile, relation, true)}`;
  }

  frag += defListItem(profile, "ox_furtherReading");

  frag += "</dl>";
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
    flagsBirth: "bio_Birth-indef_",
    deathYear: "bio_Death-ox_year",
    deathMonth: "bio_Death-ox_month",
    deathDay: "bio_Death-ox_day",
    flagsDeath: "bio_Death-indef_",
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

const _GRAPH_FIELDS = [
  "frbr_creatorOf-work",
  "mail_recipientOf-work",
  "dcterms_isReferencedBy-work",
];

function _renderContentStatsSection(profile, data) {
  // Only count the actual tableData fields (flat arrays), not the private __agg__
  // keys or other gneratedData properties like imageData / manifestationData.
  const graphDataKeys = _GRAPH_FIELDS.filter(
    (f) => data.hasOwnProperty(f) && Array.isArray(data[f])
  );

  // Only render graph when tableData has actually arrived.
  if (graphDataKeys.length > 0) {
    _renderGraphSection(data);
  }

  let sectionFrag = `
    <div class="column profilepart">
      <h3><img src="/static/img/icon-statistics.png" class=""/>Catalogue Statistics</h3>
      <div class="content">${totalLinkingToListWork(profile, "person")}`;

  sectionFrag += `
      <div id="chart">
        <div class="button-bar">
          <ul id="hello" class="button-group unknown" style="${
            isDisplayUnkown ? "" : "display:none"
          }">
            <li><button id="show_unknown" class="button tiny">Show unknown years</button></li>
          </ul>

          <ul class="button-group bars" style="${
            graphDataKeys.length > 1 ? "" : "display:none"
          }">
            <li><button id="bars_seperate" class="highlight button tiny">Separate charts</button></li>
            <li><button id="bars_stacked" class="button tiny">Stack bars</button></li>
            <li><button id="bars_split" class="button tiny">Split bars</button></li>
          </ul>

          <ul class="button-group screen">
            <li><button id="fullscreen" class="button tiny">Full screen</button></li>
          </ul>
        </div>
      </div>
      <br/>
    `;

  sectionFrag += "</div></div>";

  return sectionFrag;
}

function _renderLettersWritten(profile, tableData) {
  const field = "frbr_creatorOf-work";

  if (tableData.hasOwnProperty(field)) {
    if (tableData[field].length > 0) {
      let frag = `<div class="column profilepart"> ${h4WorkList(
        field,
        profile,
        tableData[field],
        "frbr_creator-person",
        "icon-quill.png"
      )}</div>`;
      return frag;
    } else {
      return "";
    }
  } else {
    return "";
  }
}

function _renderLettersRec(profile, tableData) {
  const field = "mail_recipientOf-work";

  if (tableData.hasOwnProperty(field)) {
    if (tableData[field].length > 0) {
      let frag = `<div class="column profilepart"> ${h4WorkList(
        field,
        profile,
        tableData[field],
        "mail_recipient-person",
        "icon-quill.png"
      )}</div>`;
      return frag;
    } else {
      return "";
    }
  } else {
    return "";
  }
}

function _renderLettersMent(profile, tableData) {
  const field = "dcterms_isReferencedBy-work";

  if (tableData.hasOwnProperty(field)) {
    if (tableData[field].length > 0) {
      let frag = `<div class="column profilepart"> ${h4WorkList(
        field,
        profile,
        tableData[field],
        "dcterms_references-person",
        "icon-quill.png"
      )}</div>`;
      return frag;
    } else {
      return "";
    }
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

function _renderComment(profile, relations) {
  const field = "ox_isAnnotatedBy-comment";

  if (profile.hasOwnProperty(field)) {
    let frag = `<div class="column profilepart">
      ${h4RelationshipList(profile, relations, field, null, "simple")}</div>`;

    return frag;
  } else {
    return "";
  }
}

export function _renderGraphSection(graphData) {
  const counts = {};
  for (const key in graphData) {
    setYearCountsForGraphs(key, graphData[key], counts);
  }

  // Nothing to draw — skip to avoid creating an empty chart
  if (Object.keys(counts).length === 0) return;

  let first_and_last = setFirstAndLastYearsForGraphs(counts);

  setYearsWithZeroForGraphs(
    first_and_last.minYear,
    first_and_last.maxYear,
    counts
  );

  let sortedYears = Object.keys(counts).sort((yearA, yearB) => yearA - yearB);

  let person_data = _toLongFormat(
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
    // setTimeout fires exactly once per call — no repeat risk unlike setInterval.
    // personChart guard prevents duplicates if draw() somehow fires twice after
    // tableData arrives (e.g. relations and tableData resolve at the same ms).
    setTimeout(() => {
      const chartEl = document.getElementById("chart");
      if (!chartEl) return;
      if (personChart) return;   // already created for this page load
      personChart = new PersonChart(person_data);
      _attachEventListeners();
    }, 50);
  }
}

function setYearCountsForGraphs(relevantWorksFieldname, data, counts) {
  let relationshipType;

  if (relevantWorksFieldname === "frbr_creatorOf-work") {
    relationshipType = "creator";
  } else if (relevantWorksFieldname === "mail_recipientOf-work") {
    relationshipType = "recipient";
  } else if (relevantWorksFieldname === "dcterms_isReferencedBy-work") {
    relationshipType = "mentioned";
  } else {
    return;
  }

  // data is a plain flat array of work docs, each with ox_started-ox_year.
  const docs = Array.isArray(data) ? data : [];
  docs.forEach((item) => {
    const year = item.hasOwnProperty("ox_started-ox_year")
      ? item["ox_started-ox_year"]
      : "?";
    if (!counts.hasOwnProperty(year)) {
      counts[year] = { creator: 0, recipient: 0, mentioned: 0 };
    }
    counts[year][relationshipType] += 1;
  });
}

function _toLongFormat(d, p, i, z) {
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

function setFirstAndLastYearsForGraphs(counts) {
  let maxYear = 1;
  let minYear = 9999;

  // Iterate through the keys of the counts object
  for (let year in counts) {
    if (counts.hasOwnProperty(year)) {
      if (year === "?") {
        isDisplayUnkown = true;
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

function setYearsWithZeroForGraphs(minYear, maxYear, counts) {
  let year = minYear;

  while (year < maxYear) {
    if (!counts.hasOwnProperty(year)) {
      counts[year] = { creator: 0, recipient: 0, mentioned: 0 };
    }
    year++;
  }
}

// Event delegation for chart buttons.
// draw() replaces innerHTML on every paint, destroying any directly-attached listeners.
// By listening on document once (guarded by _chartListenersAttached), clicks on
// chart buttons always reach the current personChart regardless of DOM replacement.
let _chartListenersAttached = false;

function _attachEventListeners() {
  if (_chartListenersAttached) return;
  _chartListenersAttached = true;

  document.addEventListener("click", function (e) {
    const id = e.target && e.target.id;
    if (!id) return;

    if (id === "show_unknown") {
      if (personChart) {
        personChart.unknownShow(showUnkown);
        showUnkown = !showUnkown;
      }
    } else if (id === "bars_split") {
      if (personChart) personChart.switchBars(2);
    } else if (id === "bars_seperate") {
      if (personChart) personChart.switchBars(3);
    } else if (id === "bars_stacked") {
      if (personChart) personChart.switchBars(1);
    } else if (id === "fullscreen") {
      if (personChart) personChart.launchFullScreen();
    }
  });
}