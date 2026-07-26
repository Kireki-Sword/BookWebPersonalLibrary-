(() => {
  "use strict";

  const body = document.body;
  const shell = document.querySelector("[data-auth-shell]");
  const formsLayer = document.querySelector("[data-auth-forms-layer]");
  const views = [...document.querySelectorAll("[data-auth-view]")];
  const switchControls = [...document.querySelectorAll("[data-auth-switch]")];
  const panelSwitch = document.querySelector("[data-panel-switch]");
  const panelSwitchLabel = document.querySelector("[data-panel-switch-label]");
  const chapterNumber = document.querySelector("[data-chapter-number]");
  const storyCopies = [...document.querySelectorAll("[data-story-copy]")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileLayout = window.matchMedia("(max-width: 900px)");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const validModes = new Set(["login", "signup"]);
  let currentMode = "login";
  let transitionTimer = 0;

  function modeFromLocation() {
    const params = new URLSearchParams(window.location.search);
    const queryMode = params.get("mode");
    return validModes.has(queryMode) ? queryMode : "login";
  }

  function updateUrl(mode, replace = false) {
    const url = new URL(window.location.href);
    url.searchParams.set("mode", mode);
    const state = { authMode: mode };

    if (replace) {
      window.history.replaceState(state, "", url);
    } else {
      window.history.pushState(state, "", url);
    }
  }

  function syncMobileHeight() {
    if (!formsLayer || !mobileLayout.matches) {
      formsLayer?.style.removeProperty("height");
      return;
    }

    const activeView = document.querySelector(`[data-auth-view="${currentMode}"]`);
    if (!activeView) return;
    formsLayer.style.height = `${activeView.scrollHeight}px`;
  }

  function updateTabs(mode) {
    switchControls.forEach((control) => {
      const isSelected = control.dataset.authSwitch === mode;
      if (control.getAttribute("role") === "tab") {
        control.setAttribute("aria-selected", String(isSelected));
        control.tabIndex = isSelected ? 0 : -1;
      }
    });
  }

  function updateStoryPanel(mode) {
    const nextMode = mode === "login" ? "signup" : "login";

    if (panelSwitch) panelSwitch.dataset.panelSwitch = nextMode;
    if (panelSwitchLabel) {
      panelSwitchLabel.textContent = mode === "login" ? "Create an account" : "Return to login";
    }
    if (chapterNumber) chapterNumber.textContent = mode === "login" ? "01 / 02" : "02 / 02";

    storyCopies.forEach((copy) => {
      const isCurrent = copy.dataset.storyCopy === mode;
      copy.setAttribute("aria-hidden", String(!isCurrent));
    });
  }

  function focusFirstField(mode) {
    const activeView = document.querySelector(`[data-auth-view="${mode}"]`);
    const firstField = activeView?.querySelector("input:not([type='checkbox'])");
    firstField?.focus({ preventScroll: true });
  }

  function setMode(mode, options = {}) {
    const nextMode = validModes.has(mode) ? mode : "login";
    const {
      updateHistory = true,
      replaceHistory = false,
      moveFocus = true
    } = options;

    if (nextMode === currentMode && !replaceHistory) return;

    window.clearTimeout(transitionTimer);
    currentMode = nextMode;
    body.dataset.authMode = nextMode;
    shell?.setAttribute("data-transitioning", "true");

    updateTabs(nextMode);
    updateStoryPanel(nextMode);

    views.forEach((view) => {
      const isActive = view.dataset.authView === nextMode;
      view.classList.toggle("is-active", isActive);
      view.toggleAttribute("inert", !isActive);
      view.setAttribute("aria-hidden", String(!isActive));
    });

    document.title = nextMode === "login" ? "Log in · Inkwell" : "Sign up · Inkwell";

    if (updateHistory) updateUrl(nextMode, replaceHistory);

    requestAnimationFrame(syncMobileHeight);

    const wait = reducedMotion.matches ? 0 : 590;
    transitionTimer = window.setTimeout(() => {
      shell?.removeAttribute("data-transitioning");
      syncMobileHeight();
      if (moveFocus) focusFirstField(nextMode);
    }, wait);
  }

  switchControls.forEach((control) => {
    control.addEventListener("click", (event) => {
      event.preventDefault();
      setMode(control.dataset.authSwitch);
    });
  });

  panelSwitch?.addEventListener("click", () => {
    setMode(panelSwitch.dataset.panelSwitch || "signup");
  });

  window.addEventListener("popstate", (event) => {
    setMode(event.state?.authMode || modeFromLocation(), {
      updateHistory: false,
      moveFocus: false
    });
  });

  window.addEventListener("resize", syncMobileHeight, { passive: true });
  mobileLayout.addEventListener?.("change", syncMobileHeight);

  document.querySelectorAll("[data-password-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.getElementById(button.dataset.passwordToggle);
      if (!input) return;

      const isShowing = input.type === "text";
      input.type = isShowing ? "password" : "text";
      button.setAttribute("aria-label", isShowing ? "Show password" : "Hide password");

      const icon = button.querySelector("i");
      icon?.classList.toggle("ti-eye", isShowing);
      icon?.classList.toggle("ti-eye-off", !isShowing);
      input.focus({ preventScroll: true });
    });
  });

  function messageElement(input) {
    if (input.name === "terms") {
      return document.getElementById("signup-terms-error");
    }
    const describedBy = input.getAttribute("aria-describedby") || "";
    const errorId = describedBy.split(/\s+/).find((id) => id.endsWith("-error"));
    return errorId ? document.getElementById(errorId) : null;
  }

  function setFieldError(input, message = "") {
    const field = input.closest(".auth-field");
    field?.classList.toggle("is-invalid", Boolean(message));
    input.setAttribute("aria-invalid", String(Boolean(message)));

    const output = messageElement(input);
    if (output) output.textContent = message;

    return !message;
  }

  function validateLoginInput(input) {
    if (input.name === "email") {
      const value = input.value.trim();
      if (!value) return setFieldError(input, "Enter your email address.");
      if (!emailPattern.test(value)) {
        return setFieldError(input, "Use an email address such as reader@example.com.");
      }
    }

    if (input.name === "password" && !input.value) {
      return setFieldError(input, "Enter your password.");
    }

    return setFieldError(input);
  }

  function validateSignupInput(input) {
    if (input.name === "email") {
      const value = input.value.trim();
      if (!value) return setFieldError(input, "Enter your email address.");
      if (!emailPattern.test(value)) {
        return setFieldError(input, "Use an email address such as reader@example.com.");
      }
    }

    if (input.name === "password") {
      if (!input.value) return setFieldError(input, "Create a password.");
      if (input.value.length < 8) {
        return setFieldError(input, "Use at least 8 characters. Longer passwords are stronger.");
      }
    }

    if (input.name === "terms" && !input.checked) {
      return setFieldError(input, "Agree to the Terms and Privacy Policy to continue.");
    }

    return setFieldError(input);
  }

  function addLiveValidation(form, validator) {
    if (!form) return;

    [...form.elements].forEach((control) => {
      if (!(control instanceof HTMLInputElement)) return;

      control.addEventListener("blur", () => validator(control));
      control.addEventListener(control.type === "checkbox" ? "change" : "input", () => {
        if (control.getAttribute("aria-invalid") === "true") validator(control);
      });
    });
  }

  function setSubmitState(button, state) {
    if (!button) return;

    const icon = button.querySelector("i");
    button.classList.toggle("is-loading", state === "loading");
    button.disabled = state === "loading";

    icon?.classList.remove("ti-arrow-right", "ti-loader-2", "ti-check");
    icon?.classList.add(
      state === "loading" ? "ti-loader-2" : state === "success" ? "ti-check" : "ti-arrow-right"
    );
  }

  function setupForm(form, validator, successMessage) {
    if (!form) return;
    addLiveValidation(form, validator);

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const controls = [...form.elements].filter((control) => control instanceof HTMLInputElement);
      const isValid = controls.map((control) => validator(control)).every(Boolean);
      const status = form.querySelector("[data-form-status]");
      const button = form.querySelector(".auth-primary-action");

      if (!isValid) {
        if (status) {
          status.textContent = "Check the highlighted fields and try again.";
          status.dataset.status = "error";
        }
        form.querySelector('[aria-invalid="true"]')?.focus();
        syncMobileHeight();
        return;
      }

      if (status) {
        status.textContent = "Checking your details…";
        status.dataset.status = "loading";
      }
      setSubmitState(button, "loading");

      window.setTimeout(() => {
        setSubmitState(button, "success");
        if (status) {
          status.textContent = successMessage;
          status.dataset.status = "success";
        }
        syncMobileHeight();
      }, 720);
    });
  }

  const loginForm = document.querySelector('[data-auth-form="login"]');
  const signupForm = document.querySelector('[data-auth-form="signup"]');

  setupForm(
    loginForm,
    validateLoginInput,
    "Front-end demo complete. Connect this form to your authentication service next."
  );

  setupForm(
    signupForm,
    validateSignupInput,
    "Front-end demo complete. Connect account creation to your authentication service next."
  );

  const passwordFeedback = document.querySelector("[data-password-feedback]");
  const passwordInput = document.getElementById("signup-password");

  function passwordScore(value) {
    if (!value) return 0;
    let score = 0;
    if (value.length >= 8) score += 1;
    if (value.length >= 12) score += 1;
    if (/\p{L}/u.test(value) && /[^\p{L}\s]/u.test(value)) score += 1;
    if (value.length >= 15 && new Set(value).size >= 9) score += 1;
    return Math.min(score, 4);
  }

  function updatePasswordFeedback(value) {
    if (!passwordFeedback) return;

    const score = passwordScore(value);
    const messages = [
      "Use 8 or more characters. Longer is stronger.",
      "Password strength: weak.",
      "Password strength: fair.",
      "Password strength: good.",
      "Password strength: strong."
    ];

    passwordFeedback.dataset.score = String(score);
    const label = passwordFeedback.querySelector("[data-strength-label]");
    if (label) label.textContent = messages[score];
  }

  passwordInput?.addEventListener("input", (event) => {
    updatePasswordFeedback(event.currentTarget.value);
  });

  document.querySelectorAll("[data-demo-provider]").forEach((button) => {
    button.addEventListener("click", () => {
      const form = button.closest("[data-auth-view]")?.querySelector(".auth-form");
      const status = form?.querySelector("[data-form-status]");
      if (!status) return;

      status.textContent = `${button.dataset.demoProvider} is a visual placeholder in this front-end build.`;
      status.dataset.status = "info";
      syncMobileHeight();
    });
  });

  document.querySelector("[data-demo-forgot]")?.addEventListener("click", () => {
    const status = loginForm?.querySelector("[data-form-status]");
    if (!status) return;
    status.textContent = "Password recovery is a front-end placeholder for now.";
    status.dataset.status = "info";
    syncMobileHeight();
  });

  // Gentle pointer depth for the original story-card composition.
  const memoryScene = document.querySelector("[data-memory-scene]");
  if (memoryScene && !reducedMotion.matches) {
    shell?.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch") return;
      const bounds = shell.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      memoryScene.style.transform = `rotateX(${(-y * 2.5).toFixed(2)}deg) rotateY(${(x * 3.5).toFixed(2)}deg)`;
    });

    shell?.addEventListener("pointerleave", () => {
      memoryScene.style.transform = "rotateX(0deg) rotateY(0deg)";
    });
  }

  currentMode = modeFromLocation();
  setMode(currentMode, {
    updateHistory: true,
    replaceHistory: true,
    moveFocus: false
  });
  updatePasswordFeedback(passwordInput?.value || "");
  requestAnimationFrame(syncMobileHeight);
})();