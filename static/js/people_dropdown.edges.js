import emlo from "./edges.js";

// try {
emlo.selector = "people-dropdown";
emlo.collection = "/solr/people/select";
emlo.components = [
  new emlo.ComboBox({
    id: "people_dropdown",
    category: "results",
    renderer: new emlo.ComboBoxRenderer({
      field: "browse",
      defaultOptionText: "all people",
    }),
  }),
];

emlo.init();
// } catch (error) {
//   console.error(error.message);
// }
