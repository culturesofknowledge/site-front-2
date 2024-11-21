const validCollections = ["people", "locations", "works"];

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
      id: "page-title",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "heading",
        field: "foaf_name",
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
      id: "display",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        sectionTitle: "Catalogue Statistics",
        sectionTitleImage: "/static/img/icon-statistics.png",
        field: "ox_isOrganisation",
      }),
    }),
  ];
}

function _getLocationComponents(emlo) {
  return [];
}

function _getWorkComponents(emlo) {
  return [];
}
