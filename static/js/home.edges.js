var emlo = {};
emlo.active = {};

emlo.init = function (params) {
	const selector = params.selector;
	const index = params.index;

	emlo.active[selector] = new edges.Edge({
		selector: selector,
		template: new edges.templates.bs3.Facetview(),
		queryAdapter: new edges.es.SolrQueryAdapter(),
		searchUrl: `${index}/solr/works/select`,
		components: [
			new edges.components.FullSearchController({
				id: "search-controller",
				category: "controller",
				defaultOperator: "AND",
				defaultField: "author_sort",
				// fuzzify: "*",
				renderer: new edges.renderers.bs3.FullSearchController({
					freetextSubmitDelay: 1000,
					searchButton: true,
					searchPlaceholder: "Search for anything",
					clearButton: false,
					searchButtonText: "Search"
				})
			}),
			new edges.components.ResultsDisplay({
				id: "results",
				category: "results",
				renderer: new edges.renderers.bs3.ResultsFieldsByRow({
					rowDisplay: [
						[{ field: "cito_Catalog" }],
						[
							{
								pre: "<strong>Editor Group</strong>: ",
								field: "author_sort",
							},
						],
					],
				}),
			}),
		],
	});
};
