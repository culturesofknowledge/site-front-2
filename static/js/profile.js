const validCollections = ["people", "locations", "works", "institutions"];

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
        sectionTitleImage: "/static/img/person-icon.png",
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
          },
          {
            name: "text",
            title: " letters received ",
            key: "ox_totalWorksAddressedToAgent",
          },
          {
            name: "text",
            title: " letters mentioning",
            key: "ox_totalWorksMentioningAgent",
          },
          {
            name: "graph",
            title: "",
            key: "ox_totalWorksByAgent",
          },
          {
            name: "graph",
            title: "",
            key: "ox_totalWorksAddressedToAgent",
          },
          {
            name: "graph",
            title: "",
            key: "ox_totalWorksMentioningAgent",
          },
        ],
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
        sectionTitleImage: "/static/img/person-icon.png",
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
          },
          {
            name: "text",
            title: " letters sent to ",
            key: "ox_totalWorksSentToPlace",
          },
          {
            name: "text",
            title: " letters mentioning",
            key: "ox_totalWorksMentioningPlace",
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
        sectionTitleImage: "/static/img/person-icon.png",
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
        sectionTitleImage: "/static/img/person-icon.png",
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
          { title: "Marked as", key: "ox_dateMarked" },
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
          { title: "", key: "ox_titlesRolesOccupations" },
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
          { title: "", key: "ox_titlesRolesOccupations" },
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
