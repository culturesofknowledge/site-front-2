import emlo from "./edges.js";

try {

  // Fetching URL params
  const queryString = window.location.search

  if(queryString) {
    const params = new URLSearchParams(queryString)
   
    emlo.openingQuery = {
      must: [],
      query : {},
      queryStrings : []
    }

    const people = params.get("people")
    const fromDate = params.get("dat_from_year")
    const toDate = params.get("dat_to_year")
    const locations = params.get("locations")
    const content = params.get("let_con")

    if(people) {
      emlo.openingQuery.queryStrings.push({
        queryString: people,
        fields: [
            { field: "person-author", operator: "OR" },
            { field: "person-recipient", operator: "OR" },
            { field: "person-mentioned", operator: "OR" },
        ]
      })
    }
    
    if(fromDate && toDate) {
      if (!emlo.openingQuery.query.range) {
        emlo.openingQuery.query.range = {}; 
      }

      emlo.openingQuery.query.range["ox_started-ox_year"] = {
        "gte": fromDate,
        "lte": toDate
      }
    }

    if(locations) {
      emlo.openingQuery.queryStrings.push({
        queryString: locations,
        fields: [
            { field: "location-origin", operator: "OR" },
            { field: "location-destination", operator: "OR" },
            { field: "location-mentioned", operator: "OR" },
        ]
      })
    }

    if(content) {
      emlo.openingQuery.queryStrings.push({
        queryString: content,
        fields: [
            { field: "dcterms_abstract", operator: "OR" },
            { field: "ox_keywords", operator: "OR" },
            { field: "ox_incipit", operator: "OR" },
            { field: "ox_excipit", operator: "OR" },
            { field: "mail_postScript", operator: "OR" },
        ]
      })
    }
    
  }

  emlo.selector = "emlo-results";
  emlo.collection = "/solr/works/select";

  emlo.components = [
    new edges.components.Pager({
      id: "top-pager",
      category: "top-pager",
      renderer: new edges.renderers.bs3.Pager({
        scrollSelector: "#results",
        showSizeSelector: false,
        showRecordCount: false,
        showChevrons: true,
      })
    }),

    new edges.components.Pager({
      id: "bottom-pager",
      category: "bottom-pager",
      renderer: new edges.renderers.bs3.Pager({
        scrollSelector: "#results",
        showSizeSelector: false,
        showRecordCount: false,
        showChevrons: true,
      })
    }),

    new emlo.ResultTable({
      id: "results",
      category: "results",
      secondaryResults: false,
      infiniteScroll: true,
      size : 20,
      infiniteScrollPageSize: 50,
      renderer: new emlo.ResultTableRenderer({
        noResultsText: "No results to display",
        serialHeader: "",
        tableDisplay: [
          {
            header: "",
            field: "resources",
            pre: '',
            post: '',
            type: 'link',
            linkText : 'Letter',
            valueFunction: null,
          },
          {
            header: "Date",
            field: "started_date_sort",
            pre: '',
            post: '',
            type : 'date',
            valueFunction: null,
          },
          {
            header: "Author",
            field: "author_sort",
            pre: "",
            post: "",
            valueFunction: null,
          },
          {
            header: "Origin",
            field: "origin_sort",
            pre: "",
            post: "",
            valueFunction: null,
          },
          {
            header: "Addressee",
            field: "recipient_sort",
            pre: "",
            post: "",
            valueFunction: null,
          },
          {
            header: "Destination",
            field: "pla_des_name",
            pre: "",
            post: "",
            valueFunction: null,
          },
          {
            header: "Repositories & Versions",
            field: "",
            pre: "",
            post: "",
            valueFunction: null,
          },
        ],
        arrayValueJoin: ", ",
        omitFieldIfEmpty: true,
      }),
    }),
  ];

  emlo.init();
} catch (error) {
  console.error(error.message);
}

function generateResultHeader(selector){
  let currentDoc = document.getElementById("result-header")

  if(emlo && emlo.active && emlo.active[selector]){
    const activeRes = emlo.active[selector]

    if(activeRes.result && activeRes.result.data && activeRes.result.data.response && activeRes.result.data.response.numFound) {
      if(activeRes.result.data.response.numFound > 50) {
        currentDoc.innerHTML = `${activeRes.result.data.response.numFound} results (50 result per page)`
        return
      } else {
        currentDoc.innerHTML = `${activeRes.result.data.response.numFound} results`
        return
      }
    }
  }
  currentDoc.innerHTML = ""
}

window.onload = () => {
  generateResultHeader("emlo-results")
}
