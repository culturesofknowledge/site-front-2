import emlo from "./edges.js";
import { getComponents } from "./profile.js";
const collectionMap = {
  person: "people",
  location: "locations",
  work: "works",
  repository: "institutions",
  manifestation: "manifestations",
  image: "images",
  comment: "comments",
  resource: "resources",
};

try {
  let collectioName = "works"; // Setting default collectioName.
  let uuid = "";
  // Fetching collection name and ID
  let splittedPath = window.location.pathname.split("/");
  if (splittedPath.length <= 3) {
    console.error(
      `something is wrong with the URL, we where expecting the path lenght to be more than 3.`
    );
  }

  //  Setting collection name from the split path
  collectioName = collectionMap[splittedPath[2]];
  uuid = splittedPath[3];

  if (uuid == "") {
    console.error(`UUID is missing, unable to make any query`);
  }

  //   Setting emlo object
  emlo.selector = "profile-display";
  emlo.template = new emlo.ProfileTemplate();
  emlo.collection = `/solr/${collectioName}/select`;

  emlo.openingQuery = {
    must: [
      {
        field: "uuid",
        value: uuid,
      },
    ],
  };

  emlo.components = getComponents(collectioName, emlo);

  emlo.init();
} catch (err) {
  console.error(err);
}

// TODO: Complete tiny URL
function genrateShortURL(elementID) {
  let ele = document.getElementById(elementID);
}

function handleStatClick(key) {
  console.log("hei");
}

window.onload = () => {
  // Call the function initially
  genrateShortURL("short-url-link");
};

$(document).ready(function () {
  // Attach a click event listener to the element with id 'specificId'
  $("#send-comment").on("click", function () {
    const currentPath = window.location.pathname;

    // Split the path by "/" and extract the last segment
    const pathSegments = currentPath.split("/");
    const id = pathSegments[pathSegments.length - 1]; // Assumes the ID is the last segment

    if (id) {
      // Redirect to a different page, e.g., '/new-page/{id}'
      window.location.href = `/comment/index?id=${id}`;
    } else {
      console.error("No ID found in the current URL path.");
    }
  });
});
