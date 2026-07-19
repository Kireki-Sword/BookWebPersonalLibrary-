// detail-library.js
// Provides a compact, direct library-status editor for Manga and Anime.
//
// This replacement keeps the current detail-page HTML and the existing
// localStorage data shape. Manga and Anime remain independent, but the
// old three-screen menu is replaced with one status selector per format.

const STORAGE_KEY = "inkwell-library";

const STYLE_ELEMENT_ID =
  "inkwell-direct-library-styles";

const SUPPORTED_FORMATS = [
  "manga",
  "anime"
];

const FORMAT_CONFIG =
  Object.freeze({
    manga: {
      label:
        "Manga",

      icon:
        "ti ti-book-2",

      statuses: [
        {
          id:
            "reading",

          label:
            "Reading"
        },

        {
          id:
            "completed",

          label:
            "Completed"
        },

        {
          id:
            "plan-to-read",

          label:
            "Plan to read"
        },

        {
          id:
            "paused",

          label:
            "Paused"
        },

        {
          id:
            "dropped",

          label:
            "Dropped"
        }
      ]
    },

    anime: {
      label:
        "Anime",

      icon:
        "ti ti-device-tv",

      statuses: [
        {
          id:
            "watching",

          label:
            "Watching"
        },

        {
          id:
            "completed",

          label:
            "Completed"
        },

        {
          id:
            "plan-to-watch",

          label:
            "Plan to watch"
        },

        {
          id:
            "paused",

          label:
            "Paused"
        },

        {
          id:
            "dropped",

          label:
            "Dropped"
        }
      ]
    }
  });


