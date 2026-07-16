import {
  simpleRelations,
  uuidFromUri,
  decodeUncertaintyFlags,
  relationshipList,
  hasAnyFieldValue,
  getAnchorName,
  renderH4Section,
  h4RelationshipList,
  resourceRelation,
  displayImage,
  detailsOfOneObject,
} from "../../js/helper/helper.js";
import { getLabel } from "../helper/getFieldLabls.js";
import { getCollectionTitle } from "../../js/profile/collectionDetails.js";

export function _renderWorkProfile(profile, relations, data) {
  let frag = "";

  frag += renderDates(profile, relations);
  frag += _renderPeopleSection(profile, relations);
  frag += _renderPlacesSection(profile, relations);
  frag += _renderContentSection(profile, relations);
  frag += _renderRepoAndVersionSection(profile, relations, data);
  frag += _renderRelatedResource(profile, relations);
  frag += _renderComment(profile, relations);

  return frag;
}

export function _renderWorkSidebar(profile, relations, data) {
  let sideFrag = "";

  sideFrag += _renderSideSection(profile, relations);
  sideFrag += _renderImageSidebar(profile, relations, data);
  sideFrag += _renderAlternateSidebar(profile, relations, data);

  return sideFrag;
}

function renderDates(profile, relations) {
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

  const day = profile["ox_started-ox_day"] || "";
  const month = profile["ox_started-ox_month"] || 13;
  const year = profile["ox_started-ox_year"] || "";
  const date = `${day} ${months[month - 1]} ${year}`.trim();
  const dateNoSpaces = date.replace(/\s/g, "");

  const dayTo = profile["ox_completed-ox_day"] || "";
  const monthTo = profile["ox_completed-ox_month"] || 13;
  const yearTo = profile["ox_completed-ox_year"] || "";
  const dateTo = `${dayTo} ${months[monthTo - 1]} ${yearTo}`.trim();
  const dateToNoSpaces = dateTo.replace(/\s/g, "");

  let isRange = false;

  if (profile.hasOwnProperty("ox_dateIsRange")) {
    isRange = profile["ox_dateIsRange"];
  }

  const originalCalendar = profile["ox_originalCalendar"] || "";
  const markedAs = profile["ox_dateMarked"] || "";
  const flagsDecoded = decodeUncertaintyFlags("ox_started-indef_", profile); // Assume defined
  const hasComment = !!profile["ox_dateAnnotate-comment"];

  // Only render if any relevant field has a value
  const hasAnyDateData =
    dateNoSpaces ||
    dateToNoSpaces ||
    originalCalendar ||
    markedAs ||
    flagsDecoded ||
    hasComment;

  if (!hasAnyDateData) {
    return "";
  }

  // Start building the HTML
  let html = `
      <div class="column workfieldset profilepart">
        <h3 class="worklegend">
          <img src="/static/img/icon-calendar.png" class="workicon" />Dates
        </h3>
        <div class="workspacing content">
    `;

  // Date display
  if (!isRange) {
    html += `<p>${date || "Unknown date"}</p>`;
  } else if (dateNoSpaces && dateToNoSpaces) {
    html += `<p>Between ${date} and ${dateTo}</p>`;
  } else if (dateNoSpaces) {
    html += `<p>On or after ${date}</p>`;
  } else {
    html += `<p>On or before ${dateTo}</p>`;
  }

  // Calendar
  if (originalCalendar) {
    html += `<p><span class="fieldlabel">Calendar:</span> ${originalCalendar}.</p>`;
  }

  // Marked As
  if (markedAs) {
    html += `<p><span class="fieldlabel">Marked as:</span> <span class="as-marked">${markedAs}</span></p>`;
  }

  // Flags
  if (flagsDecoded) {
    html += `<p><span class="flags">Date is ${flagsDecoded}</span></p>`;
  }

  // Comments
  if (hasComment) {
    html += `
        <div class="comment">
          <p><span class="fieldlabel">Comments about the date:</span></p>
          ${simpleRelations(
            "ox_dateAnnotate-comment",
            "list-style: none;",
            profile,
            relations
          )}
        </div>
      `;
  }

  html += `</div></div>`;
  return html;
}

