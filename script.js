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
.trip-mode{
  animation:tripHue 8s linear infinite;
}

.trip-mode .hero-image,
.trip-mode .hero-static-video,
.trip-mode .follow-signal-art,
.trip-mode img{
  animation:
    tripWobble 3.5s ease-in-out infinite,
    tripPulse 5s ease-in-out infinite;
  filter:
    hue-rotate(0deg)
    saturate(1.8)
    contrast(1.15);
}

.trip-mode .hero-image{
  transform-origin:center;
}

.trip-mode .hero-content,
.trip-mode .section-head,
.trip-mode .signal-copy{
  animation:tripText 2.8s ease-in-out infinite;
  text-shadow:
    4px 0 0 rgba(255,0,120,.45),
    -4px 0 0 rgba(0,220,255,.45);
}

.trip-mode::before{
  content:"";
  position:fixed;
  inset:0;
  z-index:9998;
  pointer-events:none;
  background:
    radial-gradient(circle at 20% 30%, rgba(255,0,180,.12), transparent 35%),
    radial-gradient(circle at 80% 60%, rgba(0,255,220,.12), transparent 40%),
    radial-gradient(circle at 50% 80%, rgba(120,0,255,.10), transparent 35%);
  mix-blend-mode:screen;
  animation:tripClouds 7s ease-in-out infinite alternate;
}

.trip-mode::after{
  content:"";
  position:fixed;
  inset:-5%;
  z-index:9997;
  pointer-events:none;
  background:
    repeating-radial-gradient(
      circle at center,
      rgba(0,255,255,.025) 0 4px,
      rgba(255,0,180,.025) 5px 9px,
      transparent 10px 18px
    );
  animation:tripTunnel 8s linear infinite;
}

@keyframes tripHue{
  0%{filter:hue-rotate(0deg)}
  100%{filter:hue-rotate(360deg)}
}

@keyframes tripWobble{
  0%,100%{transform:translate(0,0) skew(0deg)}
  25%{transform:translate(4px,-3px) skew(.6deg)}
  50%{transform:translate(-3px,4px) skew(-.7deg)}
  75%{transform:translate(2px,2px) skew(.4deg)}
}

@keyframes tripPulse{
  0%,100%{scale:1}
  50%{scale:1.025}
}

@keyframes tripText{
  0%,100%{transform:translate(0,0)}
  25%{transform:translate(2px,-1px)}
  50%{transform:translate(-2px,2px)}
  75%{transform:translate(1px,1px)}
}

@keyframes tripClouds{
  0%{transform:scale(1) rotate(0deg)}
  100%{transform:scale(1.12) rotate(4deg)}
}

@keyframes tripTunnel{
  0%{transform:scale(1) rotate(0deg)}
  100%{transform:scale(1.18) rotate(8deg)}
}
})();