export function createDetailLibraryController(
  elements
) {
  const libraryBlock =
    elements
      .libraryPicker
      ?.closest(
        ".detail-library-block"
      );


  const libraryTitle =
    document
      .getElementById(
        "detail-library-title"
      );


  let currentTitle =
    null;


  let currentEntry =
    null;


  let availableFormats =
    [];


  let hasBoundEvents =
    false;


  /* =======================================================
     EVENT SETUP
     ======================================================= */

  function bindEvents() {
    if (
      hasBoundEvents
    ) {
      return;
    }


    hasBoundEvents =
      true;


    installDirectLibraryStyles();


    prepareDirectLibraryInterface();


    elements
      .librarySummary
      .addEventListener(
        "change",
        handleStatusChange
      );
  }


  /* =======================================================
     PREPARE THE COMPACT INTERFACE
     ======================================================= */

  function prepareDirectLibraryInterface() {
    libraryBlock
      ?.classList
      .add(
        "is-direct-library"
      );


    if (
      libraryTitle
    ) {
      libraryTitle
        .textContent =
          "My status";
    }


    elements
      .librarySummary
      .hidden =
        false;


    /*
     * The original trigger and menu remain in the HTML.
     * This means detail-dom.js does not need to change.
     *
     * They are hidden because the new interface uses one
     * direct selector for each available format.
     */

    elements
      .libraryPicker
      .hidden =
        true;


    elements
      .libraryTrigger
      .hidden =
        true;


    elements
      .libraryMenu
      .hidden =
        true;


    elements
      .libraryTrigger
      .setAttribute(
        "aria-expanded",
        "false"
      );


    elements
      .librarySummary
      .setAttribute(
        "aria-label",
        "Library status by format"
      );
  }


  /* =======================================================
     TITLE SETUP
     ======================================================= */

  function setTitle(
    title
  ) {
    currentTitle =
      title;


    availableFormats =
      SUPPORTED_FORMATS
        .filter(
          (
            format
          ) => {
            return Boolean(
              title
                .media
                ?.[
                  format
                ]
                ?.length
            );
          }
        );


    const library =
      readLibrary();


    currentEntry =
      normalizeStoredEntry(
        library[
          title.id
        ],

        title,

        availableFormats
      );


    renderInterface();
  }


  /* =======================================================
     STATUS CHANGE EVENT
     ======================================================= */

  function handleStatusChange(
    event
  ) {
    const select =
      event
        .target
        .closest(
          "[data-library-status-select]"
        );


    if (
      !select
    ) {
      return;
    }


    const format =
      select
        .dataset
        .libraryStatusSelect;


    const status =
      select.value;


    if (
      !availableFormats
        .includes(
          format
        )
    ) {
      return;
    }


    updateFormatStatus(
      format,
      status,
      select
    );
  }


  /* =======================================================
     SAVE OR REMOVE A FORMAT
     ======================================================= */

  function updateFormatStatus(
    format,
    status,
    changedSelect
  ) {
    if (
      !currentTitle
    ) {
      return;
    }


    if (
      status &&
      !getValidStatus(
        format,
        status
      )
    ) {
      renderInterface();


      setLibraryNote(
        "That library status is not available."
      );


      return;
    }


    changedSelect
      .disabled =
        true;


    changedSelect
      .closest(
        ".detail-library-direct-row"
      )
      ?.classList
      .add(
        "is-saving"
      );


    const library =
      readLibrary();


    const entry =
      normalizeStoredEntry(
        library[
          currentTitle.id
        ],

        currentTitle,

        availableFormats
      );


    const currentTime =
      new Date()
        .toISOString();


    if (
      status
    ) {
      entry
        .formats[
          format
        ] = {
          status,

          updatedAt:
            currentTime
        };
    } else {
      delete entry
        .formats[
          format
        ];
    }


    entry.updatedAt =
      currentTime;


    if (
      Object
        .keys(
          entry.formats
        )
        .length
    ) {
      library[
        currentTitle.id
      ] =
        entry;
    } else {
      delete library[
        currentTitle.id
      ];
    }


    if (
      !writeLibrary(
        library
      )
    ) {
      renderInterface();


      setLibraryNote(
        "This browser could not save your library change."
      );


      focusFormatSelect(
        format
      );


      return;
    }


    currentEntry =
      normalizeStoredEntry(
        library[
          currentTitle.id
        ],

        currentTitle,

        availableFormats
      );


    renderInterface();


    const formatLabel =
      FORMAT_CONFIG[
        format
      ]
        .label;


    const statusLabel =
      getStatusConfig(
        format,
        status
      )
        ?.label;


    if (
      statusLabel
    ) {
      setLibraryNote(
        `${formatLabel} set to ${statusLabel}.`
      );
    } else {
      setLibraryNote(
        `${formatLabel} removed from your library.`
      );
    }


    focusFormatSelect(
      format
    );
  }


  /* =======================================================
     RENDER THE WHOLE LIBRARY CARD
     ======================================================= */

  function renderInterface() {
    elements
      .librarySummary
      .replaceChildren();


    elements
      .librarySummary
      .hidden =
        false;


    if (
      !currentTitle
    ) {
      renderEmptyState(
        "Open a title to manage its library status."
      );


      setLibraryNote(
        ""
      );


      return;
    }


    if (
      !availableFormats
        .length
    ) {
      renderEmptyState(
        "This title has no Manga or Anime format available to save."
      );


      setLibraryNote(
        "No trackable format is available for this title."
      );


      return;
    }


    const fragment =
      document
        .createDocumentFragment();


    availableFormats
      .forEach(
        (
          format
        ) => {
          fragment.append(
            createFormatRow(
              format
            )
          );
        }
      );


    elements
      .librarySummary
      .append(
        fragment
      );


    const trackedCount =
      availableFormats
        .filter(
          (
            format
          ) => {
            return Boolean(
              currentEntry
                .formats[
                  format
                ]
                ?.status
            );
          }
        )
        .length;


    if (
      trackedCount ===
      0
    ) {
      setLibraryNote(
        availableFormats.length > 1
          ? "Manga and Anime can be saved separately."
          : "Choose a status to save this format."
      );


      return;
    }


    if (
      trackedCount <
      availableFormats.length
    ) {
      setLibraryNote(
        "Each format keeps its own library status."
      );


      return;
    }


    setLibraryNote(
      availableFormats.length > 1
        ? "Manga and Anime are saved separately."
        : "Change the selector whenever your status changes."
    );
  }


  /* =======================================================
     CREATE ONE FORMAT ROW
     ======================================================= */

  function createFormatRow(
    format
  ) {
    const formatConfig =
      FORMAT_CONFIG[
        format
      ];


    const savedStatus =
      currentEntry
        .formats[
          format
        ]
        ?.status ||
      "";


    const savedStatusConfig =
      getStatusConfig(
        format,
        savedStatus
      );


    const row =
      document
        .createElement(
          "div"
        );


    row.className =
      "detail-library-direct-row";


    row
      .dataset
      .format =
        format;


    row
      .dataset
      .tracked =
        String(
          Boolean(
            savedStatus
          )
        );


    const icon =
      document
        .createElement(
          "span"
        );


    icon.className =
      "detail-library-direct-icon";


    icon.setAttribute(
      "aria-hidden",
      "true"
    );


    const iconElement =
      document
        .createElement(
          "i"
        );


    iconElement.className =
      formatConfig.icon;


    icon.append(
      iconElement
    );


    const copy =
      document
        .createElement(
          "div"
        );


    copy.className =
      "detail-library-direct-copy";


    const label =
      document
        .createElement(
          "strong"
        );


    label.textContent =
      formatConfig.label;


    const meta =
      document
        .createElement(
          "small"
        );


    meta.textContent =
      savedStatusConfig
        ? savedStatusConfig.label
        : "Not tracked";


    copy.append(
      label,
      meta
    );


    const control =
      document
        .createElement(
          "div"
        );


    control.className =
      "detail-library-direct-control";


    const select =
      document
        .createElement(
          "select"
        );


    select.className =
      "detail-library-direct-select";


    select
      .dataset
      .libraryStatusSelect =
        format;


    select.setAttribute(
      "aria-label",
      `${formatConfig.label} library status`
    );


    select.append(
      createSelectOption(
        "",
        "Not tracked"
      )
    );


    formatConfig
      .statuses
      .forEach(
        (
          status
        ) => {
          select.append(
            createSelectOption(
              status.id,
              status.label
            )
          );
        }
      );


    select.value =
      savedStatus;


    const chevron =
      document
        .createElement(
          "i"
        );


    chevron.className =
      "ti ti-chevron-down detail-library-direct-chevron";


    chevron.setAttribute(
      "aria-hidden",
      "true"
    );


    control.append(
      select,
      chevron
    );


    row.append(
      icon,
      copy,
      control
    );


    return row;
  }


  /* =======================================================
     CREATE A SELECT OPTION
     ======================================================= */

  function createSelectOption(
    value,
    label
  ) {
    const option =
      document
        .createElement(
          "option"
        );


    option.value =
      value;


    option.textContent =
      label;


    return option;
  }


  /* =======================================================
     EMPTY STATE
     ======================================================= */

  function renderEmptyState(
    message
  ) {
    const emptyState =
      document
        .createElement(
          "div"
        );


    emptyState.className =
      "detail-library-direct-empty";


    const icon =
      document
        .createElement(
          "i"
        );


    icon.className =
      "ti ti-book-off";


    icon.setAttribute(
      "aria-hidden",
      "true"
    );


    const copy =
      document
        .createElement(
          "span"
        );


    copy.textContent =
      message;


    emptyState.append(
      icon,
      copy
    );


    elements
      .librarySummary
      .append(
        emptyState
      );
  }


  /* =======================================================
     STATUS MESSAGE
     ======================================================= */

  function setLibraryNote(
    message
  ) {
    elements
      .libraryNote
      .textContent =
        message;
  }


  /* =======================================================
     RETURN FOCUS AFTER SAVING
     ======================================================= */

  function focusFormatSelect(
    format
  ) {
    window
      .requestAnimationFrame(
        () => {
          elements
            .librarySummary
            .querySelector(
              `[data-library-status-select="${format}"]`
            )
            ?.focus();
        }
      );
  }


  return {
    bindEvents,
    setTitle
  };
}


