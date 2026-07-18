// detail-data.js
// Loads one catalogue title and preserves every separate
// manga, anime, novel, and game record.

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


const MEDIA_ORDER = [
  "manga",
  "anime",
  "novel",
  "game"
];


const MEDIA_LABELS =
  Object.freeze({
    manga:
      "Manga",

    anime:
      "Anime",

    novel:
      "Novel",

    game:
      "Game"
  });


const MEDIA_FIELD_CONFIG =
  Object.freeze({
    anime: {
      countLabel:
        "releases",

      countAliases: [
        [
          "episodes",
          "episodeCount",
          "totalEpisodes",
          "numberOfEpisodes"
        ],

        [
          "movies",
          "movieCount",
          "totalMovies",
          "numberOfMovies"
        ]
      ],

      factGroups: [
        {
          label:
            "Studio",

          aliases: [
            "studios",
            "studio",
            "animationStudio"
          ]
        },

        {
          label:
            "Start year",

          aliases: [
            "startYear",
            "airedFrom",
            "releaseYear"
          ]
        },

        {
          label:
            "End year",

          aliases: [
            "endYear",
            "airedTo"
          ]
        }
      ],

      periodAliases: [
        "releasePeriod",
        "airingPeriod",
        "aired",
        "publicationPeriod"
      ],

      notesAliases: [
        "notes",
        "note",
        "description",
        "adaptationNotes"
      ]
    },


    manga: {
      countLabel:
        "publications",

      countAliases: [
        [
          "volumes",
          "volumeCount",
          "totalVolumes",
          "numberOfVolumes"
        ],

        [
          "chapters",
          "chapterCount",
          "totalChapters",
          "numberOfChapters"
        ]
      ],

      factGroups: [
        {
          label:
            "Publisher",

          aliases: [
            "publisher",
            "publishers"
          ]
        },

        {
          label:
            "Magazine",

          aliases: [
            "magazines",
            "magazine",
            "serialization"
          ]
        },

        {
          label:
            "Demographic",

          aliases: [
            "demographic",
            "audience",
            "targetAudience"
          ]
        },

        {
          label:
            "Release year",

          aliases: [
            "releaseYear",
            "startYear"
          ]
        },

        {
          label:
            "End year",

          aliases: [
            "endYear"
          ]
        }
      ],

      periodAliases: [
        "publicationPeriod",
        "releasePeriod",
        "published",
        "serializationPeriod"
      ],

      notesAliases: [
        "notes",
        "note",
        "description",
        "publicationNotes"
      ]
    },


    novel: {
      countLabel:
        "publications",

      countAliases: [
        [
          "volumes",
          "volumeCount",
          "totalVolumes",
          "numberOfVolumes"
        ],

        [
          "chapters",
          "chapterCount",
          "totalChapters",
          "numberOfChapters"
        ]
      ],

      factGroups: [
        {
          label:
            "Publisher",

          aliases: [
            "publisher",
            "publishers"
          ]
        },

        {
          label:
            "Imprint",

          aliases: [
            "imprint",
            "label"
          ]
        },

        {
          label:
            "Author",

          aliases: [
            "author",
            "writer"
          ]
        },

        {
          label:
            "Illustrator",

          aliases: [
            "illustrator",
            "artist"
          ]
        },

        {
          label:
            "Release year",

          aliases: [
            "releaseYear",
            "startYear"
          ]
        },

        {
          label:
            "End year",

          aliases: [
            "endYear"
          ]
        }
      ],

      periodAliases: [
        "publicationPeriod",
        "releasePeriod",
        "published"
      ],

      notesAliases: [
        "notes",
        "note",
        "description",
        "publicationNotes"
      ]
    },


    game: {
      countLabel:
        "releases",

      countAliases:
        [],

      factGroups: [
        {
          label:
            "Platform",

          aliases: [
            "platforms",
            "platform",
            "systems"
          ]
        },

        {
          label:
            "Developer",

          aliases: [
            "developer",
            "developers",
            "studio"
          ]
        },

        {
          label:
            "Publisher",

          aliases: [
            "publisher",
            "publishers"
          ]
        },

        {
          label:
            "Release year",

          aliases: [
            "releaseYear",
            "startYear"
          ]
        },

        {
          label:
            "End year",

          aliases: [
            "endYear"
          ]
        }
      ],

      periodAliases: [
        "releasePeriod",
        "publicationPeriod",
        "released"
      ],

      notesAliases: [
        "notes",
        "note",
        "description",
        "releaseNotes"
      ]
    }
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
  } =
    await supabaseClient
      .from(
        DETAIL_CONFIG.TABLE_NAME
      )
      .select(`
        id,
        title,
        alternativeTitles,
        type,
        creator,
        heroScore,
        genres,
        tags,
        description,
        animeInfo,
        mangaInfo,
        novelInfo,
        gameInfo
      `)
      .eq(
        "id",
        titleId
      )
      .maybeSingle();


  if (
    error
  ) {
    throw new Error(
      `Supabase ${
        error.code ||
        "error"
      }: ${error.message}`
    );
  }


  if (
    !data
  ) {
    throw new Error(
      "No catalogue entry matched this title ID."
    );
  }


  return data;
}


