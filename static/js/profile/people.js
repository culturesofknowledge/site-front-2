export function getPeopleComponents(emlo) {
  return [
    new emlo.MultiFields({
      id: "title",
      category: "sidebarTitle",
      renderer: new emlo.MultiFieldsRenderer({
        type: "side-title",
        contentTitle: "Person",
        dynamicTitle: "Organization",
        dynamicTitleField: "ox_isOrganisation",
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
        contentTitle: "Related resources ",
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
      id: "born-in",
      category: "sidebar",
      fetchSecondaryData: true,
      primaryField: "ox_wasBornIn-location",
      renderer: new emlo.MultiFieldsRenderer({
        type: "side-nested-links",
        divider: true,
        contentTitle: "Place where born",
        primaryField: "ox_wasBornIn-location",
        fields: [
          {
            title: "",
            key: "browse",
            otherInfo: "",
            linkKey: "uuid",
          },
        ],
      }),
    }),

    new emlo.MultiFields({
      id: "died-in",
      category: "sidebar",
      fetchSecondaryData: true,
      primaryField: "ox_diedAt-location",
      renderer: new emlo.MultiFieldsRenderer({
        type: "side-nested-links",
        divider: true,
        contentTitle: "Place where died",
        primaryField: "ox_diedAt-location",
        fields: [
          {
            title: "",
            key: "browse",
            otherInfo: "",
            linkKey: "uuid",
          },
        ],
      }),
    }),

    new emlo.MultiFields({
      id: "visited-in",
      category: "sidebar",
      fetchSecondaryData: true,
      primaryField: "ox_wasAt-location",
      renderer: new emlo.MultiFieldsRenderer({
        type: "side-nested-links",
        divider: true,
        contentTitle: "Places visited",
        primaryField: "ox_wasAt-location",
        fields: [
          {
            title: "",
            key: "browse",
            otherInfo: "",
            linkKey: "uuid",
          },
        ],
      }),
    }),

    new emlo.MultiFields({
      id: "child-of",
      category: "sidebar",
      fetchSecondaryData: true,
      primaryField: "rel_childOf-person",
      renderer: new emlo.MultiFieldsRenderer({
        type: "side-nested-links",
        contentTitle: "Child of ",
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
      id: "parent-of",
      category: "sidebar",
      fetchSecondaryData: true,
      primaryField: "rel_parentOf-person",
      renderer: new emlo.MultiFieldsRenderer({
        type: "side-nested-links",
        contentTitle: "Parent of ",
        primaryField: "rel_parentOf-person",
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
      id: "sibling-of",
      category: "sidebar",
      fetchSecondaryData: true,
      primaryField: "rel_siblingOf-person",
      renderer: new emlo.MultiFieldsRenderer({
        type: "side-nested-links",
        contentTitle: "Sibling of ",
        primaryField: "rel_siblingOf-person",
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
      id: "spouse-of",
      category: "sidebar",
      fetchSecondaryData: true,
      primaryField: "rel_spouseOf-person",
      renderer: new emlo.MultiFieldsRenderer({
        type: "side-nested-links",
        contentTitle: "Spouse of ",
        primaryField: "rel_spouseOf-person",
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
        contentTitle: "Relative of ",
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
      id: "unkown-relationship",
      category: "sidebar",
      fetchSecondaryData: true,
      primaryField: "ox_unspecifiedRelationshipWith-person",
      renderer: new emlo.MultiFieldsRenderer({
        type: "side-nested-links",
        contentTitle: "Unspecified relationship with ",
        primaryField: "ox_unspecifiedRelationshipWith-person",
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
      id: "taught",
      category: "sidebar",
      fetchSecondaryData: true,
      primaryField: "taught-person",
      renderer: new emlo.MultiFieldsRenderer({
        type: "side-nested-links",
        contentTitle: "Was taught by",
        primaryField: "taught-person",
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
      id: "taught-by",
      category: "sidebar",
      fetchSecondaryData: true,
      primaryField: "was_taught_by-person",
      renderer: new emlo.MultiFieldsRenderer({
        type: "side-nested-links",
        contentTitle: "Taught",
        primaryField: "was_taught_by-person",
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
      id: "employed",
      category: "sidebar",
      fetchSecondaryData: true,
      primaryField: "employed-person",
      renderer: new emlo.MultiFieldsRenderer({
        type: "side-nested-links",
        contentTitle: "Was employed by",
        primaryField: "employed-person",
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
      id: "employed-by",
      category: "sidebar",
      fetchSecondaryData: true,
      primaryField: "was_employed_by-person",
      renderer: new emlo.MultiFieldsRenderer({
        type: "side-nested-links",
        contentTitle: "Employed",
        primaryField: "was_employed_by-person",
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
      id: "friend-of",
      category: "sidebar",
      fetchSecondaryData: true,
      primaryField: "friend-person",
      renderer: new emlo.MultiFieldsRenderer({
        type: "side-nested-links",
        contentTitle: "Friend of",
        primaryField: "friend-person",
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
      primaryField: "ox_memberOf-person",
      renderer: new emlo.MultiFieldsRenderer({
        type: "side-nested-links",
        contentTitle: "Member of ",
        primaryField: "ox_memberOf-person",
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
      id: "members",
      category: "sidebar",
      fetchSecondaryData: true,
      primaryField: "foaf_member-person",
      renderer: new emlo.MultiFieldsRenderer({
        type: "side-nested-links",
        contentTitle: "Members",
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
      id: "further-reading",
      category: "sidebar",
      fetchSecondaryData: true,
      primaryField: "ox_furtherReading",
      renderer: new emlo.MultiFieldsRenderer({
        type: "side-nested-links",
        contentTitle: "Further reading",
        primaryField: "ox_furtherReading",
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
          { title: "Alternative name", key: "skos_altLabel" },
          { title: "Titles or roles", key: "ox_titlesRolesOccupations" },
        ],
      }),
    }),

    new emlo.MultiFields({
      id: "dates",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "date-people",
        sectionTitle: "Dates",
        sectionTitleImage: "/static/img/icon-calendar.png",
        divider: true,
        fields: [
          {
            title: "Date of formation",
            keys: {
              date: {
                day: "bio_Birth-ox_day",
                month: "bio_Birth-ox_month",
                year: "bio_Birth-ox_year",
              },
              flag: {
                "bio_Birth-indef_uncertain": "uncertain",
                "bio_Birth-indef_inferred": "inferred",
                "bio_Birth-indef_approximate": "approximate",
              },
            },
          },
          {
            title: "Date of disbandment",
            keys: {
              date: {
                day: "bio_Death-ox_day",
                month: "bio_Death-ox_month",
                year: "bio_Death-ox_year",
              },
              flag: {
                "bio_Death-indef_uncertain": "uncertain",
                "bio_Death-indef_inferred": "inferred",
                "bio_Death-indef_approximate": "approximate",
              },
            },
          },
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
            title: "letters written",
            key: "ox_totalWorksByAgent",
            redirectUrl: "/forms/advance?aut=",
            redirectQueryName: "browse",
          },
          {
            name: "text",
            title: "letters received ",
            key: "ox_totalWorksAddressedToAgent",
            redirectUrl: "/forms/advance?rec=",
            redirectQueryName: "browse",
          },
          {
            name: "text",
            title: "letters mentioning",
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
      optimizedCode: true,
      primaryField: "frbr_creatorOf-work",
      renderer: new emlo.MultiFieldsRenderer({
        type: "nested",
        primaryField: "frbr_creatorOf-work",
        sectionTitle: "Letters Written",
        sectionTitleImage: "/static/img/icon-quill.png",
        field: "frbr_creator-person",
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
      id: "letters-recevied",
      category: "results",
      fetchSecondaryData: true,
      optimizedCode: true,
      primaryField: "mail_recipientOf-work",
      renderer: new emlo.MultiFieldsRenderer({
        type: "nested",
        sectionTitle: "Letters Received",
        sectionTitleImage: "/static/img/icon-quill.png",
        primaryField: "mail_recipientOf-work",
        field: "mail_recipient-person",
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
        primaryField: "dcterms_isReferencedBy-work",
        field: "dcterms_references-person",
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
