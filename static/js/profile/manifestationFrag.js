import {
  decodeUncertaintyFlags,
  getImageRelation,
  h4RelationshipList,
  renderH4Section,
  stripValuePrefix,
} from "../helper/helper.js";

export function _renderManifestationSection(profile, relations, data) {
  let frag = "";

  frag += _renderDetailSection(profile);
  frag += _renderShelfmarkSection(profile);
  frag += _renderImageSection(profile, relations);
  frag += _renderOtherDetails(profile, relations);
  frag += _renderDateSection(profile);

  const intervalId = setInterval(() => {
    const headingDiv = document.getElementById("heading");

    if (headingDiv) {
      const firstWork = relations.find(
        (item) => item["object_type"] === "work"
      );

      if (firstWork && firstWork.hasOwnProperty("dcterms_description")) {
        console.log("Found work object and heading element");
        headingDiv.innerHTML = firstWork["dcterms_description"];
      }

      clearInterval(intervalId); // Stop checking once headingDiv is found
    }
  }, 100); // check every 300 milliseconds

  return frag;
}

export function _renderManifestationSidebar(profile) {
  let frag = "";

  // frag +=

  return frag;
}

function _renderDetailSection(profile) {
  if (profile.hasOwnProperty("dcterms_type")) {
    return `
      <div class="column profilepart">
				<h3><img src="/static/img/icon-quill.png"/>Document type</h3>
				<div class="content">
					${profile["dcterms_type"]}
					<br/><br/>
				</div>
			</div>
    `;
  } else {
    return "";
  }
}

function _renderShelfmarkSection(profile) {
  if (profile.hasOwnProperty("dcterms_identifier-shelf_")) {
    let shelfmark = profile["dcterms_identifier-shelf_"];

    shelfmark = stripValuePrefix(shelfmark, "shelf_");

    return `
    <div class="column profilepart">
				<h3><img src="/static/img/icon-related-resources.png"/>Shelfmark</h3>
				<div class="content">
					${shelfmark}
					<br/><br/>
				</div>
			</div>
  
    `;
  } else {
    return "";
  }
}

function _renderImageSection(profile, relations) {
  if (
    profile.hasOwnProperty("frbr_Image-image") &&
    profile["frbr_Image-image"].length > 0
  ) {
    let frag = `
      <div class="column profilepart">
				<h3><img src="/static/img/icon-related-resources.png"/>Images</h3>
				<div class="content">
          ${getImageRelation("frbr_Image-image", profile, relations)}  
				  <br/>
        </div>
			</div>
    `;

    return frag;
  } else {
    return "";
  }
}

function _renderOtherDetails(profile, relations) {
  // Type will allow us to know which function to be called and if empty we will skip that object
  const fieldsToRender = [
    {
      field: "ox_resourceAt-institution",
      type: "relationList",
      title: "Repository",
      image: "/static/img/icon-repository.png",
    },
    {
      field: "ox_printedEditionDetails",
      type: "section",
      title: "",
      image: "",
    },
    {
      field: "frbr_Work-work",
      type: "relationList",
      title: null,
      image: "/static/img/icon-quill.png",
    },
    {
      field: "mail_enclosedBy-manifestation",
      type: "relationList",
      title: null,
      image: "/static/img/icon-quill.png",
    },
    {
      field: "mail_enclosureOf-manifestation",
      type: "relationList",
      title: null,
      image: "/static/img/icon-quill.png",
    },
    {
      field: "ox_nonLetterEnclosures",
      type: "section",
      title: "",
      image: "",
    },
    {
      field: "mail_destination",
      type: "section",
      title: "",
      image: "",
    },
    {
      field: "mail_seal",
      type: "section",
      title: "",
      image: "",
    },
    {
      field: "mail_postageMark",
      type: "section",
      title: "",
      image: "",
    },
    {
      field: "ox_endorsements",
      type: "section",
      title: "",
      image: "",
    },
    {
      field: "mail_paperSize",
      type: "section",
      title: "",
      image: "",
    },
    {
      field: "mail_paper",
      type: "section",
      title: "",
      image: "",
    },
    {
      field: "bibo_numPages",
      type: "section",
      title: "",
      image: "",
    },
    {
      field: "ox_numPageText",
      type: "section",
      title: "",
      image: "",
    },
    {
      field: "dcterms_language",
      type: "section",
      title: "",
      image: "",
    },
    {
      field: "ox_incipit",
      type: "section",
      title: "",
      image: "",
    },
    {
      field: "ox_excipit",
      type: "section",
      title: "",
      image: "",
    },
  ];

  let frag = "";

  for (let field of fieldsToRender) {
    if (field.type != "") {
      if (field.type == "relationList") {
        frag += h4RelationshipList(
          profile,
          relations,
          field.field,
          field.title,
          "",
          field.image
        );
      } else if (field.type == "section") {
        frag += renderH4Section(profile, field.field, field.image);
      }
    }
  }

  return frag;
}

function _renderDateSection(profile) {
  let range = false;

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

  const year = profile["dcterms_created-ox_year"] || "";
  const month = profile["dcterms_created-ox_month"] ?? 13; // Use nullish coalescing in case it's 0 or undefined
  const day = profile["dcterms_created-ox_day"] || "";

  const date = `${day} ${months[month - 1]} ${year}`;
  let frag = "";

  if (date.trim()) {
    frag += `
      <div class="column profilepart">
				<h3><img src="/static/img/icon-calendar.png"/>Date of creation</h3>
				<div class="content">
    `;

    if (profile.hasOwnProperty("ox_originalCalendar")) {
      frag += `${profile["ox_originalCalendar"]}: `;
    }

    frag += `${date}`;

    const flags = decodeUncertaintyFlags("dcterms_created-indef_", profile);

    frag += flags;

    frag += `</div></div>`;
  }

  return frag;
}
