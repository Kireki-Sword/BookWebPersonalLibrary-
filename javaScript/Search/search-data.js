// search-data.js
// Supabase loading, database normalization, filtering,
// search ranking, sorting, and shared data helpers.

export const CONFIG =
  Object.freeze({
    SUPABASE_URL:
      "https://hsruxfpslxguhwnccwuj.supabase.co",

    SUPABASE_KEY:
      "sb_publishable_Z2upBCdemNtdB4j5jry65A_XD_u8BsD",

    TABLE_NAME:
      "manga",

    BUCKET_NAME:
      "img",

    COVER_FOLDER:
      "covers",

    DATABASE_BATCH_SIZE:
      1000,

    DATABASE_TIMEOUT_MS:
      15000,

    SEARCH_DEBOUNCE_MS:
      220,

    MAX_SEARCH_SUGGESTIONS:
      6,

    MAX_LOADING_SKELETONS:
      15,

    COLLAPSED_GENRE_LIMIT:
      10,

    DEFAULT_PER_PAGE:
      15,

    ALLOWED_PER_PAGE: [
      15,
      30,
      45
    ],

    ALLOWED_SORT_OPTIONS:
      new Set([
        "relevance",
        "score-desc",
        "score-asc",
        "title-asc",
        "title-desc"
      ]),

    PREFERRED_TYPE_ORDER: [
      "manga",
      "anime",
      "light-novel",
      "visual-novel",
      "novel",
      "book",
      "film",
      "movie",
      "tv",
      "television",
      "game"
    ]
  });


/* =========================================================
   INITIAL STATE
   ========================================================= */

export function createInitialState() {
  return {
    query:
      "",

    selectedTypes:
      new Set(),

    selectedGenres:
      new Set(),

    minimumScore:
      0,

    sort:
      "relevance",

    page:
      1,

    perPage:
      CONFIG.DEFAULT_PER_PAGE,

    showAllGenres:
      false
  };
}


/* =========================================================
   DATABASE LOADING
   ========================================================= */

export async function loadCatalogue(
  supabaseClient
) {
  const rows =
    [];

  let from =
    0;

  while (true) {
    const to =
      from +
      CONFIG.DATABASE_BATCH_SIZE -
      1;

    const {
      data,
      error
    } = await supabaseClient
      .from(
        CONFIG.TABLE_NAME
      )
      .select("*")
      .range(
        from,
        to
      );

    if (error) {
      throw new Error(
        `Supabase ${
          error.code ||
          "error"
        }: ${error.message}`
      );
    }

    const databasePage =
      Array.isArray(data)
        ? data
        : [];

    rows.push(
      ...databasePage
    );

    if (
      databasePage.length <
      CONFIG.DATABASE_BATCH_SIZE
    ) {
      break;
    }

    from +=
      CONFIG.DATABASE_BATCH_SIZE;
  }

  const normalized =
    normalizeCatalogue(
      rows,
      supabaseClient
    );

  console.log(
    `INKWELL SEARCH: received ${rows.length} rows ` +
    `and normalized ${normalized.length} stories.`
  );

  return normalized;
}


/* =========================================================
   CATALOGUE NORMALIZATION
   ========================================================= */

export function normalizeCatalogue(
  rows,
  supabaseClient
) {
  const uniqueItems =
    new Map();

  rows.forEach((row) => {
    if (
      !row ||
      row.id == null ||
      !String(
        row.title ||
        ""
      ).trim()
    ) {
      return;
    }

    const item =
      normalizeStory(
        row,
        supabaseClient
      );

    uniqueItems.set(
      item.id,
      item
    );
  });

  return [
    ...uniqueItems.values()
  ];
}


