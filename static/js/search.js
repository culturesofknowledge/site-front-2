const ROWS_COUNT = 50;

export function searchQueryObj() {
  // Fetching URL params
  const queryString = window.location.search;

  let params = null;
  if (queryString) {
    params = new URLSearchParams(queryString);
  }

  if (params != null && params.get("search_type")) {
    return quickSearch(params);
  } else {
    return advanceSearch(params);
  }
}

function quickSearch(params) {
  let openingQuery = {
    must: [],
    queryStrings: [],
    size: ROWS_COUNT, // This will allow us to fetch number of rows using solr query.
    sort: [{ field: "score", order: "desc" }],
    highlights: [
      {
        filter: ["*"],
        pre: '<span class="highlight">',
        post: "</span>",
        hl: "on",
        indent: "on",
      },
    ],
    queryString: {},
    from: 0,
  };

  if (params != null) {
    if (params && params.get("start")) {
      const urlStartParam = params.get("start");
      const urlStart = parseInt(urlStartParam, 10);

      if (!isNaN(urlStart)) {
        openingQuery.from = urlStart;
      }
    }

    const searchQuery = params.get("everything")
      ? params.get("everything")
      : "*";

    // if (params.get("cito_Catalog")) {
    //   openingQuery.queryStrings.push({
    //     queryString: `${params.get("cito_Catalog")}`,
    //     fields: [{ field: "cito_Catalog", operator: "OR" }],
    //   });
    // }

    if (params.get("cito_Catalog")) {
      openingQuery.must.push({
        field: "cito_Catalog",
        value: `"${params.get("cito_Catalog")}"`,
      });
    }

    if (params.get("object_type")) {
      openingQuery.must.push({
        field: "object_type",
        value: `"${params.get("object_type")}"`,
      });
    }

    // if (params.get("object_type")) {
    //   console.log("jjs", params.get("object_type"));
    //   openingQuery.queryStrings.push({
    //     queryString: `${params.get("object_type")}`,
    //     fields: [{ field: "object_type", operator: "OR" }],
    //   });
    // }

    // openingQuery.queryStrings.push({
    //   queryString: searchQuery,
    //   fields: [{ field: "default_search_field", operator: "OR" }],
    // });

    openingQuery.queryString = {
      queryString: searchQuery,
      defaultField: "default_search_field",
    };
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
    size: ROWS_COUNT, // This will allow us to fetch number of rows using solr query.
    sort: [
      { field: "started_date_sort", order: "asc" },
      { field: "score", order: "desc" },
    ],
    highlights: [],
    from: 0,
    filters: [
      "frbr_Manifestation-manifestation",
      "let_con",
      "destination_sort",
      "recipient_sort",
      "origin_sort",
      "author_sort",
      "started_date_sort",
      "object_type",
      "uuid",
      "ox_started-ox_day",
      "ox_started-ox_month",
      "ox_started-ox_year",
      "ox_completed-ox_day",
      "ox_completed-ox-month",
      "ox_completed-ox_year",
    ],
  };

  if (params && params.get("start")) {
    const urlStartParam = params.get("start");
    const urlStart = parseInt(urlStartParam, 10);

    if (!isNaN(urlStart)) {
      openingQuery.from = urlStart;
    }
  }

  const contents = getContentFields();

  if (contents.length > 0) {
    openingQuery.highlights.push({
      filter: contents,
      pre: '<span class="highlight">',
      post: "</span>",
      hl: "on",
      indent: "on",
    });
  }

  if (params != null) {
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
        queryStringFields: [
          { field: "person-recipient-roles", operator: "AND" },
        ],
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
        queryStringFields: [
          { field: "person-mentioned-roles", operator: "AND" },
        ],
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
        param: "let_lang",
        queryStringFields: [{ field: "dcterms_language", operator: "OR" }],
      },
      {
        param: "repository",
        queryStringFields: [
          { field: "manifestation-institution-place", operator: "OR" },
        ],
      },
      {
        param: "let_shel",
        queryStringFields: [
          { field: "manifestation-shelfmark", operator: "OR" },
        ],
      },
    ];

    const customValue = ["aut", "rec", "pla_ori_name", "pla_des_name"];
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
              fields: [
                { field: "mail_destination-rdf_value", operator: "AND" },
              ],
            });
          } else {
            openingQuery.queryStrings.push({
              queryString: paramValue,
              fields: config.queryStringFields,
            });
          }
        }
      }

      if (paramValue && !customValue.includes(config.param)) {
        openingQuery.queryStrings.push({
          queryString: paramValue,
          fields: config.queryStringFields,
        });
      }
    });

    if (params.get("col_cat")) {
      openingQuery.queryStrings.push({
        queryString: `"${params.get("col_cat")}"`,
        fields: [{ field: "cito_Catalog", operator: "AND" }],
      });
    }

    if (params.get("let_type")) {
      openingQuery.queryStrings.push({
        queryString: `"${params.get("let_type")}"`,
        fields: [{ field: "manifestation-doc_type", operator: "AND" }],
      });
    }

    if (params.get("let_con")) {
      const paramValue = params.get("let_con");
      const trans = params.get("let_con_trans");

      if (paramValue) {
        if (trans == "true") {
          openingQuery.queryStrings.push({
            queryString: `"${paramValue}"`,
            fields: [{ field: "ox_transcription", operator: "AND" }],
          });
        } else {
          openingQuery.queryStrings.push({
            queryString: paramValue,
            fields: [
              { field: "dcterms_abstract", operator: "OR" },
              { field: "ox_keywords", operator: "OR" },
              { field: "ox_incipit", operator: "OR" },
              { field: "ox_excipit", operator: "OR" },
              { field: "mail_postScript", operator: "OR" },
            ],
          });
        }
      }
    }

    if (params.get("let_ima") == "true") {
      openingQuery.queryStrings.push({
        queryString: "*",
        fields: [{ field: "manifestation-has_image", operator: "AND" }],
      });
    }

    if (params.get("let_trans") == "true") {
      openingQuery.queryStrings.push({
        queryString: "*",
        fields: [{ field: "ox_urlOfTranscription", operator: "AND" }],
      });
    }

    if (params.get("let_abst") == "true") {
      openingQuery.queryStrings.push({
        queryString: "*",
        fields: [{ field: "dcterms_abstract", operator: "AND" }],
      });
    }

    if (params.get("let_pmark_tex") && params.get("let_pmark_tex") != "") {
      openingQuery.queryStrings.push({
        queryString: params.get("let_pmark_tex"),
        fields: [{ field: "manifestation-postage_mark", operator: "AND" }],
      });
    } else if (params.get("let_pmark") && params.get("let_pmark") == "true") {
      openingQuery.queryStrings.push({
        queryString: "*",
        fields: [{ field: "manifestation-postage_mark", operator: "AND" }],
      });
    }

    if (params.get("let_end_tex") && params.get("let_end_tex") != "") {
      openingQuery.queryStrings.push({
        queryString: params.get("let_end_tex"),
        fields: [{ field: "manifestation-endorsements", operator: "AND" }],
      });
    } else if (params.get("let_end") && params.get("let_end") == "true") {
      openingQuery.queryStrings.push({
        queryString: "*",
        fields: [{ field: "manifestation-endorsements", operator: "AND" }],
      });
    }

    if (params.get("let_with_en_tex") && params.get("let_with_en_tex") != "") {
      openingQuery.queryStrings.push({
        queryString: params.get("let_with_en_tex"),
        fields: [
          { field: "manifestation-enclosure", operator: "OR" },
          { field: "manifestation-non_letter_enclosures", operator: "OR" },
        ],
      });
    } else if (
      params.get("let_with_en") &&
      params.get("let_with_en") == "true"
    ) {
      openingQuery.queryStrings.push({
        queryString: "*",
        fields: [
          { field: "manifestation-enclosure", operator: "OR" },
          { field: "manifestation-non_letter_enclosures", operator: "OR" },
        ],
      });
    }

    if (params.get("let_en") == "true") {
      openingQuery.queryStrings.push({
        queryString: "*",
        fields: [{ field: "manifestation-enclosed", operator: "AND" }],
      });
    }

    if (params.get("let_seal_tex") && params.get("let_seal_tex") != "") {
      openingQuery.queryStrings.push({
        queryString: params.get("let_seal_tex"),
        fields: [{ field: "manifestation-seal", operator: "OR" }],
      });
    } else if (params.get("let_seal") && params.get("let_seal") == "true") {
      openingQuery.queryStrings.push({
        queryString: "*",
        fields: [{ field: "manifestation-seal", operator: "OR" }],
      });
    }

    if (params.get("let_pap_typ_tex") && params.get("let_pap_typ_tex") != "") {
      openingQuery.queryStrings.push({
        queryString: params.get("let_pap_typ_tex"),
        fields: [{ field: "manifestation-paper_type", operator: "OR" }],
      });
    } else if (
      params.get("let_pap_typ") &&
      params.get("let_pap_typ") == "true"
    ) {
      openingQuery.queryStrings.push({
        queryString: "*",
        fields: [{ field: "manifestation-paper_type", operator: "OR" }],
      });
    }

    if (params.get("let_pap_siz_tex") && params.get("let_pap_siz_tex") != "") {
      openingQuery.queryStrings.push({
        queryString: params.get("let_pap_siz_tex"),
        fields: [{ field: "manifestation-paper_size", operator: "OR" }],
      });
    } else if (
      params.get("let_pap_siz") &&
      params.get("let_pap_siz") == "true"
    ) {
      openingQuery.queryStrings.push({
        queryString: "*",
        fields: [{ field: "manifestation-paper_size", operator: "OR" }],
      });
    }

    if (params.get("let_page_min") && params.get("let_page_min") != "") {
      openingQuery.query.range = {
        "manifestation-pages_number": {
          gte: params.get("let_page_min"),
          lte: "*",
        },
      };
    } else if (params.get("let_page") && params.get("let_page") == "true") {
      openingQuery.queryStrings.push({
        queryString: "*",
        fields: [{ field: "manifestation-pages_number", operator: "OR" }],
      });
    }

    if (params.get("let_pe_tex") && params.get("let_pe_tex") != "") {
      openingQuery.queryStrings.push({
        queryString: params.get("let_pe_tex"),
        fields: [{ field: "manifestation-printed_edition", operator: "OR" }],
      });
    } else if (params.get("let_pe") && params.get("let_pe") == "true") {
      openingQuery.queryStrings.push({
        queryString: "*",
        fields: [{ field: "manifestation-printed_edition", operator: "OR" }],
      });
    }

    if (params.get("author_sort")) {
      openingQuery.must.push({
        field: "author_sort",
        value: `"${params.get("author_sort")}"`,
      });
    }

    if (params.get("recipient_sort")) {
      openingQuery.must.push({
        field: "recipient_sort",
        value: `"${params.get("recipient_sort")}"`,
      });
    }

    if (params.get("origin_sort")) {
      openingQuery.must.push({
        field: "origin_sort",
        value: `"${params.get("origin_sort")}"`,
      });
    }

    if (params.get("destination_sort")) {
      openingQuery.must.push({
        field: "destination_sort",
        value: `"${params.get("destination_sort")}"`,
      });
    }

    if (params.get("cito_Catalog")) {
      openingQuery.must.push({
        field: "cito_Catalog",
        value: `"${params.get("cito_Catalog")}"`,
      });
    }

    if (params.get("mail_origin-location")) {
      openingQuery.must.push({
        field: "mail_origin-location",
        value: `*${params.get("mail_origin-location")}*`,
      });
    }

    if (params.get("mail_destination-location")) {
      openingQuery.must.push({
        field: "mail_destination-location",
        value: `*${params.get("mail_destination-location")}*`,
      });
    }

    if (params.get("dcterms_references-location")) {
      openingQuery.must.push({
        field: "dcterms_references-location",
        value: `*${params.get("dcterms_references-location")}*`,
      });
    }

    if (params.get("frbr_creator-person")) {
      openingQuery.must.push({
        field: "frbr_creator-person",
        value: `*${params.get("frbr_creator-person")}*`,
      });
    }

    if (params.get("dcterms_references-person")) {
      openingQuery.must.push({
        field: "dcterms_references-person",
        value: `*${params.get("dcterms_references-person")}*`,
      });
    }

    if (params.get("mail_recipient-person")) {
      openingQuery.must.push({
        field: "mail_recipient-person",
        value: `*${params.get("mail_recipient-person")}*`,
      });
    }

    if (params.get("ox_started-ox_year")) {
      openingQuery.must.push({
        field: "ox_started-ox_year",
        value: `"${params.get("ox_started-ox_year")}"`,
      });
    }

    if (params.get("uuids")) {
      const uuids = params.get("uuids").split(",").join(" OR ");
      openingQuery.must.push({
        field: "uuid_related",
        value: `(${uuids})`,
      });
    }

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
      if (sinYear == "Unknown year") {
        openingQuery.query.range = {
          started_date_sort: {
            lte: "9999-12-31T00:00:00Z",
            gte: "9999-1-1T00:00:00Z",
          },
        };
      } else {
        openingQuery.queryStrings.push({
          queryString: sinYear,
          fields: [
            { field: "ox_started-ox_year", operator: "OR" },
            { field: "ox_completed-ox_year", operator: "OR" },
          ],
        });
      }
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
        queryString: sinDay,
        fields: [
          { field: "ox_started-ox_day", operator: "OR" },
          { field: "ox_completed-ox_day", operator: "OR" },
        ],
      });
    }

    let fromDate,
      toDate = "";

    if (fromYear || fromMonth || fromDay || toYear || toMonth || toDay) {
      // if (fromYear || fromMonth || fromDay) {
      fromDate = generateTimestamp(fromYear, fromMonth, fromDay);
      // }

      // if (toYear || toMonth || toDay) {
      toDate = generateTimestamp(toYear, toMonth, toDay, "to");
      // }

      if (fromDate && toDate) {
        openingQuery.query.range = {
          started_date_sort: { gte: fromDate, lte: toDate },
        };
      }
    }
  }

  return {
    openingQuery: openingQuery,
    collection: "",
  };
}

