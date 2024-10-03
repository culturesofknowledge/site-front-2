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
    sort: [],
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
      sortOptions: [{ field: "started_date_sort", order: "asc" }],
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
      param: "pla_ori_name",
      queryStringFields: [{ field: "location-origin", operator: "OR" }],
    },
    {
      param: "pla_des_name",
      queryStringFields: [{ field: "location-destination", operator: "OR" }],
    },
    {
      param: "pla_ment_name",
      queryStringFields: [{ field: "location-mentioned", operator: "OR" }],
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

    if (config.param == "pla_ori_name") {
      const ori_mark = params.get("pla_ori_mark");

      if (paramValue) {
        if (ori_mark == "true") {
          openingQuery.queryStrings.push({
            queryString: paramValue,
            fields: [{ field: "mail_origin-rdf_value", operator: "AND" }],
          });
        } else {
          openingQuery.queryStrings.push({
            queryString: paramValue,
            fields: config.queryStringFields,
          });
        }
      }
    }

    if (config.param == "pla_des_name") {
      const des_mark = params.get("pla_des_mark");

      if (paramValue) {
        if (des_mark == "true") {
          openingQuery.queryStrings.push({
            queryString: paramValue,
            fields: [{ field: "mail_destination-rdf_value", operator: "AND" }],
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

    if (config.sortOptions && config.sortOptions.length > 0) {
      openingQuery.sort.push(config.sortOptions);
    }
  });

  // Handle date range query
  const sinYear = params.get("dat_sin_year");
  const sinMonth = params.get("dat_sin_month");
  const sinDay = params.get("dat_sin_day");
  const fromYear = params.get("dat_from_year");
  const fromMonth = params.get("dat_from_month");
  const fromDay = params.get("dat_from_day");
  const toYear = params.get("dat_to_year");
  const toMonth = params.get("dat_to_month");
  const toDay = params.get("dat_to_day");

  if (sinYear) {
    openingQuery.queryStrings.push({
      queryString: sinYear,
      fields: [
        { field: "ox_started-ox_year", operator: "OR" },
        { field: "ox_completed-ox_year", operator: "OR" },
      ],
    });
  }

  if (sinMonth) {
    openingQuery.queryStrings.push({
      queryString: sinMonth,
      fields: [
        { field: "ox_started-ox_month", operator: "OR" },
        { field: "ox_completed-ox_month", operator: "OR" },
      ],
    });
  }

  if (sinDay) {
    openingQuery.queryStrings.push({
      queryString: sinMonth,
      fields: [
        { field: "ox_started-ox_day", operator: "OR" },
        { field: "ox_completed-ox_day", operator: "OR" },
      ],
    });
  }

  let fromDate,
    toDate = "";

  if (fromYear || fromMonth || fromDay) {
    fromDate = generateTimestamp(fromYear, fromMonth, fromDay);
  }

  if (toYear || toMonth || toDay) {
    toDate = generateTimestamp(toYear, toMonth, toDay, "to");
  }

  if (fromDate && toDate) {
    openingQuery.query.range = {
      started_date_sort: { gte: fromDate, lte: toDate },
    };
  }

  return {
    openingQuery: openingQuery,
    collection: "",
  };
}

function generateTimestamp(year, month, day, range = "from") {
  console.log(year, month, day);
  // Use year 1 if 'from' and year 9999 if 'to' when the year is not provided
  if (!year) {
    year = range === "from" ? 1 : 9999;
  }

  if (!month) {
    month = range === "from" ? 1 : 12;
  }

  if (!day) {
    day = range === "from" ? 1 : 31;
  }

  let date;

  if (range === "from") {
    // Create date object for the start of the day (00:00:00)
    date = `${year}-${month}-${day}T00:00:00Z`;
  } else if (range === "to") {
    // Create date object for the end of the day (23:59:59)
    date = `${year}-${month}-${day}T23:59:59Z`;
  } else {
    throw new Error("Range must be either 'from' or 'to'");
  }

  return date;
}