export function normalizeStory(
  row,
  supabaseClient
) {
  const title =
    String(
      row.title ||
      ""
    ).trim();

  const alternativeTitles =
    normalizeValueList(
      row.alternativeTitles
    );

  const creator =
    String(
      row.creator ??
      row.author ??
      row.writer ??
      row.artist ??
      ""
    ).trim();

  const types =
    normalizeFacetList(
      row.type,
      "Manga"
    );

  const genres =
    normalizeFacetList(
      row.genres
    );

  const tags =
    normalizeFacetList(
      row.tags
    );

  const score =
    getNumericScore(
      row.heroScore ??
      row.hero_score ??
      row.score ??
      row.rating
    );

  const description =
    String(
      row.description ||
      ""
    ).trim();

  const searchText =
    normalizeSearchText(
      [
        title,
        ...alternativeTitles,
        creator,

        ...types.map((item) => {
          return item.label;
        }),

        ...genres.map((item) => {
          return item.label;
        }),

        ...tags.map((item) => {
          return item.label;
        })
      ].join(" ")
    );

  return {
    id:
      String(
        row.id
      ),

    title,

    titleSearch:
      normalizeSearchText(
        title
      ),

    alternativeTitles,

    alternativeTitleSearch:
      alternativeTitles.map(
        normalizeSearchText
      ),

    creator,

    creatorSearch:
      normalizeSearchText(
        creator
      ),

    types,

    genres,

    tags,

    score,

    featured:
      row.featured === true,

    description,

    coverUrl:
      getCoverUrlFromId(
        supabaseClient,
        row.id
      ),

    searchText,

    raw:
      row
  };
}


export function getCoverUrlFromId(
  supabaseClient,
  id
) {
  if (
    !supabaseClient ||
    id == null
  ) {
    return "";
  }

  const coverPath =
    `${CONFIG.COVER_FOLDER}/${id}.jpg`;

  const {
    data
  } = supabaseClient
    .storage
    .from(
      CONFIG.BUCKET_NAME
    )
    .getPublicUrl(
      coverPath
    );

  return (
    data?.publicUrl ||
    ""
  );
}


/* =========================================================
   JSONB AND VALUE NORMALIZATION
   ========================================================= */

export function normalizeValueList(value) {
  if (
    value == null ||
    value === ""
  ) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .flatMap(
        normalizeValueList
      )
      .map((entry) => {
        return String(entry).trim();
      })
      .filter(Boolean);
  }

  if (
    typeof value ===
    "object"
  ) {
    return Object
      .values(value)
      .flatMap(
        normalizeValueList
      )
      .map((entry) => {
        return String(entry).trim();
      })
      .filter(Boolean);
  }

  const text =
    String(value).trim();

  if (!text) {
    return [];
  }

  if (
    text.startsWith("[") ||
    text.startsWith("{")
  ) {
    try {
      return normalizeValueList(
        JSON.parse(text)
      );
    } catch {
      // Continue with ordinary text parsing.
    }
  }

  return text
    .split(
      /\s*(?:\/|\||,|;)\s*/g
    )
    .map((entry) => {
      return entry.trim();
    })
    .filter(Boolean);
}


export function normalizeFacetList(
  value,
  fallback = ""
) {
  const source =
    normalizeValueList(
      value
    );

  if (
    !source.length &&
    fallback
  ) {
    source.push(
      fallback
    );
  }

  const unique =
    new Map();

  source.forEach((label) => {
    const cleanLabel =
      String(label).trim();

    if (!cleanLabel) {
      return;
    }

    const key =
      normalizeFacetKey(
        cleanLabel
      );

    if (
      key &&
      !unique.has(key)
    ) {
      unique.set(
        key,
        {
          key,
          label:
            cleanLabel
        }
      );
    }
  });

  return [
    ...unique.values()
  ];
}


