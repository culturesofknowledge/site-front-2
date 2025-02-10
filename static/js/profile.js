const validCollections = [
  "people",
  "locations",
  "works",
  "institutions",
  "manifestations",
  "images",
  "resources",
  "comments",
];

export function getComponents(collectionName, emlo) {
  try {
    let components = [];

    if (validCollections.includes(collectionName)) {
      switch (collectionName) {
        case "people":
          components = _getPeopleComponents(emlo);
          break;
        case "locations":
          components = _getLocationComponents(emlo);
          break;
        case "institutions":
          components = _getInstitutionComponents(emlo);
          break;
        case "manifestations":
          components = _getManifestation(emlo);
          break;
        case "images":
          components = _getImageComponents(emlo);
          break;
        case "resources":
          components = _getResourcesComponents(emlo);
          break;
        case "comments":
          components = _getCommentsComponents(emlo);
          break;
        default:
          components = _getWorkComponents(emlo);
      }
      return components;
    } else {
      return components;
    }
  } catch (err) {
    console.error(err);
  }
}

function _getPeopleComponents(emlo) {
  return [
    new emlo.MultiFields({
      id: "title",
      category: "sidebarTitle",
      renderer: new emlo.MultiFieldsRenderer({
        type: "side-title",
        contentTitle: "Person",
        contentTitleImage: "/static/img/person-icon.png",
      }),
    }),

    new emlo.MultiFields({
      id: "related-resources",
      category: "sidebar",
      fetchSecondaryData: true,
      primaryField: "rdfs_seeAlso-resource",
      renderer: new emlo.MultiFieldsRenderer({
        type: "side-nested-links",
        divider: true,
        sectionTitle: "Related Resources ",
        primaryField: "rdfs_seeAlso-resource",
        fields: [
          {
            title: "",
            key: "ox_titleOfResource",
            otherInfo: "ox_detailsOfResource",
            linkKey: "dcterms_relation",
          },
        ],
      }),
    }),

    new emlo.MultiFields({
      id: "parent-of",
      category: "sidebar",
      fetchSecondaryData: true,
      primaryField: "rel_childOf-person",
      renderer: new emlo.MultiFieldsRenderer({
        type: "side-nested-links",
        sectionTitle: "Parent of ",
        primaryField: "rel_childOf-person",
        fields: [
          {
            title: "",
            key: "browse",
            otherInfo: "ox_titlesRolesOccupations",
            linkKey: "uuid",
          },
        ],
      }),
    }),

    new emlo.MultiFields({
      id: "rel_relativeOf",
      category: "sidebar",
      fetchSecondaryData: true,
      primaryField: "rel_relativeOf-person",
      renderer: new emlo.MultiFieldsRenderer({
        type: "side-nested-links",
        sectionTitle: "Relative of ",
        primaryField: "rel_relativeOf-person",
        fields: [
          {
            title: "",
            key: "browse",
            otherInfo: "ox_titlesRolesOccupations",
            linkKey: "uuid",
          },
        ],
      }),
    }),

    new emlo.MultiFields({
      id: "member-of-person",
      category: "sidebar",
      fetchSecondaryData: true,
      primaryField: "foaf_member-person",
      renderer: new emlo.MultiFieldsRenderer({
        type: "side-nested-links",
        sectionTitle: "Member of ",
        primaryField: "foaf_member-person",
        fields: [
          {
            title: "",
            key: "browse",
            otherInfo: "ox_titlesRolesOccupations",
            linkKey: "uuid",
          },
        ],
      }),
    }),

    new emlo.MultiFields({
      id: "page-title",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "heading",
        field: "browse",
      }),
    }),

    new emlo.MultiFields({
      id: "details",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "content",
        sectionTitle: "Details",
        sectionTitleImage: "/static/img/icon-people.png",
        contentTitle: "",
        divider: true,
        fields: [
          { title: "Alternate Names", key: "skos_altLabel" },
          { title: "Titles or roles", key: "ox_titlesRolesOccupations" },
        ],
      }),
    }),

    new emlo.MultiFields({
      id: "dates",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "dates",
        sectionTitle: "Dates",
        sectionTitleImage: "/static/img/icon-calendar.png",
        divider: true,
        fields: [
          { title: "Date of birth", key: "bio_Birth-ox_year" },
          { title: "Date of death", key: "bio_Death-ox_year" },
        ],
      }),
    }),

    new emlo.MultiFields({
      id: "stats",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "stats",
        sectionTitle: "Catalogue Statistics",
        sectionTitleImage: "/static/img/icon-statistics.png",
        divider: true,
        fields: [
          {
            name: "text",
            title: " letters written",
            key: "ox_totalWorksByAgent",
            redirectUrl: "/forms/advance?aut=",
            redirectQueryName: "browse",
          },
          {
            name: "text",
            title: " letters received ",
            key: "ox_totalWorksAddressedToAgent",
            redirectUrl: "/forms/advance?rec=",
            redirectQueryName: "browse",
          },
          {
            name: "text",
            title: " letters mentioning",
            key: "ox_totalWorksMentioningAgent",
            redirectUrl: "/forms/advance?ment=",
            redirectQueryName: "browse",
          },
        ],
      }),
    }),

    // TODO: Temp removal of graphs
    new emlo.BarGraph({
      id: "graph",
      category: "results",
      fieldKeys: [
        "frbr_creatorOf-work",
        "mail_recipientOf-work",
        "dcterms_isReferencedBy-work",
      ],
      xAxisField: "ox_started-ox_year",
      renderer: new emlo.BarGraphRenderer({
        barColor: "#2E527E",
        graphConfig: {
          "frbr_creatorOf-work": {
            barColor: "#2E527E",
            graphTitle: "Letters written",
          },
          "mail_recipientOf-work": {
            barColor: "#5A7CA5",
            graphTitle: "Letters received",
          },
          "dcterms_isReferencedBy-work": {
            barColor: "#A7BFD6",
            graphTitle: "Letters mentioning",
          },
        },
      }),
    }),

    new emlo.MultiFields({
      id: "letters-written",
      category: "results",
      fetchSecondaryData: true,
      primaryField: "frbr_creatorOf-work",
      renderer: new emlo.MultiFieldsRenderer({
        type: "nested",
        sectionTitle: "Letters Written",
        sectionTitleImage: "/static/img/icon-quill.png",
        primaryField: "frbr_creatorOf-work",
        fields: [
          { title: "", key: "ox_started-ox_year" },
          {
            title: "",
            key: "dcterms_description",
            clickable: true,
            collectionName: "work",
          },
        ],
        divider: true,
      }),
    }),

    new emlo.MultiFields({
      id: "letters-recevied",
      category: "results",
      fetchSecondaryData: true,
      primaryField: "mail_recipientOf-work",
      renderer: new emlo.MultiFieldsRenderer({
        type: "nested",
        sectionTitle: "Letters Received",
        sectionTitleImage: "/static/img/icon-quill.png",
        primaryField: "mail_recipientOf-work",
        fields: [
          { title: "", key: "ox_started-ox_year" },
          {
            title: "",
            key: "dcterms_description",
            clickable: true,
            collectionName: "work",
          },
        ],
        divider: true,
      }),
    }),

    new emlo.MultiFields({
      id: "letters-mentioned",
      category: "results",
      fetchSecondaryData: true,
      primaryField: "dcterms_isReferencedBy-work",
      renderer: new emlo.MultiFieldsRenderer({
        type: "nested",
        sectionTitle: "Letters Mentioning",
        sectionTitleImage: "/static/img/icon-quill.png",
        primaryField: "dcterms_isReferencedBy-work",
        fields: [
          { title: "", key: "ox_started-ox_year" },
          {
            title: "",
            key: "dcterms_description",
            clickable: true,
            collectionName: "work",
          },
        ],
        divider: true,
      }),
    }),

    new emlo.MultiFields({
      id: "comments",
      category: "results",
      fetchSecondaryData: true,
      primaryField: "ox_isAnnotatedBy-comment",
      renderer: new emlo.MultiFieldsRenderer({
        type: "nested-list",
        sectionTitle: "Comments",
        primaryField: "ox_isAnnotatedBy-comment",
        fields: [{ title: "", key: "bibo_Note" }],
        divider: true,
      }),
    }),
  ];
}

