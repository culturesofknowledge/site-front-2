import emlo from "./edges.js";
import { getComponents } from "./profile.js";
const collectionMap = {
  person: "people",
  location: "locations",
  work: "works",
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
