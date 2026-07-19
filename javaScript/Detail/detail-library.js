// detail-library.js
// Tracks Manga and Anime independently inside a stable
// library card with three interface states:
//
// 1. Summary
// 2. Choose format
// 3. Choose status

const STORAGE_KEY =
  "inkwell-library";


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
            "Reading",

          icon:
            "ti ti-book"
        },

        {
          id:
            "completed",

          label:
            "Completed",

          icon:
            "ti ti-circle-check"
        },

        {
          id:
            "plan-to-read",

          label:
            "Plan to read",

          icon:
            "ti ti-clock-plus"
        },

        {
          id:
            "paused",

          label:
            "Paused",

          icon:
            "ti ti-player-pause"
        },

        {
          id:
            "dropped",

          label:
            "Dropped",

          icon:
            "ti ti-circle-minus"
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
            "Watching",

          icon:
            "ti ti-player-play"
        },

        {
          id:
            "completed",

          label:
            "Completed",

          icon:
            "ti ti-circle-check"
        },

        {
          id:
            "plan-to-watch",

          label:
            "Plan to watch",

          icon:
            "ti ti-clock-plus"
        },

        {
          id:
            "paused",

          label:
            "Paused",

          icon:
            "ti ti-player-pause"
        },

        {
          id:
            "dropped",

          label:
            "Dropped",

          icon:
            "ti ti-circle-minus"
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
      .closest(
        ".detail-library-block"
      );


  const menuBackIcon =
    elements
      .libraryMenuBack
      .querySelector(
        "i"
      );


  let currentTitle =
    null;


  let currentEntry =
    null;


  let availableFormats =
    [];


  let activeFormat =
    "";


  let currentScreen =
    "summary";


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
      .libraryTrigger
      .addEventListener(
        "click",
        handleTriggerClick
      );


    elements
      .libraryMenuBack
      .addEventListener(
        "click",
        handleMenuBackClick
      );


    elements
      .librarySummary
      .addEventListener(
        "click",
        handleSummaryClick
      );


    elements
      .libraryMenu
      .addEventListener(
        "click",
        (
          event
        ) => {
          event.stopPropagation();
        }
      );


    elements
      .libraryMenu
      .addEventListener(
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


  function handleTriggerClick(
    event
  ) {
    event.preventDefault();

    event.stopPropagation();


    if (
      isEditorOpen()
    ) {
      closeEditor(
        true
      );

      return;
    }


    openFormatEditor();
  }


  function handleMenuBackClick(
    event
  ) {
    event.preventDefault();

    event.stopPropagation();


    if (
      currentScreen ===
      "statuses"
    ) {
      showFormatScreen(
        true
      );

      return;
    }


    closeEditor(
      true
    );
  }


  function handleSummaryClick(
    event
  ) {
    const button =
      event
        .target
        .closest(
          "[data-library-summary-format]"
        );


    if (
      !button
    ) {
      return;
    }


    event.preventDefault();

    event.stopPropagation();


    const format =
      button
        .dataset
        .librarySummaryFormat;


    if (
      !availableFormats
        .includes(
          format
        )
    ) {
      return;
    }


    openStatusEditor(
      format
    );
  }


  function handleDocumentClick(
    event
  ) {
    if (
      !isEditorOpen()
    ) {
      return;
    }


    if (
      libraryBlock &&
      !libraryBlock
        .contains(
          event.target
        )
    ) {
      closeEditor();
    }
  }


  function handleDocumentKeydown(
    event
  ) {
    if (
      event.key !==
        "Escape" ||
      !isEditorOpen()
    ) {
      return;
    }


    event.preventDefault();


    closeEditor(
      true
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
            return (
              title
                .media
                ?.[
                  format
                ]
                ?.length > 0
            );
          }
        );


    currentEntry =
      normalizeStoredEntry(
        readLibrary()[
          title.id
        ],

        title,

        availableFormats
      );


    activeFormat =
      "";


    currentScreen =
      "summary";


    closeEditor();


    updateInterface();
  }


  /* =======================================================
     EDITOR OPEN AND CLOSE
     ======================================================= */

  function isEditorOpen() {
    return (
      !elements
        .libraryMenu
        .hidden
    );
  }


  function openFormatEditor() {
    if (
      !currentTitle ||
      !availableFormats
        .length
    ) {
      return;
    }


    showFormatScreen(
      false
    );


    openEditor();


    window
      .requestAnimationFrame(
        focusFirstOption
      );
  }


  function openStatusEditor(
    format
  ) {
    if (
      !currentTitle ||
      !availableFormats
        .includes(
          format
        )
    ) {
      return;
    }


    showStatusScreen(
      format,
      false
    );


    openEditor();


    window
      .requestAnimationFrame(
        focusSelectedOrFirstStatus
      );
  }


  function openEditor() {
    elements
      .libraryMenu
      .hidden =
        false;


    elements
      .libraryMenu
      .classList
      .add(
        "is-visible"
      );


    elements
      .libraryPicker
      .classList
      .add(
        "is-open"
      );


    libraryBlock
      ?.classList
      .add(
        "is-library-editor-open"
      );


    elements
      .libraryTrigger
      .setAttribute(
        "aria-expanded",
        "true"
      );
  }


  function closeEditor(
    returnFocus =
      false
  ) {
    currentScreen =
      "summary";


    activeFormat =
      "";


    elements
      .libraryMenu
      .hidden =
        true;


    elements
      .libraryMenu
      .classList
      .remove(
        "is-visible"
      );


    elements
      .libraryPicker
      .classList
      .remove(
        "is-open"
      );


    libraryBlock
      ?.classList
      .remove(
        "is-library-editor-open"
      );


    elements
      .libraryTrigger
      .setAttribute(
        "aria-expanded",
        "false"
      );


    if (
      returnFocus
    ) {
      elements
        .libraryTrigger
        .focus();
    }
  }


  /* =======================================================
     FORMAT SCREEN
     ======================================================= */

  function showFormatScreen(
    moveFocus =
      false
  ) {
    currentScreen =
      "formats";


    activeFormat =
      "";


    elements
      .libraryMenu
      .dataset
      .screen =
        "formats";


    elements
      .libraryMenuBack
      .hidden =
        false;


    elements
      .libraryMenuBack
      .setAttribute(
        "aria-label",
        "Close library editor"
      );


    if (
      menuBackIcon
    ) {
      menuBackIcon.className =
        "ti ti-x";
    }


    elements
      .libraryMenuEyebrow
      .textContent =
        "Choose a format";


    elements
      .libraryMenuTitle
      .textContent =
        "What are you tracking?";


    elements
      .libraryOptions
      .replaceChildren();


    availableFormats
      .forEach(
        (
          format
        ) => {
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


          const button =
            createMenuButton({
              icon:
                formatConfig.icon,

              label:
                formatConfig.label,

              meta:
                savedStatusConfig
                  ?.label ||
                "Not tracked",

              selected:
                Boolean(
                  savedStatus
                ),

              trailingIcon:
                "ti ti-chevron-right"
            });


          button
            .dataset
            .libraryFormat =
              format;


          button.addEventListener(
            "click",
            (
              event
            ) => {
              event.preventDefault();

              event.stopPropagation();


              showStatusScreen(
                format,
                true
              );
            }
          );


          elements
            .libraryOptions
            .append(
              button
            );
        }
      );


    if (
      moveFocus
    ) {
      window
        .requestAnimationFrame(
          focusFirstOption
        );
    }
  }


  /* =======================================================
     STATUS SCREEN
     ======================================================= */

  function showStatusScreen(
    format,
    moveFocus =
      true
  ) {
    if (
      !availableFormats
        .includes(
          format
        )
    ) {
      return;
    }


    const formatConfig =
      FORMAT_CONFIG[
        format
      ];


    if (
      !formatConfig
    ) {
      return;
    }


    currentScreen =
      "statuses";


    activeFormat =
      format;


    elements
      .libraryMenu
      .dataset
      .screen =
        "statuses";


    const savedStatus =
      currentEntry
        .formats[
          format
        ]
        ?.status ||
      "";


    elements
      .libraryMenuBack
      .hidden =
        false;


    elements
      .libraryMenuBack
      .setAttribute(
        "aria-label",
        "Back to formats"
      );


    if (
      menuBackIcon
    ) {
      menuBackIcon.className =
        "ti ti-arrow-left";
    }


    elements
      .libraryMenuEyebrow
      .textContent =
        formatConfig.label;


    elements
      .libraryMenuTitle
      .textContent =
        format ===
          "anime"
          ? "Choose your anime status"
          : "Choose your manga status";


    elements
      .libraryOptions
      .replaceChildren();


    formatConfig
      .statuses
      .forEach(
        (
          status
        ) => {
          const selected =
            savedStatus ===
            status.id;


          const button =
            createMenuButton({
              icon:
                status.icon,

              label:
                status.label,

              selected,

              trailingText:
                selected
                  ? "✓"
                  : ""
            });


          button
            .dataset
            .libraryStatus =
              status.id;


          button.setAttribute(
            "role",
            "menuitemradio"
          );


          button.setAttribute(
            "aria-checked",
            String(
              selected
            )
          );


          button.addEventListener(
            "click",
            (
              event
            ) => {
              event.preventDefault();

              event.stopPropagation();


              saveFormatStatus(
                format,
                status.id
              );
            }
          );


          elements
            .libraryOptions
            .append(
              button
            );
        }
      );


    if (
      savedStatus
    ) {
      elements
        .libraryOptions
        .append(
          createMenuDivider()
        );


      const removeButton =
        createMenuButton({
          icon:
            "ti ti-trash",

          label:
            `Remove ${
              formatConfig.label
            }`,

          danger:
            true
        });


      removeButton
        .classList
        .add(
          "detail-library-option-remove"
        );


      removeButton.addEventListener(
        "click",
        (
          event
        ) => {
          event.preventDefault();

          event.stopPropagation();


          removeFormat(
            format
          );
        }
      );


      elements
        .libraryOptions
        .append(
          removeButton
        );
    }


    if (
      moveFocus
    ) {
      window
        .requestAnimationFrame(
          focusSelectedOrFirstStatus
        );
    }
  }


  /* =======================================================
     SAVE ONE FORMAT
     ======================================================= */

  function saveFormatStatus(
    format,
    status
  ) {
    const formatConfig =
      FORMAT_CONFIG[
        format
      ];


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
        library[
          currentTitle.id
        ],

        currentTitle,

        availableFormats
      );


    const currentTime =
      new Date()
        .toISOString();


    entry
      .formats[
        format
      ] = {
        status,

        updatedAt:
          currentTime
      };


    entry.updatedAt =
      currentTime;


    library[
      currentTitle.id
    ] =
      entry;


    if (
      !writeLibrary(
        library
      )
    ) {
      elements
        .libraryNote
        .textContent =
          "This browser could not save your library change.";


      return;
    }


    currentEntry =
      entry;


    updateInterface();


    elements
      .libraryNote
      .textContent =
        `${
          formatConfig.label
        } · ${
          statusConfig.label
        } saved.`;


    closeEditor();


    window
      .requestAnimationFrame(
        () => {
          focusSummaryButton(
            format
          );
        }
      );
  }


  /* =======================================================
     REMOVE ONE FORMAT
     ======================================================= */

  function removeFormat(
    format
  ) {
    if (
      !currentTitle ||
      !currentEntry
        .formats[
          format
        ]
    ) {
      return;
    }


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


    delete entry
      .formats[
        format
      ];


    entry.updatedAt =
      new Date()
        .toISOString();


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
      elements
        .libraryNote
        .textContent =
          "This browser could not update your library.";


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


    updateInterface();


    elements
      .libraryNote
      .textContent =
        `${
          FORMAT_CONFIG[
            format
          ].label
        } removed from your library.`;


    closeEditor();


    window
      .requestAnimationFrame(
        () => {
          focusSummaryButton(
            format
          );
        }
      );
  }


  /* =======================================================
     UPDATE SUMMARY INTERFACE
     ======================================================= */

  function updateInterface() {
    elements
      .librarySummary
      .replaceChildren();


    if (
      !availableFormats
        .length
    ) {
      renderUnavailableSummary();


      elements
        .libraryTrigger
        .disabled =
          true;


      elements
        .libraryTriggerLabel
        .textContent =
          "No trackable formats";


      elements
        .libraryTriggerIcon
        .className =
          "ti ti-ban";


      elements
        .libraryNote
        .textContent =
          "This title has no Manga or Anime record to track.";


      return;
    }


    const trackedFormats =
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
        );


    availableFormats
      .forEach(
        (
          format
        ) => {
          elements
            .librarySummary
            .append(
              createSummaryButton(
                format
              )
            );
        }
      );


    elements
      .librarySummary
      .hidden =
        false;


    elements
      .libraryTrigger
      .disabled =
        false;


    if (
      trackedFormats
        .length
    ) {
      elements
        .libraryTriggerIcon
        .className =
          "ti ti-adjustments-horizontal";


      elements
        .libraryTriggerLabel
        .textContent =
          "Manage formats";
    } else {
      elements
        .libraryTriggerIcon
        .className =
          "ti ti-plus";


      elements
        .libraryTriggerLabel
        .textContent =
          "Add to library";
    }


    if (
      trackedFormats
        .length === 0
    ) {
      elements
        .libraryNote
        .textContent =
          availableFormats.length > 1
            ? "Manga and Anime can be saved separately."
            : `${
                FORMAT_CONFIG[
                  availableFormats[
                    0
                  ]
                ].label
              } can be saved to your library.`;
    } else if (
      trackedFormats
        .length <
      availableFormats
        .length
    ) {
      elements
        .libraryNote
        .textContent =
          "Select a format row to update it or add the other format.";
    } else {
      elements
        .libraryNote
        .textContent =
          availableFormats.length > 1
            ? "Manga and Anime are tracked separately."
            : "Select the format row to update its status.";
    }
  }


  function createSummaryButton(
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


    const statusConfig =
      getStatusConfig(
        format,
        savedStatus
      );


    const tracked =
      Boolean(
        statusConfig
      );


    const button =
      document.createElement(
        "button"
      );


    button.type =
      "button";


    button.className =
      "detail-library-summary-item";


    button
      .classList
      .toggle(
        "is-tracked",
        tracked
      );


    button
      .classList
      .toggle(
        "is-untracked",
        !tracked
      );


    button
      .dataset
      .librarySummaryFormat =
        format;


    button.setAttribute(
      "aria-label",

      tracked
        ? `Manage ${
            formatConfig.label
          }: ${
            statusConfig.label
          }`
        : `Add ${
            formatConfig.label
          } to your library`
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


    const copy =
      document.createElement(
        "span"
      );


    copy.className =
      "detail-library-summary-copy";


    const label =
      document.createElement(
        "strong"
      );


    label.textContent =
      formatConfig.label;


    const status =
      document.createElement(
        "small"
      );


    status.textContent =
      statusConfig
        ?.label ||
      "Not tracked";


    copy.append(
      label,
      status
    );


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
      copy,
      arrow
    );


    return button;
  }


  function renderUnavailableSummary() {
    elements
      .librarySummary
      .replaceChildren();


    const message =
      document.createElement(
        "div"
      );


    message.className =
      "detail-library-summary-unavailable";


    const icon =
      document.createElement(
        "i"
      );


    icon.className =
      "ti ti-ban";


    icon.setAttribute(
      "aria-hidden",
      "true"
    );


    const text =
      document.createElement(
        "span"
      );


    text.textContent =
      "No Manga or Anime information is available.";


    message.append(
      icon,
      text
    );


    elements
      .librarySummary
      .append(
        message
      );


    elements
      .librarySummary
      .hidden =
        false;
  }


  /* =======================================================
     CREATE MENU ELEMENTS
     ======================================================= */

  function createMenuButton({
    icon,
    label,
    meta =
      "",
    selected =
      false,
    trailingText =
      "",
    trailingIcon =
      "",
    danger =
      false
  }) {
    const button =
      document.createElement(
        "button"
      );


    button.type =
      "button";


    button.className =
      "detail-library-option";


    button.setAttribute(
      "role",
      "menuitem"
    );


    if (
      selected
    ) {
      button
        .classList
        .add(
          "is-selected"
        );
    }


    if (
      danger
    ) {
      button
        .classList
        .add(
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


    if (
      meta
    ) {
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


    const trailing =
      document.createElement(
        "span"
      );


    trailing.className =
      "detail-library-option-trailing";


    trailing.setAttribute(
      "aria-hidden",
      "true"
    );


    if (
      trailingIcon
    ) {
      const trailingIconElement =
        document.createElement(
          "i"
        );


      trailingIconElement.className =
        trailingIcon;


      trailing.append(
        trailingIconElement
      );
    } else {
      trailing.textContent =
        trailingText;
    }


    button.append(
      iconElement,
      copy,
      trailing
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


  /* =======================================================
     FOCUS AND KEYBOARD
     ======================================================= */

  function getMenuButtons() {
    return [
      ...elements
        .libraryMenu
        .querySelectorAll(
          "button:not([hidden]):not(:disabled)"
        )
    ];
  }


  function focusFirstOption() {
    elements
      .libraryOptions
      .querySelector(
        "button:not(:disabled)"
      )
      ?.focus();
  }


  function focusSelectedOrFirstStatus() {
    const selected =
      elements
        .libraryOptions
        .querySelector(
          '[aria-checked="true"]'
        );


    const first =
      elements
        .libraryOptions
        .querySelector(
          "button:not(:disabled)"
        );


    (
      selected ||
      first
    )
      ?.focus();
  }


  function focusSummaryButton(
    format
  ) {
    elements
      .librarySummary
      .querySelector(
        `[data-library-summary-format="${format}"]`
      )
      ?.focus();
  }


  function handleMenuKeydown(
    event
  ) {
    const buttons =
      getMenuButtons();


    if (
      !buttons.length
    ) {
      return;
    }


    const currentIndex =
      buttons.indexOf(
        document
          .activeElement
      );


    if (
      event.key ===
      "Escape"
    ) {
      event.preventDefault();


      closeEditor(
        true
      );


      return;
    }


    if (
      event.key ===
        "ArrowLeft" &&
      currentScreen ===
        "statuses"
    ) {
      event.preventDefault();


      showFormatScreen(
        true
      );


      return;
    }


    let nextIndex =
      null;


    if (
      event.key ===
      "ArrowDown"
    ) {
      nextIndex =
        currentIndex < 0
          ? 0
          : (
              currentIndex +
              1
            ) %
            buttons.length;
    } else if (
      event.key ===
      "ArrowUp"
    ) {
      nextIndex =
        currentIndex < 0
          ? buttons.length -
            1
          : (
              currentIndex -
              1 +
              buttons.length
            ) %
            buttons.length;
    } else if (
      event.key ===
      "Home"
    ) {
      nextIndex =
        0;
    } else if (
      event.key ===
      "End"
    ) {
      nextIndex =
        buttons.length -
        1;
    }


    if (
      nextIndex == null
    ) {
      return;
    }


    event.preventDefault();


    buttons[
      nextIndex
    ]
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
  return FORMAT_CONFIG[
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
    );
}


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
   LOCAL STORAGE
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


    return (
      parsedValue &&
      typeof parsedValue ===
        "object" &&
      !Array.isArray(
        parsedValue
      )
    )
      ? parsedValue
      : {};
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