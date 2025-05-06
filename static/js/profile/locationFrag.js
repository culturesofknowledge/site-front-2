import {
  defListItem,
  hasAnyFieldValue,
  decodeUncertaintyFlags,
  totalLinkingToListWork,
  h4WorkList,
  h4RelationshipList,
  resourceRelation,
  relationshipList,
} from "../../js/helper/helper.js";
import { getLabel } from "../helper/getFieldLabls.js";

export function _renderLocationProfile(profile, tableData, relations) {
  let frag = "";

  frag += _renderStatsSection(profile);
  frag += _renderSynonymSection(profile);
  frag += _renderLocationSection(profile);
  frag += _renderLettersWritten(profile, tableData);
  frag += _renderLetterRec(profile, tableData);
  frag += _renderLetterMent(profile, tableData);
  frag += _renderComment(profile, relations);

  return frag;
}

export function _renderLocationSidebar(profile, tableData, relations) {
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
    "rel_wasBirthplaceOf-person",
    "rel_wasPlaceOfDeathOf-person",
    "rel_wasVisitedBy-person",
  ];

  for (let relation of relationList) {
    frag += `${relationshipList(relations, profile, relation, true)}`;
  }

  frag += "</dl>";
  return frag;
}

function _renderStatsSection(profile) {
  return `
        <div class="column profilepart">
			<h3><img src="/static/img/icon-statistics.png">Stats</h3>
			<div class="content">
                ${totalLinkingToListWork(profile, "location")}
            </div>
        </div>
    `;
}

function _renderSynonymSection(profile) {
  const field = "ox_locationAlternateName";

  if (profile.hasOwnProperty(field)) {
    let syn = profile[field];
    syn = syn.split("\n").join("; ");

    return `
    <div class="column profilepart">
      <h3>Synonyms</h3>
      <dl>
        <dd>${syn}</dd>
      </dl>
    </div>
  `;
  } else {
    return "";
  }
}

function _renderLocationSection(profile) {
  const lat = "geo_lat",
    long = "geo_long";

  if (profile.hasOwnProperty(lat) || profile.hasOwnProperty(long)) {
    let frag = `<div class="column profilepart">

				<h4><img src="/static/img/icon-globe.png">Position</h4>
				<div class="content">
					<dl>
                        ${defListItem(profile, lat)}
                        ${defListItem(profile, long)}

                    <dd>
                        <div id="location-map" data-lat="${
                          profile[lat]
                        }" data-long="${
      profile[long]
    }"  style="width:100%;height: 300px;"></div>
                    </dd>

                    <!-- PENDING-N: Parent section -->
                	</dl>
				</div>
				<br/>
			</div>
            `;

    return frag;
  } else {
    return "";
  }
}

function _renderLettersWritten(profile, tableData) {
  const field = "mail_originOf-work";

  if (tableData.hasOwnProperty(field)) {
    if (tableData[field].length > 0) {
      let frag = `<div class="column profilepart"> ${h4WorkList(
        field,
        profile,
        tableData[field],
        "mail_origin-location",
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

function _renderLetterRec(profile, tableData) {
  const field = "mail_destinationOf-work";

  if (tableData.hasOwnProperty(field)) {
    if (tableData[field].length > 0) {
      let frag = `<div class="column profilepart"> ${h4WorkList(
        field,
        profile,
        tableData[field],
        "mail_destination-location",
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

function _renderLetterMent(profile, tableData) {
  const field = "dcterms_isReferencedBy-work";

  if (tableData.hasOwnProperty(field)) {
    if (tableData[field].length > 0) {
      let frag = `<div class="column profilepart"> ${h4WorkList(
        field,
        profile,
        tableData[field],
        "dcterms_references-location",
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
