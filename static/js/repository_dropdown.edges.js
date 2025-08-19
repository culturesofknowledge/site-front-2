import emlo from "./edges.js";

const urlParams = new URLSearchParams(window.location.search);
const paramValue = urlParams.get("repository");

let defaultValue = "all repositories";

if (paramValue) {
  defaultValue = paramValue;
}

// try {
emlo.selector = "repository-dropdown";
// emlo.collection = "/solr/institutions/select";
emlo.collection = "/repos";
emlo.components = [
  new emlo.DropDown({
    id: "repository_dropdown",
    category: "results",
    size: 10000, // Fetching large number for drop down
    sortOptions: [{ field: "browse", order: "asc" }],
    renderer: new emlo.DropDownRenderer({
      field: "geonames_officialName",
      defaultOptionText: defaultValue,
    }),
  }),
];

emlo.init();
// } catch (error) {
//   console.error(error.message);
// }
