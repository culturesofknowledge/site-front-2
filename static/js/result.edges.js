import emlo from "./edges.js";

// try {
//   emloEdges.selector = "result-edges";
//   emloEdges.collection = "/solr/works/select";
//   emloEdges.components = [
//     new edges.components.ResultsDisplay({
//       id: "results",
//       category: "results",
//       renderer: new edges.renderers.bs3.ResultsFieldsByRow({
//         rowDisplay: [
//           [{ field: "cito_Catalog" }],
//           [
//             {
//               pre: "<strong>Editor Group</strong>: ",
//               field: "author_sort",
//             },
//           ],
//         ],
//       }),
//     }),
//   ];

//   emloEdges.init();
// } catch (error) {
//   console.error(error.message);
// }

try {
  const params = {
    selector: "result-edges",
    collection: "/solr/works/select",
    components: [],
  };

  console.log("New code", emlo);
  emlo.init(params);
} catch (error) {
  console.error(error.message);
}
