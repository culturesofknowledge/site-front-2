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

    // TODO: Temp removal of graphs
    // new emlo.BarGraph({
    //   id: "graph",
    //   category: "results",
    //   fieldKeys: [
    //     "frbr_creatorOf-work",
    //     "mail_recipientOf-work",
    //     "dcterms_isReferencedBy-work",
    //   ],
    //   xAxisField: "ox_started-ox_year",
    //   renderer: new emlo.BarGraphRenderer({
    //     barColor: "#2E527E",
    //     graphConfig: {
    //       "frbr_creatorOf-work": {
    //         barColor: "#2E527E",
    //         graphTitle: "Letters written",
    //       },
    //       "mail_recipientOf-work": {
    //         barColor: "#5A7CA5",
    //         graphTitle: "Letters received",
    //       },
    //       "dcterms_isReferencedBy-work": {
    //         barColor: "#A7BFD6",
    //         graphTitle: "Letters mentioning",
    //       },
    //     },
    //   }),
    // }),

    new emlo.MultiFields({
      id: "people-footer",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "footer",
        footerType: "p",
      }),
    }),
  ];
}
