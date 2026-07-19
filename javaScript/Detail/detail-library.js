// detail-library.js
// Stores one format-neutral library status for the whole story.
// The status menu uses the browser top layer when supported,
// preventing it from resizing or overflowing the hero.

const STORAGE_KEY =
  "inkwell-library";


const STATUS_CONFIG =
  Object.freeze({
    "in-progress": {
      label:
        "In progress",

      icon:
        "ti ti-progress"
    },

    completed: {
      label:
        "Completed",

      icon:
        "ti ti-circle-check"
    },

    planned: {
      label:
        "Planned",

      icon:
        "ti ti-clock-plus"
    },

    paused: {
      label:
        "Paused",

      icon:
        "ti ti-player-pause"
    },

    dropped: {
      label:
        "Dropped",

      icon:
        "ti ti-circle-minus"
    }
  });


export function createDetailLibraryController(
  elements
) {
  let currentTitle =
    null;

  let currentStatus =
    "";

  let hasBoundEvents =
    false;

  let useNativePopover =
    false;

  let returnFocusAfterClose =
    false;

  let positionFrame =
    null;


  /* =======================================================
     INITIALIZATION
     ======================================================= */

  function bindEvents() {
    if (
      hasBoundEvents
    ) {
      return;
    }


    hasBoundEvents =
      true;


    prepareMenu();


    elements
      .libraryTrigger
      .addEventListener(
        "click",
        () => {
          toggleMenu();
        }
      );


    elements
      .libraryStatusButtons
      .forEach(
        (
          button
        ) => {
          button.addEventListener(
            "click",
            () => {
              setStatus(
                button
                  .dataset
                  .libraryStatus
              );
            }
          );
        }
      );


    elements
      .libraryRemove
      .addEventListener(
        "click",
        () => {
          removeTitle();
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
          useNativePopover
        ) {
          return;
        }


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
          event.key !==
            "Escape" ||
          !isMenuOpen()
        ) {
          return;
        }


        closeMenu(
          true
        );
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


  function prepareMenu() {
    useNativePopover =
      typeof elements
        .libraryMenu
        .showPopover ===
        "function" &&

      typeof elements
        .libraryMenu
        .hidePopover ===
        "function";


    if (
      useNativePopover
    ) {
      elements
        .libraryMenu
        .setAttribute(
          "popover",
          "auto"
        );


      elements
        .libraryMenu
        .removeAttribute(
          "hidden"
        );


      elements
        .libraryMenu
        .addEventListener(
          "toggle",
          handlePopoverToggle
        );


      syncMenuState(
        false
      );


      return;
    }


    elements
      .libraryMenu
      .hidden =
        true;


    syncMenuState(
      false
    );
  }


  /* =======================================================
     CURRENT TITLE
     ======================================================= */

  function setTitle(
    title
  ) {
    currentTitle =
      title;


    currentStatus =
      readLibrary()[
        title.id
      ]
        ?.status ||
      "";


    updateInterface();
  }


  /* =======================================================
     MENU STATE
     ======================================================= */

  function isMenuOpen() {
    if (
      useNativePopover
    ) {
      try {
        return elements
          .libraryMenu
          .matches(
            ":popover-open"
          );
      } catch {
        return elements
          .libraryPicker
          .classList
          .contains(
            "is-open"
          );
      }
    }


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
      isMenuOpen()
    ) {
      return;
    }


    returnFocusAfterClose =
      false;


    elements
      .libraryMenu
      .classList
      .remove(
        "is-positioned"
      );


    if (
      useNativePopover
    ) {
      try {
        elements
          .libraryMenu
          .showPopover();
      } catch (
        error
      ) {
        console.warn(
          "Native popover could not be opened. Using fallback positioning.",
          error
        );


        useNativePopover =
          false;


        elements
          .libraryMenu
          .removeAttribute(
            "popover"
          );


        elements
          .libraryMenu
          .hidden =
            false;
      }
    } else {
      elements
        .libraryMenu
        .hidden =
          false;
    }


    positionMenu();


    syncMenuState(
      true
    );


    window
      .requestAnimationFrame(
        () => {
          positionMenu();


          const selectedButton =
            elements
              .libraryStatusButtons
              .find(
                (
                  button
                ) => {
                  return (
                    button
                      .dataset
                      .libraryStatus ===
                    currentStatus
                  );
                }
              );


          const firstButton =
            selectedButton ||
            elements
              .libraryStatusButtons[
                0
              ];


          firstButton
            ?.focus();
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


    returnFocusAfterClose =
      returnFocus;


    if (
      useNativePopover
    ) {
      try {
        elements
          .libraryMenu
          .hidePopover();


        return;
      } catch (
        error
      ) {
        console.warn(
          "Native popover could not be closed normally.",
          error
        );
      }
    }


    elements
      .libraryMenu
      .hidden =
        true;


    syncMenuState(
      false
    );


    completeMenuClose();
  }


  function handlePopoverToggle(
    event
  ) {
    const isOpen =
      event.newState ===
      "open";


    syncMenuState(
      isOpen
    );


    if (
      isOpen
    ) {
      positionMenu();

      return;
    }


    completeMenuClose();
  }


  function syncMenuState(
    isOpen
  ) {
    elements
      .libraryPicker
      .classList
      .toggle(
        "is-open",
        isOpen
      );


    elements
      .libraryTrigger
      .setAttribute(
        "aria-expanded",
        String(
          isOpen
        )
      );


    if (
      !isOpen
    ) {
      elements
        .libraryMenu
        .classList
        .remove(
          "is-positioned"
        );
    }
  }


  function completeMenuClose() {
    if (
      returnFocusAfterClose
    ) {
      elements
        .libraryTrigger
        .focus();
    }


    returnFocusAfterClose =
      false;
  }


  /* =======================================================
     POPOVER POSITION
     ======================================================= */

  function scheduleMenuPosition() {
    if (
      !isMenuOpen()
    ) {
      return;
    }


    if (
      positionFrame != null
    ) {
      window.cancelAnimationFrame(
        positionFrame
      );
    }


    positionFrame =
      window.requestAnimationFrame(
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


    const viewportWidth =
      window.innerWidth;


    const viewportHeight =
      window.innerHeight;


    const viewportMargin =
      12;


    const menuGap =
      10;


    const menuWidth =
      Math.min(
        292,

        Math.max(
          238,

          viewportWidth -
          viewportMargin *
          2
        )
      );


    elements
      .libraryMenu
      .style
      .setProperty(
        "--detail-library-menu-width",
        `${menuWidth}px`
      );


    const measuredHeight =
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
      menuWidth;


    left =
      Math.max(
        viewportMargin,

        Math.min(
          left,

          viewportWidth -
          menuWidth -
          viewportMargin
        )
      );


    let top =
      triggerRect.bottom +
      menuGap;


    const fitsBelow =
      top +
      measuredHeight <=
      viewportHeight -
      viewportMargin;


    const fitsAbove =
      triggerRect.top -
      menuGap -
      measuredHeight >=
      viewportMargin;


    if (
      !fitsBelow &&
      fitsAbove
    ) {
      top =
        triggerRect.top -
        menuGap -
        measuredHeight;
    } else {
      top =
        Math.min(
          top,

          viewportHeight -
          measuredHeight -
          viewportMargin
        );


      top =
        Math.max(
          viewportMargin,
          top
        );
    }


    elements
      .libraryMenu
      .style
      .setProperty(
        "--detail-library-menu-left",
        `${Math.round(
          left
        )}px`
      );


    elements
      .libraryMenu
      .style
      .setProperty(
        "--detail-library-menu-top",
        `${Math.round(
          top
        )}px`
      );


    elements
      .libraryMenu
      .classList
      .add(
        "is-positioned"
      );
  }


  /* =======================================================
     SAVE STATUS
     ======================================================= */

  function setStatus(
    status
  ) {
    if (
      !currentTitle ||
      !STATUS_CONFIG[
        status
      ]
    ) {
      return;
    }


    const library =
      readLibrary();


    library[
      currentTitle.id
    ] = {
      id:
        currentTitle.id,

      title:
        currentTitle.title,

      status,

      types:
        currentTitle.types,

      coverUrl:
        currentTitle.coverUrl,

      updatedAt:
        new Date()
          .toISOString()
    };


    const wasSaved =
      writeLibrary(
        library
      );


    if (
      !wasSaved
    ) {
      elements
        .libraryNote
        .textContent =
          "This browser could not save your library change.";


      closeMenu(
        true
      );


      return;
    }


    currentStatus =
      status;


    updateInterface();


    closeMenu(
      true
    );


    elements
      .libraryNote
      .textContent =
        `${
          STATUS_CONFIG[
            status
          ].label
        } — saved locally on this device.`;
  }


  /* =======================================================
     REMOVE TITLE
     ======================================================= */

  function removeTitle() {
    if (
      !currentTitle
    ) {
      return;
    }


    const library =
      readLibrary();


    delete library[
      currentTitle.id
    ];


    const wasRemoved =
      writeLibrary(
        library
      );


    if (
      !wasRemoved
    ) {
      elements
        .libraryNote
        .textContent =
          "This browser could not update your library.";


      closeMenu(
        true
      );


      return;
    }


    currentStatus =
      "";


    updateInterface();


    closeMenu(
      true
    );


    elements
      .libraryNote
      .textContent =
        "Removed from your local library.";
  }


  /* =======================================================
     INTERFACE
     ======================================================= */

  function updateInterface() {
    const selectedConfig =
      STATUS_CONFIG[
        currentStatus
      ];


    elements
      .libraryTriggerLabel
      .textContent =
        selectedConfig
          ? selectedConfig
              .label
          : "Add to library";


    elements
      .libraryTriggerIcon
      .className =
        selectedConfig
          ? selectedConfig
              .icon
          : "ti ti-plus";


    elements
      .libraryStatusButtons
      .forEach(
        (
          button
        ) => {
          const selected =
            button
              .dataset
              .libraryStatus ===
            currentStatus;


          button.setAttribute(
            "aria-checked",
            String(
              selected
            )
          );
        }
      );


    elements
      .libraryRemove
      .hidden =
        !selectedConfig;


    if (
      !selectedConfig
    ) {
      elements
        .libraryNote
        .textContent =
          "Saved locally on this device.";
    }
  }


  /* =======================================================
     KEYBOARD NAVIGATION
     ======================================================= */

  function handleMenuKeydown(
    event
  ) {
    const menuButtons = [
      ...elements
        .libraryStatusButtons,

      ...(
        elements
          .libraryRemove
          .hidden
          ? []
          : [
              elements
                .libraryRemove
            ]
      )
    ];


    if (
      !menuButtons.length
    ) {
      return;
    }


    const currentIndex =
      menuButtons.indexOf(
        document
          .activeElement
      );


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
      "Tab"
    ) {
      closeMenu();

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
            menuButtons.length;
    } else if (
      event.key ===
      "ArrowUp"
    ) {
      nextIndex =
        currentIndex < 0
          ? menuButtons.length -
            1
          : (
              currentIndex -
              1 +
              menuButtons.length
            ) %
            menuButtons.length;
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
        menuButtons.length -
        1;
    }


    if (
      nextIndex == null
    ) {
      return;
    }


    event.preventDefault();


    menuButtons[
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