// detail-data.js
// Supabase configuration, database loading, normalization,
// media information parsing, and fact building.

export const DETAIL_CONFIG =
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

    REQUEST_TIMEOUT_MS:
      15000
  });


/* =========================================================
   DATABASE
   ========================================================= */

export async function loadTitleFromDatabase(
  supabaseClient,
  titleId
) {
  const {
    data,
    error
  } = await supabaseClient
    .from(
      DETAIL_CONFIG.TABLE_NAME
    )
    .select("*")
    .eq(
      "id",
      titleId
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      `Supabase ${
        error.code ||
        "error"
      }: ${error.message}`
    );
  }

  if (!data) {
    throw new Error(
      "No catalogue entry matched this title ID."
    );
  }

  return data;
}


export function withTimeout(
  promise,
  milliseconds,
  errorMessage
) {
  let timeoutId =
    null;

  const timeoutPromise =
    new Promise(
      (
        _,
        reject
      ) => {
        timeoutId =
          window.setTimeout(
            () => {
              reject(
                new Error(
                  errorMessage
                )
              );
            },
            milliseconds
          );
      }
    );

  return Promise
    .race([
      Promise.resolve(
        promise
      ),
      timeoutPromise
    ])
    .finally(() => {
      window.clearTimeout(
        timeoutId
      );
    });
}


/* =========================================================
   TITLE NORMALIZATION
   ========================================================= */

export function normalizeTitle(
  row,
  supabaseClient
) {
  const title =
    String(
      row.title ||
      "Untitled"
    ).trim();

  const alternativeTitles =
    uniqueStrings(
      extractStrings(
        row.alternativeTitles
      )
    )
      .filter((alternativeTitle) => {
        return (
          normalizeText(
            alternativeTitle
          ) !==
          normalizeText(
            title
          )
        );
      });

  const types =
    uniqueStrings(
      extractStrings(
        row.type
      )
    );

  const genres =
    uniqueStrings(
      extractStrings(
        row.genres
      )
    );

  const tags =
    uniqueStrings(
      extractStrings(
        row.tags
      )
    );

  const creator =
    String(
      row.creator ??
      row.author ??
      row.writer ??
      row.artist ??
      ""
    ).trim();

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

  return {
    id:
      String(
        row.id
      ),

    title,

    alternativeTitles,

    types:
      types.length
        ? types
        : ["Story"],

    creator,

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

    mediaInformation:
      combineMediaInformation(
        row,
        types
      ),

    raw:
      row
  };
}


