/* ==========================================================
   THE VIRAL VOICE
   SUPABASE + TRUE BELIEVER + SIGNAL DISTORTION SYSTEM
   ========================================================== */

(() => {
  "use strict";

  /* ========================================================
     SUPABASE CONFIGURATION

     The publishable key is designed for browser use.
     NEVER put a secret/service_role key in this file.
     ======================================================== */

  const SUPABASE_URL =
    "https://vogyjohoxerhcjpbifim.supabase.co";

  const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_8QXKs6ZGfecrasgNzQfAjw_beTJIpMg";


  /* ========================================================
     LOCAL STORAGE
     This is how this browser remembers which True Believer
     it has already been assigned.
     ======================================================== */

  const VISITOR_TOKEN_KEY =
    "viral_voice_visitor_token";


  /* ========================================================
     SIGNAL STAGES
     ======================================================== */

  const STAGES = [
    "signal-stage-low",
    "signal-stage-mid",
    "signal-stage-high",
    "signal-stage-psychedelic",
    "signal-stage-locked"
  ];


  /* ========================================================
     PAGE ELEMENTS
     ======================================================== */

  const believerSection =
    document.querySelector("#believer");

  const believerNumberElement =
    document.querySelector("[data-believer-number]");

  const visitCountElement =
    document.querySelector("[data-visit-count]");

  const strengthValue =
    document.querySelector(".strength-header strong");

  const meter =
    document.querySelector(".signal-meter");

  const statusValue =
    document.querySelector("[data-believer-status]") ||
    document.querySelector(".identity-meta b");


  /* ========================================================
     SIGNAL STRENGTH HELPERS
     ======================================================== */

  function clampStrength(value) {
    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
      return 0;
    }

    return Math.max(
      0,
      Math.min(
        100,
        Math.round(parsed)
      )
    );
  }


  function getStage(strength) {
    if (strength >= 100) {
      return "signal-stage-locked";
    }

    if (strength >= 75) {
      return "signal-stage-psychedelic";
    }

    if (strength >= 50) {
      return "signal-stage-high";
    }

    if (strength >= 25) {
      return "signal-stage-mid";
    }

    return "signal-stage-low";
  }


  function getStatus(strength) {
    if (strength >= 100) {
      return "SIGNAL LOCKED";
    }

    if (strength >= 75) {
      return "TRUE BELIEVER";
    }

    if (strength >= 50) {
      return "SIGNAL ACQUIRED";
    }

    return "SIGNAL DETECTED";
  }


  /* ========================================================
     APPLY SIGNAL STRENGTH TO THE WEBSITE

     This controls:
     - progression percentage
     - status
     - distortion stage
     - CSS variables
     ======================================================== */

  function applySignalStrength(value) {
    const strength = clampStrength(value);
    const stage = getStage(strength);
    const status = getStatus(strength);


    /* Remove old distortion stage */

    document.body.classList.remove(...STAGES);


    /* Apply current distortion stage */

    document.body.classList.add(stage);


    /* Global CSS signal variable */

    document.documentElement.style.setProperty(
      "--live-signal-strength",
      `${strength}%`
    );


    /* Update believer section */

    if (believerSection) {
      believerSection.style.setProperty(
        "--signal-strength",
        `${strength}%`
      );

      believerSection.dataset.signalStrength =
        String(strength);
    }


    /* Update displayed percentage */

    if (strengthValue) {
      strengthValue.textContent =
        `${strength}%`;
    }


    /* Update accessibility information */

    if (meter) {
      meter.setAttribute(
        "aria-label",
        `Signal strength ${strength} percent`
      );
    }


    /* Update status */

    if (statusValue) {
      statusValue.textContent = status;
    }


    /* Broadcast signal change */

    window.dispatchEvent(
      new CustomEvent(
        "viralvoice:signalchange",
        {
          detail: {
            strength,
            stage,
            status
          }
        }
      )
    );


    return {
      strength,
      stage,
      status
    };
  }


  /* Allow manual testing from DevTools */

  window.setSignalStrength =
    applySignalStrength;


  /* ========================================================
     FORMAT TRUE BELIEVER NUMBER

     1   -> #0001
     27  -> #0027
     418 -> #0418
     ======================================================== */

  function formatBelieverNumber(number) {
    const parsed = Number(number);

    if (!Number.isFinite(parsed)) {
      return "#----";
    }

    return (
      "#" +
      String(parsed).padStart(4, "0")
    );
  }


  /* ========================================================
     UPDATE TRUE BELIEVER UI
     ======================================================== */

  function updateBelieverInterface(data) {

    if (!data) {
      return;
    }


    if (believerNumberElement) {
      believerNumberElement.textContent =
        formatBelieverNumber(
          data.believer_number
        );
    }


    if (visitCountElement) {
      visitCountElement.textContent =
        String(
          data.visit_count || 1
        ).padStart(2, "0");
    }


    applySignalStrength(
      data.signal_strength || 0
    );
  }


  /* ========================================================
     INITIALIZE SUPABASE
     ======================================================== */

  function createSupabaseClient() {

    if (
      !window.supabase ||
      typeof window.supabase.createClient !==
        "function"
    ) {

      console.error(
        "[THE VIRAL VOICE] Supabase library not loaded."
      );

      return null;
    }


    return window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY
    );
  }


  /* ========================================================
     REGISTER NEW TRUE BELIEVER
     ======================================================== */

  async function registerBeliever(client) {

    console.log(
      "[THE VIRAL VOICE] NEW SIGNAL DETECTED"
    );


    const { data, error } =
      await client.rpc(
        "register_believer"
      );


    if (error) {
      throw error;
    }


    if (!data || data.length === 0) {
      throw new Error(
        "Registration returned no believer."
      );
    }


    const believer = data[0];


    /* Save identity locally */

    localStorage.setItem(
      VISITOR_TOKEN_KEY,
      believer.visitor_token
    );


    updateBelieverInterface(
      believer
    );


    console.log(
      `[THE VIRAL VOICE] SIGNAL ESTABLISHED // ${formatBelieverNumber(
        believer.believer_number
      )}`
    );


    return believer;
  }


  /* ========================================================
     RECOGNIZE RETURNING TRUE BELIEVER
     ======================================================== */

  async function recognizeBeliever(
    client,
    visitorToken
  ) {

    console.log(
      "[THE VIRAL VOICE] KNOWN SIGNAL DETECTED"
    );


    const { data, error } =
      await client.rpc(
        "recognize_believer",
        {
          p_visitor_token:
            visitorToken
        }
      );


    if (error) {
      throw error;
    }


    /*
      If the token exists locally but the database
      no longer recognizes it, remove it and allow
      a fresh registration.
    */

    if (!data || data.length === 0) {

      console.warn(
        "[THE VIRAL VOICE] STORED SIGNAL INVALID"
      );


      localStorage.removeItem(
        VISITOR_TOKEN_KEY
      );


      return null;
    }


    const believer = data[0];


    updateBelieverInterface(
      believer
    );


    console.log(
      `[THE VIRAL VOICE] SIGNAL RE-ESTABLISHED // ${formatBelieverNumber(
        believer.believer_number
      )}`
    );


    return believer;
  }


  /* ========================================================
     ESTABLISH VISITOR IDENTITY
     ======================================================== */

  async function establishSignal() {

    const client =
      createSupabaseClient();


    if (!client) {

      /*
        Keep the website usable even if Supabase
        fails to load.
      */

      applySignalStrength(10);

      return;
    }


    try {

      const storedToken =
        localStorage.getItem(
          VISITOR_TOKEN_KEY
        );


      let believer = null;


      /* ----------------------------------------
         RETURNING VISITOR
         ---------------------------------------- */

      if (storedToken) {

        believer =
          await recognizeBeliever(
            client,
            storedToken
          );
      }


      /* ----------------------------------------
         NEW VISITOR
         ---------------------------------------- */

      if (!believer) {

        believer =
          await registerBeliever(
            client
          );
      }


      /*
        Make the current believer available
        to future systems.

        Easter eggs, transmissions, QR/NFC,
        archive systems, etc. can use this.
      */

      window.viralVoiceBeliever =
        believer;

      window.viralVoiceSupabase =
        client;


      /* ----------------------------------------
         Broadcast identity established event
         ---------------------------------------- */

      window.dispatchEvent(
        new CustomEvent(
          "viralvoice:believerready",
          {
            detail: believer
          }
        )
      );

    }

    catch (error) {

      console.error(
        "[THE VIRAL VOICE] SIGNAL CONNECTION FAILED",
        error
      );


      /*
        Graceful fallback.

        The site still works visually if
        Supabase temporarily goes down.
      */

      applySignalStrength(10);
    }
  }


  /* ========================================================
     START SYSTEM
     ======================================================== */

  document.addEventListener(
    "DOMContentLoaded",
    () => {

      establishSignal();

    }
  );

})();
