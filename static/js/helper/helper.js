import { getLabel } from "../../js/helper/getFieldLabls.js";
import { getAddtionalFields, getFieldsToDisplayInProfile } from "./fields.js";

export const displayfields = {
  work: { display: "Description", value: "dcterms_description" },
  manifestation: { display: "Type", value: "dcterms_type" },
  person: { display: "Name", value: "foaf_name" },
  location: { display: "Name", value: "geonames_name" },
  institution: { display: "Name", value: "geonames_officialName" },
  resource: { display: "Name", value: "ox_titleOfResource" },
  comment: { display: "Comment", value: "bibo_Note" },
  image: { display: "Image", value: "dcterms_source" },
};

export function simpleRelations(
  field,
  style = "",
  profile = {},
  relations,
  helper
) {
  if (!(field in profile)) {
    return "";
  }

  const items = profile[field];
  if (!Array.isArray(items) || items.length === 0) {
    return "";
  }

  let html = "<ul>";
  for (const relation of profile[field]) {
    const uuid = uuidFromUri(relation, true);

    for (let rel of relations) {
      if (rel.id == uuid) {
        const obj = rel;
        const objectType = obj["object_type"];
        const mainField = displayfields[objectType].value;
        const value = obj[mainField] || "";

        html += `<li style="${style}"><pre>${value}</pre></li>`;
      }
    }
  }
  html += "</ul>";

  return html;
}

export function uuidFromUri(uri, full) {
  if (full) {
    return "uuid_" + uri.split("/").pop();
  } else {
    return uri.split("/").pop();
  }
}

export function h4RelationshipList(
  profile,
  relations,
  field,
  title = null,
  type = "",
  icon = null
) {
  if (profile.hasOwnProperty(field)) {
    let exist = false;
    const typeList = ["image", "detailed", "simple", "resource"];

    for (let relation of profile[field]) {
      let relKey = uuidFromUri(relation, true);
      for (const relation of relations) {
        if (relation.id === relKey) {
          exist = true;
          break;
        }
      }
    }

    if (!exist) {
      return "";
    }

    if (title == null) {
      title = getLabel(field);
    }

    let frag = `<div class="profilepart">`;

    if (icon) {
      frag += `<h3><img src="${icon}">${title}</h3>`;
    } else {
      frag += `<h3>${title}</h3>`;
    }

    frag += `<div class="content">`;

    if (type != "" && typeList.includes(type)) {
      switch (type) {
        case "image":
          getImageRelation(field, profile, relations);
          break;
        case "detailed":
          getDetailedRelation(field);
          break;
        case "simple":
          frag += `${simpleRelations(field, "", profile, relations)}`;
          break;
        case "resource":
          frag += `${resourceRelation(profile, relations, field)}`;
          break;
      }
    } else {
      frag += `${relationshipList(relations, profile, field)}`;
    }

    frag += `</div></div>`;

    return frag;
  } else {
    return "";
  }
}

export function getImageRelation(field, profile, relations) {
  const imageField = "dcterms_source";
  let frag = ` <div class="thumbnail specialthumb">`;

  for (let imageUri of profile[field]) {
    const uuid = uuidFromUri(imageUri);
    const url = profileFromUri(imageUri);
    let image = null;

    for (let relationItem of relations) {
      if (
        relationItem["uuid"] === uuid &&
        relationItem["object_type"] === "image"
      ) {
        image = relationItem["dcterms_source"];
        break;
      }
    }

    if (image) {
      // Optional: prepend "/scans" if it's not an absolute URL
      if (!image.startsWith("http")) {
        image = "/scans" + image;
      }

      frag += `
      <a href="${url}"><img src="${image}" /></a>
    `;
    }
  }

  frag += "</div>";

  return frag;
}

