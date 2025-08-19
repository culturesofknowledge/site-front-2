export function getWorkComponents(emlo) {
  return [
    new emlo.MultiFields({
      id: "work-profile-side",
      category: "sidebar",
      fetchImageData: true,
      manifestationField: "manifestations",
      renderer: new emlo.ProfileLeftSideRenderer({
        profileType: "work",
      }),
    }),

    new emlo.MultiFields({
      id: "page-title",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "heading",
        isSide: true,
        field: "dcterms_description",
      }),
    }),

    new emlo.MultiFields({
      id: "work-profile",
      category: "results",
      fetchImageData: true,
      manifestationField: "frbr_Manifestation-manifestation",
      renderer: new emlo.ProfileRightRenderer({
        profileType: "work",
      }),
    }),

    // FIXME: This is an hotfix for rendering repos.
    // new emlo.MultiFields({
    //   id: "repo",
    //   category: "results",
    //   fetchSecondaryData: true,
    //   primaryField: "frbr_Manifestation-manifestation",
    //   renderer: new emlo.MultiFieldsRenderer({
    //     // type: "repo-version",
    //     primaryField: "frbr_Manifestation-manifestation",
    //   }),
    // }),

    new emlo.MultiFields({
      id: "work-footer",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "footer",
        footerType: "w",
      }),
    }),
  ];
}