function _getLocationComponents(emlo) {
  return [
    new emlo.MultiFields({
      id: "title",
      category: "sidebarTitle",
      renderer: new emlo.MultiFieldsRenderer({
        type: "side-title",
        contentTitle: "Location",
        contentTitleImage: "/static/img/places-icon.png",
      }),
    }),

    new emlo.MultiFields({
      id: "related-resources",
      category: "sidebar",
      fetchSecondaryData: true,
      primaryField: "rdfs_seeAlso-resource",
      renderer: new emlo.MultiFieldsRenderer({
        type: "side-nested-links",
        divider: true,
        sectionTitle: "Related Resources ",
        primaryField: "rdfs_seeAlso-resource",
        fields: [
          {
            title: "",
            key: "ox_titleOfResource",
            otherInfo: "ox_detailsOfResource",
            linkKey: "dcterms_relation",
          },
        ],
      }),
    }),

    new emlo.MultiFields({
      id: "related-people",
      category: "sidebar",
      fetchSecondaryData: true,
      primaryField: "rel_wasBirthplaceOf-person",
      renderer: new emlo.MultiFieldsRenderer({
        type: "side-nested-links",
        sectionTitle: "People born at place ",
        primaryField: "rel_wasBirthplaceOf-person",
        fields: [
          {
            title: "",
            key: "browse",
            otherInfo: "ox_titlesRolesOccupations",
            linkKey: "uuid",
          },
        ],
      }),
    }),

    new emlo.MultiFields({
      id: "page-title",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "heading",
        field: "browse",
      }),
    }),

    new emlo.MultiFields({
      id: "stats",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "stats",
        sectionTitle: "Stats",
        sectionTitleImage: "/static/img/icon-statistics.png",
        divider: true,
        fields: [
          {
            name: "text",
            title: " letters sent from",
            key: "ox_totalWorksSentFromPlace",
            redirectUrl: "/forms/advance?pla_ori_name=",
            redirectQueryName: "browse",
          },
          {
            name: "text",
            title: " letters sent to ",
            key: "ox_totalWorksSentToPlace",
            redirectUrl: "/forms/advance?pla_des_name=",
            redirectQueryName: "browse",
          },
          {
            name: "text",
            title: " letters mentioning",
            key: "ox_totalWorksMentioningPlace",
            redirectUrl: "/forms/advance?pla_ment_name=",
            redirectQueryName: "browse",
          },
        ],
      }),
    }),

    new emlo.MultiFields({
      id: "synonyms",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "content",
        sectionTitle: "Synonyms",
        divider: true,
        field: "ox_locationAlternateName",
      }),
    }),

    new emlo.MultiFields({
      id: "position",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "location",
        sectionTitle: "Position",
        divider: true,
        sectionTitleImage: "/static/img/icon-globe.png",
        lat_field: "geo_lat",
        long_field: "geo_long",
      }),
    }),

    new emlo.MultiFields({
      id: "letters-sent-from",
      category: "results",
      fetchSecondaryData: true,
      primaryField: "mail_originOf-work",
      renderer: new emlo.MultiFieldsRenderer({
        type: "nested",
        sectionTitle: "Letters Sent From",
        sectionTitleImage: "/static/img/icon-quill.png",
        primaryField: "mail_originOf-work",
        fields: [
          { title: "", key: "ox_started-ox_year" },
          {
            title: "",
            key: "dcterms_description",
            clickable: true,
            collectionName: "work",
          },
        ],
        divider: true,
      }),
    }),

    new emlo.MultiFields({
      id: "letters-sent-to",
      category: "results",
      fetchSecondaryData: true,
      primaryField: "mail_destinationOf-work",
      renderer: new emlo.MultiFieldsRenderer({
        type: "nested",
        sectionTitle: "Letters Sent To",
        sectionTitleImage: "/static/img/icon-quill.png",
        primaryField: "mail_destinationOf-work",
        fields: [
          { title: "", key: "ox_started-ox_year" },
          {
            title: "",
            key: "dcterms_description",
            clickable: true,
            collectionName: "work",
          },
        ],
        divider: true,
      }),
    }),

    new emlo.MultiFields({
      id: "letters-mentioned",
      category: "results",
      fetchSecondaryData: true,
      primaryField: "dcterms_isReferencedBy-work",
      renderer: new emlo.MultiFieldsRenderer({
        type: "nested",
        sectionTitle: "Letters Mentioning",
        sectionTitleImage: "/static/img/icon-quill.png",
        primaryField: "dcterms_isReferencedBy-work",
        fields: [
          { title: "", key: "ox_started-ox_year" },
          {
            title: "",
            key: "dcterms_description",
            clickable: true,
            collectionName: "work",
          },
        ],
        divider: true,
      }),
    }),
  ];
}

