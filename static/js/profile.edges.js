import emlo from "./edges.js";
import { getComponents } from "./profile.js";

const collectionMap = {
  person: "people",
  location: "locations",
  work: "works",
  repository: "institutions",
  manifestation: "manifestations",
  image: "images",
  comment: "comments",
  resource: "resources",
};

try {
  let collectioName = "works"; // Setting default collectioName.
  let uuid = "";
  // Fetching collection name and ID
  let splittedPath = window.location.pathname.split("/");
  if (splittedPath.length <= 3) {
    console.error(
      `something is wrong with the URL, we where expecting the path lenght to be more than 3.`
    );
  }

  //  Setting collection name from the split path
  collectioName = collectionMap[splittedPath[2]];
  uuid = splittedPath[3];

  if (uuid == "") {
    console.error(`UUID is missing, unable to make any query`);
  }

  // Every profile page fetches everything it needs (primary record +
  // relations + whatever a collection's own components need on top —
  // images/manifestation-data or tableData) in this one combined call,
  // computed server-side, instead of the up-to-4 sequential client-side
  // round trips the edges query cycle would otherwise make.
  //
  // That combined fetch now runs *before* emlo.init(), which is what used
  // to synchronously draw the "Loading..." message the instant
  // `new edges.Edge(...)` was constructed (MultiFields defaults
  // `loading = true` and Edge.startup() draws every component once, before
  // any query even starts — see emlo.MultiFieldsRenderer.draw() /
  // edges.Edge.startup() in this file and libs/edges/src/edges.js). With
  // the fetch moved earlier, #profile-display was left blank for its whole
  // duration instead. Show the same message ourselves for that window so
  // the page doesn't look empty/stuck while it loads.
  const profileDisplay = document.getElementById("profile-display");
  if (profileDisplay) {
    profileDisplay.innerHTML = "<div class='loading-message'>Loading...</div>";
  }

  if (uuid) {
    try {
      const response = await fetch(`/profile-data/${splittedPath[2]}/${uuid}`);
      if (!response.ok) {
        throw new Error(`/profile-data/${splittedPath[2]}/${uuid} -> ${response.status}`);
      }
      const data = await response.json();

      if (data.primary) {
        emlo.queryAdapter = new emlo.PrefetchedQueryAdapter(data.primary);
        emlo.prefetchedExtras = {
          relations: data.relations || [],
          images: data.images || {},
          manifestationData: data.manifestationData || {},
          tableData: data.tableData || {},
        };
      }
      // data.primary missing (e.g. 404) falls through with queryAdapter/
      // prefetchedExtras left unset, so init() below takes the normal path
      // and the page still renders (as "not found") exactly as before.
    } catch (err) {
      // Fetch failed for any reason: leave queryAdapter/prefetchedExtras
      // unset so init() below falls back to the original per-request path.
      console.error("profile-data fetch failed, falling back:", err);
    }
  }

  //   Setting emlo object
  emlo.selector = "profile-display";
  emlo.template = new emlo.ProfileTemplate();
  emlo.collection = `/solr/${collectioName}/select`;

  emlo.openingQuery = {
    must: [
      {
        field: "uuid",
        value: uuid,
      },
    ],
  };

  emlo.components = await getComponents(collectioName, emlo);

  emlo.init();
} catch (err) {
  console.error(err);
}

// TODO: Complete tiny URL
function genrateShortURL(elementID) {
  let ele = document.getElementById(elementID);
}

window.onload = () => {
  // Call the function initially
  genrateShortURL("short-url-link");
};

$(document).ready(function () {
  // Attach a click event listener to the element with id 'specificId'
  $("#send-comment").on("click", function () {
    const currentPath = window.location.pathname;

    // Split the path by "/" and extract the last segment
    const pathSegments = currentPath.split("/");
    const id = pathSegments[pathSegments.length - 1]; // Assumes the ID is the last segment

    if (id) {
      // Redirect to a different page, e.g., '/new-page/{id}'
      window.location.href = `/comment/index?id=${id}`;
    } else {
      console.error("No ID found in the current URL path.");
    }
  });
});