export function relationshipList(
  relations,
  profile,
  field,
  displayLabel = false
) {
  if (!profile.hasOwnProperty(field)) {
    return "";
  }

  let html = `<div class="relations">`;

  let sortList = [],
    item = { rel: null, display: null, obj: null, type: null },
    label = "";

  if (displayLabel) {
    label = getLabel(field);
  }

  for (const relationVal of profile[field]) {
    const relKey = uuidFromUri(relationVal, true);
    for (const relation of relations) {
      if (relation.id === relKey) {
        let obj_type = relation["object_type"];
        let displayField = displayfields[obj_type]?.value;
        item = {
          rel: relationVal,
          display: relation?.[displayField],
          label: label,
          obj: relation,
          type: obj_type,
          sort: displayField,
        };

        sortList.push(item);
      }
    }
  }

  const sortedList = sortList.sort((a, b) => {
    const key = a.sort;
    const valA = a.obj[key];
    const valB = b.obj[key];

    if (valA < valB) return -1;
    if (valA > valB) return 1;
    return 0;
  });

  if (displayLabel && sortList.length > 0) {
    html += `<dt>${sortedList[0]["label"]}</dt><dd>`;
  }

  for (const item of sortList) {
    const url = profileFromUri(item.rel);
    const display = item.display;
    const role = item.obj?.["ox_titlesRolesOccupations"];

    if (role) {
      html += `<p><a href="${url}">${display}</a> - ${role}</p>`;
    } else {
      html += `<p>
        <a href="${url}">${display}</a>
      </p>`;
    }
  }

  if (displayLabel) {
    html += `</dd>`;
  }

  html += `</div>`;

  return html;
}

export function profileFromUri(uri) {
  let finaluri = uri.replace("uri_http://localhost", "/profile");
  finaluri = finaluri.replace("http://localhost", "/profile");

  return finaluri;
}

export function decodeUncertaintyFlags(fieldnameRoot, profile = {}) {
  const endings = ["inferred", "uncertain", "approximate"];
  const flags = [];

  for (const ending of endings) {
    const fieldname = fieldnameRoot + ending;
    if (fieldname in profile) {
      flags.push(ending);
    }
  }

  if (flags.length === 1) {
    return flags[0];
  } else if (flags.length === 2) {
    return `${flags[0]} and ${flags[1]}`;
  } else if (flags.length === 3) {
    return `${flags[0]}, ${flags[1]} and ${flags[2]}`;
  }

  return "";
}

export function hasAnyFieldValue(obj, keysMap) {
  return Object.values(keysMap).some((actualKey) => {
    const value = obj[actualKey];
    return value !== undefined && value !== null && value !== "";
  });
}

export function getAnchorName(detailType) {
  const anchorName = detailType.replace(":", "_") + "_anchor";
  return anchorName;
}

export function renderH4Section(profile, field, icon = null) {
  if (!profile.hasOwnProperty(field)) return "";

  const label = getLabel(field);
  const value = profile[field];

  return `
    <div class="profilepart">
      <h4>
        ${icon ? `<img src="${icon}">` : ""}${label}
      </h4>
      <div class="content section">
        ${value}
      </div>
    </div>
  `;
}

export function defListItem(profile, field, capitalize = false, link = "") {
  if (profile.hasOwnProperty(field)) {
    let label = getLabel(field);
    let val = profile[field];

    let html = `<dt>${label}</dt>`;

    if (capitalize) {
      val = val.toUpperCase();
    }

    if (link != "") {
      let link = `${link}${val}`;
      html += `<dd><a href="${full_link}">${val}</a></dd>`;
    } else {
      html += `<dd>${val}</dd>`;
    }

    return html;
  } else {
    return "";
  }
}

export function totalLinkingToListWork(profile, objectType) {
  let frag = `<p class="highlight-box">`;

  const uriField = "dcterms_identifier-uri_";
  let uriSearch = profile[uriField];
  uriSearch = uuidFromUri(uriSearch);
  let totalLinks = [];

  if (objectType == "person") {
    totalLinks = [
      {
        linkText: "ox_totalWorksByAgent",
        fieldNames: "frbr_creator-person",
      },
      {
        linkText: "ox_totalWorksAddressedToAgent",
        fieldNames: "mail_recipient-person",
      },
      {
        linkText: "ox_totalWorksMentioningAgent",
        fieldNames: "dcterms_references-person",
      },
    ];
  } else if (objectType == "location") {
    totalLinks = [
      {
        linkText: "mail_originOf-work",
        fieldNames: "mail_origin-location",
      },
      {
        linkText: "mail_destinationOf-work",
        fieldNames: "mail_destination-location",
      },
      {
        linkText: "dcterms_isReferencedBy-work",
        fieldNames: "dcterms_references-location",
      },
    ];
  } else {
    return "";
  }

  let divider = false;

  totalLinks.forEach((link) => {
    if (divider) {
      frag += "&diams;&nbsp;";
    } else {
      divider = true;
    }

    let label = getLabel(link.linkText);
    let value = profile[link.linkText];

    if (Array.isArray(value)) {
      value = value.length; // Use the length if it's an array
    } else if (typeof value !== "number") {
      value = 0; // If it's neither a number nor an array, set it to 0
    }

    let linkText = `${value} ${label.toLowerCase()}&nbsp;`;

    let href = `/forms/advanced?${link.fieldNames}=${uriSearch}`;

    if (value > 0) {
      frag += `<a href="${href}" title="${label}">${linkText}</a>`;
    } else {
      frag += `${linkText}`;
    }
  });

  frag += "</p>";

  return frag;
}

