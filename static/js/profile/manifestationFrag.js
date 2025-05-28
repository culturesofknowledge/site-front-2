export function _renderManuscriptSection(profile, relations, data) {
  let frag = "";

  frag += _renderDetailSection(profile);

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
