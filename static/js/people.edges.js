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

  emlo.openingQuery.must.push({ term: { ox_isOrganisation: false } }); // ox_isOrganisation is false
  emlo.openingQuery.must.push({ term: { browse: `${current_search_letter}*` } }); // browse starts with 'd'


  if (!emlo.openingQuery.query.range) {
    emlo.openingQuery.query.range = {}; 
  }

  emlo.openingQuery.query.range["ox_totalWorksByAgent"] = {
    "gte": 1,
    "lte": "*"
  }

  emlo.openingQuery.query.range["ox_totalWorksAddressedToAgent"] = {
    "gte": 1,
    "lte": "*"
  }

  emlo.openingQuery.query.range["ox_totalWorksMentioningAgent"] = {
    "gte": 1,
    "lte": "*"
  }

  // Handle fields to return - TODO: Handle this part in edges
  // emlo.openingQuery.queryStrings.push({
  //     queryString: {
  //         query: "*",
  //         fields: [
  //             "dcterms_identifier-uri_",
  //             "foaf_name",
  //             "skos_altLabel",
  //             "ox_titlesRolesOccupations",
  //             "foaf_gender",
  //             "ox_totalWorksByAgent",
  //             "ox_totalWorksAddressedToAgent",
  //             "ox_totalWorksMentioningAgent",
  //             "rdfs_seeAlso-resource"
  //         ]
  //     }
  // });

  emlo.selector = "browse-people-results";
  emlo.collection = "/solr/people/select";

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
            field: "foaf_name",
            pre: '',
            post: '',
            valueFunction: null,
          },
          {
            header: " Letters Written ",
            field: "ox_totalWorksByAgent",
            pre: "",
            post: "",
            valueFunction: null,
          },
          {
            header: "Letters Received ",
            field: "ox_totalWorksAddressedToAgent",
            pre: "",
            post: "",
            valueFunction: null,
          },
          {
            header: " Letters Mentioning",
            field: "ox_totalWorksMentioningAgent",
            pre: "",
            post: "",
            valueFunction: null,
          },
          {
            header: "Further details",
            field: "foaf_gender",
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
  console.log("emlo" , emlo)
  emlo.init();
} catch (error) {
  console.error(error.message);
}
