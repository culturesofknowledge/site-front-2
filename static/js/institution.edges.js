import emlo from "./edges.js";
let current_search_letter = "a"; // Setting this as default a

try {
  // Fetching URL params
  const queryString = window.location.search;

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
    filters: [
      "ox_hasResource-manifestation",
      "uuid",
      "browse",
      "object_type",
      "ox_totalDocsInRepository",
      "geonames_alternateName",
      "geonames_locatedIn",
      "geonames_inCountry",
    ],
  };

  emlo.openingQuery.must.push({
    term: { browse: `${current_search_letter}*` },
  }); // browse starts with 'd'

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
    new emlo.AlertBox({
      id: "alert-box",
      category: "results",
      renderer: new emlo.AlertBoxRenderer({
        message: `  Note: every manifestation of a letter is counted, so the number of documents in a repository may be larger than the number of letters.
              `,
      }),
    }),
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
        showIndex: false,
        showCheckbox: false,
        selectField: "ox_hasResource-manifestation",
        displayField: "browse",
        tableDisplay: [
          {
            header: "Name",
            field: "browse",
            pre: "",
            post: "",
            type: "link",
            linkHref: "uuid",
            linkHrefPrefix: "/profile",
            valueFunction: null,
          },
          {
            header: "Number of documents ",
            field: "ox_totalDocsInRepository",
            pre: "",
            post: "",
            valueFunction: _redirectToSearch,
          },
          {
            header: "Further details",
            field: "",
            pre: "",
            post: "",
            type: "multiple",
            multipleFields: [
              {
                label: "Alternative names for repository",
                field: "geonames_alternateName",
              },
              {
                label: "City",
                field: "geonames_locatedIn",
              },
              {
                label: "Country",
                field: "geonames_inCountry",
              },
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

function _redirectToSearch(val, res, fieldName) {
  if (typeof res !== "object" || res === null) {
    console.log("Invalid input: res is not an object");
    return "<div>Invalid input</div>";
  }

  // console.log("finalURL", finalUrl);
  if (val > 0) {
    const baseURL = `/forms/advanced`;
    let query = "";
    const user = res["browse"];
    const currentPageQ = `browsing=repositories&letter=${current_search_letter}`;

    switch (fieldName) {
      case "ox_totalDocsInRepository":
        query = `repository=${user}`;
        break;
    }

    query += query ? `&${currentPageQ}` : `${currentPageQ}`;
    const finalUrl = query ? `${baseURL}?${query}` : `${baseURL}`;

    return `<a href="${finalUrl}"> ${val} </a>`;
  } else {
    return `-`;
  }
}
