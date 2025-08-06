import emlo from "./edges.js";

const urlParams = new URLSearchParams(window.location.search);
const paramValue = urlParams.get("col_cat");

let defaultValue = "all catalogues";

if (paramValue) {
  defaultValue = paramValue;
}

// try {
emlo.selector = "catalogue-dropdown";
// emlo.collection = "/solr/institutions/select";
emlo.collection = "/api/catalogues";
emlo.components = [
  new emlo.DropDown({
    id: "catalogue_dropdown",
    category: "results",
    size: 10000, // Fetching large number for drop down
    sortOptions: [{ field: "name", order: "asc" }],
    renderer: new emlo.DropDownRenderer({
      field: "name",
      defaultOptionText: defaultValue,
      defaultText : defaultValue,
      paramValue : "col_cat"
    }),
  }),
];

emlo.init();
// } catch (error) {
//   console.error(error.message);
// }
