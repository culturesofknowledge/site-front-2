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
      id: "title",
      category: "sidebarTitle",
      renderer: new emlo.MultiFieldsRenderer({
        type: "side-title",
        contentTitle: "Document",
        isSide: true,
        contentTitleImage: "/static/img/person-icon.png",
      }),
    }),

    new emlo.MultiFields({
      id: "enclosed-in-side",
      category: "sidebar",
      renderer: new emlo.MultiFieldsRenderer({
        type: "shortUrl",
        isSide: true,
        footerType: "m",
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
      id: "document-type",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "plain-text",
        sectionTitle: "Document type",
        sectionTitleImage: "/static/img/icon-quill.png",
        divider: true,
        field: "dcterms_type",
      }),
    }),

    new emlo.MultiFields({
      id: "shelfmark",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "plain-text",
        sectionTitle: "Shelfmark",
        sectionTitleImage: "/static/img/icon-related-resources.png",
        divider: true,
        field: "dcterms_identifier-shelf_",
      }),
    }),

    new emlo.MultiFields({
      id: "images",
      category: "results",
      fetchSecondaryData: true,
      primaryField: "frbr_Image-image",
      renderer: new emlo.MultiFieldsRenderer({
        type: "images",
        sectionTitle: "Images",
        sectionTitleImage: "/static/img/icon-related-resources.png",
        divider: true,
        primaryField: "frbr_Image-image",
        field: "dcterms_source",
      }),
    }),

    new emlo.MultiFields({
      id: "repos",
      category: "results",
      fetchSecondaryData: true,
      primaryField: "ox_resourceAt-institution",
      renderer: new emlo.MultiFieldsRenderer({
        type: "nested-label",
        sectionTitle: "Repository",
        sectionTitleImage: "/static/img/icon-repository.png",
        divider: true,
        primaryField: "ox_resourceAt-institution",
        fields: [
          {
            title: "",
            key: "browse",
            clickable: true,
            collectionName: "institution",
          },
        ],
      }),
    }),

    // TODO: Add works once we have data

    new emlo.MultiFields({
      id: "enclosed-in",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "links",
        sectionTitle: "Was enclosed in",
        sectionTitleImage: "/static/img/icon-quill.png",
        divider: true,
        contentTitle: "Letter",
        field: "mail_enclosureOf-manifestation",
      }),
    }),

    new emlo.MultiFields({
      id: "has-enclosed",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "links",
        sectionTitle: "Had enclosure",
        contentTitle: "Letter",
        sectionTitleImage: "/static/img/icon-quill.png",
        divider: true,
        field: "mail_enclosedBy-manifestation",
      }),
    }),

    new emlo.MultiFields({
      id: "non-letter-enclosures",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "text",
        sectionTitle: "Non-letter enclosures",
        divider: true,
        field: "ox_nonLetterEnclosures",
      }),
    }),

    new emlo.MultiFields({
      id: "address",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "plain-text",
        sectionTitle: "Address",
        divider: true,
        field: "mail_destination",
      }),
    }),

    new emlo.MultiFields({
      id: "seal",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "plain-text",
        sectionTitle: "Seal",
        divider: true,
        field: "mail_seal",
      }),
    }),

    new emlo.MultiFields({
      id: "postage-mark",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "plain-text",
        sectionTitle: "Postage mark",
        divider: true,
        field: "mail_postageMark",
      }),
    }),

    new emlo.MultiFields({
      id: "ox-endoursment",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "plain-text",
        sectionTitle: "Endorsements",
        divider: true,
        field: "ox_endorsements",
      }),
    }),

    new emlo.MultiFields({
      id: "paper-size",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "plain-text",
        sectionTitle: "Paper Size",
        divider: true,
        field: "mail_paperSize",
      }),
    }),

    new emlo.MultiFields({
      id: "mail-paper",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "plain-text",
        sectionTitle: "Paper type or watermark",
        divider: true,
        field: "mail_paper",
      }),
    }),

    new emlo.MultiFields({
      id: "num-pages",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "plain-text",
        sectionTitle: "Number of pages of document",
        divider: true,
        field: "bibo_numPages",
      }),
    }),

    new emlo.MultiFields({
      id: "num-pages-text",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "plain-text",
        sectionTitle: "Number of pages of text",
        divider: true,
        field: "ox_numPageText",
      }),
    }),

    new emlo.MultiFields({
      id: "dcterms_language",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "plain-text",
        sectionTitle: "Language",
        divider: true,
        field: "dcterms_language",
      }),
    }),

    new emlo.MultiFields({
      id: "ox_incipit",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "plain-text",
        sectionTitle: "Incipit",
        divider: true,
        field: "ox_incipit",
      }),
    }),

    new emlo.MultiFields({
      id: "ox_excipit",
      category: "results",
      renderer: new emlo.MultiFieldsRenderer({
        type: "plain-text",
        sectionTitle: "Explicit",
        divider: true,
        field: "ox_excipit",
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
