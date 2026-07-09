// =========================================================
// SECTION 3 — MINI SEARCH → LIBRARY DEMO
// Search suggestions → selected result → choose status → add → mini library.
// Load after Supabase and after the Section 3 HTML.
// =========================================================

(() => {
  // ---------------------------------------------------------
  // DATABASE CONFIG
  // Same Supabase setup as your Section 1 script.
  // ---------------------------------------------------------

  const SUPABASE_URL = 'https://hsruxfpslxguhwnccwuj.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_Z2upBCdemNtdB4j5jry65A_XD_u8BsD';

  const TABLE_NAME = 'manga';
  const BUCKET_NAME = 'img';
  const COVER_FOLDER = 'covers';

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

  const FALLBACK_ITEMS = [
    {
      id: 'berserk-1989',
      title: 'Berserk',
      alternativeTitles: ['Beruseruku', 'ベルセルク'],
      type: ['manga', 'anime'],
      creator: 'Kentaro Miura',
      cover: 'img/covers/manga-berserk-1989.jpg',
      heroScore: 9.5,
      genres: ['Action', 'Drama', 'Fantasy', 'Seinen']
    }
  ];

  // ---------------------------------------------------------
  // STATE
  // ---------------------------------------------------------

  let supabaseClient = null;
  let searchTimer = null;
  let lastSearchRequestId = 0;

  let currentSuggestions = [];
  let selectedResult = null;
  let selectedStatus = DEFAULT_STATUS;

  let libraryItems = [];
  let activeFormatFilter = 'all';
  let activeStatusFilter = 'all';

  // ---------------------------------------------------------
  // INIT
  // ---------------------------------------------------------

  function startSection3LibraryFlow() {
    const section = document.querySelector('#section-3-library-flow');

    if (!section) {
      return;
    }

    const elements = getElements(section);

    if (!hasRequiredElements(elements)) {
      console.error('Missing one or more Section 3 elements.', elements);
      return;
    }

    if (window.supabase) {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } else {
      console.warn('Supabase library is not loaded. Section 3 will use fallback demo data.');
    }

    bindSearchEvents(elements);
    bindStatusPickerEvents(elements);
    bindLibraryFilterEvents(elements);

    hideStatusPicker(elements);
    setSearchMessage(elements, 'Type a title to find it and add it to your library.');
    renderSuggestions(elements);
    renderLibrary(elements);
  }

  function getElements(section) {
    return {
      section,

      searchForm: section.querySelector('[data-flow-search-form]'),
      searchInput: section.querySelector('[data-flow-search-input]'),
      searchButton: section.querySelector('[data-flow-search-button]'),
      suggestions: section.querySelector('[data-flow-suggestions]'),
      searchMessage: section.querySelector('[data-flow-search-empty]'),

      resultArea: section.querySelector('[data-flow-result-area]'),
      resultTemplate: section.querySelector('#flow-result-template'),

      statusPicker: section.querySelector('[data-flow-status-picker]'),
      statusRadios: [...section.querySelectorAll('input[name="flow_status"]')],

      libraryCard: section.querySelector('.flow-library-card'),
      libraryEmpty: section.querySelector('[data-library-empty]'),
      libraryList: section.querySelector('[data-library-list]'),
      libraryRowTemplate: section.querySelector('#flow-library-row-template'),
      libraryCount: section.querySelector('[data-library-count]'),

      formatFilterButtons: [...section.querySelectorAll('[data-format-filter]')],
      statusFilterButtons: [...section.querySelectorAll('[data-status-filter]')]
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
      elements.libraryList &&
      elements.libraryRowTemplate &&
      elements.libraryCount
    );
  }

  // ---------------------------------------------------------
  // SEARCH EVENTS
  // ---------------------------------------------------------

  function bindSearchEvents(elements) {
    elements.searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      runSearchFromInput(elements, { autoSelectFirst: true });
    });

    elements.searchButton.addEventListener('click', () => {
      runSearchFromInput(elements, { autoSelectFirst: true });
    });

    elements.searchInput.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') {
        return;
      }

      event.preventDefault();
      runSearchFromInput(elements, { autoSelectFirst: true });
    });

    elements.searchInput.addEventListener('input', () => {
      const query = elements.searchInput.value.trim();

      clearSelectedResult(elements);
      hideStatusPicker(elements);
      selectedResult = null;

      window.clearTimeout(searchTimer);

      if (query.length < 2) {
        currentSuggestions = [];
        renderSuggestions(elements);
        setSearchMessage(elements, 'Type at least 2 letters to search.');
        return;
      }

      setSearchMessage(elements, 'Searching…');

      searchTimer = window.setTimeout(() => {
        searchStories(query, elements);
      }, SEARCH_DEBOUNCE_MS);
    });
  }

  function runSearchFromInput(elements, options = {}) {
    const query = elements.searchInput.value.trim();

    if (query.length < 2) {
      setSearchMessage(elements, 'Type at least 2 letters to search.');
      return;
    }

    window.clearTimeout(searchTimer);
    searchStories(query, elements, options);
  }

  async function searchStories(query, elements, options = {}) {
    const requestId = ++lastSearchRequestId;

    try {
      const results = await fetchSearchResults(query);

      if (requestId !== lastSearchRequestId) {
        return;
      }

      currentSuggestions = results;
      renderSuggestions(elements);

      if (results.length === 0) {
        setSearchMessage(elements, 'No matching story found. Try another title.');
        return;
      }

      setSearchMessage(
        elements,
        `Showing ${results.length} result${results.length === 1 ? '' : 's'}. Choose one to preview.`
      );

      if (options.autoSelectFirst) {
        selectSuggestion(results[0], elements);
      }
    } catch (error) {
      console.error('Section 3 search failed:', error);

      currentSuggestions = searchFallbackItems(query);
      renderSuggestions(elements);

      if (currentSuggestions.length > 0) {
        setSearchMessage(elements, 'Showing demo fallback results.');
        return;
      }

      setSearchMessage(elements, 'Search is unavailable right now.');
    }
  }

  // ---------------------------------------------------------
  // SUPABASE SEARCH
  // ---------------------------------------------------------

  async function fetchSearchResults(query) {
    if (!supabaseClient) {
      return searchFallbackItems(query);
    }

    const safeQuery = cleanSupabaseSearchText(query);

    if (!safeQuery) {
      return [];
    }

    const searchPattern = `%${safeQuery}%`;

    const { data, error } = await supabaseClient
      .from(TABLE_NAME)
      .select('id, title, alternativeTitles, type, creator, cover, heroScore, genres')
      .or(`title.ilike.${searchPattern},creator.ilike.${searchPattern}`)
      .order('heroScore', { ascending: false, nullsFirst: false })
      .limit(SEARCH_RESULT_LIMIT);

    if (error) {
      throw error;
    }

    return normalizeSearchResults(data || []).slice(0, SEARCH_RESULT_LIMIT);
  }

  function cleanSupabaseSearchText(value) {
    return String(value || '')
      .replace(/[%,()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function searchFallbackItems(query) {
    const normalizedQuery = query.toLowerCase().trim();

    return normalizeSearchResults(
      FALLBACK_ITEMS.filter((item) => {
        const title = String(item.title || '').toLowerCase();
        const creator = String(item.creator || '').toLowerCase();
        const types = getTypeList(item).join(' ').toLowerCase();
        const alternativeTitles = getArrayValue(item.alternativeTitles).join(' ').toLowerCase();

        return (
          title.includes(normalizedQuery) ||
          creator.includes(normalizedQuery) ||
          types.includes(normalizedQuery) ||
          alternativeTitles.includes(normalizedQuery)
        );
      })
    ).slice(0, SEARCH_RESULT_LIMIT);
  }

  function normalizeSearchResults(items) {
    return items
      .filter((item) => item && item.id && item.title)
      .map((item) => {
        const coverCandidates = getCoverCandidates(item);

        return {
          id: String(item.id),
          title: String(item.title || ''),
          creator: getCreatorValue(item),
          type: getTypeList(item),
          coverCandidates,
          score: getScoreValue(item),
          genres: getArrayValue(item.genres),
          raw: item
        };
      });
  }

  // ---------------------------------------------------------
  // SUGGESTIONS
  // ---------------------------------------------------------

  function renderSuggestions(elements) {
    elements.suggestions.innerHTML = '';

    if (currentSuggestions.length === 0) {
      elements.suggestions.hidden = true;
      return;
    }

    elements.suggestions.hidden = false;

    currentSuggestions.forEach((item) => {
      const button = document.createElement('button');
      const cover = document.createElement('span');
      const img = document.createElement('img');
      const info = document.createElement('span');
      const title = document.createElement('strong');
      const meta = document.createElement('small');

      button.type = 'button';
      button.className = 'flow-suggestion';
      button.setAttribute('data-story-id', item.id);
      button.setAttribute('aria-label', `Preview ${item.title}`);

      cover.className = 'flow-suggestion-cover';
      info.className = 'flow-suggestion-info';

      title.textContent = item.title;
      meta.textContent = getSuggestionMeta(item);

      setImageWithFallback(img, item, '');

      cover.appendChild(img);
      info.appendChild(title);
      info.appendChild(meta);

      button.appendChild(cover);
      button.appendChild(info);

      button.addEventListener('click', () => {
        selectSuggestion(item, elements);
      });

      elements.suggestions.appendChild(button);
    });
  }

  function selectSuggestion(item, elements) {
    selectedResult = item;
    selectedStatus = DEFAULT_STATUS;

    elements.searchInput.value = item.title;

    currentSuggestions = [];
    renderSuggestions(elements);

    renderSelectedResult(item, elements);

    const existingItem = findLibraryItem(item.id);

    if (existingItem) {
      hideStatusPicker(elements);
      setSearchMessage(elements, 'This story is already in your library.');
      return;
    }

    showStatusPicker(elements);
    setSearchMessage(elements, 'Choose a status, then add it to your library.');
  }

  // ---------------------------------------------------------
  // SELECTED RESULT CARD
  // ---------------------------------------------------------

  function renderSelectedResult(item, elements) {
    clearSelectedResult(elements);

    const fragment = elements.resultTemplate.content.cloneNode(true);

    const card = fragment.querySelector('[data-flow-result-card]');
    const coverImg = fragment.querySelector('.flow-result-cover img');
    const title = fragment.querySelector('.flow-result-info h4');
    const creator = fragment.querySelector('.flow-result-creator');
    const type = fragment.querySelector('.flow-result-type');
    const addButton = fragment.querySelector('[data-flow-add-button]');

    if (!card || !addButton) {
      console.error('Section 3 result template is missing required elements.');
      return;
    }

    card.setAttribute('data-story-id', item.id);

    if (coverImg) {
      setImageWithFallback(coverImg, item, `${item.title} cover`);
    }

    if (title) {
      title.textContent = item.title;
    }

    if (creator) {
      creator.textContent = item.creator ? `by ${item.creator}` : 'Unknown creator';
    }

    if (type) {
      type.textContent = getResultTypeLabel(item);
    }

    const existingItem = findLibraryItem(item.id);

    if (existingItem) {
      addButton.textContent = 'Added';
      addButton.classList.add('is-added');
      addButton.disabled = true;
    } else {
      addButton.classList.remove('is-added');
      addButton.disabled = false;
      addButton.textContent = `Add to ${getStatusLabel(selectedStatus)}`;

      addButton.addEventListener('click', () => {
        addSelectedResultToLibrary(elements);
      });
    }

    elements.resultArea.appendChild(fragment);
  }

  function clearSelectedResult(elements) {
    elements.resultArea
      .querySelectorAll('[data-flow-result-card]')
      .forEach((card) => card.remove());
  }

  function getCurrentAddButton(elements) {
    return elements.resultArea.querySelector('[data-flow-add-button]');
  }

  function updateAddButtonText(elements) {
    const addButton = getCurrentAddButton(elements);

    if (!addButton || addButton.disabled) {
      return;
    }

    addButton.textContent = `Add to ${getStatusLabel(selectedStatus)}`;
  }

  // ---------------------------------------------------------
  // STATUS PICKER
  // ---------------------------------------------------------

  function bindStatusPickerEvents(elements) {
    elements.statusRadios.forEach((radio) => {
      radio.addEventListener('change', () => {
        if (!radio.checked) {
          return;
        }

        selectedStatus = radio.value || DEFAULT_STATUS;
        updateAddButtonText(elements);
      });
    });
  }

  function showStatusPicker(elements) {
    elements.statusPicker.hidden = false;
    elements.statusPicker.disabled = false;
    elements.statusPicker.classList.add('is-active');

    selectedStatus = DEFAULT_STATUS;

    elements.statusRadios.forEach((radio) => {
      radio.checked = radio.value === selectedStatus;
    });

    elements.section.classList.add('has-result');
    updateAddButtonText(elements);
  }

  function hideStatusPicker(elements) {
    elements.statusPicker.hidden = true;
    elements.statusPicker.disabled = true;
    elements.statusPicker.classList.remove('is-active');

    elements.statusRadios.forEach((radio) => {
      radio.checked = radio.value === DEFAULT_STATUS;
    });

    elements.section.classList.remove('has-result');
  }

  // ---------------------------------------------------------
  // LIBRARY SAVE / UPDATE
  // ---------------------------------------------------------

  function addSelectedResultToLibrary(elements) {
    if (!selectedResult) {
      return;
    }

    const existingItem = findLibraryItem(selectedResult.id);

    if (existingItem) {
      renderSelectedResult(selectedResult, elements);
      hideStatusPicker(elements);
      setSearchMessage(elements, 'This story is already in your library.');
      return;
    }

    libraryItems.push({
      id: selectedResult.id,
      title: selectedResult.title,
      creator: selectedResult.creator,
      type: selectedResult.type,
      coverCandidates: selectedResult.coverCandidates,
      score: selectedResult.score,
      genres: selectedResult.genres,
      status: selectedStatus
    });

    renderSelectedResult(selectedResult, elements);
    hideStatusPicker(elements);
    renderLibrary(elements);

    setSearchMessage(elements, `${selectedResult.title} was added to your library.`);
  }

  function findLibraryItem(id) {
    return libraryItems.find((item) => item.id === id);
  }

  function updateLibraryItemStatus(id, status, elements) {
    const item = findLibraryItem(id);

    if (!item) {
      return;
    }

    item.status = status;

    // Silent update. No extra "moved to completed" label.
    renderLibrary(elements);
  }

  // ---------------------------------------------------------
  // LIBRARY FILTERS
  // ---------------------------------------------------------

  function bindLibraryFilterEvents(elements) {
    elements.formatFilterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        activeFormatFilter = button.dataset.formatFilter || 'all';
        updatePressedButtons(elements.formatFilterButtons, button);
        renderLibrary(elements);
      });
    });

    elements.statusFilterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        activeStatusFilter = button.dataset.statusFilter || 'all';
        updatePressedButtons(elements.statusFilterButtons, button);
        renderLibrary(elements);
      });
    });
  }

  function updatePressedButtons(buttons, activeButton) {
    buttons.forEach((button) => {
      const isActive = button === activeButton;

      button.classList.toggle('active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  }

  function getFilteredLibraryItems() {
    return libraryItems.filter((item) => {
      const matchesFormat =
        activeFormatFilter === 'all' ||
        getTypeList(item).includes(activeFormatFilter);

      const matchesStatus =
        activeStatusFilter === 'all' ||
        item.status === activeStatusFilter;

      return matchesFormat && matchesStatus;
    });
  }

  // ---------------------------------------------------------
  // LIBRARY RENDERING
  // ---------------------------------------------------------

  function renderLibrary(elements) {
    const filteredItems = getFilteredLibraryItems();

    elements.libraryCount.textContent = String(libraryItems.length);
    elements.libraryList.innerHTML = '';

    elements.section.classList.toggle('has-library-item', libraryItems.length > 0);

    if (elements.libraryCard) {
      elements.libraryCard.classList.toggle('has-library-item', libraryItems.length > 0);
    }

    if (filteredItems.length === 0) {
      elements.libraryEmpty.hidden = false;
      setLibraryEmptyText(elements, getLibraryEmptyText());
      return;
    }

    elements.libraryEmpty.hidden = true;

    filteredItems.forEach((item) => {
      const row = createLibraryRow(item, elements);
      elements.libraryList.appendChild(row);
    });
  }

  function createLibraryRow(item, elements) {
    const fragment = elements.libraryRowTemplate.content.cloneNode(true);
    const row = fragment.querySelector('[data-library-row]');

    const coverImg = fragment.querySelector('[data-library-cover]');
    const title = fragment.querySelector('[data-library-title]');
    const creator = fragment.querySelector('[data-library-creator]');
    const format = fragment.querySelector('[data-library-format]');
    const statusSelect = fragment.querySelector('[data-library-status]');
    const rating = fragment.querySelector('[data-library-rating]');

    row.dataset.storyId = item.id;
    row.dataset.format = getTypeList(item).join(' ');
    row.dataset.status = item.status;

    if (coverImg) {
      setImageWithFallback(coverImg, item, `${item.title} cover`);
    }

    if (title) {
      title.textContent = item.title;
    }

    if (creator) {
      creator.textContent = item.creator ? `by ${item.creator}` : 'Unknown creator';
    }

    if (format) {
      format.textContent = formatTypeLabel(item.type);
    }

    if (rating) {
      rating.textContent = item.score ? String(item.score) : '—';
    }

    if (statusSelect) {
      statusSelect.value = item.status;

      statusSelect.addEventListener('change', () => {
        updateLibraryItemStatus(item.id, statusSelect.value, elements);
      });
    }

    return row;
  }

  function setLibraryEmptyText(elements, text) {
    const paragraph = elements.libraryEmpty.querySelector('p');

    if (paragraph) {
      paragraph.textContent = text;
    }
  }

  function getLibraryEmptyText() {
    if (libraryItems.length === 0) {
      return 'Search and add something above. Your saved stories will appear here.';
    }

    return 'No saved stories match these filters yet.';
  }

  // ---------------------------------------------------------
  // IMAGE LOADING
  // ---------------------------------------------------------

  function setImageWithFallback(img, item, altText) {
    const candidates = item.coverCandidates || getCoverCandidates(item);
    let index = 0;

    img.hidden = false;
    img.alt = altText || '';

    if (candidates.length === 0) {
      img.hidden = true;
      img.removeAttribute('src');
      return;
    }

    img.onerror = () => {
      index += 1;

      if (index >= candidates.length) {
        img.hidden = true;
        img.removeAttribute('src');
        return;
      }

      img.src = candidates[index];
    };

    img.src = candidates[index];
  }

  function getCoverCandidates(item) {
    const candidates = [];
    const rawCover = String(item.cover || '').trim();

    addCoverCandidate(candidates, rawCover);

    if (item.id) {
      addCoverCandidate(candidates, `${COVER_FOLDER}/${item.id}.jpg`);
      addCoverCandidate(candidates, `${COVER_FOLDER}/manga-${item.id}.jpg`);
    }

    return [...new Set(candidates.filter(Boolean))];
  }

  function addCoverCandidate(candidates, coverPath) {
    if (!coverPath) {
      return;
    }

    if (coverPath.startsWith('http://') || coverPath.startsWith('https://')) {
      candidates.push(coverPath);
      return;
    }

    if (!supabaseClient) {
      candidates.push(coverPath);
      return;
    }

    let storagePath = coverPath;

    if (storagePath.startsWith(`${BUCKET_NAME}/`)) {
      storagePath = storagePath.slice(BUCKET_NAME.length + 1);
    }

    if (storagePath.startsWith('/')) {
      storagePath = storagePath.slice(1);
    }

    const { data } = supabaseClient
      .storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);

    if (data?.publicUrl) {
      candidates.push(data.publicUrl);
    }
  }

  // ---------------------------------------------------------
  // TEXT HELPERS
  // ---------------------------------------------------------

  function setSearchMessage(elements, text) {
    const paragraph = elements.searchMessage.querySelector('p');

    if (paragraph) {
      paragraph.textContent = text;
    }

    elements.searchMessage.hidden = false;
  }

  function getSuggestionMeta(item) {
    const type = formatTypeLabel(item.type);
    const score = item.score ? ` · ${item.score}` : '';

    return `${type}${score}`;
  }

  function getResultTypeLabel(item) {
    const type = formatTypeLabel(item.type);
    const score = item.score ? ` · ${item.score}` : '';

    return `${type}${score}`;
  }

  function getStatusLabel(status) {
    return STATUS_LABELS[status] || status;
  }

  function getCreatorValue(item) {
    return String(item.creator ?? item.author ?? item.writer ?? '').trim();
  }

  function getScoreValue(item) {
    const value = item.heroScore ?? item.hero_score ?? item.score ?? item.rating ?? '';

    if (value === null || value === undefined || value === '') {
      return '';
    }

    return Number.isFinite(Number(value)) ? Number(value) : String(value);
  }

  function getTypeList(item) {
    const rawType = item.type ?? item.format ?? [];

    return getArrayValue(rawType)
      .map((type) => String(type).toLowerCase().trim())
      .filter(Boolean);
  }

  function getArrayValue(value) {
    if (!value) {
      return [];
    }

    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();

      if (!trimmed) {
        return [];
      }

      try {
        const parsed = JSON.parse(trimmed);

        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        // Not JSON. Use the string as one value.
      }

      return [trimmed];
    }

    return [value];
  }

  function formatTypeLabel(typeValue) {
    const types = Array.isArray(typeValue)
      ? typeValue
      : getArrayValue(typeValue);

    if (types.length === 0) {
      return 'Story';
    }

    return types
      .map((type) => String(type).trim())
      .filter(Boolean)
      .map((type) => type.charAt(0).toUpperCase() + type.slice(1).toLowerCase())
      .join(' / ');
  }

  // ---------------------------------------------------------
  // RUN
  // ---------------------------------------------------------

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startSection3LibraryFlow);
  } else {
    startSection3LibraryFlow();
  }
})();