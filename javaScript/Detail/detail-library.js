// detail-library.js
// Tracks Manga and Anime independently inside a stable,
// contained library card.

const STORAGE_KEY = "inkwell-library";

const SUPPORTED_FORMATS = [
  "manga",
  "anime"
];

const FORMAT_CONFIG = Object.freeze({
  manga: {
    label: "Manga",
    icon: "ti ti-book-2",

    statuses: [
      {
        id: "reading",
        label: "Reading",
        icon: "ti ti-book"
      },

      {
        id: "completed",
        label: "Completed",
        icon: "ti ti-circle-check"
      },

      {
        id: "plan-to-read",
        label: "Plan to read",
        icon: "ti ti-clock-plus"
      },

      {
        id: "paused",
        label: "Paused",
        icon: "ti ti-player-pause"
      },

      {
        id: "dropped",
        label: "Dropped",
        icon: "ti ti-circle-minus"
      }
    ]
  },

  anime: {
    label: "Anime",
    icon: "ti ti-device-tv",

    statuses: [
      {
        id: "watching",
        label: "Watching",
        icon: "ti ti-player-play"
      },

      {
        id: "completed",
        label: "Completed",
        icon: "ti ti-circle-check"
      },

      {
        id: "plan-to-watch",
        label: "Plan to watch",
        icon: "ti ti-clock-plus"
      },

      {
        id: "paused",
        label: "Paused",
        icon: "ti ti-player-pause"
      },

      {
        id: "dropped",
        label: "Dropped",
        icon: "ti ti-circle-minus"
      }
    ]
  }
});


