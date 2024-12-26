import emlo from "./edges.js";

try {
  const queryString = window.location.search;
  let current_search_letter = "a"; // Setting this as default 'a'

  if (queryString) {
    const params = new URLSearchParams(queryString);
    const letter = params.get("letter");

    if (letter) {
      current_search_letter = letter;
    }
  }

  const filterGroups = {
    foaf_gender: {
      paramvalues: ["fe", "ma", "un"],
      valueMap: {
        fe: "female",
        ma: "male",
        un: "unknown",
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

  // Add default must query
  emlo.openingQuery.must.push({ term: { ox_isOrganisation: false } }); // ox_isOrganisation is false
  emlo.openingQuery.must.push({
    term: { browse: `${current_search_letter}*` },
  });

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
      if (values.length > 0) {
        const group = filterGroups[field];
        const mappedValues = values.map((value) => group.valueMap[value]);
        const joinedValues = mappedValues.join(" OR ");
        emlo.openingQuery.must.push({ term: { [field]: `(${joinedValues})` } });
      }
    }
  }

  if (!emlo.openingQuery.query.range) {
    emlo.openingQuery.query.range = {};
  }

  emlo.openingQuery.query.range["ox_totalWorksByAgent"] = {
    gte: 1,
    lte: "*",
  };

  emlo.openingQuery.query.range["ox_totalWorksAddressedToAgent"] = {
    gte: 1,
    lte: "*",
  };

  emlo.openingQuery.query.range["ox_totalWorksMentioningAgent"] = {
    gte: 1,
    lte: "*",
  };

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
        showIndex: false,
        showCheckbox: true,
        displayField: "foaf_name",
        serialHeader: "",
        tableDisplay: [
          {
            header: "Name",
            field: "foaf_name",
            pre: "",
            post: "",
            type: "link",
            linkHref: "uuid",
            linkHrefPrefix: "/profile/person",
            valueFunction: null,
          },
          {
            header: "Letters Written ",
            field: "ox_totalWorksByAgent",
            pre: "",
            post: "",
            valueFunction: _redirectToSearch,
          },
          {
            header: "Letters Received ",
            field: "ox_totalWorksAddressedToAgent",
            pre: "",
            post: "",
            valueFunction: _redirectToSearch,
          },
          {
            header: " Letters Mentioning",
            field: "ox_totalWorksMentioningAgent",
            pre: "",
            post: "",
            valueFunction: _redirectToSearch,
          },
          {
            header: "Further details",
            field: "foaf_gender",
            pre: "",
            post: "",
            type: "multiple",
            multipleFields: [
              { label: "Alternative names", field: "skos_altLabel" },
              {
                label: "Titles or roles",
                field: "ox_titlesRolesOccupations",
              },
              { label: "Gender", field: "foaf_gender" },
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

  if (val > 0) {
    const baseURL = `/forms/advance`;
    let query = "";
    const user = res["foaf_name"];

    switch (fieldName) {
      case "ox_totalWorksByAgent":
        query = `aut=${user}`;
        break;
      case "ox_totalWorksAddressedToAgent":
        query = `rec=${user}`;
        break;
      case "ox_totalWorksMentioningAgent":
        query = `ment=${user}`;
        break;
    }
    const finalUrl = query ? `${baseURL}?${query}` : `${baseURL}`;

    return `<a href="${finalUrl}"> ${val} </a>`;
  } else {
    return `-`;
  }
}
