// section3LibraryFlow-final.js
// =========================================================
// SECTION 3 — SEARCH → PREVIEW → STATUS → LIBRARY
//
// Load this after:
// 1. The Supabase JavaScript library
// 2. The Section 3 HTML
// =========================================================

(() => {
  'use strict';


  // ---------------------------------------------------------
  // DATABASE CONFIGURATION
  // ---------------------------------------------------------

  const SUPABASE_URL =
    'https://hsruxfpslxguhwnccwuj.supabase.co';

  const SUPABASE_KEY =
    'sb_publishable_Z2upBCdemNtdB4j5jry65A_XD_u8BsD';

  const TABLE_NAME =
    'manga';

  const BUCKET_NAME =
    'img';

  const COVER_FOLDER =
    'covers';

  const SEARCH_COLUMNS = [
    'id',
    'title',
    'alternativeTitles',
    'type',
    'creator',
    'heroScore',
    'genres'
  ].join(', ');

  const CATALOG_PAGE_SIZE =
    1000;

  const SEARCH_RESULT_LIMIT =
    3;

  const SEARCH_DEBOUNCE_MS =
    260;

  const DEFAULT_STATUS =
    'in-progress';

  const STATUS_LABELS = {
    'in-progress': 'Reading',
    completed: 'Completed',
    planned: 'Planned',
    paused: 'Paused',
    dropped: 'Dropped'
  };


  // ---------------------------------------------------------
  // APPLICATION STATE
  // ---------------------------------------------------------

  let supabaseClient =
    null;

  let cataloguePromise =
    null;

  let searchTimer =
    null;

  let lastSearchRequestId =
    0;

  let currentSuggestions =
    [];

  let selectedResult =
    null;

  let selectedStatus =
    DEFAULT_STATUS;

  let libraryItems =
    [];

  let activeFormatFilter =
    'all';

  let activeStatusFilter =
    'all';

  /*
    Empty sorting means the normal recently-added order.
  */
  let activeSortOption =
    '';


  // ---------------------------------------------------------
  // INITIALIZATION
  // ---------------------------------------------------------

  function startSection3LibraryFlow() {
    const section =
      document.querySelector(
        '#section-3-library-flow'
      );

    if (!section) {
      return;
    }

    const elements =
      getElements(section);

    if (!hasRequiredElements(elements)) {
      console.error(
        'Missing one or more required Section 3 elements.',
        elements
      );

      return;
    }

    bindStatusPickerEvents(
      elements
    );

    bindLibraryControlEvents(
      elements
    );

    hideStatusPicker(
      elements
    );

    renderSuggestions(
      elements
    );

    renderLibrary(
      elements
    );

    if (!window.supabase) {
      console.error(
        'Supabase is not loaded. ' +
        'Load the Supabase script before this file.'
      );

      disableSearch(
        elements
      );

      setSearchMessage(
        elements,
        'Search is unavailable because the database library did not load.'
      );

      return;
    }

    supabaseClient =
      window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
      );

    bindSearchEvents(
      elements
    );

    disableSearch(
      elements
    );

    setSearchMessage(
      elements,
      'Loading the story catalogue…'
    );

    cataloguePromise =
      loadSearchCatalogue();

    cataloguePromise
      .then((catalogue) => {
        enableSearch(
          elements
        );

        if (
          catalogue.length === 0
        ) {
          setSearchMessage(
            elements,
            'No stories were found in the manga table.'
          );

          return;
        }

        setSearchMessage(
          elements,
          'Type a title to find it and add it to your library.'
        );
      })
      .catch((error) => {
        logSupabaseError(
          'Could not load the Section 3 catalogue',
          error
        );

        disableSearch(
          elements
        );

        setSearchMessage(
          elements,
          'Search is unavailable right now. Check the browser console.'
        );
      });
  }


  // ---------------------------------------------------------
  // FIND HTML ELEMENTS
  // ---------------------------------------------------------

  function getElements(section) {
    return {
      section,

      searchForm:
        section.querySelector(
          '[data-flow-search-form]'
        ),

      searchInput:
        section.querySelector(
          '[data-flow-search-input]'
        ),

      searchButton:
        section.querySelector(
          '[data-flow-search-button]'
        ),

      searchContent:
        section.querySelector(
          '[data-flow-search-content]'
        ),

      suggestions:
        section.querySelector(
          '[data-flow-suggestions]'
        ),

      searchMessage:
        section.querySelector(
          '[data-flow-search-empty]'
        ),

      resultArea:
        section.querySelector(
          '[data-flow-result-area]'
        ),

      resultTemplate:
        section.querySelector(
          '#flow-result-template'
        ),

      statusPicker:
        section.querySelector(
          '[data-flow-status-picker]'
        ),

      statusRadios: [
        ...section.querySelectorAll(
          'input[name="flow_status"]'
        )
      ],

      libraryCard:
        section.querySelector(
          '.flow-library-card'
        ),

      libraryEmpty:
        section.querySelector(
          '[data-library-empty]'
        ),

      libraryList:
        section.querySelector(
          '[data-library-list]'
        ),

      libraryRowTemplate:
        section.querySelector(
          '#flow-library-row-template'
        ),

      libraryCount:
        section.querySelector(
          '[data-library-count]'
        ),

      formatFilterButtons: [
        ...section.querySelectorAll(
          '[data-format-filter]'
        )
      ],

      statusFilterButtons: [
        ...section.querySelectorAll(
          '[data-status-filter]'
        )
      ],

      sortSelect:
        section.querySelector(
          '[data-library-sort]'
        )
    };
  }


  function hasRequiredElements(elements) {
    return Boolean(
      elements.section &&
      elements.searchForm &&
      elements.searchInput &&
      elements.searchButton &&
      elements.searchContent &&
      elements.suggestions &&
      elements.searchMessage &&
      elements.resultArea &&
      elements.resultTemplate &&
      elements.statusPicker &&
      elements.libraryCard &&
      elements.libraryEmpty &&
      elements.libraryList &&
      elements.libraryRowTemplate &&
      elements.libraryCount &&
      elements.sortSelect
    );
  }


  function disableSearch(elements) {
    elements.searchInput.disabled =
      true;

    elements.searchButton.disabled =
      true;
  }


  function enableSearch(elements) {
    elements.searchInput.disabled =
      false;

    elements.searchButton.disabled =
      false;
  }


  function resetSearchContentScroll(elements) {
    if (!elements.searchContent) {
      return;
    }

    elements.searchContent.scrollTop =
      0;
  }


  // ---------------------------------------------------------
  // LOAD SEARCHABLE CATALOGUE
  // ---------------------------------------------------------

  async function loadSearchCatalogue() {
    const rows =
      [];

    let from =
      0;

    while (true) {
      const to =
        from +
        CATALOG_PAGE_SIZE -
        1;

      const {
        data,
        error
      } = await supabaseClient
        .from(TABLE_NAME)
        .select(SEARCH_COLUMNS)
        .order(
          'heroScore',
          {
            ascending: false,
            nullsFirst: false
          }
        )
        .range(
          from,
          to
        );

      if (error) {
        throw error;
      }

      const page =
        Array.isArray(data)
          ? data
          : [];

      rows.push(
        ...page
      );

      if (
        page.length <
        CATALOG_PAGE_SIZE
      ) {
        break;
      }

      from +=
        CATALOG_PAGE_SIZE;
    }

    const catalogue =
      normalizeSearchResults(
        rows
      );

    console.log(
      `SECTION 3: loaded ${catalogue.length} searchable rows.`
    );

    return catalogue;
  }


  async function getSearchCatalogue() {
    if (!cataloguePromise) {
      cataloguePromise =
        loadSearchCatalogue();
    }

    return cataloguePromise;
  }


  // ---------------------------------------------------------
  // SEARCH EVENTS
  // ---------------------------------------------------------

  function bindSearchEvents(elements) {
    elements.searchForm.addEventListener(
      'submit',
      (event) => {
        event.preventDefault();

        runSearchFromInput(
          elements,
          {
            autoSelectFirst: true
          }
        );
      }
    );

    elements.searchButton.addEventListener(
      'click',
      (event) => {
        event.preventDefault();

        runSearchFromInput(
          elements,
          {
            autoSelectFirst: true
          }
        );
      }
    );

    elements.searchInput.addEventListener(
      'input',
      () => {
        const query =
          elements.searchInput
            .value
            .trim();

        window.clearTimeout(
          searchTimer
        );

        clearSelectedResult(
          elements
        );

        hideStatusPicker(
          elements
        );

        resetSearchContentScroll(
          elements
        );

        selectedResult =
          null;

        if (
          query.length < 2
        ) {
          currentSuggestions =
            [];

          renderSuggestions(
            elements
          );

          setSearchMessage(
            elements,
            'Type at least 2 letters to search.'
          );

          return;
        }

        setSearchMessage(
          elements,
          'Searching…'
        );

        searchTimer =
          window.setTimeout(
            () => {
              searchStories(
                query,
                elements
              );
            },
            SEARCH_DEBOUNCE_MS
          );
      }
    );
  }


  function runSearchFromInput(
    elements,
    options = {}
  ) {
    const query =
      elements.searchInput
        .value
        .trim();

    if (
      query.length < 2
    ) {
      setSearchMessage(
        elements,
        'Type at least 2 letters to search.'
      );

      return;
    }

    window.clearTimeout(
      searchTimer
    );

    searchStories(
      query,
      elements,
      options
    );
  }


  async function searchStories(
    query,
    elements,
    options = {}
  ) {
    const requestId =
      ++lastSearchRequestId;

    try {
      const results =
        await fetchSearchResults(
          query
        );

      if (
        requestId !==
        lastSearchRequestId
      ) {
        return;
      }

      currentSuggestions =
        results;

      renderSuggestions(
        elements
      );

      resetSearchContentScroll(
        elements
      );

      if (
        results.length === 0
      ) {
        setSearchMessage(
          elements,
          'No matching story found. Try another title.'
        );

        return;
      }

      setSearchMessage(
        elements,
        `Showing ${results.length} result${
          results.length === 1
            ? ''
            : 's'
        }. Choose one to preview.`
      );

      if (
        options.autoSelectFirst
      ) {
        selectSuggestion(
          results[0],
          elements
        );
      }
    } catch (error) {
      if (
        requestId !==
        lastSearchRequestId
      ) {
        return;
      }

      logSupabaseError(
        'Section 3 search failed',
        error
      );

      currentSuggestions =
        [];

      renderSuggestions(
        elements
      );

      setSearchMessage(
        elements,
        'Search is unavailable right now. Check the browser console.'
      );
    }
  }


  // ---------------------------------------------------------
  // LOCAL SEARCH
  // ---------------------------------------------------------

  async function fetchSearchResults(query) {
    const catalogue =
      await getSearchCatalogue();

    const searchWords =
      normalizeSearchText(query)
        .split(' ')
        .filter(Boolean);

    if (
      searchWords.length === 0
    ) {
      return [];
    }

    return catalogue
      .map((item) => {
        return {
          item,

          rank:
            getSearchRank(
              item,
              searchWords
            )
        };
      })
      .filter((entry) => {
        return entry.rank > 0;
      })
      .sort((a, b) => {
        if (
          b.rank !==
          a.rank
        ) {
          return (
            b.rank -
            a.rank
          );
        }

        return (
          getNumericScore(
            b.item.score
          ) -
          getNumericScore(
            a.item.score
          )
        );
      })
      .slice(
        0,
        SEARCH_RESULT_LIMIT
      )
      .map((entry) => {
        return entry.item;
      });
  }


  function getSearchRank(
    item,
    searchWords
  ) {
    const normalizedTitle =
      normalizeSearchText(
        item.title
      );

    const normalizedCreator =
      normalizeSearchText(
        item.creator
      );

    const normalizedAlternatives =
      item.alternativeTitles.map(
        normalizeSearchText
      );

    const normalizedTypes =
      item.type.map(
        normalizeSearchText
      );

    const normalizedGenres =
      item.genres.map(
        normalizeSearchText
      );

    const searchableText = [
      normalizedTitle,
      normalizedCreator,
      ...normalizedAlternatives,
      ...normalizedTypes,
      ...normalizedGenres
    ].join(' ');

    const allWordsMatch =
      searchWords.every(
        (word) => {
          return searchableText
            .includes(word);
        }
      );

    if (!allWordsMatch) {
      return 0;
    }

    const fullQuery =
      searchWords.join(' ');

    let rank =
      1;

    if (
      normalizedTitle ===
      fullQuery
    ) {
      rank +=
        100;
    } else if (
      normalizedTitle
        .startsWith(fullQuery)
    ) {
      rank +=
        80;
    } else if (
      normalizedTitle
        .includes(fullQuery)
    ) {
      rank +=
        60;
    }

    if (
      normalizedAlternatives
        .some((title) => {
          return (
            title ===
            fullQuery
          );
        })
    ) {
      rank +=
        90;
    } else if (
      normalizedAlternatives
        .some((title) => {
          return title
            .startsWith(
              fullQuery
            );
        })
    ) {
      rank +=
        70;
    } else if (
      normalizedAlternatives
        .some((title) => {
          return title
            .includes(
              fullQuery
            );
        })
    ) {
      rank +=
        50;
    }

    if (
      normalizedCreator ===
      fullQuery
    ) {
      rank +=
        40;
    } else if (
      normalizedCreator
        .includes(fullQuery)
    ) {
      rank +=
        25;
    }

    return rank;
  }


  function normalizeSearchText(value) {
    return String(
      value ?? ''
    )
      .normalize('NFKD')
      .replace(
        /[\u0300-\u036f]/g,
        ''
      )
      .toLowerCase()
      .replace(
        /[^\p{L}\p{N}]+/gu,
        ' '
      )
      .replace(
        /\s+/g,
        ' '
      )
      .trim();
  }


  function normalizeSearchResults(items) {
    return items
      .filter((item) => {
        return (
          item &&
          item.id &&
          item.title
        );
      })
      .map((item) => {
        return {
          id:
            String(item.id),

          title:
            String(item.title),

          alternativeTitles:
            getArrayValue(
              item.alternativeTitles
            )
              .map((title) => {
                return String(
                  title
                ).trim();
              })
              .filter(Boolean),

          creator:
            getCreatorValue(
              item
            ),

          type:
            getTypeList(
              item
            ),

          coverUrl:
            getCoverUrlFromId(
              item.id
            ),

          score:
            getScoreValue(
              item
            ),

          genres:
            getArrayValue(
              item.genres
            )
              .map((genre) => {
                return String(
                  genre
                ).trim();
              })
              .filter(Boolean),

          raw:
            item
        };
      });
  }


  // ---------------------------------------------------------
  // SEARCH SUGGESTIONS
  // ---------------------------------------------------------

  function renderSuggestions(elements) {
    elements.suggestions
      .innerHTML =
        '';

    if (
      currentSuggestions.length ===
      0
    ) {
      elements.suggestions.hidden =
        true;

      return;
    }

    elements.suggestions.hidden =
      false;

    currentSuggestions.forEach(
      (item) => {
        const button =
          document.createElement(
            'button'
          );

        const cover =
          document.createElement(
            'span'
          );

        const image =
          document.createElement(
            'img'
          );

        const info =
          document.createElement(
            'span'
          );

        const title =
          document.createElement(
            'strong'
          );

        const meta =
          document.createElement(
            'small'
          );

        button.type =
          'button';

        button.className =
          'flow-suggestion';

        button.dataset.storyId =
          item.id;

        button.setAttribute(
          'aria-label',
          `Preview ${item.title}`
        );

        cover.className =
          'flow-suggestion-cover';

        info.className =
          'flow-suggestion-info';

        title.textContent =
          item.title;

        meta.textContent =
          getSuggestionMeta(
            item
          );

        setImage(
          image,
          item.coverUrl,
          ''
        );

        cover.appendChild(
          image
        );

        info.append(
          title,
          meta
        );

        button.append(
          cover,
          info
        );

        button.addEventListener(
          'click',
          () => {
            selectSuggestion(
              item,
              elements
            );
          }
        );

        elements.suggestions
          .appendChild(
            button
          );
      }
    );
  }


  function selectSuggestion(
    item,
    elements
  ) {
    selectedResult =
      item;

    selectedStatus =
      DEFAULT_STATUS;

    elements.searchInput.value =
      item.title;

    currentSuggestions =
      [];

    renderSuggestions(
      elements
    );

    renderSelectedResult(
      item,
      elements
    );

    resetSearchContentScroll(
      elements
    );

    if (
      findLibraryItem(
        item.id
      )
    ) {
      hideStatusPicker(
        elements
      );

      setSearchMessage(
        elements,
        'This story is already in your library.'
      );

      return;
    }

    showStatusPicker(
      elements
    );

    setSearchMessage(
      elements,
      'Choose a status, then add it to your library.'
    );
  }


  // ---------------------------------------------------------
  // SELECTED RESULT
  // ---------------------------------------------------------

  function renderSelectedResult(
    item,
    elements
  ) {
    clearSelectedResult(
      elements
    );

    const fragment =
      elements.resultTemplate
        .content
        .cloneNode(true);

    const card =
      fragment.querySelector(
        '[data-flow-result-card]'
      );

    const coverImage =
      fragment.querySelector(
        '.flow-result-cover img'
      );

    const title =
      fragment.querySelector(
        '.flow-result-info h4'
      );

    const creator =
      fragment.querySelector(
        '.flow-result-creator'
      );

    const type =
      fragment.querySelector(
        '.flow-result-type'
      );

    const addButton =
      fragment.querySelector(
        '[data-flow-add-button]'
      );

    if (
      !card ||
      !addButton
    ) {
      console.error(
        'The result template is missing required elements.'
      );

      return;
    }

    card.dataset.storyId =
      item.id;

    if (coverImage) {
      setImage(
        coverImage,
        item.coverUrl,
        `${item.title} cover`
      );
    }

    if (title) {
      title.textContent =
        item.title;
    }

    if (creator) {
      creator.textContent =
        item.creator
          ? `by ${item.creator}`
          : 'Unknown creator';
    }

    if (type) {
      type.textContent =
        getResultTypeLabel(
          item
        );
    }

    if (
      findLibraryItem(
        item.id
      )
    ) {
      addButton.textContent =
        'Added';

      addButton.classList.add(
        'is-added'
      );

      addButton.disabled =
        true;
    } else {
      addButton.textContent =
        `Add to ${getStatusLabel(
          selectedStatus
        )}`;

      addButton.addEventListener(
        'click',
        () => {
          addSelectedResultToLibrary(
            elements
          );
        }
      );
    }

    elements.resultArea
      .appendChild(
        fragment
      );

    elements.resultArea
      .classList
      .add(
        'has-result-card'
      );
  }


  function clearSelectedResult(elements) {
    elements.resultArea
      .querySelectorAll(
        '[data-flow-result-card]'
      )
      .forEach((card) => {
        card.remove();
      });

    elements.resultArea
      .classList
      .remove(
        'has-result-card'
      );
  }


  function updateAddButtonText(elements) {
    const addButton =
      elements.resultArea
        .querySelector(
          '[data-flow-add-button]'
        );

    if (
      !addButton ||
      addButton.disabled
    ) {
      return;
    }

    addButton.textContent =
      `Add to ${getStatusLabel(
        selectedStatus
      )}`;
  }


  // ---------------------------------------------------------
  // STATUS PICKER
  // ---------------------------------------------------------

  function bindStatusPickerEvents(elements) {
    elements.statusRadios.forEach(
      (radio) => {
        radio.addEventListener(
          'change',
          () => {
            if (!radio.checked) {
              return;
            }

            selectedStatus =
              radio.value ||
              DEFAULT_STATUS;

            updateAddButtonText(
              elements
            );
          }
        );
      }
    );
  }


  function showStatusPicker(elements) {
    elements.statusPicker.hidden =
      false;

    elements.statusPicker.disabled =
      false;

    selectedStatus =
      DEFAULT_STATUS;

    elements.statusRadios.forEach(
      (radio) => {
        radio.checked =
          radio.value ===
          selectedStatus;
      }
    );

    elements.section
      .classList
      .add(
        'has-result'
      );

    updateAddButtonText(
      elements
    );
  }


  function hideStatusPicker(elements) {
    elements.statusPicker.hidden =
      true;

    elements.statusPicker.disabled =
      true;

    elements.statusRadios.forEach(
      (radio) => {
        radio.checked =
          radio.value ===
          DEFAULT_STATUS;
      }
    );

    elements.section
      .classList
      .remove(
        'has-result'
      );
  }


  // ---------------------------------------------------------
  // ADD STORY TO LIBRARY
  // ---------------------------------------------------------

  function addSelectedResultToLibrary(elements) {
    if (!selectedResult) {
      return;
    }

    if (
      findLibraryItem(
        selectedResult.id
      )
    ) {
      renderSelectedResult(
        selectedResult,
        elements
      );

      hideStatusPicker(
        elements
      );

      setSearchMessage(
        elements,
        'This story is already in your library.'
      );

      return;
    }

    libraryItems.push({
      id:
        selectedResult.id,

      title:
        selectedResult.title,

      creator:
        selectedResult.creator,

      type: [
        ...selectedResult.type
      ],

      coverUrl:
        selectedResult.coverUrl,

      genres: [
        ...selectedResult.genres
      ],

      status:
        selectedStatus,

      /*
        Personal rating always begins empty.
      */
      userRating:
        null,

      addedAt:
        Date.now() +
        libraryItems.length
    });

    renderSelectedResult(
      selectedResult,
      elements
    );

    hideStatusPicker(
      elements
    );

    renderLibrary(
      elements
    );

    setSearchMessage(
      elements,
      `${selectedResult.title} was added to your library.`
    );
  }


  function findLibraryItem(id) {
    return libraryItems.find(
      (item) => {
        return (
          item.id === id
        );
      }
    );
  }


  function updateLibraryItemStatus(
    id,
    status,
    elements
  ) {
    const item =
      findLibraryItem(id);

    if (!item) {
      return;
    }

    item.status =
      status;

    if (
      activeStatusFilter !==
      'all'
    ) {
      renderLibrary(
        elements
      );
    }
  }


  // ---------------------------------------------------------
  // MANUAL PERSONAL RATING
  // ---------------------------------------------------------

  function updateLibraryItemRating(
    id,
    input,
    elements,
    shouldCommit
  ) {
    const item =
      findLibraryItem(id);

    if (!item) {
      return;
    }

    const rawValue =
      input.value.trim();

    if (
      rawValue === ''
    ) {
      item.userRating =
        null;

      input.removeAttribute(
        'aria-invalid'
      );

      if (
        shouldCommit &&
        isRatingSort(
          activeSortOption
        )
      ) {
        renderLibrary(
          elements
        );
      }

      return;
    }

    const numericValue =
      Number(rawValue);

    const isValid =
      Number.isFinite(
        numericValue
      ) &&
      numericValue >= 0 &&
      numericValue <= 10;

    if (!isValid) {
      input.setAttribute(
        'aria-invalid',
        'true'
      );

      if (shouldCommit) {
        const safeValue =
          Number.isFinite(
            numericValue
          )
            ? numericValue
            : 0;

        const clampedValue =
          Math.min(
            10,
            Math.max(
              0,
              safeValue
            )
          );

        const roundedValue =
          roundRating(
            clampedValue
          );

        item.userRating =
          roundedValue;

        input.value =
          formatRatingValue(
            roundedValue
          );

        input.removeAttribute(
          'aria-invalid'
        );

        if (
          isRatingSort(
            activeSortOption
          )
        ) {
          renderLibrary(
            elements
          );
        }
      }

      return;
    }

    const roundedValue =
      roundRating(
        numericValue
      );

    item.userRating =
      roundedValue;

    input.removeAttribute(
      'aria-invalid'
    );

    if (shouldCommit) {
      input.value =
        formatRatingValue(
          roundedValue
        );

      if (
        isRatingSort(
          activeSortOption
        )
      ) {
        renderLibrary(
          elements
        );
      }
    }
  }


  function roundRating(value) {
    return (
      Math.round(
        value * 10
      ) / 10
    );
  }


  function formatRatingValue(value) {
    return Number.isInteger(
      value
    )
      ? String(value)
      : value.toFixed(1);
  }


  function isRatingSort(sortOption) {
    return (
      sortOption ===
        'rating-desc' ||
      sortOption ===
        'rating-asc'
    );
  }


  // ---------------------------------------------------------
  // FILTERS AND SORTING
  // ---------------------------------------------------------

  function bindLibraryControlEvents(elements) {
    elements.formatFilterButtons.forEach(
      (button) => {
        button.addEventListener(
          'click',
          () => {
            activeFormatFilter =
              String(
                button.dataset
                  .formatFilter ||
                'all'
              )
                .toLowerCase()
                .trim();

            updatePressedButtons(
              elements.formatFilterButtons,
              button
            );

            renderLibrary(
              elements
            );
          }
        );
      }
    );

    elements.statusFilterButtons.forEach(
      (button) => {
        button.addEventListener(
          'click',
          () => {
            activeStatusFilter =
              button.dataset
                .statusFilter ||
              'all';

            updatePressedButtons(
              elements.statusFilterButtons,
              button
            );

            renderLibrary(
              elements
            );
          }
        );
      }
    );

    elements.sortSelect.addEventListener(
      'change',
      () => {
        activeSortOption =
          elements.sortSelect.value;

        elements.sortSelect
          .closest(
            '.flow-select-shell'
          )
          ?.classList
          .toggle(
            'is-active',
            activeSortOption !== ''
          );

        renderLibrary(
          elements
        );
      }
    );
  }


  function updatePressedButtons(
    buttons,
    activeButton
  ) {
    buttons.forEach(
      (button) => {
        const isActive =
          button ===
          activeButton;

        button.classList.toggle(
          'active',
          isActive
        );

        button.setAttribute(
          'aria-pressed',
          String(isActive)
        );
      }
    );
  }


  function getFilteredLibraryItems() {
    const filteredItems =
      libraryItems.filter(
        (item) => {
          const matchesFormat =
            activeFormatFilter ===
              'all' ||
            itemMatchesFormatFilter(
              item,
              activeFormatFilter
            );

          const matchesStatus =
            activeStatusFilter ===
              'all' ||
            item.status ===
              activeStatusFilter;

          return (
            matchesFormat &&
            matchesStatus
          );
        }
      );

    return sortLibraryItems(
      filteredItems,
      activeSortOption
    );
  }


  function itemMatchesFormatFilter(
    item,
    filter
  ) {
    return getCanonicalFormats(
      item.type
    ).includes(
      filter
    );
  }


  function sortLibraryItems(
    items,
    sortOption
  ) {
    return [...items].sort(
      (a, b) => {
        switch (sortOption) {
          case 'title-asc':
            return compareTitles(
              a.title,
              b.title
            );

          case 'title-desc':
            return compareTitles(
              b.title,
              a.title
            );

          case 'rating-desc':
            return compareUserRatings(
              a,
              b,
              'desc'
            );

          case 'rating-asc':
            return compareUserRatings(
              a,
              b,
              'asc'
            );

          case '':
          default:
            return (
              Number(
                b.addedAt || 0
              ) -
              Number(
                a.addedAt || 0
              )
            );
        }
      }
    );
  }


  function compareTitles(a, b) {
    return String(a)
      .localeCompare(
        String(b),
        undefined,
        {
          sensitivity: 'base'
        }
      );
  }


  function compareUserRatings(
    a,
    b,
    direction
  ) {
    const aRating =
      getUserRatingNumber(
        a.userRating
      );

    const bRating =
      getUserRatingNumber(
        b.userRating
      );

    const aIsRated =
      aRating !== null;

    const bIsRated =
      bRating !== null;

    /*
      Unrated stories remain after rated stories.
    */
    if (
      aIsRated !==
      bIsRated
    ) {
      return aIsRated
        ? -1
        : 1;
    }

    if (
      !aIsRated &&
      !bIsRated
    ) {
      return compareTitles(
        a.title,
        b.title
      );
    }

    if (
      direction ===
      'asc'
    ) {
      return (
        aRating -
          bRating ||
        compareTitles(
          a.title,
          b.title
        )
      );
    }

    return (
      bRating -
        aRating ||
      compareTitles(
        a.title,
        b.title
      )
    );
  }


  function getUserRatingNumber(value) {
    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return null;
    }

    const rating =
      Number(value);

    return Number.isFinite(
      rating
    )
      ? rating
      : null;
  }


  // ---------------------------------------------------------
  // RENDER LIBRARY
  // ---------------------------------------------------------

  function renderLibrary(elements) {
    const filteredItems =
      getFilteredLibraryItems();

    const hasItems =
      libraryItems.length > 0;

    elements.libraryCount
      .textContent =
        String(
          libraryItems.length
        );

    elements.libraryList
      .innerHTML =
        '';

    elements.section
      .classList
      .toggle(
        'has-library-item',
        hasItems
      );

    elements.libraryCard
      .classList
      .toggle(
        'has-library-item',
        hasItems
      );

    if (
      filteredItems.length === 0
    ) {
      elements.libraryEmpty.hidden =
        false;

      setLibraryEmptyText(
        elements,
        getLibraryEmptyText()
      );

      return;
    }

    elements.libraryEmpty.hidden =
      true;

    filteredItems.forEach(
      (item) => {
        const row =
          createLibraryRow(
            item,
            elements
          );

        if (row) {
          elements.libraryList
            .appendChild(
              row
            );
        }
      }
    );
  }


  function createLibraryRow(
    item,
    elements
  ) {
    const fragment =
      elements.libraryRowTemplate
        .content
        .cloneNode(true);

    const row =
      fragment.querySelector(
        '[data-library-row]'
      );

    const coverImage =
      fragment.querySelector(
        '[data-library-cover]'
      );

    const title =
      fragment.querySelector(
        '[data-library-title]'
      );

    const creator =
      fragment.querySelector(
        '[data-library-creator]'
      );

    const formatContainer =
      fragment.querySelector(
        '[data-library-format]'
      );

    const statusSelect =
      fragment.querySelector(
        '[data-library-status]'
      );

    const ratingInput =
      fragment.querySelector(
        '[data-library-rating]'
      );

    if (!row) {
      console.error(
        'The library row template is missing [data-library-row].'
      );

      return null;
    }

    row.dataset.storyId =
      item.id;

    row.dataset.status =
      item.status;

    row.dataset.format =
      getCanonicalFormats(
        item.type
      ).join(' ');

    if (coverImage) {
      setImage(
        coverImage,
        item.coverUrl,
        `${item.title} cover`
      );
    }

    if (title) {
      title.textContent =
        item.title;
    }

    if (creator) {
      creator.textContent =
        item.creator
          ? `by ${item.creator}`
          : 'Unknown creator';
    }

    if (formatContainer) {
      renderFormatBadges(
        formatContainer,
        item.type
      );
    }

    if (statusSelect) {
      statusSelect.value =
        item.status;

      statusSelect.setAttribute(
        'aria-label',
        `Change status for ${item.title}`
      );

      statusSelect.addEventListener(
        'change',
        () => {
          updateLibraryItemStatus(
            item.id,
            statusSelect.value,
            elements
          );
        }
      );
    }

    if (ratingInput) {
      ratingInput.value =
        item.userRating === null
          ? ''
          : formatRatingValue(
              item.userRating
            );

      ratingInput.setAttribute(
        'aria-label',
        `Your personal rating for ${item.title}, from 0 to 10`
      );

      ratingInput.addEventListener(
        'input',
        () => {
          updateLibraryItemRating(
            item.id,
            ratingInput,
            elements,
            false
          );
        }
      );

      ratingInput.addEventListener(
        'change',
        () => {
          updateLibraryItemRating(
            item.id,
            ratingInput,
            elements,
            true
          );
        }
      );
    }

    return row;
  }


  // ---------------------------------------------------------
  // FORMAT BADGES AND FILTER MATCHING
  // ---------------------------------------------------------

  function renderFormatBadges(
    container,
    typeValue
  ) {
    container.innerHTML =
      '';

    const formats =
      getCanonicalFormats(
        typeValue
      );

    const visibleFormats =
      formats.slice(
        0,
        2
      );

    const hiddenCount =
      Math.max(
        0,
        formats.length - 2
      );

    if (
      visibleFormats.length === 0
    ) {
      visibleFormats.push(
        'story'
      );
    }

    visibleFormats.forEach(
      (format) => {
        const badge =
          document.createElement(
            'span'
          );

        badge.className =
          'flow-format-badge';

        badge.textContent =
          getFormatLabel(
            format
          );

        container.appendChild(
          badge
        );
      }
    );

    if (
      hiddenCount > 0
    ) {
      const moreBadge =
        document.createElement(
          'span'
        );

      moreBadge.className =
        'flow-format-more';

      moreBadge.textContent =
        `+${hiddenCount}`;

      moreBadge.title =
        formats
          .slice(2)
          .map(
            getFormatLabel
          )
          .join(', ');

      container.appendChild(
        moreBadge
      );
    }
  }


  function getCanonicalFormats(typeValue) {
    const formats =
      getTypeList({
        type: typeValue
      })
        .map(
          canonicalizeFormat
        )
        .filter(Boolean);

    return [
      ...new Set(
        formats
      )
    ];
  }


  function canonicalizeFormat(value) {
    const token =
      normalizeSearchText(
        value
      ).replace(
        /\s+/g,
        ''
      );

    if (!token) {
      return '';
    }

    if (
      token.includes(
        'visualnovel'
      ) ||
      token === 'game' ||
      token.includes(
        'videogame'
      )
    ) {
      return 'visual-novel';
    }

    if (
      token.includes(
        'lightnovel'
      ) ||
      token === 'novel'
    ) {
      return 'light-novel';
    }

    if (
      token.includes(
        'anime'
      )
    ) {
      return 'anime';
    }

    if (
      token.includes(
        'manga'
      ) ||
      token.includes(
        'manhwa'
      ) ||
      token.includes(
        'manhua'
      ) ||
      token.includes(
        'comic'
      )
    ) {
      return 'manga';
    }

    return token;
  }


  function getFormatLabel(format) {
    const labels = {
      manga:
        'Manga',

      anime:
        'Anime',

      'light-novel':
        'Light novel',

      'visual-novel':
        'Visual novel',

      story:
        'Story'
    };

    return (
      labels[format] ||
      titleCase(
        format.replace(
          /-/g,
          ' '
        )
      )
    );
  }


  // ---------------------------------------------------------
  // EMPTY LIBRARY TEXT
  // ---------------------------------------------------------

  function setLibraryEmptyText(
    elements,
    text
  ) {
    const paragraph =
      elements.libraryEmpty
        .querySelector(
          'p'
        );

    if (paragraph) {
      paragraph.textContent =
        text;
    }
  }


  function getLibraryEmptyText() {
    if (
      libraryItems.length === 0
    ) {
      return (
        'Search and add something above. ' +
        'Your saved stories will appear here.'
      );
    }

    return (
      'No saved stories match ' +
      'the selected filters.'
    );
  }


  // ---------------------------------------------------------
  // COVER IMAGES
  // ---------------------------------------------------------

  function getCoverUrlFromId(id) {
    if (
      !id ||
      !supabaseClient
    ) {
      return '';
    }

    const coverPath =
      `${COVER_FOLDER}/${id}.jpg`;

    const {
      data
    } = supabaseClient
      .storage
      .from(
        BUCKET_NAME
      )
      .getPublicUrl(
        coverPath
      );

    return (
      data?.publicUrl ||
      ''
    );
  }


  function setImage(
    image,
    url,
    altText
  ) {
    image.alt =
      altText || '';

    if (!url) {
      hideBrokenImage(
        image
      );

      return;
    }

    image.hidden =
      false;

    image.onerror =
      () => {
        console.warn(
          'Cover failed to load:',
          url
        );

        hideBrokenImage(
          image
        );
      };

    image.onload =
      () => {
        image.hidden =
          false;
      };

    image.src =
      url;
  }


  function hideBrokenImage(image) {
    image.hidden =
      true;

    image.removeAttribute(
      'src'
    );
  }


  // ---------------------------------------------------------
  // SEARCH STATUS MESSAGE
  // ---------------------------------------------------------

  function setSearchMessage(
    elements,
    text
  ) {
    const paragraph =
      elements.searchMessage
        .querySelector(
          'p'
        );

    if (paragraph) {
      paragraph.textContent =
        text;
    } else {
      elements.searchMessage
        .textContent =
          text;
    }

    elements.searchMessage.hidden =
      false;
  }


  // ---------------------------------------------------------
  // DISPLAY HELPERS
  // ---------------------------------------------------------

  function getSuggestionMeta(item) {
    const type =
      formatTypeLabel(
        item.type
      );

    const score =
      hasDisplayValue(
        item.score
      )
        ? ` · ${item.score}`
        : '';

    return (
      `${type}${score}`
    );
  }


  function getResultTypeLabel(item) {
    return getSuggestionMeta(
      item
    );
  }


  function getStatusLabel(status) {
    return (
      STATUS_LABELS[
        status
      ] ||
      status
    );
  }


  // ---------------------------------------------------------
  // DATABASE VALUE HELPERS
  // ---------------------------------------------------------

  function getCreatorValue(item) {
    return String(
      item.creator ??
      item.author ??
      item.writer ??
      ''
    ).trim();
  }


  function getScoreValue(item) {
    const value =
      item.heroScore ??
      item.hero_score ??
      item.score ??
      item.rating ??
      '';

    if (
      !hasDisplayValue(
        value
      )
    ) {
      return '';
    }

    return Number.isFinite(
      Number(value)
    )
      ? Number(value)
      : String(value);
  }


  function getNumericScore(value) {
    return Number.isFinite(
      Number(value)
    )
      ? Number(value)
      : 0;
  }


  function hasDisplayValue(value) {
    return (
      value !== null &&
      value !== undefined &&
      value !== ''
    );
  }


  function getTypeList(item) {
    const rawType =
      item.type ??
      item.format ??
      [];

    return getArrayValue(
      rawType
    )
      .map((type) => {
        return String(type)
          .toLowerCase()
          .trim();
      })
      .filter(Boolean);
  }


  function getArrayValue(value) {
    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return [];
    }

    if (
      Array.isArray(value)
    ) {
      return value;
    }

    if (
      typeof value ===
      'string'
    ) {
      const trimmedValue =
        value.trim();

      if (!trimmedValue) {
        return [];
      }

      try {
        const parsedValue =
          JSON.parse(
            trimmedValue
          );

        if (
          Array.isArray(
            parsedValue
          )
        ) {
          return parsedValue;
        }
      } catch {
        /*
          Normal text rather than a JSON array.
        */
      }

      return [
        trimmedValue
      ];
    }

    return [
      value
    ];
  }


  function formatTypeLabel(typeValue) {
    const types =
      Array.isArray(
        typeValue
      )
        ? typeValue
        : getArrayValue(
            typeValue
          );

    if (
      types.length === 0
    ) {
      return 'Story';
    }

    return types
      .map((type) => {
        return titleCase(
          String(type)
            .replace(
              /[-_]/g,
              ' '
            )
        );
      })
      .filter(Boolean)
      .join(' / ');
  }


  function titleCase(value) {
    return String(value)
      .trim()
      .replace(
        /\b\w/g,
        (character) => {
          return character
            .toUpperCase();
        }
      );
  }


  // ---------------------------------------------------------
  // ERROR LOGGING
  // ---------------------------------------------------------

  function logSupabaseError(
    context,
    error
  ) {
    console.error(
      context,
      {
        message:
          error?.message ||
          String(error),

        code:
          error?.code ||
          '',

        details:
          error?.details ||
          '',

        hint:
          error?.hint ||
          ''
      }
    );
  }


  // ---------------------------------------------------------
  // RUN MAIN FUNCTIONALITY
  // ---------------------------------------------------------

  if (
    document.readyState ===
    'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      startSection3LibraryFlow,
      {
        once: true
      }
    );
  } else {
    startSection3LibraryFlow();
  }
})();


