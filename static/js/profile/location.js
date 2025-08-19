export function getLocationComponents(emlo) {
  return [
    new emlo.MultiFields({
      id: "location-profile-side",
      category: "sidebar",
      renderer: new emlo.ProfileLeftSideRenderer({
        profileType: "location",
      }),
    }),

    new emlo.MultiFields({
      id: "page-title",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "heading",
        isSide: true,
        field: "browse",
      }),
    }),

    new emlo.MultiFields({
      id: "location-profile",
      category: "results",
      fetchTableData: true,
      tableDataFields: [
        "mail_originOf-work",
        "mail_destinationOf-work",
        "dcterms_isReferencedBy-work",
      ],
      renderer: new emlo.ProfileRightRenderer({
        profileType: "location",
      }),
    }),

    new emlo.MultiFields({
      id: "location-footer",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "footer",
        footerType: "l",
      }),
    }),
  ];
}
