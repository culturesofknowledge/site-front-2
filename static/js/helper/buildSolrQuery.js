export function buildSolrQuery(config) {
  const {
    queryStrings = [],
    sort = [],
    size = 10,
    must = [],
    queryString = "",
    query = {},
  } = config;

  let queryParts = [];

  if (queryString) {
    queryParts.push(`${queryString.defaultField}:"${queryString.queryString}"`);
  }

  for (const q of queryStrings) {
    const subQueries = q.fields.map((f) => `${f.field}:(${q.queryString})`);
    const combined = subQueries.join(` ${q.fields[0].operator} `);
    queryParts.push(`(${combined})`);
  }

  for (const m of must) {
    const query = `${m.field}:${m.value}`;
    queryParts.push(query);
  }

  if (query && query.hasOwnProperty("range")) {
    const fields = Object.keys(query.range);
    const rangeQueries = fields.map((field) => {
      const range = query.range[field];
      return `${field}:[${range.gte || "*"} TO ${range.lte || "*"}]`;
    });

    if (rangeQueries) {
      queryParts.push(rangeQueries);
    }
  }

  // Combine all query parts using AND
  const qString = queryParts.length > 0 ? queryParts.join(" AND ") : "*:*";

  // 2. Handle `sort`
  const sortString = sort.map((s) => `${s.field} ${s.order}`).join(",");

  // 3. Handle `size`
  const rows = size;

  // Return full Solr query
  return qString;
}
