/ Shared Supabase browser client for Inkwell.
// The project URL and sb_publishable_ key are intentionally public browser values.
// Never put an sb_secret_ key, service_role key, database password, or JWT secret here.

(() => {
  "use strict";

  const SUPABASE_URL =
    "https://hsruxfpslxguhwnccwuj.supabase.co";

  const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_Z2upBCdemNtdB4j5jry65A_XD_u8BsD";

  function createInkwellSupabaseClient() {
    if (!window.supabase?.createClient) {
      throw new Error(
        "Supabase did not load. Load @supabase/supabase-js before supabaseClient.js."
      );
    }

    return window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      }
    );
  }

  if (!window.inkwellSupabase) {
    window.inkwellSupabase = createInkwellSupabaseClient();
  }
})();