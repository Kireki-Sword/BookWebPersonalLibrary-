// detail-library.js
// Stores one format-neutral library status for the whole story.

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


/* =========================================================
   LIBRARY CONTROLLER
   ========================================================= */

export function createDetailLibraryController(
  elements
) {
  let currentTitle =
    null;


  let currentStatus =
    "";


  let hasBoundEvents =
    false;


  /* =======================================================
     BIND EVENTS
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
          "Escape"
        ) {
          closeMenu(
            true
          );
        }
      }
    );
  }


  /* =======================================================
     SET CURRENT TITLE
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
     MENU CONTROLS
     ======================================================= */

  function toggleMenu() {
    const isOpen =
      elements
        .libraryTrigger
        .getAttribute(
          "aria-expanded"
        ) ===
      "true";


    if (
      isOpen
    ) {
      closeMenu();
    } else {
      openMenu();
    }
  }


  function openMenu() {
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


    window
      .requestAnimationFrame(
        () => {
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
      elements
        .libraryMenu
        .hidden
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


    if (
      returnFocus
    ) {
      elements
        .libraryTrigger
        .focus();
    }
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
     UPDATE LIBRARY INTERFACE
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
      nextIndex != null
    ) {
      event.preventDefault();


      menuButtons[
        nextIndex
      ]
        ?.focus();
    }
  }


  return {
    bindEvents,
    setTitle
  };
}


/* =========================================================
   READ LIBRARY
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


/* =========================================================
   WRITE LIBRARY
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