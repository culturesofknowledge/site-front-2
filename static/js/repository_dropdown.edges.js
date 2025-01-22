import emlo from "./edges.js";

// try {
emlo.selector = "repository-dropdown";
emlo.collection = "/solr/institutions/select";
emlo.components = [
  new emlo.DropDown({
    id: "repository_dropdown",
    category: "results",
    renderer: new emlo.DropDownRenderer({
      field: "geonames_officialName",
      defaultOptionText: "all repositories",
    }),
  }),
];

emlo.init();
// } catch (error) {
//   console.error(error.message);
// }