function _renderPeopleSection(profile, relations) {
  const authorUriField = "frbr_creator-person";
  const addresseeUriField = "mail_recipient-person";
  const peopleMentionedField = "dcterms_references-person";
  const intendedUriField = "mail_intended-person";

  if (
    profile[authorUriField] ||
    profile[addresseeUriField] ||
    profile[peopleMentionedField] ||
    profile[intendedUriField]
  ) {
    let frag = `
        <div class="column workfieldset profilepart">
          <h3 class="worklegend">
            <img src="/static/img/icon-people.png" class="workicon"/>People
          </h3>
          <div class="workspacing content">
      `;

    // === Authors ===
    if (profile[authorUriField]) {
      const authorLabel =
        profile[authorUriField]?.length > 1 ? "Authors" : "Author";
      const certainLabel =
        profile[authorUriField]?.length > 1 ? "Authors are" : "Author is";
      frag += `<h4>${authorLabel}</h4>
          <div class="people authors">
            ${relationshipList(relations, profile, authorUriField)}
        `;

      const authorMarked = "mail_authors-rdf_value";

      if (profile[authorMarked]) {
        frag += `<p><span class="fieldlabel">Marked as:</span> <span class="as-marked">${profile[authorMarked]}</span></p>`;
      }

      const flagsDecoded = decodeUncertaintyFlags(
        "mail_authors-indef_",
        profile
      );
      if (flagsDecoded) {
        frag += `<p><span class="flags">${certainLabel} ${flagsDecoded}</span></p>`;
      }

      const authorCommentField = "ox_authorAnnotate-comment";

      if (profile[authorCommentField]) {
        frag += `
            <div class="comment">
              <p><span class="fieldlabel">Comments about the authors:</span></p>
              ${simpleRelations(
                authorCommentField,
                "list-style: none;",
                profile,
                relations
              )}
            </div>
          `;
      }

      frag += `</div>`;
    }

    // === Addressees ===
    if (profile[addresseeUriField]) {
      const recipientLabel =
        profile[addresseeUriField]?.length > 1 ? "Recipients" : "Recipient";
      const certainLabel =
        profile[addresseeUriField]?.length > 1 ? "Recipients are" : "Recipient is";
      frag += `<h4>${recipientLabel}</h4>
          <div class="people recipients">
            ${relationshipList(relations, profile, addresseeUriField)}
        `;

      const addresseeMarked = "mail_addressees-rdf_value";
      if (profile[addresseeMarked]) {
        frag += `<p><span class="fieldlabel">Marked as:</span> <span class="as-marked">${profile[addresseeMarked]}</span></p>`;
      }

      const flagsDecoded = decodeUncertaintyFlags(
        "mail_addressees-indef_",
        profile
      );
      if (flagsDecoded) {
        frag += `<p><span class="flags">${certainLabel} ${flagsDecoded}</span></p>`;
      }

      const commentField = "ox_addresseeAnnotate-comment";

      if (profile[commentField]) {
        frag += `
            <div class="comment">
              <p><span class="fieldlabel">Comments about the recipients:</span></p>
              ${simpleRelations(
                commentField,
                "list-style: none;",
                profile,
                relations
              )}
            </div>
          `;
      }

      frag += `</div>`;
    }

    // === Intended for ===
    if (profile[intendedUriField]) {
      frag += `<h4>Intended for</h4>
          <div class="people recipients">
            ${relationshipList(relations, profile, intendedUriField)}
          </div>`;
    }

    // === People Mentioned ===
    if (profile[peopleMentionedField]) {
      frag += `<h4>Mentions</h4>
          <div class="people mentions">
            ${relationshipList(relations, profile, peopleMentionedField)}
        `;

      const commentsField = "ox_agentsReferencedAnnotatedBy-comment";

      if (profile[commentsField]) {
        frag += `
            <div class="comment">
              <p><span class="fieldlabel">Comments about mentioned:</span></p>
              ${simpleRelations(
                commentsField,
                "list-style: none;",
                profile,
                relations
              )}
            </div>
          `;
      }

      frag += `</div>`;
    }

    frag += `</div></div>`;
    return frag;
  }

  return "";
}