function _getInstitutionComponents(emlo) {
  return [
    new emlo.MultiFields({
      id: "title",
      category: "sidebarTitle",
      renderer: new emlo.MultiFieldsRenderer({
        type: "side-title",
        contentTitle: "Institution",
        contentTitleImage: "/static/img/repository-icon.png",
      }),
    }),

    new emlo.MultiFields({
      id: "page-title",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "heading",
        field: "browse",
      }),
    }),

    new emlo.MultiFields({
      id: "related-resources",
      category: "sidebar",
      fetchSecondaryData: true,
      primaryField: "rdfs_seeAlso-resource",
      renderer: new emlo.MultiFieldsRenderer({
        type: "side-nested-links",
        divider: true,
        sectionTitle: "Related Resources ",
        primaryField: "rdfs_seeAlso-resource",
        fields: [
          {
            title: "",
            key: "ox_titleOfResource",
            otherInfo: "ox_detailsOfResource",
            linkKey: "dcterms_relation",
          },
        ],
      }),
    }),

    new emlo.MultiFields({
      id: "alternative-names",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "text",
        sectionTitle: "Alternative names",
        sectionTitleImage: "/static/img/icon-repository.png",
        field: "geonames_alternateName",
        divider: true,
      }),
    }),

    new emlo.MultiFields({
      id: "locations",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "label",
        sectionTitle: "Location",
        sectionTitleImage: "/static/img/icon-globe.png",
        divider: true,
        fields: [
          { title: "City", key: "geonames_locatedIn" },
          { title: "Country", key: "geonames_inCountry" },
        ],
      }),
    }),

    new emlo.MultiFields({
      id: "contents",
      category: "results",
      fetchSecondaryData: true,
      primaryField: "ox_hasResource-manifestation",
      renderer: new emlo.MultiFieldsRenderer({
        type: "nested",
        sectionTitle: "Content",
        sectionTitleImage: "/static/img/icon-quill.png",
        primaryField: "ox_hasResource-manifestation",
        fields: [
          { title: "", key: "ox_started-ox_year" },
          { title: "", key: "dcterms_description", clickable: true },
        ],
        divider: true,
      }),
    }),
  ];
}