function getCoverUrlFromId(
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
    `${
      DETAIL_CONFIG.COVER_FOLDER
    }/${id}.jpg`;

  const {
    data
  } = supabaseClient
    .storage
    .from(
      DETAIL_CONFIG.BUCKET_NAME
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
   JSONB AND ARRAY HELPERS
   ========================================================= */

function extractStrings(value) {
  if (
    value == null ||
    value === ""
  ) {
    return [];
  }

  if (
    Array.isArray(value)
  ) {
    return value.flatMap(
      extractStrings
    );
  }

  if (
    typeof value ===
    "object"
  ) {
    if (
      typeof value.name ===
      "string"
    ) {
      return [
        value.name
      ];
    }

    if (
      typeof value.title ===
      "string"
    ) {
      return [
        value.title
      ];
    }

    return Object
      .values(value)
      .flatMap(
        extractStrings
      );
  }

  if (
    typeof value ===
    "string"
  ) {
    const text =
      value.trim();

    if (!text) {
      return [];
    }

    if (
      text.startsWith("[") ||
      text.startsWith("{")
    ) {
      try {
        return extractStrings(
          JSON.parse(text)
        );
      } catch {
        // The value was ordinary text.
      }
    }

    return text
      .split(
        /\s*(?:\||,|;)\s*/g
      )
      .map((entry) => {
        return entry.trim();
      })
      .filter(Boolean);
  }

  return [
    String(value)
  ];
}


function uniqueStrings(values) {
  const uniqueValues =
    new Map();

  values.forEach((value) => {
    const cleanValue =
      String(value).trim();

    if (!cleanValue) {
      return;
    }

    const normalizedValue =
      normalizeText(
        cleanValue
      );

    if (
      normalizedValue &&
      !uniqueValues.has(
        normalizedValue
      )
    ) {
      uniqueValues.set(
        normalizedValue,
        cleanValue
      );
    }
  });

  return [
    ...uniqueValues.values()
  ];
}


export function normalizeText(value) {
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


function normalizeKey(value) {
  return normalizeText(
    value
  ).replace(
    /\s+/g,
    ""
  );
}


export function normalizeSearchParameter(
  value
) {
  return normalizeText(
    value
  ).replace(
    /\s+/g,
    "-"
  );
}


/* =========================================================
   SCORE
   ========================================================= */

function getNumericScore(value) {
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
   MEDIA INFORMATION
   ========================================================= */

function combineMediaInformation(
  row,
  types
) {
  const informationSources = {
    manga:
      normalizeObject(
        row.mangaInfo
      ),

    anime:
      normalizeObject(
        row.animeInfo
      ),

    novel:
      normalizeObject(
        row.novelInfo
      ),

    game:
      normalizeObject(
        row.gameInfo
      )
  };

  const primaryMode =
    getMediaMode(
      types
    );

  const modes = [
    "manga",
    "anime",
    "novel",
    "game"
  ];

  const orderedModes = [
    ...modes.filter((mode) => {
      return (
        mode !==
        primaryMode
      );
    }),

    primaryMode
  ];

  return orderedModes.reduce(
    (
      combined,
      mode
    ) => {
      return {
        ...combined,
        ...informationSources[mode]
      };
    },
    {}
  );
}


function normalizeObject(value) {
  if (
    value == null ||
    value === ""
  ) {
    return {};
  }

  if (
    typeof value ===
    "string"
  ) {
    try {
      return normalizeObject(
        JSON.parse(value)
      );
    } catch {
      return {};
    }
  }

  if (
    Array.isArray(value)
  ) {
    return value.reduce(
      (
        combined,
        item
      ) => {
        return {
          ...combined,
          ...normalizeObject(
            item
          )
        };
      },
      {}
    );
  }

  if (
    typeof value ===
    "object"
  ) {
    return {
      ...value
    };
  }

  return {};
}


function createInformationMap(
  information
) {
  const map =
    new Map();

  walkInformation(
    information,
    map
  );

  return map;
}


function walkInformation(
  value,
  map
) {
  if (
    !value ||
    typeof value !==
    "object"
  ) {
    return;
  }

  Object
    .entries(value)
    .forEach(
      (
        [
          key,
          entryValue
        ]
      ) => {
        const normalizedKey =
          normalizeKey(
            key
          );

        if (
          isDisplayableValue(
            entryValue
          ) &&
          !map.has(
            normalizedKey
          )
        ) {
          map.set(
            normalizedKey,
            entryValue
          );
        }

        if (
          entryValue &&
          typeof entryValue ===
            "object" &&
          !Array.isArray(
            entryValue
          )
        ) {
          walkInformation(
            entryValue,
            map
          );
        }
      }
    );
}


function isDisplayableValue(value) {
  if (
    value == null ||
    value === ""
  ) {
    return false;
  }

  if (
    typeof value ===
      "object" &&
    !Array.isArray(value)
  ) {
    return Boolean(
      value.year ||
      value.name ||
      value.title
    );
  }

  return true;
}


function readInformation(
  informationMap,
  aliases
) {
  for (
    const alias
    of aliases
  ) {
    const value =
      informationMap.get(
        normalizeKey(
          alias
        )
      );

    if (
      isDisplayableValue(
        value
      )
    ) {
      return value;
    }
  }

  return "";
}


/* =========================================================
   DETAIL FACTS
   ========================================================= */

export function buildFacts(title) {
  const informationMap =
    createInformationMap(
      title.mediaInformation
    );

  const mediaMode =
    getMediaMode(
      title.types
    );

  const facts =
    [];

  addFact(
    facts,
    "Status",
    formatInformationValue(
      readInformation(
        informationMap,
        [
          "status",
          "publicationStatus",
          "publishingStatus",
          "airingStatus",
          "releaseStatus"
        ]
      )
    )
  );


  if (
    mediaMode === "manga" ||
    mediaMode === "novel"
  ) {
    addCountFact(
      facts,
      "Chapters",
      readInformation(
        informationMap,
        [
          "chapters",
          "chapterCount",
          "totalChapters",
          "numberOfChapters"
        ]
      ),
      "chapters"
    );

    addCountFact(
      facts,
      "Volumes",
      readInformation(
        informationMap,
        [
          "volumes",
          "volumeCount",
          "totalVolumes",
          "numberOfVolumes"
        ]
      ),
      "volumes"
    );
  }


  if (
    mediaMode === "anime"
  ) {
    addCountFact(
      facts,
      "Episodes",
      readInformation(
        informationMap,
        [
          "episodes",
          "episodeCount",
          "totalEpisodes",
          "numberOfEpisodes"
        ]
      ),
      "episodes"
    );

    addCountFact(
      facts,
      "Seasons",
      readInformation(
        informationMap,
        [
          "seasons",
          "seasonCount",
          "totalSeasons"
        ]
      ),
      "seasons"
    );
  }


  if (
    mediaMode === "game"
  ) {
    addFact(
      facts,
      "Platforms",
      formatInformationValue(
        readInformation(
          informationMap,
          [
            "platform",
            "platforms",
            "systems"
          ]
        )
      )
    );
  }


  const startDate =
    readInformation(
      informationMap,
      [
        "startDate",
        "startYear",
        "publishedFrom",
        "airedFrom",
        "releaseDate",
        "firstPublished",
        "publicationStart"
      ]
    );

  const endDate =
    readInformation(
      informationMap,
      [
        "endDate",
        "endYear",
        "publishedTo",
        "airedTo",
        "lastPublished",
        "publicationEnd"
      ]
    );


  addFact(
    facts,
    getDateFactLabel(
      mediaMode
    ),
    formatDateRange(
      startDate,
      endDate
    )
  );


  if (
    mediaMode === "anime"
  ) {
    addFact(
      facts,
      "Studio",
      formatInformationValue(
        readInformation(
          informationMap,
          [
            "studio",
            "studios",
            "animationStudio"
          ]
        )
      )
    );
  } else if (
    mediaMode === "game"
  ) {
    addFact(
      facts,
      "Developer",
      formatInformationValue(
        readInformation(
          informationMap,
          [
            "developer",
            "developers",
            "studio"
          ]
        )
      )
    );
  } else {
    addFact(
      facts,
      "Publisher",
      formatInformationValue(
        readInformation(
          informationMap,
          [
            "publisher",
            "publishers",
            "serialization",
            "magazine",
            "imprint"
          ]
        )
      )
    );
  }


  addFact(
    facts,
    "Demographic",
    formatInformationValue(
      readInformation(
        informationMap,
        [
          "demographic",
          "audience",
          "targetAudience"
        ]
      )
    )
  );


  addFact(
    facts,
    "Country",
    formatInformationValue(
      readInformation(
        informationMap,
        [
          "country",
          "countryOfOrigin",
          "origin"
        ]
      )
    )
  );


  return facts.slice(
    0,
    9
  );
}


function addFact(
  facts,
  label,
  value
) {
  const cleanValue =
    String(
      value ||
      ""
    ).trim();

  if (!cleanValue) {
    return;
  }

  const alreadyExists =
    facts.some((fact) => {
      return (
        normalizeText(
          fact.value
        ) ===
        normalizeText(
          cleanValue
        )
      );
    });

  if (!alreadyExists) {
    facts.push({
      label,
      value:
        cleanValue
    });
  }
}


function addCountFact(
  facts,
  label,
  rawValue,
  unit
) {
  const formattedValue =
    formatInformationValue(
      rawValue
    );

  if (!formattedValue) {
    return;
  }

  const alreadyContainsLetters =
    /[a-z]/i.test(
      formattedValue
    );

  addFact(
    facts,
    label,
    alreadyContainsLetters
      ? formattedValue
      : `${formattedValue} ${unit}`
  );
}


function formatInformationValue(value) {
  if (
    value == null ||
    value === ""
  ) {
    return "";
  }

  if (
    Array.isArray(value)
  ) {
    return uniqueStrings(
      value.flatMap(
        extractStrings
      )
    ).join(" • ");
  }

  if (
    typeof value ===
    "object"
  ) {
    if (value.year) {
      return formatDateValue(
        value
      );
    }

    if (value.name) {
      return String(
        value.name
      );
    }

    if (value.title) {
      return String(
        value.title
      );
    }

    return uniqueStrings(
      Object
        .values(value)
        .flatMap(
          extractStrings
        )
    ).join(" • ");
  }

  if (
    typeof value ===
    "boolean"
  ) {
    return value
      ? "Yes"
      : "No";
  }

  return formatLabel(
    String(value)
  );
}


export function formatLabel(value) {
  const text =
    String(
      value ||
      ""
    ).trim();

  if (!text) {
    return "";
  }

  if (
    text ===
      text.toUpperCase() &&
    text.length <= 5
  ) {
    return text;
  }

  return text
    .replace(
      /[_-]+/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .replace(
      /\b\w/g,
      (character) => {
        return character.toUpperCase();
      }
    );
}


function formatDateRange(
  startValue,
  endValue
) {
  const start =
    formatDateValue(
      startValue
    );

  const end =
    formatDateValue(
      endValue
    );

  if (
    !start &&
    !end
  ) {
    return "";
  }

  if (
    start &&
    end &&
    normalizeText(start) ===
      normalizeText(end)
  ) {
    return start;
  }

  if (
    start &&
    end
  ) {
    return `${start}–${end}`;
  }

  return (
    start ||
    end
  );
}


function formatDateValue(value) {
  if (
    value == null ||
    value === ""
  ) {
    return "";
  }

  if (
    Array.isArray(value)
  ) {
    return value
      .map(
        formatDateValue
      )
      .filter(Boolean)
      .join(" • ");
  }

  if (
    typeof value ===
    "object"
  ) {
    const year =
      Number(
        value.year
      );

    const month =
      Number(
        value.month
      );

    const day =
      Number(
        value.day
      );

    if (
      Number.isFinite(
        year
      )
    ) {
      if (
        Number.isFinite(
          month
        ) &&
        Number.isFinite(
          day
        )
      ) {
        const date =
          new Date(
            year,
            month - 1,
            day
          );

        return new Intl
          .DateTimeFormat(
            undefined,
            {
              year:
                "numeric",

              month:
                "short",

              day:
                "numeric"
            }
          )
          .format(date);
      }

      if (
        Number.isFinite(
          month
        )
      ) {
        const date =
          new Date(
            year,
            month - 1,
            1
          );

        return new Intl
          .DateTimeFormat(
            undefined,
            {
              year:
                "numeric",

              month:
                "short"
            }
          )
          .format(date);
      }

      return String(year);
    }

    return formatInformationValue(
      value
    );
  }

  return String(value).trim();
}


function getDateFactLabel(
  mediaMode
) {
  if (
    mediaMode ===
    "anime"
  ) {
    return "Aired";
  }

  if (
    mediaMode ===
    "game"
  ) {
    return "Released";
  }

  return "Published";
}


/* =========================================================
   MEDIA MODE
   ========================================================= */

export function getMediaMode(types) {
  const typeText =
    types
      .map(
        normalizeText
      )
      .join(" ");

  if (
    typeText.includes(
      "game"
    ) ||
    typeText.includes(
      "visual novel"
    )
  ) {
    return "game";
  }

  if (
    typeText.includes(
      "anime"
    ) ||
    typeText.includes(
      "film"
    ) ||
    typeText.includes(
      "movie"
    ) ||
    typeText.includes(
      "television"
    ) ||
    typeText.includes(
      "tv"
    )
  ) {
    return "anime";
  }

  if (
    typeText.includes(
      "novel"
    ) ||
    typeText.includes(
      "book"
    )
  ) {
    return "novel";
  }

  return "manga";
}