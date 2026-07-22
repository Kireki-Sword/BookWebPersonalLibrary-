// detail-library.js
// Manages Manga and Anime library statuses with a stable modal editor.
//
// This version keeps the current detail-page HTML and localStorage shape.
// The old in-card picker is hidden, each format becomes one full-width row,
// and status editing happens inside a native <dialog>.

const STORAGE_KEY = "inkwell-library";
const DIALOG_ID = "detail-library-status-dialog";
const TOAST_REGION_ID = "detail-library-toast-region";

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
        label: "Reading"
      },

      {
        id: "completed",
        label: "Completed"
      },

      {
        id: "plan-to-read",
        label: "Plan to read"
      },

      {
        id: "paused",
        label: "Paused"
      },

      {
        id: "dropped",
        label: "Dropped"
      }
    ]
  },

  anime: {
    label: "Anime",
    icon: "ti ti-device-tv",

    statuses: [
      {
        id: "watching",
        label: "Watching"
      },

      {
        id: "completed",
        label: "Completed"
      },

      {
        id: "plan-to-watch",
        label: "Plan to watch"
      },

      {
        id: "paused",
        label: "Paused"
      },

      {
        id: "dropped",
        label: "Dropped"
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

  let dialogElements =
    null;

  let editorFormat =
    "";

  let draftStatus =
    "";

  let initialStatus =
    "";

  let isSaving =
    false;

  let returnTrigger =
    null;

  let restoreFocusOnClose =
    true;

  let noteTimer =
    null;

  let toastRegion =
    null;


  /* =======================================================
     STARTUP
     ======================================================= */

  function bindEvents() {
    if (
      hasBoundEvents
    ) {
      return;
    }

    hasBoundEvents =
      true;

    prepareInterface();

    dialogElements =
      createStatusDialog();

    toastRegion =
      createToastRegion();

    toastRegion
      .addEventListener(
        "click",
        handleToastClick
      );

    elements
      .librarySummary
.addEventListener(
        "click",
        handleSummaryClick
      );

    dialogElements
      .options
.addEventListener(
        "change",
        handleDialogStatusChange
      );

    dialogElements
      .closeButton
.addEventListener(
        "click",
        () => {
          closeEditor({
            result:
              "cancel",

            restoreFocus:
              true
          });
        }
      );

    dialogElements
      .cancelButton
.addEventListener(
        "click",
        () => {
          closeEditor({
            result:
              "cancel",

            restoreFocus:
              true
          });
        }
      );

    dialogElements
      .saveButton
.addEventListener(
        "click",
        handleSaveClick
      );

    dialogElements
      .dialog
.addEventListener(
        "cancel",
        handleDialogCancel
      );

    dialogElements
      .dialog
.addEventListener(
        "click",
        handleDialogBackdropClick
      );

    dialogElements
      .dialog
.addEventListener(
        "close",
        handleDialogClose
      );
  }


  /* =======================================================
     PREPARE THE EXISTING CARD
     ======================================================= */

  function prepareInterface() {
    libraryBlock
      ?.classList
      .add(
        "is-dialog-library"
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

    elements
      .librarySummary
      .setAttribute(
        "aria-label",
        "Library status by format"
      );

    /*
     * Keep these legacy elements in the HTML because
     * detail-dom.js currently requires them.
     *
     * The new interface does not use them.
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

    clearLibraryNote();
  }


  /* =======================================================
     TITLE SETUP
     ======================================================= */

  function setTitle(
    title
  ) {
    closeEditor({
      result:
        "title-change",

      restoreFocus:
        false
    });

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

    clearLibraryNote();

    renderInterface();
  }


  /* =======================================================
     LIBRARY CARD EVENTS
     ======================================================= */

  function handleSummaryClick(
    event
  ) {
    const button =
      event
        .target
        .closest(
          "[data-library-format-button]"
        );

    if (
      !button
    ) {
      return;
    }

    const format =
      button
        .dataset
        .libraryFormatButton;

    if (
      !availableFormats
.includes(
          format
        )
    ) {
      return;
    }

    openEditor(
      format,
      button
    );
  }


  /* =======================================================
     DIALOG CREATION
     ======================================================= */

  function createStatusDialog() {
    document
.getElementById(
        DIALOG_ID
      )
      ?.remove();

    const dialog =
      document
.createElement(
          "dialog"
        );

    const surface =
      document
.createElement(
          "div"
        );

    const header =
      document
.createElement(
          "header"
        );

    const headingIcon =
      document
.createElement(
          "span"
        );

    const headingIconElement =
      document
.createElement(
          "i"
        );

    const headingCopy =
      document
.createElement(
          "div"
        );

    const eyebrow =
      document
.createElement(
          "span"
        );

    const title =
      document
.createElement(
          "h2"
        );

    const context =
      document
.createElement(
          "p"
        );

    const closeButton =
      document
.createElement(
          "button"
        );

    const closeIcon =
      document
.createElement(
          "i"
        );

    const description =
      document
.createElement(
          "p"
        );

    const options =
      document
.createElement(
          "fieldset"
        );

    const legend =
      document
.createElement(
          "legend"
        );

    const actions =
      document
.createElement(
          "footer"
        );

    const cancelButton =
      document
.createElement(
          "button"
        );

    const saveButton =
      document
.createElement(
          "button"
        );

    dialog.id =
      DIALOG_ID;

    dialog.className =
      "detail-library-dialog";

    dialog.setAttribute(
      "aria-labelledby",
      `${DIALOG_ID}-title`
    );

    dialog.setAttribute(
      "aria-describedby",
      `${DIALOG_ID}-description`
    );

    surface.className =
      "detail-library-dialog-surface";

    header.className =
      "detail-library-dialog-header";

    headingIcon.className =
      "detail-library-dialog-icon";

    headingIcon.setAttribute(
      "aria-hidden",
      "true"
    );

    headingIconElement.className =
      "ti ti-books";

    headingIcon.append(
      headingIconElement
    );

    headingCopy.className =
      "detail-library-dialog-heading";

    eyebrow.className =
      "detail-eyebrow";

    eyebrow.textContent =
      "Update your library";

    title.id =
      `${DIALOG_ID}-title`;

    title.textContent =
      "Choose a status";

    context.className =
      "detail-library-dialog-context";

    context.textContent =
      "";

    headingCopy.append(
      eyebrow,
      title,
      context
    );

    closeButton.type =
      "button";

    closeButton.className =
      "detail-library-dialog-close";

    closeButton.setAttribute(
      "aria-label",
      "Close status editor"
    );

    closeIcon.className =
      "ti ti-x";

    closeIcon.setAttribute(
      "aria-hidden",
      "true"
    );

    closeButton.append(
      closeIcon
    );

    header.append(
      headingIcon,
      headingCopy,
      closeButton
    );

    description.id =
      `${DIALOG_ID}-description`;

    description.className =
      "detail-library-dialog-description";

    description.textContent =
      "Choose how this format appears in your library.";

    options.className =
      "detail-library-dialog-options";

    legend.className =
      "detail-library-visually-hidden";

    legend.textContent =
      "Library status";

    options.append(
      legend
    );

    actions.className =
      "detail-library-dialog-actions";

    cancelButton.type =
      "button";

    cancelButton.className =
      "detail-library-dialog-button detail-library-dialog-button-secondary";

    cancelButton.textContent =
      "Cancel";

    saveButton.type =
      "button";

    saveButton.className =
      "detail-library-dialog-button detail-library-dialog-button-primary";

    saveButton.textContent =
      "Save changes";

    saveButton.disabled =
      true;

    actions.append(
      cancelButton,
      saveButton
    );

    surface.append(
      header,
      description,
      options,
      actions
    );

    dialog.append(
      surface
    );

    document
      .body
.append(
        dialog
      );

    return {
      dialog,
      title,
      context,
      description,
      options,
      closeButton,
      cancelButton,
      saveButton
    };
  }


  function createToastRegion() {
    document
      .getElementById(
        TOAST_REGION_ID
      )
      ?.remove();

    const region =
      document
        .createElement(
          "div"
        );

    region.id =
      TOAST_REGION_ID;

    region.className =
      "detail-library-toast-region";

    region.setAttribute(
      "aria-live",
      "polite"
    );

    region.setAttribute(
      "aria-atomic",
      "true"
    );

    document
      .body
      .append(
        region
      );

    return region;
  }


  function handleToastClick(
    event
  ) {
    const closeButton =
      event
        .target
        .closest(
          "[data-library-toast-close]"
        );

    if (
      closeButton
    ) {
      clearLibraryNote();
    }
  }


  /* =======================================================
     OPEN THE EDITOR
     ======================================================= */

  function openEditor(
    format,
    trigger
  ) {
    const formatConfig =
      FORMAT_CONFIG[
        format
      ];

    if (
      !dialogElements ||
      !formatConfig ||
      !currentEntry
    ) {
      return;
    }

    editorFormat =
      format;

    draftStatus =
      currentEntry
        .formats[
          format
        ]
        ?.status ||
      "";

    initialStatus =
      draftStatus;

    isSaving =
      false;

    returnTrigger =
      trigger;

    restoreFocusOnClose =
      true;

    dialogElements
      .title
      .textContent =
        `${formatConfig.label} status`;

    dialogElements
      .context
      .textContent =
        currentTitle
          ?.title ||
        "";

    dialogElements
      .description
      .textContent =
        `Choose how ${formatConfig.label} appears in your library.`;

    renderDialogOptions(
      format,
      draftStatus
    );

    if (
      typeof dialogElements
        .dialog
        .showModal !==
      "function"
    ) {
      showLibraryNote(
        "This browser does not support the status editor.",
        "error"
      );

      return;
    }

    if (
      !dialogElements
        .dialog
        .open
    ) {
      dialogElements
        .dialog
        .showModal();
    }

    window
.requestAnimationFrame(
        focusSelectedDialogOption
      );
  }


  /* =======================================================
     RENDER DIALOG OPTIONS
     ======================================================= */

  function renderDialogOptions(
    format,
    selectedStatus
  ) {
    const formatConfig =
      FORMAT_CONFIG[
        format
      ];

    const fragment =
      document
        .createDocumentFragment();

    const options = [
      {
        id:
          "",

        label:
          "Not tracked",

        description:
          "Remove this format from your library."
      },

      ...formatConfig
        .statuses
.map(
          (
            status
          ) => {
            return {
              ...status,

              description:
                getStatusDescription(
                  format,
                  status.id
                )
            };
          }
        )
    ];

    options
.forEach(
        (
          option,
          index
        ) => {
          fragment.append(
            createDialogOption({
              format,
              option,

              checked:
                option.id ===
                selectedStatus,

              index
            })
          );
        }
      );

    const legend =
      dialogElements
        .options
.querySelector(
          "legend"
        );

    dialogElements
      .options
.replaceChildren();

    if (
      legend
    ) {
      dialogElements
        .options
.append(
          legend
        );
    }

    dialogElements
      .options
.append(
        fragment
      );

    updateDialogSelection();
    updateSaveButtonState();
  }


  function createDialogOption({
    format,
    option,
    checked,
    index
  }) {
    const label =
      document
.createElement(
          "label"
        );

    const input =
      document
.createElement(
          "input"
        );

    const indicator =
      document
.createElement(
          "span"
        );

    const copy =
      document
.createElement(
          "span"
        );

    const title =
      document
.createElement(
          "strong"
        );

    const description =
      document
.createElement(
          "small"
        );

    const inputId =
      `${DIALOG_ID}-${format}-${index}`;

    label.className =
      "detail-library-dialog-option";

    label.htmlFor =
      inputId;

    input.id =
      inputId;

    input.className =
      "detail-library-dialog-radio";

    input.type =
      "radio";

    input.name =
      `${DIALOG_ID}-status`;

    input.value =
      option.id;

    input.checked =
      checked;

    indicator.className =
      "detail-library-dialog-radio-mark";

    indicator.setAttribute(
      "aria-hidden",
      "true"
    );

    copy.className =
      "detail-library-dialog-option-copy";

    title.textContent =
      option.label;

    description.textContent =
      option.description;

    copy.append(
      title,
      description
    );

    label.append(
      input,
      indicator,
      copy
    );

    return label;
  }


  function handleDialogStatusChange(
    event
  ) {
    const radio =
      event
        .target
        .closest(
          ".detail-library-dialog-radio"
        );

    if (
      !radio
    ) {
      return;
    }

    draftStatus =
      radio.value;

    updateDialogSelection();
    updateSaveButtonState();
  }


  function updateDialogSelection() {
    if (
      !dialogElements
    ) {
      return;
    }

    dialogElements
      .options
      .querySelectorAll(
        ".detail-library-dialog-option"
      )
      .forEach(
        (
          option
        ) => {
          const radio =
            option
              .querySelector(
                ".detail-library-dialog-radio"
              );

          option
            .classList
            .toggle(
              "is-selected",
              Boolean(
                radio
                  ?.checked
              )
            );
        }
      );
  }


  function updateSaveButtonState() {
    if (
      !dialogElements
    ) {
      return;
    }

    const hasChanged =
      draftStatus !==
      initialStatus;

    dialogElements
      .saveButton
      .disabled =
        !hasChanged ||
        isSaving;
  }


  function setDialogSaving(
    saving
  ) {
    isSaving =
      saving;

    dialogElements
      .dialog
      .setAttribute(
        "aria-busy",
        String(
          saving
        )
      );

    dialogElements
      .saveButton
      .textContent =
        saving
          ? "Saving…"
          : "Save changes";

    dialogElements
      .options
      .disabled =
        saving;

    dialogElements
      .cancelButton
      .disabled =
        saving;

    dialogElements
      .closeButton
      .disabled =
        saving;

    updateSaveButtonState();
  }


  function focusSelectedDialogOption() {
    if (
      !dialogElements
    ) {
      return;
    }

    const selectedRadio =
      dialogElements
        .options
.querySelector(
          ".detail-library-dialog-radio:checked"
        );

    const firstRadio =
      dialogElements
        .options
.querySelector(
          ".detail-library-dialog-radio"
        );

    (
      selectedRadio ||
      firstRadio
    )
      ?.focus();
  }


  /* =======================================================
     SAVE OR CANCEL
     ======================================================= */

  function handleSaveClick() {
    if (
      !editorFormat ||
      isSaving ||
      draftStatus ===
        initialStatus
    ) {
      return;
    }

    const format =
      editorFormat;

    const status =
      draftStatus;

    setDialogSaving(
      true
    );

    window
      .requestAnimationFrame(
        () => {
          const didSave =
            saveFormatStatus(
              format,
              status
            );

          if (
            didSave
          ) {
            closeEditor({
              result:
                "saved",

              restoreFocus:
                true
            });

            return;
          }

          setDialogSaving(
            false
          );
        }
      );
  }


  function handleDialogCancel(
    event
  ) {
    event.preventDefault();

    if (
      isSaving
    ) {
      return;
    }

    closeEditor({
      result:
        "cancel",

      restoreFocus:
        true
    });
  }


  function handleDialogBackdropClick(
    event
  ) {
    if (
      isSaving ||
      event.target !==
      dialogElements
        .dialog
    ) {
      return;
    }

    closeEditor({
      result:
        "cancel",

      restoreFocus:
        true
    });
  }


  function closeEditor({
    result =
      "cancel",

    restoreFocus =
      true
  } = {}) {
    if (
      !dialogElements
    ) {
      return;
    }

    restoreFocusOnClose =
      restoreFocus;

    if (
      dialogElements
        .dialog
        .open
    ) {
      dialogElements
        .dialog
        .close(
          result
        );
    } else {
      editorFormat =
        "";

      draftStatus =
        "";

      initialStatus =
        "";

      isSaving =
        false;

      returnTrigger =
        null;
    }
  }


  function handleDialogClose() {
    const triggerToFocus =
      returnTrigger;

    const shouldRestoreFocus =
      restoreFocusOnClose;

    editorFormat =
      "";

    draftStatus =
      "";

    initialStatus =
      "";

    isSaving =
      false;

    if (
      dialogElements
    ) {
      dialogElements
        .dialog
        .removeAttribute(
          "aria-busy"
        );

      dialogElements
        .saveButton
        .textContent =
          "Save changes";

      dialogElements
        .options
        .disabled =
          false;

      dialogElements
        .cancelButton
        .disabled =
          false;

      dialogElements
        .closeButton
        .disabled =
          false;
    }

    returnTrigger =
      null;

    restoreFocusOnClose =
      true;

    if (
      shouldRestoreFocus &&
      triggerToFocus
        ?.isConnected
    ) {
      window
.requestAnimationFrame(
          () => {
            triggerToFocus
.focus();
          }
        );
    }
  }


  /* =======================================================
     SAVE TO LOCAL STORAGE
     ======================================================= */

  function saveFormatStatus(
    format,
    status
  ) {
    if (
      !currentTitle
    ) {
      return false;
    }

    if (
      status &&
      !isValidStatus(
        format,
        status
      )
    ) {
      showLibraryNote(
        "That library status is not available.",
        "error"
      );

      return false;
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

    const updatedAt =
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
          updatedAt
        };
    } else {
      delete entry
        .formats[
          format
        ];
    }

    entry.updatedAt =
      updatedAt;

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
      showLibraryNote(
        "This browser could not save your library change.",
        "error"
      );

      return false;
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

    showLibraryNote(
      statusLabel
        ? `${formatLabel} status updated to ${statusLabel}.`
        : `${formatLabel} removed from your library.`,

      "success"
    );

    return true;
  }


  /* =======================================================
     RENDER THE CARD
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
      renderUnavailableState(
        "Open a title to manage its library status."
      );

      return;
    }

    if (
      !availableFormats
        .length
    ) {
      renderUnavailableState(
        "This title has no Manga or Anime format available to save."
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
            createFormatButton(
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
  }


  function createFormatButton(
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

    const button =
      document
.createElement(
          "button"
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

    const copy =
      document
.createElement(
          "span"
        );

    const label =
      document
.createElement(
          "strong"
        );

    const status =
      document
.createElement(
          "small"
        );

    const chevron =
      document
.createElement(
          "i"
        );

    button.type =
      "button";

    button.className =
      "detail-library-format-button";

    button
      .dataset
      .libraryFormatButton =
        format;

    button
      .dataset
      .tracked =
        String(
          Boolean(
            savedStatus
          )
        );

    button.setAttribute(
      "aria-haspopup",
      "dialog"
    );

    button.setAttribute(
      "aria-controls",
      DIALOG_ID
    );

    button.setAttribute(
      "aria-label",
      `Edit ${formatConfig.label} status. Current status: ${statusLabel}.`
    );

    icon.className =
      "detail-library-format-button-icon";

    icon.setAttribute(
      "aria-hidden",
      "true"
    );

    iconElement.className =
      formatConfig.icon;

    icon.append(
      iconElement
    );

    copy.className =
      "detail-library-format-button-copy";

    label.textContent =
      formatConfig.label;

    status.textContent =
      statusLabel;

    copy.append(
      label,
      status
    );

    chevron.className =
      "ti ti-chevron-right detail-library-format-button-chevron";

    chevron.setAttribute(
      "aria-hidden",
      "true"
    );

    button.append(
      icon,
      copy,
      chevron
    );

    return button;
  }


  function renderUnavailableState(
    message
  ) {
    const unavailable =
      document
.createElement(
          "div"
        );

    const icon =
      document
.createElement(
          "i"
        );

    const text =
      document
.createElement(
          "span"
        );

    unavailable.className =
      "detail-library-summary-unavailable";

    icon.className =
      "ti ti-book-off";

    icon.setAttribute(
      "aria-hidden",
      "true"
    );

    text.textContent =
      message;

    unavailable.append(
      icon,
      text
    );

    elements
      .librarySummary
.append(
        unavailable
      );
  }


  /* =======================================================
     STATUS MESSAGE
     ======================================================= */

  function showLibraryNote(
    message,
    tone
  ) {
    window
      .clearTimeout(
        noteTimer
      );

    if (
      !toastRegion
    ) {
      return;
    }

    const toast =
      document
        .createElement(
          "div"
        );

    const icon =
      document
        .createElement(
          "i"
        );

    const text =
      document
        .createElement(
          "span"
        );

    const closeButton =
      document
        .createElement(
          "button"
        );

    const closeIcon =
      document
        .createElement(
          "i"
        );

    toast.className =
      "detail-library-toast";

    toast.dataset.tone =
      tone;

    toast.setAttribute(
      "role",
      tone ===
        "error"
          ? "alert"
          : "status"
    );

    icon.className =
      tone ===
        "error"
          ? "ti ti-alert-circle"
          : "ti ti-circle-check";

    icon.setAttribute(
      "aria-hidden",
      "true"
    );

    text.textContent =
      message;

    closeButton.type =
      "button";

    closeButton.className =
      "detail-library-toast-close";

    closeButton.dataset.libraryToastClose =
      "";

    closeButton.setAttribute(
      "aria-label",
      "Dismiss notification"
    );

    closeIcon.className =
      "ti ti-x";

    closeIcon.setAttribute(
      "aria-hidden",
      "true"
    );

    closeButton.append(
      closeIcon
    );

    toast.append(
      icon,
      text,
      closeButton
    );

    toastRegion
      .replaceChildren(
        toast
      );

    window
      .requestAnimationFrame(
        () => {
          toast
            .classList
            .add(
              "is-visible"
            );
        }
      );

    noteTimer =
      window
        .setTimeout(
          clearLibraryNote,
          tone ===
            "error"
              ? 8000
              : 5000
        );
  }


  function clearLibraryNote() {
    window
      .clearTimeout(
        noteTimer
      );

    const toast =
      toastRegion
        ?.firstElementChild;

    if (
      !toast
    ) {
      return;
    }

    toast
      .classList
      .remove(
        "is-visible"
      );

    window
      .setTimeout(
        () => {
          if (
            !toast
              .classList
              .contains(
                "is-visible"
              )
          ) {
            toast.remove();
          }
        },
        180
      );
  }


  function focusFormatButton(
    format
  ) {
    window
.requestAnimationFrame(
        () => {
          elements
            .librarySummary
.querySelector(
              `[data-library-format-button="${format}"]`
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
   STATUS HELPERS
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


function isValidStatus(
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


function getStatusDescription(
  format,
  status
) {
  const descriptions = {
    manga: {
      reading:
        "You are currently reading this manga.",

      completed:
        "You have finished this manga.",

      "plan-to-read":
        "Save it for later.",

      paused:
        "You have temporarily stopped reading.",

      dropped:
        "You do not plan to continue reading."
    },

    anime: {
      watching:
        "You are currently watching this anime.",

      completed:
        "You have finished this anime.",

      "plan-to-watch":
        "Save it for later.",

      paused:
        "You have temporarily stopped watching.",

      dropped:
        "You do not plan to continue watching."
    }
  };

  return (
    descriptions[
      format
    ]
      ?.[
        status
      ] ||
    ""
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
          const savedFormat =
            storedEntry
              .formats[
                format
              ];

          const status =
            savedFormat
              ?.status;

          if (
            isValidStatus(
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

  if (
    status ===
      "completed" ||
    status ===
      "paused" ||
    status ===
      "dropped"
  ) {
    return status;
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