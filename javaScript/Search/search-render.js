// search-render.js
// Renders filters, result cards, active filters,
// loading states, messages, and pagination.

import {
  CONFIG,
  buildFacetOptions,
  compareDemographicOptions,
  compareSubformatOptions,
  compareTypeOptions,
  findFacetLabel,
  formatKeyAsLabel,
  formatScore,
  getTypeDisplay,
  passesFilters
} from "./search-data.js";


export function createSearchRenderer(elements) {
  /* =======================================================
     FILTER FACETS
     ======================================================= */

  function renderFacetFilters(
    rankedEntries,
    state,
    catalogue
  ) {
    const typeEntries =
      rankedEntries.filter((entry) => {
        return passesFilters(
          entry.item,
          state,
          "type"
        );
      });

    const demographicEntries =
      rankedEntries.filter((entry) => {
        return passesFilters(
          entry.item,
          state,
          "demographic"
        );
      });

    const subformatEntries =
      rankedEntries.filter((entry) => {
        return passesFilters(
          entry.item,
          state,
          "subformat"
        );
      });

    const genreEntries =
      rankedEntries.filter((entry) => {
        return passesFilters(
          entry.item,
          state,
          "genre"
        );
      });

    const tagEntries =
      rankedEntries.filter((entry) => {
        return passesFilters(
          entry.item,
          state,
          "tag"
        );
      });

    renderTypeFilters(
      buildFacetOptions(
        typeEntries,
        "types"
      ),
      state,
      catalogue
    );

    renderDemographicFilters(
      buildFacetOptions(
        demographicEntries,
        "demographics"
      ),
      state,
      catalogue
    );

    renderSubformatFilters(
      buildFacetOptions(
        subformatEntries,
        "subformats"
      ),
      state,
      catalogue
    );

    renderGenreFilters(
      buildFacetOptions(
        genreEntries,
        "genres"
      ),
      state,
      catalogue
    );

    renderTagFilters(
      buildFacetOptions(
        tagEntries,
        "tags"
      ),
      state,
      catalogue
    );
  }


  function renderTypeFilters(
    options,
    state,
    catalogue
  ) {
    const completeOptions = [
      ...options,

      ...getMissingSelectedOptions(
        state.selectedTypes,
        options,
        catalogue
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


  function renderDemographicFilters(
    options,
    state,
    catalogue
  ) {
    const completeOptions = [
      ...options,

      ...getMissingSelectedOptions(
        state.selectedDemographics,
        options,
        catalogue
      )
    ];

    completeOptions.sort(
      compareDemographicOptions
    );

    renderCheckboxOptions({
      container:
        elements.demographicFilterList,

      options:
        completeOptions,

      selectedSet:
        state.selectedDemographics,

      dataAttribute:
        "data-demographic-filter"
    });
  }


  function renderSubformatFilters(
    options,
    state,
    catalogue
  ) {
    const completeOptions = [
      ...options,

      ...getMissingSelectedOptions(
        state.selectedSubformats,
        options,
        catalogue
      )
    ];

    completeOptions.sort(
      compareSubformatOptions
    );

    renderCheckboxOptions({
      container:
        elements.subformatFilterList,

      options:
        completeOptions,

      selectedSet:
        state.selectedSubformats,

      dataAttribute:
        "data-subformat-filter"
    });
  }


  function renderGenreFilters(
    options,
    state,
    catalogue
  ) {
    const completeOptions = [
      ...options,

      ...getMissingSelectedOptions(
        state.selectedGenres,
        options,
        catalogue
      )
    ];

    completeOptions.sort((a, b) => {
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
    });

    const selectedOptions =
      completeOptions.filter((option) => {
        return state.selectedGenres.has(
          option.key
        );
      });

    const unselectedOptions =
      completeOptions.filter((option) => {
        return !state.selectedGenres.has(
          option.key
        );
      });

    let visibleOptions =
      completeOptions;

    if (!state.showAllGenres) {
      const visibleMap =
        new Map();

      [
        ...selectedOptions,

        ...unselectedOptions.slice(
          0,
          CONFIG.COLLAPSED_GENRE_LIMIT
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
      CONFIG.COLLAPSED_GENRE_LIMIT;

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


  function renderTagFilters(
    options,
    state,
    catalogue
  ) {
    const completeOptions = [
      ...options,

      ...getMissingSelectedOptions(
        state.selectedTags,
        options,
        catalogue
      )
    ];

    completeOptions.sort((a, b) => {
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
    });

    const selectedOptions =
      completeOptions.filter((option) => {
        return state.selectedTags.has(
          option.key
        );
      });

    const unselectedOptions =
      completeOptions.filter((option) => {
        return !state.selectedTags.has(
          option.key
        );
      });

    let visibleOptions =
      completeOptions;

    if (!state.showAllTags) {
      const visibleMap =
        new Map();

      [
        ...selectedOptions,

        ...unselectedOptions.slice(
          0,
          CONFIG.COLLAPSED_TAG_LIMIT
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
        elements.tagFilterList,

      options:
        visibleOptions,

      selectedSet:
        state.selectedTags,

      dataAttribute:
        "data-tag-filter"
    });

    elements.tagShowMore.hidden =
      completeOptions.length <=
      CONFIG.COLLAPSED_TAG_LIMIT;

    elements.tagShowMore.classList.toggle(
      "is-expanded",
      state.showAllTags
    );

    const label =
      elements.tagShowMore.querySelector(
        "span"
      );

    if (label) {
      label.textContent =
        state.showAllTags
          ? "Show fewer tags"
          : "Show all tags";
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
        "filter-option filter-option-empty";

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
    existingOptions,
    catalogue
  ) {
    const existingKeys =
      new Set(
        existingOptions.map((option) => {
          return option.key;
        })
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
              catalogue,
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


  /* =======================================================
     RESULTS
     ======================================================= */

  function renderResults(
    currentResults,
    state
  ) {
    setLoadingState(
      false,
      state
    );

    elements.error.hidden =
      true;

    elements.resultsGrid.innerHTML =
      "";

    updateResultsHeading(
      currentResults,
      state
    );

    if (!currentResults.length) {
      elements.empty.hidden =
        false;

      elements.resultsGrid.hidden =
        true;

      elements.pagination.hidden =
        true;

      elements.emptyCopy.textContent =
        state.similarMode
          ? "No other titles share these genres or themes yet."
          : state.query ||
            getActiveFilterCount(state)
              ? "Try removing a filter or searching with fewer words."
              : "No public stories were returned from the manga table.";

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

    renderPagination(
      currentResults,
      state
    );
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


    const detailUrl =
      `detail.html?id=${
        encodeURIComponent(
          item.id
        )
      }`;

    links.forEach((link) => {
      link.href =
        detailUrl;
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


    if (!item.genres.length) {
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


  function updateResultsHeading(
    currentResults,
    state
  ) {
    const total =
      currentResults.length;

    elements.resultsStatus.textContent =
      `${total.toLocaleString()} ${
        total === 1
          ? "story"
          : "stories"
      }`;

    if (state.similarMode) {
      const sourceTitle =
        state.similarTitle ||
        "this title";

      elements.resultsHeading.textContent =
        `Similar to “${sourceTitle}”`;

      document.title =
        `Similar to ${sourceTitle} | Inkwell`;
    } else if (state.query) {
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


  function announceResultCount(currentResults) {
    const count =
      currentResults.length;

    elements.resultsStatus.textContent =
      `${count.toLocaleString()} ${
        count === 1
          ? "story found"
          : "stories found"
      }`;
  }


  /* =======================================================
     ACTIVE FILTERS
     ======================================================= */

  function renderActiveFilters(
    state,
    catalogue
  ) {
    elements.activeFilterList.innerHTML =
      "";

    const chips =
      [];


    if (state.similarMode) {
      chips.push({
        kind:
          "similar",

        key:
          state.similarTitleId ||
          "similar",

        label:
          `Similar to “${
            state.similarTitle ||
            "selected title"
          }”`
      });
    }


    state.selectedTypes.forEach((key) => {
      chips.push({
        kind:
          "type",

        key,

        label:
          findFacetLabel(
            catalogue,
            key
          ) ||
          formatKeyAsLabel(
            key
          )
      });
    });


    state.selectedDemographics.forEach((key) => {
      chips.push({
        kind:
          "demographic",

        key,

        label:
          findFacetLabel(
            catalogue,
            key
          ) ||
          formatKeyAsLabel(
            key
          )
      });
    });


    state.selectedSubformats.forEach((key) => {
      chips.push({
        kind:
          "subformat",

        key,

        label:
          findFacetLabel(
            catalogue,
            key
          ) ||
          formatKeyAsLabel(
            key
          )
      });
    });


    state.selectedGenres.forEach((key) => {
      chips.push({
        kind:
          "genre",

        key,

        label:
          findFacetLabel(
            catalogue,
            key
          ) ||
          formatKeyAsLabel(
            key
          )
      });
    });


    state.selectedTags.forEach((key) => {
      chips.push({
        kind:
          "tag",

        key,

        label:
          findFacetLabel(
            catalogue,
            key
          ) ||
          formatKeyAsLabel(
            key
          )
      });
    });


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
        [
          "active-filter-chip",

          chip.kind === "similar"
            ? "active-filter-chip-similar"
            : ""
        ]
          .filter(Boolean)
          .join(" ");

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


  function getActiveFilterCount(state) {
    return (
      (
        state.similarMode
          ? 1
          : 0
      ) +
      state.selectedTypes.size +
      state.selectedDemographics.size +
      state.selectedSubformats.size +
      state.selectedGenres.size +
      state.selectedTags.size +

      (
        state.minimumScore >
        0
          ? 1
          : 0
      )
    );
  }


  function updateMobileFilterCount(state) {
    const count =
      getActiveFilterCount(
        state
      );

    elements.mobileFilterCount.hidden =
      count === 0;

    elements.mobileFilterCount.textContent =
      String(
        count
      );
  }


  /* =======================================================
     PAGINATION
     ======================================================= */

  function renderPagination(
    currentResults,
    state
  ) {
    elements.pagination.innerHTML =
      "";

    const totalPages =
      Math.ceil(
        currentResults.length /
        state.perPage
      );

    if (
      totalPages <=
      1
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
        pages.add(
          page
        );
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
        pages.add(
          page
        );
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

    sortedPages.forEach((page, index) => {
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
    });

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
      String(
        page
      );

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


  /* =======================================================
     LOADING AND ERROR STATES
     ======================================================= */

  function renderLoadingSkeletons(count) {
    elements.loading.innerHTML =
      "";

    const amount =
      Math.min(
        count,
        CONFIG.MAX_LOADING_SKELETONS
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


      const lineClasses = [
        "skeleton-line skeleton-line-medium",
        "skeleton-line skeleton-line-short",
        "skeleton-line"
      ];

      lineClasses.forEach((className) => {
        const line =
          document.createElement(
            "div"
          );

        line.className =
          className;

        body.append(
          line
        );
      });


      card.append(
        cover,
        body
      );

      elements.loading.append(
        card
      );
    }
  }


  function setLoadingState(
    loading,
    state
  ) {
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


  function showError(
    message,
    state
  ) {
    setLoadingState(
      false,
      state
    );

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


  function showEmptyCatalogueState(state) {
    setLoadingState(
      false,
      state
    );

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
     STATIC CONTROL SYNCHRONIZATION
     ======================================================= */

  function syncStaticControls(state) {
    elements.searchInput.value =
      state.query;

    elements.searchClear.hidden =
      !state.query;

    elements.filterPanel
      .querySelectorAll(
        "[data-score-filter]"
      )
      .forEach((radio) => {
        radio.checked =
          Number(
            radio.value
          ) ===
          state.minimumScore;
      });
  }


  return {
    renderFacetFilters,
    renderResults,
    renderActiveFilters,
    updateMobileFilterCount,
    announceResultCount,
    renderLoadingSkeletons,
    setLoadingState,
    showError,
    showEmptyCatalogueState,
    syncStaticControls
  };
}