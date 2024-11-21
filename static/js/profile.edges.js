import emlo from "./edges.js";

try {
  let collectioName = "works"; // Setting default collectioName.
  let uuid = "";
  // Fetching collection name and ID
  let splittedPath = window.location.pathname.split("/");
  console.log("splittedPath", splittedPath, splittedPath.length);
  if (splittedPath.length <= 3) {
    console.error(
      `something is wrong with the URL, we where expecting the path lenght to be more than 3.`
    );
  }

  //  Setting collection name from the split path
  collectioName = splittedPath[2];
  uuid = splittedPath[3];

  if (uuid == "") {
    console.error(`UUID is missing, unable to make any query`);
  }

  //   Setting emlo object
  emlo.selector = "profile-display";
  emlo.collection = `/solr/people/select`;

  emlo.openingQuery = {
    must: [
      {
        field: "uuid",
        value: uuid,
      },
    ],
  };

  emlo.components = [
    new emlo.MultiFields({
      id: "display",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        field: "ox_isOrganisation",
      }),
    }),
  ];

  console.log("hie", emlo);

  emlo.init();
} catch (err) {
  console.error(err);
}
