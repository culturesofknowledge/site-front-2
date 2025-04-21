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

  const filterGroups = {
    ox_totalWorksByAgent: {
      paramvalues: ["wr"],
      valueMap: {
        wr: "Letters Written",
      },
    },
    ox_totalWorksAddressedToAgent: {
      paramvalues: ["re"],
      valueMap: {
        re: "Letters Recevied",
      },
    },
    ox_totalWorksMentioningAgent: {
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

  emlo.openingQuery.must.push({ term: { ox_isOrganisation: true } }); // ox_isOrganisation is false
  emlo.openingQuery.must.push({
    term: { browse: `${current_search_letter}*` },
  }); // browse starts with 'd'
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

  emlo.selector = "browse-organisations-results";
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
    new emlo.AlertBox({
      id: "alert-box",
      category: "results",
      renderer: new emlo.AlertBoxRenderer({
        message: ` You can select up to 10 organisations using the checkboxes below, and then display associated letters.
		                To save your selection for later use, bookmark this page.
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
        showCheckbox: true,
        displayField: "foaf_name",
        tableDisplay: [
          {
            header: "Name",
            field: "foaf_name",
            pre: "",
            post: "",
            type: "link",
            linkHref: "uuid",
            linkHrefPrefix: "/profile",
            valueFunction: null,
          },
          {
            header: " Letters Written ",
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

// function _redirectToSearch(val, res, fieldName) {
//   if (typeof res !== "object" || res === null) {
//     console.log("Invalid input: res is not an object");
//     return "<div>Invalid input</div>";
//   }

//   // console.log("finalURL", finalUrl);
//   if (val > 0) {
//     const baseURL = `/forms/advance`;
//     let query = "";

//     const user = res["foaf_name"];
//     const currentPageQ = `browsing=organisations&letter=${current_search_letter}`;

//     switch (fieldName) {
//       case "ox_totalWorksByAgent":
//         let aut = res["frbr_creatorOf-work"];
//         aut = aut.join(",");

//         query = `frbr_creator-person=${aut}`;

//         break;
//       case "ox_totalWorksAddressedToAgent":
//         let rec = res["mail_recipientOf-work"];
//         if (rec.length > 0) {
//           query = `mail_recipient-person=${rec.join(",")}`;
//         }
//         break;
//       case "ox_totalWorksMentioningAgent":
//         let ment = res["dcterms_isReferencedBy-work"];
//         if (ment.length > 0) {
//           query = `dcterms_references-person=${ment.join(",")}`;
//         }
//         break;
//     }

//     query += query ? `&${currentPageQ}` : `${currentPageQ}`;
//     const finalUrl = query ? `${baseURL}?${query}` : `${baseURL}`;

//     return `<a href="${finalUrl}"> ${val} </a>`;
//   } else {
//     return `-`;
//   }
// }

function _redirectToSearch(val, res, fieldName, current_search_letter = "A") {
  if (typeof res !== "object" || res === null) {
    console.log("Invalid input: res is not an object");
    return "<div>Invalid input</div>";
  }

  if (val > 0) {
    const baseURL = `/forms/advance`;
    const currentPageQ = `browsing=organisations&letter=${current_search_letter}`;

    const queryFields = {
      ox_totalWorksByAgent: {
        resKey: "frbr_creatorOf-work",
        queryKey: "frbr_creator-person",
      },
      ox_totalWorksAddressedToAgent: {
        resKey: "mail_recipientOf-work",
        queryKey: "mail_recipient-person",
      },
      ox_totalWorksMentioningAgent: {
        resKey: "dcterms_isReferencedBy-work",
        queryKey: "dcterms_references-person",
      },
    };

    const mapping = queryFields[fieldName];
    let query = "";

    if (mapping) {
      const values = res[mapping.resKey];
      const newVal = `http://localhost/person/${res.uuid}`;
      if (Array.isArray(values) && values.length > 0) {
        query = `${mapping.queryKey}=${newVal}`;
      }
    }

    console.log("query", query);

    query += query ? `&${currentPageQ}` : currentPageQ;
    const finalUrl = `${baseURL}?${query}`;

    return `<a href="${finalUrl}">${val}</a>`;
  }

  return `-`;
}
