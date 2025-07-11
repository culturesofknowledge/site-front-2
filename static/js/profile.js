import { getLocationComponents } from "../js/profile/location.js";
import { getPeopleComponents } from "../js/profile/people.js";
import { getWorkComponents } from "../js/profile/work.js";

const validCollections = [
  "people",
  "locations",
  "works",
  "institutions",
  "manifestations",
  "images",
  "resources",
  "comments",
];

export function getComponents(collectionName, emlo) {
  console.log("collectionName", collectionName);
  try {
    let components = [];

    if (validCollections.includes(collectionName)) {
      switch (collectionName) {
        case "people":
          components = getPeopleComponents(emlo);
          break;
        case "locations":
          components = getLocationComponents(emlo);
          break;
        case "institutions":
          components = _getInstitutionComponents(emlo);
          break;
        case "manifestations":
          components = _getManifestation(emlo);
          break;
        case "images":
          components = _getImageComponents(emlo);
          break;
        case "resources":
          components = _getResourcesComponents(emlo);
          break;
        case "comments":
          components = _getCommentsComponents(emlo);
          break;
        default:
          components = getWorkComponents(emlo);
      }
      return components;
    } else {
      return components;
    }
  } catch (err) {
    console.error(err);
  }
}

function _getInstitutionComponents(emlo) {
  return [
    new emlo.MultiFields({
      id: "institution-profile-side",
      category: "sidebar",
      renderer: new emlo.ProfileLeftSideRenderer({
        profileType: "institution",
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
      id: "inst-profile",
      category: "results",
      fetchTableData: true,
      tableDataFields: ["ox_hasResource-manifestation"],
      renderer: new emlo.ProfileRightRenderer({
        profileType: "institution",
      }),
    }),

    new emlo.MultiFields({
      id: "inst-footer",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "footer",
        footerType: "r",
      }),
    }),
  ];
}

function _getManifestation(emlo) {
  return [
    new emlo.MultiFields({
      id: "mani-profile-side",
      category: "sidebar",
      renderer: new emlo.ProfileLeftSideRenderer({
        profileType: "manifestation",
      }),
    }),

    new emlo.MultiFields({
      id: "page-title",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "heading",
        isSide: true,
      }),
    }),

    new emlo.MultiFields({
      id: "manifestation-profile",
      category: "results",
      renderer: new emlo.ProfileRightRenderer({
        profileType: "manifestation",
      }),
    }),

    new emlo.MultiFields({
      id: "mani-footer",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "footer",
        footerType: "m",
      }),
    }),
  ];
}

function _getImageComponents(emlo) {
  return [
    new emlo.MultiFields({
      id: "title",
      category: "sidebarTitle",
      renderer: new emlo.MultiFieldsRenderer({
        type: "side-title",
        contentTitle: "Image",
        isSide: true,
        contentTitleImage: "/static/img/images-icon.png",
      }),
    }),

    new emlo.MultiFields({
      id: "image-profile-side",
      category: "sidebar",
      fetchImageData: true,
      manifestationField: "frbr_Manifestation-manifestation",
      renderer: new emlo.ProfileLeftSideRenderer({
        profileType: "image",
      }),
    }),

    new emlo.MultiFields({
      id: "page-title",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "heading",
        isSide: true,
        field: "frbr_Work-work",
      }),
    }),

    new emlo.MultiFields({
      id: "image-profile",
      category: "results",
      fetchImageData: true,
      manifestationField: "frbr_Manifestation-manifestation",
      renderer: new emlo.ProfileRightRenderer({
        profileType: "image",
      }),
    }),

    new emlo.MultiFields({
      id: "image-footer",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "footer",
        footerType: "i",
      }),
    }),
  ];
}

function _getCommentsComponents(emlo) {
  return [
    new emlo.MultiFields({
      id: "title",
      category: "sidebarTitle",
      renderer: new emlo.MultiFieldsRenderer({
        type: "side-title",
        contentTitle: "Comment",
        isSide: true,
        contentTitleImage: "/static/img/resources-icon.png",
      }),
    }),

    new emlo.MultiFields({
      id: "page-title",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "heading",
        isSide: true,
        field: "bibo_Note",
      }),
    }),

    new emlo.MultiFields({
      id: "enclosed-in-side",
      category: "sidebar",
      renderer: new emlo.MultiFieldsRenderer({
        type: "shortUrl",
        isSide: true,
        footerType: "c",
      }),
    }),

    // new emlo.MultiFields({
    //   id: "para",
    //   category: "results",
    //   renderer: new emlo.MultiFieldsRenderer({
    //     type: "dummy-message",
    //     divider: true,
    //     message:
    //       "Sorry, this record has not been found. It may have been deleted as a duplicate. ",
    //   }),
    // }),

    new emlo.MultiFields({
      id: "comment-profile",
      category: "results",
      renderer: new emlo.ProfileRightRenderer({
        profileType: "comment",
      }),
    }),

    new emlo.MultiFields({
      id: "comment-footer",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "footer",
        footerType: "c",
      }),
    }),
  ];
}

function _getResourcesComponents(emlo) {
  return [
    new emlo.MultiFields({
      id: "title",
      category: "sidebarTitle",
      renderer: new emlo.MultiFieldsRenderer({
        type: "side-title",
        contentTitle: "Related resource",
        isSide: true,
        contentTitleImage: "/static/img/resources-icon.png",
      }),
    }),

    new emlo.MultiFields({
      id: "page-title",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "heading",
        isSide: true,
        field: "ox_titleOfResource",
      }),
    }),

    new emlo.MultiFields({
      id: "enclosed-in-side",
      category: "sidebar",
      renderer: new emlo.MultiFieldsRenderer({
        type: "shortUrl",
        isSide: true,
        footerType: "re",
      }),
    }),

    new emlo.MultiFields({
      id: "para",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "dummy-message",
        divider: true,
        message:
          "Sorry, this record has not been found. It may have been deleted as a duplicate. ",
      }),
    }),

    new emlo.MultiFields({
      id: "resource-footer",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "footer",
        footerType: "re",
      }),
    }),
  ];
}