// NOT REQUIRED BUT KEEPING IT IN CASE IT'S NEEDED
// function stripValuePrefix(fullString, prefix = "") {
//   let retval = fullString;
//   const plength = prefix.length;

//   // Either strip off a specified prefix
//   if (plength > 0) {
//     if (fullString.startsWith(prefix)) {
//       retval = fullString.slice(plength);
//     }
//   }
//   // Or strip off everything up to and including the first underscore
//   else {
//     if (fullString.includes("_")) {
//       const parts = fullString.split("_");
//       retval = fullString.slice(parts[0].length + 1);
//     }
//   }

//   return retval;
// }

export function resourceRelation(profile, relations, field) {
  if (profile && profile.hasOwnProperty(field)) {
    let frag = "";
    for (let uri of profile[field]) {
      let uuid = uuidFromUri(uri, true);

      for (let relation of relations) {
        if (relation.id == uuid) {
          let resourceTitle = "",
            resourceUrl = "",
            resourceFurtherDetail = "";

          if (relation.hasOwnProperty("ox_titleOfResource")) {
            resourceTitle = relation["ox_titleOfResource"];
          }

          if (relation.hasOwnProperty("dcterms_relation")) {
            resourceUrl = relation["dcterms_relation"];
          }

          if (relation.hasOwnProperty("ox_detailsOfResource")) {
            resourceFurtherDetail = relation["ox_detailsOfResource"];
          }

          if (resourceUrl !== "" && resourceTitle === "") {
            resourceTitle = resourceUrl;
          }

          frag += "<p>";

          if (resourceUrl != "") {
            frag += `<a href="${resourceUrl}" title="${resourceTitle}" target="_blank">
            ${resourceTitle}
             </a>`;
          } else if (resourceTitle != "") {
            frag += `${resourceTitle}`;
          }

          if (resourceFurtherDetail != "") {
            frag += `<br/>
            ${resourceFurtherDetail}`;
          }

          frag += "</p>";
        }
      }
    }

    return frag;
  } else {
    return "";
  }
}

// START: Table rendering functions
export function h4WorkList(
  field,
  profile,
  data,
  linkField,
  icon,
  title = "",
  sorting = true
) {
  // Will be done after testing the first implementations
  // if (sorting) {
  //   data = data.sort((a, b) => {
  //     const startA = a["ox_started-ox_year"] ?? a["0x_completed-ox_year"];
  //     const startB = b["ox_started-ox_year"] ?? b["0x_completed-ox_year"];
  //     // If both values are undefined, consider them equal
  //     if (startA === undefined && startB === undefined) return 0;
  //     // If one value is undefined, treat it as larger (to push it to the end)
  //     if (startA === undefined) return 1;
  //     if (startB === undefined) return -1;
  //     // Otherwise, compare the values normally
  //     return startA - startB;
  //   });
  // }

  if (title == "") {
    title = getLabel(field);
  }

  let html = `<h3><img src="/static/img/${icon}"/>${title}</h3>
		<div class="content">`;

  if (data.length > 30) {
    html += summaryByYear(linkField, profile, data);
  } else {
    const sortedData = data.sort(
      (a, b) =>
        new Date(a["started_date_sort"]) - new Date(b["started_date_sort"])
    );
    html += summaryByDetail(linkField, profile, data);
  }

  html += "</div>";

  return html;
}

