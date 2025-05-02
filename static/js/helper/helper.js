import { getLabel } from "../../js/helper/getFieldLabls.js";

const displayfields = {
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
  title = "",
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

    if (title == "") {
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
          getImageRelation(field);
          break;
        case "detailed":
          getDetailedRelation(field);
          break;
        case "simple":
          frag += `${simpleRelations(field, "", profile, relations)}`;
          break;
        case "resource":
          frag += `${resourceRelation(profile, null, field)}`;
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

function resourceRelation(profile, relations, field) {
  console.log("yellow please work");
  if (profile && profile.hasOwnProperty(field)) {
    let frag = "";
    for (let relation in profile[field]) {
      let uuid = uuidFromUri(relation, true);

      if (relation.id != uuid) {
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
}
