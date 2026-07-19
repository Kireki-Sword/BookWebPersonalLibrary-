// detail-library.js
// Direct Manga and Anime library-status controls.
//
// The status menu:
// - Matches the search-page dropdown style.
// - Opens above or below depending on available room.
// - Stays inside the detail hero.
// - Does not cover the next major content card.
// - Closes when the page scrolls to prevent shaking.
// - Supports keyboard navigation.
// - Stores Manga and Anime independently.

const STORAGE_KEY =
  "inkwell-library";


const STYLE_ELEMENT_ID =
  "inkwell-direct-library-styles";


const STATUS_MENU_ID =
  "detail-library-status-menu";


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


  let statusMenu =
    null;


  let activeFormat =
    "";


  let activeTrigger =
    null;


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


    statusMenu =
      createStatusMenu();


    elements
      .librarySummary
      .addEventListener(
        "click",
        handleSummaryClick
      );


    elements
      .librarySummary
      .addEventListener(
        "keydown",
        handleSummaryKeydown
      );


    statusMenu
      .addEventListener(
        "click",
        handleMenuClick
      );


    statusMenu
      .addEventListener(
        "keydown",
        handleMenuKeydown
      );


    document
      .addEventListener(
        "pointerdown",
        handleDocumentPointerDown
      );


    window
      .addEventListener(
        "resize",
        handleViewportResize,
        {
          passive:
            true
        }
      );


    /*
     * Close the menu when the page scrolls.
     *
     * Repositioning a fixed menu continuously during scrolling
     * can make it shake or jump between top and bottom.
     */

    window
      .addEventListener(
        "scroll",
        handlePageScroll,
        {
          passive:
            true
        }
      );
  }


  /* =======================================================
     PREPARE THE DIRECT INTERFACE
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
     * Keep the original menu elements in the HTML so the
     * current detail-dom.js file does not need to change.
     *
     * The original elements are hidden because the new
     * interface creates its own direct status controls.
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
    closeStatusMenu();


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
     FORMAT-ROW EVENTS
     ======================================================= */

  function handleSummaryClick(
    event
  ) {
    const trigger =
      event
        .target
        .closest(
          "[data-library-status-trigger]"
        );


    if (
      !trigger
    ) {
      return;
    }


    event.preventDefault();


    event.stopPropagation();


    const format =
      trigger
        .dataset
        .libraryStatusTrigger;


    if (
      !availableFormats
        .includes(
          format
        )
    ) {
      return;
    }


    if (
      activeTrigger ===
        trigger &&
      isStatusMenuOpen()
    ) {
      closeStatusMenu({
        returnFocus:
          true
      });


      return;
    }


    openStatusMenu(
      format,
      trigger,
      "selected"
    );
  }


  function handleSummaryKeydown(
    event
  ) {
    const trigger =
      event
        .target
        .closest(
          "[data-library-status-trigger]"
        );


    if (
      !trigger
    ) {
      return;
    }


    const format =
      trigger
        .dataset
        .libraryStatusTrigger;


    if (
      !availableFormats
        .includes(
          format
        )
    ) {
      return;
    }


    if (
      event.key ===
        "ArrowDown" ||
      event.key ===
        "ArrowUp"
    ) {
      event.preventDefault();


      openStatusMenu(
        format,

        trigger,

        event.key ===
          "ArrowUp"
          ? "last"
          : "selected"
      );


      return;
    }


    if (
      event.key ===
        "Enter" ||
      event.key ===
        " "
    ) {
      event.preventDefault();


      openStatusMenu(
        format,
        trigger,
        "selected"
      );
    }
  }


  /* =======================================================
     CREATE THE FLOATING STATUS MENU
     ======================================================= */

  function createStatusMenu() {
    document
      .getElementById(
        STATUS_MENU_ID
      )
      ?.remove();


    const menu =
      document
        .createElement(
          "div"
        );


    menu.id =
      STATUS_MENU_ID;


    menu.className =
      "detail-library-status-menu";


    menu.hidden =
      true;


    menu.setAttribute(
      "role",
      "listbox"
    );


    menu.setAttribute(
      "aria-label",
      "Choose a library status"
    );


    document
      .body
      .append(
        menu
      );


    return menu;
  }


  /* =======================================================
     OPEN AND CLOSE THE STATUS MENU
     ======================================================= */

  function isStatusMenuOpen() {
    return Boolean(
      statusMenu &&
      !statusMenu.hidden
    );
  }


  function openStatusMenu(
    format,
    trigger,
    focusMode =
      "selected"
  ) {
    const formatConfig =
      FORMAT_CONFIG[
        format
      ];


    if (
      !formatConfig ||
      !statusMenu
    ) {
      return;
    }


    if (
      activeTrigger &&
      activeTrigger !==
        trigger
    ) {
      activeTrigger
        .setAttribute(
          "aria-expanded",
          "false"
        );
    }


    activeFormat =
      format;


    activeTrigger =
      trigger;


    buildStatusMenuOptions(
      format
    );


    trigger
      .setAttribute(
        "aria-expanded",
        "true"
      );


    statusMenu
      .setAttribute(
        "aria-label",
        `${formatConfig.label} library status`
      );


    statusMenu
      .style
      .visibility =
        "hidden";


    statusMenu.hidden =
      false;


    positionStatusMenu();


    window
      .requestAnimationFrame(
        () => {
          focusMenuOption(
            focusMode
          );
        }
      );
  }


  function closeStatusMenu(
    {
      returnFocus =
        false
    } = {}
  ) {
    const triggerToFocus =
      activeTrigger;


    activeTrigger
      ?.setAttribute(
        "aria-expanded",
        "false"
      );


    if (
      statusMenu
    ) {
      statusMenu.hidden =
        true;


      statusMenu
        .replaceChildren();


      statusMenu
        .style
        .visibility =
          "hidden";


      statusMenu
        .style
        .removeProperty(
          "left"
        );


      statusMenu
        .style
        .removeProperty(
          "top"
        );


      statusMenu
        .style
        .removeProperty(
          "width"
        );


      statusMenu
        .style
        .removeProperty(
          "max-height"
        );


      delete statusMenu
        .dataset
        .placement;
    }


    activeFormat =
      "";


    activeTrigger =
      null;


    if (
      returnFocus
    ) {
      triggerToFocus
        ?.focus();
    }
  }


  /* =======================================================
     BUILD THE STATUS OPTIONS
     ======================================================= */

  function buildStatusMenuOptions(
    format
  ) {
    const savedStatus =
      currentEntry
        ?.formats[
          format
        ]
        ?.status ||
      "";


    const options = [
      {
        id:
          "",

        label:
          "Not tracked"
      },

      ...FORMAT_CONFIG[
        format
      ]
        .statuses
    ];


    const fragment =
      document
        .createDocumentFragment();


    options
      .forEach(
        (
          option,
          index
        ) => {
          const selected =
            option.id ===
            savedStatus;


          const button =
            document
              .createElement(
                "button"
              );


          const label =
            document
              .createElement(
                "span"
              );


          const checkmark =
            document
              .createElement(
                "i"
              );


          button.type =
            "button";


          button.id =
            `${STATUS_MENU_ID}-option-${format}-${index}`;


          button.className =
            "detail-library-status-option";


          button
            .dataset
            .libraryStatusOption =
              option.id;


          button.setAttribute(
            "role",
            "option"
          );


          button.setAttribute(
            "aria-selected",
            String(
              selected
            )
          );


          button.tabIndex =
            -1;


          label.textContent =
            option.label;


          checkmark.className =
            "ti ti-check detail-library-status-check";


          checkmark.setAttribute(
            "aria-hidden",
            "true"
          );


          button.append(
            label,
            checkmark
          );


          fragment.append(
            button
          );
        }
      );


    statusMenu
      .replaceChildren(
        fragment
      );
  }


  /* =======================================================
     STATUS-MENU EVENTS
     ======================================================= */

  function handleMenuClick(
    event
  ) {
    const option =
      event
        .target
        .closest(
          "[data-library-status-option]"
        );


    if (
      !option ||
      !activeFormat
    ) {
      return;
    }


    event.preventDefault();


    event.stopPropagation();


    selectMenuOption(
      option
    );
  }


  function handleMenuKeydown(
    event
  ) {
    const options =
      getMenuOptions();


    if (
      !options.length
    ) {
      return;
    }


    const currentOption =
      event
        .target
        .closest(
          "[data-library-status-option]"
        );


    const currentIndex =
      Math.max(
        0,

        options
          .indexOf(
            currentOption
          )
      );


    let nextIndex =
      null;


    if (
      event.key ===
        "ArrowDown"
    ) {
      nextIndex =
        (
          currentIndex +
          1
        ) %
        options.length;
    } else if (
      event.key ===
        "ArrowUp"
    ) {
      nextIndex =
        (
          currentIndex -
          1 +
          options.length
        ) %
        options.length;
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
        options.length -
        1;
    } else if (
      event.key ===
        "Enter" ||
      event.key ===
        " "
    ) {
      event.preventDefault();


      if (
        currentOption
      ) {
        selectMenuOption(
          currentOption
        );
      }


      return;
    } else if (
      event.key ===
        "Escape"
    ) {
      event.preventDefault();


      closeStatusMenu({
        returnFocus:
          true
      });


      return;
    } else if (
      event.key ===
        "Tab"
    ) {
      closeStatusMenu();


      return;
    }


    if (
      nextIndex ===
      null
    ) {
      return;
    }


    event.preventDefault();


    options[
      nextIndex
    ]
      .focus();
  }


  function selectMenuOption(
    option
  ) {
    const format =
      activeFormat;


    const status =
      option
        .dataset
        .libraryStatusOption ||
      "";


    closeStatusMenu();


    updateFormatStatus(
      format,
      status
    );
  }


  function getMenuOptions() {
    if (
      !statusMenu
    ) {
      return [];
    }


    return [
      ...statusMenu
        .querySelectorAll(
          "[data-library-status-option]"
        )
    ];
  }


  function focusMenuOption(
    focusMode
  ) {
    const options =
      getMenuOptions();


    if (
      !options.length
    ) {
      return;
    }


    let optionToFocus =
      options[
        0
      ];


    if (
      focusMode ===
        "last"
    ) {
      optionToFocus =
        options[
          options.length -
          1
        ];
    } else {
      optionToFocus =
        options
          .find(
            (
              option
            ) => {
              return (
                option
                  .getAttribute(
                    "aria-selected"
                  ) ===
                "true"
              );
            }
          ) ||
        options[
          0
        ];
    }


    optionToFocus
      .focus();
  }


  /* =======================================================
     VIEWPORT EVENTS
     ======================================================= */

  function handleViewportResize() {
    if (
      !isStatusMenuOpen()
    ) {
      return;
    }


    positionStatusMenu();
  }


  function handlePageScroll() {
    if (
      !isStatusMenuOpen()
    ) {
      return;
    }


    /*
     * A fixed overlay can appear to shake when it is
     * continuously repositioned during scrolling.
     *
     * Closing it is more stable and matches common dropdown
     * behavior on scrolling pages.
     */

    closeStatusMenu();
  }


  /* =======================================================
     FLOATING-MENU POSITIONING
     ======================================================= */

  function positionStatusMenu() {
    if (
      !activeTrigger ||
      !statusMenu ||
      statusMenu.hidden
    ) {
      return;
    }


    const viewportPadding =
      12;


    const heroPadding =
      12;


    const menuGap =
      7;


    const minimumMenuHeight =
      72;


    const triggerRect =
      activeTrigger
        .getBoundingClientRect();


    const hero =
      activeTrigger
        .closest(
          ".detail-hero"
        );


    const heroRect =
      hero
        ?.getBoundingClientRect();


    /*
     * Use the viewport and the hero as boundaries.
     *
     * This stops the menu from extending over the separate
     * Formats and releases card below the hero.
     */

    const leftBoundary =
      Math.max(
        viewportPadding,

        heroRect
          ? heroRect.left +
            heroPadding
          : viewportPadding
      );


    const rightBoundary =
      Math.min(
        window.innerWidth -
          viewportPadding,

        heroRect
          ? heroRect.right -
            heroPadding
          : window.innerWidth -
            viewportPadding
      );


    const topBoundary =
      Math.max(
        viewportPadding,

        heroRect
          ? heroRect.top +
            heroPadding
          : viewportPadding
      );


    const bottomBoundary =
      Math.min(
        window.innerHeight -
          viewportPadding,

        heroRect
          ? heroRect.bottom -
            heroPadding
          : window.innerHeight -
            viewportPadding
      );


    const triggerIsOutsideBoundary =
      triggerRect.bottom <
        topBoundary ||
      triggerRect.top >
        bottomBoundary;


    if (
      triggerIsOutsideBoundary
    ) {
      closeStatusMenu();


      return;
    }


    const availableWidth =
      Math.max(
        0,

        rightBoundary -
          leftBoundary
      );


    if (
      availableWidth <=
        0
    ) {
      closeStatusMenu();


      return;
    }


    const preferredWidth =
      Math.max(
        triggerRect.width,
        180
      );


    const menuWidth =
      Math.min(
        preferredWidth,
        availableWidth
      );


    /*
     * Temporarily position the invisible menu so its natural
     * dimensions can be measured.
     */

    statusMenu
      .style
      .visibility =
        "hidden";


    statusMenu
      .style
      .width =
        `${menuWidth}px`;


    statusMenu
      .style
      .maxHeight =
        "320px";


    statusMenu
      .style
      .left =
        "0px";


    statusMenu
      .style
      .top =
        "0px";


    const naturalHeight =
      Math.min(
        statusMenu.scrollHeight,
        320
      );


    const spaceBelow =
      Math.max(
        0,

        bottomBoundary -
          triggerRect.bottom -
          menuGap
      );


    const spaceAbove =
      Math.max(
        0,

        triggerRect.top -
          topBoundary -
          menuGap
      );


    const comfortableHeight =
      Math.min(
        naturalHeight,
        220
      );


    let placeAbove =
      false;


    if (
      spaceBelow >=
        comfortableHeight
    ) {
      placeAbove =
        false;
    } else if (
      spaceAbove >=
        comfortableHeight
    ) {
      placeAbove =
        true;
    } else {
      placeAbove =
        spaceAbove >
        spaceBelow;
    }


    const availableHeight =
      placeAbove
        ? spaceAbove
        : spaceBelow;


    if (
      availableHeight <
        minimumMenuHeight
    ) {
      closeStatusMenu();


      return;
    }


    const finalMaximumHeight =
      Math.min(
        naturalHeight,
        availableHeight,
        320
      );


    statusMenu
      .style
      .maxHeight =
        `${finalMaximumHeight}px`;


    const menuRect =
      statusMenu
        .getBoundingClientRect();


    /*
     * Align the right edge of the menu with the trigger.
     */

    let left =
      triggerRect.right -
        menuRect.width;


    left =
      Math.max(
        leftBoundary,

        Math.min(
          left,

          rightBoundary -
            menuRect.width
        )
      );


    let top =
      placeAbove
        ? triggerRect.top -
          menuRect.height -
          menuGap
        : triggerRect.bottom +
          menuGap;


    top =
      Math.max(
        topBoundary,

        Math.min(
          top,

          bottomBoundary -
            menuRect.height
        )
      );


    statusMenu
      .dataset
      .placement =
        placeAbove
          ? "top"
          : "bottom";


    statusMenu
      .style
      .left =
        `${Math.round(
          left
        )}px`;


    statusMenu
      .style
      .top =
        `${Math.round(
          top
        )}px`;


    statusMenu
      .style
      .visibility =
        "visible";
  }


  /* =======================================================
     OUTSIDE CLICK
     ======================================================= */

  function handleDocumentPointerDown(
    event
  ) {
    if (
      !isStatusMenuOpen()
    ) {
      return;
    }


    if (
      statusMenu
        .contains(
          event.target
        )
    ) {
      return;
    }


    if (
      activeTrigger
        ?.contains(
          event.target
        )
    ) {
      return;
    }


    closeStatusMenu();
  }


  /* =======================================================
     SAVE OR REMOVE ONE FORMAT
     ======================================================= */

  function updateFormatStatus(
    format,
    status
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


      focusFormatTrigger(
        format
      );


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


      focusFormatTrigger(
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


    setLibraryNote(
      statusLabel
        ? `${formatLabel} set to ${statusLabel}.`
        : `${formatLabel} removed from your library.`
    );


    focusFormatTrigger(
      format
    );
  }


  /* =======================================================
     RENDER THE LIBRARY CARD
     ======================================================= */

  function renderInterface() {
    closeStatusMenu();


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
        availableFormats.length >
          1
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
      availableFormats.length >
        1
        ? "Manga and Anime are saved separately."
        : "Change the status whenever your progress changes."
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


    const statusLabel =
      getStatusConfig(
        format,
        savedStatus
      )
        ?.label ||
      "Not tracked";


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


    const iconElement =
      document
        .createElement(
          "i"
        );


    icon.className =
      "detail-library-direct-icon";


    icon.setAttribute(
      "aria-hidden",
      "true"
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


    const label =
      document
        .createElement(
          "strong"
        );


    const meta =
      document
        .createElement(
          "small"
        );


    copy.className =
      "detail-library-direct-copy";


    label.textContent =
      formatConfig.label;


    meta.textContent =
      savedStatus
        ? "Saved to library"
        : "Not tracked";


    copy.append(
      label,
      meta
    );


    const trigger =
      document
        .createElement(
          "button"
        );


    const triggerLabel =
      document
        .createElement(
          "span"
        );


    const chevron =
      document
        .createElement(
          "i"
        );


    trigger.type =
      "button";


    trigger.className =
      "detail-library-status-trigger";


    trigger
      .dataset
      .libraryStatusTrigger =
        format;


    trigger.setAttribute(
      "aria-haspopup",
      "listbox"
    );


    trigger.setAttribute(
      "aria-expanded",
      "false"
    );


    trigger.setAttribute(
      "aria-controls",
      STATUS_MENU_ID
    );


    trigger.setAttribute(
      "aria-label",
      `${formatConfig.label} status: ${statusLabel}`
    );


    triggerLabel.className =
      "detail-library-status-trigger-label";


    triggerLabel.textContent =
      statusLabel;


    chevron.className =
      "ti ti-chevron-down detail-library-status-chevron";


    chevron.setAttribute(
      "aria-hidden",
      "true"
    );


    trigger.append(
      triggerLabel,
      chevron
    );


    row.append(
      icon,
      copy,
      trigger
    );


    return row;
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


    const icon =
      document
        .createElement(
          "i"
        );


    const copy =
      document
        .createElement(
          "span"
        );


    emptyState.className =
      "detail-library-direct-empty";


    icon.className =
      "ti ti-book-off";


    icon.setAttribute(
      "aria-hidden",
      "true"
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
     RESTORE FOCUS AFTER SAVING
     ======================================================= */

  function focusFormatTrigger(
    format
  ) {
    window
      .requestAnimationFrame(
        () => {
          elements
            .librarySummary
            .querySelector(
              `[data-library-status-trigger="${format}"]`
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
   GET ONE STATUS CONFIGURATION
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
   NORMALIZE A STORED LIBRARY ENTRY
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
          const savedFormat =
            storedEntry
              .formats[
                format
              ];


          const status =
            savedFormat
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
                savedFormat
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
   VALIDATE ONE STATUS
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
   INSTALL THE LIBRARY CARD STYLES
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
        136px;

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
        border-color 160ms ease;
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


    .detail-library-direct-copy strong,
    .detail-library-direct-copy small {
      overflow: hidden;

      line-height: 1.2;

      text-overflow: ellipsis;

      white-space: nowrap;
    }


    .detail-library-direct-copy strong {
      color: #e5e9f7;

      font-size: 0.72rem;

      font-weight: 740;
    }


    .detail-library-direct-copy small {
      color: #7f8aa4;

      font-size: 0.6rem;

      font-weight: 620;
    }


    .detail-library-direct-row[data-tracked="true"]
    .detail-library-direct-copy small {
      color: #aeb8d1;
    }


    .detail-library-status-trigger {
      width: 136px;

      min-width: 0;

      min-height: 42px;

      display: flex;

      align-items: center;

      justify-content: space-between;

      gap: 0.55rem;

      padding:
        0.58rem
        0.68rem
        0.58rem
        0.72rem;

      overflow: hidden;

      color: #e9edfb;

      background:
        linear-gradient(
          180deg,
          rgba(124, 140, 255, 0.14),
          rgba(124, 140, 255, 0.065)
        );

      border:
        1px solid
        rgba(187, 196, 255, 0.2);

      border-radius: 10px;

      outline: none;

      font-family:
        var(
          --font-body,
          system-ui,
          sans-serif
        );

      font-size: 0.68rem;

      font-weight: 720;

      line-height: 1.2;

      cursor: pointer;

      box-shadow:
        inset 0 1px 0
        rgba(255, 255, 255, 0.035);

      transition:
        color 150ms ease,
        background 150ms ease,
        border-color 150ms ease,
        box-shadow 150ms ease;
    }


    .detail-library-status-trigger:hover {
      color: #ffffff;

      background:
        linear-gradient(
          180deg,
          rgba(124, 140, 255, 0.2),
          rgba(124, 140, 255, 0.09)
        );

      border-color:
        rgba(187, 196, 255, 0.33);
    }


    .detail-library-status-trigger:focus-visible,
    .detail-library-status-trigger[aria-expanded="true"] {
      color: #ffffff;

      background:
        linear-gradient(
          180deg,
          rgba(124, 140, 255, 0.2),
          rgba(124, 140, 255, 0.09)
        );

      border-color:
        rgba(114, 215, 255, 0.72);

      box-shadow:
        0 0 0 3px
        rgba(114, 215, 255, 0.12),

        0 10px 25px
        rgba(0, 0, 0, 0.25);
    }


    .detail-library-status-trigger-label {
      min-width: 0;

      overflow: hidden;

      text-align: left;

      text-overflow: ellipsis;

      white-space: nowrap;
    }


    .detail-library-status-chevron {
      flex: 0 0 auto;

      color: #8e9ab7;

      font-size: 0.72rem;

      transition:
        color 150ms ease,
        transform 150ms ease;
    }


    .detail-library-status-trigger:hover
    .detail-library-status-chevron,
    .detail-library-status-trigger:focus-visible
    .detail-library-status-chevron {
      color: #bdc7e5;
    }


    .detail-library-status-trigger[aria-expanded="true"]
    .detail-library-status-chevron {
      color: #72d7ff;

      transform:
        rotate(180deg);
    }


    .detail-library-status-menu {
      position: fixed;

      z-index: 10000;

      display: grid;

      gap: 3px;

      padding: 6px;

      overflow-x: hidden;
      overflow-y: auto;

      overscroll-behavior: contain;

      scrollbar-width: thin;

      color: #dfe5f7;

      background:
        radial-gradient(
          circle at 20% 0%,
          rgba(124, 140, 255, 0.13),
          transparent 42%
        ),

        linear-gradient(
          145deg,
          #121a34,
          #0a1023
        );

      border:
        1px solid
        rgba(187, 196, 255, 0.24);

      border-radius: 12px;

      box-shadow:
        0 22px 52px
        rgba(0, 0, 0, 0.48),

        inset 0 1px 0
        rgba(255, 255, 255, 0.045);
    }


    .detail-library-status-menu[hidden] {
      display: none !important;
    }


    .detail-library-status-menu[data-placement="bottom"] {
      transform-origin:
        top right;

      animation:
        detail-library-menu-in-bottom
        120ms
        ease-out;
    }


    .detail-library-status-menu[data-placement="top"] {
      transform-origin:
        bottom right;

      animation:
        detail-library-menu-in-top
        120ms
        ease-out;
    }


    @keyframes detail-library-menu-in-bottom {
      from {
        opacity: 0;

        transform:
          translateY(-5px)
          scale(0.985);
      }

      to {
        opacity: 1;

        transform:
          translateY(0)
          scale(1);
      }
    }


    @keyframes detail-library-menu-in-top {
      from {
        opacity: 0;

        transform:
          translateY(5px)
          scale(0.985);
      }

      to {
        opacity: 1;

        transform:
          translateY(0)
          scale(1);
      }
    }


    .detail-library-status-option {
      width: 100%;

      min-height: 40px;

      display: flex;

      align-items: center;

      justify-content: space-between;

      gap: 0.75rem;

      padding:
        0.58rem
        0.68rem;

      color: #c7d0e7;

      background:
        transparent;

      border: 0;

      border-radius: 8px;

      outline: none;

      font-family:
        var(
          --font-body,
          system-ui,
          sans-serif
        );

      font-size: 0.68rem;

      font-weight: 680;

      line-height: 1.2;

      text-align: left;

      cursor: pointer;

      transition:
        color 100ms ease,
        background 100ms ease;
    }


    .detail-library-status-option:hover,
    .detail-library-status-option:focus-visible {
      color: #ffffff;

      background:
        rgba(124, 140, 255, 0.12);
    }


    .detail-library-status-option[aria-selected="true"] {
      color: #ffffff;

      background:
        linear-gradient(
          135deg,
          rgba(124, 140, 255, 0.25),
          rgba(82, 105, 218, 0.2)
        );

      font-weight: 760;
    }


    .detail-library-status-check {
      flex: 0 0 auto;

      color: transparent;

      font-size: 0.9rem;

      font-weight: 850;
    }


    .detail-library-status-option[aria-selected="true"]
    .detail-library-status-check {
      color: #72d7ff;
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


      .detail-library-status-trigger {
        grid-column: 2;

        width: 100%;
      }
    }


    @media (prefers-reduced-motion: reduce) {
      .detail-library-direct-row,
      .detail-library-status-trigger,
      .detail-library-status-chevron,
      .detail-library-status-menu,
      .detail-library-status-option {
        animation:
          none !important;

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