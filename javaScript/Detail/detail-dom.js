// detail-dom.js
// Collects the elements used by the detail page.

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


    types:
      document.getElementById(
        "detail-types"
      ),

    title:
      document.getElementById(
        "detail-title"
      ),

    alternativeTitles:
      document.getElementById(
        "detail-alternative-titles"
      ),

    creatorRow:
      document.getElementById(
        "detail-creator-row"
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

    scoreCaption:
      document.getElementById(
        "detail-score-caption"
      ),


    mediaSection:
      document.getElementById(
        "detail-media-section"
      ),

    mediaTabs:
      document.getElementById(
        "detail-media-tabs"
      ),

    mediaPanels:
      document.getElementById(
        "detail-media-panels"
      ),


    description:
      document.getElementById(
        "detail-description"
      ),

    descriptionToggle:
      document.getElementById(
        "detail-description-toggle"
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

    librarySummary:
      document.getElementById(
        "detail-library-summary"
      ),

    libraryMenu:
      document.getElementById(
        "detail-library-menu"
      ),

    libraryMenuBack:
      document.getElementById(
        "detail-library-menu-back"
      ),

    libraryMenuEyebrow:
      document.getElementById(
        "detail-library-menu-eyebrow"
      ),

    libraryMenuTitle:
      document.getElementById(
        "detail-library-menu-title"
      ),

    libraryOptions:
      document.getElementById(
        "detail-library-options"
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

    "ambientCover",
    "coverFrame",
    "cover",

    "types",
    "title",
    "alternativeTitles",
    "creatorRow",
    "creator",
    "genres",

    "scoreCard",
    "score",
    "scoreCaption",

    "mediaSection",
    "mediaTabs",
    "mediaPanels",

    "description",
    "descriptionToggle",
    "themesSection",
    "themes",

    "backButton",
    "similarLink",

    "libraryPicker",
    "libraryTrigger",
    "libraryTriggerIcon",
    "libraryTriggerLabel",
    "librarySummary",
    "libraryMenu",
    "libraryMenuBack",
    "libraryMenuEyebrow",
    "libraryMenuTitle",
    "libraryOptions",
    "libraryNote"
  ];


  return requiredKeys.every(
    (
      key
    ) => {
      return Boolean(
        elements[
          key
        ]
      );
    }
  );
}