// detail.js
// Loads one title from Supabase and renders the complete
// Inkwell detail page.

(() => {
  "use strict";


  /* =======================================================
     SUPABASE CONFIGURATION
     ======================================================= */

  const SUPABASE_URL =
    "https://hsruxfpslxguhwnccwuj.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_Z2upBCdemNtdB4j5jry65A_XD_u8BsD";

  const TABLE_NAME =
    "manga";

  const BUCKET_NAME =
    "img";

  const COVER_FOLDER =
    "covers";

  const REQUEST_TIMEOUT_MS =
    15000;


  /* =======================================================
     LOCAL LIBRARY CONFIGURATION
     ======================================================= */

  const LIBRARY_STORAGE_KEY =
    "inkwell-library-v1";


  /* =======================================================
     APPLICATION STATE
     ======================================================= */

  let supabaseClient =
    null;

  let currentTitle =
    null;

  let libraryMenuOpen =
    false;

  const elements = {};


  /* =======================================================
     STARTUP
     ======================================================= */

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      startDetailPage,
      {
        once: true
      }
    );
  } else {
    startDetailPage();
  }


  async function startDetailPage() {
    collectElements();

    if (!hasRequiredElements()) {
      console.error(
        "The detail page is missing required HTML elements.",
        elements
      );

      return;
    }

    bindEvents();

    const titleId =
      new URLSearchParams(
        window.location.search
      ).get("id");

    if (!titleId) {
      showError(
        "No title ID was provided. Open a title from the search page."
      );

      return;
    }

    if (!window.supabase?.createClient) {
      showError(
        "The Supabase browser library did not load."
      );

      return;
    }

    supabaseClient =
      window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
      );

    try {
      const databaseRow =
        await withTimeout(
          loadTitleFromDatabase(titleId),
          REQUEST_TIMEOUT_MS,
          "The title request took too long."
        );

      currentTitle =
        normalizeTitle(databaseRow);

      renderDetailPage(currentTitle);
      showContent();
    } catch (error) {
      console.error(
        "INKWELL DETAIL PAGE ERROR:",
        error
      );

      showError(
        error?.message ||
        "The title could not be loaded."
      );
    }
  }


  /* =======================================================
     DOM ELEMENTS
     ======================================================= */

  function collectElements() {
    elements.loading =
      document.getElementById(
        "detail-loading"
      );

    elements.error =
      document.getElementById(
        "detail-error"
      );

    elements.errorMessage =
      document.getElementById(
        "detail-error-message"
      );

    elements.retryButton =
      document.getElementById(
        "detail-retry-button"
      );

    elements.content =
      document.getElementById(
        "detail-content"
      );


    elements.breadcrumbFormat =
      document.getElementById(
        "detail-breadcrumb-format"
      );

    elements.breadcrumbTitle =
      document.getElementById(
        "detail-breadcrumb-title"
      );


    elements.ambientCover =
      document.getElementById(
        "detail-ambient-cover"
      );

    elements.coverFrame =
      document.querySelector(
        ".detail-cover-frame"
      );

    elements.cover =
      document.getElementById(
        "detail-cover"
      );


    elements.type =
      document.getElementById(
        "detail-type"
      );

    elements.featured =
      document.getElementById(
        "detail-featured"
      );

    elements.title =
      document.getElementById(
        "detail-title"
      );

    elements.alternativeTitles =
      document.getElementById(
        "detail-alternative-titles"
      );

    elements.creator =
      document.getElementById(
        "detail-creator"
      );

    elements.genres =
      document.getElementById(
        "detail-genres"
      );


    elements.scoreCard =
      document.getElementById(
        "detail-score-card"
      );

    elements.score =
      document.getElementById(
        "detail-score"
      );


    elements.factsGrid =
      document.getElementById(
        "detail-facts-grid"
      );

    elements.factsEmpty =
      document.getElementById(
        "detail-facts-empty"
      );


    elements.description =
      document.getElementById(
        "detail-description"
      );

    elements.themesSection =
      document.getElementById(
        "detail-themes-section"
      );

    elements.themes =
      document.getElementById(
        "detail-themes"
      );


    elements.backButton =
      document.getElementById(
        "detail-back-button"
      );

    elements.similarLink =
      document.getElementById(
        "detail-similar-link"
      );


    elements.libraryPicker =
      document.querySelector(
        "[data-detail-library-picker]"
      );

    elements.libraryTrigger =
      document.getElementById(
        "detail-library-trigger"
      );

    elements.libraryTriggerIcon =
      document.getElementById(
        "detail-library-trigger-icon"
      );

    elements.libraryTriggerLabel =
      document.getElementById(
        "detail-library-trigger-label"
      );

    elements.libraryMenu =
      document.getElementById(
        "detail-library-menu"
      );

    elements.libraryStatusButtons = [
      ...document.querySelectorAll(
        "[data-library-status]"
      )
    ];

    elements.progressStatusLabel =
      document.getElementById(
        "detail-progress-status-label"
      );

    elements.libraryRemove =
      document.getElementById(
        "detail-library-remove"
      );

    elements.libraryNote =
      document.getElementById(
        "detail-library-note"
      );
  }


  function hasRequiredElements() {
    return Boolean(
      elements.loading &&
      elements.error &&
      elements.errorMessage &&
      elements.retryButton &&
      elements.content &&
      elements.breadcrumbFormat &&
      elements.breadcrumbTitle &&
      elements.ambientCover &&
      elements.coverFrame &&
      elements.cover &&
      elements.type &&
      elements.featured &&
      elements.title &&
      elements.alternativeTitles &&
      elements.creator &&
      elements.genres &&
      elements.scoreCard &&
      elements.score &&
      elements.factsGrid &&
      elements.factsEmpty &&
      elements.description &&
      elements.themesSection &&
      elements.themes &&
      elements.backButton &&
      elements.similarLink &&
      elements.libraryPicker &&
      elements.libraryTrigger &&
      elements.libraryTriggerIcon &&
      elements.libraryTriggerLabel &&
      elements.libraryMenu &&
      elements.libraryStatusButtons.length &&
      elements.progressStatusLabel &&
      elements.libraryRemove &&
      elements.libraryNote
    );
  }


  /* =======================================================
     DATABASE
     ======================================================= */

  async function loadTitleFromDatabase(titleId) {
    const {
      data,
      error
    } = await supabaseClient
      .from(TABLE_NAME)
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


  function withTimeout(
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
        Promise.resolve(promise),
        timeoutPromise
      ])
      .finally(() => {
        window.clearTimeout(
          timeoutId
        );
      });
  }


  /* =======================================================
     NORMALIZE DATABASE TITLE
     ======================================================= */

  function normalizeTitle(row) {
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

    const mediaInformation =
      combineMediaInformation(
        row,
        types
      );

    return {
      id:
        String(row.id),

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
          row.id
        ),

      mediaInformation,

      raw:
        row
    };
  }


  function getCoverUrlFromId(id) {
    if (
      !supabaseClient ||
      id == null
    ) {
      return "";
    }

    const coverPath =
      `${COVER_FOLDER}/${id}.jpg`;

    const {
      data
    } = supabaseClient
      .storage
      .from(BUCKET_NAME)
      .getPublicUrl(
        coverPath
      );

    return (
      data?.publicUrl ||
      ""
    );
  }


  /* =======================================================
     JSONB AND ARRAY HELPERS
     ======================================================= */

  function extractStrings(value) {
    if (
      value == null ||
      value === ""
    ) {
      return [];
    }

    if (Array.isArray(value)) {
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
          // Continue with normal text parsing.
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


  function normalizeText(value) {
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


  function normalizeSearchParameter(value) {
    return normalizeText(
      value
    ).replace(
      /\s+/g,
      "-"
    );
  }


  function getNumericScore(value) {
    const number =
      Number(value);

    return Number.isFinite(
      number
    )
      ? number
      : 0;
  }


  function formatScore(value) {
    const number =
      getNumericScore(value);

    if (!number) {
      return "";
    }

    return Number.isInteger(
      number
    )
      ? String(number)
      : number.toFixed(1);
  }


  /* =======================================================
     MEDIA INFORMATION
     ======================================================= */

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
        return mode !== primaryMode;
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

    if (Array.isArray(value)) {
      return value.reduce(
        (
          combined,
          item
        ) => {
          return {
            ...combined,
            ...normalizeObject(item)
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


  function createInformationMap(information) {
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

    Object.entries(value)
      .forEach(
        (
          [
            key,
            entryValue
          ]
        ) => {
          const normalizedKey =
            normalizeKey(key);

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
          normalizeKey(alias)
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


  /* =======================================================
     RENDER COMPLETE PAGE
     ======================================================= */

  function renderDetailPage(title) {
    const primaryType =
      title.types[0] ||
      "Story";

    document.title =
      `${title.title} | Inkwell`;

    renderBreadcrumbs(
      title,
      primaryType
    );

    renderCover(title);
    renderHeading(title);
    renderGenres(title.genres);
    renderScore(title.score);
    renderFacts(title);
    renderDescription(title.description);
    renderThemes(title.tags);
    configureSimilarLink(title);
    configureProgressStatus(title);
    synchronizeLibraryInterface();
  }


  function renderBreadcrumbs(
    title,
    primaryType
  ) {
    elements.breadcrumbFormat.textContent =
      primaryType;

    elements.breadcrumbFormat.href =
      `search.html?type=${
        encodeURIComponent(
          normalizeSearchParameter(
            primaryType
          )
        )
      }`;

    elements.breadcrumbTitle.textContent =
      title.title;
  }


  function renderCover(title) {
    elements.coverFrame.classList.remove(
      "has-cover-error"
    );

    if (!title.coverUrl) {
      elements.coverFrame.classList.add(
        "has-cover-error"
      );

      elements.cover.removeAttribute(
        "src"
      );

      elements.ambientCover.style.backgroundImage =
        "none";

      return;
    }

    elements.cover.src =
      title.coverUrl;

    elements.cover.alt =
      `${title.title} cover`;

    elements.ambientCover.style.backgroundImage =
      `url("${escapeCssUrl(
        title.coverUrl
      )}")`;

    elements.cover.addEventListener(
      "error",
      () => {
        elements.coverFrame.classList.add(
          "has-cover-error"
        );

        elements.cover.removeAttribute(
          "src"
        );

        elements.ambientCover.style.backgroundImage =
          "none";
      },
      {
        once: true
      }
    );
  }


  function escapeCssUrl(value) {
    return String(value)
      .replace(
        /\\/g,
        "\\\\"
      )
      .replace(
        /"/g,
        '\\"'
      );
  }


  function renderHeading(title) {
    elements.type.textContent =
      title.types.join(" / ");

    elements.featured.hidden =
      !title.featured;

    elements.title.textContent =
      title.title;

    elements.creator.textContent =
      title.creator ||
      "Unknown creator";

    if (
      title.alternativeTitles.length
    ) {
      elements.alternativeTitles.hidden =
        false;

      elements.alternativeTitles.textContent =
        title.alternativeTitles.join(
          " / "
        );
    } else {
      elements.alternativeTitles.hidden =
        true;

      elements.alternativeTitles.textContent =
        "";
    }
  }


  function renderGenres(genres) {
    elements.genres.innerHTML =
      "";

    if (!genres.length) {
      elements.genres.hidden =
        true;

      return;
    }

    elements.genres.hidden =
      false;

    genres.forEach((genre) => {
      const genreElement =
        document.createElement(
          "span"
        );

      genreElement.className =
        "detail-genre";

      genreElement.textContent =
        genre;

      elements.genres.append(
        genreElement
      );
    });
  }


  function renderScore(score) {
    const formattedScore =
      formatScore(score);

    if (!formattedScore) {
      elements.scoreCard.hidden =
        true;

      return;
    }

    elements.scoreCard.hidden =
      false;

    elements.score.textContent =
      formattedScore;
  }


  function renderDescription(description) {
    elements.description.textContent =
      description ||
      "No description has been added to this catalogue entry yet.";
  }


  function renderThemes(tags) {
    elements.themes.innerHTML =
      "";

    if (!tags.length) {
      elements.themesSection.hidden =
        true;

      return;
    }

    elements.themesSection.hidden =
      false;

    tags.forEach((tag) => {
      const theme =
        document.createElement(
          "span"
        );

      theme.className =
        "detail-theme";

      theme.textContent =
        formatLabel(tag);

      elements.themes.append(
        theme
      );
    });
  }


  /* =======================================================
     FACT RENDERING
     ======================================================= */

  function renderFacts(title) {
    elements.factsGrid.innerHTML =
      "";

    const facts =
      buildFacts(title);

    elements.factsEmpty.hidden =
      facts.length > 0;

    facts.forEach((fact) => {
      const factElement =
        document.createElement(
          "div"
        );

      factElement.className =
        "detail-fact";


      const factLabel =
        document.createElement(
          "span"
        );

      factLabel.textContent =
        fact.label;


      const factValue =
        document.createElement(
          "strong"
        );

      factValue.textContent =
        fact.value;


      factElement.append(
        factLabel,
        factValue
      );

      elements.factsGrid.append(
        factElement
      );
    });
  }


  function buildFacts(title) {
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

    if (alreadyExists) {
      return;
    }

    facts.push({
      label,
      value:
        cleanValue
    });
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

    if (Array.isArray(value)) {
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


  function formatLabel(value) {
    const text =
      String(
        value ||
        ""
      ).trim();

    if (!text) {
      return "";
    }

    if (
      text === text.toUpperCase() &&
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

    return start || end;
  }


  function formatDateValue(value) {
    if (
      value == null ||
      value === ""
    ) {
      return "";
    }

    if (Array.isArray(value)) {
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
        Number.isFinite(year)
      ) {
        if (
          Number.isFinite(month) &&
          Number.isFinite(day)
        ) {
          const date =
            new Date(
              year,
              month - 1,
              day
            );

          return new Intl.DateTimeFormat(
            undefined,
            {
              year:
                "numeric",

              month:
                "short",

              day:
                "numeric"
            }
          ).format(date);
        }

        if (
          Number.isFinite(month)
        ) {
          const date =
            new Date(
              year,
              month - 1,
              1
            );

          return new Intl.DateTimeFormat(
            undefined,
            {
              year:
                "numeric",

              month:
                "short"
            }
          ).format(date);
        }

        return String(year);
      }

      return formatInformationValue(
        value
      );
    }

    return String(value).trim();
  }


  function getDateFactLabel(mediaMode) {
    if (
      mediaMode === "anime"
    ) {
      return "Aired";
    }

    if (
      mediaMode === "game"
    ) {
      return "Released";
    }

    return "Published";
  }


  /* =======================================================
     MEDIA MODE
     ======================================================= */

  function getMediaMode(types) {
    const typeText =
      types
        .map(
          normalizeText
        )
        .join(" ");

    if (
      typeText.includes("game") ||
      typeText.includes("visual novel")
    ) {
      return "game";
    }

    if (
      typeText.includes("anime") ||
      typeText.includes("film") ||
      typeText.includes("movie") ||
      typeText.includes("television") ||
      typeText.includes("tv")
    ) {
      return "anime";
    }

    if (
      typeText.includes("novel") ||
      typeText.includes("book")
    ) {
      return "novel";
    }

    return "manga";
  }


  function configureProgressStatus(title) {
    const mediaMode =
      getMediaMode(
        title.types
      );

    if (
      mediaMode === "anime"
    ) {
      elements.progressStatusLabel.textContent =
        "Watching";

      return;
    }

    if (
      mediaMode === "game"
    ) {
      elements.progressStatusLabel.textContent =
        "Playing";

      return;
    }

    elements.progressStatusLabel.textContent =
      "Reading";
  }


  function getLibraryStatusLabel(status) {
    const mediaMode =
      currentTitle
        ? getMediaMode(
            currentTitle.types
          )
        : "manga";

    const inProgressLabel =
      mediaMode === "anime"
        ? "Watching"
        : mediaMode === "game"
          ? "Playing"
          : "Reading";

    const labels = {
      "in-progress":
        inProgressLabel,

      completed:
        "Completed",

      planned:
        "Planned",

      paused:
        "Paused",

      dropped:
        "Dropped"
    };

    return (
      labels[status] ||
      "In library"
    );
  }


  /* =======================================================
     SIMILAR TITLES
     ======================================================= */

  function configureSimilarLink(title) {
    if (
      title.genres.length
    ) {
      elements.similarLink.href =
        `search.html?genre=${
          encodeURIComponent(
            normalizeSearchParameter(
              title.genres[0]
            )
          )
        }`;

      return;
    }

    elements.similarLink.href =
      `search.html?type=${
        encodeURIComponent(
          normalizeSearchParameter(
            title.types[0]
          )
        )
      }`;
  }


  /* =======================================================
     LOCAL LIBRARY
     ======================================================= */

  function readLibrary() {
    try {
      const storedValue =
        window.localStorage.getItem(
          LIBRARY_STORAGE_KEY
        );

      if (!storedValue) {
        return [];
      }

      const parsedValue =
        JSON.parse(
          storedValue
        );

      return Array.isArray(
        parsedValue
      )
        ? parsedValue
        : [];
    } catch (error) {
      console.error(
        "Could not read the local library:",
        error
      );

      return [];
    }
  }


  function writeLibrary(items) {
    try {
      window.localStorage.setItem(
        LIBRARY_STORAGE_KEY,
        JSON.stringify(items)
      );

      return true;
    } catch (error) {
      console.error(
        "Could not save the local library:",
        error
      );

      return false;
    }
  }


  function findCurrentLibraryItem() {
    if (!currentTitle) {
      return null;
    }

    return (
      readLibrary().find((item) => {
        return (
          String(item.id) ===
          String(currentTitle.id)
        );
      }) ||
      null
    );
  }


  function saveCurrentTitle(status) {
    if (!currentTitle) {
      return;
    }

    const library =
      readLibrary();

    const existingIndex =
      library.findIndex((item) => {
        return (
          String(item.id) ===
          String(currentTitle.id)
        );
      });

    const existingItem =
      existingIndex >= 0
        ? library[existingIndex]
        : null;

    const libraryItem = {
      id:
        currentTitle.id,

      title:
        currentTitle.title,

      creator:
        currentTitle.creator,

      type: [
        ...currentTitle.types
      ],

      genres: [
        ...currentTitle.genres
      ],

      coverUrl:
        currentTitle.coverUrl,

      status,

      addedAt:
        existingItem?.addedAt ||
        Date.now(),

      updatedAt:
        Date.now()
    };

    if (
      existingIndex >= 0
    ) {
      library[
        existingIndex
      ] = libraryItem;
    } else {
      library.push(
        libraryItem
      );
    }

    const saved =
      writeLibrary(
        library
      );

    elements.libraryNote.textContent =
      saved
        ? `${currentTitle.title} was saved as ${getLibraryStatusLabel(
            status
          )}.`
        : "Your browser prevented this title from being saved.";

    synchronizeLibraryInterface();
    closeLibraryMenu();
  }


  function removeCurrentTitle() {
    if (!currentTitle) {
      return;
    }

    const filteredLibrary =
      readLibrary().filter((item) => {
        return (
          String(item.id) !==
          String(currentTitle.id)
        );
      });

    const saved =
      writeLibrary(
        filteredLibrary
      );

    elements.libraryNote.textContent =
      saved
        ? `${currentTitle.title} was removed from your library.`
        : "Your browser prevented this change from being saved.";

    synchronizeLibraryInterface();
    closeLibraryMenu();
  }


  function synchronizeLibraryInterface() {
    const savedItem =
      findCurrentLibraryItem();

    elements.libraryStatusButtons
      .forEach((button) => {
        const selected =
          Boolean(
            savedItem &&
            button.dataset.libraryStatus ===
            savedItem.status
          );

        button.setAttribute(
          "aria-checked",
          String(selected)
        );
      });

    elements.libraryRemove.hidden =
      !savedItem;

    if (!savedItem) {
      elements.libraryTriggerIcon.className =
        "ti ti-plus";

      elements.libraryTriggerLabel.textContent =
        "Add to library";

      return;
    }

    elements.libraryTriggerIcon.className =
      "ti ti-check";

    elements.libraryTriggerLabel.textContent =
      `In library · ${getLibraryStatusLabel(
        savedItem.status
      )}`;
  }


  /* =======================================================
     LIBRARY MENU
     ======================================================= */

  function openLibraryMenu(
    focusFirstItem = false
  ) {
    libraryMenuOpen =
      true;

    elements.libraryPicker.classList.add(
      "is-open"
    );

    elements.libraryMenu.hidden =
      false;

    elements.libraryTrigger.setAttribute(
      "aria-expanded",
      "true"
    );

    if (focusFirstItem) {
      const selectedButton =
        elements.libraryStatusButtons.find((button) => {
          return (
            button.getAttribute(
              "aria-checked"
            ) === "true"
          );
        });

      (
        selectedButton ||
        elements.libraryStatusButtons[0]
      )?.focus();
    }
  }


  function closeLibraryMenu(
    returnFocus = false
  ) {
    if (!libraryMenuOpen) {
      return;
    }

    libraryMenuOpen =
      false;

    elements.libraryPicker.classList.remove(
      "is-open"
    );

    elements.libraryMenu.hidden =
      true;

    elements.libraryTrigger.setAttribute(
      "aria-expanded",
      "false"
    );

    if (returnFocus) {
      elements.libraryTrigger.focus();
    }
  }


  function handleLibraryMenuKeydown(event) {
    const menuButtons = [
      ...elements.libraryMenu.querySelectorAll(
        "button:not([hidden])"
      )
    ];

    const currentIndex =
      menuButtons.indexOf(
        document.activeElement
      );

    if (
      event.key === "ArrowDown"
    ) {
      event.preventDefault();

      const nextIndex =
        currentIndex < 0
          ? 0
          : (
              currentIndex +
              1
            ) %
            menuButtons.length;

      menuButtons[
        nextIndex
      ]?.focus();

      return;
    }

    if (
      event.key === "ArrowUp"
    ) {
      event.preventDefault();

      const previousIndex =
        currentIndex <= 0
          ? menuButtons.length - 1
          : currentIndex - 1;

      menuButtons[
        previousIndex
      ]?.focus();

      return;
    }

    if (
      event.key === "Home"
    ) {
      event.preventDefault();

      menuButtons[0]?.focus();

      return;
    }

    if (
      event.key === "End"
    ) {
      event.preventDefault();

      menuButtons[
        menuButtons.length - 1
      ]?.focus();

      return;
    }

    if (
      event.key === "Escape"
    ) {
      event.preventDefault();

      closeLibraryMenu(
        true
      );
    }
  }


  /* =======================================================
     PAGE EVENTS
     ======================================================= */

  function bindEvents() {
    elements.retryButton.addEventListener(
      "click",
      () => {
        window.location.reload();
      }
    );


    elements.backButton.addEventListener(
      "click",
      handleBackToResults
    );


    elements.libraryTrigger.addEventListener(
      "click",
      () => {
        if (libraryMenuOpen) {
          closeLibraryMenu();
        } else {
          openLibraryMenu();
        }
      }
    );


    elements.libraryTrigger.addEventListener(
      "keydown",
      (event) => {
        if (
          event.key === "ArrowDown" ||
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();

          openLibraryMenu(
            true
          );
        }
      }
    );


    elements.libraryStatusButtons
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            saveCurrentTitle(
              button.dataset.libraryStatus
            );
          }
        );
      });


    elements.libraryRemove.addEventListener(
      "click",
      removeCurrentTitle
    );


    elements.libraryMenu.addEventListener(
      "keydown",
      handleLibraryMenuKeydown
    );


    document.addEventListener(
      "click",
      (event) => {
        if (
          !event.target.closest(
            "[data-detail-library-picker]"
          )
        ) {
          closeLibraryMenu();
        }
      }
    );


    document.addEventListener(
      "keydown",
      (event) => {
        if (
          event.key === "Escape"
        ) {
          closeLibraryMenu(
            true
          );
        }
      }
    );
  }


  /* =======================================================
     RETURN TO SEARCH RESULTS
     ======================================================= */

  function handleBackToResults() {
    try {
      if (!document.referrer) {
        window.location.href =
          "search.html";

        return;
      }

      const referrer =
        new URL(
          document.referrer
        );

      const cameFromSearch =
        referrer.origin ===
          window.location.origin &&
        referrer.pathname
          .toLowerCase()
          .endsWith(
            "/search.html"
          );

      if (cameFromSearch) {
        window.history.back();
      } else {
        window.location.href =
          "search.html";
      }
    } catch {
      window.location.href =
        "search.html";
    }
  }


  /* =======================================================
     PAGE STATES
     ======================================================= */

  function showContent() {
    elements.loading.hidden =
      true;

    elements.error.hidden =
      true;

    elements.content.hidden =
      false;
  }


  function showError(message) {
    elements.loading.hidden =
      true;

    elements.content.hidden =
      true;

    elements.error.hidden =
      false;

    elements.errorMessage.textContent =
      message;

    elements.breadcrumbTitle.textContent =
      "Title unavailable";

    document.title =
      "Title Unavailable | Inkwell";
  }
})();