// search-selects.js
// Accessible custom select controls for Sort By and Show.

export function createCustomSelectController({
  selects,
  onChange
}) {
  /* =======================================================
     INITIALIZE EVERY CUSTOM SELECT
     ======================================================= */

  function initialize() {
    selects.forEach((select) => {
      const trigger =
        select.querySelector(
          "[data-select-trigger]"
        );

      const menu =
        select.querySelector(
          "[data-select-menu]"
        );

      const options = [
        ...menu.querySelectorAll(
          "[data-option-value]"
        )
      ];


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
            open(select);
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
              option.dataset
                .optionValue
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


      options.forEach((option) => {
        option.setAttribute(
          "aria-selected",
          "false"
        );

        option.tabIndex =
          -1;
      });
    });
  }


  /* =======================================================
     CONTROL IDENTIFICATION
     ======================================================= */

  function getKind(
    select
  ) {
    return select.querySelector(
      "#sort-select-trigger"
    )
      ? "sort"
      : "perPage";
  }


  function findOption(
    select,
    value
  ) {
    return [
      ...select.querySelectorAll(
        "[data-option-value]"
      )
    ].find((option) => {
      return (
        option.dataset
          .optionValue ===
        String(value)
      );
    });
  }


  /* =======================================================
     OPEN AND CLOSE
     ======================================================= */

  function open(
    select
  ) {
    closeAll(
      select
    );

    const trigger =
      select.querySelector(
        "[data-select-trigger]"
      );

    const menu =
      select.querySelector(
        "[data-select-menu]"
      );

    select.classList.add(
      "is-open"
    );

    menu.hidden =
      false;

    trigger.setAttribute(
      "aria-expanded",
      "true"
    );

    const selected =
      menu.querySelector(
        '[aria-selected="true"]'
      ) ||
      menu.querySelector(
        "[data-option-value]"
      );

    updateHighlight(
      select,
      selected
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

    menu.hidden =
      true;

    trigger.setAttribute(
      "aria-expanded",
      "false"
    );

    menu
      .querySelectorAll(
        "[data-option-value]"
      )
      .forEach((option) => {
        option.classList.remove(
          "is-active"
        );

        option.tabIndex =
          -1;
      });

    if (returnFocus) {
      trigger.focus();
    }
  }


  function closeAll(
    except = null
  ) {
    selects.forEach((select) => {
      if (
        select !== except
      ) {
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

    select
      .querySelector(
        "[data-select-value]"
      )
      .textContent =
        option.textContent.trim();

    select
      .querySelectorAll(
        "[data-option-value]"
      )
      .forEach((item) => {
        item.setAttribute(
          "aria-selected",
          String(
            item === option
          )
        );
      });
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

    open(select);

    const menu =
      select.querySelector(
        "[data-select-menu]"
      );

    const selected =
      menu.querySelector(
        '[aria-selected="true"]'
      ) ||
      menu.querySelector(
        "[data-option-value]"
      );

    selected?.focus();
  }


  function handleMenuKeydown(
    event,
    select
  ) {
    const options = [
      ...select.querySelectorAll(
        "[data-option-value]"
      )
    ];

    const currentIndex =
      options.indexOf(
        document.activeElement
      );


    if (
      event.key ===
      "ArrowDown"
    ) {
      event.preventDefault();

      const next =
        options[
          Math.min(
            currentIndex + 1,
            options.length - 1
          )
        ];

      updateHighlight(
        select,
        next
      );

      next?.focus();

      return;
    }


    if (
      event.key ===
      "ArrowUp"
    ) {
      event.preventDefault();

      const previous =
        options[
          Math.max(
            currentIndex - 1,
            0
          )
        ];

      updateHighlight(
        select,
        previous
      );

      previous?.focus();

      return;
    }


    if (
      event.key ===
      "Home"
    ) {
      event.preventDefault();

      updateHighlight(
        select,
        options[0]
      );

      options[0]?.focus();

      return;
    }


    if (
      event.key ===
      "End"
    ) {
      event.preventDefault();

      const last =
        options[
          options.length - 1
        ];

      updateHighlight(
        select,
        last
      );

      last?.focus();

      return;
    }


    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();

      const option =
        document.activeElement
          .closest?.(
            "[data-option-value]"
          );

      if (option) {
        choose(
          select,
          option.dataset
            .optionValue
        );
      }

      return;
    }


    if (
      event.key === "Escape" ||
      event.key === "Tab"
    ) {
      close(
        select,
        event.key === "Escape"
      );
    }
  }


  function updateHighlight(
    select,
    activeOption
  ) {
    select
      .querySelectorAll(
        "[data-option-value]"
      )
      .forEach((option) => {
        option.classList.toggle(
          "is-active",
          option === activeOption
        );
      });
  }


  return {
    initialize,
    closeAll,
    sync
  };
}