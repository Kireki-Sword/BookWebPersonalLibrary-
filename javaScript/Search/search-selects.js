// search-selects.js
// Accessible custom select controls for Sort By and Show.
// Prevents keyboard focus from making the whole page jump.

export function createCustomSelectController({
  selects,
  onChange
}) {
  /* =======================================================
     INITIALIZE EVERY CUSTOM SELECT
     ======================================================= */

  function initialize() {
    selects.forEach((select, selectIndex) => {
      const trigger =
        select.querySelector(
          "[data-select-trigger]"
        );

      const menu =
        select.querySelector(
          "[data-select-menu]"
        );

      const options =
        getOptions(select);

      if (
        !trigger ||
        !menu ||
        !options.length
      ) {
        return;
      }

      options.forEach(
        (option, optionIndex) => {
          if (!option.id) {
            option.id =
              `custom-select-${selectIndex}-option-${optionIndex}`;
          }

          option.setAttribute(
            "aria-selected",
            "false"
          );

          option.tabIndex = -1;
        }
      );

      const initialOption =
        findOption(
          select,
          select.dataset.value
        ) ||
        options[0];

      setDisplayedValue(
        select,
        initialOption,
        initialOption.dataset.optionValue
      );

      trigger.addEventListener(
        "click",
        () => {
          if (
            select.classList.contains(
              "is-open"
            )
          ) {
            close(select);
          } else {
            open(
              select,
              false
            );
          }
        }
      );

      trigger.addEventListener(
        "keydown",
        (event) => {
          handleTriggerKeydown(
            event,
            select
          );
        }
      );

      menu.addEventListener(
        "click",
        (event) => {
          const option =
            event.target.closest(
              "[data-option-value]"
            );

          if (option) {
            choose(
              select,
              option.dataset.optionValue
            );
          }
        }
      );

      menu.addEventListener(
        "keydown",
        (event) => {
          handleMenuKeydown(
            event,
            select
          );
        }
      );
    });
  }

  /* =======================================================
     CONTROL HELPERS
     ======================================================= */

  function getKind(select) {
    return select.querySelector(
      "#sort-select-trigger"
    )
      ? "sort"
      : "perPage";
  }

  function getOptions(select) {
    return [
      ...select.querySelectorAll(
        "[data-option-value]"
      )
    ];
  }

  function findOption(
    select,
    value
  ) {
    return getOptions(select).find(
      (option) => {
        return (
          option.dataset.optionValue ===
          String(value)
        );
      }
    );
  }

  function getSelectedOption(select) {
    const menu =
      select.querySelector(
        "[data-select-menu]"
      );

    return (
      menu.querySelector(
        '[aria-selected="true"]'
      ) ||
      menu.querySelector(
        "[data-option-value]"
      )
    );
  }

  /* =======================================================
     OPEN AND CLOSE
     ======================================================= */

  function open(
    select,
    focusMenuOption = false
  ) {
    closeAll(select);

    const trigger =
      select.querySelector(
        "[data-select-trigger]"
      );

    const menu =
      select.querySelector(
        "[data-select-menu]"
      );

    const selected =
      getSelectedOption(select);

    select.classList.add(
      "is-open"
    );

    menu.hidden = false;

    trigger.setAttribute(
      "aria-expanded",
      "true"
    );

    updateHighlight(
      select,
      selected
    );

    window.requestAnimationFrame(
      () => {
        keepOptionVisible(
          select,
          selected
        );

        if (focusMenuOption) {
          focusOption(
            select,
            selected
          );
        }
      }
    );
  }

  function close(
    select,
    returnFocus = false
  ) {
    const trigger =
      select.querySelector(
        "[data-select-trigger]"
      );

    const menu =
      select.querySelector(
        "[data-select-menu]"
      );

    select.classList.remove(
      "is-open"
    );

    menu.hidden = true;

    trigger.setAttribute(
      "aria-expanded",
      "false"
    );

    getOptions(select).forEach(
      (option) => {
        option.classList.remove(
          "is-active"
        );

        option.tabIndex = -1;
      }
    );

    if (returnFocus) {
      trigger.focus({
        preventScroll: true
      });
    }
  }

  function closeAll(
    except = null
  ) {
    selects.forEach((select) => {
      if (select !== except) {
        close(select);
      }
    });
  }

  /* =======================================================
     CHOOSE AND DISPLAY VALUE
     ======================================================= */

  function choose(
    select,
    value
  ) {
    const option =
      findOption(
        select,
        value
      );

    if (!option) {
      return;
    }

    setDisplayedValue(
      select,
      option,
      value
    );

    close(
      select,
      true
    );

    onChange(
      getKind(select),
      String(value)
    );
  }

  function setDisplayedValue(
    select,
    option,
    value
  ) {
    select.dataset.value =
      String(value);

    const displayedValue =
      select.querySelector(
        "[data-select-value]"
      );

    if (displayedValue) {
      displayedValue.textContent =
        option.textContent.trim();
    }

    getOptions(select).forEach(
      (item) => {
        item.setAttribute(
          "aria-selected",
          String(
            item === option
          )
        );
      }
    );
  }

  function sync(
    kind,
    value
  ) {
    const select =
      selects.find((item) => {
        return (
          getKind(item) ===
          kind
        );
      });

    if (!select) {
      return;
    }

    const option =
      findOption(
        select,
        value
      );

    if (option) {
      setDisplayedValue(
        select,
        option,
        value
      );
    }
  }

  /* =======================================================
     KEYBOARD BEHAVIOUR
     ======================================================= */

  function handleTriggerKeydown(
    event,
    select
  ) {
    const openKeys = [
      "ArrowDown",
      "ArrowUp",
      "Enter",
      " "
    ];

    if (
      !openKeys.includes(
        event.key
      )
    ) {
      return;
    }

    event.preventDefault();

    open(
      select,
      true
    );
  }

  function handleMenuKeydown(
    event,
    select
  ) {
    const options =
      getOptions(select);

    let currentIndex =
      options.indexOf(
        document.activeElement
      );

    if (currentIndex < 0) {
      currentIndex =
        Math.max(
          0,
          options.indexOf(
            getSelectedOption(select)
          )
        );
    }

    if (
      event.key ===
      "ArrowDown"
    ) {
      event.preventDefault();

      focusOption(
        select,
        options[
          Math.min(
            currentIndex + 1,
            options.length - 1
          )
        ]
      );

      return;
    }

    if (
      event.key ===
      "ArrowUp"
    ) {
      event.preventDefault();

      focusOption(
        select,
        options[
          Math.max(
            currentIndex - 1,
            0
          )
        ]
      );

      return;
    }

    if (
      event.key ===
      "Home"
    ) {
      event.preventDefault();

      focusOption(
        select,
        options[0]
      );

      return;
    }

    if (
      event.key ===
      "End"
    ) {
      event.preventDefault();

      focusOption(
        select,
        options[
          options.length - 1
        ]
      );

      return;
    }

    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();

      const option =
        document.activeElement.closest?.(
          "[data-option-value]"
        );

      if (option) {
        choose(
          select,
          option.dataset.optionValue
        );
      }

      return;
    }

    if (
      event.key ===
      "Escape"
    ) {
      event.preventDefault();

      close(
        select,
        true
      );

      return;
    }

    if (
      event.key ===
      "Tab"
    ) {
      close(select);
    }
  }

  /* =======================================================
     INTERNAL MENU SCROLLING
     ======================================================= */

  function focusOption(
    select,
    option
  ) {
    if (!option) {
      return;
    }

    updateHighlight(
      select,
      option
    );

    /*
      preventScroll stops the browser from scrolling
      the entire page when an option receives focus.
    */

    option.focus({
      preventScroll: true
    });

    keepOptionVisible(
      select,
      option
    );
  }

  function keepOptionVisible(
    select,
    option
  ) {
    if (!option) {
      return;
    }

    const menu =
      select.querySelector(
        "[data-select-menu]"
      );

    if (
      !menu ||
      menu.hidden
    ) {
      return;
    }

    const menuRect =
      menu.getBoundingClientRect();

    const optionRect =
      option.getBoundingClientRect();

    const edgePadding = 8;

    let nextScrollTop =
      menu.scrollTop;

    if (
      optionRect.top <
      menuRect.top + edgePadding
    ) {
      nextScrollTop -=
        menuRect.top +
        edgePadding -
        optionRect.top;
    } else if (
      optionRect.bottom >
      menuRect.bottom - edgePadding
    ) {
      nextScrollTop +=
        optionRect.bottom -
        (
          menuRect.bottom -
          edgePadding
        );
    } else {
      return;
    }

    /*
      Scroll only the dropdown menu.
      "auto" avoids queued animations when an arrow key
      is pressed repeatedly.
    */

    menu.scrollTo({
      top: nextScrollTop,
      behavior: "auto"
    });
  }

  function updateHighlight(
    select,
    activeOption
  ) {
    getOptions(select).forEach(
      (option) => {
        const isActive =
          option === activeOption;

        option.classList.toggle(
          "is-active",
          isActive
        );

        option.tabIndex =
          isActive
            ? 0
            : -1;
      }
    );
  }

  return {
    initialize,
    closeAll,
    sync
  };
}