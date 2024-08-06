import emlo from "./edges.js";

try {
  emlo.selector = "emlo-results";
  emlo.collection = "/solr/works/select";
  emlo.components = [];

  emlo.init();
} catch (error) {
  console.error(error.message);
}