function summaryByYear(field, profile, data) {
  let queryVal = "";
  let queryKey = field;

  const decadeSummary = data.reduce((acc, parentObject) => {
    if (!parentObject) return acc;

    const year =
      parentObject["ox_started-ox_year"] ||
      parentObject["ox_completed-ox_year"];

    if (field == "repository") {
      queryVal = profile["browse"];
    } else {
      queryVal = profile["uuid"];
    }

    // if (this.primaryResultKey) {
    //   queryVal = this.component.results[0][this.primaryResultKey];
    // } else {
    //   if (this.field == "repository") {
    //     queryVal = this.component.results[0]["browse"];
    //   } else {
    //     queryVal = parentObject["author_sort"];
    //   }
    // }

    if (year) {
      const decade = Math.floor(year / 10) * 10; // Calculate decade

      if (!acc[decade]) acc[decade] = {};
      acc[decade][year] = (acc[decade][year] || 0) + 1;
    } else {
      if (!acc["????"]) acc["????"] = {};
      acc["????"]["Unknown year"] = (acc["????"]["Unknown year"] || 0) + 1;
    }

    return acc;
  }, {});

  const rows = Object.entries(decadeSummary)
    .map(([decade, years]) => {
      const yearCounts = Object.entries(years)
        .map(
          ([year, count]) =>
            `<a href="/forms/advanced?${queryKey}=${queryVal}&dat_sin_year=${year}"> ${year}: ${count} </a>`
        )
        .join(" ♦ ");
      return `
          <tr>
            <td>
              ${decade === "????" ? `????` : `${decade}s`}
            </td>
            <td> ${yearCounts} </td>
          </tr>`;
    })
    .join("");

  let countFrag = "";
  if (field == "repository") {
    countFrag += `${data.length} records`;
  }

  return `
    ${countFrag}
    <table class="nested-table">
      <thead>
        <tr>
          <th>
            Decade
          </th>
          <th>
            Letters per year
          </th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
`;
}

function summaryByDetail(field, profile, data) {
  data.sort((a, b) => {
    const startA = a["ox_started-ox_year"] ?? a["0x_completed-ox_year"];
    const startB = b["ox_started-ox_year"] ?? b["0x_completed-ox_year"];

    // If both values are undefined, consider them equal
    if (startA === undefined && startB === undefined) return 0;

    // If one value is undefined, treat it as larger (to push it to the end)
    if (startA === undefined) return 1;
    if (startB === undefined) return -1;

    // Otherwise, compare the values normally
    return startA - startB;
  });

  let lastfieldKey = 0;

  const rows = data
    .map((item) => {
      let cells = [];
      let rowStyle = ""; // Variable to hold the style for the row

      if (
        item.hasOwnProperty("ox_started-ox_year") ||
        item.hasOwnProperty("ox_completed-ox_year")
      ) {
        const value = item["ox_started-ox_year"];
        if (lastfieldKey != value) {
          lastfieldKey = value;
          // Use "????" if value is undefined
          cells.push(`<td>${value !== undefined ? value : "????"}</td>`);
          rowStyle = "border-top: #999 dashed 1px; padding: 5px 0px 5px 10px;"; // Apply dotted separation on the top of the rows
        } else {
          cells.push(`<td></td>`);
        }
      } else {
        if (lastfieldKey != "????") {
          lastfieldKey = "????";
          // Use "????" if value is undefined
          cells.push(`<td>????</td>`);
          rowStyle = "border-top: #999 dashed 1px; padding: 5px 0px 5px 10px;"; // Apply dotted separation on the top of the rows
        } else {
          cells.push(`<td></td>`);
        }
      }

      if (item.hasOwnProperty("dcterms_description")) {
        cells.push(`<td>
              <a href="/profile/work/${item["uuid"]}" class="clickable-row">
                ${item["dcterms_description"]}</a>
            </td>`);
      }

      return `<tr style="${rowStyle}">${cells.join("")}</tr>`;
    })
    .filter((row) => row)
    .join("");

  let countFrag = "";
  if (field == "repository" && data.length > 0) {
    countFrag += `${data.length} ${data.length > 1 ? "records" : "record"}`;
  }

  const table = `
        ${countFrag}
        <table class="nested-table" style="border-collapse: collapse;">
          <tbody>
            ${rows}
          </tbody>
        </table>
    `;
  return table;
}

