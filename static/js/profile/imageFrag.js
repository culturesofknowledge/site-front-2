import {
  detailsOfOneObject,
  hasAnyFieldValue,
  ImageUrl,
  isDisplayImageType,
  uuidFromUri,
} from "../../js/helper/helper.js";

export function _renderImageProfile(profile, relations, data) {
  let frag = "";
  console.log("fata", data);
  frag += _renderImageSection(profile, relations);
  frag += _renderDetailSection(profile, relations, data);

  return frag;
}

function _renderImageSection(profile, relations) {
  const relImageField = "frbr_Image-image",
    relManifestationField = "frbr_Manifestation-manifestation",
    imageSourceField = "dcterms_source";

  let manObj = {};

  if (profile.hasOwnProperty(relManifestationField)) {
    let manUri = profile[relManifestationField][0];
    const manUUID = uuidFromUri(manUri, true);

    for (let relation in relations) {
      if (relation.id == manUUID) {
        manObj = relation;
      }
    }
  }

  let repoDetails = [],
    copyRightInfo = "",
    generatedInfo = false;

  if (profile.hasOwnProperty("ox_imageCredits")) {
    copyRightInfo = profile["ox_imageCredits"];
  } else {
    if (manObj.hasOwnProperty("ox_resourceAt-institution")) {
      const repoURI = data["ox_resourceAt-institution"][0];
      const repoUUID = uuidFromUri(repoURI, true);

      const fields = [
        "geonames_officialName",
        "geonames_locatedIn",
        "geonames_inCountry",
      ];

      // MAKE AN API CALL

      for (let field in fields) {
        if (result.hasOwnProperty(field)) {
          repoDetails.push(result[field]);
        }
      }
    }

    copyRightInfo = repoDetails.join(",");
    generatedInfo = true;
  }

  if (profile.hasOwnProperty(imageSourceField)) {
    let filename = profile[imageSourceField];
    const url = ImageUrl(filename);
    const displayImage = isDisplayImageType(url);

    let frag = `	<div class="column profilepart">
				<h3>Image</h3>
				<div class="content">
        <a href="${url}">
    `;

    if (displayImage) {
      frag += `<img src="${url}" class="specialthumb" />`;
    } else {
      // Pending function: Needs to be implemented
      // frag += `${textForNonDisplayImage(url)}`;
    }

    frag += "</a>";

    if (copyRightInfo) {
      frag += `<br/>`;

      if (generatedInfo) {
        frag += `Image &copy`;
      }

      frag += `${copyRightInfo} <br/><br/>`;
    }

    frag += `</div>
			</div>`;

    return frag;
  } else {
    return "";
  }
}

function _renderDetailSection(profile, relations, data) {
  console.log("relations", data);
  if (profile.hasOwnProperty("frbr_Manifestation-manifestation")) {
    const manUri = profile["frbr_Manifestation-manifestation"][0];
    const manUUID = uuidFromUri(manUri, true);
    let frag = "";
    if (relations && relations.length > 0) {
      for (let relation of relations) {
        if (
          relation["object_type"] == "manifestation" &&
          relation.id == manUUID
        ) {
          frag += `
             <div class="column profilepart">
  			      <h3><img src="/static/img/icon-quill.png"/>Details</h3>
  			      <div class="content">
  				      Document type: ${detailsOfOneObject(profile, relation, data, true)}
  			      </div>
  		      </div>
          `;
        }
      }
    }

    return frag;
  } else {
    return "";
  }

  // let frag = `
  //   <div class="column profilepart">
  // 			<h3><img src="/img/icon-quill.png"/>Details</h3>
  // 			<div class="content">
  // 				Document type: ${self.display_details_of_one_object(
  //           manifestation_obj,
  //           (nested = True)
  //         )}
  // 			</div>
  // 		</div>
  // `;
}

function textForNonDisplayImage(url) {
  let fileType = "Image file";
  url = url.toLowercase();

  if (url.endswith("pdf")) {
    fileType = "PDF";
  } else if (url.endswith("tif") || url.endswith("tiff")) {
    fileType = "TIFF";
  }

  return fileType;
}