/* =========================================================
   FIND A STATUS CONFIGURATION
   ========================================================= */

function getStatusConfig(
  format,
  status
) {
  if (
    !status
  ) {
    return null;
  }


  return (
    FORMAT_CONFIG[
      format
    ]
      ?.statuses
      .find(
        (
          item
        ) => {
          return (
            item.id ===
            status
          );
        }
      ) ||
    null
  );
}


/* =========================================================
   STORED ENTRY NORMALIZATION
   ========================================================= */

function normalizeStoredEntry(
  storedEntry,
  title,
  availableFormats
) {
  const formats =
    {};


  if (
    storedEntry
      ?.formats &&
    typeof storedEntry
      .formats ===
      "object"
  ) {
    SUPPORTED_FORMATS
      .forEach(
        (
          format
        ) => {
          const status =
            storedEntry
              .formats[
                format
              ]
              ?.status;


          if (
            getValidStatus(
              format,
              status
            )
          ) {
            formats[
              format
            ] = {
              status,

              updatedAt:
                storedEntry
                  .formats[
                    format
                  ]
                  ?.updatedAt ||
                storedEntry
                  .updatedAt ||
                ""
            };
          }
        }
      );
  } else if (
    storedEntry
      ?.status &&
    availableFormats
      .length ===
      1
  ) {
    /*
     * Migrates an older single-status entry when the title
     * has only one available format.
     */

    const format =
      availableFormats[
        0
      ];


    const migratedStatus =
      migrateLegacyStatus(
        format,
        storedEntry.status
      );


    if (
      migratedStatus
    ) {
      formats[
        format
      ] = {
        status:
          migratedStatus,

        updatedAt:
          storedEntry
            .updatedAt ||
          ""
      };
    }
  }


  return {
    id:
      title.id,

    title:
      title.title,

    coverUrl:
      title.coverUrl,

    types:
      title.types,

    formats,

    updatedAt:
      storedEntry
        ?.updatedAt ||
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
  return Boolean(
    FORMAT_CONFIG[
      format
    ]
      ?.statuses
      .some(
        (
          item
        ) => {
          return (
            item.id ===
            status
          );
        }
      )
  );
}


/* =========================================================
   MIGRATE AN OLDER SINGLE STATUS
   ========================================================= */

function migrateLegacyStatus(
  format,
  legacyStatus
) {
  const status =
    String(
      legacyStatus ||
      ""
    )
      .trim()
      .toLowerCase();


  const sharedStatuses = {
    completed:
      "completed",

    paused:
      "paused",

    dropped:
      "dropped"
  };


  if (
    sharedStatuses[
      status
    ]
  ) {
    return sharedStatuses[
      status
    ];
  }


  if (
    status ===
      "in-progress"
  ) {
    return format ===
      "anime"
        ? "watching"
        : "reading";
  }


  if (
    status ===
      "planned"
  ) {
    return format ===
      "anime"
        ? "plan-to-watch"
        : "plan-to-read";
  }


  return "";
}


/* =========================================================
   READ LOCAL STORAGE
   ========================================================= */

function readLibrary() {
  try {
    const parsedValue =
      JSON.parse(
        localStorage
          .getItem(
            STORAGE_KEY
          ) ||
        "{}"
      );


    if (
      !parsedValue ||
      typeof parsedValue !==
        "object" ||
      Array.isArray(
        parsedValue
      )
    ) {
      return {};
    }


    return parsedValue;
  } catch (
    error
  ) {
    console.error(
      "INKWELL LIBRARY READ ERROR:",
      error
    );


    return {};
  }
}


/* =========================================================
   WRITE LOCAL STORAGE
   ========================================================= */

function writeLibrary(
  library
) {
  try {
    localStorage
      .setItem(
        STORAGE_KEY,

        JSON.stringify(
          library
        )
      );


    return true;
  } catch (
    error
  ) {
    console.error(
      "INKWELL LIBRARY STORAGE ERROR:",
      error
    );


    return false;
  }
}


/* =========================================================
   INSTALL THE NEW LIBRARY CARD STYLES
   ========================================================= */

function installDirectLibraryStyles() {
  if (
    document
      .getElementById(
        STYLE_ELEMENT_ID
      )
  ) {
    return;
  }


  const style =
    document
      .createElement(
        "style"
      );


  style.id =
    STYLE_ELEMENT_ID;


  style.textContent = `
    .detail-library-block.is-direct-library {
      height: auto !important;
      min-height: 0 !important;
      max-height: none !important;

      padding: 1.05rem !important;

      display: grid !important;

      grid-template-rows:
        auto
        auto
        auto !important;

      row-gap: 0.82rem !important;

      overflow: visible !important;
    }


    .detail-library-block.is-direct-library
    .detail-library-heading {
      grid-row: 1;
    }


    .detail-library-block.is-direct-library
    .detail-library-heading h2 {
      font-size: 1.12rem;
    }


    .detail-library-block.is-direct-library
    .detail-library-summary {
      position: static !important;

      z-index: auto !important;

      grid-row: 2 !important;

      grid-column: 1 !important;

      align-self: stretch !important;

      min-width: 0;

      display: grid !important;

      gap: 0.52rem !important;

      padding: 0 !important;

      opacity: 1 !important;

      visibility: visible !important;

      pointer-events: auto !important;
    }


    .detail-library-block.is-direct-library
    .detail-library-picker {
      display: none !important;
    }


    .detail-library-block.is-direct-library
    .detail-library-note {
      position: static !important;

      grid-row: 3 !important;

      left: auto !important;

      right: auto !important;

      bottom: auto !important;

      min-height: 1.35em;

      overflow: visible !important;

      color: #7f8ba7;

      font-size: 0.64rem;

      line-height: 1.45;

      text-overflow: clip !important;

      white-space: normal !important;
    }


    .detail-library-direct-row {
      min-height: 58px;

      display: grid;

      grid-template-columns:
        32px
        minmax(0, 1fr)
        auto;

      align-items: center;

      gap: 0.62rem;

      padding:
        0.52rem
        0.56rem;

      background:
        linear-gradient(
          145deg,
          rgba(255, 255, 255, 0.045),
          rgba(255, 255, 255, 0.018)
        );

      border:
        1px solid
        rgba(187, 196, 255, 0.12);

      border-radius: 11px;

      transition:
        background 160ms ease,
        border-color 160ms ease,
        opacity 160ms ease;
    }


    .detail-library-direct-row:hover,
    .detail-library-direct-row:focus-within {
      background:
        linear-gradient(
          145deg,
          rgba(124, 140, 255, 0.11),
          rgba(116, 215, 255, 0.025)
        );

      border-color:
        rgba(187, 196, 255, 0.25);
    }


    .detail-library-direct-row[data-tracked="true"] {
      border-color:
        rgba(124, 140, 255, 0.24);
    }


    .detail-library-direct-row.is-saving {
      opacity: 0.66;
    }


    .detail-library-direct-icon {
      width: 32px;

      height: 32px;

      display: inline-flex;

      align-items: center;

      justify-content: center;

      color: #bfc8ff;

      background:
        rgba(124, 140, 255, 0.1);

      border:
        1px solid
        rgba(187, 196, 255, 0.13);

      border-radius: 9px;

      font-size: 0.9rem;
    }


    .detail-library-direct-copy {
      min-width: 0;

      display: grid;

      gap: 0.15rem;
    }


    .detail-library-direct-copy strong {
      overflow: hidden;

      color: #e5e9f7;

      font-size: 0.72rem;

      font-weight: 740;

      line-height: 1.2;

      text-overflow: ellipsis;

      white-space: nowrap;
    }


    .detail-library-direct-copy small {
      overflow: hidden;

      color: #7f8aa4;

      font-size: 0.6rem;

      font-weight: 620;

      line-height: 1.2;

      text-overflow: ellipsis;

      white-space: nowrap;
    }


    .detail-library-direct-row[data-tracked="true"]
    .detail-library-direct-copy small {
      color: #aeb8d1;
    }


    .detail-library-direct-control {
      position: relative;

      width: 126px;

      min-width: 0;
    }


    .detail-library-direct-select {
      width: 100%;

      min-height: 42px;

      appearance: none;

      -webkit-appearance: none;

      padding:
        0.56rem
        1.85rem
        0.56rem
        0.68rem;

      color: #e7ebfb;

      background:
        linear-gradient(
          180deg,
          rgba(124, 140, 255, 0.13),
          rgba(124, 140, 255, 0.065)
        );

      border:
        1px solid
        rgba(187, 196, 255, 0.18);

      border-radius: 9px;

      outline: none;

      font-family:
        var(
          --font-body,
          system-ui,
          sans-serif
        );

      font-size: 0.65rem;

      font-weight: 690;

      line-height: 1.2;

      cursor: pointer;

      transition:
        background 150ms ease,
        border-color 150ms ease,
        box-shadow 150ms ease;
    }


    .detail-library-direct-select:hover {
      background:
        linear-gradient(
          180deg,
          rgba(124, 140, 255, 0.19),
          rgba(124, 140, 255, 0.085)
        );

      border-color:
        rgba(187, 196, 255, 0.3);
    }


    .detail-library-direct-select:focus-visible {
      border-color:
        rgba(116, 215, 255, 0.68);

      box-shadow:
        0 0 0 3px
        rgba(116, 215, 255, 0.12),

        0 8px 22px
        rgba(0, 0, 0, 0.2);
    }


    .detail-library-direct-select:disabled {
      cursor: wait;
    }


    .detail-library-direct-select option {
      color: #eef1ff;

      background: #10172d;
    }


    .detail-library-direct-chevron {
      position: absolute;

      top: 50%;

      right: 0.62rem;

      transform:
        translateY(-50%);

      color: #8f9ab5;

      font-size: 0.73rem;

      pointer-events: none;
    }


    .detail-library-direct-empty {
      min-height: 82px;

      display: flex;

      align-items: center;

      justify-content: center;

      gap: 0.6rem;

      padding: 0.9rem;

      color: #7e89a3;

      background:
        rgba(255, 255, 255, 0.02);

      border:
        1px dashed
        rgba(187, 196, 255, 0.14);

      border-radius: 11px;

      font-size: 0.66rem;

      line-height: 1.5;

      text-align: center;
    }


    @media (max-width: 390px) {
      .detail-library-direct-row {
        grid-template-columns:
          32px
          minmax(0, 1fr);
      }


      .detail-library-direct-control {
        grid-column: 2;

        width: 100%;
      }
    }


    @media (prefers-reduced-motion: reduce) {
      .detail-library-direct-row,
      .detail-library-direct-select {
        transition:
          none !important;
      }
    }
  `;


  document
    .head
    .append(
      style
    );
}