export function createDetailLibraryController(elements) {
  const libraryBlock =
    elements.libraryPicker.closest(
      ".detail-library-block"
    );

  const menuBackIcon =
    elements.libraryMenuBack.querySelector(
      "i"
    );

  let currentTitle = null;
  let currentEntry = null;

  let availableFormats = [];

  let activeFormat = "";
  let currentScreen = "formats";

  let hasBoundEvents = false;


  /* =======================================================
     EVENT SETUP
     ======================================================= */

  function bindEvents() {
    if (hasBoundEvents) {
      return;
    }

    hasBoundEvents = true;

    elements.libraryMenu.hidden = true;

    elements.libraryTrigger.setAttribute(
      "aria-expanded",
      "false"
    );

    elements.libraryTrigger.addEventListener(
      "click",
      handleTriggerClick
    );

    elements.libraryMenuBack.addEventListener(
      "click",
      handleMenuBackClick
    );

    elements.librarySummary.addEventListener(
      "click",
      handleSummaryClick
    );

    elements.libraryMenu.addEventListener(
      "click",
      (event) => {
        event.stopPropagation();
      }
    );

    elements.libraryMenu.addEventListener(
      "keydown",
      handleMenuKeydown
    );

    document.addEventListener(
      "click",
      handleDocumentClick
    );

    document.addEventListener(
      "keydown",
      handleDocumentKeydown
    );
  }


  function handleTriggerClick(event) {
    event.preventDefault();
    event.stopPropagation();

    toggleMenu();
  }


  function handleMenuBackClick(event) {
    event.preventDefault();
    event.stopPropagation();

    if (currentScreen === "formats") {
      closeMenu(true);
      return;
    }

    showFormatScreen(true);
  }


  function handleDocumentClick(event) {
    if (!isMenuOpen()) {
      return;
    }

    if (
      libraryBlock &&
      !libraryBlock.contains(event.target)
    ) {
      closeMenu();
    }
  }


  function handleDocumentKeydown(event) {
    if (
      event.key === "Escape" &&
      isMenuOpen()
    ) {
      event.preventDefault();

      closeMenu(true);
    }
  }


  /* =======================================================
     TITLE SETUP
     ======================================================= */

  function setTitle(title) {
    currentTitle = title;

    availableFormats =
      SUPPORTED_FORMATS.filter(
        (format) => {
          return (
            title.media?.[format]?.length > 0
          );
        }
      );

    currentEntry =
      normalizeStoredEntry(
        readLibrary()[title.id],
        title
      );

    activeFormat = "";
    currentScreen = "formats";

    closeMenu();

    updateInterface();
    showFormatScreen(false);
  }


  /* =======================================================
     OPEN AND CLOSE
     ======================================================= */

  function isMenuOpen() {
    return !elements.libraryMenu.hidden;
  }


  function toggleMenu() {
    if (isMenuOpen()) {
      closeMenu();
    } else {
      openMenu();
    }
  }


  function openMenu() {
    if (
      !currentTitle ||
      !availableFormats.length ||
      isMenuOpen()
    ) {
      return;
    }

    showFormatScreen(false);

    elements.libraryMenu.hidden = false;

    elements.libraryPicker.classList.add(
      "is-open"
    );

    libraryBlock?.classList.add(
      "is-library-menu-open"
    );

    elements.libraryTrigger.setAttribute(
      "aria-expanded",
      "true"
    );

    window.requestAnimationFrame(
      () => {
        elements.libraryMenu.classList.add(
          "is-positioned"
        );

        focusFirstOption();
      }
    );
  }


  function closeMenu(returnFocus = false) {
    elements.libraryMenu.hidden = true;

    elements.libraryMenu.classList.remove(
      "is-positioned"
    );

    elements.libraryPicker.classList.remove(
      "is-open"
    );

    libraryBlock?.classList.remove(
      "is-library-menu-open"
    );

    elements.libraryTrigger.setAttribute(
      "aria-expanded",
      "false"
    );

    if (returnFocus) {
      elements.libraryTrigger.focus();
    }
  }


  /* =======================================================
     FORMAT SCREEN
     ======================================================= */

  function showFormatScreen(moveFocus) {
    activeFormat = "";
    currentScreen = "formats";

    elements.libraryMenu.dataset.screen =
      "formats";

    elements.libraryMenuBack.hidden = false;

    elements.libraryMenuBack.setAttribute(
      "aria-label",
      "Close library menu"
    );

    if (menuBackIcon) {
      menuBackIcon.className =
        "ti ti-x";
    }

    elements.libraryMenuEyebrow.textContent =
      "Choose a format";

    elements.libraryMenuTitle.textContent =
      "What are you tracking?";

    elements.libraryOptions.replaceChildren();

    availableFormats.forEach(
      (format) => {
        const formatConfig =
          FORMAT_CONFIG[format];

        const savedStatus =
          currentEntry.formats[format]
            ?.status || "";

        const savedStatusConfig =
          getStatusConfig(
            format,
            savedStatus
          );

        const button =
          createMenuButton({
            icon: formatConfig.icon,
            label: formatConfig.label,

            meta:
              savedStatusConfig?.label ||
              "Not tracked",

            selected:
              Boolean(savedStatus),

            trailing:
              "→"
          });

        button.dataset.libraryFormat =
          format;

        button.addEventListener(
          "click",
          (event) => {
            event.preventDefault();
            event.stopPropagation();

            showStatusScreen(
              format,
              true
            );
          }
        );

        elements.libraryOptions.append(
          button
        );
      }
    );

    if (moveFocus) {
      window.requestAnimationFrame(
        focusFirstOption
      );
    }
  }


  /* =======================================================
     STATUS SCREEN
     ======================================================= */

  function showStatusScreen(
    format,
    moveFocus = true
  ) {
    if (
      !availableFormats.includes(format)
    ) {
      return;
    }

    const formatConfig =
      FORMAT_CONFIG[format];

    if (!formatConfig) {
      return;
    }

    activeFormat = format;
    currentScreen = "statuses";

    elements.libraryMenu.dataset.screen =
      "statuses";

    const savedStatus =
      currentEntry.formats[format]
        ?.status || "";

    elements.libraryMenuBack.hidden = false;

    elements.libraryMenuBack.setAttribute(
      "aria-label",
      "Back to formats"
    );

    if (menuBackIcon) {
      menuBackIcon.className =
        "ti ti-arrow-left";
    }

    elements.libraryMenuEyebrow.textContent =
      formatConfig.label;

    elements.libraryMenuTitle.textContent =
      format === "anime"
        ? "Choose your anime status"
        : "Choose your manga status";

    elements.libraryOptions.replaceChildren();

    formatConfig.statuses.forEach(
      (status) => {
        const selected =
          savedStatus === status.id;

        const button =
          createMenuButton({
            icon: status.icon,
            label: status.label,
            selected,

            trailing:
              selected
                ? "✓"
                : ""
          });

        button.setAttribute(
          "role",
          "menuitemradio"
        );

        button.setAttribute(
          "aria-checked",
          String(selected)
        );

        button.addEventListener(
          "click",
          (event) => {
            event.preventDefault();
            event.stopPropagation();

            saveFormatStatus(
              format,
              status.id
            );
          }
        );

        elements.libraryOptions.append(
          button
        );
      }
    );

    if (savedStatus) {
      elements.libraryOptions.append(
        createMenuDivider()
      );

      const removeButton =
        createMenuButton({
          icon: "ti ti-trash",

          label:
            `Remove ${formatConfig.label}`,

          danger: true
        });

      removeButton.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          event.stopPropagation();

          removeFormat(format);
        }
      );

      elements.libraryOptions.append(
        removeButton
      );
    }

    if (moveFocus) {
      window.requestAnimationFrame(
        focusFirstOption
      );
    }
  }


  /* =======================================================
     SAVED FORMAT SUMMARY
     ======================================================= */

  function handleSummaryClick(event) {
    const button =
      event.target.closest(
        "[data-library-summary-format]"
      );

    if (!button) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const format =
      button.dataset
        .librarySummaryFormat;

    if (
      !availableFormats.includes(format)
    ) {
      return;
    }

    if (!isMenuOpen()) {
      elements.libraryMenu.hidden = false;

      elements.libraryPicker.classList.add(
        "is-open"
      );

      libraryBlock?.classList.add(
        "is-library-menu-open"
      );

      elements.libraryTrigger.setAttribute(
        "aria-expanded",
        "true"
      );

      elements.libraryMenu.classList.add(
        "is-positioned"
      );
    }

    showStatusScreen(format, true);
  }


  /* =======================================================
     SAVE ONE FORMAT
     ======================================================= */

  function saveFormatStatus(
    format,
    status
  ) {
    const formatConfig =
      FORMAT_CONFIG[format];

    const statusConfig =
      getStatusConfig(
        format,
        status
      );

    if (
      !currentTitle ||
      !formatConfig ||
      !statusConfig
    ) {
      return;
    }

    const library =
      readLibrary();

    const entry =
      normalizeStoredEntry(
        library[currentTitle.id],
        currentTitle
      );

    const currentTime =
      new Date().toISOString();

    entry.formats[format] = {
      status,
      updatedAt: currentTime
    };

    entry.updatedAt = currentTime;

    library[currentTitle.id] =
      entry;

    if (!writeLibrary(library)) {
      elements.libraryNote.textContent =
        "This browser could not save your library change.";

      return;
    }

    currentEntry = entry;

    updateInterface();

    elements.libraryNote.textContent =
      `${formatConfig.label} · ${statusConfig.label} saved.`;

    /*
     * Return to format selection so the other
     * format can also be saved.
     */

    showFormatScreen(false);

    window.requestAnimationFrame(
      () => {
        focusFormatButton(format);
      }
    );
  }


  /* =======================================================
     REMOVE ONE FORMAT
     ======================================================= */

  function removeFormat(format) {
    if (
      !currentTitle ||
      !currentEntry.formats[format]
    ) {
      return;
    }

    const library =
      readLibrary();

    const entry =
      normalizeStoredEntry(
        library[currentTitle.id],
        currentTitle
      );

    delete entry.formats[format];

    entry.updatedAt =
      new Date().toISOString();

    if (
      Object.keys(entry.formats)
        .length > 0
    ) {
      library[currentTitle.id] =
        entry;
    } else {
      delete library[currentTitle.id];
    }

    if (!writeLibrary(library)) {
      elements.libraryNote.textContent =
        "This browser could not update your library.";

      return;
    }

    currentEntry =
      normalizeStoredEntry(
        library[currentTitle.id],
        currentTitle
      );

    updateInterface();

    elements.libraryNote.textContent =
      `${FORMAT_CONFIG[format].label} removed from your library.`;

    showFormatScreen(false);

    window.requestAnimationFrame(
      () => {
        focusFormatButton(format);
      }
    );
  }


  /* =======================================================
     UPDATE CARD
     ======================================================= */

  function updateInterface() {
    const trackedFormats =
      availableFormats.filter(
        (format) => {
          return Boolean(
            currentEntry.formats[format]
              ?.status
          );
        }
      );

    elements.librarySummary.replaceChildren();

    /*
     * Always render something in the summary area.
     * Its reserved height prevents the library card
     * and score card from moving.
     */

    if (!trackedFormats.length) {
      elements.librarySummary.append(
        createEmptySummary()
      );
    } else {
      trackedFormats.forEach(
        (format) => {
          const formatConfig =
            FORMAT_CONFIG[format];

          const status =
            currentEntry
              .formats[format]
              .status;

          const statusConfig =
            getStatusConfig(
              format,
              status
            );

          const button =
            document.createElement(
              "button"
            );

          button.type = "button";

          button.className =
            "detail-library-summary-item";

          button.dataset
            .librarySummaryFormat =
              format;

          button.setAttribute(
            "aria-label",

            `Manage ${formatConfig.label}: ${
              statusConfig?.label ||
              status
            }`
          );

          const icon =
            document.createElement(
              "i"
            );

          icon.className =
            formatConfig.icon;

          icon.setAttribute(
            "aria-hidden",
            "true"
          );

          const text =
            document.createElement(
              "span"
            );

          text.textContent =
            `${formatConfig.label} · ${
              statusConfig?.label ||
              status
            }`;

          const arrow =
            document.createElement(
              "i"
            );

          arrow.className =
            "ti ti-chevron-right";

          arrow.setAttribute(
            "aria-hidden",
            "true"
          );

          button.append(
            icon,
            text,
            arrow
          );

          elements.librarySummary.append(
            button
          );
        }
      );
    }

    elements.librarySummary.hidden =
      false;

    if (!availableFormats.length) {
      elements.libraryTrigger.disabled =
        true;

      elements.libraryTriggerLabel.textContent =
        "No trackable formats";

      elements.libraryTriggerIcon.className =
        "ti ti-ban";

      elements.libraryNote.textContent =
        "This title has no manga or anime record to track.";

      return;
    }

    elements.libraryTrigger.disabled =
      false;

    elements.libraryTriggerIcon.className =
      trackedFormats.length
        ? "ti ti-books"
        : "ti ti-plus";

    if (trackedFormats.length === 0) {
      elements.libraryTriggerLabel.textContent =
        "Add to library";

      elements.libraryNote.textContent =
        "Choose Manga or Anime, then choose its status.";
    } else if (
      trackedFormats.length === 1
    ) {
      elements.libraryTriggerLabel.textContent =
        "1 format tracked";
    } else {
      elements.libraryTriggerLabel.textContent =
        `${trackedFormats.length} formats tracked`;
    }
  }


  function createEmptySummary() {
    const empty =
      document.createElement(
        "div"
      );

    empty.className =
      "detail-library-summary-empty";

    const icon =
      document.createElement(
        "i"
      );

    icon.className =
      "ti ti-books";

    icon.setAttribute(
      "aria-hidden",
      "true"
    );

    const copy =
      document.createElement(
        "div"
      );

    const title =
      document.createElement(
        "strong"
      );

    title.textContent =
      "No formats tracked yet";

    const description =
      document.createElement(
        "small"
      );

    description.textContent =
      "Manga and Anime can be saved separately.";

    copy.append(
      title,
      description
    );

    empty.append(
      icon,
      copy
    );

    return empty;
  }


  /* =======================================================
     CREATE MENU ELEMENTS
     ======================================================= */

  function createMenuButton({
    icon,
    label,
    meta = "",
    selected = false,
    trailing = "",
    danger = false
  }) {
    const button =
      document.createElement(
        "button"
      );

    button.type = "button";

    button.className =
      "detail-library-option";

    button.setAttribute(
      "role",
      "menuitem"
    );

    if (selected) {
      button.classList.add(
        "is-selected"
      );
    }

    if (danger) {
      button.classList.add(
        "is-danger"
      );
    }

    const iconElement =
      document.createElement(
        "i"
      );

    iconElement.className =
      icon;

    iconElement.setAttribute(
      "aria-hidden",
      "true"
    );

    const copy =
      document.createElement(
        "span"
      );

    copy.className =
      "detail-library-option-copy";

    const labelElement =
      document.createElement(
        "strong"
      );

    labelElement.textContent =
      label;

    copy.append(
      labelElement
    );

    if (meta) {
      const metaElement =
        document.createElement(
          "small"
        );

      metaElement.textContent =
        meta;

      copy.append(
        metaElement
      );
    }

    const trailingElement =
      document.createElement(
        "span"
      );

    trailingElement.className =
      "detail-library-option-trailing";

    trailingElement.setAttribute(
      "aria-hidden",
      "true"
    );

    trailingElement.textContent =
      trailing;

    button.append(
      iconElement,
      copy,
      trailingElement
    );

    return button;
  }


  function createMenuDivider() {
    const divider =
      document.createElement(
        "div"
      );

    divider.className =
      "detail-library-menu-divider";

    divider.setAttribute(
      "role",
      "separator"
    );

    return divider;
  }


  /* =======================================================
     STATUS HELPERS
     ======================================================= */

  function getStatusConfig(
    format,
    status
  ) {
    return (
      FORMAT_CONFIG[format]
        ?.statuses
        .find(
          (item) => {
            return item.id === status;
          }
        ) ||
      null
    );
  }


  /* =======================================================
     KEYBOARD NAVIGATION
     ======================================================= */

  function getMenuButtons() {
    return [
      ...elements.libraryMenu
        .querySelectorAll(
          "button:not([hidden]):not(:disabled)"
        )
    ];
  }


  function focusFirstOption() {
    const firstOption =
      elements.libraryOptions
        .querySelector(
          "button:not(:disabled)"
        );

    firstOption
      ?.focus();
  }


  function focusFormatButton(format) {
    elements.libraryOptions
      .querySelector(
        `[data-library-format="${format}"]`
      )
      ?.focus();
  }


  function handleMenuKeydown(event) {
    const buttons =
      getMenuButtons();

    if (!buttons.length) {
      return;
    }

    const currentIndex =
      buttons.indexOf(
        document.activeElement
      );

    if (event.key === "Escape") {
      event.preventDefault();

      closeMenu(true);
      return;
    }

    if (
      event.key === "ArrowLeft" &&
      currentScreen === "statuses"
    ) {
      event.preventDefault();

      showFormatScreen(true);
      return;
    }

    let nextIndex = null;

    if (event.key === "ArrowDown") {
      nextIndex =
        currentIndex < 0
          ? 0
          : (
              currentIndex + 1
            ) % buttons.length;
    } else if (
      event.key === "ArrowUp"
    ) {
      nextIndex =
        currentIndex < 0
          ? buttons.length - 1
          : (
              currentIndex -
              1 +
              buttons.length
            ) % buttons.length;
    } else if (
      event.key === "Home"
    ) {
      nextIndex = 0;
    } else if (
      event.key === "End"
    ) {
      nextIndex =
        buttons.length - 1;
    }

    if (nextIndex == null) {
      return;
    }

    event.preventDefault();

    buttons[nextIndex]
      ?.focus();
  }


  return {
    bindEvents,
    setTitle
  };
}


