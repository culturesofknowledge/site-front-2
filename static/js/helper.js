export function searchQueryObj() {
    // Fetching URL params
  const queryString = window.location.search
  
  if(queryString) {
    const params = new URLSearchParams(queryString)
   
    let openingQuery = {
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
      openingQuery.queryStrings.push({
        queryString: people,
        fields: [
            { field: "person-author", operator: "OR" },
            { field: "person-recipient", operator: "OR" },
            { field: "person-mentioned", operator: "OR" },
        ]
      })
    }
    
    if(fromDate && toDate) {
      if (!openingQuery.query.range) {
        openingQuery.query.range = {}; 
      }

      openingQuery.query.range["ox_started-ox_year"] = {
        "gte": fromDate,
        "lte": toDate
      }
    }

    if(locations) {
      openingQuery.queryStrings.push({
        queryString: locations,
        fields: [
            { field: "location-origin", operator: "OR" },
            { field: "location-destination", operator: "OR" },
            { field: "location-mentioned", operator: "OR" },
        ]
      })
    }

    if(content) {
      openingQuery.queryStrings.push({
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
    
    return openingQuery
  } else {
    return null
  }
}