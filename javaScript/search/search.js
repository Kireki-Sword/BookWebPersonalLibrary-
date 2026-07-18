// search.js
// Main controller for the Inkwell search page.
//
// This file coordinates:
// - Supabase loading
// - Search input and suggestions
// - Filter changes
// - Custom sort controls
// - Pagination
// - URL state
// - Mobile filter drawer
// - Rendering through search-render.js

import {
  CONFIG,
  buildRankedEntries,
  clamp,
  compareScoreDescending,
  compareTitleAscending,
  createInitialState,
  formatScore,
  getPrimaryTypeLabel,
  getResultComparator,
  loadCatalogue,
  normalizeFacetKey,
  passesFilters,
  withTimeout
} from "./search-data.js";

import {
  createCustomSelectController
} from "./search-selects.js";

import {
  createSearchRenderer
} from "./search-render.js";


/* =========================================================
   APPLICATION STATE
   ========================================================= */

const state =
  createInitialState();

const elements =
  {};

let supabaseClient =
  null;

let catalogue =
  [];

let currentResults =
  [];

let currentSuggestions =
  [];

let suggestionIndex =
  -1;

let searchTimer =
  null;

let isCatalogueLoaded =
  false;

let renderer =
  null;

let selectController =
  null;


/* =========================================================
   STARTUP
   ========================================================= */

if (
  document.readyState ===
  "loading"
) {
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

  if (
    !hasRequiredElements()
  ) {
    console.error(
      "Search page is missing one or more required elements.",
      elements
    );

    return;
  }

  renderer =
    createSearchRenderer(
      elements
    );

  selectController =
    createCustomSelectController({
      selects:
        elements.customSelects,

      onChange:
        handleCustomSelectChange
    });

  readStateFromUrl();
  bindEvents();
  selectController.initialize();
  syncAllControls();

  renderer.renderLoadingSkeletons(
    CONFIG.DEFAULT_PER_PAGE
  );

  if (
    !window.supabase?.createClient
  ) {
    renderer.showError(
      "The Supabase browser library did not load. " +
      "Check that its script appears before search.js.",
      state
    );

    return;
  }

  supabaseClient =
    window.supabase.createClient(
      CONFIG.SUPABASE_URL,
      CONFIG.SUPABASE_KEY
    );

  await loadAndRenderCatalogue();
}


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

function collectElements() {
  const ids = {
    searchForm:
      "catalogue-search-form",

    searchInput:
      "catalogue-search-input",

    searchClear:
      "catalogue-search-clear",

    suggestions:
      "search-suggestions",

    filterPanel:
      "filter-panel",

    filterPanelClose:
      "filter-panel-close",

    filterOverlay:
      "filter-drawer-overlay",

    mobileFilterButton:
      "mobile-filter-button",

    mobileFilterCount:
      "mobile-filter-count",

    formatFilterList:
      "format-filter-list",

    genreFilterList:
      "genre-filter-list",

    genreShowMore:
      "genre-show-more",

    featuredFilterGroup:
      "featured-filter-group",

    featuredFilter:
      "featured-filter",

    clearAllFilters:
      "clear-all-filters",

    resultsStatus:
      "results-status",

    resultsHeading:
      "results-heading",

    activeFilters:
      "active-filters",

    activeFilterList:
      "active-filter-list",

    activeFiltersClear:
      "active-filters-clear",

    loading:
      "results-loading",

    error:
      "results-error",

    errorMessage:
      "results-error-message",

    retry:
      "retry-results",

    empty:
      "results-empty",

    emptyCopy:
      "results-empty-copy",

    emptyClearFilters:
      "empty-clear-filters",

    emptyBrowseAll:
      "empty-browse-all",

    resultsGrid:
      "results-grid",

    pagination:
      "results-pagination",

    cardTemplate:
      "story-card-template"
  };

  Object
    .entries(ids)
    .forEach(
      (
        [
          key,
          id
        ]
      ) => {
        elements[key] =
          document.getElementById(
            id
          );
      }
    );

  elements.customSelects = [
    ...document.querySelectorAll(
      "[data-custom-select]"
    )
  ];
}


function hasRequiredElements() {
  const requiredKeys = [
    "searchForm",
    "searchInput",
    "searchClear",
    "suggestions",
    "filterPanel",
    "filterPanelClose",
    "filterOverlay",
    "mobileFilterButton",
    "mobileFilterCount",
    "formatFilterList",
    "genreFilterList",
    "genreShowMore",
    "featuredFilterGroup",
    "featuredFilter",
    "clearAllFilters",
    "resultsStatus",
    "resultsHeading",
    "activeFilters",
    "activeFilterList",
    "activeFiltersClear",
    "loading",
    "error",
    "errorMessage",
    "retry",
    "empty",
    "emptyCopy",
    "emptyClearFilters",
    "emptyBrowseAll",
    "resultsGrid",
    "pagination",
    "cardTemplate"
  ];

  return (
    requiredKeys.every((key) => {
      return Boolean(
        elements[key]
      );
    }) &&

    elements.customSelects.length ===
    2
  );
}


