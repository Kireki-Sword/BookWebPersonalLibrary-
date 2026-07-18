// detail-render.js
// Places the normalized title data into the detail-page HTML.

import {
  buildFacts,
  formatLabel,
  formatScore,
  normalizeSearchParameter
} from "./detail-data.js";


/* =========================================================
   COMPLETE PAGE RENDER
   ========================================================= */

export function renderDetailPage(
  title,
  elements
) {
  const primaryType =
    title.types[0] ||
    "Story";

  document.title =
    `${title.title} | Inkwell`;

  renderBreadcrumbs(
    title,
    primaryType,
    elements
  );

  renderCover(
    title,
    elements
  );

  renderHeading(
    title,
    elements
  );

  renderGenres(
    title.genres,
    elements
  );

  renderScore(
    title.score,
    elements
  );

  renderFacts(
    title,
    elements
  );

  renderDescription(
    title.description,
    elements
  );

  renderThemes(
    title.tags,
    elements
  );

  configureSimilarLink(
    title,
    elements
  );
}


/* =========================================================
   BREADCRUMBS
   ========================================================= */

function renderBreadcrumbs(
  title,
  primaryType,
  elements
) {
  elements.breadcrumbFormat.textContent =
    primaryType;

  elements.breadcrumbFormat.href =
    `search.html?type=${
      encodeURIComponent(
        normalizeSearchParameter(
          primaryType
        )
      )
    }`;

  elements.breadcrumbTitle.textContent =
    title.title;
}


/* =========================================================
   COVER
   ========================================================= */

function renderCover(
  title,
  elements
) {
  elements.coverFrame.classList.remove(
    "has-cover-error"
  );

  if (!title.coverUrl) {
    showCoverFallback(
      elements
    );

    return;
  }

  elements.cover.src =
    title.coverUrl;

  elements.cover.alt =
    `${title.title} cover`;

  elements.ambientCover
    .style
    .backgroundImage =
      `url("${
        escapeCssUrl(
          title.coverUrl
        )
      }")`;

  elements.cover.addEventListener(
    "error",
    () => {
      showCoverFallback(
        elements
      );
    },
    {
      once: true
    }
  );
}


function showCoverFallback(elements) {
  elements.coverFrame.classList.add(
    "has-cover-error"
  );

  elements.cover.removeAttribute(
    "src"
  );

  elements.ambientCover
    .style
    .backgroundImage =
      "none";
}


function escapeCssUrl(value) {
  return String(value)
    .replace(
      /\\/g,
      "\\\\"
    )
    .replace(
      /"/g,
      '\\"'
    );
}


/* =========================================================
   HEADING
   ========================================================= */

function renderHeading(
  title,
  elements
) {
  elements.type.textContent =
    title.types.join(
      " / "
    );

  elements.featured.hidden =
    !title.featured;

  elements.title.textContent =
    title.title;

  elements.creator.textContent =
    title.creator ||
    "Unknown creator";

  if (
    title
      .alternativeTitles
      .length
  ) {
    elements.alternativeTitles.hidden =
      false;

    elements.alternativeTitles.textContent =
      title.alternativeTitles.join(
        " / "
      );
  } else {
    elements.alternativeTitles.hidden =
      true;

    elements.alternativeTitles.textContent =
      "";
  }
}


/* =========================================================
   GENRES
   ========================================================= */

function renderGenres(
  genres,
  elements
) {
  elements.genres.innerHTML =
    "";

  if (!genres.length) {
    elements.genres.hidden =
      true;

    return;
  }

  elements.genres.hidden =
    false;

  genres.forEach((genre) => {
    const genreElement =
      document.createElement(
        "span"
      );

    genreElement.className =
      "detail-genre";

    genreElement.textContent =
      genre;

    elements.genres.append(
      genreElement
    );
  });
}


/* =========================================================
   SCORE
   ========================================================= */

function renderScore(
  score,
  elements
) {
  const formattedScore =
    formatScore(
      score
    );

  if (!formattedScore) {
    elements.scoreCard.hidden =
      true;

    return;
  }

  elements.scoreCard.hidden =
    false;

  elements.score.textContent =
    formattedScore;
}


/* =========================================================
   FACTS
   ========================================================= */

function renderFacts(
  title,
  elements
) {
  elements.factsGrid.innerHTML =
    "";

  const facts =
    buildFacts(
      title
    );

  elements.factsEmpty.hidden =
    facts.length > 0;

  facts.forEach((fact) => {
    const factElement =
      document.createElement(
        "div"
      );

    factElement.className =
      "detail-fact";


    const factLabel =
      document.createElement(
        "span"
      );

    factLabel.textContent =
      fact.label;


    const factValue =
      document.createElement(
        "strong"
      );

    factValue.textContent =
      fact.value;


    factElement.append(
      factLabel,
      factValue
    );

    elements.factsGrid.append(
      factElement
    );
  });
}


/* =========================================================
   DESCRIPTION
   ========================================================= */

function renderDescription(
  description,
  elements
) {
  elements.description.textContent =
    description ||
    "No description has been added to this catalogue entry yet.";
}


/* =========================================================
   THEMES
   ========================================================= */

function renderThemes(
  tags,
  elements
) {
  elements.themes.innerHTML =
    "";

  if (!tags.length) {
    elements.themesSection.hidden =
      true;

    return;
  }

  elements.themesSection.hidden =
    false;

  tags.forEach((tag) => {
    const theme =
      document.createElement(
        "span"
      );

    theme.className =
      "detail-theme";

    theme.textContent =
      formatLabel(
        tag
      );

    elements.themes.append(
      theme
    );
  });
}


/* =========================================================
   SIMILAR TITLES
   ========================================================= */

function configureSimilarLink(
  title,
  elements
) {
  if (
    title.genres.length
  ) {
    elements.similarLink.href =
      `search.html?genre=${
        encodeURIComponent(
          normalizeSearchParameter(
            title.genres[0]
          )
        )
      }`;

    return;
  }

  elements.similarLink.href =
    `search.html?type=${
      encodeURIComponent(
        normalizeSearchParameter(
          title.types[0]
        )
      )
    }`;
}


/* =========================================================
   PAGE STATES
   ========================================================= */

export function showDetailContent(
  elements
) {
  elements.loading.hidden =
    true;

  elements.error.hidden =
    true;

  elements.content.hidden =
    false;
}


export function showDetailError(
  elements,
  message
) {
  elements.loading.hidden =
    true;

  elements.content.hidden =
    true;

  elements.error.hidden =
    false;

  elements.errorMessage.textContent =
    message;

  elements.breadcrumbTitle.textContent =
    "Title unavailable";

  document.title =
    "Title Unavailable | Inkwell";
}