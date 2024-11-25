import emlo from "./edges.js";

try {
  // Fetching URL params
  const queryString = window.location.search;
  let current_search_letter = "a"; // Setting this as default a

  if (queryString) {
    const params = new URLSearchParams(queryString);
    const letter = params.get("letter");

    if (letter) {
      current_search_letter = letter;
    }
  }

  emlo.openingQuery = {
    must: [],
    query: {
      bool: {
        must: [],
      },
    },
    from: 0,
    size: 999999999,
    queryStrings: [],
    sort: [{ field: "browse", order: "asc" }],
  };

  emlo.openingQuery.must.push({
    term: { browse: `${current_search_letter}*` },
  }); // browse starts with 'd'

  if (!emlo.openingQuery.query.range) {
    emlo.openingQuery.query.range = {};
  }

  emlo.openingQuery.query.range["ox_totalWorksSentFromPlace"] = {
    gte: 1,
    lte: "*",
  };

  emlo.openingQuery.query.range["ox_totalWorksSentToPlace"] = {
    gte: 1,
    lte: "*",
  };

  emlo.openingQuery.query.range["ox_totalWorksMentioningPlace"] = {
    gte: 1,
    lte: "*",
  };

  // Handle fields to return
  //   emlo.openingQuery.queryStrings.push({
  //       queryString: {
  //           query: "*",
  //           fields: [
  //               "dcterms_identifier-uri_",
  //               "geonames_name",
  //               "ox_locationAlternateName",
  //               "geo_lat",
  //               "geo_long",
  //               "ox_totalWorksSentFromPlace",
  //               "ox_totalWorksSentToPlace",
  //               "ox_totalWorksMentioningPlace",
  //               "rdfs_seeAlso-resource"
  //           ]
  //       }
  //   });

  emlo.selector = "browse-locations-results";
  emlo.collection = "/solr/locations/select";

  emlo.components = [
    new emlo.ResultTable({
      id: "results",
      category: "results",
      secondaryResults: false,
      infiniteScroll: false,
      size: 20,
      infiniteScrollPageSize: 999999999,
      renderer: new emlo.ResultTableRenderer({
        noResultsText: "No results to display",
        serialHeader: "",
        tableDisplay: [
          {
            header: "Location name",
            field: "browse",
            pre: "",
            post: "",
            type: "link",
            linkHref: "uuid",
            linkHrefPrefix: "/profile/location",
            valueFunction: null,
          },
          {
            header: " Letters Sent From  ",
            field: "ox_totalWorksSentFromPlace",
            pre: "",
            post: "",
            valueFunction: null,
          },
          {
            header: " Letters Sent To  ",
            field: "ox_totalWorksSentToPlace",
            pre: "",
            post: "",
            valueFunction: null,
          },
          {
            header: " Letters Mentioning",
            field: "ox_totalWorksMentioningPlace",
            pre: "",
            post: "",
            valueFunction: null,
          },
          {
            header: "Further details",
            field: "level_county",
            pre: "",
            post: "",
            type: "multiple",
            multipleFields: [
              { label: "Alternative names", field: "ox_locationAlternateName" },
              { label: "Latitude", field: "geo_lat" },
              { label: "Longitude", field: "geo_long" },
            ],
            valueFunction: null,
          },
        ],
        arrayValueJoin: ", ",
        omitFieldIfEmpty: false,
      }),
    }),
  ];

  emlo.init();
} catch (error) {
  console.error(error.message);
}
