// detail-library.js
// Tracks Manga and Anime separately for the same overall story.

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
  let currentTitle =
    null;

  let currentEntry =
    null;

  let availableFormats =
    [];

  let activeFormat =
    "";

  let currentScreen =
    "formats";

  let hasBoundEvents =
    false;

  let positionFrame =
    null;


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
        (
          event
        ) => {
          event.stopPropagation();


          toggleMenu();
        }
      );


    elements
      .libraryMenuBack
      .addEventListener(
        "click",
        () => {
          showFormatScreen(
            true
          );
        }
      );


    elements
      .libraryOptions
      .addEventListener(
        "click",
        handleOptionClick
      );


    elements
      .librarySummary
      .addEventListener(
        "click",
        (
          event
        ) => {
          event.stopPropagation();


          handleSummaryClick(
            event
          );
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
      (
        event
      ) => {
        if (
          !elements
            .libraryPicker
            .contains(
              event.target
            )
        ) {
          closeMenu();
        }
      }
    );


    document.addEventListener(
      "keydown",
      (
        event
      ) => {
        if (
          event.key ===
            "Escape" &&
          isMenuOpen()
        ) {
          event.preventDefault();


          closeMenu(
            true
          );
        }
      }
    );


    window.addEventListener(
      "resize",
      scheduleMenuPosition
    );


    window.addEventListener(
      "scroll",
      scheduleMenuPosition,
      true
    );
  }


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

        title
      );


    activeFormat =
      "";


    currentScreen =
      "formats";


    updateInterface();


    showFormatScreen(
      false
    );
  }


  function isMenuOpen() {
    return !elements
      .libraryMenu
      .hidden;
  }


  function toggleMenu() {
    if (
      isMenuOpen()
    ) {
      closeMenu();
    } else {
      openMenu();
    }
  }


  function openMenu() {
    if (
      !currentTitle ||
      !availableFormats
        .length ||
      isMenuOpen()
    ) {
      return;
    }


    showFormatScreen(
      false
    );


    elements
      .libraryMenu
      .hidden =
        false;


    elements
      .libraryPicker
      .classList
      .add(
        "is-open"
      );


    elements
      .libraryTrigger
      .setAttribute(
        "aria-expanded",
        "true"
      );


    window
      .requestAnimationFrame(
        () => {
          positionMenu();


          focusFirstMenuButton();
        }
      );
  }


  function closeMenu(
    returnFocus =
      false
  ) {
    if (
      !isMenuOpen()
    ) {
      return;
    }


    elements
      .libraryMenu
      .hidden =
        true;


    elements
      .libraryPicker
      .classList
      .remove(
        "is-open"
      );


    elements
      .libraryTrigger
      .setAttribute(
        "aria-expanded",
        "false"
      );


    elements
      .libraryMenu
      .classList
      .remove(
        "is-positioned"
      );


    if (
      returnFocus
    ) {
      elements
        .libraryTrigger
        .focus();
    }
  }


  function showFormatScreen(
    moveFocus
  ) {
    activeFormat =
      "";


    currentScreen =
      "formats";


    elements
      .libraryMenuBack
      .hidden =
        true;


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
          const config =
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


          elements
            .libraryOptions
            .append(
              createMenuButton({
                action:
                  "choose-format",

                value:
                  format,

                icon:
                  config.icon,

                label:
                  config.label,

                meta:
                  savedStatusConfig
                    ?.label ||
                  "Not tracked",

                selected:
                  Boolean(
                    savedStatus
                  )
              })
            );
        }
      );


    scheduleMenuPosition();


    if (
      moveFocus
    ) {
      window
        .requestAnimationFrame(
          focusFirstMenuButton
        );
    }
  }


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


    activeFormat =
      format;


    currentScreen =
      "statuses";


    const config =
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


    elements
      .libraryMenuBack
      .hidden =
        false;


    elements
      .libraryMenuEyebrow
      .textContent =
        config.label;


    elements
      .libraryMenuTitle
      .textContent =
        `Choose your ${
          config.label
            .toLowerCase()
        } status`;


    elements
      .libraryOptions
      .replaceChildren();


    config
      .statuses
      .forEach(
        (
          status
        ) => {
          elements
            .libraryOptions
            .append(
              createMenuButton({
                action:
                  "choose-status",

                value:
                  status.id,

                icon:
                  status.icon,

                label:
                  status.label,

                selected:
                  savedStatus ===
                  status.id
              })
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


      elements
        .libraryOptions
        .append(
          createMenuButton({
            action:
              "remove-format",

            value:
              format,

            icon:
              "ti ti-trash",

            label:
              `Remove ${
                config.label
              }`,

            danger:
              true
          })
        );
    }


    scheduleMenuPosition();


    if (
      moveFocus
    ) {
      window
        .requestAnimationFrame(
          focusFirstMenuButton
        );
    }
  }


  function handleOptionClick(
    event
  ) {
    const button =
      event
        .target
        .closest(
          "[data-library-action]"
        );


    if (
      !button
    ) {
      return;
    }


    const action =
      button
        .dataset
        .libraryAction;


    const value =
      button
        .dataset
        .libraryValue;


    if (
      action ===
      "choose-format"
    ) {
      showStatusScreen(
        value
      );


      return;
    }


    if (
      action ===
      "choose-status"
    ) {
      saveFormatStatus(
        activeFormat,
        value
      );


      return;
    }


    if (
      action ===
      "remove-format"
    ) {
      removeFormat(
        value
      );
    }
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


    if (
      !isMenuOpen()
    ) {
      elements
        .libraryMenu
        .hidden =
          false;


      elements
        .libraryPicker
        .classList
        .add(
          "is-open"
        );


      elements
        .libraryTrigger
        .setAttribute(
          "aria-expanded",
          "true"
        );
    }


    showStatusScreen(
      format
    );


    scheduleMenuPosition();
  }


  function saveFormatStatus(
    format,
    status
  ) {
    const config =
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
      !config ||
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

        currentTitle
      );


    entry
      .formats[
        format
      ] = {
        status,

        updatedAt:
          new Date()
            .toISOString()
      };


    entry.updatedAt =
      new Date()
        .toISOString();


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
          config.label
        } · ${
          statusConfig.label
        } saved.`;


    showFormatScreen(
      false
    );


    window
      .requestAnimationFrame(
        () => {
          positionMenu();


          focusFormatButton(
            format
          );
        }
      );
  }


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

        currentTitle
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

        currentTitle
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


    showFormatScreen(
      false
    );


    window
      .requestAnimationFrame(
        () => {
          positionMenu();


          focusFormatButton(
            format
          );
        }
      );
  }


  function updateInterface() {
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


    elements
      .librarySummary
      .replaceChildren();


    trackedFormats
      .forEach(
        (
          format
        ) => {
          const config =
            FORMAT_CONFIG[
              format
            ];


          const status =
            currentEntry
              .formats[
                format
              ]
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


          button.type =
            "button";


          button.className =
            "detail-library-summary-item";


          button
            .dataset
            .librarySummaryFormat =
              format;


          button.setAttribute(
            "aria-label",

            `Manage ${
              config.label
            }: ${
              statusConfig
                ?.label ||
              status
            }`
          );


          const icon =
            document.createElement(
              "i"
            );


          icon.className =
            config.icon;


          icon.setAttribute(
            "aria-hidden",
            "true"
          );


          const text =
            document.createElement(
              "span"
            );


          text.textContent =
            `${
              config.label
            } · ${
              statusConfig
                ?.label ||
              status
            }`;


          button.append(
            icon,
            text
          );


          elements
            .librarySummary
            .append(
              button
            );
        }
      );


    elements
      .librarySummary
      .hidden =
        trackedFormats
          .length === 0;


    if (
      !availableFormats
        .length
    ) {
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
          "This title has no manga or anime record to track.";


      return;
    }


    elements
      .libraryTrigger
      .disabled =
        false;


    elements
      .libraryTriggerIcon
      .className =
        trackedFormats.length
          ? "ti ti-books"
          : "ti ti-plus";


    if (
      trackedFormats
        .length === 0
    ) {
      elements
        .libraryTriggerLabel
        .textContent =
          "Add to library";


      elements
        .libraryNote
        .textContent =
          "Choose Manga or Anime, then choose its status.";
    } else if (
      trackedFormats
        .length === 1
    ) {
      elements
        .libraryTriggerLabel
        .textContent =
          "1 format tracked";
    } else {
      elements
        .libraryTriggerLabel
        .textContent =
          `${
            trackedFormats.length
          } formats tracked`;
    }
  }


  function createMenuButton({
    action,
    value,
    icon,
    label,
    meta =
      "",
    selected =
      false,
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


    button
      .dataset
      .libraryAction =
        action;


    button
      .dataset
      .libraryValue =
        value;


    button.setAttribute(
      "role",

      action ===
        "choose-status"
        ? "menuitemradio"
        : "menuitem"
    );


    if (
      action ===
      "choose-status"
    ) {
      button.setAttribute(
        "aria-checked",
        String(
          selected
        )
      );
    }


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


    trailing.textContent =
      selected
        ? "✓"
        : action ===
          "choose-format"
          ? "→"
          : "";


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


  function getMenuButtons() {
    return [
      ...elements
        .libraryMenu
        .querySelectorAll(
          "button:not([hidden]):not(:disabled)"
        )
    ];
  }


  function focusFirstMenuButton() {
    getMenuButtons()[
      0
    ]
      ?.focus();
  }


  function focusFormatButton(
    format
  ) {
    elements
      .libraryOptions
      .querySelector(
        `[data-library-action="choose-format"][data-library-value="${format}"]`
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
        document.activeElement
      );


    let nextIndex =
      null;


    if (
      event.key ===
      "Escape"
    ) {
      event.preventDefault();


      closeMenu(
        true
      );


      return;
    }


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
    } else if (
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


  function scheduleMenuPosition() {
    if (
      !isMenuOpen()
    ) {
      return;
    }


    if (
      positionFrame != null
    ) {
      window
        .cancelAnimationFrame(
          positionFrame
        );
    }


    positionFrame =
      window
        .requestAnimationFrame(
          () => {
            positionFrame =
              null;


            positionMenu();
          }
        );
  }


  function positionMenu() {
    if (
      !isMenuOpen()
    ) {
      return;
    }


    const triggerRect =
      elements
        .libraryTrigger
        .getBoundingClientRect();


    const viewportMargin =
      12;


    const gap =
      10;


    const viewportWidth =
      window.innerWidth;


    const viewportHeight =
      window.innerHeight;


    const width =
      Math.min(
        340,

        Math.max(
          270,

          viewportWidth -
          viewportMargin *
          2
        )
      );


    elements
      .libraryMenu
      .style
      .width =
        `${width}px`;


    const menuHeight =
      Math.min(
        elements
          .libraryMenu
          .scrollHeight,

        viewportHeight -
        viewportMargin *
        2
      );


    let left =
      triggerRect.right -
      width;


    left =
      Math.max(
        viewportMargin,

        Math.min(
          left,

          viewportWidth -
          width -
          viewportMargin
        )
      );


    let top =
      triggerRect.bottom +
      gap;


    const fitsBelow =
      top +
      menuHeight <=
      viewportHeight -
      viewportMargin;


    const fitsAbove =
      triggerRect.top -
      gap -
      menuHeight >=
      viewportMargin;


    if (
      !fitsBelow &&
      fitsAbove
    ) {
      top =
        triggerRect.top -
        gap -
        menuHeight;


      elements
        .libraryMenu
        .dataset
        .placement =
          "top";
    } else {
      top =
        Math.max(
          viewportMargin,

          Math.min(
            top,

            viewportHeight -
            menuHeight -
            viewportMargin
          )
        );


      elements
        .libraryMenu
        .dataset
        .placement =
          "bottom";
    }


    elements
      .libraryMenu
      .style
      .left =
        `${
          Math.round(
            left
          )
        }px`;


    elements
      .libraryMenu
      .style
      .top =
        `${
          Math.round(
            top
          )
        }px`;


    elements
      .libraryMenu
      .classList
      .add(
        "is-positioned"
      );
  }


  return {
    bindEvents,
    setTitle
  };
}


function normalizeStoredEntry(
  storedEntry,
  title
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