/* =========================================================
   REQUEST TIMEOUT
   ========================================================= */

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
    .finally(
      () => {
        window.clearTimeout(
          timeoutId
        );
      }
    );
}


/* =========================================================
   TITLE NORMALIZATION
   ========================================================= */

export function normalizeTitle(
  row,
  supabaseClient
) {
  const title =
    cleanString(
      row.title
    ) ||
    "Untitled";


  const alternativeTitles =
    uniqueStrings(
      extractStrings(
        row.alternativeTitles
      )
    )
      .filter(
        (
          alternativeTitle
        ) => {
          return (
            normalizeText(
              alternativeTitle
            ) !==
            normalizeText(
              title
            )
          );
        }
      );


  const rowTypes =
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


  const media = {
    manga:
      sortMediaEntries(
        normalizeEntries(
          row.mangaInfo
        )
      ),

    anime:
      sortMediaEntries(
        normalizeEntries(
          row.animeInfo
        )
      ),

    novel:
      sortMediaEntries(
        normalizeEntries(
          row.novelInfo
        )
      ),

    game:
      sortMediaEntries(
        normalizeEntries(
          row.gameInfo
        )
      )
  };


  return {
    id:
      cleanString(
        row.id
      ),

    title,

    alternativeTitles,

    types:
      rowTypes.length
        ? rowTypes
        : inferTypesFromMedia(
            media
          ),

    creator:
      cleanString(
        row.creator ??
        row.author ??
        row.writer ??
        row.artist
      ),

    score:
      getNumericScore(
        row.heroScore ??
        row.hero_score ??
        row.score ??
        row.rating
      ),

    genres,

    tags,

    description:
      cleanString(
        row.description
      ),

    coverUrl:
      getCoverUrlFromId(
        supabaseClient,
        row.id
      ),

    media,

    raw:
      row
  };
}


/* =========================================================
   MEDIA ENTRY NORMALIZATION
   ========================================================= */

export function normalizeEntries(
  value
) {
  const parsedValue =
    parseJsonValue(
      value
    );


  if (
    parsedValue == null ||
    parsedValue === ""
  ) {
    return [];
  }


  const entries =
    Array.isArray(
      parsedValue
    )
      ? parsedValue
      : [
          parsedValue
        ];


  return entries
    .filter(
      (
        entry
      ) => {
        return (
          entry &&
          typeof entry ===
            "object" &&
          !Array.isArray(
            entry
          )
        );
      }
    )
    .map(
      (
        entry
      ) => {
        return {
          ...entry
        };
      }
    );
}


/* =========================================================
   AVAILABLE MEDIA TYPES
   ========================================================= */

export function getAvailableMediaTypes(
  title
) {
  return MEDIA_ORDER
    .filter(
      (
        mediaType
      ) => {
        return (
          title
            .media[
              mediaType
            ]
            ?.length > 0
        );
      }
    );
}