function generateTimestamp(year, month, day, range = "from") {
  if (!year) year = range === "from" ? 1 : 9999;
  if (!month) month = range === "from" ? 1 : 12;

  if (!day) {
    if (range === "from") {
      day = 1;
    } else {
      // get last day of the month
      day = new Date(year, month, 0).getDate();
    }
  }

  // zero pad year, month, day
  const yyyy = String(year).padStart(4, "0");
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");

  if (range === "from") {
    return `${yyyy}-${mm}-${dd}T00:00:00Z`;
  } else if (range === "to") {
    return `${yyyy}-${mm}-${dd}T23:59:59Z`;
  } else {
    throw new Error("Range must be either 'from' or 'to'");
  }
}

function getContentFields() {
  let contentFields = [];
  const multiSearchFields = getMultiSearchFields();
  if (multiSearchFields.hasOwnProperty("let_con")) {
    contentFields = multiSearchFields["let_con"];
  }
  return contentFields;
}

function getMultiSearchFields() {
  const multiSearchFields = {};

  // Letter contents
  multiSearchFields["let_con"] = [
    "dcterms_abstract",
    "ox_keywords",
    "ox_incipit",
    "ox_excipit",
    "mail_postScript",
    "ox_transcription",
  ];

  // People: authors or senders
  multiSearchFields["people"] = [
    "person-author",
    "person-recipient",
    "person-mentioned",
  ];

  multiSearchFields["people_gend"] = [
    "person-author-gender",
    "person-recipient-gender",
    "person-mentioned-gender",
  ];

  multiSearchFields["people_roles"] = [
    "person-author-roles",
    "person-addressee-roles",
    "person-mentioned-roles",
  ];

  multiSearchFields["agent_org"] = [
    "person-author-organisation",
    "person-recipient-organisation",
    "person-mentioned-organisation",
  ];

  // Places: origins or destinations
  multiSearchFields["locations"] = [
    "location-origin",
    "location-destination",
    "location-mentioned",
  ];

  // Manifestations with enclosures (letters and non-letters)
  multiSearchFields["let_with_en_tex"] = [
    "manifestation-enclosure",
    "manifestation-non_letter_enclosures",
  ];

  // Single dates - can be START or END of date range
  multiSearchFields["dat_sin_year"] = [
    "ox_started-ox_year",
    "ox_completed-ox_year",
  ];

  multiSearchFields["dat_sin_month"] = [
    "ox_started-ox_month",
    "ox_completed-ox_month",
  ];

  multiSearchFields["dat_sin_day"] = [
    "ox_started-ox_day",
    "ox_completed-ox_day",
  ];

  return multiSearchFields;
}
