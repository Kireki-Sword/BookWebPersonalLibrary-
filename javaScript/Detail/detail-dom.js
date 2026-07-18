// detail-dom.js
// Finds the HTML elements used by the detail page.

export function collectDetailElements() {
  return {
    loading:
      document.getElementById(
        "detail-loading"
      ),

    error:
      document.getElementById(
        "detail-error"
      ),

    errorMessage:
      document.getElementById(
        "detail-error-message"
      ),

    retryButton:
      document.getElementById(
        "detail-retry-button"
      ),

    content:
      document.getElementById(
        "detail-content"
      ),


    breadcrumbFormat:
      document.getElementById(
        "detail-breadcrumb-format"
      ),

    breadcrumbTitle:
      document.getElementById(
        "detail-breadcrumb-title"
      ),


    ambientCover:
      document.getElementById(
        "detail-ambient-cover"
      ),

    coverFrame:
      document.querySelector(
        ".detail-cover-frame"
      ),

    cover:
      document.getElementById(
        "detail-cover"
      ),


    type:
      document.getElementById(
        "detail-type"
      ),

    featured:
      document.getElementById(
        "detail-featured"
      ),

    title:
      document.getElementById(
        "detail-title"
      ),

    alternativeTitles:
      document.getElementById(
        "detail-alternative-titles"
      ),

    creator:
      document.getElementById(
        "detail-creator"
      ),

    genres:
      document.getElementById(
        "detail-genres"
      ),


    scoreCard:
      document.getElementById(
        "detail-score-card"
      ),

    score:
      document.getElementById(
        "detail-score"
      ),


    factsGrid:
      document.getElementById(
        "detail-facts-grid"
      ),

    factsEmpty:
      document.getElementById(
        "detail-facts-empty"
      ),


    description:
      document.getElementById(
        "detail-description"
      ),

    themesSection:
      document.getElementById(
        "detail-themes-section"
      ),

    themes:
      document.getElementById(
        "detail-themes"
      ),


    backButton:
      document.getElementById(
        "detail-back-button"
      ),

    similarLink:
      document.getElementById(
        "detail-similar-link"
      ),


    libraryPicker:
      document.querySelector(
        "[data-detail-library-picker]"
      ),

    libraryTrigger:
      document.getElementById(
        "detail-library-trigger"
      ),

    libraryTriggerIcon:
      document.getElementById(
        "detail-library-trigger-icon"
      ),

    libraryTriggerLabel:
      document.getElementById(
        "detail-library-trigger-label"
      ),

    libraryMenu:
      document.getElementById(
        "detail-library-menu"
      ),

    libraryStatusButtons: [
      ...document.querySelectorAll(
        "[data-library-status]"
      )
    ],

    progressStatusLabel:
      document.getElementById(
        "detail-progress-status-label"
      ),

    libraryRemove:
      document.getElementById(
        "detail-library-remove"
      ),

    libraryNote:
      document.getElementById(
        "detail-library-note"
      )
  };
}


export function hasRequiredDetailElements(
  elements
) {
  const requiredKeys = [
    "loading",
    "error",
    "errorMessage",
    "retryButton",
    "content",

    "breadcrumbFormat",
    "breadcrumbTitle",

    "ambientCover",
    "coverFrame",
    "cover",

    "type",
    "featured",
    "title",
    "alternativeTitles",
    "creator",
    "genres",

    "scoreCard",
    "score",

    "factsGrid",
    "factsEmpty",

    "description",
    "themesSection",
    "themes",

    "backButton",
    "similarLink",

    "libraryPicker",
    "libraryTrigger",
    "libraryTriggerIcon",
    "libraryTriggerLabel",
    "libraryMenu",
    "progressStatusLabel",
    "libraryRemove",
    "libraryNote"
  ];

  return (
    requiredKeys.every((key) => {
      return Boolean(
        elements[key]
      );
    }) &&

    elements
      .libraryStatusButtons
      .length > 0
  );
}