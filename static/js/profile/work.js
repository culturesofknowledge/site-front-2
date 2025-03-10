export function getWorkComponents(emlo) {
  return [
    new emlo.MultiFields({
      id: "title",
      category: "sidebarTitle",
      renderer: new emlo.MultiFieldsRenderer({
        type: "side-title",
        contentTitle: "Letter",
        contentTitleImage: "/static/img/letter_icon.png",
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
      id: "source-record",
      category: "sidebar",
      renderer: new emlo.MultiFieldsRenderer({
        type: "plain-text",
        divider: true,
        contentTitle: "Source of record",
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
          { title: "", key: "started_date_sort", type: "work-date" },
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
      primaryField: "ox_dateAnnotate-comment",
      renderer: new emlo.MultiFieldsRenderer({
        type: "nested-list",
        sectionTitle: "Comments about the date:",
        sectionTitleStyle: "span",
        primaryField: "ox_dateAnnotate-comment",
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
            additionalInfoKey: "ox_titlesRolesOccupations",
          },
          {
            title: "",
            key: "",
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
            additionalInfoKey: "ox_titlesRolesOccupations",
          },
          {
            title: "",
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
            additionalInfoKey: "ox_titlesRolesOccupations",
          },
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
      id: "places-ment-heading",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "",
        sectionTitle: "Mentions",
      }),
    }),

    new emlo.MultiFields({
      id: "places-mentioned",
      category: "results",
      fetchSecondaryData: true,
      primaryField: "dcterms_references-location",
      renderer: new emlo.MultiFieldsRenderer({
        type: "nested-label",
        sectionTitle: "Places mentioned",
        primaryField: "dcterms_references-location",
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