function _renderPlacesSection(profile, relations) {
  const originField = "mail_origin-location",
    originMarked = "mail_origin-rdf_value",
    destinationField = "mail_destination-location",
    destinationMarked = "mail_destination-rdf_value",
    mentionedField = "dcterms_references-location";

  if (
    profile.hasOwnProperty(originField) ||
    profile.hasOwnProperty(destinationField) ||
    profile.hasOwnProperty(mentionedField)
  ) {
    let placesFrag = `<div class="column workfieldset profilepart">
    <h3 class="worklegend"><img src="/static/img/icon-globe.png" class="workicon"/>Places</h3>
    <div class="workspacing content">`;

    // START: origin code
    if (profile.hasOwnProperty(originField)) {
      placesFrag += `<h4>Origin</h4>
        <div class="locations origin">  
            ${relationshipList(relations, profile, originField)}
        `;

      if (profile[originMarked]) {
        placesFrag += `<p><span class="fieldlabel">Marked as:</span> <span class="as-marked">${profile[originMarked]}</span></p>`;
      }

      const originFlagDecoded = decodeUncertaintyFlags(
        "mail_origin-indef_",
        profile
      );

      if (originFlagDecoded) {
        placesFrag += `<p><span class="flags">Origin is ${originFlagDecoded}</span></p>`;
      }

      const commentField = "ox_originAnnotate-comment";
      if (profile[commentField]) {
        placesFrag += `
            <div class="comment">
              <p><span class="fieldlabel">Comments about the origin:</span></p>
              ${simpleRelations(
                commentField,
                "list-style: none;",
                profile,
                relations
              )}
            </div>
          `;
      }

      placesFrag += `</div>`;
    }
    // END: Origin code

    // START: Destination code
    if (profile.hasOwnProperty(destinationField)) {
      placesFrag += `<h4>Destination</h4>
          <div class="locations destination">  
              ${relationshipList(relations, profile, destinationField)}
          `;

      if (profile[destinationMarked]) {
        placesFrag += `<p><span class="fieldlabel">Marked as:</span> <span class="as-marked">${profile[destinationMarked]}</span></p>`;
      }

      const destinationFlagDecoded = decodeUncertaintyFlags(
        "mail_destination-indef_",
        profile
      );

      if (destinationFlagDecoded) {
        placesFrag += `<p><span class="flags">Destination is ${destinationFlagDecoded}</span></p>`;
      }

      const desCommentField = "ox_destinationAnnotate-comment";

      if (profile[desCommentField]) {
        placesFrag += `
              <div class="comment">
                <p><span class="fieldlabel">Comments about the destination:</span></p>
                ${simpleRelations(
                  desCommentField,
                  "list-style: none;",
                  profile,
                  relations
                )}
              </div>
            `;
      }

      placesFrag += `</div>`;
    }
    // END: Destination code

    // START: Mentioned code
    if (profile.hasOwnProperty(mentionedField)) {
      placesFrag += `<h4>Mentions</h4>
            <div class="locations mentions">  
                ${h4RelationshipList(profile, relations, mentionedField, "")}
            `;

      placesFrag += `</div>`;
    }
    // END: Mentioned code

    // START: route code
    if (profile.hasOwnProperty("ox_routeAnnotate-comment")) {
      placesFrag += `<h4>Route</h4>
              <div class="locations route">  
                  ${simpleRelations(
                    "ox_routeAnnotate-comment",
                    "list-style: none;",
                    profile,
                    relations
                  )}
              `;

      placesFrag += `</div>`;
    }
    // END: route code
    placesFrag += `</div></div>`;
    return placesFrag;
  } else {
    return "";
  }
}

function _renderContentSection(profile, relations) {
  const keys = {
    abstractField: "dcterms_abstract",
    keyWordField: "ox_keywords",
    langField: "dcterms_language",
    incipitField: "ox_incipit",
    excipitField: "ox_excipit",
    postScriptField: "mail_postScript",
    replyToField: "mail_replyTo-work",
    hasReplyField: "mail_hasReply-work",
    refField: "dcterms_references-work",
    refByField: "dcterms_isReferencedBy-work",
  };

  if (hasAnyFieldValue(profile, keys)) {
    let contentFrag = `<div class="column workfieldset profilepart">
    <h3 class="worklegend"><img src="/static/img/icon-quill.png" class="workicon"/>Content</h3>
    <div class="workspacing content">`;

    // Abstract
    const abstractAnchorName = getAnchorName("abstract");
    contentFrag += `
    <div id="${abstractAnchorName}" name="${abstractAnchorName}">
	    ${renderH4Section(profile, keys.abstractField)}
	</div>`;

    for (let key in keys) {
      if (key !== "abstractField") {
        if (
          ["replyToField", "hasReplyField", "refField", "refByField"].includes(
            key
          )
        ) {
          contentFrag += ` ${h4RelationshipList(
            profile,
            relations,
            keys[key]
          )}`;
        } else {
          contentFrag += ` ${renderH4Section(profile, keys[key])}`;
        }
      }
    }

    contentFrag += `</div></div>`;

    return contentFrag;
  } else {
    return "";
  }
}

