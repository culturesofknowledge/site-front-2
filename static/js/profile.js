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
      id: "page-title",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "heading",
        field: "browse",
        divider: true,
      }),
    }),

    new emlo.MultiFields({
      id: "details",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "content",
        sectionTitle: "Details",
        sectionTitleImage: "/static/img/icon-people.png",
        contentTitle: "Alternative names",
        field: "skos_altLabel",
      }),
    }),

    new emlo.MultiFields({
      id: "dates",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "dates",
        sectionTitle: "Dates",
        sectionTitleImage: "/static/img/icon-calendar.png",
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
      id: "letters-recevied",
      category: "results",
      fetchSecondaryData: true,
      primaryField: "mail_recipientOf-work",
      renderer: new emlo.MultiFieldsRenderer({
        type: "nested",
        sectionTitle: "Letters",
        sectionTitleImage: "/static/img/icon-calendar.png",
        primaryField: "mail_recipientOf-work",
        fields: [
          { title: "", key: "ox_started-ox_year" },
          { title: "", key: "dcterms_description", clickable: true },
        ],
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
        sectionTitle: "Catalogue Statistics",
        sectionTitleImage: "/static/img/icon-statistics.png",
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
        field: "ox_locationAlternateName",
      }),
    }),

    new emlo.MultiFields({
      id: "position",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "content",
        sectionTitle: "Position",
        sectionTitleImage: "/static/img/icon-globe.png",
        field: "ox_locationAlternateName",
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
      id: "alternative-names",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "text",
        sectionTitle: "Alternative names",
        sectionTitleImage: "/static/img/icon-repository.png",
        field: "geonames_alternateName",
      }),
    }),

    new emlo.MultiFields({
      id: "locations",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "label",
        sectionTitle: "Location",
        sectionTitleImage: "/static/img/icon-globe.png",
        fields: [
          { title: "City", key: "geonames_locatedIn" },
          { title: "Country", key: "geonames_inCountry" },
        ],
      }),
    }),
  ];
}

function _getWorkComponents(emlo) {
  return [];
}