/* =========================================================
   MEDIA LABELS
   ========================================================= */

export function getMediaLabel(
  mediaType
) {
  return (
    MEDIA_LABELS[
      mediaType
    ] ||
    formatLabel(
      mediaType
    )
  );
}


export function getMediaCountLabel(
  mediaType,
  count
) {
  const noun =
    MEDIA_FIELD_CONFIG[
      mediaType
    ]
      ?.countLabel ||
    "entries";


  return `${
    count
  } ${
    count === 1
      ? singularize(
          noun
        )
      : noun
  }`;
}


/* =========================================================
   OVERVIEW
   ========================================================= */

export function buildOverviewStats(
  title
) {
  const availableTypes =
    getAvailableMediaTypes(
      title
    );


  const years =
    availableTypes
      .flatMap(
        (
          mediaType
        ) => {
          return title
            .media[
              mediaType
            ]
            .flatMap(
              extractYearsFromEntry
            );
        }
      );


  const totalEntries =
    availableTypes
      .reduce(
        (
          total,
          mediaType
        ) => {
          return (
            total +
            title
              .media[
                mediaType
              ]
              .length
          );
        },

        0
      );


  const stats = [
    {
      label:
        "Available formats",

      value:
        availableTypes.length
          ? availableTypes
              .map(
                getMediaLabel
              )
              .join(
                " • "
              )
          : title.types
              .map(
                formatLabel
              )
              .join(
                " • "
              ) ||
            "Story"
    },

    {
      label:
        "Catalogue entries",

      value:
        String(
          totalEntries
        )
    }
  ];


  if (
    years.length
  ) {
    stats.push(
      {
        label:
          "First release",

        value:
          String(
            Math.min(
              ...years
            )
          )
      },

      {
        label:
          "Latest release",

        value:
          String(
            Math.max(
              ...years
            )
          )
      }
    );
  }


  if (
    title.creator
  ) {
    stats.push({
      label:
        "Creator",

      value:
        title.creator
    });
  }


  return stats;
}


/* =========================================================
   MEDIA ENTRY DISPLAY DATA
   ========================================================= */

export function buildMediaEntryView(
  mediaType,
  entry,
  index
) {
  const config =
    MEDIA_FIELD_CONFIG[
      mediaType
    ] ||
    MEDIA_FIELD_CONFIG
      .manga;


  const consumedKeys =
    new Set();


  const titleField =
    takeField(
      entry,

      [
        "title",
        "name"
      ],

      consumedKeys
    );


  const statusField =
    takeField(
      entry,

      [
        "status",
        "publicationStatus",
        "airingStatus",
        "releaseStatus"
      ],

      consumedKeys
    );


  const formatField =
    takeField(
      entry,

      [
        "format",
        "type",
        "mediaType"
      ],

      consumedKeys
    );


  const periodField =
    takeField(
      entry,
      config.periodAliases,
      consumedKeys
    );


  const summaryItems =
    [];


  if (
    formatField
  ) {
    summaryItems.push(
      formatValue(
        formatField.value
      )
    );
  }


  if (
    periodField
  ) {
    summaryItems.push(
      formatValue(
        periodField.value
      )
    );
  }


  config
    .countAliases
    .forEach(
      (
        aliases
      ) => {
        const field =
          takeField(
            entry,
            aliases,
            consumedKeys
          );


        if (
          !field
        ) {
          return;
        }


        const firstAlias =
          aliases[
            0
          ]
            .toLowerCase();


        let unit =
          "chapters";


        if (
          firstAlias.includes(
            "episode"
          )
        ) {
          unit =
            "episodes";
        } else if (
          firstAlias.includes(
            "movie"
          )
        ) {
          unit =
            "movies";
        } else if (
          firstAlias.includes(
            "volume"
          )
        ) {
          unit =
            "volumes";
        }


        summaryItems.push(
          formatCount(
            field.value,
            unit
          )
        );
      }
    );


  const facts =
    [];


  config
    .factGroups
    .forEach(
      (
        group
      ) => {
        const field =
          takeField(
            entry,
            group.aliases,
            consumedKeys
          );


        if (
          field
        ) {
          facts.push({
            label:
              group.label,

            value:
              formatValue(
                field.value
              )
          });
        }
      }
    );


  const notesField =
    takeField(
      entry,
      config.notesAliases,
      consumedKeys
    );


  const additional =
    Object
      .entries(
        entry
      )
      .filter(
        (
          [
            key,
            value
          ]
        ) => {
          return (
            !consumedKeys.has(
              key
            ) &&
            isDisplayableValue(
              value
            )
          );
        }
      )
      .map(
        (
          [
            key,
            value
          ]
        ) => {
          return {
            label:
              formatLabel(
                key
              ),

            value:
              formatValue(
                value
              )
          };
        }
      );


  return {
    title:
      titleField
        ?.value
        ? formatValue(
            titleField.value
          )
        : `${
            getMediaLabel(
              mediaType
            )
          } ${
            index + 1
          }`,

    status:
      statusField
        ? formatLabel(
            formatValue(
              statusField.value
            )
          )
        : "",

    summaryItems:
      summaryItems
        .filter(
          Boolean
        ),

    facts:
      facts
        .filter(
          (
            fact
          ) => {
            return Boolean(
              fact.value
            );
          }
        ),

    notes:
      notesField
        ? formatValue(
            notesField.value
          )
        : "",

    additional,

    yearLabel:
      getEntryYearLabel(
        entry
      )
  };
}


