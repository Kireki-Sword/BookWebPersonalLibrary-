// detail-render.js
// Renders the normalized title into the detail page.

import {
  buildMediaEntryView,
  buildOverviewStats,
  formatLabel,
  formatScore,
  getAvailableMediaTypes,
  getMediaCountLabel,
  getMediaLabel,
  normalizeSearchParameter
} from "./detail-data.js";


export function renderDetailPage(
  title,
  elements
) {
  document.title =
    `${title.title} | Inkwell`;


  renderCover(
    title,
    elements
  );


  renderIdentity(
    title,
    elements
  );


  renderGenres(
    title.genres,
    elements
  );


  renderClassificationDetails(
    title,
    elements
  );


  renderScore(
    title.score,
    elements
  );


  renderMediaWorkspace(
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


  composeEditorialAboutSection(
    elements
  );


  scheduleAboutContentBalance(
    elements
  );


  configureSimilarLink(
    title,
    elements
  );
}


export function bindMediaTabEvents(
  elements
) {
  elements
    .mediaTabs
    .addEventListener(
      "click",
      (
        event
      ) => {
        const tab =
          event
            .target
            .closest(
              '[role="tab"]'
            );


        if (
          !tab
        ) {
          return;
        }


        activateMediaTab(
          tab
            .dataset
            .tabId,

          elements,

          true
        );
      }
    );


  elements
    .mediaTabs
    .addEventListener(
      "keydown",
      (
        event
      ) => {
        const currentTab =
          event
            .target
            .closest(
              '[role="tab"]'
            );


        if (
          !currentTab
        ) {
          return;
        }


        const tabs = [
          ...elements
            .mediaTabs
            .querySelectorAll(
              '[role="tab"]'
            )
        ];


        const currentIndex =
          tabs.indexOf(
            currentTab
          );


        if (
          currentIndex < 0
        ) {
          return;
        }


        let nextIndex =
          null;


        if (
          event.key ===
          "ArrowRight"
        ) {
          nextIndex =
            (
              currentIndex +
              1
            ) %
            tabs.length;
        } else if (
          event.key ===
          "ArrowLeft"
        ) {
          nextIndex =
            (
              currentIndex -
              1 +
              tabs.length
            ) %
            tabs.length;
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
            tabs.length -
            1;
        } else if (
          event.key ===
            "Enter" ||
          event.key ===
            " "
        ) {
          event.preventDefault();


          activateMediaTab(
            currentTab
              .dataset
              .tabId,

            elements,

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


        activateMediaTab(
          tabs[
            nextIndex
          ]
            .dataset
            .tabId,

          elements,

          true
        );
      }
    );


  elements
    .descriptionToggle
    .addEventListener(
      "click",
      () => {
        const isExpanded =
          elements
            .descriptionToggle
            .getAttribute(
              "aria-expanded"
            ) ===
          "true";


        elements
          .description
          .classList
          .toggle(
            "is-collapsed",
            isExpanded
          );


        elements
          .descriptionToggle
          .setAttribute(
            "aria-expanded",
            String(
              !isExpanded
            )
          );


        elements
          .descriptionToggle
          .textContent =
            isExpanded
              ? "Read full story overview"
              : "Show less";
      }
    );


  elements
    .themesSection
    .addEventListener(
      "click",
      (event) => {
        const button =
          event
            .target
            .closest(
              "[data-themes-toggle]"
            );


        if (!button) {
          return;
        }


        const isExpanded =
          button
            .getAttribute(
              "aria-expanded"
            ) ===
          "true";


        elements
          .themes
          .classList
          .toggle(
            "is-collapsed",
            isExpanded
          );


        button
          .setAttribute(
            "aria-expanded",
            String(
              !isExpanded
            )
          );


        button.textContent =
          isExpanded
            ? "Show all themes"
            : "Show fewer themes";
      }
    );


  let resizeTimer =
    null;


  window
    .addEventListener(
      "resize",
      () => {
        window
          .clearTimeout(
            resizeTimer
          );


        resizeTimer =
          window
            .setTimeout(
              () => {
                scheduleAboutContentBalance(
                  elements
                );
              },
              120
            );
      }
    );
}


function renderCover(
  title,
  elements
) {
  elements
    .coverFrame
    .classList
    .remove(
      "has-cover-error"
    );


  elements
    .cover
    .onerror =
      null;


  if (
    !title.coverUrl
  ) {
    showCoverFallback(
      elements
    );


    return;
  }


  elements
    .cover
    .onerror =
      () => {
        showCoverFallback(
          elements
        );
      };


  elements
    .cover
    .alt =
      `${title.title} cover`;


  elements
    .ambientCover
    .style
    .backgroundImage =
      `url("${
        escapeCssUrl(
          title.coverUrl
        )
      }")`;


  elements
    .cover
    .src =
      title.coverUrl;
}


function showCoverFallback(
  elements
) {
  elements
    .coverFrame
    .classList
    .add(
      "has-cover-error"
    );


  elements
    .cover
    .removeAttribute(
      "src"
    );


  elements
    .cover
    .alt =
      "";


  elements
    .ambientCover
    .style
    .backgroundImage =
      "none";
}


function escapeCssUrl(
  value
) {
  return String(
    value
  )
    .replace(
      /\\/g,
      "\\\\"
    )
    .replace(
      /"/g,
      '\\"'
    );
}


function applyAdaptiveTitleClass(
  titleElement,
  titleText
) {
  const normalizedTitle =
    String(
      titleText ||
      ""
    )
      .replace(
        /\s+/g,
        " "
      )
      .trim();


  const characterCount =
    normalizedTitle.length;


  const wordCount =
    normalizedTitle
      ? normalizedTitle
          .split(
            " "
          )
          .length
      : 0;


  titleElement
    .classList
    .remove(
      "detail-title-short",
      "detail-title-medium",
      "detail-title-long",
      "detail-title-extra-long"
    );


  let sizeClass =
    "detail-title-short";


  if (
    characterCount > 54 ||
    wordCount > 9
  ) {
    sizeClass =
      "detail-title-extra-long";
  } else if (
    characterCount > 34 ||
    wordCount > 6
  ) {
    sizeClass =
      "detail-title-long";
  } else if (
    characterCount > 20 ||
    wordCount > 3
  ) {
    sizeClass =
      "detail-title-medium";
  }


  titleElement
    .classList
    .add(
      sizeClass
    );
}


function renderIdentity(
  title,
  elements
) {
  elements
    .types
    .replaceChildren();


  const availableMediaTypes =
    getAvailableMediaTypes(
      title
    );


  const displayTypes =
    availableMediaTypes.length
      ? availableMediaTypes
          .map(
            getMediaLabel
          )
      : title.types
          .map(
            formatLabel
          );


  displayTypes
    .forEach(
      (
        type
      ) => {
        const badge =
          document.createElement(
            "span"
          );


        badge.className =
          "detail-format-badge";


        badge.textContent =
          type;


        elements
          .types
          .append(
            badge
          );
      }
    );


  elements
    .title
    .textContent =
      title.title;


  applyAdaptiveTitleClass(
    elements.title,
    title.title
  );


  if (
    title
      .alternativeTitles
      .length
  ) {
    elements
      .alternativeTitles
      .hidden =
        false;


    elements
      .alternativeTitles
      .textContent =
        title
          .alternativeTitles
          .join(
            " · "
          );
  } else {
    elements
      .alternativeTitles
      .hidden =
        true;


    elements
      .alternativeTitles
      .textContent =
        "";
  }


  if (
    title.creator
  ) {
    elements
      .creatorRow
      .hidden =
        false;


    const creatorLink =
      document.createElement(
        "a"
      );


    creatorLink.className =
      "detail-creator-link";


    creatorLink.href =
      `search.html?q=${
        encodeURIComponent(
          title.creator
        )
      }`;


    creatorLink.textContent =
      title.creator;


    creatorLink.setAttribute(
      "aria-label",
      `View all catalogue works by ${title.creator}`
    );


    elements
      .creator
      .replaceChildren(
        creatorLink
      );
  } else {
    elements
      .creatorRow
      .hidden =
        true;


    elements
      .creator
      .replaceChildren();
  }
}


function renderGenres(
  genres,
  elements
) {
  elements
    .genres
    .replaceChildren();


  if (
    !genres.length
  ) {
    elements
      .genres
      .hidden =
        true;


    return;
  }


  elements
    .genres
    .hidden =
      false;


  elements
    .genres
    .classList
    .add(
      "detail-metadata-row",
      "detail-metadata-row-genres"
    );


  elements
    .genres
    .setAttribute(
      "aria-label",
      "Genres"
    );


  const label =
    document.createElement(
      "span"
    );


  label.className =
    "detail-metadata-label";


  label.textContent =
    "Genres";


  const list =
    document.createElement(
      "div"
    );


  list.className =
    "detail-metadata-values detail-genre-values";


  genres
    .forEach(
      (
        genre
      ) => {
        const link =
          document.createElement(
            "a"
          );


        link.className =
          "detail-filter-link detail-filter-link-genre";


        link.href =
          `search.html?genre=${
            encodeURIComponent(
              normalizeSearchParameter(
                genre
              )
            )
          }`;


        link.textContent =
          genre;


        list.append(
          link
        );
      }
    );


  elements
    .genres
    .append(
      label,
      list
    );
}


function renderClassificationDetails(
  title,
  elements
) {
  let container =
    document.getElementById(
      "detail-classifications"
    );


  if (!container) {
    container =
      document.createElement(
        "div"
      );


    container.id =
      "detail-classifications";


    container.className =
      "detail-classification-groups";


    elements
      .genres
      .insertAdjacentElement(
        "afterend",
        container
      );
  }


  container
    .replaceChildren();


  const broadFormatKeys =
    new Set([
      "manga",
      "anime",

      ...(
        title.types ||
        []
      )
        .map(
          normalizeSearchParameter
        )
        .filter(
          Boolean
        )
    ]);


  const subformats =
    collectMediaMetadata(
      title,
      [
        "manga",
        "anime"
      ],
      "format"
    )
      .filter(
        (
          value
        ) => {
          return !broadFormatKeys.has(
            normalizeSearchParameter(
              value
            )
          );
        }
      );


  const demographics =
    collectMediaMetadata(
      title,
      [
        "manga"
      ],
      "demographic"
    );


  appendClassificationRow({
    container,
    label:
      "Release types",
    values:
      subformats,
    parameter:
      "subformat",
    chipClass:
      "detail-chip-subformat"
  });


  appendClassificationRow({
    container,
    label:
      "Manga demographic",
    values:
      demographics,
    parameter:
      "demographic",
    chipClass:
      "detail-chip-demographic"
  });


  container.hidden =
    !subformats.length &&
    !demographics.length;
}


function collectMediaMetadata(
  title,
  mediaTypes,
  property
) {
  const uniqueValues =
    new Map();


  mediaTypes
    .forEach(
      (
        mediaType
      ) => {
        const entries =
          title
            .media?.[
              mediaType
            ] ||
          [];


        entries
          .forEach(
            (
              entry
            ) => {
              extractClassificationValues(
                entry?.[
                  property
                ]
              )
                .forEach(
                  (
                    value
                  ) => {
                    const key =
                      normalizeSearchParameter(
                        value
                      );


                    if (
                      key &&
                      !uniqueValues
                        .has(
                          key
                        )
                    ) {
                      uniqueValues
                        .set(
                          key,
                          formatLabel(
                            value
                          )
                        );
                    }
                  }
                );
            }
          );
      }
    );


  return [
    ...uniqueValues
      .values()
  ];
}


function extractClassificationValues(
  value
) {
  if (
    value == null ||
    value === ""
  ) {
    return [];
  }


  if (
    Array.isArray(
      value
    )
  ) {
    return value
      .flatMap(
        extractClassificationValues
      );
  }


  if (
    typeof value ===
    "object"
  ) {
    return Object
      .values(
        value
      )
      .flatMap(
        extractClassificationValues
      );
  }


  const text =
    String(
      value
    ).trim();


  if (!text) {
    return [];
  }


  if (
    text.startsWith(
      "["
    ) ||
    text.startsWith(
      "{"
    )
  ) {
    try {
      return extractClassificationValues(
        JSON.parse(
          text
        )
      );
    } catch {
      // Continue with normal text parsing.
    }
  }


  return text
    .split(
      /\s*(?:\/|\||,|;)\s*/g
    )
    .map(
      (
        item
      ) => {
        return item.trim();
      }
    )
    .filter(
      Boolean
    );
}


function appendClassificationRow({
  container,
  label,
  values,
  parameter,
  chipClass
}) {
  if (!values.length) {
    return;
  }


  const row =
    document.createElement(
      "div"
    );


  row.className =
    `detail-metadata-row detail-metadata-row-${parameter}`;


  const heading =
    document.createElement(
      "span"
    );


  heading.className =
    "detail-metadata-label";


  heading.textContent =
    label;


  const list =
    document.createElement(
      "div"
    );


  list.className =
    "detail-metadata-values";


  values
    .forEach(
      (
        value
      ) => {
        const link =
          document.createElement(
            "a"
          );


        link.className =
          `detail-metadata-link ${chipClass}`;


        link.href =
          `search.html?${parameter}=${
            encodeURIComponent(
              normalizeSearchParameter(
                value
              )
            )
          }`;


        link.textContent =
          value;


        list.append(
          link
        );
      }
    );


  row.append(
    heading,
    list
  );


  container.append(
    row
  );
}


function renderScore(
  score,
  elements
) {
  const formattedScore =
    formatScore(
      score
    );


  if (
    !formattedScore
  ) {
    elements
      .scoreCard
      .hidden =
        true;


    return;
  }


  elements
    .scoreCard
    .hidden =
      false;


  elements
    .score
    .textContent =
      formattedScore;


  elements
    .scoreCaption
    .textContent =
      "Editorial rating";
}


function renderMediaWorkspace(
  title,
  elements
) {
  elements
    .mediaTabs
    .replaceChildren();


  elements
    .mediaPanels
    .replaceChildren();


  const availableTypes =
    getAvailableMediaTypes(
      title
    );


  const tabs = [
    {
      id:
        "overview",

      label:
        "Overview",

      count:
        null,

      panel:
        buildOverviewPanel(
          title,
          availableTypes,
          elements
        )
    },

    ...availableTypes
      .map(
        (
          mediaType
        ) => {
          return {
            id:
              mediaType,

            label:
              getMediaLabel(
                mediaType
              ),

            count:
              title
                .media[
                  mediaType
                ]
                .length,

            panel:
              buildMediaPanel(
                mediaType,

                title
                  .media[
                    mediaType
                  ]
              )
          };
        }
      )
  ];


  tabs
    .forEach(
      (
        tabDefinition,
        index
      ) => {
        const tabButton =
          document.createElement(
            "button"
          );


        const tabId =
          `detail-tab-${
            tabDefinition.id
          }`;


        const panelId =
          `detail-panel-${
            tabDefinition.id
          }`;


        tabButton.className =
          "detail-media-tab";


        tabButton.type =
          "button";


        tabButton.id =
          tabId;


        tabButton
          .dataset
          .tabId =
            tabDefinition.id;


        tabButton.setAttribute(
          "role",
          "tab"
        );


        tabButton.setAttribute(
          "aria-controls",
          panelId
        );


        tabButton.setAttribute(
          "aria-selected",
          index === 0
            ? "true"
            : "false"
        );


        tabButton.tabIndex =
          index === 0
            ? 0
            : -1;


        const label =
          document.createElement(
            "span"
          );


        label.textContent =
          tabDefinition.label;


        tabButton.append(
          label
        );


        if (
          tabDefinition
            .count != null
        ) {
          const count =
            document.createElement(
              "span"
            );


          count.className =
            "detail-media-tab-count";


          count.textContent =
            String(
              tabDefinition.count
            );


          tabButton.append(
            count
          );
        }


        const panel =
          tabDefinition.panel;


        panel.id =
          panelId;


        panel
          .dataset
          .panelId =
            tabDefinition.id;


        panel.setAttribute(
          "role",
          "tabpanel"
        );


        panel.setAttribute(
          "aria-labelledby",
          tabId
        );


        panel.tabIndex =
          0;


        panel.hidden =
          index !== 0;


        elements
          .mediaTabs
          .append(
            tabButton
          );


        elements
          .mediaPanels
          .append(
            panel
          );
      }
    );


  elements
    .mediaSection
    .hidden =
      false;


  const requestedFormat =
    new URLSearchParams(
      window
        .location
        .search
    )
      .get(
        "format"
      )
      ?.toLowerCase();


  if (
    requestedFormat &&
    availableTypes
      .includes(
        requestedFormat
      )
  ) {
    activateMediaTab(
      requestedFormat,
      elements,
      false
    );
  }
}


function buildCondensedOverviewStats(
  title
) {
  const stats =
    buildOverviewStats(
      title
    );


  const byLabel =
    new Map(
      stats.map(
        (
          stat
        ) => {
          return [
            stat.label,
            stat.value
          ];
        }
      )
    );


  const firstRelease =
    byLabel.get(
      "First release"
    );


  const latestRelease =
    byLabel.get(
      "Latest release"
    );


  const releaseSpan =
    firstRelease &&
    latestRelease
      ? firstRelease ===
        latestRelease
          ? firstRelease
          : `${firstRelease}–${latestRelease}`
      : firstRelease ||
        latestRelease ||
        "";


  return [
    {
      label:
        "Available formats",

      value:
        byLabel.get(
          "Available formats"
        ) ||
        "Not listed"
    },

    {
      label:
        "Catalogue entries",

      value:
        byLabel.get(
          "Catalogue entries"
        ) ||
        "0"
    },

    ...(
      releaseSpan
        ? [
            {
              label:
                "Release span",

              value:
                releaseSpan
            }
          ]
        : []
    ),

    ...(
      byLabel.get(
        "Creator"
      )
        ? [
            {
              label:
                "Creator",

              value:
                byLabel.get(
                  "Creator"
                )
            }
          ]
        : []
    )
  ];
}


function buildOverviewPanel(
  title,
  availableTypes,
  elements
) {
  const panel =
    document.createElement(
      "div"
    );


  panel.className =
    "detail-media-panel detail-overview-panel";


  const intro =
    document.createElement(
      "div"
    );


  intro.className =
    "detail-panel-intro";


  const headingBlock =
    document.createElement(
      "div"
    );


  const eyebrow =
    document.createElement(
      "span"
    );


  const heading =
    document.createElement(
      "h3"
    );


  const copy =
    document.createElement(
      "p"
    );


  eyebrow.className =
    "detail-eyebrow";


  eyebrow.textContent =
    "Story overview";


  heading.textContent =
    "One title, every available format";


  copy.textContent =
    availableTypes.length
      ? "Use the format tabs to explore each manga publication and anime adaptation as its own catalogue record."
      : "More manga or anime information has not been added to this catalogue entry yet.";


  headingBlock.append(
    eyebrow,
    heading,
    copy
  );


  intro.append(
    headingBlock
  );


  panel.append(
    intro
  );


  const stats =
    document.createElement(
      "dl"
    );


  stats.className =
    "detail-overview-stats";


  buildCondensedOverviewStats(
    title
  )
    .forEach(
      (
        stat
      ) => {
        const item =
          document.createElement(
            "div"
          );


        const term =
          document.createElement(
            "dt"
          );


        const value =
          document.createElement(
            "dd"
          );


        term.textContent =
          stat.label;


        value.textContent =
          stat.value;


        item.append(
          term,
          value
        );


        stats.append(
          item
        );
      }
    );


  panel.append(
    stats
  );


  if (
    availableTypes.length
  ) {
    const formatList =
      document.createElement(
        "div"
      );


    formatList.className =
      "detail-format-summary-list";


    availableTypes
      .forEach(
        (
          mediaType
        ) => {
          const row =
            document.createElement(
              "button"
            );


          const text =
            document.createElement(
              "span"
            );


          const count =
            document.createElement(
              "strong"
            );


          const icon =
            document.createElement(
              "i"
            );


          row.className =
            "detail-format-summary";


          row.type =
            "button";


          text.textContent =
            getMediaLabel(
              mediaType
            );


          count.textContent =
            getMediaCountLabel(
              mediaType,

              title
                .media[
                  mediaType
                ]
                .length
            );


          icon.className =
            "ti ti-arrow-right";


          icon.setAttribute(
            "aria-hidden",
            "true"
          );


          row.append(
            text,
            count,
            icon
          );


          row.addEventListener(
            "click",
            () => {
              activateMediaTab(
                mediaType,
                elements,
                true
              );
            }
          );


          formatList.append(
            row
          );
        }
      );


    panel.append(
      formatList
    );
  }


  return panel;
}


function buildMediaPanel(
  mediaType,
  entries
) {
  const panel =
    document.createElement(
      "div"
    );


  panel.className =
    "detail-media-panel";


  const intro =
    document.createElement(
      "div"
    );


  intro.className =
    "detail-panel-intro";


  const headingBlock =
    document.createElement(
      "div"
    );


  const eyebrow =
    document.createElement(
      "span"
    );


  const heading =
    document.createElement(
      "h3"
    );


  const copy =
    document.createElement(
      "p"
    );


  const count =
    document.createElement(
      "span"
    );


  eyebrow.className =
    "detail-eyebrow";


  eyebrow.textContent =
    `${
      getMediaLabel(
        mediaType
      )
    } information`;


  heading.textContent =
    getMediaPanelHeading(
      mediaType
    );


  copy.textContent =
    getMediaPanelDescription(
      mediaType
    );


  count.className =
    "detail-panel-count";


  count.textContent =
    getMediaCountLabel(
      mediaType,
      entries.length
    );


  headingBlock.append(
    eyebrow,
    heading,
    copy
  );


  intro.append(
    headingBlock,
    count
  );


  panel.append(
    intro
  );


  const list =
    document.createElement(
      "div"
    );


  const releaseDensity =
    getReleaseDensity(
      entries.length
    );


  list.className =
    `detail-release-list detail-release-list-${releaseDensity}`;


  list.dataset.releaseCount =
    String(
      entries.length
    );


  const normalizedStatuses =
    entries
      .map(
        (
          entry,
          index
        ) => {
          return normalizeComparableText(
            buildMediaEntryView(
              mediaType,
              entry,
              index
            )
              .status
          );
        }
      )
      .filter(
        Boolean
      );


  const hasUniformStatus =
    normalizedStatuses.length ===
      entries.length &&
    new Set(
      normalizedStatuses
    )
      .size ===
      1;


  list
    .classList
    .toggle(
      "detail-release-list-uniform-status",
      hasUniformStatus &&
      entries.length > 3
    );


  entries
    .forEach(
      (
        entry,
        index
      ) => {
        list.append(
          buildMediaEntry(
            mediaType,
            entry,
            index,
            releaseDensity
          )
        );
      }
    );


  panel.append(
    list
  );


  return panel;
}


function getReleaseDensity(
  releaseCount
) {
  if (
    releaseCount <= 3
  ) {
    return "spacious";
  }


  if (
    releaseCount <= 7
  ) {
    return "standard";
  }


  return "compact";
}


function getVisibleReleaseSummaryItems(
  view
) {
  const normalizedYear =
    normalizeComparableText(
      view.yearLabel
    );


  const seen =
    new Set();


  return view
    .summaryItems
    .filter(
      (
        item
      ) => {
        const normalizedItem =
          normalizeComparableText(
            item
          );


        if (
          !normalizedItem ||
          normalizedItem ===
            normalizedYear ||
          seen.has(
            normalizedItem
          )
        ) {
          return false;
        }


        seen.add(
          normalizedItem
        );


        return true;
      }
    );
}


function getVisibleReleaseFacts(
  view
) {
  const hiddenLabels =
    new Set([
      "start year",
      "end year",
      "release year",
      "airing year",
      "publication year"
    ]);


  return view
    .facts
    .filter(
      (
        fact
      ) => {
        const normalizedLabel =
          normalizeComparableText(
            fact.label
          );


        return !hiddenLabels
          .has(
            normalizedLabel
          );
      }
    );
}


function hasMeaningfulReleaseNotes(
  notes
) {
  const normalizedNotes =
    normalizeComparableText(
      notes
    );


  return Boolean(
    normalizedNotes &&
    ![
      "none",
      "n a",
      "na",
      "no notes",
      "not available",
      "unknown"
    ].includes(
      normalizedNotes
    )
  );
}


function normalizeComparableText(
  value
) {
  return String(
    value ||
    ""
  )
    .normalize(
      "NFKD"
    )
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}


function buildMediaEntry(
  mediaType,
  entry,
  index,
  releaseDensity
) {
  const view =
    buildMediaEntryView(
      mediaType,
      entry,
      index
    );


  const article =
    document.createElement(
      "article"
    );


  article.className =
    `detail-release-entry detail-release-entry-${releaseDensity}`;


  const marker =
    document.createElement(
      "div"
    );


  marker.className =
    "detail-release-marker";


  marker.textContent =
    view.yearLabel ||
    String(
      index + 1
    )
      .padStart(
        2,
        "0"
      );


  const body =
    document.createElement(
      "div"
    );


  body.className =
    "detail-release-body";


  const header =
    document.createElement(
      "header"
    );


  header.className =
    "detail-release-header";


  const headingGroup =
    document.createElement(
      "div"
    );


  const heading =
    document.createElement(
      "h4"
    );


  heading.textContent =
    view.title;


  headingGroup.append(
    heading
  );


  const visibleSummaryItems =
    getVisibleReleaseSummaryItems(
      view
    );


  if (
    visibleSummaryItems
      .length
  ) {
    const summary =
      document.createElement(
        "p"
      );


    summary.className =
      "detail-release-summary";


    summary.textContent =
      visibleSummaryItems
        .join(
          " · "
        );


    headingGroup.append(
      summary
    );
  }


  header.append(
    headingGroup
  );


  if (
    view.status
  ) {
    const status =
      document.createElement(
        "span"
      );


    status.className =
      `detail-status detail-status-${
        slugify(
          view.status
        )
      }`;


    status.textContent =
      view.status;


    header.append(
      status
    );
  }


  body.append(
    header
  );


  const visibleFacts =
    getVisibleReleaseFacts(
      view
    );


  if (
    visibleFacts
      .length
  ) {
    body.append(
      buildDefinitionGrid(
        visibleFacts,
        "detail-release-facts detail-release-facts-compact"
      )
    );
  }


  if (
    hasMeaningfulReleaseNotes(
      view.notes
    )
  ) {
    body.append(
      buildDisclosure(
        getNotesLabel(
          mediaType
        ),

        view.notes,

        "detail-release-disclosure"
      )
    );
  }


  if (
    view
      .additional
      .length
  ) {
    body.append(
      buildDisclosure(
        "Additional details",

        buildDefinitionGrid(
          view.additional,
          "detail-additional-grid"
        ),

        "detail-release-disclosure"
      )
    );
  }


  article.append(
    marker,
    body
  );


  return article;
}


function buildDefinitionGrid(
  items,
  className
) {
  const list =
    document.createElement(
      "dl"
    );


  list.className =
    className;


  items
    .forEach(
      (
        item
      ) => {
        const wrapper =
          document.createElement(
            "div"
          );


        const term =
          document.createElement(
            "dt"
          );


        const definition =
          document.createElement(
            "dd"
          );


        term.textContent =
          item.label;


        definition.textContent =
          item.value;


        wrapper.append(
          term,
          definition
        );


        list.append(
          wrapper
        );
      }
    );


  return list;
}


function buildDisclosure(
  label,
  content,
  className
) {
  const details =
    document.createElement(
      "details"
    );


  const summary =
    document.createElement(
      "summary"
    );


  const labelElement =
    document.createElement(
      "span"
    );


  const icon =
    document.createElement(
      "i"
    );


  details.className =
    className;


  labelElement.textContent =
    label;


  icon.className =
    "ti ti-chevron-down";


  icon.setAttribute(
    "aria-hidden",
    "true"
  );


  summary.append(
    labelElement,
    icon
  );


  details.append(
    summary
  );


  if (
    typeof content ===
    "string"
  ) {
    const paragraph =
      document.createElement(
        "p"
      );


    paragraph.textContent =
      content;


    details.append(
      paragraph
    );
  } else {
    details.append(
      content
    );
  }


  return details;
}


function renderDescription(
  description,
  elements
) {
  const copy =
    description ||
    "No description has been added to this catalogue entry yet.";


  elements
    .description
    .textContent =
      copy;


  elements
    .description
    .classList
    .remove(
      "is-collapsed"
    );


  elements
    .descriptionToggle
    .hidden =
      true;


  elements
    .descriptionToggle
    .textContent =
      "Read full story overview";


  elements
    .descriptionToggle
    .setAttribute(
      "aria-expanded",
      "true"
    );
}


function renderThemes(
  tags,
  elements
) {
  elements
    .themes
    .replaceChildren();


  const toggle =
    ensureThemesToggle(
      elements
    );


  if (
    !tags.length
  ) {
    elements
      .themesSection
      .hidden =
        true;


    toggle.hidden =
      true;


    return;
  }


  elements
    .themesSection
    .hidden =
      false;


  elements
    .themesSection
    .dataset
    .themeCount =
      String(
        tags.length
      );


  tags
    .forEach(
      (
        tag
      ) => {
        const link =
          document.createElement(
            "a"
          );


        link.className =
          "detail-chip detail-chip-theme";


        link.href =
          `search.html?tag=${
            encodeURIComponent(
              normalizeSearchParameter(
                tag
              )
            )
          }`;


        link.textContent =
          formatLabel(
            tag
          );


        elements
          .themes
          .append(
            link
          );
      }
    );


  elements
    .themes
    .classList
    .remove(
      "is-collapsed"
    );


  toggle.hidden =
    true;


  toggle.textContent =
    "Show all themes";


  toggle.setAttribute(
    "aria-expanded",
    "true"
  );
}


function ensureThemesToggle(
  elements
) {
  let toggle =
    elements
      .themesSection
      .querySelector(
        "[data-themes-toggle]"
      );


  if (toggle) {
    return toggle;
  }


  toggle =
    document.createElement(
      "button"
    );


  toggle.type =
    "button";


  toggle.className =
    "detail-themes-toggle";


  toggle.dataset.themesToggle =
    "";


  toggle.hidden =
    true;


  toggle.setAttribute(
    "aria-expanded",
    "true"
  );


  elements
    .themesSection
    .append(
      toggle
    );


  return toggle;
}


function composeEditorialAboutSection(
  elements
) {
  const aboutSection =
    elements
      .description
      .closest(
        ".detail-about-section"
      );


  const aboutCopy =
    elements
      .description
      .closest(
        ".detail-about-copy"
      );


  const descriptionWrap =
    elements
      .description
      .closest(
        ".detail-description-wrap"
      );


  if (
    !aboutSection ||
    !aboutCopy ||
    !descriptionWrap ||
    !elements.themesSection
  ) {
    return;
  }


  aboutSection
    .classList
    .add(
      "detail-about-editorial"
    );


  aboutCopy
    .classList
    .add(
      "detail-story-article"
    );


  elements
    .themesSection
    .classList
    .remove(
      "detail-theme-index"
    );


  elements
    .themesSection
    .classList
    .add(
      "detail-theme-sidebar"
    );


  /*
   * Place Themes immediately before the description. On wide screens it
   * floats to the right so the story copy uses the space beside and below
   * it. The mobile CSS changes the visual order so the description remains
   * first and Themes follows it.
   */
  aboutCopy.insertBefore(
    elements.themesSection,
    descriptionWrap
  );
}


function scheduleAboutContentBalance(
  elements
) {
  window
    .requestAnimationFrame(
      () => {
        window
          .requestAnimationFrame(
            () => {
              balanceAboutContent(
                elements
              );
            }
          );
      }
    );
}


function balanceAboutContent(
  elements
) {
  const description =
    elements.description;


  const descriptionToggle =
    elements.descriptionToggle;


  description
    .classList
    .remove(
      "is-collapsed"
    );


  const collapsedDescriptionHeight =
    window.innerWidth <= 780
      ? 560
      : 720;


  const descriptionNeedsToggle =
    description.scrollHeight >
    collapsedDescriptionHeight;


  description
    .classList
    .toggle(
      "is-collapsed",
      descriptionNeedsToggle
    );


  descriptionToggle.hidden =
    !descriptionNeedsToggle;


  descriptionToggle.textContent =
    "Read full story overview";


  descriptionToggle.setAttribute(
    "aria-expanded",
    String(
      !descriptionNeedsToggle
    )
  );


  const themesToggle =
    ensureThemesToggle(
      elements
    );


  const themeCount =
    elements
      .themes
      .children
      .length;


  const visibleThemeLimit =
    window.innerWidth <= 640
      ? 6
      : 8;


  elements
    .themes
    .style
    .setProperty(
      "--visible-theme-limit",
      String(
        visibleThemeLimit
      )
    );


  const themesNeedToggle =
    themeCount >
    visibleThemeLimit;


  elements
    .themes
    .classList
    .toggle(
      "is-collapsed",
      themesNeedToggle
    );


  themesToggle.hidden =
    !themesNeedToggle;


  themesToggle.textContent =
    "Show all themes";


  themesToggle.setAttribute(
    "aria-expanded",
    String(
      !themesNeedToggle
    )
  );
}


function configureSimilarLink(
  title,
  elements
) {
  const endcap =
    elements
      .similarLink
      .closest(
        ".detail-endcap"
      );


  if (
    endcap
  ) {
    let supportingCopy =
      endcap
        .querySelector(
          ".detail-endcap-supporting-copy"
        );


    if (
      !supportingCopy
    ) {
      supportingCopy =
        document.createElement(
          "p"
        );


      supportingCopy.className =
        "detail-endcap-supporting-copy";


      const heading =
        endcap
          .querySelector(
            "h2"
          );


      heading
        ?.insertAdjacentElement(
          "afterend",
          supportingCopy
        );
    }


    supportingCopy.textContent =
      "Recommendations based on shared genres and themes.";
  }


  const params =
    new URLSearchParams();


  params.set(
    "similarTo",
    title.id
  );


  params.set(
    "similarTitle",
    title.title
  );


  title
    .genres
    .forEach(
      (
        genre
      ) => {
        params.append(
          "similarGenre",

          normalizeSearchParameter(
            genre
          )
        );
      }
    );


  title
    .tags
    .forEach(
      (
        tag
      ) => {
        params.append(
          "similarTag",

          normalizeSearchParameter(
            tag
          )
        );
      }
    );


  if (
    !title.genres.length &&
    !title.tags.length
  ) {
    const fallbackType =
      normalizeSearchParameter(
        title.types[0] ||
        "story"
      );


    elements
      .similarLink
      .href =
        `search.html?type=${
          encodeURIComponent(
            fallbackType
          )
        }`;


    return;
  }


  elements
    .similarLink
    .href =
      `search.html?${
        params.toString()
      }`;
}


function activateMediaTab(
  tabId,
  elements,
  moveFocus
) {
  const tabs = [
    ...elements
      .mediaTabs
      .querySelectorAll(
        '[role="tab"]'
      )
  ];


  const panels = [
    ...elements
      .mediaPanels
      .querySelectorAll(
        '[role="tabpanel"]'
      )
  ];


  const activeTab =
    tabs.find(
      (
        tab
      ) => {
        return (
          tab
            .dataset
            .tabId ===
          tabId
        );
      }
    );


  if (
    !activeTab
  ) {
    return;
  }


  tabs
    .forEach(
      (
        tab
      ) => {
        const selected =
          tab ===
          activeTab;


        tab.setAttribute(
          "aria-selected",
          String(
            selected
          )
        );


        tab.tabIndex =
          selected
            ? 0
            : -1;
      }
    );


  panels
    .forEach(
      (
        panel
      ) => {
        panel.hidden =
          panel
            .dataset
            .panelId !==
          tabId;
      }
    );


  if (
    moveFocus
  ) {
    activeTab.focus({
      preventScroll:
        true
    });


    activeTab
      .scrollIntoView({
        behavior:
          "smooth",

        block:
          "nearest",

        inline:
          "nearest"
      });
  }
}


function getMediaPanelHeading(
  mediaType
) {
  return (
    {
      anime:
        "Anime adaptations",

      manga:
        "Manga publications"
    }[
      mediaType
    ] ||

    `${
      getMediaLabel(
        mediaType
      )
    } entries`
  );
}


function getMediaPanelDescription(
  mediaType
) {
  return (
    {
      anime:
        "Each season, special, OVA, and film remains a separate record so its facts never become mixed with another release.",

      manga:
        "Each publication is shown independently with its own chapters, volumes, publisher, magazine, and demographic."
    }[
      mediaType
    ] ||

    "Every catalogue entry is preserved and displayed independently."
  );
}


function getNotesLabel(
  mediaType
) {
  return mediaType ===
    "anime"
      ? "Adaptation notes"
      : "Publication notes";
}


function slugify(
  value
) {
  return String(
    value
  )
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-|-$/g,
      ""
    );
}


export function showDetailContent(
  elements
) {
  elements
    .loading
    .hidden =
      true;


  elements
    .error
    .hidden =
      true;


  elements
    .content
    .hidden =
      false;
}


export function showDetailError(
  elements,
  message
) {
  elements
    .loading
    .hidden =
      true;


  elements
    .content
    .hidden =
      true;


  elements
    .error
    .hidden =
      false;


  elements
    .errorMessage
    .textContent =
      message;


  document.title =
    "Title Unavailable | Inkwell";
}