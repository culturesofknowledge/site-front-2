import emlo from "./edges.js";
let current_search_letter = "a";

try {
  // Fetching URL params
  const queryString = window.location.search;
  // Setting this as default a

  if (queryString) {
    const params = new URLSearchParams(queryString);
    const letter = params.get("letter");

    if (letter) {
      current_search_letter = letter;
    }
  }

  const filterGroups = {
    ox_totalWorksSentFromPlace: {
      paramvalues: ["wr"],
      valueMap: {
        wr: "Letters Sent From",
      },
    },
    ox_totalWorksSentToPlace: {
      paramvalues: ["re"],
      valueMap: {
        re: "Letters sent to",
      },
    },
    ox_totalWorksMentioningPlace: {
      paramvalues: ["me"],
      valueMap: {
        me: "Letters Mentioning",
      },
    },
  };

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

  // Process filters from URL parameters
  const params = new URLSearchParams(queryString);
  const filters = params.get("filters");

  if (filters) {
    const selectedFilters = {}; // Track selected filters by group
    const filterValues = filters.split(",");

    // Map the filter values to their respective groups
    for (const filter of filterValues) {
      for (const field of Object.keys(filterGroups)) {
        const group = filterGroups[field];
        if (group.paramvalues.includes(filter)) {
          if (!selectedFilters[field]) {
            selectedFilters[field] = [];
          }
          selectedFilters[field].push(filter);
        }
      }
    }

    // Add selected filters to the must query
    for (const [field, values] of Object.entries(selectedFilters)) {
      if (!emlo.openingQuery.query.range) {
        emlo.openingQuery.query.range = {};
      }

      emlo.openingQuery.query.range[field] = {
        gte: 1,
        lte: "*",
      };
    }
  }

  emlo.openingQuery.must.push({
    term: { browse: `${current_search_letter}*` },
  }); // browse starts with 'd'

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
    new emlo.Checkbox({
      id: "checkbox",
      category: "results",
      filterGroups: filterGroups,
      renderer: new emlo.CheckboxRenderer({
        label: "",
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
        showCheckbox: true,
        displayField: "browse",
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
            valueFunction: _redirectToSearch,
          },
          {
            header: " Letters Sent To  ",
            field: "ox_totalWorksSentToPlace",
            pre: "",
            post: "",
            valueFunction: _redirectToSearch,
          },
          {
            header: " Letters Mentioning",
            field: "ox_totalWorksMentioningPlace",
            pre: "",
            post: "",
            valueFunction: _redirectToSearch,
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

function _redirectToSearch(val, res, fieldName) {
  if (typeof res !== "object" || res === null) {
    console.log("Invalid input: res is not an object");
    return "<div>Invalid input</div>";
  }

  // console.log("finalURL", finalUrl);
  if (val > 0) {
    const baseURL = `/forms/advance`;
    let query = "";
    const location = res["browse"];
    const currentPageQ = `browsing=locations&letter=${current_search_letter}`;
    switch (fieldName) {
      case "ox_totalWorksSentFromPlace":
        query = `pla_ori_name=${location}`;
        break;
      case "ox_totalWorksSentToPlace":
        query = `pla_des_name=${location}`;
        break;
      case "ox_totalWorksMentioningPlace":
        query = `pla_ment_name=${location}`;
        break;
    }
    console.log("current_search_letter", current_search_letter);

    query += query ? `&${currentPageQ}` : `${currentPageQ}`;

    const finalUrl = query ? `${baseURL}?${query}` : `${baseURL}`;

    return `<a href="${finalUrl}"> ${val} </a>`;
  } else {
    return `-`;
  }
}
