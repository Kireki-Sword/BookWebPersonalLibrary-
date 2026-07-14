// section3LibraryFlow-final.js
// =========================================================
// SECTION 3 — SEARCH → PREVIEW → STATUS → MINI LIBRARY
//
// Uses the same Supabase setup and cover rule as Section 1:
//   bucket: img
//   path:   covers/{manga-id}.jpg
//
// Load this file after:
//   1. the Supabase JavaScript library
//   2. the Section 3 HTML
// =========================================================

(() => {
  'use strict';

  // ---------------------------------------------------------
  // DATABASE CONFIG
  // ---------------------------------------------------------

  const SUPABASE_URL =
    'https://hsruxfpslxguhwnccwuj.supabase.co';

  const SUPABASE_KEY =
    'sb_publishable_Z2upBCdemNtdB4j5jry65A_XD_u8BsD';

  const TABLE_NAME = 'manga';
  const BUCKET_NAME = 'img';
  const COVER_FOLDER = 'covers';

  /*
    Only request fields that actually exist in your manga table.

    There is intentionally no "cover" column here.

    Cover images are created from the manga ID:

    img bucket
      └── covers
            └── attack-on-titan-2009.jpg
  */
  const SEARCH_COLUMNS = [
    'id',
    'title',
    'alternativeTitles',
    'type',
    'creator',
    'heroScore',
    'genres'
  ].join(', ');

  /*
    Supabase commonly returns up to 1000 rows per request.

    This code requests additional pages when the table contains
    more than 1000 manga records.
  */
  const CATALOG_PAGE_SIZE = 1000;

  const SEARCH_RESULT_LIMIT = 3;
  const SEARCH_DEBOUNCE_MS = 260;

  const DEFAULT_STATUS = 'in-progress';

  const STATUS_LABELS = {
    'in-progress': 'Reading',
    completed: 'Completed',
    planned: 'Planned',
    paused: 'Paused',
    dropped: 'Dropped'
  };

  // ---------------------------------------------------------
  // STATE
  // ---------------------------------------------------------

  let supabaseClient = null;
  let cataloguePromise = null;

  let searchTimer = null;
  let lastSearchRequestId = 0;

  let currentSuggestions = [];
  let selectedResult = null;
  let selectedStatus = DEFAULT_STATUS;

  let libraryItems = [];

  let activeFormatFilter = 'all';
  let activeStatusFilter = 'all';

  // ---------------------------------------------------------
  // INITIALIZATION
  // ---------------------------------------------------------

  function startSection3LibraryFlow() {
    const section = document.querySelector(
      '#section-3-library-flow'
    );

    /*
      Stop safely when this page does not contain Section 3.
    */
    if (!section) {
      return;
    }

    const elements = getElements(section);

    if (!hasRequiredElements(elements)) {
      console.error(
        'Missing one or more required Section 3 elements.',
        elements
      );

      return;
    }

    /*
      The Supabase CDN script must load before this file.
    */
    if (!window.supabase) {
      console.error(
        'Supabase library is not loaded. ' +
        'Load the Supabase script before section3LibraryFlow-final.js.'
      );

      setSearchMessage(
        elements,
        'Search is unavailable because the database library did not load.'
      );

      disableSearch(elements);

      return;
    }

    /*
      Create the Supabase client using the same setup as Section 1.
    */
    supabaseClient = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );

    bindSearchEvents(elements);
    bindStatusPickerEvents(elements);
    bindLibraryFilterEvents(elements);

    hideStatusPicker(elements);
    renderSuggestions(elements);
    renderLibrary(elements);

    setSearchMessage(
      elements,
      'Loading the story catalogue…'
    );

    disableSearch(elements);

    /*
      Load the searchable manga catalogue immediately.

      After it loads, searching happens locally in the browser.
      This avoids making a new database request for every letter.
    */
    cataloguePromise = loadSearchCatalogue();

    cataloguePromise
      .then((catalogue) => {
        enableSearch(elements);

        if (catalogue.length === 0) {
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

        disableSearch(elements);

        setSearchMessage(
          elements,
          'Search is unavailable right now. Check the browser console.'
        );
      });
  }

  // ---------------------------------------------------------
  // FIND SECTION 3 HTML ELEMENTS
  // ---------------------------------------------------------

  function getElements(section) {
    return {
      section,

      searchForm: section.querySelector(
        '[data-flow-search-form]'
      ),

      searchInput: section.querySelector(
        '[data-flow-search-input]'
      ),

      searchButton: section.querySelector(
        '[data-flow-search-button]'
      ),

      suggestions: section.querySelector(
        '[data-flow-suggestions]'
      ),

      searchMessage: section.querySelector(
        '[data-flow-search-empty]'
      ),

      resultArea: section.querySelector(
        '[data-flow-result-area]'
      ),

      resultTemplate: section.querySelector(
        '#flow-result-template'
      ),

      statusPicker: section.querySelector(
        '[data-flow-status-picker]'
      ),

      statusRadios: [
        ...section.querySelectorAll(
          'input[name="flow_status"]'
        )
      ],

      libraryCard: section.querySelector(
        '.flow-library-card'
      ),

      libraryEmpty: section.querySelector(
        '[data-library-empty]'
      ),

      libraryList: section.querySelector(
        '[data-library-list]'
      ),

      libraryRowTemplate: section.querySelector(
        '#flow-library-row-template'
      ),

      libraryCount: section.querySelector(
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
      ]
    };
  }

  function hasRequiredElements(elements) {
    return Boolean(
      elements.section &&
      elements.searchForm &&
      elements.searchInput &&
      elements.searchButton &&
      elements.suggestions &&
      elements.searchMessage &&
      elements.resultArea &&
      elements.resultTemplate &&
      elements.statusPicker &&
      elements.libraryEmpty &&
      elements.libraryList &&
      elements.libraryRowTemplate &&
      elements.libraryCount
    );
  }

  function disableSearch(elements) {
    elements.searchInput.disabled = true;
    elements.searchButton.disabled = true;
  }

  function enableSearch(elements) {
    elements.searchInput.disabled = false;
    elements.searchButton.disabled = false;
  }

  // ---------------------------------------------------------
  // LOAD SEARCHABLE MANGA CATALOGUE
  // ---------------------------------------------------------

  async function loadSearchCatalogue() {
    const rows = [];

    let from = 0;

    while (true) {
      const to =
        from + CATALOG_PAGE_SIZE - 1;

      const { data, error } = await supabaseClient
        .from(TABLE_NAME)
        .select(SEARCH_COLUMNS)
        .order('heroScore', {
          ascending: false,
          nullsFirst: false
        })
        .range(from, to);

      if (error) {
        throw error;
      }

      const page = Array.isArray(data)
        ? data
        : [];

      rows.push(...page);

      /*
        A page smaller than the requested page size means
        there are no more rows to request.
      */
      if (page.length < CATALOG_PAGE_SIZE) {
        break;
      }

      from += CATALOG_PAGE_SIZE;
    }

    const catalogue =
      normalizeSearchResults(rows);

    console.log(
      `SECTION 3: loaded ${catalogue.length} searchable manga rows.`
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
    /*
      Handle the search form submission.

      This covers:
      - clicking a submit button
      - pressing Enter inside the search input
    */
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

    /*
      A submit button inside the form is already handled
      by the form submit listener.

      Only add a separate click listener when the button is
      not submitting this form.
    */
    const buttonSubmitsForm =
      elements.searchForm.contains(
        elements.searchButton
      ) &&
      elements.searchButton.type === 'submit';

    if (!buttonSubmitsForm) {
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
    }

    /*
      Live suggestions while the visitor types.
    */
    elements.searchInput.addEventListener(
      'input',
      () => {
        const query =
          elements.searchInput.value.trim();

        window.clearTimeout(searchTimer);

        clearSelectedResult(elements);
        hideStatusPicker(elements);

        selectedResult = null;

        if (query.length < 2) {
          currentSuggestions = [];

          renderSuggestions(elements);

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

        searchTimer = window.setTimeout(
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
      elements.searchInput.value.trim();

    if (query.length < 2) {
      setSearchMessage(
        elements,
        'Type at least 2 letters to search.'
      );

      return;
    }

    window.clearTimeout(searchTimer);

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
        await fetchSearchResults(query);

      /*
        Ignore an older request when a newer search
        has already started.
      */
      if (
        requestId !== lastSearchRequestId
      ) {
        return;
      }

      currentSuggestions = results;

      renderSuggestions(elements);

      if (results.length === 0) {
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

      if (options.autoSelectFirst) {
        selectSuggestion(
          results[0],
          elements
        );
      }
    } catch (error) {
      if (
        requestId !== lastSearchRequestId
      ) {
        return;
      }

      logSupabaseError(
        'Section 3 search failed',
        error
      );

      currentSuggestions = [];

      renderSuggestions(elements);

      setSearchMessage(
        elements,
        'Search is unavailable right now. Check the browser console.'
      );
    }
  }

  // ---------------------------------------------------------
  // SEARCH THE LOCAL CATALOGUE
  // ---------------------------------------------------------

  async function fetchSearchResults(query) {
    const catalogue =
      await getSearchCatalogue();

    const searchWords =
      normalizeSearchText(query)
        .split(' ')
        .filter(Boolean);

    if (searchWords.length === 0) {
      return [];
    }

    return catalogue
      .map((item) => {
        return {
          item,
          rank: getSearchRank(
            item,
            searchWords
          )
        };
      })
      .filter((entry) => {
        return entry.rank > 0;
      })
      .sort((a, b) => {
        /*
          First sort by search relevance.
        */
        if (b.rank !== a.rank) {
          return b.rank - a.rank;
        }

        /*
          When two results have the same relevance,
          put the higher heroScore first.
        */
        return (
          getNumericScore(b.item.score) -
          getNumericScore(a.item.score)
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
      normalizeSearchText(item.title);

    const normalizedCreator =
      normalizeSearchText(item.creator);

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

    /*
      Every word entered by the visitor must appear
      somewhere in the searchable manga information.
    */
    const allWordsMatch =
      searchWords.every((word) => {
        return searchableText.includes(word);
      });

    if (!allWordsMatch) {
      return 0;
    }

    const fullQuery =
      searchWords.join(' ');

    let rank = 1;

    /*
      Main title matches.
    */
    if (
      normalizedTitle === fullQuery
    ) {
      rank += 100;
    } else if (
      normalizedTitle.startsWith(
        fullQuery
      )
    ) {
      rank += 80;
    } else if (
      normalizedTitle.includes(
        fullQuery
      )
    ) {
      rank += 60;
    }

    /*
      Alternative title matches.
    */
    if (
      normalizedAlternatives.some(
        (title) => {
          return title === fullQuery;
        }
      )
    ) {
      rank += 90;
    } else if (
      normalizedAlternatives.some(
        (title) => {
          return title.startsWith(
            fullQuery
          );
        }
      )
    ) {
      rank += 70;
    } else if (
      normalizedAlternatives.some(
        (title) => {
          return title.includes(
            fullQuery
          );
        }
      )
    ) {
      rank += 50;
    }

    /*
      Creator matches.
    */
    if (
      normalizedCreator === fullQuery
    ) {
      rank += 40;
    } else if (
      normalizedCreator.includes(
        fullQuery
      )
    ) {
      rank += 25;
    }

    return rank;
  }

  function normalizeSearchText(value) {
    return String(value ?? '')
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

  // ---------------------------------------------------------
  // NORMALIZE DATABASE ROWS
  // ---------------------------------------------------------

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
          id: String(item.id),

          title: String(item.title),

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
            getCreatorValue(item),

          type:
            getTypeList(item),

          /*
            This uses the same cover URL method
            as Section 1.
          */
          coverUrl:
            getCoverUrlFromId(
              item.id
            ),

          score:
            getScoreValue(item),

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

          raw: item
        };
      });
  }

  // ---------------------------------------------------------
  // SEARCH SUGGESTIONS
  // ---------------------------------------------------------

  function renderSuggestions(elements) {
    elements.suggestions.innerHTML = '';

    if (
      currentSuggestions.length === 0
    ) {
      elements.suggestions.hidden = true;

      return;
    }

    elements.suggestions.hidden = false;

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

        const img =
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

        button.type = 'button';

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
          getSuggestionMeta(item);

        /*
          Suggestion images are decorative,
          so they use an empty alt value.
        */
        setImage(
          img,
          item.coverUrl,
          ''
        );

        cover.appendChild(img);

        info.appendChild(title);
        info.appendChild(meta);

        button.appendChild(cover);
        button.appendChild(info);

        button.addEventListener(
          'click',
          () => {
            selectSuggestion(
              item,
              elements
            );
          }
        );

        elements.suggestions.appendChild(
          button
        );
      }
    );
  }

  function selectSuggestion(
    item,
    elements
  ) {
    selectedResult = item;
    selectedStatus = DEFAULT_STATUS;

    elements.searchInput.value =
      item.title;

    currentSuggestions = [];

    renderSuggestions(elements);
    renderSelectedResult(
      item,
      elements
    );

    const existingItem =
      findLibraryItem(item.id);

    if (existingItem) {
      hideStatusPicker(elements);

      setSearchMessage(
        elements,
        'This story is already in your library.'
      );

      return;
    }

    showStatusPicker(elements);

    setSearchMessage(
      elements,
      'Choose a status, then add it to your library.'
    );
  }

  // ---------------------------------------------------------
  // SELECTED RESULT CARD
  // ---------------------------------------------------------

  function renderSelectedResult(
    item,
    elements
  ) {
    clearSelectedResult(elements);

    const fragment =
      elements.resultTemplate.content.cloneNode(
        true
      );

    const card =
      fragment.querySelector(
        '[data-flow-result-card]'
      );

    const coverImg =
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
        'The Section 3 result template is missing required elements.'
      );

      return;
    }

    card.dataset.storyId =
      item.id;

    if (coverImg) {
      setImage(
        coverImg,
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
        getResultTypeLabel(item);
    }

    const existingItem =
      findLibraryItem(item.id);

    if (existingItem) {
      addButton.textContent =
        'Added';

      addButton.classList.add(
        'is-added'
      );

      addButton.disabled = true;
    } else {
      addButton.classList.remove(
        'is-added'
      );

      addButton.disabled = false;

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

    elements.resultArea.appendChild(
      fragment
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
  }

  function getCurrentAddButton(elements) {
    return elements.resultArea.querySelector(
      '[data-flow-add-button]'
    );
  }

  function updateAddButtonText(elements) {
    const addButton =
      getCurrentAddButton(elements);

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

  function bindStatusPickerEvents(
    elements
  ) {
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
    elements.statusPicker.hidden = false;
    elements.statusPicker.disabled = false;

    elements.statusPicker.classList.add(
      'is-active'
    );

    selectedStatus =
      DEFAULT_STATUS;

    elements.statusRadios.forEach(
      (radio) => {
        radio.checked =
          radio.value ===
          selectedStatus;
      }
    );

    elements.section.classList.add(
      'has-result'
    );

    updateAddButtonText(elements);
  }

  function hideStatusPicker(elements) {
    elements.statusPicker.hidden = true;
    elements.statusPicker.disabled = true;

    elements.statusPicker.classList.remove(
      'is-active'
    );

    elements.statusRadios.forEach(
      (radio) => {
        radio.checked =
          radio.value ===
          DEFAULT_STATUS;
      }
    );

    elements.section.classList.remove(
      'has-result'
    );
  }

  // ---------------------------------------------------------
  // ADD TO MINI LIBRARY
  // ---------------------------------------------------------

  function addSelectedResultToLibrary(
    elements
  ) {
    if (!selectedResult) {
      return;
    }

    const existingItem =
      findLibraryItem(
        selectedResult.id
      );

    if (existingItem) {
      renderSelectedResult(
        selectedResult,
        elements
      );

      hideStatusPicker(elements);

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

      score:
        selectedResult.score,

      genres: [
        ...selectedResult.genres
      ],

      status:
        selectedStatus
    });

    renderSelectedResult(
      selectedResult,
      elements
    );

    hideStatusPicker(elements);
    renderLibrary(elements);

    setSearchMessage(
      elements,
      `${selectedResult.title} was added to your library.`
    );
  }

  function findLibraryItem(id) {
    return libraryItems.find(
      (item) => {
        return item.id === id;
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

    item.status = status;

    renderLibrary(elements);
  }

  // ---------------------------------------------------------
  // LIBRARY FILTERS
  // ---------------------------------------------------------

  function bindLibraryFilterEvents(
    elements
  ) {
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

            renderLibrary(elements);
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

            renderLibrary(elements);
          }
        );
      }
    );
  }

  function updatePressedButtons(
    buttons,
    activeButton
  ) {
    buttons.forEach((button) => {
      const isActive =
        button === activeButton;

      button.classList.toggle(
        'active',
        isActive
      );

      button.setAttribute(
        'aria-pressed',
        String(isActive)
      );
    });
  }

  function getFilteredLibraryItems() {
    return libraryItems.filter(
      (item) => {
        const matchesFormat =
          activeFormatFilter ===
            'all' ||
          getTypeList(item).includes(
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
  }

  // ---------------------------------------------------------
  // LIBRARY RENDERING
  // ---------------------------------------------------------

  function renderLibrary(elements) {
    const filteredItems =
      getFilteredLibraryItems();

    elements.libraryCount.textContent =
      String(libraryItems.length);

    elements.libraryList.innerHTML = '';

    const hasItems =
      libraryItems.length > 0;

    elements.section.classList.toggle(
      'has-library-item',
      hasItems
    );

    if (elements.libraryCard) {
      elements.libraryCard.classList.toggle(
        'has-library-item',
        hasItems
      );
    }

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
          elements.libraryList.appendChild(
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

    if (!row) {
      console.error(
        'The Section 3 library row template is missing [data-library-row].'
      );

      return null;
    }

    const coverImg =
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

    const format =
      fragment.querySelector(
        '[data-library-format]'
      );

    const statusSelect =
      fragment.querySelector(
        '[data-library-status]'
      );

    const rating =
      fragment.querySelector(
        '[data-library-rating]'
      );

    row.dataset.storyId =
      item.id;

    row.dataset.format =
      getTypeList(item).join(' ');

    row.dataset.status =
      item.status;

    if (coverImg) {
      setImage(
        coverImg,
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

    if (format) {
      format.textContent =
        formatTypeLabel(
          item.type
        );
    }

    if (rating) {
      rating.textContent =
        hasDisplayValue(item.score)
          ? String(item.score)
          : '—';
    }

    if (statusSelect) {
      statusSelect.value =
        item.status;

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

    return row;
  }

  function setLibraryEmptyText(
    elements,
    text
  ) {
    const paragraph =
      elements.libraryEmpty.querySelector(
        'p'
      );

    if (paragraph) {
      paragraph.textContent = text;
    }
  }

  function getLibraryEmptyText() {
    if (libraryItems.length === 0) {
      return (
        'Search and add something above. ' +
        'Your saved stories will appear here.'
      );
    }

    return (
      'No saved stories match ' +
      'these filters yet.'
    );
  }

  // ---------------------------------------------------------
  // COVER LOADING — SAME RULE AS SECTION 1
  // ---------------------------------------------------------

  function getCoverUrlFromId(id) {
    if (
      !id ||
      !supabaseClient
    ) {
      return '';
    }

    /*
      Example:

      ID:
      attack-on-titan-2009

      Storage path:
      covers/attack-on-titan-2009.jpg
    */
    const coverPath =
      `${COVER_FOLDER}/${id}.jpg`;

    const { data } =
      supabaseClient
        .storage
        .from(BUCKET_NAME)
        .getPublicUrl(coverPath);

    return data?.publicUrl || '';
  }

  function setImage(
    img,
    url,
    altText
  ) {
    img.alt = altText || '';

    if (!url) {
      hideBrokenImage(img);

      return;
    }

    img.hidden = false;

    img.onerror = () => {
      console.warn(
        'Cover failed to load:',
        url
      );

      hideBrokenImage(img);
    };

    img.onload = () => {
      img.hidden = false;
    };

    img.src = url;
  }

  function hideBrokenImage(img) {
    img.hidden = true;

    img.removeAttribute('src');
  }

  // ---------------------------------------------------------
  // SEARCH MESSAGE
  // ---------------------------------------------------------

  function setSearchMessage(
    elements,
    text
  ) {
    const paragraph =
      elements.searchMessage.querySelector(
        'p'
      );

    if (paragraph) {
      paragraph.textContent = text;
    } else {
      elements.searchMessage.textContent =
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
      formatTypeLabel(item.type);

    const score =
      hasDisplayValue(item.score)
        ? ` · ${item.score}`
        : '';

    return `${type}${score}`;
  }

  function getResultTypeLabel(item) {
    return getSuggestionMeta(item);
  }

  function getStatusLabel(status) {
    return (
      STATUS_LABELS[status] ||
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

    if (!hasDisplayValue(value)) {
      return '';
    }

    if (
      Number.isFinite(
        Number(value)
      )
    ) {
      return Number(value);
    }

    return String(value);
  }

  function getNumericScore(value) {
    if (
      Number.isFinite(
        Number(value)
      )
    ) {
      return Number(value);
    }

    return 0;
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

    return getArrayValue(rawType)
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

    if (Array.isArray(value)) {
      return value;
    }

    /*
      This also supports database values accidentally
      returned as serialized JSON strings.
    */
    if (typeof value === 'string') {
      const trimmed =
        value.trim();

      if (!trimmed) {
        return [];
      }

      try {
        const parsed =
          JSON.parse(trimmed);

        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        /*
          The value is normal text rather than JSON.
        */
      }

      return [trimmed];
    }

    return [value];
  }

  function formatTypeLabel(typeValue) {
    const types =
      Array.isArray(typeValue)
        ? typeValue
        : getArrayValue(typeValue);

    if (types.length === 0) {
      return 'Story';
    }

    return types
      .map((type) => {
        return String(type).trim();
      })
      .filter(Boolean)
      .map((type) => {
        return (
          type.charAt(0).toUpperCase() +
          type.slice(1).toLowerCase()
        );
      })
      .join(' / ');
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
  // RUN
  // ---------------------------------------------------------

  if (
    document.readyState === 'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      startSection3LibraryFlow
    );
  } else {
    startSection3LibraryFlow();
  }
})();

// =========================================================
// SECTION 3 — GUIDED STORY MOTION
//
// Append this after the existing Section 3 JavaScript.
//
// This code only controls entrance animation.
// It does not change:
// - Supabase
// - search
// - suggestions
// - status selection
// - filters
// - adding library items
// - cover loading
// =========================================================

(() => {
  'use strict';

  const SECTION_SELECTOR =
    '#section-3-library-flow';

  const GROUP_SELECTOR =
    '[data-flow-motion]';

  const ITEM_SELECTOR =
    '[data-flow-motion-item]';

  /*
    The delays below control the elements inside each group.

    The main group delays are controlled in CSS:
    - copy:    0ms
    - search:  180ms
    - library: 430ms
  */
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
        SECTION_SELECTOR
      );

    if (!section) {
      return;
    }

    const groups = [
      ...section.querySelectorAll(
        GROUP_SELECTOR
      )
    ];

    if (groups.length === 0) {
      return;
    }

    prepareInternalDelays(groups);

    const prefersReducedMotion =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

    /*
      Make everything visible immediately for visitors
      who request reduced motion.
    */
    if (prefersReducedMotion) {
      showMotionGroups(groups);
      markMotionComplete(groups);

      return;
    }

    /*
      Initial hidden states activate only after this class
      is added. If JavaScript fails, the content stays visible.
    */
    section.classList.add(
      'flow-motion-ready'
    );

    let hasPlayed = false;


    function playMotionOnce() {
      if (hasPlayed) {
        return;
      }

      hasPlayed = true;

      showMotionGroups(groups);

      /*
        Remove will-change after the entire sequence ends.
        This keeps browser rendering resources from staying
        active after the animation is finished.
      */
      window.setTimeout(
        () => {
          markMotionComplete(groups);
        },
        1750
      );
    }


    /*
      IntersectionObserver is preferred because it does not
      require a continuous scroll listener.
    */
    if (
      'IntersectionObserver' in window
    ) {
      const observer =
        new IntersectionObserver(
          (entries) => {
            const sectionEntry =
              entries.find((entry) => {
                return (
                  entry.target === section &&
                  entry.isIntersecting
                );
              });

            if (!sectionEntry) {
              return;
            }

            playMotionOnce();

            observer.unobserve(section);
          },
          {
            /*
              Begin once a meaningful part of the section
              has entered the viewport.
            */
            threshold: 0.17,

            /*
              Trigger slightly before the section reaches
              the bottom edge of the viewport.
            */
            rootMargin:
              '0px 0px -9% 0px'
          }
        );

      /*
        Wait one frame so the browser applies the initial
        CSS state before checking intersection.
      */
      window.requestAnimationFrame(
        () => {
          observer.observe(section);
        }
      );

      return;
    }

    /*
      Safe fallback for older browsers.
    */
    playMotionOnce();
  }


  function prepareInternalDelays(groups) {
    groups.forEach((group) => {
      const groupName =
        group.dataset.flowMotion ||
        '';

      const timing =
        ITEM_TIMING[groupName] || {
          start: 80,
          step: 70
        };

      const items = [
        ...group.querySelectorAll(
          ITEM_SELECTOR
        )
      ];

      items.forEach(
        (item, index) => {
          const delay =
            timing.start +
            index * timing.step;

          item.style.setProperty(
            '--flow-item-delay',
            `${delay}ms`
          );
        }
      );
    });
  }


  function showMotionGroups(groups) {
    /*
      All groups receive the visible class together.

      CSS delays create the ordered story:
      copy → search → library.
    */
    window.requestAnimationFrame(
      () => {
        groups.forEach((group) => {
          group.classList.add(
            'is-motion-visible'
          );
        });
      }
    );
  }


  function markMotionComplete(groups) {
    groups.forEach((group) => {
      group.classList.add(
        'motion-complete'
      );
    });
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