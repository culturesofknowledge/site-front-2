export function _renderInstitutionProfile(profile) {
  let frag = "";

  frag += _renderAlternateSection(profile);
  frag += _renderLocationSection(profile);

  return frag;
}

function _renderAlternateSection(profile) {
  if (profile.hasOwnProperty("geonames_alternateName")) {
    return `
      	<div class="column profilepart">
    				<h3><img src="/static/img/icon-repository.png"/>Alternative names</h3>
				<div class="content">
					${profile["geonames_alternateName"].replace("\n", "<br/>") || ""}
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