function _renderRepoAndVersionSection(profile, relations, data) {
  if (profile.hasOwnProperty("frbr_Manifestation-manifestation")) {
    let frag = `<div class="column workfieldset profilepart">
              <h3 class="worklegend">
                <img src="/static/img/icon-repository.png" class="workicon"/>
                Repositories and Versions
              </h3>
              
              <div class="workspacing content">
                <h4>Versions (originals, copies, digital, etc.)</h4>
              `;

    for (let manUri of profile["frbr_Manifestation-manifestation"]) {
      const manUUID = uuidFromUri(manUri, true);

      if (relations && relations.length > 0) {
        for (let relation of relations) {
          if (
            relation["object_type"] == "manifestation" &&
            relation.id == manUUID
          ) {
            frag += detailsOfOneObject(profile, relation, data, false);
          }
        }
      }
    }

    frag += `</div></div>`;

    return frag;
  } else {
    return "";
  }
}

function _renderRelatedResource(profile, relations) {
  if (profile.hasOwnProperty("rdfs_seeAlso-resource")) {
    let frag = `
        <div class="column workfieldset  profilepart">
	        <h3 class="worklegend"><img src="/static/img/icon-related-resources.png" class="workicon"/>Related Resources</h3>
            <div class="workspacing  content"> 
                ${h4RelationshipList(
                  profile,
                  relations,
                  "rdfs_seeAlso-resource",
                  "",
                  "resource"
                )}
            </div>
        </div>`;

    return frag;
  } else {
    return "";
  }
}

function _renderSideSection(profile, relations) {
  let frag = `<dl style="-margin-top:25px;">`;
  const relatedResourceField = "rdfs_seeAlso-resource",
    sourceDataField = "ox_sourceOfData",
    catalogueField = "cito_Catalog";

  // Rendering side section
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

  if (profile.hasOwnProperty(sourceDataField)) {
    frag += `
      <dt>Source of record</dt>
      <dd> ${profile[sourceDataField]} </dd>
    `;
  }

  // This is hidden as per request by EMLO team
  // if (profile.hasOwnProperty(catalogueField)) {
  //   const catLabel = getLabel(catalogueField);
  //   const catVal = profile[catalogueField];

  //   frag += `
  //     <p style="margin-top: 10px;font-style: oblique;">
  //          Collection details:
  //         <a href="http://emlo-portal.bodleian.ox.ac.uk/collections/?catalogue=${
  //           getCollectionTitle(catVal).href
  //         }"> ${getCollectionTitle(catVal).title} </a>
  //       <p>
  //   `;
  // }

  frag += `</dl>`;
  return frag;
}

function _renderComment(profile, relations) {
  const field = "ox_isAnnotatedBy-comment";

  if (profile.hasOwnProperty(field)) {
    let frag = `<div class="column workfieldset  profilepart">
		  <h3 class="worklegend">
			  <img src="/static/img/icon-comment.png" class="workicon"/>
			  Comments
		  </h3>  <div class="workspacing  content"> ${h4RelationshipList(
        profile,
        relations,
        field,
        "General",
        "simple"
      )}</div>
    </div>`;

    return frag;
  } else {
    return "";
  }
}

function _renderImageSidebar(profile, relations, data) {
  if (
    profile.hasOwnProperty("manifestations") &&
    data.hasOwnProperty("imageData")
  ) {
    let frag = "";
    const imageData = data["imageData"];

    for (let maniuri of profile["manifestations"]) {
      const uuid = maniuri.split("/").pop();
      const maniObj = relations.find((obj) => obj.uuid === uuid);

      if (imageData.hasOwnProperty(uuid)) {
        frag += displayImage(profile, imageData[uuid], maniObj);
      }
    }

    return frag;
  } else {
    return "";
  }
}

function _renderAlternateSidebar(profile, relations, data) {
  if (profile.hasOwnProperty("owl_sameAs-work")) {
    let frag = `
      <div class="" style="border-top: 1px solid #efc319;">
        <h3 class="worklegend">Alternative records</h3>
        <div class="">
          ${relationshipList(relations, profile, "owl_sameAs-work")}
        </div>
      </div>
    `;

    return frag;
  } else {
    return "";
  }
}