/* =========================================================
   STORED ENTRY NORMALIZATION
   ========================================================= */

function normalizeStoredEntry(
  storedEntry,
  title
) {
  const formats = {};

  if (
    storedEntry?.formats &&
    typeof storedEntry.formats ===
      "object"
  ) {
    SUPPORTED_FORMATS.forEach(
      (format) => {
        const status =
          storedEntry
            .formats[format]
            ?.status;

        if (
          getValidStatus(
            format,
            status
          )
        ) {
          formats[format] = {
            status,

            updatedAt:
              storedEntry
                .formats[format]
                ?.updatedAt ||
              storedEntry.updatedAt ||
              ""
          };
        }
      }
    );
  }

  return {
    id: title.id,
    title: title.title,
    coverUrl: title.coverUrl,
    types: title.types,
    formats,

    updatedAt:
      storedEntry?.updatedAt ||
      ""
  };
}


/* =========================================================
   STATUS VALIDATION
   ========================================================= */

function getValidStatus(
  format,
  status
) {
  return FORMAT_CONFIG[format]
    ?.statuses
    .some(
      (item) => {
        return item.id === status;
      }
    );
}


/* =========================================================
   LOCAL STORAGE
   ========================================================= */

function readLibrary() {
  try {
    const parsedValue =
      JSON.parse(
        localStorage.getItem(
          STORAGE_KEY
        ) || "{}"
      );

    return (
      parsedValue &&
      typeof parsedValue ===
        "object" &&
      !Array.isArray(parsedValue)
    )
      ? parsedValue
      : {};
  } catch (error) {
    console.error(
      "INKWELL LIBRARY READ ERROR:",
      error
    );

    return {};
  }
}


function writeLibrary(library) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(library)
    );

    return true;
  } catch (error) {
    console.error(
      "INKWELL LIBRARY STORAGE ERROR:",
      error
    );

    return false;
  }
}