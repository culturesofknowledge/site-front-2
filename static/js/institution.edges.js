import emlo from "./edges.js";

try {

  // Fetching URL params
  const queryString = window.location.search
  let current_search_letter = "a" // Setting this as default a

  if(queryString) {
    const params = new URLSearchParams(queryString)
    const letter = params.get("letter")

    if(letter) {
      current_search_letter = letter
    }
  }
  
  emlo.openingQuery = {
      must: [],
      query : {
          bool: {
              must: []
          }
      },
      from: 0,  
      size: 999999999,  
      queryStrings : []
  }

  emlo.openingQuery.must.push({ term: { browse: `${current_search_letter}*` } }); // browse starts with 'd'

  // Handle fields to return - TODO: Handle this part in edges
  // emlo.openingQuery.queryStrings.push({
  //     queryString: {
  //         query: "*",
  //         fields: [
  //             "dcterms_identifier-uri_",
  //             "geonames_officialName",
  //             "geonames_alternateName",
  //             "geonames_locatedIn",
  //             "ox_locatedInAlternate",
  //             "geonames_inCountry",
  //             "ox_totalDocsInRepository",
  //             "rdfs_seeAlso-resource"
  //         ]
  //     }
  // });

  emlo.selector = "browse-institution-results";
  emlo.collection = "/solr/institutions/select";

  emlo.components = [
  
    new emlo.ResultTable({
      id: "results",
      category: "results",
      secondaryResults: false,
      infiniteScroll: false,
      size : 20,
      infiniteScrollPageSize: 999999999,
      renderer: new emlo.ResultTableRenderer({
        noResultsText: "No results to display",
        serialHeader: "",
        tableDisplay: [
          {
            header: "Name",
            field: "browse",
            pre: '',
            post: '',
            valueFunction: null,
          },
          {
            header: "Number of documents ",
            field: "ox_totalDocsInRepository",
            pre: "",
            post: "",
            valueFunction: null,
          },
          {
            header: "Further details",
            field: "geonames_alternateName",
            pre: "",
            post: "",
            valueFunction: null,
          },
        ],
        arrayValueJoin: ", ",
        omitFieldIfEmpty: true,
      }),
    }),
  ];
  
  emlo.init();
} catch (error) {
  console.error(error.message);
}
