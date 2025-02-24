import emlo from "./edges.js";

console.log("catalouge_count", catalouge_count);

try {
  emlo.selector = "home-stats";
  emlo.collection = "/solr/all/select";
  emlo.template = new emlo.HomeStatsTemplate();
  emlo.components = [
    new emlo.Stats({
      id: "stats",
      category: "stats",
      statsFields: [
        "person",
        "location",
        "organizations",
        "institution",
        "cito_Catalog",
        "work",
        "manifestation",
        "image",
        "comment",
        "resource",
      ],
      facetFields: [
        { field: "ox_isOrganisation" },
        { field: "object_type" },
        { field: "cito_Catalog" },
      ],
      renderer: new emlo.StatsRenderer({
        statsEntries: [
          {
            title: "People",
            titleImage: "/static/img/icon-stats-people.png",
            redirectURL: "/browse/people",
            statKey: "person",
            tweakCount: 0,
            upperLimit: 0,
          },
          {
            title: "Locations",
            titleImage: "/static/img/icon-stats-locations.png",
            redirectURL: "/browse/locations",
            statKey: "location",
            tweakCount: 0,
            upperLimit: 0,
          },
          {
            title: "Organizations",
            titleImage: "/static/img/icon-stats-organisations.png",
            redirectURL: "/browse/organisations",
            statKey: "organizations",
            tweakCount: 0,
            upperLimit: 0,
          },
          {
            title: "Repositories",
            titleImage: "/static/img/icon-stats-repositories.png",
            redirectURL: "/browse/institutions",
            statKey: "institution",
            tweakCount: 0,
            upperLimit: 0,
          },

          {
            title: "Catalogues",
            titleImage: "/static/img/icon-stats-Catalogues.png",
            redirectURL:
              "http://emlo-portal.bodleian.ox.ac.uk/collections/?page_id=480",
            statKey: "cito_Catalog",
            dontFetch: true,
            hardCodedCount: catalouge_count,
            tweakCount: 0,
            upperLimit: 0,
          },
          {
            title: "Letters",
            titleImage: "/static/img/icon-stats-works.png",
            redirectURL: "",
            statKey: "work",
            tweakCount: 0,
            upperLimit: 0,
          },
          {
            title: "Versions",
            titleImage: "/static/img/icon-stats-manifestations.png",
            redirectURL: "",
            statKey: "manifestation",
            tweakCount: 0,
            upperLimit: 0,
          },
          {
            title: "Images",
            titleImage: "/static/img/icon-stats-images.png",
            redirectURL: "",
            statKey: "image",
            tweakCount: 0,
            upperLimit: image_limit,
          },
          {
            title: "Comments",
            titleImage: "/static/img/icon-stats-comments.png",
            redirectURL: "",
            statKey: "comment",
            tweakCount: 0,
            upperLimit: 0,
          },
          {
            title: "Resources",
            titleImage: "/static/img/icon-stats-related%20resources.png",
            redirectURL: "",
            statKey: "resource",
            tweakCount: 0,
            upperLimit: 0,
          },
        ],
      }),
    }),
  ];

  emlo.init();
} catch (error) {
  console.error(error.message);
}