/* =========================================================
   TEXT FORMATTING
   ========================================================= */

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


export function normalizeText(
  value
) {
  return String(
    value ??
    ""
  )
    .normalize(
      "NFKD"
    )
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


export function formatLabel(
  value
) {
  const text =
    cleanString(
      value
    );


  if (
    !text
  ) {
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
      /([a-z0-9])([A-Z])/g,
      "$1 $2"
    )
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
      (
        character
      ) => {
        return character
          .toUpperCase();
      }
    );
}


export function formatScore(
  value
) {
  if (
    value == null
  ) {
    return "";
  }


  return Number
    .isInteger(
      value
    )
      ? String(
          value
        )
      : value
          .toFixed(
            1
          );
}


export function formatValue(
  value
) {
  if (
    !isDisplayableValue(
      value
    )
  ) {
    return "";
  }


  if (
    Array.isArray(
      value
    )
  ) {
    return uniqueStrings(
      value.flatMap(
        extractStrings
      )
    ).join(
      " • "
    );
  }


  if (
    typeof value ===
    "object"
  ) {
    return Object
      .entries(
        value
      )
      .filter(
        (
          [
            ,
            nestedValue
          ]
        ) => {
          return isDisplayableValue(
            nestedValue
          );
        }
      )
      .map(
        (
          [
            key,
            nestedValue
          ]
        ) => {
          return `${
            formatLabel(
              key
            )
          }: ${
            formatValue(
              nestedValue
            )
          }`;
        }
      )
      .join(
        " • "
      );
  }


  if (
    typeof value ===
    "boolean"
  ) {
    return value
      ? "Yes"
      : "No";
  }


  return cleanString(
    value
  );
}


