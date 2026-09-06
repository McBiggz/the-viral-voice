/* ==========================================================
   THE VIRAL VOICE // LIVE SIGNAL CONTROLLER
   ----------------------------------------------------------
   Connects the website to Supabase, remembers each visitor,
   restores their True Believer identity on return visits,
   and drives the progressive distortion system from the
   signal_strength stored in the database.
   ========================================================== */

(() => {
  'use strict';

  // ----------------------------------------------------------
  // SUPABASE CONFIG
  // The publishable key is designed for public browser clients.
  // Never put a secret key, service_role key, or DB password here.
  // ----------------------------------------------------------
  const SUPABASE_URL = 'https://vogyjohoxerhcjpbifim.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_8QXKs6ZGfecrasgNzQfAjw_beTJIpMg';
  const VISITOR_TOKEN_KEY = 'viral_voice_visitor_token';

  const STAGES = [
    'signal-stage-low',
    'signal-stage-mid',
    'signal-stage-high',
    'signal-stage-psychedelic',
    'signal-stage-locked'
  ];

  const believerSection = document.querySelector('#believer');
  const believerNumber = document.querySelector('.believer-number');
  const believerVisits = document.querySelector('.believer-visits');
  const strengthValue = document.querySelector('.strength-header strong');
  const meter = document.querySelector('.signal-meter');
  const statusValue = document.querySelector('.identity-meta b');

  let supabaseClient = null;

  // ----------------------------------------------------------
  // VISUAL SIGNAL SYSTEM
  // ----------------------------------------------------------
  function clampStrength(value) {
    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
      return 0;
    }

    return Math.max(0, Math.min(100, Math.round(parsed)));
  }

  function getStage(strength) {
    if (strength >= 100) {
      return 'signal-stage-locked';
    }

    if (strength >= 75) {
      return 'signal-stage-psychedelic';
    }

    if (strength >= 50) {
      return 'signal-stage-high';
    }

    if (strength >= 25) {
      return 'signal-stage-mid';
    }

    return 'signal-stage-low';
  }

  function getStatus(strength) {
    if (strength >= 100) {
      return 'SIGNAL LOCKED';
    }

    if (strength >= 75) {
      return 'TRUE BELIEVER';
    }

    if (strength >= 50) {
      return 'SIGNAL ACQUIRED';
    }

    return 'SIGNAL DETECTED';
  }

  function applySignalStrength(value) {
    const strength = clampStrength(value);
    const stage = getStage(strength);
    const status = getStatus(strength);

    document.body.classList.remove(...STAGES);
    document.body.classList.add(stage);

    document.documentElement.style.setProperty(
      '--live-signal-strength',
      `${strength}%`
    );

    if (believerSection) {
      believerSection.style.setProperty(
        '--signal-strength',
        `${strength}%`
      );

      believerSection.dataset.signalStrength = String(strength);
    }

    if (strengthValue) {
      strengthValue.textContent = `${strength}%`;
    }

    if (meter) {
      meter.setAttribute(
        'aria-label',
        `Signal strength ${strength} percent`
      );
    }

    if (statusValue) {
      statusValue.textContent = status;
    }

    window.dispatchEvent(
      new CustomEvent('viralvoice:signalchange', {
        detail: {
          strength,
          stage,
          status
        }
      })
    );

    return {
      strength,
      stage,
      status
    };
  }

  // Lets you manually test signal stages in DevTools.
  window.setSignalStrength = applySignalStrength;

  // ----------------------------------------------------------
  // TRUE BELIEVER UI
  // ----------------------------------------------------------
  function formatBelieverNumber(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return '#----';
    }

    return `#${String(Math.trunc(number)).padStart(4, '0')}`;
  }

  function updateBelieverUI(record) {
    if (!record) {
      return;
    }

    if (believerNumber) {
      believerNumber.textContent = formatBelieverNumber(
        record.believer_number
      );
    }

    if (believerVisits && record.visit_count != null) {
      believerVisits.textContent = String(
        record.visit_count
      ).padStart(2, '0');
    }

    applySignalStrength(
      record.signal_strength ?? 0
    );
  }

  // ----------------------------------------------------------
  // SUPABASE RPC HELPERS
  // ----------------------------------------------------------
  async function registerBeliever() {
    const {
      data,
      error
    } = await supabaseClient.rpc(
      'register_believer'
    );

    if (error) {
      throw error;
    }

    const record = Array.isArray(data)
      ? data[0]
      : data;

    if (!record?.visitor_token) {
      throw new Error(
        'Registration returned no visitor token.'
      );
    }

    localStorage.setItem(
      VISITOR_TOKEN_KEY,
      record.visitor_token
    );

    return record;
  }

  async function recognizeBeliever(visitorToken) {
    const {
      data,
      error
    } = await supabaseClient.rpc(
      'recognize_believer',
      {
        p_visitor_token: visitorToken
      }
    );

    if (error) {
      throw error;
    }

    return Array.isArray(data)
      ? data[0] ?? null
      : data ?? null;
  }

  async function establishSignal() {
    if (!window.supabase?.createClient) {
      throw new Error(
        'Supabase client library did not load.'
      );
    }

    supabaseClient = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY
    );

    const savedToken = localStorage.getItem(
      VISITOR_TOKEN_KEY
    );

    let believer = null;
    let returning = false;

    if (savedToken) {
      believer = await recognizeBeliever(
        savedToken
      );

      returning = Boolean(believer);

      // If database resets or an identity is removed,
      // give the visitor a new identity.
      if (!believer) {
        localStorage.removeItem(
          VISITOR_TOKEN_KEY
        );

        believer = await registerBeliever();
      }
    } else {
      believer = await registerBeliever();
    }

    updateBelieverUI(believer);

    document.body.dataset.signalConnection =
      'online';

    document.body.dataset.believerState =
      returning
        ? 'returning'
        : 'new';

    window.dispatchEvent(
      new CustomEvent(
        'viralvoice:believerready',
        {
          detail: {
            believerNumber:
              believer.believer_number,

            signalStrength:
              believer.signal_strength,

            visitCount:
              believer.visit_count,

            returning
          }
        }
      )
    );

    console.info(
      `[THE VIRAL VOICE] ${
        returning
          ? 'SIGNAL RE-ESTABLISHED'
          : 'SIGNAL ESTABLISHED'
      } // ${formatBelieverNumber(
        believer.believer_number
      )}`
    );
  }

  // ----------------------------------------------------------
  // STARTUP
  // ----------------------------------------------------------
  const fallbackStrength =
    believerSection?.dataset.signalStrength ??
    10;

  applySignalStrength(
    fallbackStrength
  );

  establishSignal().catch((error) => {
    // Website still works if Supabase
    // is temporarily unavailable.
    document.body.dataset.signalConnection =
      'offline';

    console.error(
      '[THE VIRAL VOICE] SIGNAL CONNECTION FAILED',
      error
    );
  });
})();


