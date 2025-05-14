import { h4WorkList, resourceRelation } from "../../js/helper/helper.js";
import { getLabel } from "../helper/getFieldLabls.js";

export function _renderInstitutionProfile(profile, tableData) {
  let frag = "";

  frag += _renderAlternateSection(profile);
  frag += _renderLocationSection(profile);
  frag += _renderCollectionOverview(profile, tableData);
  return frag;
}

export function _renderInstitutionSidebar(profile, relations) {
  let frag = "";

  if (profile.hasOwnProperty("rdfs_seeAlso-resource")) {
    let label = getLabel("rdfs_seeAlso-resource");
    frag += `
      <dl>
			  <dt>
				  ${label}
			  </dt>
			  <dd>
				  ${resourceRelation(profile, relations, "rdfs_seeAlso-resource")}
			  </dd>
	    </dl>
    `;
  }

  return frag;
}

function _renderAlternateSection(profile) {
  if (profile.hasOwnProperty("geonames_alternateName")) {
    return `
      	<div class="column profilepart">
    				<h3><img src="/static/img/icon-repository.png"/>Alternative names</h3>
				<div class="content">
					${profile["geonames_alternateName"].replaceAll("\n", "<br/>") || ""}
				</div>
			</div>
    `;
  } else {
    return "";
  }
}

function _renderLocationSection(profile) {
  const repoCityName = "geonames_locatedIn",
    repoCountryName = "geonames_inCountry";

  if (
    profile.hasOwnProperty(repoCityName) ||
    profile.hasOwnProperty(repoCountryName)
  ) {
    let html = `
      <div class="column profilepart">
				<h3><img src="/static/img/icon-globe.png">Location</h3>
				<div class="content">
    `;

    if (profile.hasOwnProperty(repoCityName)) {
      html += `City: ${profile[repoCityName]}`;

      if (profile.hasOwnProperty("ox_locatedInAlternate")) {
        html += `(${profile["ox_locatedInAlternate"]})`;
      }

      html += `<br/>`;
    }

    if (profile.hasOwnProperty(repoCountryName)) {
      html += `Country: ${profile[repoCountryName]}`;

      if (profile.hasOwnProperty("ox_inCountryAlternate")) {
        html += `(${profile["ox_inCountryAlternate"]})`;
      }
    }

    html += `</div><br/></div>`;

    return html;
  } else {
    return "";
  }
}

function _renderCollectionOverview(profile, tableData) {
  const field = "ox_hasResource-manifestation";

  if (tableData.hasOwnProperty(field)) {
    if (tableData[field].length > 0) {
      let frag = `<div class="column profilepart"> ${h4WorkList(
        field,
        profile,
        tableData[field],
        "repository",
        "icon-quill.png",
        "Collection overview"
      )}</div>`;
      return frag;
    } else {
      return "";
    }
  } else {
    return "";
  }
}
