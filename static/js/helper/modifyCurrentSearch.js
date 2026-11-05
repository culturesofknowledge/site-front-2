export async function modifyCurrentSearch() {
  try {
    const currentParams = new URLSearchParams(window.location.search);

    const mapping = {
      "frbr_creator-person": "aut",
      "mail_recipient-person": "rec",
      origin_sort: "pla_ori_name",
      destination_sort: "pla_des_name",
      "ox_started-ox_year": "dat_sin_year",
      "mail_origin-location": "pla_ori_name",
      "mail_destination-location": "pla_des_name",
      "dcterms_references-location": "pla_ment_name",
    };

    // uuid params that must be resolved to a name, and the core to resolve them from
    const apiKeyCollections = {
      "frbr_creator-person": "people",
      "mail_recipient-person": "people",
      "mail_origin-location": "location",
      "mail_destination-location": "location",
      "dcterms_references-location": "location",
    };
    const apiKeys = Object.keys(apiKeyCollections);
    const uuidsMap = {}; // { key: [uuid1, uuid2] }
    const newParams = new URLSearchParams();

    // Step 1: Collect UUIDs for API keys
    for (const [key, value] of currentParams.entries()) {
      if (apiKeys.includes(key)) {
        if (!uuidsMap[key]) uuidsMap[key] = [];
        uuidsMap[key].push(value);
      }
    }

    // Step 2: Call _fetchNamesNew once per collection
    const uuidsByCollection = {};
    for (const [key, uuids] of Object.entries(uuidsMap)) {
      const collection = apiKeyCollections[key];
      uuidsByCollection[collection] = (uuidsByCollection[collection] || []).concat(uuids);
    }
    const resolvedValues = (
      await Promise.all(
        Object.entries(uuidsByCollection).map(([collection, uuids]) =>
          _fetchNamesNew(uuids, collection)
        )
      )
    ).flat();
    const uuidToNameMap = {};

    // Step 3: Create a quick lookup map from UUID to resolved name
    resolvedValues.forEach((entry) => {
      uuidToNameMap[entry.uuid] = entry.browse || entry.uuid;
    });

    // Step 4: Build new URLSearchParams
    for (const [key, value] of currentParams.entries()) {
      if (mapping.hasOwnProperty(key)) {
        const newKey = mapping[key];

        if (apiKeys.includes(key)) {
          const resolvedValue = uuidToNameMap[value] || value;
          newParams.set(newKey, resolvedValue);
        } else {
          newParams.set(newKey, value);
        }
      } else {
        // Not mapped, keep as-is
        newParams.set(key, value);
      }
    }

    // Step 5: Redirect
    const advanceSearchUrl =
      `${window.location.origin}/advanced` +
      (newParams.toString() ? `?${newParams.toString()}` : "");
    window.location.href = advanceSearchUrl;
  } catch (err) {
    console.error(`Unexpected error during redirect: ${err}`);
    alert("Unable to redirect you to modify your search.");
  }
}

async function _fetchNamesNew(uuids, collectionName) {
  if (collectionName == "") {
    return [];
  }

  let payload = {};
  if (uuids.length > 0) {
    payload = {
      solrCore: collectionName,
      uuids: uuids,
      filter: "browse,uuid",
      objectKey: "uuid",
    };
  } else {
    return [];
  }

  try {
    const response = await fetch(`/stats-new`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`Error fetching names: ${response.statusText}`);
      return [];
    }

    const json = await response.json();
    return json;
  } catch (err) {
    console.error("Error while fetching names", err);
    return [];
  }
}
