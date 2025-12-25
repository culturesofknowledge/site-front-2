export function getPeopleComponents(emlo) {
  return [
    new emlo.MultiFields({
      id: "people-profile-side",
      category: "sidebar",
      renderer: new emlo.ProfileLeftSideRenderer({
        profileType: "people",
      }),
    }),

    new emlo.MultiFields({
      id: "page-title",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "heading",
        isSide: true, // This is a temporary fix to handle margin for heading
        field: "browse",
      }),
    }),

    // TABLE data is reused for rendering graphs
    new emlo.MultiFields({
      id: "people-profile",
      category: "results",
      fetchTableData: true,
      tableDataFields: [
        "frbr_creatorOf-work",
        "mail_recipientOf-work",
        "dcterms_isReferencedBy-work",
      ],
      renderer: new emlo.ProfileRightRenderer({
        profileType: "people",
      }),
    }),

    new emlo.MultiFields({
      id: "people-footer",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "footer",
        footerType: "p",
        isDivider: false,
      }),
    }),
  ];
}