export function normalizeSearchText(value) {
  return String(
    value ??
    ""
  )
    .normalize("NFKD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .replace(
      /[^\p{L}\p{N}]+/gu,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}


export function normalizeFacetKey(value) {
  return normalizeSearchText(
    value
  ).replace(
    /\s+/g,
    "-"
  );
}


export function formatKeyAsLabel(key) {
  return String(
    key ||
    ""
  )
    .split("-")
    .filter(Boolean)
    .map((word) => {
      return (
        word.charAt(0).toUpperCase() +
        word.slice(1)
      );
    })
    .join(" ");
}


/* =========================================================
   SCORE HELPERS
   ========================================================= */

export function getNumericScore(value) {
  const number =
    Number(value);

  return Number.isFinite(
    number
  )
    ? number
    : 0;
}


export function formatScore(value) {
  const number =
    getNumericScore(
      value
    );

  if (!number) {
    return "";
  }

  return Number.isInteger(
    number
  )
    ? String(number)
    : number.toFixed(1);
}


/* =========================================================
   SEARCH RANKING
   ========================================================= */

export function buildRankedEntries(
  catalogue,
  query
) {
  const normalizedQuery =
    normalizeSearchText(
      query
    );

  if (!normalizedQuery) {
    return catalogue.map((item) => {
      return {
        item,
        rank:
          0
      };
    });
  }

  const words =
    normalizedQuery
      .split(" ")
      .filter(Boolean);

  return catalogue
    .map((item) => {
      return {
        item,

        rank:
          getSearchRank(
            item,
            normalizedQuery,
            words
          )
      };
    })
    .filter((entry) => {
      return (
        entry.rank >
        0
      );
    });
}


function getSearchRank(
  item,
  query,
  words
) {
  const allWordsMatch =
    words.every((word) => {
      return item.searchText.includes(
        word
      );
    });

  if (!allWordsMatch) {
    return 0;
  }

  let rank =
    1;

  if (
    item.titleSearch ===
    query
  ) {
    rank +=
      180;
  } else if (
    item.titleSearch.startsWith(
      query
    )
  ) {
    rank +=
      135;
  } else if (
    item.titleSearch.includes(
      query
    )
  ) {
    rank +=
      100;
  }

  if (
    item.alternativeTitleSearch.some((title) => {
      return title === query;
    })
  ) {
    rank +=
      155;
  } else if (
    item.alternativeTitleSearch.some((title) => {
      return title.startsWith(
        query
      );
    })
  ) {
    rank +=
      115;
  } else if (
    item.alternativeTitleSearch.some((title) => {
      return title.includes(
        query
      );
    })
  ) {
    rank +=
      85;
  }

  if (
    item.creatorSearch ===
    query
  ) {
    rank +=
      75;
  } else if (
    item.creatorSearch.startsWith(
      query
    )
  ) {
    rank +=
      55;
  } else if (
    item.creatorSearch.includes(
      query
    )
  ) {
    rank +=
      40;
  }

  words.forEach((word) => {
    if (
      item.titleSearch.startsWith(
        word
      )
    ) {
      rank +=
        8;
    }
  });

  return rank;
}


/* =========================================================
   FILTERING
   ========================================================= */

export function passesFilters(
  item,
  state,
  skipGroup = ""
) {
  if (
    skipGroup !== "type" &&
    state.selectedTypes.size &&
    !item.types.some((type) => {
      return state.selectedTypes.has(
        type.key
      );
    })
  ) {
    return false;
  }

  if (
    skipGroup !== "genre" &&
    state.selectedGenres.size &&
    !item.genres.some((genre) => {
      return state.selectedGenres.has(
        genre.key
      );
    })
  ) {
    return false;
  }

  if (
    skipGroup !== "score" &&
    state.minimumScore > 0 &&
    item.score <
      state.minimumScore
  ) {
    return false;
  }

  return true;
}


/* =========================================================
   SORTING
   ========================================================= */

export function getResultComparator(state) {
  switch (state.sort) {
    case "score-desc":
      return (a, b) => {
        return (
          compareScoreDescending(
            a.item,
            b.item
          ) ||

          compareTitleAscending(
            a.item,
            b.item
          )
        );
      };


    case "score-asc":
      return (a, b) => {
        return (
          compareScoreAscending(
            a.item,
            b.item
          ) ||

          compareTitleAscending(
            a.item,
            b.item
          )
        );
      };


    case "title-asc":
      return (a, b) => {
        return compareTitleAscending(
          a.item,
          b.item
        );
      };


    case "title-desc":
      return (a, b) => {
        return compareTitleDescending(
          a.item,
          b.item
        );
      };


    case "relevance":
    default:
      return (a, b) => {
        return compareByRelevance(
          a,
          b,
          state
        );
      };
  }
}


function compareByRelevance(
  a,
  b,
  state
) {
  if (
    state.query &&
    b.rank !== a.rank
  ) {
    return (
      b.rank -
      a.rank
    );
  }

  if (
    b.item.featured !==
    a.item.featured
  ) {
    return (
      Number(
        b.item.featured
      ) -
      Number(
        a.item.featured
      )
    );
  }

  return (
    compareScoreDescending(
      a.item,
      b.item
    ) ||

    compareTitleAscending(
      a.item,
      b.item
    )
  );
}


export function compareScoreDescending(
  a,
  b
) {
  return (
    b.score -
    a.score
  );
}


export function compareScoreAscending(
  a,
  b
) {
  if (
    !a.score &&
    b.score
  ) {
    return 1;
  }

  if (
    a.score &&
    !b.score
  ) {
    return -1;
  }

  return (
    a.score -
    b.score
  );
}


export function compareTitleAscending(
  a,
  b
) {
  return a.title.localeCompare(
    b.title,
    undefined,
    {
      sensitivity:
        "base"
    }
  );
}


export function compareTitleDescending(
  a,
  b
) {
  return b.title.localeCompare(
    a.title,
    undefined,
    {
      sensitivity:
        "base"
    }
  );
}


/* =========================================================
   FACET HELPERS
   ========================================================= */

export function buildFacetOptions(
  entries,
  property
) {
  const facets =
    new Map();

  entries.forEach((entry) => {
    entry.item[property].forEach((facet) => {
      const existing =
        facets.get(
          facet.key
        );

      if (existing) {
        existing.count +=
          1;
      } else {
        facets.set(
          facet.key,
          {
            key:
              facet.key,

            label:
              facet.label,

            count:
              1
          }
        );
      }
    });
  });

  return [
    ...facets.values()
  ];
}


export function compareTypeOptions(
  a,
  b
) {
  const indexA =
    CONFIG.PREFERRED_TYPE_ORDER.indexOf(
      a.key
    );

  const indexB =
    CONFIG.PREFERRED_TYPE_ORDER.indexOf(
      b.key
    );

  const orderA =
    indexA === -1
      ? Number.MAX_SAFE_INTEGER
      : indexA;

  const orderB =
    indexB === -1
      ? Number.MAX_SAFE_INTEGER
      : indexB;

  return (
    orderA -
    orderB ||

    b.count -
    a.count ||

    a.label.localeCompare(
      b.label,
      undefined,
      {
        sensitivity:
          "base"
      }
    )
  );
}


export function findFacetLabel(
  catalogue,
  key
) {
  for (const item of catalogue) {
    const facet = [
      ...item.types,
      ...item.genres,
      ...item.tags
    ].find((entry) => {
      return (
        entry.key ===
        key
      );
    });

    if (facet) {
      return facet.label;
    }
  }

  return "";
}


export function getPrimaryTypeLabel(item) {
  return (
    item.types[0]?.label ||
    "Story"
  );
}


export function getTypeDisplay(item) {
  const labels =
    item.types
      .slice(0, 2)
      .map((type) => {
        return type.label;
      });

  if (
    item.types.length >
    2
  ) {
    labels.push(
      `+${
        item.types.length -
        2
      }`
    );
  }

  return (
    labels.join(" / ") ||
    "Story"
  );
}


/* =========================================================
   GENERAL UTILITIES
   ========================================================= */

export function withTimeout(
  promise,
  milliseconds,
  message
) {
  let timer =
    null;

  const timeout =
    new Promise(
      (
        _,
        reject
      ) => {
        timer =
          window.setTimeout(
            () => {
              reject(
                new Error(
                  message
                )
              );
            },
            milliseconds
          );
      }
    );

  return Promise
    .race([
      promise,
      timeout
    ])
    .finally(() => {
      window.clearTimeout(
        timer
      );
    });
}


export function clamp(
  value,
  minimum,
  maximum
) {
  return Math.min(
    Math.max(
      value,
      minimum
    ),
    maximum
  );
}