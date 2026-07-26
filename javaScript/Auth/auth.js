// Inkwell authentication page.
// Handles fluid mode switching plus real Supabase email/password, Google OAuth,
// password recovery, and post-auth redirects.

(() => {
  "use strict";

  const READY_EVENT = "DOMContentLoaded";
  const MODES = new Set(["login", "signup", "forgot"]);
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const TRANSITION_MS = 580;

  function startAuthPage() {
    const supabase = window.inkwellSupabase;
    const body = document.body;
    const shell = document.querySelector("[data-auth-shell]");
    const formStage = document.querySelector("[data-auth-form-stage]");
    const views = [...document.querySelectorAll("[data-auth-view]")];
    const switches = [...document.querySelectorAll("[data-auth-switch]")];
    const storyCopies = [...document.querySelectorAll("[data-story-copy]")];
    const mobileTabs = [...document.querySelectorAll(".auth-mobile-tab")];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileLayout = window.matchMedia("(max-width: 860px)");

    if (!supabase || !body || !shell || views.length === 0) {
      console.error("The authentication page could not start.");
      return;
    }

    let currentMode = modeFromLocation();
    let transitionTimer = null;

    function modeFromLocation() {
      const requested = new URLSearchParams(window.location.search).get("mode");
      return MODES.has(requested) ? requested : "login";
    }

    function updateUrl(mode, replace = false) {
      const url = new URL(window.location.href);
      url.searchParams.set("mode", mode);
      const method = replace ? "replaceState" : "pushState";
      window.history[method]({ authMode: mode }, "", url);
    }

    function updateMobileTabs(mode) {
      mobileTabs.forEach((button) => {
        const selected = button.dataset.authSwitch === mode;
        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-selected", String(selected));
        button.tabIndex = selected ? 0 : -1;
      });
    }

    function updateStoryCopy(mode) {
      storyCopies.forEach((copy) => {
        const active = copy.dataset.storyCopy === mode;
        copy.classList.toggle("is-active", active);
        copy.setAttribute("aria-hidden", String(!active));
      });
    }

    function syncMobileHeight() {
      if (!mobileLayout.matches) {
        formStage.style.removeProperty("height");
        return;
      }

      const activeView = document.querySelector(`[data-auth-view="${currentMode}"]`);
      if (!activeView) return;
      formStage.style.height = `${activeView.scrollHeight}px`;
    }

    function focusFirstField(mode) {
      const activeView = document.querySelector(`[data-auth-view="${mode}"]`);
      activeView
        ?.querySelector("input:not([type='checkbox'])")
        ?.focus({ preventScroll: true });
    }

    function setMode(mode, options = {}) {
      const nextMode = MODES.has(mode) ? mode : "login";
      const {
        updateHistory = true,
        replaceHistory = false,
        moveFocus = true
      } = options;

      if (nextMode === currentMode && !replaceHistory) return;

      window.clearTimeout(transitionTimer);
      shell.dataset.transitioning = "true";
      currentMode = nextMode;
      body.dataset.authMode = nextMode;

      views.forEach((view) => {
        const active = view.dataset.authView === nextMode;

        if (active) {
          view.hidden = false;
          view.inert = false;
          view.setAttribute("aria-hidden", "false");
          requestAnimationFrame(() => view.classList.add("is-active"));
        } else {
          view.classList.remove("is-active");
          view.inert = true;
          view.setAttribute("aria-hidden", "true");
        }
      });

      updateMobileTabs(nextMode);
      updateStoryCopy(nextMode);
      document.title =
        nextMode === "signup"
          ? "Sign up · Inkwell"
          : nextMode === "forgot"
            ? "Forgot password · Inkwell"
            : "Log in · Inkwell";

      if (updateHistory) updateUrl(nextMode, replaceHistory);

      requestAnimationFrame(syncMobileHeight);

      const delay = reducedMotion.matches ? 1 : TRANSITION_MS;
      transitionTimer = window.setTimeout(() => {
        views.forEach((view) => {
          const active = view.dataset.authView === nextMode;
          if (!active) view.hidden = true;
        });

        delete shell.dataset.transitioning;
        syncMobileHeight();
        if (moveFocus) focusFirstField(nextMode);
      }, delay);
    }

    switches.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        setMode(button.dataset.authSwitch || "login");
      });
    });

    window.addEventListener("popstate", (event) => {
      setMode(event.state?.authMode || modeFromLocation(), {
        updateHistory: false,
        moveFocus: false
      });
    });

    window.addEventListener("resize", syncMobileHeight, { passive: true });
    mobileLayout.addEventListener?.("change", syncMobileHeight);

    initializePasswordToggles();
    initializePasswordStrength();
    initializeLoginForm(supabase);
    initializeSignupForm(supabase);
    initializeForgotForm(supabase);
    initializeOAuthButtons(supabase);
    initializeAuthReturn(supabase);

    setMode(currentMode, {
      updateHistory: false,
      replaceHistory: true,
      moveFocus: false
    });

    // Make the initial view visible even when the URL mode equals the default.
    const initialView = document.querySelector(`[data-auth-view="${currentMode}"]`);
    initialView.hidden = false;
    initialView.inert = false;
    initialView.setAttribute("aria-hidden", "false");
    initialView.classList.add("is-active");
    updateMobileTabs(currentMode);
    updateStoryCopy(currentMode);
    requestAnimationFrame(syncMobileHeight);
  }

  function initializePasswordToggles() {
    document.querySelectorAll("[data-password-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        const input = document.getElementById(button.dataset.passwordToggle);
        if (!input) return;

        const willShow = input.type === "password";
        input.type = willShow ? "text" : "password";
        button.setAttribute("aria-label", willShow ? "Hide password" : "Show password");
        button.setAttribute("aria-pressed", String(willShow));

        const icon = button.querySelector("i");
        icon?.classList.toggle("ti-eye", !willShow);
        icon?.classList.toggle("ti-eye-off", willShow);
        input.focus({ preventScroll: true });
      });
    });
  }

  function initializePasswordStrength() {
    const input = document.getElementById("signup-password");
    const feedback = document.querySelector("[data-password-feedback]");
    if (!input || !feedback) return;

    input.addEventListener("input", () => {
      const score = passwordScore(input.value);
      const labels = [
        "Use 8 or more characters. Longer is stronger.",
        "Password strength: weak.",
        "Password strength: fair.",
        "Password strength: good.",
        "Password strength: strong."
      ];

      feedback.dataset.score = String(score);
      const label = feedback.querySelector("[data-strength-label]");
      if (label) label.textContent = labels[score];
    });
  }

  function passwordScore(value) {
    if (!value) return 0;
    let score = 0;
    if (value.length >= 8) score += 1;
    if (value.length >= 12) score += 1;
    if (/\p{L}/u.test(value) && /[^\p{L}\s]/u.test(value)) score += 1;
    if (value.length >= 15 && new Set(value).size >= 9) score += 1;
    return Math.min(score, 4);
  }

  function initializeLoginForm(supabase) {
    const form = document.getElementById("login-form");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearFormErrors(form);

      const email = form.elements.email.value.trim();
      const password = form.elements.password.value;
      let valid = true;

      if (!EMAIL_PATTERN.test(email)) {
        valid = setFieldError(form.elements.email, "Enter a valid email address.") && valid;
      }

      if (!password) {
        valid = setFieldError(form.elements.password, "Enter your password.") && valid;
      }

      if (!valid) {
        focusFirstInvalid(form);
        setFormStatus(form, "Check the highlighted fields and try again.", "error");
        return;
      }

      const button = form.querySelector(".auth-primary-action");
      setButtonState(button, "loading", "Logging you in…");
      setFormStatus(form, "Checking your account…", "info");

      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (!data.session) throw new Error("No authenticated session was returned.");

        form.elements.password.value = "";
        setButtonState(button, "success", "Welcome back");
        setFormStatus(form, "Welcome back. Opening your library…", "success");
        window.setTimeout(() => window.location.assign(getSafeNextUrl()), 450);
      } catch (error) {
        console.error("Login failed:", error);
        form.elements.password.value = "";
        setButtonState(button, "idle", "Continue to Inkwell");
        setFormStatus(form, "The email or password was incorrect.", "error");
        form.elements.password.focus();
      }
    });
  }

  function initializeSignupForm(supabase) {
    const form = document.getElementById("signup-form");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearFormErrors(form);

      const displayName = form.elements.displayName.value.trim();
      const email = form.elements.email.value.trim();
      const password = form.elements.password.value;
      const terms = form.elements.terms.checked;
      let valid = true;

      if (displayName.length < 2) {
        valid = setFieldError(form.elements.displayName, "Use at least 2 characters.") && valid;
      }

      if (!EMAIL_PATTERN.test(email)) {
        valid = setFieldError(form.elements.email, "Enter a valid email address.") && valid;
      }

      if (password.length < 8) {
        valid = setFieldError(form.elements.password, "Use at least 8 characters.") && valid;
      }

      if (!terms) {
        valid = setFieldError(form.elements.terms, "Agree to the Terms and Privacy Policy to continue.") && valid;
      }

      if (!valid) {
        focusFirstInvalid(form);
        setFormStatus(form, "Check the highlighted fields and try again.", "error");
        return;
      }

      const button = form.querySelector(".auth-primary-action");
      setButtonState(button, "loading", "Creating your library…");
      setFormStatus(form, "Creating your account…", "info");

      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: buildPageUrl("auth.html", {
              mode: "login",
              verified: "1",
              next: getNextParameter()
            }),
            data: {
              display_name: displayName
            }
          }
        });

        if (error) throw error;
        form.elements.password.value = "";

        if (!data.session) {
          setButtonState(button, "success", "Check your email");
          setFormStatus(
            form,
            "Account created. Check your email and confirm the address before logging in.",
            "success"
          );
          return;
        }

        setButtonState(button, "success", "Account created");
        setFormStatus(form, "Your account is ready. Opening your library…", "success");
        window.setTimeout(() => window.location.assign(getSafeNextUrl()), 450);
      } catch (error) {
        console.error("Sign-up failed:", error);
        setButtonState(button, "idle", "Create my library");
        setFormStatus(form, friendlySignupError(error), "error");
      }
    });
  }

  function initializeForgotForm(supabase) {
    const form = document.getElementById("forgot-form");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearFormErrors(form);

      const email = form.elements.email.value.trim();
      if (!EMAIL_PATTERN.test(email)) {
        setFieldError(form.elements.email, "Enter a valid email address.");
        focusFirstInvalid(form);
        return;
      }

      const button = form.querySelector(".auth-primary-action");
      setButtonState(button, "loading", "Sending reset link…");
      setFormStatus(form, "Preparing your recovery email…", "info");

      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: buildPageUrl("reset-password.html")
        });

        if (error) throw error;
        setButtonState(button, "success", "Email sent");
        setFormStatus(
          form,
          "If an account uses that email, a password-reset link is on the way.",
          "success"
        );
      } catch (error) {
        console.error("Password recovery failed:", error);
        setButtonState(button, "idle", "Send reset link");
        setFormStatus(form, "We could not send the reset email. Try again shortly.", "error");
      }
    });
  }

  function initializeOAuthButtons(supabase) {
    document.querySelectorAll("[data-oauth-provider]").forEach((button) => {
      button.addEventListener("click", async () => {
        const provider = button.dataset.oauthProvider;
        const form = button.closest("[data-auth-view]")?.querySelector("form");
        button.disabled = true;

        if (form) setFormStatus(form, `Opening ${capitalize(provider)}…`, "info");

        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
              redirectTo: buildPageUrl("auth.html", {
                mode: "login",
                oauth: "1",
                next: getNextParameter()
              })
            }
          });

          if (error) throw error;
        } catch (error) {
          console.error(`${provider} login failed:`, error);
          button.disabled = false;
          if (form) {
            setFormStatus(
              form,
              `${capitalize(provider)} sign-in is unavailable. Check the provider and redirect settings.`,
              "error"
            );
          }
        }
      });
    });
  }

  async function initializeAuthReturn(supabase) {
    const parameters = new URLSearchParams(window.location.search);
    const expectsReturn = parameters.has("oauth") || parameters.has("verified");

    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (data.session && expectsReturn) {
        const activeForm = document.querySelector('[data-auth-view="login"] form');
        if (activeForm) {
          setFormStatus(activeForm, "Authentication complete. Opening your library…", "success");
        }
        window.setTimeout(() => window.location.assign(getSafeNextUrl()), 350);
      }
    } catch (error) {
      console.error("Could not read the authentication session:", error);
    }

    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session && new URLSearchParams(location.search).has("oauth")) {
        window.setTimeout(() => window.location.assign(getSafeNextUrl()), 250);
      }
    });
  }

  function setFieldError(input, message) {
    input.setAttribute("aria-invalid", "true");
    input.closest(".auth-field")?.classList.add("is-invalid");

    const errorElement = getErrorElement(input);
    if (errorElement) errorElement.textContent = message;
    return false;
  }

  function getErrorElement(input) {
    if (input.name === "terms") return document.getElementById("signup-terms-error");
    const ids = (input.getAttribute("aria-describedby") || "").split(/\s+/);
    const errorId = ids.find((id) => id.endsWith("-error"));
    return errorId ? document.getElementById(errorId) : null;
  }

  function clearFormErrors(form) {
    form.querySelectorAll("[aria-invalid='true']").forEach((input) => {
      input.removeAttribute("aria-invalid");
      input.closest(".auth-field")?.classList.remove("is-invalid");
    });

    form.querySelectorAll(".auth-field-message").forEach((message) => {
      message.textContent = "";
    });
  }

  function focusFirstInvalid(form) {
    form.querySelector("[aria-invalid='true']")?.focus();
  }

  function setFormStatus(form, message, status = "info") {
    const output = form.querySelector("[data-form-status]");
    if (!output) return;
    output.textContent = message;
    output.dataset.status = status;
  }

  function setButtonState(button, state, label) {
    if (!button) return;
    const labelElement = button.querySelector("[data-submit-label]");
    const icon = button.querySelector("i");

    button.disabled = state === "loading";
    button.classList.toggle("is-loading", state === "loading");
    if (labelElement) labelElement.textContent = label;

    icon?.classList.remove("ti-arrow-right", "ti-loader-2", "ti-check", "ti-send");
    icon?.classList.add(
      state === "loading" ? "ti-loader-2" : state === "success" ? "ti-check" : "ti-arrow-right"
    );
  }

  function friendlySignupError(error) {
    const message = String(error?.message || "").toLowerCase();
    if (message.includes("already") || message.includes("registered")) {
      return "An account may already exist for that email. Try logging in or resetting the password.";
    }
    if (message.includes("password")) return "Choose a longer password and try again.";
    if (message.includes("email")) return "Check the email address and try again.";
    return "We could not create the account. Try again shortly.";
  }

  function buildPageUrl(pageName, parameters = {}) {
    const url = new URL(pageName, window.location.href);
    Object.entries(parameters).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
    return url.href;
  }

  function getNextParameter() {
    return new URLSearchParams(window.location.search).get("next") || "library.html";
  }

  function getSafeNextUrl() {
    const fallback = new URL("library.html", window.location.href);
    const rawNext = getNextParameter();

    try {
      const candidate = new URL(rawNext, window.location.href);
      return candidate.origin === window.location.origin ? candidate.href : fallback.href;
    } catch {
      return fallback.href;
    }
  }

  function capitalize(value) {
    return String(value || "").replace(/^./, (character) => character.toUpperCase());
  }

  if (document.readyState === "loading") {
    document.addEventListener(READY_EVENT, startAuthPage, { once: true });
  } else {
    startAuthPage();
  }
})();