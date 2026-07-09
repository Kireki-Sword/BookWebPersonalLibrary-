// =========================================================
// SECTION 3 — MINI SEARCH → LIBRARY DEMO
// Uses the same Supabase project/table/bucket pattern as Section 1.
// Load this file after the Supabase browser library.
// =========================================================

(() => {
  // ---------------------------------------------------------
  // DATABASE CONFIG
  // ---------------------------------------------------------

  const SUPABASE_URL = 'https://hsruxfpslxguhwnccwuj.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_Z2upBCdemNtdB4j5jry65A_XD_u8BsD';

  const TABLE_NAME = 'manga';
  const BUCKET_NAME = 'img';
  const COVER_FOLDER = 'covers';

  // Keep this small because Section 3 is a homepage preview, not the full search page.
  const SEARCH_RESULT_LIMIT = 3;

  // Small delay so the database is not searched on every single keystroke instantly.
  const SEARCH_DEBOUNCE_MS = 260;

  // Default library status values.
  const DEFAULT_STATUS = 'in-progress';

  const STATUS_LABELS = {
    'in-progress': 'Reading',
    completed: 'Completed',
    planned: 'Planned',
    paused: 'Paused',
    dropped: 'Dropped'
  };

  // Fallback keeps the homepage demo from breaking if Supabase is not loaded during development.
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
  // LOCAL STATE
  // ---------------------------------------------------------

  let supabaseClient = null;
  let searchTimer = null;
  let lastSearchRequestId = 0;

  let currentSuggestions = [];
  let selectedResult = null;
  let pendingAddItem = null;

  let libraryItems = [];
  let activeFormatFilter = 'all';
  let activeStatusFilter = 'all';

  // ---------------------------------------------------------
  // START
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

    injectSuggestionStyles();
    buildSuggestionList(elements);
    bindSearchEvents(elements);
    bindStatusPickerEvents(section, elements);
    bindLibraryFilterEvents(elements);

    setSearchEmpty(elements, 'Type a title to find it and add it to your library.');
    setStatusPickerEnabled(section, elements, false);
    renderLibrary(section, elements);
  }

  function getElements(section) {
    return {
      section,

      searchForm: section.querySelector('.flow-search-form'),
      searchInput: section.querySelector('#home-flow-search'),
      searchEmpty: section.querySelector('[data-flow-search-empty]'),

      resultArea: section.querySelector('[data-flow-result-area]'),
      resultTemplate: section.querySelector('#flow-result-template'),

      statusPicker: section.querySelector('[data-flow-status-picker]'),
      statusRadios: [...section.querySelectorAll('input[name="flow_status"]')],

      savedMessage: section.querySelector('[data-flow-saved-message]'),

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
      elements.searchEmpty &&
      elements.resultArea &&
      elements.resultTemplate &&
      elements.statusPicker &&
      elements.savedMessage &&
      elements.libraryList &&
      elements.libraryRowTemplate &&
      elements.libraryCount
    );
  }

  // ---------------------------------------------------------
  // SEARCH UI
  // ---------------------------------------------------------

  function bindSearchEvents(elements) {
    elements.searchInput.addEventListener('input', () => {
      const query = elements.searchInput.value.trim();

      selectedResult = null;
      pendingAddItem = null;
      clearSelectedResult(elements);
      clearSavedMessage(elements);
      setStatusPickerEnabled(elements.section, elements, false);

      window.clearTimeout(searchTimer);

      if (query.length < 2) {
        currentSuggestions = [];
        renderSuggestions(elements);
        setSearchEmpty(elements, 'Type at least 2 letters to search your library demo.');
        return;
      }

      setSearchEmpty(elements, 'Searching…');

      searchTimer = window.setTimeout(() => {
        searchStories(query, elements);
      }, SEARCH_DEBOUNCE_MS);
    });

    elements.searchForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const query = elements.searchInput.value.trim();

      if (query.length < 2) {
        setSearchEmpty(elements, 'Type at least 2 letters to search.');
        return;
      }

      window.clearTimeout(searchTimer);
      searchStories(query, elements, { autoSelectFirst: true });
    });
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
        setSearchEmpty(elements, 'No matching story found. Try another title.');
        return;
      }

      setSearchEmpty(elements, `Showing ${results.length} result${results.length === 1 ? '' : 's'}. Choose one to preview.`);

      if (options.autoSelectFirst) {
        selectSuggestion(results[0], elements);
      }
    } catch (error) {
      console.error('Section 3 search failed:', error);
      currentSuggestions = searchFallbackItems(query);
      renderSuggestions(elements);

      if (currentSuggestions.length > 0) {
        setSearchEmpty(elements, 'Showing demo fallback results.');
        return;
      }

      setSearchEmpty(elements, 'Search is unavailable right now. Please try again later.');
    }
  }

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
        const altTitles = getArrayValue(item.alternativeTitles).join(' ').toLowerCase();

        return (
          title.includes(normalizedQuery) ||
          creator.includes(normalizedQuery) ||
          types.includes(normalizedQuery) ||
          altTitles.includes(normalizedQuery)
        );
      })
    ).slice(0, SEARCH_RESULT_LIMIT);
  }

  function normalizeSearchResults(items) {
    return items
      .filter((item) => item && item.id && item.title)
      .map((item) => ({
        id: String(item.id),
        title: String(item.title || ''),
        creator: getCreatorValue(item),
        type: getTypeList(item),
        cover: getCoverUrl(item),
        score: getScoreValue(item),
        genres: getArrayValue(item.genres),
        raw: item
      }));
  }

  function buildSuggestionList(elements) {
    const existing = elements.section.querySelector('[data-flow-suggestions]');

    if (existing) {
      elements.suggestions = existing;
      return;
    }

    const suggestions = document.createElement('div');
    suggestions.className = 'flow-suggestions';
    suggestions.setAttribute('data-flow-suggestions', '');
    suggestions.setAttribute('aria-label', 'Search suggestions');

    elements.searchForm.insertAdjacentElement('afterend', suggestions);
    elements.suggestions = suggestions;
  }

  function renderSuggestions(elements) {
    if (!elements.suggestions) {
      return;
    }

    elements.suggestions.innerHTML = '';

    if (currentSuggestions.length === 0) {
      elements.suggestions.hidden = true;
      return;
    }

    elements.suggestions.hidden = false;

    currentSuggestions.forEach((item) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'flow-suggestion';
      button.setAttribute('data-story-id', item.id);
      button.setAttribute('aria-label', `Preview ${item.title}`);

      button.innerHTML = `
        <span class="flow-suggestion-cover">
          ${item.cover ? `<img src="${escapeAttribute(item.cover)}" alt="">` : ''}
        </span>

        <span class="flow-suggestion-info">
          <strong>${escapeHTML(item.title)}</strong>
          <small>${escapeHTML(getSuggestionMeta(item))}</small>
        </span>
      `;

      button.addEventListener('click', () => {
        selectSuggestion(item, elements);
      });

      elements.suggestions.appendChild(button);
    });
  }

  function selectSuggestion(item, elements) {
    selectedResult = item;
    pendingAddItem = null;

    elements.searchInput.value = item.title;

    currentSuggestions = [];
    renderSuggestions(elements);
    clearSavedMessage(elements);
    setStatusPickerEnabled(elements.section, elements, false);
    clearStatusSelection(elements);

    renderSelectedResult(item, elements);
    setSearchEmpty(elements, 'Result selected. Add it, then choose a status.');
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
      if (item.cover) {
        coverImg.src = item.cover;
        coverImg.alt = `${item.title} cover`;
      } else {
        coverImg.removeAttribute('src');
        coverImg.alt = '';
      }
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
      addButton.textContent = 'Add';
      addButton.classList.remove('is-added');
      addButton.disabled = false;

      addButton.addEventListener('click', () => {
        beginAddFlow(item, elements, addButton);
      });
    }

    elements.resultArea.appendChild(fragment);
  }

  function clearSelectedResult(elements) {
    elements.resultArea
      .querySelectorAll('[data-flow-result-card]')
      .forEach((card) => card.remove());
  }

  function beginAddFlow(item, elements, addButton) {
    pendingAddItem = item;

    setStatusPickerEnabled(elements.section, elements, true);
    clearStatusSelection(elements);
    clearSavedMessage(elements);

    addButton.textContent = 'Choose status';
    addButton.disabled = true;

    setSearchEmpty(elements, 'Choose where this story belongs.');
  }

  // ---------------------------------------------------------
  // STATUS PICKER
  // ---------------------------------------------------------

  function bindStatusPickerEvents(section, elements) {
    elements.statusRadios.forEach((radio) => {
      radio.addEventListener('change', () => {
        if (!radio.checked) {
          return;
        }

        if (!pendingAddItem && !selectedResult) {
          return;
        }

        const item = pendingAddItem || selectedResult;
        const status = radio.value || DEFAULT_STATUS;

        saveItemToLibrary(item, status, section, elements);
      });
    });
  }

  function setStatusPickerEnabled(section, elements, isEnabled) {
    elements.statusPicker.disabled = !isEnabled;
    elements.statusPicker.classList.toggle('is-active', isEnabled);
    section.classList.toggle('has-result', Boolean(selectedResult));
  }

  function clearStatusSelection(elements) {
    elements.statusRadios.forEach((radio) => {
      radio.checked = false;
    });
  }

  // ---------------------------------------------------------
  // LIBRARY STATE
  // ---------------------------------------------------------

  function saveItemToLibrary(item, status, section, elements) {
    const existingItem = findLibraryItem(item.id);

    if (existingItem) {
      existingItem.status = status;
      showSavedMessage(elements, `${item.title} moved to ${getStatusLabel(status)}.`);
    } else {
      libraryItems.push({
        id: item.id,
        title: item.title,
        creator: item.creator,
        type: item.type,
        cover: item.cover,
        score: item.score,
        genres: item.genres,
        status
      });

      showSavedMessage(elements, `${item.title} added to ${getStatusLabel(status)}.`);
    }

    pendingAddItem = null;

    renderSelectedResult(item, elements);
    renderLibrary(section, elements);
    setStatusPickerEnabled(section, elements, false);
  }

  function findLibraryItem(id) {
    return libraryItems.find((item) => item.id === id);
  }

  function updateLibraryItemStatus(id, status, section, elements) {
    const item = findLibraryItem(id);

    if (!item) {
      return;
    }

    item.status = status;

    showSavedMessage(elements, `${item.title} moved to ${getStatusLabel(status)}.`);
    renderLibrary(section, elements);
  }

  // ---------------------------------------------------------
  // LIBRARY FILTERS
  // ---------------------------------------------------------

  function bindLibraryFilterEvents(elements) {
    elements.formatFilterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        activeFormatFilter = button.dataset.formatFilter || 'all';
        updatePressedButtons(elements.formatFilterButtons, button);
        renderLibrary(elements.section, elements);
      });
    });

    elements.statusFilterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        activeStatusFilter = button.dataset.statusFilter || 'all';
        updatePressedButtons(elements.statusFilterButtons, button);
        renderLibrary(elements.section, elements);
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

  function renderLibrary(section, elements) {
    const filteredItems = getFilteredLibraryItems();

    elements.libraryCount.textContent = String(libraryItems.length);
    elements.libraryList.innerHTML = '';

    section.classList.toggle('has-library-item', libraryItems.length > 0);
    elements.libraryCard?.classList.toggle('has-library-item', libraryItems.length > 0);

    if (filteredItems.length === 0) {
      elements.libraryEmpty.hidden = false;
      setLibraryEmptyText(elements, getLibraryEmptyText());
      return;
    }

    elements.libraryEmpty.hidden = true;

    filteredItems.forEach((item) => {
      const row = createLibraryRow(item, section, elements);
      elements.libraryList.appendChild(row);
    });
  }

  function createLibraryRow(item, section, elements) {
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
      if (item.cover) {
        coverImg.src = item.cover;
        coverImg.alt = `${item.title} cover`;
      } else {
        coverImg.removeAttribute('src');
        coverImg.alt = '';
      }
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
        updateLibraryItemStatus(item.id, statusSelect.value, section, elements);
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
  // DISPLAY HELPERS
  // ---------------------------------------------------------

  function setSearchEmpty(elements, text) {
    const paragraph = elements.searchEmpty.querySelector('p');

    if (paragraph) {
      paragraph.textContent = text;
    }

    elements.searchEmpty.hidden = false;
  }

  function showSavedMessage(elements, text) {
    const textElement = elements.savedMessage.querySelector('span');

    if (textElement) {
      textElement.textContent = text;
    }

    elements.savedMessage.hidden = false;
  }

  function clearSavedMessage(elements) {
    elements.savedMessage.hidden = true;
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
        // It was not JSON; use it as a single value.
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

  function getCoverUrl(item) {
    const cover = String(item.cover || '').trim();

    if (cover.startsWith('http://') || cover.startsWith('https://')) {
      return cover;
    }

    if (!supabaseClient) {
      return cover || '';
    }

    let coverPath = cover;

    if (coverPath.startsWith(`${BUCKET_NAME}/`)) {
      coverPath = coverPath.slice(BUCKET_NAME.length + 1);
    }

    if (coverPath.startsWith('/')) {
      coverPath = coverPath.slice(1);
    }

    if (!coverPath && item.id) {
      coverPath = `${COVER_FOLDER}/${item.id}.jpg`;
    }

    if (!coverPath) {
      return '';
    }

    const { data } = supabaseClient
      .storage
      .from(BUCKET_NAME)
      .getPublicUrl(coverPath);

    return data?.publicUrl || '';
  }

  function escapeHTML(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function escapeAttribute(value) {
    return escapeHTML(value);
  }

  // ---------------------------------------------------------
  // SMALL DYNAMIC CSS FOR SUGGESTIONS
  // Keeps you from needing extra HTML/CSS just to test the JS.
  // You can move this into section-3.css later.
  // ---------------------------------------------------------

  function injectSuggestionStyles() {
    if (document.getElementById('section-3-flow-suggestion-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'section-3-flow-suggestion-styles';
    style.textContent = `
      .flow-suggestions {
        margin-top: 0.7rem;
        display: grid;
        gap: 0.45rem;
      }

      .flow-suggestions[hidden] {
        display: none;
      }

      .flow-suggestion {
        width: 100%;
        min-height: 52px;
        padding: 0.48rem;
        display: grid;
        grid-template-columns: 34px minmax(0, 1fr);
        align-items: center;
        gap: 0.62rem;
        border: 1px solid rgba(184, 192, 255, 0.16);
        border-radius: 12px;
        background:
          linear-gradient(135deg, rgba(255,255,255,0.052), rgba(255,255,255,0.025)),
          rgba(255,255,255,0.02);
        color: var(--flow-ink, #f5f7ff);
        font: inherit;
        text-align: left;
        cursor: pointer;
        transition:
          transform var(--flow-transition, 0.25s ease),
          border-color var(--flow-transition, 0.25s ease),
          background var(--flow-transition, 0.25s ease);
      }

      .flow-suggestion:hover,
      .flow-suggestion:focus-visible {
        transform: translateY(-1px);
        border-color: rgba(116, 215, 255, 0.32);
        background:
          linear-gradient(135deg, rgba(116,215,255,0.10), rgba(124,140,255,0.08)),
          rgba(255,255,255,0.03);
        outline: none;
      }

      .flow-suggestion:focus-visible {
        box-shadow: 0 0 0 3px rgba(116, 215, 255, 0.16);
      }

      .flow-suggestion-cover {
        width: 34px;
        aspect-ratio: 2 / 3;
        overflow: hidden;
        border-radius: 7px;
        background: linear-gradient(145deg, rgba(124,140,255,0.35), rgba(210,140,255,0.22));
        box-shadow:
          0 7px 14px rgba(0,0,0,0.24),
          inset 0 0 0 1px rgba(255,255,255,0.08);
      }

      .flow-suggestion-cover img {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: cover;
      }

      .flow-suggestion-info {
        min-width: 0;
        display: grid;
        gap: 0.12rem;
      }

      .flow-suggestion-info strong {
        color: var(--flow-ink, #f5f7ff);
        font-family: var(--flow-font-display, Georgia, serif);
        font-size: 0.92rem;
        line-height: 1;
        letter-spacing: -0.025em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .flow-suggestion-info small {
        color: var(--flow-ink-light, #9ca8c4);
        font-size: 0.62rem;
        line-height: 1.25;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `;

    document.head.appendChild(style);
  }

  // ---------------------------------------------------------
  // INIT
  // ---------------------------------------------------------

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startSection3LibraryFlow);
  } else {
    startSection3LibraryFlow();
  }
})();