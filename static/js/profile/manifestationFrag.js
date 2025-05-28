import { getImageRelation, stripValuePrefix } from "../helper/helper.js";

export function _renderManuscriptSection(profile, relations, data) {
  let frag = "";

  frag += _renderDetailSection(profile);
  frag += _renderShelfmarkSection(profile);
  frag += _renderImageSection(profile, relations);

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