function _getWorkComponents(emlo) {
  return [
    new emlo.MultiFields({
      id: "title",
      category: "sidebarTitle",
      renderer: new emlo.MultiFieldsRenderer({
        type: "side-title",
        contentTitle: "Letter",
        contentTitleImage: "/static/img/person-icon.png",
      }),
    }),

    new emlo.MultiFields({
      id: "page-title",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "heading",
        field: "dcterms_description",
      }),
    }),

    new emlo.MultiFields({
      id: "related-resources",
      category: "sidebar",
      fetchSecondaryData: true,
      primaryField: "rdfs_seeAlso-resource",
      renderer: new emlo.MultiFieldsRenderer({
        type: "side-nested-links",
        divider: true,
        sectionTitle: "Related Resources ",
        primaryField: "rdfs_seeAlso-resource",
        fields: [
          {
            title: "",
            key: "ox_titleOfResource",
            otherInfo: "ox_detailsOfResource",
            linkKey: "dcterms_relation",
          },
        ],
      }),
    }),

    new emlo.MultiFields({
      id: "source-record",
      category: "sidebar",
      renderer: new emlo.MultiFieldsRenderer({
        type: "text",
        divider: true,
        sectionTitle: "Source of record",
        field: "ox_sourceOfData",
      }),
    }),

    new emlo.MultiFields({
      id: "catalog",
      category: "sidebar",
      renderer: new emlo.MultiFieldsRenderer({
        type: "text",
        sectionTitle: "",
        field: "cito_Catalog",
      }),
    }),

    new emlo.MultiFields({
      id: "dates",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "label",
        sectionTitle: "Dates",
        sectionTitleImage: "/static/img/icon-calendar.png",
        divider: true,
        fields: [
          { title: "", key: "started_date_sort", type: "date" },
          { title: "Calendar", key: "ox_originalCalendar" },
          {
            title: "Marked as",
            key: "ox_dateMarked",
            additonalInfo: [
              {
                mainKey: "ox_started-indef_approximate",
                secondaryKey: "",
                text: "(Date is approximate)",
              },
              {
                mainKey: "ox_started-indef_inferred",
                secondaryKey: "",
                text: "(Date is inferred)",
              },
              {
                mainKey: "ox_started-indef_uncertain",
                secondaryKey: "",
                text: "(Date is uncertain)",
              },
            ],
          },
        ],
      }),
    }),

    new emlo.MultiFields({
      id: "gap",
      category: "results",
      primaryField: "comments",
      renderer: new emlo.MultiFieldsRenderer({}),
    }),

    new emlo.MultiFields({
      id: "comments-new",
      category: "results",
      fetchSecondaryData: true,
      primaryField: "comments",
      renderer: new emlo.MultiFieldsRenderer({
        type: "nested-list",
        sectionTitle: "Comments about the date:",
        sectionTitleStyle: "span",
        primaryField: "comments",
        fields: [
          {
            title: "",
            key: "bibo_Note",
          },
        ],
      }),
    }),

    new emlo.MultiFields({
      id: "people",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "",
        sectionTitle: "People",
        sectionTitleImage: "/static/img/icon-people.png",
        divider: true,
      }),
    }),

    new emlo.MultiFields({
      id: "people-author",
      category: "results",
      fetchSecondaryData: true,
      primaryField: "frbr_creator-person",
      renderer: new emlo.MultiFieldsRenderer({
        type: "nested-label",
        sectionTitle: "Author",
        primaryField: "frbr_creator-person",
        fields: [
          {
            title: "",
            key: "browse",
            clickable: true,
            collectionName: "person",
          },
          {
            title: "",
            key: "ox_titlesRolesOccupations",
            additonalInfo: [
              {
                mainKey: "mail_authors-indef_inferred",
                secondaryKey: "mail_authors-rdf_value",
                text: "(Authors is inferred)",
              },
            ],
          },
        ],
      }),
    }),

    new emlo.MultiFields({
      id: "people-recipient",
      category: "results",
      fetchSecondaryData: true,
      primaryField: "mail_recipient-person",
      renderer: new emlo.MultiFieldsRenderer({
        type: "nested-label",
        sectionTitle: "Recipient",
        primaryField: "mail_recipient-person",
        fields: [
          {
            title: "",
            key: "browse",
            clickable: true,
            collectionName: "person",
          },
          {
            title: "",
            key: "ox_titlesRolesOccupations",
            additonalInfo: [
              {
                mainKey: "mail_addressees-indef_inferred",
                secondaryKey: "mail_addressees-rdf_value",
                text: "(Recipient is inferred)",
              },
            ],
          },
        ],
      }),
    }),

    new emlo.MultiFields({
      id: "people-mentions",
      category: "results",
      fetchSecondaryData: true,
      primaryField: "dcterms_references-person",
      renderer: new emlo.MultiFieldsRenderer({
        type: "nested-label",
        sectionTitle: "Mentions",
        primaryField: "dcterms_references-person",
        fields: [
          {
            title: "",
            key: "browse",
            clickable: true,
            collectionName: "person",
          },
          { title: "", key: "ox_titlesRolesOccupations" },
        ],
      }),
    }),

    new emlo.MultiFields({
      id: "places",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "",
        sectionTitle: "Places",
        sectionTitleImage: "/static/img/icon-globe.png",
        divider: true,
      }),
    }),

    new emlo.MultiFields({
      id: "places-recipient",
      category: "results",
      fetchSecondaryData: true,
      primaryField: "mail_origin-location",
      renderer: new emlo.MultiFieldsRenderer({
        type: "nested-label",
        sectionTitle: "Origin",
        primaryField: "mail_origin-location",
        fields: [
          {
            title: "",
            key: "geonames_name",
            clickable: true,
            collectionName: "location",
            additonalInfo: [
              {
                mainKey: "mail_origin-indef_inferred",
                secondaryKey: "mail_origin-rdf_value",
                text: "(Origin is inferred)",
              },
            ],
          },
        ],
      }),
    }),

    new emlo.MultiFields({
      id: "places-destionation",
      category: "results",
      fetchSecondaryData: true,
      primaryField: "mail_destination-location",
      renderer: new emlo.MultiFieldsRenderer({
        type: "nested-label",
        sectionTitle: "Destination",
        primaryField: "mail_destination-location",
        fields: [
          {
            title: "",
            key: "geonames_name",
            clickable: true,
            collectionName: "location",
            additonalInfo: [
              {
                mainKey: "mail_destination-indef_inferred",
                secondaryKey: "mail_destination-rdf_value",
                text: "(Destination is inferred)",
              },
            ],
          },
        ],
      }),
    }),

    new emlo.MultiFields({
      id: "contents",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "",
        sectionTitle: "Contents",
        sectionTitleImage: "/static/img/icon-quill.png",
        divider: true,
      }),
    }),

    new emlo.MultiFields({
      id: "content-abs",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "plain-text",
        sectionTitle: "Abstract",
        field: "dcterms_abstract",
      }),
    }),

    new emlo.MultiFields({
      id: "content-keywords",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "plain-text",
        sectionTitle: "Keywords",
        field: "ox_keywords",
      }),
    }),

    new emlo.MultiFields({
      id: "content-lang",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "plain-text",
        sectionTitle: "Language",
        field: "dcterms_language",
      }),
    }),

    new emlo.MultiFields({
      id: "content-implict",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "plain-text",
        sectionTitle: "Incipit",
        field: "ox_incipit",
      }),
    }),

    new emlo.MultiFields({
      id: "content-excipit",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "plain-text",
        sectionTitle: "Excipit",
        field: "ox_excipit",
      }),
    }),

    new emlo.MultiFields({
      id: "content-postscript",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "plain-text",
        sectionTitle: "Postscript",
        field: "mail_postScript",
      }),
    }),

    new emlo.MultiFields({
      id: "content-reply-to",
      category: "results",
      fetchSecondaryData: true,
      primaryField: "mail_replyTo-work",
      renderer: new emlo.MultiFieldsRenderer({
        type: "nested-label",
        sectionTitle: "Reply To",
        primaryField: "mail_replyTo-work",
        fields: [
          {
            title: "",
            key: "dcterms_description",
            clickable: true,
            collectionName: "work",
          },
        ],
      }),
    }),

    new emlo.MultiFields({
      id: "content-has-reply",
      category: "results",
      fetchSecondaryData: true,
      primaryField: "mail_hasReply-work",
      renderer: new emlo.MultiFieldsRenderer({
        type: "nested-label",
        sectionTitle: "Answered by",
        primaryField: "mail_hasReply-work",
        fields: [
          {
            title: "",
            key: "dcterms_description",
            clickable: true,
            collectionName: "work",
          },
        ],
      }),
    }),

    new emlo.MultiFields({
      id: "repo-versions",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        divider: true,
        sectionTitle: "Repositories and Versions ",
        sectionTitleImage: "/static/img/icon-repository.png",
      }),
    }),

    new emlo.MultiFields({
      id: "repo",
      category: "results",
      fetchSecondaryData: true,
      primaryField: "frbr_Manifestation-manifestation",
      renderer: new emlo.MultiFieldsRenderer({
        type: "repo-version",
        primaryField: "frbr_Manifestation-manifestation",
      }),
    }),

    new emlo.MultiFields({
      id: "comments",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        divider: true,
        sectionTitle: "Comments",
        sectionTitleImage: "/static/img/icon-comment.png",
      }),
    }),

    new emlo.MultiFields({
      id: "comments-general",
      category: "results",
      fetchSecondaryData: true,
      primaryField: "comments",
      renderer: new emlo.MultiFieldsRenderer({
        type: "nested-list",
        sectionTitle: "General",
        primaryField: "comments",
        fields: [
          {
            title: "",
            key: "bibo_Note",
          },
        ],
      }),
    }),

    new emlo.MultiFields({
      id: "resources",
      category: "results",
      fetchSecondaryData: true,
      primaryField: "resources",
      renderer: new emlo.MultiFieldsRenderer({
        type: "nested-label",
        sectionTitle: "Related Resources",
        sectionTitleImage: "/static/img/icon-related-resources.png",
        divider: true,
        primaryField: "resources",
        fields: [
          {
            title: "",
            key: "ox_titleOfResource",
            clickable: true,
          },
          {
            title: "",
            key: "ox_detailsOfResource",
          },
        ],
      }),
    }),
  ];
}