/* =========================================================
   COVER URL
   ========================================================= */

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
      DETAIL_CONFIG
        .COVER_FOLDER
    }/${id}.jpg`;


  const {
    data
  } =
    supabaseClient
      .storage
      .from(
        DETAIL_CONFIG
          .BUCKET_NAME
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
   PARSE JSON
   ========================================================= */

function parseJsonValue(
  value
) {
  if (
    typeof value !==
    "string"
  ) {
    return value;
  }


  const text =
    value.trim();


  if (
    !text
  ) {
    return null;
  }


  if (
    !text.startsWith(
      "["
    ) &&
    !text.startsWith(
      "{"
    )
  ) {
    return value;
  }


  try {
    return JSON.parse(
      text
    );
  } catch {
    return value;
  }
}


/* =========================================================
   EXTRACT STRINGS
   ========================================================= */

function extractStrings(
  value
) {
  const parsedValue =
    parseJsonValue(
      value
    );


  if (
    parsedValue == null ||
    parsedValue === ""
  ) {
    return [];
  }


  if (
    Array.isArray(
      parsedValue
    )
  ) {
    return parsedValue
      .flatMap(
        extractStrings
      );
  }


  if (
    typeof parsedValue ===
    "object"
  ) {
    if (
      typeof parsedValue
        .name ===
      "string"
    ) {
      return [
        parsedValue.name
      ];
    }


    if (
      typeof parsedValue
        .title ===
      "string"
    ) {
      return [
        parsedValue.title
      ];
    }


    return Object
      .values(
        parsedValue
      )
      .flatMap(
        extractStrings
      );
  }


  if (
    typeof parsedValue ===
    "string"
  ) {
    return parsedValue
      .split(
        /\s*(?:\||,|;)\s*/g
      )
      .map(
        (
          entry
        ) => {
          return entry
            .trim();
        }
      )
      .filter(
        Boolean
      );
  }


  return [
    String(
      parsedValue
    )
  ];
}


/* =========================================================
   UNIQUE STRINGS
   ========================================================= */

function uniqueStrings(
  values
) {
  const uniqueValues =
    new Map();


  values.forEach(
    (
      value
    ) => {
      const cleanValue =
        cleanString(
          value
        );


      const normalizedValue =
        normalizeText(
          cleanValue
        );


      if (
        cleanValue &&
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
    }
  );


  return [
    ...uniqueValues
      .values()
  ];
}


/* =========================================================
   CLEAN STRING
   ========================================================= */

function cleanString(
  value
) {
  return String(
    value ??
    ""
  ).trim();
}


/* =========================================================
   SCORE NORMALIZATION
   ========================================================= */

function getNumericScore(
  value
) {
  if (
    value == null ||
    value === ""
  ) {
    return null;
  }


  const number =
    Number(
      value
    );


  if (
    !Number.isFinite(
      number
    )
  ) {
    return null;
  }


  return Math.min(
    10,

    Math.max(
      0,
      number
    )
  );
}


/* =========================================================
   INFER MEDIA TYPES
   ========================================================= */

function inferTypesFromMedia(
  media
) {
  const inferredTypes =
    MEDIA_ORDER
      .filter(
        (
          mediaType
        ) => {
          return (
            media[
              mediaType
            ].length > 0
          );
        }
      )
      .map(
        getMediaLabel
      );


  return inferredTypes
    .length
      ? inferredTypes
      : [
          "Story"
        ];
}


/* =========================================================
   SORT MEDIA ENTRIES
   ========================================================= */

function sortMediaEntries(
  entries
) {
  return entries
    .map(
      (
        entry,
        originalIndex
      ) => {
        return {
          entry,
          originalIndex
        };
      }
    )
    .sort(
      (
        left,
        right
      ) => {
        const leftYear =
          getSortYear(
            left.entry
          );


        const rightYear =
          getSortYear(
            right.entry
          );


        if (
          leftYear ===
          rightYear
        ) {
          return (
            left.originalIndex -
            right.originalIndex
          );
        }


        if (
          leftYear == null
        ) {
          return 1;
        }


        if (
          rightYear == null
        ) {
          return -1;
        }


        return (
          leftYear -
          rightYear
        );
      }
    )
    .map(
      (
        {
          entry
        }
      ) => {
        return entry;
      }
    );
}


/* =========================================================
   SORT YEAR
   ========================================================= */

function getSortYear(
  entry
) {
  const directCandidates = [
    entry.startYear,
    entry.releaseYear,
    entry.endYear
  ];


  for (
    const candidate
    of directCandidates
  ) {
    const year =
      Number(
        candidate
      );


    if (
      Number.isInteger(
        year
      ) &&
      year > 0
    ) {
      return year;
    }
  }


  const periodText =
    cleanString(
      entry.releasePeriod ??
      entry.publicationPeriod ??
      entry.airingPeriod
    );


  const match =
    periodText.match(
      /\b(19|20)\d{2}\b/
    );


  return match
    ? Number(
        match[
          0
        ]
      )
    : null;
}


/* =========================================================
   EXTRACT YEARS
   ========================================================= */

function extractYearsFromEntry(
  entry
) {
  const years =
    [];


  Object
    .entries(
      entry
    )
    .forEach(
      (
        [
          key,
          value
        ]
      ) => {
        const normalizedKey =
          normalizeText(
            key
          );


        if (
          !normalizedKey.includes(
            "year"
          ) &&
          !normalizedKey.includes(
            "period"
          )
        ) {
          return;
        }


        const matches =
          String(
            value
          ).match(
            /\b(19|20)\d{2}\b/g
          ) ||
          [];


        matches.forEach(
          (
            match
          ) => {
            years.push(
              Number(
                match
              )
            );
          }
        );
      }
    );


  return years
    .filter(
      (
        year
      ) => {
        return Number
          .isInteger(
            year
          );
      }
    );
}


/* =========================================================
   ENTRY YEAR LABEL
   ========================================================= */

function getEntryYearLabel(
  entry
) {
  const explicitPeriod =
    cleanString(
      entry.releasePeriod ??
      entry.publicationPeriod ??
      entry.airingPeriod
    );


  if (
    explicitPeriod
  ) {
    return explicitPeriod;
  }


  const startYear =
    cleanString(
      entry.startYear ??
      entry.releaseYear
    );


  const endYear =
    cleanString(
      entry.endYear
    );


  if (
    startYear &&
    endYear &&
    startYear !==
      endYear
  ) {
    return `${
      startYear
    }–${
      endYear
    }`;
  }


  return (
    startYear ||
    endYear ||
    ""
  );
}


/* =========================================================
   TAKE FIELD
   ========================================================= */

function takeField(
  entry,
  aliases,
  consumedKeys
) {
  const aliasKeys =
    aliases.map(
      (
        alias
      ) => {
        return normalizeText(
          alias
        ).replace(
          /\s+/g,
          ""
        );
      }
    );


  for (
    const [
      key,
      value
    ]
    of Object.entries(
      entry
    )
  ) {
    const normalizedKey =
      normalizeText(
        key
      ).replace(
        /\s+/g,
        ""
      );


    if (
      aliasKeys.includes(
        normalizedKey
      ) &&
      isDisplayableValue(
        value
      )
    ) {
      consumedKeys.add(
        key
      );


      return {
        key,
        value
      };
    }
  }


  return null;
}


/* =========================================================
   DISPLAYABLE VALUE
   ========================================================= */

function isDisplayableValue(
  value
) {
  if (
    value == null ||
    value === ""
  ) {
    return false;
  }


  if (
    Array.isArray(
      value
    )
  ) {
    return value
      .some(
        isDisplayableValue
      );
  }


  if (
    typeof value ===
    "object"
  ) {
    return Object
      .values(
        value
      )
      .some(
        isDisplayableValue
      );
  }


  return true;
}


/* =========================================================
   FORMAT COUNT
   ========================================================= */

function formatCount(
  value,
  unit
) {
  const formattedValue =
    formatValue(
      value
    );


  if (
    !formattedValue
  ) {
    return "";
  }


  return /[a-z]/i
    .test(
      formattedValue
    )
      ? formattedValue
      : `${
          formattedValue
        } ${
          unit
        }`;
}


/* =========================================================
   SINGULARIZE LABEL
   ========================================================= */

function singularize(
  noun
) {
  if (
    noun.endsWith(
      "ies"
    )
  ) {
    return `${
      noun.slice(
        0,
        -3
      )
    }y`;
  }


  if (
    noun.endsWith(
      "s"
    )
  ) {
    return noun.slice(
      0,
      -1
    );
  }


  return noun;
}