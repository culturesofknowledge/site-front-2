import emlo from "/static/js/edges.js";
import { _removeUrlParam } from "../../helper/urlparams.js";
import {searchQueryObj} from "/static/js/search.js"

emlo.Facet = class extends edges.components.RefiningANDTermSelector {
  constructor(params) {
    super(params);
    this.fetchedAllFacets = false;
  }

  synchronise() {
    // reset the state of the internal variables
    if (this.lifecycle === "update") {
      // if we are in the "update" lifecycle, then reset and read all the values
      this.values = [];
      if (this.edge.result) {
        this._readValues({ result: this.edge.result });
      }
    } else if (this.lifecycle === "static" && this.syncCounts) {
      if (this.edge.result) {
        this._syncCounts({ result: this.edge.result });
      }
    }
    this.filters = [];
    let keys = []; // to keep the url in sync

    // Object containing the field mappings (example)
    const fieldMapping = {
      aut: "person-author",
      rec: "person-recipient",
      let_con: "Contents",
      locations: "Locations",
      everything: "Text",
      // Add more mappings as needed
    };

    // Extract all the filter values that pertain to this selector
    let filters = this.edge.currentQuery.listMust(
      new es.TermFilter({ field: this.field })
    );

    // Iterate through the existing filters
    for (let i = 0; i < filters.length; i++) {
      let val = filters[i].value;
      let translate_val = this._translate(val);
      let displayValue = val !== translate_val ? translate_val : val;

      if (!keys.includes(filters[i].field) && filters[i].field) {
        keys.push(filters[i].field);

        this.filters.push({
          display: displayValue,
          term: val,
          field: filters[i].field,
        });
      }
    }

    // Check if there are query parameters in the URL
    const urlParams = new URLSearchParams(window.location.search);

    // Loop through all URL query parameters
    for (const [key, value] of urlParams.entries()) {
      const notToBeAdded = [
        "start",
        "sort",
        "browsing",
        "uuids",
        "letter",
        "rec",
        "search_type",
        "filters",
      ];

      if (fieldMapping.hasOwnProperty(key) && !keys.includes(key)) {
        if (value) {
          keys.push(key);

          this.filters.push({
            display: value,
            term: value,
            field: fieldMapping[key],
          });
        }
      } else if (!keys.includes(key) && !notToBeAdded.includes(key)) {
        if (value) {
          keys.push(key);

          this.filters.push({
            display: value,
            term: value,
            field: key,
          });
        }
      }
    }
  }

  removeFilter(field, term) {
    let doc = document.getElementById("remove-message");
    if (doc) {
      doc.style.display = "block";
    }

    // --- EXECUTE FILTER REMOVAL ---
    let nq = this.edge.cloneQuery();

    if (field == "Text") {
      field = "default_search_field";
    }

    nq.removeMust(new es.TermFilter({ field: field, value: term }));

    nq.removeQueryStrings(new es.TermFilter({ field: field, value: term }));

    if (field == "default_search_field") {
      nq.removeQueryString();
    }

    _removeUrlParam(field);

    const query = searchQueryObj();

    if (query && (query.openingQuery != null || query.openingQuery != {})) {
      nq = this.syncObjects(nq, query.openingQuery);
    }

    nq.from = 0;
    this.edge.pushQuery(nq);
    this.edge.cycle();
  }

  deepEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  isEmpty(val) {
    if (val == null) return true; // null or undefined
    if (Array.isArray(val)) return val.length === 0;
    if (typeof val === "object") return Object.keys(val).length === 0;
    return false;
  }

  syncObjects(obj1, obj2) {
    const fields = ["must", "queryStrings", "queryString", "query"];

    fields.forEach((field) => {
      // Skip if obj2[field] is missing or empty
      if (this.isEmpty(obj2[field])) return;

      // If obj1[field] is empty or different, update it
      if (
        this.isEmpty(obj1[field]) ||
        !this.deepEqual(obj1[field], obj2[field])
      ) {
        obj1[field] = JSON.parse(JSON.stringify(obj2[field])); // deep copy
      }
    });

    return obj1;
  }
};
