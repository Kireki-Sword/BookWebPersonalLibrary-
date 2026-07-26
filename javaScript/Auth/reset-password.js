// Completes a Supabase password-recovery flow after the user follows the email link.

(() => {
  "use strict";

  function startResetPage() {
    const supabase = window.inkwellSupabase;
    const form = document.getElementById("reset-password-form");
    const submitButton = document.querySelector("[data-reset-submit]");

    if (!supabase || !form || !submitButton) {
      console.error("The password-reset page could not start.");
      return;
    }

    initializePasswordToggles();

    let recoveryReady = false;

    // Supabase emits PASSWORD_RECOVERY after it processes the recovery link.
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) {
        recoveryReady = true;
        submitButton.disabled = false;
        setStatus("Recovery link verified. Choose your new password.", "success");
        form.elements.password.focus();
      }
    });

    verifyRecoverySession();

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearErrors();

      const password = form.elements.password.value;
      const confirmation = form.elements.passwordConfirm.value;
      let valid = true;

      if (password.length < 8) {
        valid = setError(form.elements.password, "Use at least 8 characters.") && valid;
      }

      if (confirmation !== password) {
        valid = setError(form.elements.passwordConfirm, "The passwords do not match.") && valid;
      }

      if (!valid) {
        form.querySelector("[aria-invalid='true']")?.focus();
        setStatus("Check the highlighted fields.", "error");
        return;
      }

      setButton("loading", "Updating password…");
      setStatus("Saving your new password…", "info");

      try {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;

        form.reset();
        setButton("success", "Password updated");
        setStatus("Your password was updated. Opening your library…", "success");
        window.setTimeout(() => window.location.assign("library.html"), 650);
      } catch (error) {
        console.error("Password update failed:", error);
        setButton("idle", "Update password");
        setStatus("The recovery link may have expired. Request a new one.", "error");
      }
    });

    async function verifyRecoverySession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (!data.session && !recoveryReady) {
          // URL session detection can finish just after DOMContentLoaded. Give the
          // PASSWORD_RECOVERY event a brief chance to arrive before showing an error.
          window.setTimeout(async () => {
            if (recoveryReady) return;

            const { data: retryData } = await supabase.auth.getSession();
            if (retryData.session) {
              recoveryReady = true;
              submitButton.disabled = false;
              setStatus("Recovery link verified. Choose your new password.", "success");
              form.elements.password.focus();
              return;
            }

            submitButton.disabled = true;
            setStatus("This recovery link is invalid or expired. Request a new reset email.", "error");
          }, 500);
          return;
        }

        recoveryReady = true;
        submitButton.disabled = false;
        setStatus("Recovery link verified. Choose your new password.", "success");
        form.elements.password.focus();
      } catch (error) {
        console.error("Recovery session verification failed:", error);
        submitButton.disabled = true;
        setStatus("This recovery link could not be verified.", "error");
      }
    }

    function setError(input, message) {
      input.setAttribute("aria-invalid", "true");
      input.closest(".auth-field")?.classList.add("is-invalid");
      const errorId = (input.getAttribute("aria-describedby") || "").split(/\s+/)[0];
      const output = document.getElementById(errorId);
      if (output) output.textContent = message;
      return false;
    }

    function clearErrors() {
      form.querySelectorAll("[aria-invalid='true']").forEach((input) => {
        input.removeAttribute("aria-invalid");
        input.closest(".auth-field")?.classList.remove("is-invalid");
      });
      form.querySelectorAll(".auth-field-message").forEach((output) => {
        output.textContent = "";
      });
    }

    function setStatus(message, status) {
      const output = form.querySelector("[data-form-status]");
      output.textContent = message;
      output.dataset.status = status;
    }

    function setButton(state, label) {
      const labelElement = submitButton.querySelector("[data-submit-label]");
      const icon = submitButton.querySelector("i");
      submitButton.disabled = state === "loading";
      submitButton.classList.toggle("is-loading", state === "loading");
      labelElement.textContent = label;
      icon.className = `ti ${state === "loading" ? "ti-loader-2" : state === "success" ? "ti-check" : "ti-arrow-right"}`;
    }
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
        icon.className = `ti ${willShow ? "ti-eye-off" : "ti-eye"}`;
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startResetPage, { once: true });
  } else {
    startResetPage();
  }
})();