function _getManifestation(emlo) {
  return [
    new emlo.MultiFields({
      id: "title",
      category: "sidebarTitle",
      renderer: new emlo.MultiFieldsRenderer({
        type: "side-title",
        contentTitle: "Document",
        contentTitleImage: "/static/img/person-icon.png",
      }),
    }),

    new emlo.MultiFields({
      id: "page-title",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "heading",
        field: "frbr_Work-work",
      }),
    }),

    new emlo.MultiFields({
      id: "document-type",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "plain-text",
        sectionTitle: "Document type",
        sectionTitleImage: "/static/img/icon-quill.png",
        divider: true,
        field: "dcterms_type",
      }),
    }),

    new emlo.MultiFields({
      id: "shelfmark",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "plain-text",
        sectionTitle: "Shelfmark",
        sectionTitleImage: "/static/img/icon-related-resources.png",
        divider: true,
        field: "dcterms_identifier-shelf_",
      }),
    }),

    new emlo.MultiFields({
      id: "images",
      category: "results",
      fetchSecondaryData: true,
      primaryField: "frbr_Image-image",
      renderer: new emlo.MultiFieldsRenderer({
        type: "images",
        sectionTitle: "Images",
        sectionTitleImage: "/static/img/icon-related-resources.png",
        divider: true,
        primaryField: "frbr_Image-image",
        field: "dcterms_source",
      }),
    }),

    new emlo.MultiFields({
      id: "repos",
      category: "results",
      fetchSecondaryData: true,
      primaryField: "ox_resourceAt-institution",
      renderer: new emlo.MultiFieldsRenderer({
        type: "nested-label",
        sectionTitle: "Repository",
        sectionTitleImage: "/static/img/icon-repository.png",
        divider: true,
        primaryField: "ox_resourceAt-institution",
        fields: [
          {
            title: "",
            key: "browse",
            clickable: true,
            collectionName: "institution",
          },
        ],
      }),
    }),

    // TODO: Add works once we have data

    new emlo.MultiFields({
      id: "enclosed-in",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "links",
        sectionTitle: "Was enclosed in",
        sectionTitleImage: "/static/img/icon-quill.png",
        divider: true,
        contentTitle: "Letter",
        field: "mail_enclosureOf-manifestation",
      }),
    }),

    new emlo.MultiFields({
      id: "has-enclosed",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "links",
        sectionTitle: "Had enclosure",
        contentTitle: "Letter",
        sectionTitleImage: "/static/img/icon-quill.png",
        divider: true,
        field: "mail_enclosedBy-manifestation",
      }),
    }),

    new emlo.MultiFields({
      id: "non-letter-enclosures",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "text",
        sectionTitle: "Non-letter enclosures",
        divider: true,
        field: "ox_nonLetterEnclosures",
      }),
    }),

    new emlo.MultiFields({
      id: "address",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "plain-text",
        sectionTitle: "Address",
        divider: true,
        field: "mail_destination",
      }),
    }),

    new emlo.MultiFields({
      id: "seal",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "plain-text",
        sectionTitle: "Seal",
        divider: true,
        field: "mail_seal",
      }),
    }),

    new emlo.MultiFields({
      id: "postage-mark",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "plain-text",
        sectionTitle: "Postage mark",
        divider: true,
        field: "mail_postageMark",
      }),
    }),

    new emlo.MultiFields({
      id: "ox-endoursment",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "plain-text",
        sectionTitle: "Endorsements",
        divider: true,
        field: "ox_endorsements",
      }),
    }),

    new emlo.MultiFields({
      id: "paper-size",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "plain-text",
        sectionTitle: "Paper Size",
        divider: true,
        field: "mail_paperSize",
      }),
    }),

    new emlo.MultiFields({
      id: "mail-paper",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "plain-text",
        sectionTitle: "Paper type or watermark",
        divider: true,
        field: "mail_paper",
      }),
    }),

    new emlo.MultiFields({
      id: "num-pages",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "plain-text",
        sectionTitle: "Number of pages of document",
        divider: true,
        field: "bibo_numPages",
      }),
    }),

    new emlo.MultiFields({
      id: "num-pages-text",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "plain-text",
        sectionTitle: "Number of pages of text",
        divider: true,
        field: "ox_numPageText",
      }),
    }),

    new emlo.MultiFields({
      id: "dcterms_language",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "plain-text",
        sectionTitle: "Language",
        divider: true,
        field: "dcterms_language",
      }),
    }),

    new emlo.MultiFields({
      id: "ox_incipit",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "plain-text",
        sectionTitle: "Incipit",
        divider: true,
        field: "ox_incipit",
      }),
    }),

    new emlo.MultiFields({
      id: "ox_excipit",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "plain-text",
        sectionTitle: "Explicit",
        divider: true,
        field: "ox_excipit",
      }),
    }),
  ];
}