/* ==========================================================
   SECRET TRANSMISSIONS // EASTER EGG CONTROLLER
   ----------------------------------------------------------
   Five hidden Easter eggs can open secret video transmissions.

   Upload these files:

   assets/secret-transmission-001.mp4
   assets/secret-transmission-002.mp4
   assets/secret-transmission-003.mp4
   assets/secret-transmission-004.mp4
   assets/secret-transmission-005.mp4
   ========================================================== */

(() => {
  'use strict';

  const STORAGE_KEY =
    'viral_voice_recovered_transmissions';

  const modal =
    document.querySelector(
      '#secret-transmission-modal'
    );

  // If the modal HTML isn't present,
  // don't let the Easter egg system cause problems.
  if (!modal) {
    return;
  }

  const video =
    modal.querySelector(
      '.secret-transmission-video'
    );

  const title =
    modal.querySelector(
      '#secret-transmission-title'
    );

  const count =
    modal.querySelector(
      '.secret-recovered-count'
    );

  const missing =
    modal.querySelector(
      '.secret-video-missing'
    );

  const triggers = [
    ...document.querySelectorAll(
      '[data-secret-transmission]'
    )
  ];

  const closeButtons = [
    ...modal.querySelectorAll(
      '[data-secret-close]'
    )
  ];

  let lastTrigger = null;

  // ----------------------------------------------------------
  // RECOVERED TRANSMISSION STORAGE
  // ----------------------------------------------------------
  function loadRecovered() {
    try {
      const parsed = JSON.parse(
        localStorage.getItem(
          STORAGE_KEY
        ) || '[]'
      );

      return new Set(
        Array.isArray(parsed)
          ? parsed.map(String)
          : []
      );
    } catch (error) {
      console.warn(
        '[THE VIRAL VOICE] Could not read recovered transmissions.',
        error
      );

      return new Set();
    }
  }

  function saveRecovered(recovered) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        [...recovered]
      )
    );
  }

  // ----------------------------------------------------------
  // UPDATE EASTER EGG UI
  // ----------------------------------------------------------
  function syncRecoveredUI() {
    const recovered =
      loadRecovered();

    triggers.forEach((trigger) => {
      const id =
        String(
          trigger.dataset.secretTransmission
        );

      trigger.classList.toggle(
        'is-recovered',
        recovered.has(id)
      );
    });

    if (count) {
      count.textContent =
        `RECOVERED // ${recovered.size} OF 5`;
    }

    document.body.dataset.transmissionsRecovered =
      String(recovered.size);
  }

  // ----------------------------------------------------------
  // OPEN TRANSMISSION
  // ----------------------------------------------------------
  function openTransmission(trigger) {
    const rawID =
      trigger.dataset.secretTransmission;

    if (!rawID) {
      return;
    }

    const numericID =
      String(Number(rawID));

    const displayID =
      numericID.padStart(
        3,
        '0'
      );

    const src =
      trigger.dataset.video;

    if (!src) {
      console.warn(
        `[THE VIRAL VOICE] Transmission ${displayID} has no video source.`
      );

      return;
    }

    lastTrigger =
      trigger;

    // Save discovery.
    const recovered =
      loadRecovered();

    recovered.add(
      numericID
    );

    saveRecovered(
      recovered
    );

    syncRecoveredUI();

    // Update modal heading.
    if (title) {
      title.textContent =
        `SECRET TRANSMISSION // ${displayID}`;
    }

    if (missing) {
      missing.hidden = true;
    }

    // Reset previous video.
    if (video) {
      video.pause();

      video.removeAttribute(
        'src'
      );

      video.load();

      video.src =
        src;

      video.load();
    }

    modal.hidden =
      false;

    modal.setAttribute(
      'aria-hidden',
      'false'
    );

    document.body.classList.add(
      'secret-transmission-open'
    );

    // Focus close button for keyboard accessibility.
    modal.querySelector(
      '.secret-transmission-close'
    )?.focus();

    window.dispatchEvent(
      new CustomEvent(
        'viralvoice:transmissionfound',
        {
          detail: {
            transmission:
              Number(numericID),

            recovered:
              recovered.size
          }
        }
      )
    );
  }

  // ----------------------------------------------------------
  // CLOSE TRANSMISSION
  // ----------------------------------------------------------
  function closeTransmission() {
    if (video) {
      video.pause();

      video.removeAttribute(
        'src'
      );

      video.load();
    }

    modal.hidden =
      true;

    modal.setAttribute(
      'aria-hidden',
      'true'
    );

    document.body.classList.remove(
      'secret-transmission-open'
    );

    if (lastTrigger) {
      lastTrigger.focus({
        preventScroll: true
      });
    }
  }

  // ----------------------------------------------------------
  // TRIGGER LISTENERS
  // ----------------------------------------------------------
  triggers.forEach(
    (trigger) => {
      trigger.addEventListener(
        'click',
        () => {
          openTransmission(
            trigger
          );
        }
      );

      // Lets keyboard users discover them too.
      trigger.addEventListener(
        'keydown',
        (event) => {
          if (
            event.key === 'Enter' ||
            event.key === ' '
          ) {
            event.preventDefault();

            openTransmission(
              trigger
            );
          }
        }
      );
    }
  );

  // ----------------------------------------------------------
  // MODAL CLOSE LISTENERS
  // ----------------------------------------------------------
  closeButtons.forEach(
    (button) => {
      button.addEventListener(
        'click',
        closeTransmission
      );
    }
  );

  // ----------------------------------------------------------
  // VIDEO ERROR HANDLING
  // ----------------------------------------------------------
  if (video) {
    video.addEventListener(
      'error',
      () => {
        if (missing) {
          missing.hidden =
            false;
        }

        console.warn(
          '[THE VIRAL VOICE] Secret transmission video could not be loaded.'
        );
      }
    );
  }

  // ----------------------------------------------------------
  // ESCAPE KEY CLOSE
  // ----------------------------------------------------------
  document.addEventListener(
    'keydown',
    (event) => {
      if (
        event.key === 'Escape' &&
        !modal.hidden
      ) {
        closeTransmission();
      }
    }
  );

  // ----------------------------------------------------------
  // INITIALIZE RECOVERED STATE
  // ----------------------------------------------------------
  syncRecoveredUI();
})();