// =========================================================
// SECTION 3 — GUIDED ENTRANCE ANIMATION
// =========================================================

(() => {
  'use strict';

  const ITEM_TIMING = {
    copy: {
      start: 40,
      step: 80
    },

    search: {
      start: 170,
      step: 90
    },

    library: {
      start: 190,
      step: 70
    }
  };


  function startSection3Motion() {
    const section =
      document.querySelector(
        '#section-3-library-flow'
      );

    if (!section) {
      return;
    }

    const groups = [
      ...section.querySelectorAll(
        '[data-flow-motion]'
      )
    ];

    if (
      groups.length === 0
    ) {
      return;
    }

    prepareInternalDelays(
      groups
    );

    const prefersReducedMotion =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

    if (prefersReducedMotion) {
      showMotionGroups(
        groups
      );

      markMotionComplete(
        groups
      );

      return;
    }

    section.classList.add(
      'flow-motion-ready'
    );

    let hasPlayed =
      false;


    function playMotionOnce() {
      if (hasPlayed) {
        return;
      }

      hasPlayed =
        true;

      showMotionGroups(
        groups
      );

      window.setTimeout(
        () => {
          markMotionComplete(
            groups
          );
        },
        1800
      );
    }


    if (
      'IntersectionObserver'
      in window
    ) {
      const observer =
        new IntersectionObserver(
          (entries) => {
            const sectionEntry =
              entries.find(
                (entry) => {
                  return (
                    entry.target ===
                      section &&
                    entry.isIntersecting
                  );
                }
              );

            if (!sectionEntry) {
              return;
            }

            playMotionOnce();

            observer.unobserve(
              section
            );
          },
          {
            threshold:
              0.17,

            rootMargin:
              '0px 0px -9% 0px'
          }
        );

      window.requestAnimationFrame(
        () => {
          observer.observe(
            section
          );
        }
      );

      return;
    }

    playMotionOnce();
  }


  function prepareInternalDelays(groups) {
    groups.forEach(
      (group) => {
        const groupName =
          group.dataset
            .flowMotion ||
          '';

        const timing =
          ITEM_TIMING[
            groupName
          ] || {
            start: 80,
            step: 70
          };

        const items = [
          ...group.querySelectorAll(
            '[data-flow-motion-item]'
          )
        ];

        items.forEach(
          (item, index) => {
            const delay =
              timing.start +
              index *
                timing.step;

            item.style.setProperty(
              '--flow-item-delay',
              `${delay}ms`
            );
          }
        );
      }
    );
  }


  function showMotionGroups(groups) {
    window.requestAnimationFrame(
      () => {
        groups.forEach(
          (group) => {
            group.classList.add(
              'is-motion-visible'
            );
          }
        );
      }
    );
  }


  function markMotionComplete(groups) {
    groups.forEach(
      (group) => {
        group.classList.add(
          'motion-complete'
        );
      }
    );
  }


  if (
    document.readyState ===
    'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      startSection3Motion,
      {
        once: true
      }
    );
  } else {
    startSection3Motion();
  }
})();