// search.js
// Inkwell catalogue search, filters, custom sorting,
// result cards, URL state, and pagination.

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


  /* =======================================================
     SEARCH CONFIGURATION
     ======================================================= */

  const DATABASE_BATCH_SIZE =
    1000;

  const DATABASE_TIMEOUT_MS =
    15000;

  const SEARCH_DEBOUNCE_MS =
    220;

  const MAX_SEARCH_SUGGESTIONS =
    6;

  const COLLAPSED_GENRE_LIMIT =
    10;

  const DEFAULT_PER_PAGE =
    12;

  const ALLOWED_PER_PAGE = [
    12,
    24,
    48
  ];

  const ALLOWED_SORT_OPTIONS =
    new Set([
      "relevance",
      "score-desc",
      "score-asc",
      "title-asc",
      "title-desc"
    ]);

  const PREFERRED_TYPE_ORDER = [
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
  ];


  /* =======================================================
     APPLICATION STATE
     ======================================================= */

  let supabaseClient =
    null;

  let catalogue =
    [];

  let currentResults =
    [];

  let searchTimer =
    null;

  let suggestionIndex =
    -1;

  let currentSuggestions =
    [];

  let isCatalogueLoaded =
    false;


  const state = {
    query: "",

    selectedTypes:
      new Set(),

    selectedGenres:
      new Set(),

    minimumScore:
      0,

    featuredOnly:
      false,

    sort:
      "relevance",

    page:
      1,

    perPage:
      DEFAULT_PER_PAGE,

    showAllGenres:
      false
  };


  const elements = {};


  /* =======================================================
     STARTUP
     ======================================================= */

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      startSearchPage,
      {
        once: true
      }
    );
  } else {
    startSearchPage();
  }


  async function startSearchPage() {
    collectElements();

    if (!hasRequiredElements()) {
      console.error(
        "Search page is missing one or more required elements.",
        elements
      );

      return;
    }

    bindEvents();
    initializeCustomSelects();
    readStateFromUrl();
    syncStaticControls();
    renderLoadingSkeletons(
      DEFAULT_PER_PAGE
    );

    if (!window.supabase?.createClient) {
      showError(
        "The Supabase browser library did not load. " +
        "Check that its script appears before search.js."
      );

      return;
    }

    supabaseClient =
      window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
      );

    await loadAndRenderCatalogue();
  }


  /* =======================================================
     ELEMENT COLLECTION
     ======================================================= */

  function collectElements() {
    elements.searchForm =
      document.getElementById(
        "catalogue-search-form"
      );

    elements.searchInput =
      document.getElementById(
        "catalogue-search-input"
      );

    elements.searchClear =
      document.getElementById(
        "catalogue-search-clear"
      );

    elements.suggestions =
      document.getElementById(
        "search-suggestions"
      );

    elements.filterPanel =
      document.getElementById(
        "filter-panel"
      );

    elements.filterPanelClose =
      document.getElementById(
        "filter-panel-close"
      );

    elements.filterOverlay =
      document.getElementById(
        "filter-drawer-overlay"
      );

    elements.mobileFilterButton =
      document.getElementById(
        "mobile-filter-button"
      );

    elements.mobileFilterCount =
      document.getElementById(
        "mobile-filter-count"
      );

    elements.formatFilterList =
      document.getElementById(
        "format-filter-list"
      );

    elements.genreFilterList =
      document.getElementById(
        "genre-filter-list"
      );

    elements.genreShowMore =
      document.getElementById(
        "genre-show-more"
      );

    elements.featuredFilterGroup =
      document.getElementById(
        "featured-filter-group"
      );

    elements.featuredFilter =
      document.getElementById(
        "featured-filter"
      );

    elements.clearAllFilters =
      document.getElementById(
        "clear-all-filters"
      );

    elements.resultsStatus =
      document.getElementById(
        "results-status"
      );

    elements.resultsHeading =
      document.getElementById(
        "results-heading"
      );

    elements.activeFilters =
      document.getElementById(
        "active-filters"
      );

    elements.activeFilterList =
      document.getElementById(
        "active-filter-list"
      );

    elements.activeFiltersClear =
      document.getElementById(
        "active-filters-clear"
      );

    elements.loading =
      document.getElementById(
        "results-loading"
      );

    elements.error =
      document.getElementById(
        "results-error"
      );

    elements.errorMessage =
      document.getElementById(
        "results-error-message"
      );

    elements.retry =
      document.getElementById(
        "retry-results"
      );

    elements.empty =
      document.getElementById(
        "results-empty"
      );

    elements.emptyCopy =
      document.getElementById(
        "results-empty-copy"
      );

    elements.emptyClearFilters =
      document.getElementById(
        "empty-clear-filters"
      );

    elements.emptyBrowseAll =
      document.getElementById(
        "empty-browse-all"
      );

    elements.resultsGrid =
      document.getElementById(
        "results-grid"
      );

    elements.pagination =
      document.getElementById(
        "results-pagination"
      );

    elements.cardTemplate =
      document.getElementById(
        "story-card-template"
      );

    elements.customSelects = [
      ...document.querySelectorAll(
        "[data-custom-select]"
      )
    ];
  }


  function hasRequiredElements() {
    return Boolean(
      elements.searchForm &&
      elements.searchInput &&
      elements.searchClear &&
      elements.suggestions &&
      elements.filterPanel &&
      elements.filterPanelClose &&
      elements.filterOverlay &&
      elements.mobileFilterButton &&
      elements.mobileFilterCount &&
      elements.formatFilterList &&
      elements.genreFilterList &&
      elements.genreShowMore &&
      elements.featuredFilterGroup &&
      elements.featuredFilter &&
      elements.clearAllFilters &&
      elements.resultsStatus &&
      elements.resultsHeading &&
      elements.activeFilters &&
      elements.activeFilterList &&
      elements.activeFiltersClear &&
      elements.loading &&
      elements.error &&
      elements.errorMessage &&
      elements.retry &&
      elements.empty &&
      elements.emptyCopy &&
      elements.emptyClearFilters &&
      elements.emptyBrowseAll &&
      elements.resultsGrid &&
      elements.pagination &&
      elements.cardTemplate &&
      elements.customSelects.length === 2
    );
  }


  /* =======================================================
     DATABASE LOADING
     ======================================================= */

  async function loadAndRenderCatalogue() {
    setLoadingState(true);

    try {
      const loadedCatalogue =
        await withTimeout(
          loadCatalogue(),
          DATABASE_TIMEOUT_MS,
          "The catalogue request timed out."
        );

      catalogue =
        loadedCatalogue;

      isCatalogueLoaded =
        true;

      if (!catalogue.length) {
        showEmptyCatalogueState();
        return;
      }

      elements.featuredFilterGroup.hidden =
        !catalogue.some((item) => {
          return item.featured;
        });

      applyStateAndRender({
        historyMode:
          "replace",

        announce:
          false
      });
    } catch (error) {
      console.error(
        "INKWELL SEARCH: catalogue load failed.",
        error
      );

      showError(
        error?.message ||
        "Supabase returned an unknown error."
      );
    }
  }


  async function loadCatalogue() {
    const rows =
      [];

    let from =
      0;

    while (true) {
      const to =
        from +
        DATABASE_BATCH_SIZE -
        1;

      const {
        data,
        error
      } = await supabaseClient
        .from(TABLE_NAME)
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

      const page =
        Array.isArray(data)
          ? data
          : [];

      rows.push(...page);

      if (
        page.length <
        DATABASE_BATCH_SIZE
      ) {
        break;
      }

      from +=
        DATABASE_BATCH_SIZE;
    }

    const normalized =
      normalizeCatalogue(rows);

    console.log(
      `INKWELL SEARCH: received ${rows.length} rows ` +
      `and normalized ${normalized.length} stories.`
    );

    return normalized;
  }


  function withTimeout(
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
                  new Error(message)
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


  /* =======================================================
     DATABASE NORMALIZATION
     ======================================================= */

  function normalizeCatalogue(rows) {
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
        normalizeStory(row);

      uniqueItems.set(
        item.id,
        item
      );
    });

    return [
      ...uniqueItems.values()
    ];
  }


  function normalizeStory(row) {
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

          ...types.map(
            (item) => {
              return item.label;
            }
          ),

          ...genres.map(
            (item) => {
              return item.label;
            }
          ),

          ...tags.map(
            (item) => {
              return item.label;
            }
          )
        ].join(" ")
      );

    return {
      id:
        String(row.id),

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
          row.id
        ),

      searchText,

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
     VALUE NORMALIZATION
     ======================================================= */

  function normalizeValueList(value) {
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
          return String(
            entry
          ).trim();
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
          return String(
            entry
          ).trim();
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
        // Continue with normal delimiter splitting.
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


  function normalizeFacetList(
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


  function normalizeSearchText(value) {
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


  function normalizeFacetKey(value) {
    return normalizeSearchText(
      value
    ).replace(
      /\s+/g,
      "-"
    );
  }


  function formatKeyAsLabel(key) {
    return String(
      key ||
      ""
    )
      .split("-")
      .filter(Boolean)
      .map((word) => {
        return (
          word
            .charAt(0)
            .toUpperCase() +
          word.slice(1)
        );
      })
      .join(" ");
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


  /* =======================================================
     EVENT BINDING
     ======================================================= */

  function bindEvents() {
    elements.searchForm.addEventListener(
      "submit",
      handleSearchSubmit
    );

    elements.searchInput.addEventListener(
      "input",
      handleSearchInput
    );

    elements.searchInput.addEventListener(
      "keydown",
      handleSearchKeydown
    );

    elements.searchInput.addEventListener(
      "focus",
      () => {
        if (
          elements.searchInput
            .value
            .trim()
            .length >= 2 &&
          isCatalogueLoaded
        ) {
          renderSuggestions(
            elements.searchInput
              .value
          );
        }
      }
    );

    elements.searchClear.addEventListener(
      "click",
      clearSearchQuery
    );

    elements.suggestions.addEventListener(
      "click",
      handleSuggestionClick
    );

    elements.filterPanel.addEventListener(
      "change",
      handleFilterChange
    );

    elements.genreShowMore.addEventListener(
      "click",
      toggleAllGenres
    );

    elements.clearAllFilters.addEventListener(
      "click",
      () => {
        clearFilters(
          "push"
        );
      }
    );

    elements.activeFilterList.addEventListener(
      "click",
      handleActiveFilterClick
    );

    elements.activeFiltersClear.addEventListener(
      "click",
      () => {
        clearFilters(
          "push"
        );
      }
    );

    elements.pagination.addEventListener(
      "click",
      handlePaginationClick
    );

    elements.mobileFilterButton.addEventListener(
      "click",
      openFilterDrawer
    );

    elements.filterPanelClose.addEventListener(
      "click",
      closeFilterDrawer
    );

    elements.filterOverlay.addEventListener(
      "click",
      closeFilterDrawer
    );

    elements.emptyClearFilters.addEventListener(
      "click",
      () => {
        clearFilters(
          "push"
        );
      }
    );

    elements.emptyBrowseAll.addEventListener(
      "click",
      browseAllStories
    );

    elements.retry.addEventListener(
      "click",
      loadAndRenderCatalogue
    );

    document.addEventListener(
      "click",
      handleDocumentClick
    );

    document.addEventListener(
      "keydown",
      handleDocumentKeydown
    );

    window.addEventListener(
      "popstate",
      handleHistoryNavigation
    );

    window.addEventListener(
      "resize",
      () => {
        if (
          window.innerWidth >
          980
        ) {
          closeFilterDrawer(
            false
          );
        }
      }
    );
  }


  /* =======================================================
     CUSTOM SELECT CONTROLS
     ======================================================= */

  function initializeCustomSelects() {
    elements.customSelects.forEach(
      (select) => {
        const trigger =
          select.querySelector(
            "[data-select-trigger]"
          );

        const menu =
          select.querySelector(
            "[data-select-menu]"
          );

        const options = [
          ...menu.querySelectorAll(
            "[data-option-value]"
          )
        ];

        trigger.addEventListener(
          "click",
          () => {
            if (
              select.classList.contains(
                "is-open"
              )
            ) {
              closeCustomSelect(
                select
              );
            } else {
              openCustomSelect(
                select
              );
            }
          }
        );

        trigger.addEventListener(
          "keydown",
          (event) => {
            handleCustomSelectTriggerKeydown(
              event,
              select
            );
          }
        );

        menu.addEventListener(
          "click",
          (event) => {
            const option =
              event.target.closest(
                "[data-option-value]"
              );

            if (option) {
              chooseCustomSelectOption(
                select,
                option.dataset
                  .optionValue
              );
            }
          }
        );

        menu.addEventListener(
          "keydown",
          (event) => {
            handleCustomSelectMenuKeydown(
              event,
              select
            );
          }
        );

        options.forEach(
          (option) => {
            option.setAttribute(
              "aria-selected",
              "false"
            );

            option.tabIndex =
              -1;
          }
        );
      }
    );
  }


  function openCustomSelect(select) {
    closeAllCustomSelects(
      select
    );

    const trigger =
      select.querySelector(
        "[data-select-trigger]"
      );

    const menu =
      select.querySelector(
        "[data-select-menu]"
      );

    select.classList.add(
      "is-open"
    );

    menu.hidden =
      false;

    trigger.setAttribute(
      "aria-expanded",
      "true"
    );

    const selected =
      menu.querySelector(
        '[aria-selected="true"]'
      ) ||
      menu.querySelector(
        "[data-option-value]"
      );

    updateCustomSelectHighlight(
      select,
      selected
    );
  }


  function closeCustomSelect(
    select,
    returnFocus = false
  ) {
    const trigger =
      select.querySelector(
        "[data-select-trigger]"
      );

    const menu =
      select.querySelector(
        "[data-select-menu]"
      );

    select.classList.remove(
      "is-open"
    );

    menu.hidden =
      true;

    trigger.setAttribute(
      "aria-expanded",
      "false"
    );

    menu
      .querySelectorAll(
        "[data-option-value]"
      )
      .forEach((option) => {
        option.classList.remove(
          "is-active"
        );

        option.tabIndex =
          -1;
      });

    if (returnFocus) {
      trigger.focus();
    }
  }


  function closeAllCustomSelects(
    except = null
  ) {
    elements.customSelects.forEach(
      (select) => {
        if (select !== except) {
          closeCustomSelect(
            select
          );
        }
      }
    );
  }


  function chooseCustomSelectOption(
    select,
    value
  ) {
    const option =
      select.querySelector(
        `[data-option-value="${
          CSS.escape(
            String(value)
          )
        }"]`
      );

    if (!option) {
      return;
    }

    select.dataset.value =
      String(value);

    select
      .querySelector(
        "[data-select-value]"
      )
      .textContent =
        option.textContent.trim();

    select
      .querySelectorAll(
        "[data-option-value]"
      )
      .forEach((item) => {
        item.setAttribute(
          "aria-selected",
          String(
            item === option
          )
        );
      });

    closeCustomSelect(
      select,
      true
    );

    if (
      select.querySelector(
        "#sort-select-trigger"
      )
    ) {
      state.sort =
        ALLOWED_SORT_OPTIONS.has(
          value
        )
          ? value
          : "relevance";
    } else {
      const requested =
        Number(value);

      state.perPage =
        ALLOWED_PER_PAGE.includes(
          requested
        )
          ? requested
          : DEFAULT_PER_PAGE;
    }

    state.page =
      1;

    applyStateAndRender({
      historyMode:
        "push"
    });
  }


  function handleCustomSelectTriggerKeydown(
    event,
    select
  ) {
    if (
      event.key === "ArrowDown" ||
      event.key === "ArrowUp" ||
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();

      openCustomSelect(
        select
      );

      const menu =
        select.querySelector(
          "[data-select-menu]"
        );

      const selected =
        menu.querySelector(
          '[aria-selected="true"]'
        ) ||
        menu.querySelector(
          "[data-option-value]"
        );

      selected?.focus();
    }
  }


  function handleCustomSelectMenuKeydown(
    event,
    select
  ) {
    const options = [
      ...select.querySelectorAll(
        "[data-option-value]"
      )
    ];

    const currentIndex =
      options.indexOf(
        document.activeElement
      );

    if (
      event.key ===
      "ArrowDown"
    ) {
      event.preventDefault();

      const next =
        options[
          Math.min(
            currentIndex + 1,
            options.length - 1
          )
        ];

      updateCustomSelectHighlight(
        select,
        next
      );

      next?.focus();

      return;
    }

    if (
      event.key ===
      "ArrowUp"
    ) {
      event.preventDefault();

      const previous =
        options[
          Math.max(
            currentIndex - 1,
            0
          )
        ];

      updateCustomSelectHighlight(
        select,
        previous
      );

      previous?.focus();

      return;
    }

    if (
      event.key ===
      "Home"
    ) {
      event.preventDefault();

      updateCustomSelectHighlight(
        select,
        options[0]
      );

      options[0]?.focus();

      return;
    }

    if (
      event.key ===
      "End"
    ) {
      event.preventDefault();

      const last =
        options[
          options.length - 1
        ];

      updateCustomSelectHighlight(
        select,
        last
      );

      last?.focus();

      return;
    }

    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();

      const option =
        document.activeElement
          .closest?.(
            "[data-option-value]"
          );

      if (option) {
        chooseCustomSelectOption(
          select,
          option.dataset
            .optionValue
        );
      }

      return;
    }

    if (
      event.key === "Escape" ||
      event.key === "Tab"
    ) {
      closeCustomSelect(
        select,
        event.key === "Escape"
      );
    }
  }


  function updateCustomSelectHighlight(
    select,
    activeOption
  ) {
    select
      .querySelectorAll(
        "[data-option-value]"
      )
      .forEach((option) => {
        option.classList.toggle(
          "is-active",
          option === activeOption
        );
      });
  }


  function syncCustomSelect(
    select,
    value
  ) {
    const option =
      select.querySelector(
        `[data-option-value="${
          CSS.escape(
            String(value)
          )
        }"]`
      );

    if (!option) {
      return;
    }

    select.dataset.value =
      String(value);

    select
      .querySelector(
        "[data-select-value]"
      )
      .textContent =
        option.textContent.trim();

    select
      .querySelectorAll(
        "[data-option-value]"
      )
      .forEach((item) => {
        item.setAttribute(
          "aria-selected",
          String(
            item === option
          )
        );
      });
  }


  /* =======================================================
     SEARCH INPUT
     ======================================================= */

  function handleSearchSubmit(event) {
    event.preventDefault();

    window.clearTimeout(
      searchTimer
    );

    state.query =
      elements.searchInput
        .value
        .trim();

    state.page =
      1;

    closeSuggestions();

    applyStateAndRender({
      historyMode:
        "push"
    });
  }


  function handleSearchInput() {
    const value =
      elements.searchInput.value;

    elements.searchClear.hidden =
      !value;

    window.clearTimeout(
      searchTimer
    );

    if (
      value.trim().length >= 2 &&
      isCatalogueLoaded
    ) {
      renderSuggestions(
        value
      );
    } else {
      closeSuggestions();
    }

    searchTimer =
      window.setTimeout(
        () => {
          state.query =
            value.trim();

          state.page =
            1;

          if (
            isCatalogueLoaded
          ) {
            applyStateAndRender({
              historyMode:
                "replace"
            });
          }
        },
        SEARCH_DEBOUNCE_MS
      );
  }


  function handleSearchKeydown(event) {
    const suggestionsVisible =
      !elements.suggestions.hidden &&
      currentSuggestions.length > 0;

    if (
      event.key ===
      "ArrowDown"
    ) {
      if (
        !suggestionsVisible
      ) {
        renderSuggestions(
          elements.searchInput
            .value
        );
      }

      if (
        !currentSuggestions.length
      ) {
        return;
      }

      event.preventDefault();

      suggestionIndex =
        Math.min(
          suggestionIndex + 1,
          currentSuggestions.length - 1
        );

      updateSuggestionHighlight();

      return;
    }

    if (
      event.key ===
      "ArrowUp"
    ) {
      if (
        !currentSuggestions.length
      ) {
        return;
      }

      event.preventDefault();

      suggestionIndex =
        Math.max(
          suggestionIndex - 1,
          0
        );

      updateSuggestionHighlight();

      return;
    }

    if (
      event.key === "Enter" &&
      suggestionsVisible &&
      suggestionIndex >= 0
    ) {
      event.preventDefault();

      selectSuggestion(
        currentSuggestions[
          suggestionIndex
        ]
      );

      return;
    }

    if (
      event.key ===
      "Escape"
    ) {
      closeSuggestions();
    }
  }


  function clearSearchQuery() {
    window.clearTimeout(
      searchTimer
    );

    elements.searchInput.value =
      "";

    elements.searchClear.hidden =
      true;

    state.query =
      "";

    state.page =
      1;

    closeSuggestions();

    applyStateAndRender({
      historyMode:
        "push"
    });

    elements.searchInput.focus();
  }


  function browseAllStories() {
    state.query =
      "";

    elements.searchInput.value =
      "";

    elements.searchClear.hidden =
      true;

    clearFilterState();

    state.page =
      1;

    closeSuggestions();

    applyStateAndRender({
      historyMode:
        "push"
    });

    elements.searchInput.focus();
  }


  /* =======================================================
     SEARCH SUGGESTIONS
     ======================================================= */

  function renderSuggestions(value) {
    const query =
      String(
        value ||
        ""
      ).trim();

    if (
      query.length < 2 ||
      !catalogue.length
    ) {
      closeSuggestions();
      return;
    }

    currentSuggestions =
      buildRankedEntries(
        query
      )
        .sort((a, b) => {
          return (
            b.rank -
            a.rank ||

            compareScoreDescending(
              a.item,
              b.item
            ) ||

            compareTitleAscending(
              a.item,
              b.item
            )
          );
        })
        .slice(
          0,
          MAX_SEARCH_SUGGESTIONS
        )
        .map((entry) => {
          return entry.item;
        });

    suggestionIndex =
      -1;

    elements.suggestions.innerHTML =
      "";

    if (
      !currentSuggestions.length
    ) {
      closeSuggestions();
      return;
    }

    currentSuggestions.forEach(
      (
        item,
        index
      ) => {
        const button =
          document.createElement(
            "button"
          );

        button.type =
          "button";

        button.className =
          "search-suggestion";

        button.id =
          `search-suggestion-${index}`;

        button.dataset.suggestionIndex =
          String(index);

        button.setAttribute(
          "role",
          "option"
        );

        button.setAttribute(
          "aria-selected",
          "false"
        );


        const cover =
          document.createElement(
            "span"
          );

        cover.className =
          "search-suggestion-cover";


        const image =
          document.createElement(
            "img"
          );

        image.src =
          item.coverUrl;

        image.alt =
          "";

        image.loading =
          "lazy";

        image.addEventListener(
          "error",
          () => {
            image.remove();
          },
          {
            once: true
          }
        );

        cover.append(
          image
        );


        const info =
          document.createElement(
            "span"
          );

        info.className =
          "search-suggestion-info";


        const title =
          document.createElement(
            "strong"
          );

        title.textContent =
          item.title;


        const meta =
          document.createElement(
            "small"
          );

        meta.textContent =
          [
            item.creator,
            getPrimaryTypeLabel(
              item
            )
          ]
            .filter(Boolean)
            .join(" · ");

        info.append(
          title,
          meta
        );


        const score =
          document.createElement(
            "span"
          );

        score.className =
          "search-suggestion-score";

        const scoreValue =
          formatScore(
            item.score
          );

        score.textContent =
          scoreValue
            ? `★ ${scoreValue}`
            : "";


        button.append(
          cover,
          info,
          score
        );

        elements.suggestions.append(
          button
        );
      }
    );

    elements.suggestions.hidden =
      false;

    elements.searchInput.setAttribute(
      "aria-expanded",
      "true"
    );
  }


  function handleSuggestionClick(event) {
    const button =
      event.target.closest(
        "[data-suggestion-index]"
      );

    if (!button) {
      return;
    }

    const item =
      currentSuggestions[
        Number(
          button.dataset
            .suggestionIndex
        )
      ];

    if (item) {
      selectSuggestion(
        item
      );
    }
  }


  function selectSuggestion(item) {
    elements.searchInput.value =
      item.title;

    elements.searchClear.hidden =
      false;

    state.query =
      item.title;

    state.page =
      1;

    closeSuggestions();

    applyStateAndRender({
      historyMode:
        "push"
    });

    elements.searchInput.focus();
  }


  function updateSuggestionHighlight() {
    const buttons = [
      ...elements.suggestions
        .querySelectorAll(
          ".search-suggestion"
        )
    ];

    buttons.forEach(
      (
        button,
        index
      ) => {
        const active =
          index ===
          suggestionIndex;

        button.classList.toggle(
          "is-active",
          active
        );

        button.setAttribute(
          "aria-selected",
          String(active)
        );

        if (active) {
          elements.searchInput.setAttribute(
            "aria-activedescendant",
            button.id
          );

          button.scrollIntoView({
            block:
              "nearest"
          });
        }
      }
    );
  }


  function closeSuggestions() {
    currentSuggestions =
      [];

    suggestionIndex =
      -1;

    elements.suggestions.hidden =
      true;

    elements.suggestions.innerHTML =
      "";

    elements.searchInput.setAttribute(
      "aria-expanded",
      "false"
    );

    elements.searchInput.removeAttribute(
      "aria-activedescendant"
    );
  }


  /* =======================================================
     FILTER EVENTS
     ======================================================= */

  function handleFilterChange(event) {
    const target =
      event.target;

    if (
      target.matches(
        "[data-type-filter]"
      )
    ) {
      updateSetFromCheckbox(
        state.selectedTypes,
        target
      );
    } else if (
      target.matches(
        "[data-genre-filter]"
      )
    ) {
      updateSetFromCheckbox(
        state.selectedGenres,
        target
      );
    } else if (
      target.matches(
        "[data-score-filter]"
      )
    ) {
      state.minimumScore =
        Number(
          target.value
        ) || 0;
    } else if (
      target ===
      elements.featuredFilter
    ) {
      state.featuredOnly =
        target.checked;
    } else {
      return;
    }

    state.page =
      1;

    applyStateAndRender({
      historyMode:
        "push"
    });
  }


  function updateSetFromCheckbox(
    set,
    checkbox
  ) {
    if (
      checkbox.checked
    ) {
      set.add(
        checkbox.value
      );
    } else {
      set.delete(
        checkbox.value
      );
    }
  }


  function toggleAllGenres() {
    state.showAllGenres =
      !state.showAllGenres;

    applyStateAndRender({
      historyMode:
        null,

      announce:
        false
    });
  }


  function clearFilters(
    historyMode =
      "replace"
  ) {
    clearFilterState();

    state.page =
      1;

    applyStateAndRender({
      historyMode
    });
  }


  function clearFilterState() {
    state.selectedTypes.clear();
    state.selectedGenres.clear();

    state.minimumScore =
      0;

    state.featuredOnly =
      false;

    state.showAllGenres =
      false;
  }


  function handleActiveFilterClick(event) {
    const button =
      event.target.closest(
        "[data-remove-filter]"
      );

    if (!button) {
      return;
    }

    const kind =
      button.dataset
        .filterKind;

    const key =
      button.dataset
        .filterKey;

    if (
      kind ===
      "type"
    ) {
      state.selectedTypes.delete(
        key
      );
    } else if (
      kind ===
      "genre"
    ) {
      state.selectedGenres.delete(
        key
      );
    } else if (
      kind ===
      "score"
    ) {
      state.minimumScore =
        0;
    } else if (
      kind ===
      "featured"
    ) {
      state.featuredOnly =
        false;
    }

    state.page =
      1;

    applyStateAndRender({
      historyMode:
        "push"
    });
  }


  /* =======================================================
     SEARCH RANKING
     ======================================================= */

  function buildRankedEntries(query) {
    const normalizedQuery =
      normalizeSearchText(
        query
      );

    if (!normalizedQuery) {
      return catalogue.map(
        (item) => {
          return {
            item,
            rank: 0
          };
        }
      );
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
      item.alternativeTitleSearch
        .some((title) => {
          return (
            title ===
            query
          );
        })
    ) {
      rank +=
        155;
    } else if (
      item.alternativeTitleSearch
        .some((title) => {
          return title.startsWith(
            query
          );
        })
    ) {
      rank +=
        115;
    } else if (
      item.alternativeTitleSearch
        .some((title) => {
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


  /* =======================================================
     APPLY SEARCH STATE
     ======================================================= */

  function applyStateAndRender(
    options = {}
  ) {
    if (
      !isCatalogueLoaded
    ) {
      return;
    }

    const rankedEntries =
      buildRankedEntries(
        state.query
      );

    renderFacetFilters(
      rankedEntries
    );

    const filteredEntries =
      rankedEntries.filter(
        (entry) => {
          return passesFilters(
            entry.item
          );
        }
      );

    filteredEntries.sort(
      getResultComparator()
    );

    currentResults =
      filteredEntries;

    const totalPages =
      Math.max(
        1,
        Math.ceil(
          currentResults.length /
          state.perPage
        )
      );

    state.page =
      clamp(
        state.page,
        1,
        totalPages
      );

    renderResults();
    renderActiveFilters();
    syncStaticControls();
    updateMobileFilterCount();

    if (
      options.historyMode
    ) {
      writeStateToUrl(
        options.historyMode
      );
    }

    if (
      options.announce !==
      false
    ) {
      announceResultCount();
    }
  }


  function passesFilters(
    item,
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

    if (
      skipGroup !== "featured" &&
      state.featuredOnly &&
      !item.featured
    ) {
      return false;
    }

    return true;
  }


  /* =======================================================
     SORTING
     ======================================================= */

  function getResultComparator() {
    switch (
      state.sort
    ) {
      case "score-desc":
        return (
          a,
          b
        ) => {
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
        return (
          a,
          b
        ) => {
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
        return (
          a,
          b
        ) => {
          return compareTitleAscending(
            a.item,
            b.item
          );
        };


      case "title-desc":
        return (
          a,
          b
        ) => {
          return compareTitleDescending(
            a.item,
            b.item
          );
        };


      case "relevance":
      default:
        return compareByRelevance;
    }
  }


  function compareByRelevance(
    a,
    b
  ) {
    if (
      state.query &&
      b.rank !==
      a.rank
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


  function compareScoreDescending(
    a,
    b
  ) {
    return (
      b.score -
      a.score
    );
  }


  function compareScoreAscending(
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


  function compareTitleAscending(
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


  function compareTitleDescending(
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


  /* =======================================================
     FACET FILTERS
     ======================================================= */

  function renderFacetFilters(
    rankedEntries
  ) {
    const typeEntries =
      rankedEntries.filter(
        (entry) => {
          return passesFilters(
            entry.item,
            "type"
          );
        }
      );

    const genreEntries =
      rankedEntries.filter(
        (entry) => {
          return passesFilters(
            entry.item,
            "genre"
          );
        }
      );

    renderTypeFilters(
      buildFacetOptions(
        typeEntries,
        "types"
      )
    );

    renderGenreFilters(
      buildFacetOptions(
        genreEntries,
        "genres"
      )
    );
  }


  function buildFacetOptions(
    entries,
    property
  ) {
    const facets =
      new Map();

    entries.forEach((entry) => {
      entry.item[property]
        .forEach((facet) => {
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


  function renderTypeFilters(options) {
    const completeOptions = [
      ...options,

      ...getMissingSelectedOptions(
        state.selectedTypes,
        options
      )
    ];

    completeOptions.sort(
      compareTypeOptions
    );

    renderCheckboxOptions({
      container:
        elements.formatFilterList,

      options:
        completeOptions,

      selectedSet:
        state.selectedTypes,

      dataAttribute:
        "data-type-filter"
    });
  }


  function renderGenreFilters(options) {
    const completeOptions = [
      ...options,

      ...getMissingSelectedOptions(
        state.selectedGenres,
        options
      )
    ];

    completeOptions.sort(
      (
        a,
        b
      ) => {
        return (
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
    );

    const selectedOptions =
      completeOptions.filter(
        (option) => {
          return state.selectedGenres.has(
            option.key
          );
        }
      );

    const unselectedOptions =
      completeOptions.filter(
        (option) => {
          return !state.selectedGenres.has(
            option.key
          );
        }
      );

    let visibleOptions =
      completeOptions;

    if (
      !state.showAllGenres
    ) {
      const visibleMap =
        new Map();

      [
        ...selectedOptions,

        ...unselectedOptions.slice(
          0,
          COLLAPSED_GENRE_LIMIT
        )
      ].forEach((option) => {
        visibleMap.set(
          option.key,
          option
        );
      });

      visibleOptions = [
        ...visibleMap.values()
      ];
    }

    renderCheckboxOptions({
      container:
        elements.genreFilterList,

      options:
        visibleOptions,

      selectedSet:
        state.selectedGenres,

      dataAttribute:
        "data-genre-filter"
    });

    elements.genreShowMore.hidden =
      completeOptions.length <=
      COLLAPSED_GENRE_LIMIT;

    elements.genreShowMore.classList.toggle(
      "is-expanded",
      state.showAllGenres
    );

    const label =
      elements.genreShowMore.querySelector(
        "span"
      );

    if (label) {
      label.textContent =
        state.showAllGenres
          ? "Show fewer genres"
          : "Show all genres";
    }
  }


  function renderCheckboxOptions({
    container,
    options,
    selectedSet,
    dataAttribute
  }) {
    container.innerHTML =
      "";

    if (!options.length) {
      const empty =
        document.createElement(
          "p"
        );

      empty.className =
        "filter-option";

      empty.textContent =
        "No options available";

      container.append(
        empty
      );

      return;
    }

    options.forEach((option) => {
      const label =
        document.createElement(
          "label"
        );

      label.className =
        "filter-option";


      const input =
        document.createElement(
          "input"
        );

      input.type =
        "checkbox";

      input.value =
        option.key;

      input.checked =
        selectedSet.has(
          option.key
        );

      input.setAttribute(
        dataAttribute,
        ""
      );


      const name =
        document.createElement(
          "span"
        );

      name.className =
        "filter-option-main";

      name.textContent =
        option.label;


      const count =
        document.createElement(
          "span"
        );

      count.className =
        "filter-option-count";

      count.textContent =
        String(
          option.count
        );


      label.append(
        input,
        name,
        count
      );

      container.append(
        label
      );
    });
  }


  function getMissingSelectedOptions(
    selectedSet,
    existingOptions
  ) {
    const existingKeys =
      new Set(
        existingOptions.map(
          (option) => {
            return option.key;
          }
        )
      );

    return [
      ...selectedSet
    ]
      .filter((key) => {
        return !existingKeys.has(
          key
        );
      })
      .map((key) => {
        return {
          key,

          label:
            findFacetLabel(
              key
            ) ||
            formatKeyAsLabel(
              key
            ),

          count:
            0
        };
      });
  }


  function compareTypeOptions(
    a,
    b
  ) {
    const indexA =
      PREFERRED_TYPE_ORDER.indexOf(
        a.key
      );

    const indexB =
      PREFERRED_TYPE_ORDER.indexOf(
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


  function findFacetLabel(key) {
    for (
      const item
      of catalogue
    ) {
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


  /* =======================================================
     RESULTS
     ======================================================= */

  function renderResults() {
    setLoadingState(false);

    elements.error.hidden =
      true;

    elements.resultsGrid.innerHTML =
      "";

    updateResultsHeading();

    if (
      !currentResults.length
    ) {
      elements.empty.hidden =
        false;

      elements.resultsGrid.hidden =
        true;

      elements.pagination.hidden =
        true;

      elements.emptyCopy.textContent =
        state.query ||
        getActiveFilterCount()
          ? "Try removing a filter or searching with fewer words."
          : "No public stories were returned from the manga table. Check its rows and anonymous SELECT policy.";

      return;
    }

    elements.empty.hidden =
      true;

    elements.resultsGrid.hidden =
      false;

    const start =
      (
        state.page -
        1
      ) *
      state.perPage;

    const pageEntries =
      currentResults.slice(
        start,
        start +
        state.perPage
      );

    const fragment =
      document.createDocumentFragment();

    pageEntries.forEach((entry) => {
      fragment.append(
        createStoryCard(
          entry.item
        )
      );
    });

    elements.resultsGrid.append(
      fragment
    );

    renderPagination();
  }


  function createStoryCard(item) {
    const fragment =
      elements.cardTemplate
        .content
        .cloneNode(true);

    const card =
      fragment.querySelector(
        ".story-card"
      );

    const coverWrap =
      fragment.querySelector(
        ".story-card-cover"
      );

    const cover =
      fragment.querySelector(
        "[data-story-cover]"
      );

    const format =
      fragment.querySelector(
        "[data-story-format]"
      );

    const title =
      fragment.querySelector(
        "[data-story-title]"
      );

    const creator =
      fragment.querySelector(
        "[data-story-creator]"
      );

    const scoreWrap =
      fragment.querySelector(
        "[data-story-score-wrap]"
      );

    const score =
      fragment.querySelector(
        "[data-story-score]"
      );

    const description =
      fragment.querySelector(
        "[data-story-description]"
      );

    const genres =
      fragment.querySelector(
        "[data-story-genres]"
      );

    const links = [
      ...fragment.querySelectorAll(
        "[data-story-link]"
      )
    ];


    const storyUrl =
      `story.html?id=${
        encodeURIComponent(
          item.id
        )
      }`;

    links.forEach((link) => {
      link.href =
        storyUrl;
    });


    if (item.coverUrl) {
      cover.src =
        item.coverUrl;

      cover.alt =
        `${item.title} cover`;

      cover.addEventListener(
        "error",
        () => {
          coverWrap.classList.add(
            "has-cover-error"
          );

          cover.removeAttribute(
            "src"
          );
        },
        {
          once: true
        }
      );
    } else {
      coverWrap.classList.add(
        "has-cover-error"
      );

      cover.removeAttribute(
        "src"
      );
    }


    format.textContent =
      getTypeDisplay(
        item
      );

    title.textContent =
      item.title;

    creator.textContent =
      item.creator
        ? `by ${item.creator}`
        : "Creator not listed";


    const scoreValue =
      formatScore(
        item.score
      );

    if (scoreValue) {
      score.textContent =
        scoreValue;
    } else {
      scoreWrap.hidden =
        true;
    }


    if (item.description) {
      description.textContent =
        item.description;
    } else {
      description.hidden =
        true;
    }


    item.genres
      .slice(0, 2)
      .forEach((genre) => {
        const genreElement =
          document.createElement(
            "span"
          );

        genreElement.className =
          "story-card-genre";

        genreElement.textContent =
          genre.label;

        genres.append(
          genreElement
        );
      });


    if (
      item.genres.length >
      2
    ) {
      const remaining =
        document.createElement(
          "span"
        );

      remaining.className =
        "story-card-genre";

      remaining.textContent =
        `+${
          item.genres.length -
          2
        }`;

      genres.append(
        remaining
      );
    }


    if (
      !item.genres.length
    ) {
      genres.hidden =
        true;
    }


    card.setAttribute(
      "aria-label",
      [
        item.title,
        item.creator,

        scoreValue
          ? `${scoreValue} out of 10`
          : ""
      ]
        .filter(Boolean)
        .join(", ")
    );

    return fragment;
  }


  function updateResultsHeading() {
    const total =
      currentResults.length;

    elements.resultsStatus.textContent =
      `${total.toLocaleString()} ${
        total === 1
          ? "story"
          : "stories"
      }`;

    if (state.query) {
      elements.resultsHeading.textContent =
        `Results for “${state.query}”`;

      document.title =
        `${state.query} — Search | Inkwell`;
    } else {
      elements.resultsHeading.textContent =
        "All stories";

      document.title =
        "Search Stories | Inkwell";
    }
  }


  function announceResultCount() {
    const count =
      currentResults.length;

    elements.resultsStatus.textContent =
      `${count.toLocaleString()} ${
        count === 1
          ? "story found"
          : "stories found"
      }`;
  }


  function getPrimaryTypeLabel(item) {
    return (
      item.types[0]?.label ||
      "Story"
    );
  }


  function getTypeDisplay(item) {
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


  /* =======================================================
     ACTIVE FILTER CHIPS
     ======================================================= */

  function renderActiveFilters() {
    elements.activeFilterList.innerHTML =
      "";

    const chips =
      [];


    state.selectedTypes.forEach(
      (key) => {
        chips.push({
          kind:
            "type",

          key,

          label:
            findFacetLabel(
              key
            ) ||
            formatKeyAsLabel(
              key
            )
        });
      }
    );


    state.selectedGenres.forEach(
      (key) => {
        chips.push({
          kind:
            "genre",

          key,

          label:
            findFacetLabel(
              key
            ) ||
            formatKeyAsLabel(
              key
            )
        });
      }
    );


    if (
      state.minimumScore >
      0
    ) {
      chips.push({
        kind:
          "score",

        key:
          String(
            state.minimumScore
          ),

        label:
          `Score ${state.minimumScore}+`
      });
    }


    if (
      state.featuredOnly
    ) {
      chips.push({
        kind:
          "featured",

        key:
          "featured",

        label:
          "Featured"
      });
    }


    elements.activeFilters.hidden =
      chips.length === 0;


    chips.forEach((chip) => {
      const button =
        document.createElement(
          "button"
        );

      button.type =
        "button";

      button.className =
        "active-filter-chip";

      button.dataset.removeFilter =
        "";

      button.dataset.filterKind =
        chip.kind;

      button.dataset.filterKey =
        chip.key;

      button.setAttribute(
        "aria-label",
        `Remove ${chip.label} filter`
      );


      const label =
        document.createElement(
          "span"
        );

      label.textContent =
        chip.label;


      const icon =
        document.createElement(
          "i"
        );

      icon.className =
        "ti ti-x";

      icon.setAttribute(
        "aria-hidden",
        "true"
      );


      button.append(
        label,
        icon
      );

      elements.activeFilterList.append(
        button
      );
    });
  }


  function getActiveFilterCount() {
    return (
      state.selectedTypes.size +
      state.selectedGenres.size +

      (
        state.minimumScore >
        0
          ? 1
          : 0
      ) +

      (
        state.featuredOnly
          ? 1
          : 0
      )
    );
  }


  function updateMobileFilterCount() {
    const count =
      getActiveFilterCount();

    elements.mobileFilterCount.hidden =
      count === 0;

    elements.mobileFilterCount.textContent =
      String(count);
  }


  /* =======================================================
     PAGINATION
     ======================================================= */

  function renderPagination() {
    elements.pagination.innerHTML =
      "";

    const totalPages =
      Math.ceil(
        currentResults.length /
        state.perPage
      );

    if (
      totalPages <= 1
    ) {
      elements.pagination.hidden =
        true;

      return;
    }

    elements.pagination.hidden =
      false;


    elements.pagination.append(
      createPaginationButton({
        page:
          state.page - 1,

        label:
          "Previous",

        icon:
          "ti-chevron-left",

        disabled:
          state.page === 1,

        className:
          "pagination-previous"
      })
    );


    getPaginationTokens(
      state.page,
      totalPages
    ).forEach((token) => {
      if (
        typeof token ===
        "string"
      ) {
        const ellipsis =
          document.createElement(
            "span"
          );

        ellipsis.className =
          "pagination-ellipsis";

        ellipsis.textContent =
          "…";

        ellipsis.setAttribute(
          "aria-hidden",
          "true"
        );

        elements.pagination.append(
          ellipsis
        );

        return;
      }

      elements.pagination.append(
        createPaginationButton({
          page:
            token,

          label:
            String(token),

          current:
            token ===
            state.page
        })
      );
    });


    elements.pagination.append(
      createPaginationButton({
        page:
          state.page + 1,

        label:
          "Next",

        icon:
          "ti-chevron-right",

        iconAfter:
          true,

        disabled:
          state.page ===
          totalPages,

        className:
          "pagination-next"
      })
    );
  }


  function getPaginationTokens(
    currentPage,
    totalPages
  ) {
    if (
      totalPages <=
      7
    ) {
      return Array.from(
        {
          length:
            totalPages
        },
        (
          _,
          index
        ) => {
          return index + 1;
        }
      );
    }

    const pages =
      new Set([
        1,
        totalPages,
        currentPage - 1,
        currentPage,
        currentPage + 1
      ]);


    if (
      currentPage <=
      4
    ) {
      [
        2,
        3,
        4,
        5
      ].forEach((page) => {
        pages.add(page);
      });
    }


    if (
      currentPage >=
      totalPages - 3
    ) {
      [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1
      ].forEach((page) => {
        pages.add(page);
      });
    }


    const sortedPages = [
      ...pages
    ]
      .filter((page) => {
        return (
          page >= 1 &&
          page <= totalPages
        );
      })
      .sort((a, b) => {
        return a - b;
      });


    const tokens =
      [];

    sortedPages.forEach(
      (
        page,
        index
      ) => {
        const previous =
          sortedPages[
            index - 1
          ];

        if (
          index > 0 &&
          page - previous > 1
        ) {
          tokens.push(
            `ellipsis-${index}`
          );
        }

        tokens.push(
          page
        );
      }
    );

    return tokens;
  }


  function createPaginationButton({
    page,
    label,
    icon = "",
    iconAfter = false,
    disabled = false,
    current = false,
    className = ""
  }) {
    const button =
      document.createElement(
        "button"
      );

    button.type =
      "button";

    button.className =
      [
        "pagination-button",
        className
      ]
        .filter(Boolean)
        .join(" ");

    button.dataset.page =
      String(page);

    button.disabled =
      disabled;


    if (current) {
      button.setAttribute(
        "aria-current",
        "page"
      );

      button.setAttribute(
        "aria-label",
        `Page ${label}, current page`
      );
    } else {
      button.setAttribute(
        "aria-label",

        label === "Previous" ||
        label === "Next"
          ? `${label} page`
          : `Go to page ${label}`
      );
    }


    const labelElement =
      document.createElement(
        "span"
      );

    labelElement.textContent =
      label;

    if (
      label === "Previous" ||
      label === "Next"
    ) {
      labelElement.className =
        "pagination-button-label";
    }


    if (
      icon &&
      !iconAfter
    ) {
      button.append(
        createIcon(
          icon
        )
      );
    }

    button.append(
      labelElement
    );

    if (
      icon &&
      iconAfter
    ) {
      button.append(
        createIcon(
          icon
        )
      );
    }

    return button;
  }


  function createIcon(name) {
    const icon =
      document.createElement(
        "i"
      );

    icon.className =
      `ti ${name}`;

    icon.setAttribute(
      "aria-hidden",
      "true"
    );

    return icon;
  }


  function handlePaginationClick(event) {
    const button =
      event.target.closest(
        "[data-page]"
      );

    if (
      !button ||
      button.disabled
    ) {
      return;
    }

    const totalPages =
      Math.ceil(
        currentResults.length /
        state.perPage
      );

    const requestedPage =
      Number(
        button.dataset.page
      );

    if (
      !Number.isInteger(
        requestedPage
      ) ||
      requestedPage < 1 ||
      requestedPage > totalPages
    ) {
      return;
    }

    state.page =
      requestedPage;

    applyStateAndRender({
      historyMode:
        "push"
    });

    scrollToResults();
  }


  function scrollToResults() {
    const top =
      elements.resultsStatus
        .getBoundingClientRect()
        .top +
      window.scrollY -
      92;

    window.scrollTo({
      top:
        Math.max(
          0,
          top
        ),

      behavior:
        window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches
          ? "auto"
          : "smooth"
    });
  }


  /* =======================================================
     MOBILE FILTER DRAWER
     ======================================================= */

  function openFilterDrawer() {
    elements.filterPanel.classList.add(
      "is-open"
    );

    elements.filterOverlay.hidden =
      false;

    elements.mobileFilterButton.setAttribute(
      "aria-expanded",
      "true"
    );

    document.body.classList.add(
      "is-filter-open"
    );

    window.setTimeout(
      () => {
        elements.filterPanelClose.focus();
      },
      40
    );
  }


  function closeFilterDrawer(
    returnFocus = true
  ) {
    const wasOpen =
      elements.filterPanel.classList.contains(
        "is-open"
      );

    elements.filterPanel.classList.remove(
      "is-open"
    );

    elements.filterOverlay.hidden =
      true;

    elements.mobileFilterButton.setAttribute(
      "aria-expanded",
      "false"
    );

    document.body.classList.remove(
      "is-filter-open"
    );

    if (
      returnFocus &&
      wasOpen &&
      window.innerWidth <= 980
    ) {
      elements.mobileFilterButton.focus();
    }
  }


  /* =======================================================
     URL STATE
     ======================================================= */

  function readStateFromUrl() {
    const params =
      new URLSearchParams(
        window.location.search
      );

    state.query =
      params.get("q") ||
      "";

    state.selectedTypes =
      new Set(
        params
          .getAll("type")
          .map(
            normalizeFacetKey
          )
          .filter(Boolean)
      );

    state.selectedGenres =
      new Set(
        params
          .getAll("genre")
          .map(
            normalizeFacetKey
          )
          .filter(Boolean)
      );

    const minimumScore =
      Number(
        params.get("score")
      );

    state.minimumScore =
      [
        0,
        7,
        8,
        9
      ].includes(
        minimumScore
      )
        ? minimumScore
        : 0;

    state.featuredOnly =
      params.get("featured") ===
      "1";

    const requestedSort =
      params.get("sort") ||
      "relevance";

    state.sort =
      ALLOWED_SORT_OPTIONS.has(
        requestedSort
      )
        ? requestedSort
        : "relevance";

    const requestedPage =
      Number(
        params.get("page")
      );

    state.page =
      Number.isInteger(
        requestedPage
      ) &&
      requestedPage > 0
        ? requestedPage
        : 1;

    const requestedPerPage =
      Number(
        params.get("perPage")
      );

    state.perPage =
      ALLOWED_PER_PAGE.includes(
        requestedPerPage
      )
        ? requestedPerPage
        : DEFAULT_PER_PAGE;
  }


  function writeStateToUrl(
    historyMode
  ) {
    const params =
      new URLSearchParams();


    if (state.query) {
      params.set(
        "q",
        state.query
      );
    }


    [
      ...state.selectedTypes
    ]
      .sort()
      .forEach((key) => {
        params.append(
          "type",
          key
        );
      });


    [
      ...state.selectedGenres
    ]
      .sort()
      .forEach((key) => {
        params.append(
          "genre",
          key
        );
      });


    if (
      state.minimumScore >
      0
    ) {
      params.set(
        "score",
        String(
          state.minimumScore
        )
      );
    }


    if (
      state.featuredOnly
    ) {
      params.set(
        "featured",
        "1"
      );
    }


    if (
      state.sort !==
      "relevance"
    ) {
      params.set(
        "sort",
        state.sort
      );
    }


    if (
      state.page >
      1
    ) {
      params.set(
        "page",
        String(
          state.page
        )
      );
    }


    if (
      state.perPage !==
      DEFAULT_PER_PAGE
    ) {
      params.set(
        "perPage",
        String(
          state.perPage
        )
      );
    }


    const queryString =
      params.toString();

    const nextUrl =
      `${window.location.pathname}${
        queryString
          ? `?${queryString}`
          : ""
      }${window.location.hash}`;


    if (
      historyMode ===
      "push"
    ) {
      window.history.pushState(
        {},
        "",
        nextUrl
      );
    } else {
      window.history.replaceState(
        {},
        "",
        nextUrl
      );
    }
  }


  function handleHistoryNavigation() {
    closeSuggestions();
    closeAllCustomSelects();
    closeFilterDrawer(false);

    readStateFromUrl();
    syncStaticControls();

    if (
      isCatalogueLoaded
    ) {
      applyStateAndRender({
        historyMode:
          null
      });
    }
  }


  /* =======================================================
     CONTROL SYNCHRONIZATION
     ======================================================= */

  function syncStaticControls() {
    elements.searchInput.value =
      state.query;

    elements.searchClear.hidden =
      !state.query;

    elements.featuredFilter.checked =
      state.featuredOnly;


    const scoreRadios = [
      ...elements.filterPanel
        .querySelectorAll(
          "[data-score-filter]"
        )
    ];

    scoreRadios.forEach((radio) => {
      radio.checked =
        Number(
          radio.value
        ) ===
        state.minimumScore;
    });


    const sortSelect =
      document
        .querySelector(
          "#sort-select-trigger"
        )
        ?.closest(
          "[data-custom-select]"
        );

    const perPageSelect =
      document
        .querySelector(
          "#per-page-select-trigger"
        )
        ?.closest(
          "[data-custom-select]"
        );


    if (sortSelect) {
      syncCustomSelect(
        sortSelect,
        state.sort
      );
    }

    if (perPageSelect) {
      syncCustomSelect(
        perPageSelect,
        String(
          state.perPage
        )
      );
    }
  }


  /* =======================================================
     LOADING AND ERROR STATES
     ======================================================= */

  function renderLoadingSkeletons(count) {
    elements.loading.innerHTML =
      "";

    const amount =
      Math.min(
        count,
        12
      );

    for (
      let index = 0;
      index < amount;
      index += 1
    ) {
      const card =
        document.createElement(
          "div"
        );

      card.className =
        "skeleton-card";

      card.setAttribute(
        "aria-hidden",
        "true"
      );


      const cover =
        document.createElement(
          "div"
        );

      cover.className =
        "skeleton-cover";


      const body =
        document.createElement(
          "div"
        );

      body.className =
        "skeleton-body";


      const lineOne =
        document.createElement(
          "div"
        );

      lineOne.className =
        "skeleton-line skeleton-line-medium";


      const lineTwo =
        document.createElement(
          "div"
        );

      lineTwo.className =
        "skeleton-line skeleton-line-short";


      const lineThree =
        document.createElement(
          "div"
        );

      lineThree.className =
        "skeleton-line";


      body.append(
        lineOne,
        lineTwo,
        lineThree
      );

      card.append(
        cover,
        body
      );

      elements.loading.append(
        card
      );
    }
  }


  function setLoadingState(loading) {
    elements.loading.hidden =
      !loading;

    elements.resultsGrid.hidden =
      loading;

    elements.empty.hidden =
      true;

    elements.error.hidden =
      true;

    elements.pagination.hidden =
      true;

    if (loading) {
      renderLoadingSkeletons(
        state.perPage
      );

      elements.resultsStatus.textContent =
        "Loading stories…";
    }
  }


  function showError(message) {
    setLoadingState(false);

    elements.resultsGrid.hidden =
      true;

    elements.empty.hidden =
      true;

    elements.pagination.hidden =
      true;

    elements.error.hidden =
      false;

    elements.errorMessage.textContent =
      message;

    elements.resultsStatus.textContent =
      "Catalogue unavailable";
  }


  function showEmptyCatalogueState() {
    setLoadingState(false);

    elements.resultsGrid.hidden =
      true;

    elements.error.hidden =
      true;

    elements.empty.hidden =
      false;

    elements.pagination.hidden =
      true;

    elements.resultsStatus.textContent =
      "0 stories";

    elements.resultsHeading.textContent =
      "All stories";

    elements.emptyCopy.textContent =
      "Supabase returned zero public rows. " +
      "Check that the manga table contains rows and that " +
      "the anonymous role has a SELECT policy.";
  }


  /* =======================================================
     DOCUMENT EVENTS
     ======================================================= */

  function handleDocumentClick(event) {
    if (
      !event.target.closest(
        ".catalogue-search"
      )
    ) {
      closeSuggestions();
    }

    if (
      !event.target.closest(
        "[data-custom-select]"
      )
    ) {
      closeAllCustomSelects();
    }
  }


  function handleDocumentKeydown(event) {
    if (
      event.key !==
      "Escape"
    ) {
      return;
    }

    if (
      elements.filterPanel.classList.contains(
        "is-open"
      )
    ) {
      closeFilterDrawer();
    }

    closeSuggestions();
    closeAllCustomSelects();
  }


  /* =======================================================
     SMALL UTILITY
     ======================================================= */

  function clamp(
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
})();