/* =========================================================
   DATABASE LOADING
   ========================================================= */

async function loadAndRenderCatalogue() {
  renderer.setLoadingState(
    true,
    state
  );

  try {
    catalogue =
      await withTimeout(
        loadCatalogue(
          supabaseClient
        ),

        CONFIG.DATABASE_TIMEOUT_MS,

        "The catalogue request timed out."
      );

    isCatalogueLoaded =
      true;

    if (
      !catalogue.length
    ) {
      renderer.showEmptyCatalogueState(
        state
      );

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

    renderer.showError(
      error?.message ||
      "Supabase returned an unknown error.",
      state
    );
  }
}


/* =========================================================
   EVENT BINDING
   ========================================================= */

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


/* =========================================================
   CUSTOM SORT AND PAGE-SIZE CONTROLS
   ========================================================= */

function handleCustomSelectChange(
  kind,
  rawValue
) {
  if (
    kind ===
    "sort"
  ) {
    state.sort =
      CONFIG
        .ALLOWED_SORT_OPTIONS
        .has(rawValue)
        ? rawValue
        : "relevance";
  } else {
    const requested =
      Number(rawValue);

    state.perPage =
      CONFIG
        .ALLOWED_PER_PAGE
        .includes(requested)
        ? requested
        : CONFIG.DEFAULT_PER_PAGE;
  }

  state.page =
    1;

  applyStateAndRender({
    historyMode:
      "push"
  });
}


/* =========================================================
   SEARCH INPUT
   ========================================================= */

function handleSearchSubmit(
  event
) {
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

      CONFIG.SEARCH_DEBOUNCE_MS
    );
}


function handleSearchKeydown(
  event
) {
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


/* =========================================================
   SEARCH SUGGESTIONS
   ========================================================= */

function renderSuggestions(
  value
) {
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
      catalogue,
      query
    )
      .sort(
        (
          a,
          b
        ) => {
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
        }
      )
      .slice(
        0,
        CONFIG.MAX_SEARCH_SUGGESTIONS
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


      if (item.coverUrl) {
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
      }


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


function handleSuggestionClick(
  event
) {
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


function selectSuggestion(
  item
) {
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


/* =========================================================
   FILTER EVENTS
   ========================================================= */

function handleFilterChange(
  event
) {
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


function handleActiveFilterClick(
  event
) {
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


/* =========================================================
   APPLY SEARCH, FILTERING, AND SORTING
   ========================================================= */

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
      catalogue,
      state.query
    );

  renderer.renderFacetFilters(
    rankedEntries,
    state,
    catalogue
  );

  currentResults =
    rankedEntries
      .filter((entry) => {
        return passesFilters(
          entry.item,
          state
        );
      })
      .sort(
        getResultComparator(
          state
        )
      );

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

  renderer.renderResults(
    currentResults,
    state
  );

  renderer.renderActiveFilters(
    state,
    catalogue
  );

  renderer.updateMobileFilterCount(
    state
  );

  syncAllControls();

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
    renderer.announceResultCount(
      currentResults
    );
  }
}


/* =========================================================
   PAGINATION
   ========================================================= */

function handlePaginationClick(
  event
) {
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


/* =========================================================
   MOBILE FILTER DRAWER
   ========================================================= */

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


/* =========================================================
   URL STATE
   ========================================================= */

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
    CONFIG
      .ALLOWED_SORT_OPTIONS
      .has(requestedSort)
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
    CONFIG
      .ALLOWED_PER_PAGE
      .includes(
        requestedPerPage
      )
      ? requestedPerPage
      : CONFIG.DEFAULT_PER_PAGE;
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
    CONFIG.DEFAULT_PER_PAGE
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
  selectController.closeAll();
  closeFilterDrawer(false);

  readStateFromUrl();
  syncAllControls();

  if (
    isCatalogueLoaded
  ) {
    applyStateAndRender({
      historyMode:
        null
    });
  }
}


/* =========================================================
   CONTROL SYNCHRONIZATION
   ========================================================= */

function syncAllControls() {
  renderer.syncStaticControls(
    state
  );

  selectController.sync(
    "sort",
    state.sort
  );

  selectController.sync(
    "perPage",
    String(
      state.perPage
    )
  );
}


/* =========================================================
   GLOBAL DOCUMENT EVENTS
   ========================================================= */

function handleDocumentClick(
  event
) {
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
    selectController.closeAll();
  }
}


function handleDocumentKeydown(
  event
) {
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
  selectController.closeAll();
}