const additional = {
  work: {
    "Author as marked": "mail_authors-rdf_value",
    Year: "ox_started-ox_year",
  },

  manifestation: {
    Address: "mail_destination",
    Language: "dcterms_language",
    Shelfmark: "dcterms_identifier-shelf_",
  },

  person: {
    "Alternative names": "skos_altLabel",
    "Roles or titles": "ox_titlesRolesOccupations",
    "Year born": "bio_Birth-ox_year",
    "Year died": "bio_Death-ox_year",
  },

  location: {
    Latitude: "geo_lat",
    Longitude: "geo_long",
  },

  institution: {
    City: "geonames_locatedIn",
    Country: "geonames_inCountry",
  },

  resource: { Details: "ox_detailsOfResource" },

  comment: {},

  image: { Thumbnail: "foaf_thumbnail" },
};

export function getFieldsToDisplayInProfile(objectType, nested = true) {
  let fieldsToDisplay = [];

  if (objectType === "manifestation") {
    if (nested) {
      // Show brief details including work details. Avoid infinite recursion in nested mode.
      fieldsToDisplay = [
        "frbr_Work-work",
        "ox_resourceAt-institution",
        "dcterms_identifier-shelf_",
        "ox_printedEditionDetails",
      ];
    } else {
      // Full details excluding heading-redundant fields
      fieldsToDisplay = [
        "ox_resourceAt-institution",
        "dcterms_identifier-shelf_",
        "ox_printedEditionDetails",

        "ox_isAnnotatedBy-comment",

        "dcterms_created-ox_year", 
        "dcterms_created-ox_month",
        "dcterms_created-ox_day",
        "ox_dateAnnotate-comment",

        "mail_handwroteBy-person",
        "mail_destination",
        "ox_incipit",
        "ox_excipit",
        "mail_postageMark",
        "ox_endorsements",
        "mail_enclosedBy-manifestation",
        "mail_enclosureOf-manifestation",
        "ox_nonLetterEnclosures",
        "ox_accompaniments",
        "mail_seal",
        "mail_paper",
        "mail_paperSize",
        "bibo_numPages",
        "ox_numPageText",
        "dcterms_language",
        "ox_isTranslation",
        "ox_previouslyOwnedBy-person",
        "ox_opened",
        "ox_routing_mark_ms",
        "ox_routing_mark_stamp",
        "ox_handling_instructions",
        "ox_stored_folded",
        "ox_postage_costs_as_marked",
        "ox_postage_costs",
        "ox_non_delivery_reason",
        "ox_date_of_receipt_as_marked",
        "ox_manifestation_receipt_date_day",
        "ox_manifestation_receipt_date_month",
        "ox_manifestation_receipt_date_year",
        "ox_manifestation_receipt_calendar",
        "ox_manifestation_receipt_date",
        "ox_manifestation_receipt_date_gregorian",
        "ox_manifestation_receipt_date_inferred",
        "ox_manifestation_receipt_date_uncertain",
        "ox_manifestation_receipt_date_approx",
        "ox_dateReceiptAnnotate-comment",
      ];
    }
  }

  return fieldsToDisplay;
}

export function getAddtionalFields(objectType) {
  if (additional.hasOwnProperty(objectType)) {
    return additional[objectType];
  } else {
    return {};
  }
}
