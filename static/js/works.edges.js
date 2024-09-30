import emlo from "./edges.js";

try {

  // Fetching URL params
  const queryString = window.location.search
  let current_year = 1600 
  if(queryString) {
    const params = new URLSearchParams(queryString)
    const year = params.get("year")

    if(year) {
        current_year = year
    }
  }
  
  emlo.openingQuery = {
      from: 0,  
      size: 999999999,  
      queryStrings : []
  }

  emlo.openingQuery.queryStrings.push({
    queryString: current_year,
    fields: [
        { field: "ox_started-ox_year", operator: "OR" },
        { field: "ox_completed-ox_year", operator: "OR" }
    ]
  })
  
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

  emlo.selector = "browse-works-results";
  emlo.collection = "/solr/works/select";

  emlo.components = [
  
    new emlo.ResultTable({
      id: "results",
      category: "results",
      secondaryResults: false,
      infiniteScroll: false,
      showCount : false,
      size : 20,
      infiniteScrollPageSize: 999999999,
      renderer: new emlo.ResultTableRenderer({
        noResultsText: `None found for the year ${current_year}. `,
        serialHeader: "",
        tableDisplay: [
          {
            header: "Description of letter",
            field: "dcterms_description",
            pre: '',
            post: '',
            valueFunction: null,
          },
          {
            header: "Further details",
            field: "",
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