function _getImageComponents(emlo) {
  return [
    new emlo.MultiFields({
      id: "title",
      category: "sidebarTitle",
      renderer: new emlo.MultiFieldsRenderer({
        type: "side-title",
        contentTitle: "Image",
        contentTitleImage: "/static/img/images-icon.png",
      }),
    }),

    new emlo.MultiFields({
      id: "page-title",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "heading",
        field: "frbr_Work-work",
      }),
    }),

    new emlo.MultiFields({
      id: "image",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "img",
        sectionTitle: "Images",
        divider: true,
        field: "dcterms_source",
      }),
    }),

    new emlo.MultiFields({
      id: "image-credit",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "text",
        field: "ox_imageCredits",
      }),
    }),

    new emlo.MultiFields({
      id: "details",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "img",
        sectionTitle: "Details",
        sectionTitleImage: "/static/img/icon-quill.png",
        divider: true,
        field: "",
      }),
    }),
  ];
}

function _getCommentsComponents(emlo) {
  return [
    new emlo.MultiFields({
      id: "title",
      category: "sidebarTitle",
      renderer: new emlo.MultiFieldsRenderer({
        type: "side-title",
        contentTitle: "Comment",
        contentTitleImage: "/static/img/resources-icon.png",
      }),
    }),

    new emlo.MultiFields({
      id: "page-title",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "heading",
        field: "bibo_Note",
      }),
    }),

    new emlo.MultiFields({
      id: "para",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "dummy-message",
        divider: true,
        message:
          "Sorry, this record has not been found. It may have been deleted as a duplicate. ",
      }),
    }),
  ];
}

function _getResourcesComponents(emlo) {
  return [
    new emlo.MultiFields({
      id: "title",
      category: "sidebarTitle",
      renderer: new emlo.MultiFieldsRenderer({
        type: "side-title",
        contentTitle: "Related resource",
        contentTitleImage: "/static/img/resources-icon.png",
      }),
    }),

    new emlo.MultiFields({
      id: "page-title",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "heading",
        field: "ox_titleOfResource",
      }),
    }),

    new emlo.MultiFields({
      id: "para",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "dummy-message",
        divider: true,
        message:
          "Sorry, this record has not been found. It may have been deleted as a duplicate. ",
      }),
    }),
  ];
}
