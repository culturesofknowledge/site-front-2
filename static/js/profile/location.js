export function getLocationComponents(emlo) {
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
        contentTitle: "Related Resources ",
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
      id: "related-people-born",
      category: "sidebar",
      fetchSecondaryData: true,
      primaryField: "rel_wasBirthplaceOf-person",
      renderer: new emlo.MultiFieldsRenderer({
        type: "side-nested-links",
        contentTitle: "People born at place ",
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
      id: "related-people-died",
      category: "sidebar",
      fetchSecondaryData: true,
      primaryField: "rel_wasPlaceOfDeathOf-person",
      renderer: new emlo.MultiFieldsRenderer({
        type: "side-nested-links",
        contentTitle: "People who died at place",
        primaryField: "rel_wasPlaceOfDeathOf-person",
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
      id: "related-people-visited",
      category: "sidebar",
      fetchSecondaryData: true,
      primaryField: "rel_wasVisitedBy-person",
      renderer: new emlo.MultiFieldsRenderer({
        type: "side-nested-links",
        contentTitle: "People who visited place ",
        primaryField: "rel_wasVisitedBy-person",
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
            redirectUrl: "/forms/advance?mail_origin-location=",
            redirectQueryName: "uuid",
          },
          {
            name: "text",
            title: " letters sent to ",
            key: "ox_totalWorksSentToPlace",
            redirectUrl: "/forms/advance?mail_destination-location=",
            redirectQueryName: "uuid",
          },
          {
            name: "text",
            title: " letters mentioning",
            key: "ox_totalWorksMentioningPlace",
            redirectUrl: "/forms/advance?dcterms_references-location=",
            redirectQueryName: "uuid",
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
      optimizedCode: true,
      primaryField: "mail_originOf-work",
      renderer: new emlo.MultiFieldsRenderer({
        type: "nested",
        primaryField: "mail_originOf-work",
        field: "mail_origin-location",
        sectionTitle: "Letters Sent From",
        sectionTitleImage: "/static/img/icon-quill.png",
        primaryResultKey: "uuid",
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
      optimizedCode: true,
      primaryField: "mail_destinationOf-work",
      renderer: new emlo.MultiFieldsRenderer({
        type: "nested",
        primaryField: "mail_destinationOf-work",
        field: "mail_destination-location",
        sectionTitle: "Letters Sent To",
        sectionTitleImage: "/static/img/icon-quill.png",
        primaryResultKey: "uuid",
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
      optimizedCode: true,
      primaryField: "dcterms_isReferencedBy-work",
      renderer: new emlo.MultiFieldsRenderer({
        type: "nested",
        sectionTitle: "Letters Mentioning",
        sectionTitleImage: "/static/img/icon-quill.png",
        field: "dcterms_references-location",
        primaryResultKey: "uuid",
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
      id: "gap",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        sectionTitle: "Comments",
        divider: true,
      }),
    }),

    new emlo.MultiFields({
      id: "comments-new",
      category: "results",
      fetchSecondaryData: true,
      primaryField: "ox_isAnnotatedBy-comment",
      renderer: new emlo.MultiFieldsRenderer({
        type: "nested-list",
        sectionTitleStyle: "span",
        primaryField: "ox_isAnnotatedBy-comment",
        fields: [
          {
            title: "",
            key: "bibo_Note",
          },
        ],
      }),
    }),
  ];
}
