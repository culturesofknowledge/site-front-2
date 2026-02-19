const registry = {
  people: {
    profile: () =>
      import("../profile/peopleFrags.js").then((m) => m._renderPeopleProfile),
    sidebar: () =>
      import("../profile/peopleFrags.js").then((m) => m._renderPeopleSidebar),
  },

  work: {
    profile: () =>
      import("../profile/workFrag.js").then((m) => m._renderWorkProfile),
    sidebar: () =>
      import("../profile/workFrag.js").then((m) => m._renderWorkSidebar),
  },

  image: {
    profile: () =>
      import("../profile/imageFrag.js").then((m) => m._renderImageProfile),
    sidebar: () =>
      import("../profile/imageFrag.js").then((m) => m._renderImageSidebar),
  },

  location: {
    profile: () =>
      import("../profile/locationFrag.js").then(
        (m) => m._renderLocationProfile
      ),
    sidebar: () =>
      import("../profile/locationFrag.js").then(
        (m) => m._renderLocationSidebar
      ),
  },

  institution: {
    profile: () =>
      import("../profile/institutionFrag.js").then(
        (m) => m._renderInstitutionProfile
      ),
    sidebar: () =>
      import("../profile/institutionFrag.js").then(
        (m) => m._renderInstitutionSidebar
      ),
  },

  manifestation: {
    profile: () =>
      import("../profile/manifestationFrag.js").then(
        (m) => m._renderManifestationSection
      ),
    sidebar: () =>
      import("../profile/manifestationFrag.js").then(
        (m) => m._renderManifestationSidebar
      ),
  },

  comment: {
    profile: () =>
      import("../profile/commentFrag.js").then((m) => m._renderCommentProfile),
  },
};

export async function loadFragment(profileType, variant = "profile") {
  const typeEntry = registry[profileType];

  if (!typeEntry) {
    throw new Error(`Unknown profileType: ${profileType}`);
  }

  const loader = typeEntry[variant];

  if (!loader) {
    throw new Error(
      `No fragment "${variant}" for profileType "${profileType}"`
    );
  }

  return loader();
}

export const PROFILE_DESCRIPTOR = {
  people: {
    title: "People",
    footerType: "p",
    icon: "/static/img/people_icon.png",

    fragments: {
      profile: "profile",
      sidebar: "sidebar",
    },
  },

  work: {
    title: "Letter",
    footerType: "w",
    icon: "/static/img/letter_icon.png",

    fragments: {
      profile: "profile",
      sidebar: "sidebar",
    },
  },

  location: {
    title: "Location",
    footerType: "l",
    icon: "/static/img/places-icon.png",

    fragments: {
      profile: "profile",
      sidebar: "sidebar",
    },
  },

  image: {
    title: "Image",
    footerType: "i",
    icon: "/static/img/images-icon.png",

    fragments: {
      profile: "profile",
      sidebar: "sidebar",
    },
  },

  institution: {
    title: "Repository",
    footerType: "r",
    icon: "/static/img/repository-icon.png",

    fragments: {
      profile: "profile",
      sidebar: "sidebar",
    },
  },

  comment: {
    title: "",
    footerType: "",
    icon: "",

    fragments: {
      profile: "profile",
    },
  },

  manifestation: {
    title: "Document",
    footerType: "m",
    icon: "/static/img/resources-icon.png",

    fragments: {
      section: "section",
      sidebar: "sidebar",
    },
  },
};
