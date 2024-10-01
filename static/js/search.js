export function searchQueryObj() {
  // Fetching URL params
  const queryString = window.location.search;

  if (!queryString) return null;

  const params = new URLSearchParams(queryString);

  if (params && params.get("search_type")) {
    return quickSearch(params);
  } else {
    return advanceSearch(params);
  }
}

function quickSearch(params) {
  let openingQuery = {
    must: [],
  };

  const searchQuery = params.get("everything");

  if (searchQuery != "") {
    openingQuery.must.push({
      term: {
        default_search_field: searchQuery,
      },
    });
  } else {
    openingQuery.must.push({
      term: {
        default_search_field: "*",
      },
    });
  }

  return {
    openingQuery: openingQuery,
    collection: "/solr/all/select",
  };
}

function advanceSearch(params) {
  let openingQuery = {
    must: [],
    query: {},
    queryStrings: [],
  };

  // Define an array of objects that map parameter names to query configurations
  const paramConfigs = [
    {
      param: "people",
      queryStringFields: [
        { field: "person-author", operator: "OR" },
        { field: "person-recipient", operator: "OR" },
        { field: "person-mentioned", operator: "OR" },
      ],
    },
    {
      param: "people_gend",
      queryStringFields: [
        { field: "person-author-gender", operator: "OR" },
        { field: "person-recipient-gender", operator: "OR" },
        { field: "person-mentioned-gender", operator: "OR" },
      ],
    },
    {
      param: "people_roles",
      queryStringFields: [
        { field: "person-author-roles", operator: "OR" },
        { field: "person-addressee-roles", operator: "OR" },
        { field: "person-mentioned-roles", operator: "OR" },
      ],
    },
    {
      param: "agent_org",
      queryStringFields: [
        { field: "person-author-organisation", operator: "OR" },
        { field: "person-recipient-organisation", operator: "OR" },
        { field: "person-mentioned-organisation", operator: "OR" },
      ],
    },
    {
      param: "aut",
      queryStringFields: [{ field: "person-author", operator: "AND" }],
    },
    {
      param: "aut_gend",
      queryStringFields: [{ field: "person-author-gender", operator: "AND" }],
    },
    {
      param: "aut_roles",
      queryStringFields: [{ field: "person-author-roles", operator: "AND" }],
    },
    {
      param: "aut_org",
      queryStringFields: [
        { field: "person-author-organisation", operator: "AND" },
      ],
    },
    {
      param: "rec",
      queryStringFields: [{ field: "person-recipient", operator: "AND" }],
    },
    {
      param: "rec_gend",
      queryStringFields: [
        { field: "person-recipient-gender", operator: "AND" },
      ],
    },
    {
      param: "rec_roles",
      queryStringFields: [{ field: "person-recipient-roles", operator: "AND" }],
    },
    {
      param: "rec_org",
      queryStringFields: [
        { field: "person-recipient-organisation", operator: "AND" },
      ],
    },
    {
      param: "ment",
      queryStringFields: [{ field: "person-mentioned", operator: "AND" }],
    },
    {
      param: "ment_gend",
      queryStringFields: [
        { field: "person-mentioned-gender", operator: "AND" },
      ],
    },
    {
      param: "ment_roles",
      queryStringFields: [{ field: "person-mentioned-roles", operator: "AND" }],
    },
    {
      param: "ment_org",
      queryStringFields: [
        { field: "person-mentioned-organisation", operator: "AND" },
      ],
    },
    {
      param: "locations",
      queryStringFields: [
        { field: "location-origin", operator: "OR" },
        { field: "location-destination", operator: "OR" },
        { field: "location-mentioned", operator: "OR" },
      ],
    },
    {
      param: "let_con",
      queryStringFields: [
        { field: "dcterms_abstract", operator: "OR" },
        { field: "ox_keywords", operator: "OR" },
        { field: "ox_incipit", operator: "OR" },
        { field: "ox_excipit", operator: "OR" },
        { field: "mail_postScript", operator: "OR" },
      ],
    },
  ];

  // Loop through paramConfigs to generate query strings
  paramConfigs.forEach((config) => {
    const paramValue = params.get(config.param);

    if (config.param == "aut") {
      const aut_mark = params.get("aut_mark");

      if (paramValue) {
        if (aut_mark == "true") {
          openingQuery.queryStrings.push({
            queryString: paramValue,
            fields: [{ field: "mail_authors-rdf_value", operator: "AND" }],
          });
        } else {
          openingQuery.queryStrings.push({
            queryString: paramValue,
            fields: config.queryStringFields,
          });
        }
      }
    }

    if (config.param == "rec") {
      const rec_mark = params.get("rec_mark");

      if (paramValue) {
        if (rec_mark == "true") {
          openingQuery.queryStrings.push({
            queryString: paramValue,
            fields: [{ field: "mail_addressees-rdf_value", operator: "AND" }],
          });
        } else {
          openingQuery.queryStrings.push({
            queryString: paramValue,
            fields: config.queryStringFields,
          });
        }
      }
    }

    if (paramValue) {
      openingQuery.queryStrings.push({
        queryString: paramValue,
        fields: config.queryStringFields,
      });
    }
  });

  // Handle date range query
  const fromDate = params.get("dat_from_year");
  const toDate = params.get("dat_to_year");

  if (fromDate && toDate) {
    openingQuery.query.range = {
      "ox_started-ox_year": { gte: fromDate, lte: toDate },
    };
  }

  return {
    openingQuery: openingQuery,
    collection: "",
  };
}
