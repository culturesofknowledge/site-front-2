export function _addUrlParam(field, term) {
  let url_param_field = field;
  const url = new URL(window.location.href);

  if (
    ["frbr_creator-person", "mail_recipient-person"].includes(field) &&
    term.startsWith("http")
  ) {
    let UUID = term.startsWith('"')
      ? term.slice(1, -1).split("/").pop()
      : term.split("/").pop();

    term = UUID;
  }

  const fieldMap = {
    author_sort: "aut",
    recipient_sort: "rec",
  };

  if (fieldMap.hasOwnProperty(field)) {
    if (url.searchParams.has(fieldMap[field])) {
      url_param_field = field;
    } else {
      url_param_field = fieldMap[field];
    }
  }

  const currentValue = url.searchParams.get(url_param_field);
  if (currentValue !== term) {
    url.searchParams.set(url_param_field, term); // Update or add the parameter
    window.history.replaceState(null, "", url); // Update the browser URL without reloading
  }
}

export function _removeUrlParam(field) {
  let delete_field = "";
  let secondaryField = "";

  const fieldMap = {
    "person-author": {
      primary: "aut",
      secondary: "author_sort",
    },
    "person-recipient": {
      primary: "rec",
      secondary: "recipient_sort",
    },
  };

  if (field == "uuid_related") {
    delete_field = "uuids";
  }

  if (field == "Contents") {
    delete_field = "let_con";
  }

  if (field == "Locations") {
    delete_field = "locations";
  }

  if (field == "default_search_field") {
    delete_field = "everything";
  }

  const validFields = [
    "dcterms_references-location",
    "mail_destination-location",
    "mail_origin-location",
    "frbr_creator-person",
    "mail_recipient-person",
    "dcterms_references-person",
  ];

  if (validFields.includes(field)) {
    delete_field = field;
  }

  if (fieldMap.hasOwnProperty(field)) {
    delete_field = fieldMap[field].primary;
    secondaryField = fieldMap[field].secondary;
  }

  if (delete_field == "") {
    delete_field = field;
  }

  const url = new URL(window.location.href);

  if (url.searchParams.has(delete_field)) {
    url.searchParams.delete(delete_field); // Remove the parameter
    window.history.replaceState(null, "", url); // Update the browser URL without reloading

    if (secondaryField && url.searchParams.has(secondaryField)) {
      const currentValue = url.searchParams.get(secondaryField);

      url.searchParams.delete(secondaryField);
      url.searchParams.set(delete_field, currentValue); // Update or add the parameter
      window.history.replaceState(null, "", url); // Update the browser URL without reloading
    }
  }
}