export function displayImage(profile, data, maniObj, listAll = false) {
  const imageSourceField = "dcterms_source",
    thumbnailField = "foaf_thumbnail",
    uriField = "dcterms_identifier-uri_";

  let sortedList = data;
  // Add sorting logic later

  if (listAll) {
    let imageCount = 0;

    let frag = `
      <div class="profilepart">
      <br/>
      <ul class="small-block-grid-2 medium-block-grid-4 large-block-grid-2">`;

    for (let img of data) {
      let imageSource = img[thumbnailField];

      if (imageSource || imageSource != "undefined") {
        imageSource = img[imageSourceField];
      }

      const imgSourceUrl = ImageUrl(imageSource);
      const isDisplayImage = isDisplayImageType(imgSourceUrl);
      const imageStyle = "border:6px solid #800000";

      imageCount += 1;

      if (img[uriField] == profile[uriField]) {
        if (isDisplayImage) {
          frag += `<li><img style="max-width: 100%;max-width: 100px; ${imageStyle}" src="${imgSourceUrl}" /></li>`;
        }
      } else {
        const pageUri = img[uriField];
        const pageUrl = profileFromUri(pageUri);
        frag += `<li>`;

        if (isDisplayImage) {
          frag += `
            <a href="${pageUrl}">
              <img style="max-width: 100%;max-width: 100px;" src="${imgSourceUrl}" />
            </a>
          `;
        } else {
          // PENDING: Function needs to be written
          // frag += `
          //   <a href="${imgSourceUrl}">
          //     ${self.link_text_for_non_displayable_image(imgSourceUrl)} ${str(
          //   img_count
          // )}
          //   </a>
          // `;
        }
        frag += `</li>`;
      }
    }

    frag += `</ul></div>`;

    return frag;
  } else {
    let frag = "";
    let imageCount = 0;
    let firstImg = {};

    if (imageCount == 0) {
      firstImg = data[0];
    }
    imageCount = data.length;

    if (imageCount > 0) {
      let imageSource = firstImg[thumbnailField];

      if (imageSource || imageSource != "undefined") {
        imageSource = firstImg[imageSourceField];
      }

      const imgSourceUrl = ImageUrl(imageSource);

      const isDisplayImage = isDisplayImageType(imgSourceUrl);

      const pageUri = firstImg[uriField];
      const pageUrl = profileFromUri(pageUri);
      let imageTitle = "";

      if (maniObj.hasOwnProperty("dcterms_type")) {
        imageTitle = maniObj["dcterms_type"];
      }

      frag += `
        <div class="profilepart thumbnail specialthumb">
          <p style="text-align:center;margin-bottom:0px;">
            ${imageTitle}
          </p>
          <p style="text-align:center;margin-bottom:0px;">
             <a href="${pageUrl}">
      `;

      if (isDisplayImage) {
        frag += `<img style="max-width: 100%;min-width: 100px;" src="${imgSourceUrl}" />`;
      } else {
        // PENDING: Function needs to be written
        // frag += `
        //     <a href="${imgSourceUrl}">
        //       ${self.link_text_for_non_displayable_image(imgSourceUrl)} ${str(
        //     img_count
        //   )}
        //     </a>
        //   `;
      }

      frag += `</a></p>`;

      const furtherImageCount = imageCount - 1;

      let msg = "";

      if (furtherImageCount == 0) {
        msg = "No further images";
      } else if (furtherImageCount == 1) {
        msg = "1 further image";
      } else {
        msg = `${furtherImageCount} further images`;
      }

      frag += `
        <p style="text-align:center;margin-bottom:0px;">
          (<a href="${pageUrl}">${msg}</a>)
        </p>
        </div>
      `;

      return frag;
    } else {
      return "";
    }
  }
}

export function ImageUrl(url) {
  let newURL = "";

  if (url) {
    if (url.startsWith("http")) {
      newURL = url;
    } else {
      newURL = "/scans" + url;
    }
  }

  return newURL;
}

export function isDisplayImageType(url) {
  const displayTypes = ["jpg", "png", "gif"];

  for (let type of displayTypes) {
    if (url.toLowerCase().endsWith(type)) {
      return true;
    }
  }

  return false;
}

