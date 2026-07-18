// detail-library.js
// Handles localStorage, library statuses, and the library menu.

import {
  getMediaMode
} from "./detail-data.js";


/* =========================================================
   CONFIGURATION
   ========================================================= */

const LIBRARY_STORAGE_KEY =
  "inkwell-library-v1";


/* =========================================================
   LIBRARY CONTROLLER
   ========================================================= */

export function createDetailLibraryController(
  elements
) {
  let currentTitle =
    null;

  let menuOpen =
    false;


  /* =======================================================
     TITLE SETUP
     ======================================================= */

  function setTitle(title) {
    currentTitle =
      title;

    configureProgressStatus();
    synchronizeInterface();
  }


  /* =======================================================
     EVENTS
     ======================================================= */

  function bindEvents() {
    elements.libraryTrigger.addEventListener(
      "click",
      () => {
        if (menuOpen) {
          closeMenu();
        } else {
          openMenu();
        }
      }
    );


    /*
      Enter and Space already activate a normal button click.

      We only add Arrow Up and Arrow Down here so keyboard
      users can open the menu and immediately enter it.
    */

    elements.libraryTrigger.addEventListener(
      "keydown",
      (event) => {
        if (
          event.key ===
            "ArrowDown" ||
          event.key ===
            "ArrowUp"
        ) {
          event.preventDefault();

          openMenu(
            true,
            event.key ===
              "ArrowUp"
          );
        }
      }
    );


    elements.libraryStatusButtons
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            saveCurrentTitle(
              button.dataset
                .libraryStatus
            );
          }
        );
      });


    elements.libraryRemove.addEventListener(
      "click",
      removeCurrentTitle
    );


    elements.libraryMenu.addEventListener(
      "keydown",
      handleMenuKeydown
    );


    document.addEventListener(
      "click",
      (event) => {
        if (
          !event.target.closest(
            "[data-detail-library-picker]"
          )
        ) {
          closeMenu();
        }
      }
    );


    document.addEventListener(
      "keydown",
      (event) => {
        if (
          event.key ===
            "Escape" &&
          menuOpen
        ) {
          closeMenu(
            true
          );
        }
      }
    );
  }


  /* =======================================================
     MEDIA STATUS WORDS
     ======================================================= */

  function configureProgressStatus() {
    if (!currentTitle) {
      return;
    }

    const mediaMode =
      getMediaMode(
        currentTitle.types
      );

    if (
      mediaMode ===
      "anime"
    ) {
      elements
        .progressStatusLabel
        .textContent =
          "Watching";

      return;
    }

    if (
      mediaMode ===
      "game"
    ) {
      elements
        .progressStatusLabel
        .textContent =
          "Playing";

      return;
    }

    elements
      .progressStatusLabel
      .textContent =
        "Reading";
  }


  function getLibraryStatusLabel(
    status
  ) {
    const mediaMode =
      currentTitle
        ? getMediaMode(
            currentTitle.types
          )
        : "manga";

    const inProgressLabel =
      mediaMode === "anime"
        ? "Watching"
        : mediaMode === "game"
          ? "Playing"
          : "Reading";

    const labels = {
      "in-progress":
        inProgressLabel,

      completed:
        "Completed",

      planned:
        "Planned",

      paused:
        "Paused",

      dropped:
        "Dropped"
    };

    return (
      labels[status] ||
      "In library"
    );
  }


  /* =======================================================
     LOCAL STORAGE
     ======================================================= */

  function readLibrary() {
    try {
      const storedValue =
        window.localStorage.getItem(
          LIBRARY_STORAGE_KEY
        );

      if (!storedValue) {
        return [];
      }

      const parsedValue =
        JSON.parse(
          storedValue
        );

      return Array.isArray(
        parsedValue
      )
        ? parsedValue
        : [];
    } catch (error) {
      console.error(
        "Could not read the local library:",
        error
      );

      return [];
    }
  }


  function writeLibrary(items) {
    try {
      window.localStorage.setItem(
        LIBRARY_STORAGE_KEY,
        JSON.stringify(
          items
        )
      );

      return true;
    } catch (error) {
      console.error(
        "Could not save the local library:",
        error
      );

      return false;
    }
  }


  function findCurrentLibraryItem() {
    if (!currentTitle) {
      return null;
    }

    return (
      readLibrary().find((item) => {
        return (
          String(item.id) ===
          String(
            currentTitle.id
          )
        );
      }) ||
      null
    );
  }


  /* =======================================================
     SAVE TITLE
     ======================================================= */

  function saveCurrentTitle(status) {
    if (!currentTitle) {
      return;
    }

    const library =
      readLibrary();

    const existingIndex =
      library.findIndex((item) => {
        return (
          String(item.id) ===
          String(
            currentTitle.id
          )
        );
      });

    const existingItem =
      existingIndex >= 0
        ? library[
            existingIndex
          ]
        : null;

    const libraryItem = {
      id:
        currentTitle.id,

      title:
        currentTitle.title,

      creator:
        currentTitle.creator,

      type: [
        ...currentTitle.types
      ],

      genres: [
        ...currentTitle.genres
      ],

      coverUrl:
        currentTitle.coverUrl,

      status,

      addedAt:
        existingItem?.addedAt ||
        Date.now(),

      updatedAt:
        Date.now()
    };

    if (
      existingIndex >= 0
    ) {
      library[
        existingIndex
      ] = libraryItem;
    } else {
      library.push(
        libraryItem
      );
    }

    const saved =
      writeLibrary(
        library
      );

    elements.libraryNote.textContent =
      saved
        ? `${currentTitle.title} was saved as ${getLibraryStatusLabel(
            status
          )}.`
        : "Your browser prevented this title from being saved.";

    synchronizeInterface();
    closeMenu();
  }


  /* =======================================================
     REMOVE TITLE
     ======================================================= */

  function removeCurrentTitle() {
    if (!currentTitle) {
      return;
    }

    const filteredLibrary =
      readLibrary().filter((item) => {
        return (
          String(item.id) !==
          String(
            currentTitle.id
          )
        );
      });

    const saved =
      writeLibrary(
        filteredLibrary
      );

    elements.libraryNote.textContent =
      saved
        ? `${currentTitle.title} was removed from your library.`
        : "Your browser prevented this change from being saved.";

    synchronizeInterface();
    closeMenu();
  }


  /* =======================================================
     UPDATE VISIBLE LIBRARY CONTROLS
     ======================================================= */

  function synchronizeInterface() {
    const savedItem =
      findCurrentLibraryItem();

    elements.libraryStatusButtons
      .forEach((button) => {
        const selected =
          Boolean(
            savedItem &&
            button.dataset
              .libraryStatus ===
              savedItem.status
          );

        button.setAttribute(
          "aria-checked",
          String(
            selected
          )
        );
      });

    elements.libraryRemove.hidden =
      !savedItem;

    if (!savedItem) {
      elements.libraryTriggerIcon.className =
        "ti ti-plus";

      elements.libraryTriggerLabel.textContent =
        "Add to library";

      return;
    }

    elements.libraryTriggerIcon.className =
      "ti ti-check";

    elements.libraryTriggerLabel.textContent =
      `In library · ${
        getLibraryStatusLabel(
          savedItem.status
        )
      }`;
  }


  /* =======================================================
     OPEN AND CLOSE MENU
     ======================================================= */

  function openMenu(
    focusFirstItem = false,
    focusLastItem = false
  ) {
    menuOpen =
      true;

    elements.libraryPicker.classList.add(
      "is-open"
    );

    elements.libraryMenu.hidden =
      false;

    elements.libraryTrigger.setAttribute(
      "aria-expanded",
      "true"
    );

    if (!focusFirstItem) {
      return;
    }

    const menuButtons =
      getVisibleMenuButtons();

    if (!menuButtons.length) {
      return;
    }

    if (focusLastItem) {
      menuButtons[
        menuButtons.length - 1
      ].focus();

      return;
    }

    const selectedButton =
      elements.libraryStatusButtons
        .find((button) => {
          return (
            button.getAttribute(
              "aria-checked"
            ) === "true"
          );
        });

    (
      selectedButton ||
      menuButtons[0]
    ).focus();
  }


  function closeMenu(
    returnFocus = false
  ) {
    if (!menuOpen) {
      return;
    }

    menuOpen =
      false;

    elements.libraryPicker.classList.remove(
      "is-open"
    );

    elements.libraryMenu.hidden =
      true;

    elements.libraryTrigger.setAttribute(
      "aria-expanded",
      "false"
    );

    if (returnFocus) {
      elements.libraryTrigger.focus();
    }
  }


  function getVisibleMenuButtons() {
    return [
      ...elements.libraryMenu
        .querySelectorAll(
          "button:not([hidden])"
        )
    ];
  }


  /* =======================================================
     MENU KEYBOARD NAVIGATION
     ======================================================= */

  function handleMenuKeydown(event) {
    const menuButtons =
      getVisibleMenuButtons();

    if (!menuButtons.length) {
      return;
    }

    const currentIndex =
      menuButtons.indexOf(
        document.activeElement
      );

    if (
      event.key ===
      "ArrowDown"
    ) {
      event.preventDefault();

      const nextIndex =
        currentIndex < 0
          ? 0
          : (
              currentIndex +
              1
            ) %
            menuButtons.length;

      menuButtons[
        nextIndex
      ].focus();

      return;
    }

    if (
      event.key ===
      "ArrowUp"
    ) {
      event.preventDefault();

      const previousIndex =
        currentIndex <= 0
          ? menuButtons.length - 1
          : currentIndex - 1;

      menuButtons[
        previousIndex
      ].focus();

      return;
    }

    if (
      event.key ===
      "Home"
    ) {
      event.preventDefault();

      menuButtons[0].focus();

      return;
    }

    if (
      event.key ===
      "End"
    ) {
      event.preventDefault();

      menuButtons[
        menuButtons.length - 1
      ].focus();

      return;
    }

    if (
      event.key ===
      "Escape"
    ) {
      event.preventDefault();

      closeMenu(
        true
      );
    }
  }


  /* =======================================================
     PUBLIC FUNCTIONS
     ======================================================= */

  return {
    bindEvents,
    setTitle,
    synchronizeInterface,
    closeMenu
  };
}