// detail.js
// Main entry point for the Inkwell detail page.

import {
  DETAIL_CONFIG,
  loadTitleFromDatabase,
  normalizeTitle,
  withTimeout
} from "./detail-data.js";


import {
  collectDetailElements,
  hasRequiredDetailElements
} from "./detail-dom.js";


import {
  bindMediaTabEvents,
  renderDetailPage,
  showDetailContent,
  showDetailError
} from "./detail-render.js";


import {
  createDetailLibraryController
} from "./detail-library.js";


/* =========================================================
   APPLICATION STATE
   ========================================================= */

let elements =
  null;


let libraryController =
  null;


/* =========================================================
   STARTUP
   ========================================================= */

if (
  document.readyState ===
  "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    startDetailPage,
    {
      once:
        true
    }
  );
} else {
  startDetailPage();
}


async function startDetailPage() {
  elements =
    collectDetailElements();


  if (
    !hasRequiredDetailElements(
      elements
    )
  ) {
    console.error(
      "The detail page is missing required HTML elements.",
      elements
    );

    return;
  }


  libraryController =
    createDetailLibraryController(
      elements
    );


  libraryController
    .bindEvents();


  bindMediaTabEvents(
    elements
  );


  bindPageEvents();


  const titleId =
    new URLSearchParams(
      window
        .location
        .search
    ).get(
      "id"
    );


  if (
    !titleId
  ) {
    showDetailError(
      elements,
      "No title ID was provided. Open a title from the search page."
    );

    return;
  }


  if (
    !window
      .supabase
      ?.createClient
  ) {
    showDetailError(
      elements,
      "The Supabase browser library did not load."
    );

    return;
  }


  const supabaseClient =
    window
      .supabase
      .createClient(
        DETAIL_CONFIG
          .SUPABASE_URL,

        DETAIL_CONFIG
          .SUPABASE_KEY
      );


  try {
    const databaseRow =
      await withTimeout(
        loadTitleFromDatabase(
          supabaseClient,
          titleId
        ),

        DETAIL_CONFIG
          .REQUEST_TIMEOUT_MS,

        "The title request took too long."
      );


    const currentTitle =
      normalizeTitle(
        databaseRow,
        supabaseClient
      );


    renderDetailPage(
      currentTitle,
      elements
    );


    libraryController
      .setTitle(
        currentTitle
      );


    showDetailContent(
      elements
    );
  } catch (
    error
  ) {
    console.error(
      "INKWELL DETAIL PAGE ERROR:",
      error
    );


    showDetailError(
      elements,

      error?.message ||
      "The title could not be loaded."
    );
  }
}


/* =========================================================
   GENERAL PAGE EVENTS
   ========================================================= */

function bindPageEvents() {
  elements
    .retryButton
    .addEventListener(
      "click",
      () => {
        window
          .location
          .reload();
      }
    );


  elements
    .backButton
    .addEventListener(
      "click",
      handleBackToResults
    );
}


/* =========================================================
   BACK TO SEARCH RESULTS
   ========================================================= */

function handleBackToResults() {
  try {
    if (
      !document.referrer
    ) {
      window.location.href =
        "search.html";

      return;
    }


    const referrer =
      new URL(
        document.referrer
      );


    const cameFromSearch =
      referrer.origin ===
        window.location.origin &&
      referrer
        .pathname
        .toLowerCase()
        .endsWith(
          "/search.html"
        );


    if (
      cameFromSearch
    ) {
      window
        .history
        .back();
    } else {
      window.location.href =
        "search.html";
    }
  } catch {
    window.location.href =
      "search.html";
  }
}