export function detailsOfOneObject(profile, obj, data, nested = false) {
  let relation = structuredClone(obj);

  // Getting further data for relation
  let manifestationData = {};
  if (data.hasOwnProperty("manifestationData")) {
    if (data["manifestationData"].hasOwnProperty(relation.uuid)) {
      manifestationData = data["manifestationData"][relation.uuid];
    }
  }

  let frag = ` <div class="display_details_of_one_object ${nested}">`;

  const uriFieldName = "dcterms_identifier-uri_";

  if (
    relation.hasOwnProperty(uriFieldName) &&
    relation.hasOwnProperty("object_type")
  ) {
    const uri = relation[uriFieldName];
    const url = profileFromUri(uri);
    const objectType = relation["object_type"];

    const mainDisplayValue = relation[displayfields[objectType].value];

    let fieldsToDisplay = [],
      detailsToDisplay = [],
      label = "",
      displayValue = "",
      relatedUri = "",
      relatedObj = {},
      link = "";

    if (objectType == "manifestation") {
      fieldsToDisplay = getFieldsToDisplayInProfile(objectType, nested);

      const maniReceiptCal = "ox_manifestation_receipt_calendar";

      if (relation.hasOwnProperty(maniReceiptCal)) {
        if (
          ["U", "u", "Unknown", "unknown"].includes(relation[maniReceiptCal])
        ) {
          if (fieldsToDisplay.includes(maniReceiptCal)) {
            fieldsToDisplay = fieldsToDisplay.filter(
              (item) => item !== maniReceiptCal
            );
          }
        } else if (relation[maniReceiptCal] == "G") {
          relation[maniReceiptCal] = "Gregorian";
        } else if (["J", "JJ", "JM"].includes(relation[maniReceiptCal])) {
          relation[maniReceiptCal] = "Julian";
        }
      }

      const creationDate = {
        year: "dcterms_created-ox_year",
        month: "dcterms_created-ox_month",
        day: "dcterms_created-ox_day",
      };
      let date;
      if (
        relation.hasOwnProperty(creationDate.year) ||
        (relation.hasOwnProperty(creationDate.month) &&
          relation[creationDate.month] != 0) ||
        (relation.hasOwnProperty(creationDate.day) &&
          relation[creationDate.day] != 0)
      ) {
        date = getFullDate(
          relation[creationDate.year],
          relation[creationDate.month],
          relation[creationDate.day]
        );

        relation["dcterms_created"] = date;
      }

      // Tweaking values
      if (relation.hasOwnProperty("ox_manifestation_receipt_date_year")) {
        delete relation["ox_manifestation_receipt_date_year"];
      }

      if (relation.hasOwnProperty("ox_manifestation_receipt_date_month")) {
        delete relation["ox_manifestation_receipt_date_month"];
      }

      if (relation.hasOwnProperty("ox_manifestation_receipt_date_day")) {
        delete relation["ox_manifestation_receipt_date_day"];
      }

      relation["ox_manifestation_receipt_date"] = date;

      if (
        relation.hasOwnProperty("ox_manifestation_receipt_date_inferred") ||
        relation.hasOwnProperty("ox_manifestation_receipt_date_uncertain") ||
        relation.hasOwnProperty("ox_manifestation_receipt_date_approx")
      ) {
        relation["ox_manifestation_receipt_date"] += "  (";

        if (relation.hasOwnProperty("ox_manifestation_receipt_date_inferred")) {
          relation["ox_manifestation_receipt_date"] += "inferred ";
        }
        if (
          relation.hasOwnProperty("ox_manifestation_receipt_date_uncertain")
        ) {
          relation["ox_manifestation_receipt_date"] += "uncertain ";
        }
        if (relation.hasOwnProperty("ox_manifestation_receipt_date_approx")) {
          relation["ox_manifestation_receipt_date"] += "approx ";
        }

        relation["ox_manifestation_receipt_date"] += ")";

        const inferredKey = "ox_manifestation_receipt_date_inferred";
        const uncertainKey = "ox_manifestation_receipt_date_uncertain";
        const approxKey = "ox_manifestation_receipt_date_approx";

        if (fieldsToDisplay.includes(inferredKey)) {
          fieldsToDisplay = fieldsToDisplay.filter((f) => f !== inferredKey);
        }
        if (fieldsToDisplay.includes(uncertainKey)) {
          fieldsToDisplay = fieldsToDisplay.filter((f) => f !== uncertainKey);
        }
        if (fieldsToDisplay.includes(approxKey)) {
          fieldsToDisplay = fieldsToDisplay.filter((f) => f !== approxKey);
        }
      }

      if (relation.hasOwnProperty("ox_manifestation_receipt_date_gregorian")) {
        const dateObj = new Date(
          relation["ox_manifestation_receipt_date_gregorian"]
        );
        relation["ox_manifestation_receipt_date_gregorian"] = dateObj
          .toISOString()
          .slice(0, 10);
      }
    }

    if (fieldsToDisplay.length > 0) {
      for (let field of fieldsToDisplay) {
        if (relation.hasOwnProperty(field)) {
          const label = getLabel(field);

          let rawValues = relation[field];

          if (!Array.isArray(rawValues)) {
            rawValues = [rawValues];
          }

          for (let val of rawValues) {
            let displayValue = "",
              relatedUri = "",
              relatedObj = {},
              link = "";

            if (field == "ox_opened") {
              if (val == "Opened") {
                continue;
              }
            } else if (typeof val == "unicode" || typeof val == "string") {
              if (val.startsWith("http")) {
                relatedUri = val;
                const relatedUUID = uuidFromUri(relatedUri, false);

                if (manifestationData.hasOwnProperty(relatedUUID)) {
                  relatedObj = manifestationData[relatedUUID];
                } else {
                  relatedObj = {};
                }
              } else if (field == "dcterms_identifier-shelf_") {
                val = stripValuePrefix(val, "shelf_");
              }
            } else if (field == "ox_isTranslation") {
              if (!val) {
                continue;
              }
            }

            if (relatedUri == "") {
              displayValue = val;
            }

            const details = {
              fieldname: field,
              label: label,
              displayValue: displayValue,
              relatedObj: relatedObj,
              link: link,
            };

            detailsToDisplay.push(details);
          }
        }
      }
    }

    if (detailsToDisplay.length == 0) {
      if (objectType == "comment") {
        frag += `<pre> ${mainDisplayValue} </pre>`;
      } else {
        if (objectType == "institution") {
          const newUrl = url.replace("/institution/", "/repository/");
          console.debug("updating URL", newUrl);
          frag += `<a href="${newUrl}">${mainDisplayValue}</a><br/>`;
        } else {
          frag += `<a href="${url}">${mainDisplayValue}</a><br/>`;
        }
      }

      const additional = getAddtionalFields(objectType);
      let val;
      if (additional) {
        for (let label in additional) {
          val = relation[additional[label]];

          if (val) {
            if (typeof val == "unicode" || typeof val == "string") {
              if (val.startsWith("http")) {
                frag += `<span style="color:#172854;">${label}</span>:<br/>&nbsp;&nbsp;&nbsp; <a href="${val}" target="_blank">${val}</a><br/>`;
              } else {
                frag += `<span style="color:#172854;">${label}</span>:<br/>&nbsp;&nbsp;&nbsp; ${val}<br/>`;
              }
            } else {
              frag += `<span style="color:#172854;">${label}</span>:<br/>&nbsp;&nbsp;&nbsp; ${val}<br/>`;
            }
          }
        }
      }
    } else {
      frag += `<h5>Version: ${mainDisplayValue}</h5>`;

      detailsToDisplay.forEach((detailsDict) => {
        const fieldToDisplay = detailsDict["fieldname"];
        const label = detailsDict["label"];
        const displayValue = detailsDict["displayValue"];
        const relatedObj = detailsDict["relatedObj"];

        if (relation.hasOwnProperty(fieldToDisplay)) {
          if (relatedObj && Object.entries(relatedObj).length > 0) {
            if (label) {
              frag += `<p><span class="fieldlabel">${label}:</span></p>`;
            }
            frag += detailsOfOneObject({}, relatedObj, {}, true); // Assumes it returns a string
          } else {
            if (displayValue) {
              if (label) {
                frag += `<p><span class="fieldlabel">${label}:</span>${displayValue}</p>`;
              } else {
                frag += `<p>${displayValue}</p>`;
              }
            }
          }
        }
      });
    }
  } else {
    return "</div>";
  }

  frag += `</div>`;
  return frag;
}

function getFullDate(year, month, day) {
  let date = "";

  if (year) {
    date += String(year);
  } else {
    date += "????";
  }

  if (month && month !== 0) {
    date += month < 10 ? ` - 0${month}` : ` - ${month}`;
  } else {
    date += " - ??";
  }

  if (day && day !== 0) {
    date += day < 10 ? ` - 0${day}` : ` - ${day}`;
  } else {
    date += " - ??";
  }

  return date;
}

export function stripValuePrefix(fullString, prefix = "") {
  let retval = fullString;
  // Strip specified prefix if provided
  if (prefix.length > 0) {
    if (fullString.startsWith(prefix)) {
      retval = fullString.slice(prefix.length);
    }
  } else {
    // Otherwise, strip everything up to and including the first underscore
    if (fullString.includes("_")) {
      const parts = fullString.split("_");
      const plength = parts[0].length + 1; // +1 for the underscore
      retval = fullString.slice(plength);
    }
  }

  return retval;
}
