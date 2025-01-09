import emlo from "./edges.js";

try {
  emlo.selector = "home-stats";
  emlo.collection = "/solr/all/select";
  emlo.template = new emlo.HomeStatsTemplate();
  emlo.components = [
    new emlo.Stats({
      id: "people",
      category: "stats",
      solrCore: "people",
      renderer: new emlo.StatsRenderer({
        title: "People",
        titleImage: "/static/img/icon-stats-people.png",
        redirectURL: "/browse/people",
      }),
    }),

    new emlo.Stats({
      id: "locations",
      category: "stats",
      solrCore: "locations",
      renderer: new emlo.StatsRenderer({
        title: "Location",
        titleImage: "/static/img/icon-stats-locations.png",
        redirectURL: "/browse/locations",
      }),
    }),

    new emlo.Stats({
      id: "organisations",
      category: "stats",
      solrCore: "all",
      facetField: "ox_isOrganisation",
      renderer: new emlo.StatsRenderer({
        title: "Organisations",
        titleImage: "/static/img/icon-stats-organisations.png",
        redirectURL: "/browse/organisations",
      }),
    }),

    new emlo.Stats({
      id: "repositories",
      category: "stats",
      solrCore: "institutions",
      renderer: new emlo.StatsRenderer({
        title: "Repositories",
        titleImage: "/static/img/icon-stats-repositories.png",
        redirectURL: "/browse/institutions",
      }),
    }),

    new emlo.Stats({
      id: "catalogues",
      category: "stats",
      solrCore: "all",
      facetField: "cito_Catalog",
      renderer: new emlo.StatsRenderer({
        title: "Catalogues",
        titleImage: "/static/img/icon-stats-Catalogues.png",
        redirectURL:
          "http://emlo-portal.bodleian.ox.ac.uk/collections/?page_id=480",
      }),
    }),

    new emlo.Stats({
      id: "works",
      category: "stats",
      solrCore: "works",
      renderer: new emlo.StatsRenderer({
        title: "Letters",
        titleImage: "/static/img/icon-stats-works.png",
      }),
    }),

    new emlo.Stats({
      id: "manifestations",
      category: "stats",
      solrCore: "manifestations",
      renderer: new emlo.StatsRenderer({
        title: "Versions",
        titleImage: "/static/img/icon-stats-manifestations.png",
      }),
    }),

    new emlo.Stats({
      id: "images",
      category: "stats",
      solrCore: "images",
      renderer: new emlo.StatsRenderer({
        title: "Images",
        titleImage: "/static/img/icon-stats-images.png",
      }),
    }),

    new emlo.Stats({
      id: "comments",
      category: "stats",
      solrCore: "comments",
      renderer: new emlo.StatsRenderer({
        title: "Comments",
        titleImage: "/static/img/icon-stats-comments.png",
      }),
    }),

    new emlo.Stats({
      id: "resources",
      category: "stats",
      solrCore: "resources",
      renderer: new emlo.StatsRenderer({
        title: "Resources",
        titleImage: "/static/img/icon-stats-related%20resources.png",
      }),
    }),
  ];

  emlo.init();
} catch (error) {
  console.error(error.message);
}
