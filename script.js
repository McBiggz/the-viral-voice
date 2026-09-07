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
    if (!Number.isFinite(parsed)) return 0;
    return Math.max(0, Math.min(100, Math.round(parsed)));
  }

  function getStage(strength) {
    if (strength >= 100) return 'signal-stage-locked';
    if (strength >= 75) return 'signal-stage-psychedelic';
    if (strength >= 50) return 'signal-stage-high';
    if (strength >= 25) return 'signal-stage-mid';
    return 'signal-stage-low';
  }

  function getStatus(strength) {
    if (strength >= 100) return 'SIGNAL LOCKED';
    if (strength >= 75) return 'TRUE BELIEVER';
    if (strength >= 50) return 'SIGNAL ACQUIRED';
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
      believerSection.style.setProperty('--signal-strength', `${strength}%`);
      believerSection.dataset.signalStrength = String(strength);
    }

    if (strengthValue) strengthValue.textContent = `${strength}%`;
    if (meter) {
      meter.setAttribute(
        'aria-label',
        `Signal strength ${strength} percent`
      );
    }
    if (statusValue) statusValue.textContent = status;

    window.dispatchEvent(
      new CustomEvent('viralvoice:signalchange', {
        detail: { strength, stage, status }
      })
    );

    return { strength, stage, status };
  }

  // Keep this public so you can still test stages in DevTools.
  window.setSignalStrength = applySignalStrength;

  // ----------------------------------------------------------
  // TRUE BELIEVER UI
  // ----------------------------------------------------------
  function formatBelieverNumber(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return '#----';
    return `#${String(Math.trunc(number)).padStart(4, '0')}`;
  }

  function updateBelieverUI(record) {
    if (!record) return;

    if (believerNumber) {
      believerNumber.textContent = formatBelieverNumber(
        record.believer_number
      );
    }

    if (believerVisits && record.visit_count != null) {
      believerVisits.textContent = String(record.visit_count).padStart(2, '0');
    }

    applySignalStrength(record.signal_strength ?? 0);
  }

  // ----------------------------------------------------------
  // SUPABASE RPC HELPERS
  // ----------------------------------------------------------
  async function registerBeliever() {
    const { data, error } = await supabaseClient.rpc('register_believer');

    if (error) throw error;

    const record = Array.isArray(data) ? data[0] : data;

    if (!record?.visitor_token) {
      throw new Error('Registration returned no visitor token.');
    }

    localStorage.setItem(VISITOR_TOKEN_KEY, record.visitor_token);
    return record;
  }

  async function recognizeBeliever(visitorToken) {
    const { data, error } = await supabaseClient.rpc(
      'recognize_believer',
      { p_visitor_token: visitorToken }
    );

    if (error) throw error;

    return Array.isArray(data) ? data[0] ?? null : data ?? null;
  }

  async function establishSignal() {
    if (!window.supabase?.createClient) {
      throw new Error('Supabase client library did not load.');
    }

    supabaseClient = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY
    );

    const savedToken = localStorage.getItem(VISITOR_TOKEN_KEY);
    let believer = null;
    let returning = false;

    if (savedToken) {
      believer = await recognizeBeliever(savedToken);
      returning = Boolean(believer);

      // A token can become stale if the database is reset or the record
      // is deliberately removed. In that case, start a fresh identity.
      if (!believer) {
        localStorage.removeItem(VISITOR_TOKEN_KEY);
        believer = await registerBeliever();
      }
    } else {
      believer = await registerBeliever();
    }

    updateBelieverUI(believer);

    document.body.dataset.signalConnection = 'online';
    document.body.dataset.believerState = returning ? 'returning' : 'new';

    window.dispatchEvent(
      new CustomEvent('viralvoice:believerready', {
        detail: {
          believerNumber: believer.believer_number,
          signalStrength: believer.signal_strength,
          visitCount: believer.visit_count,
          returning
        }
      })
    );

    console.info(
      `[THE VIRAL VOICE] ${returning ? 'SIGNAL RE-ESTABLISHED' : 'SIGNAL ESTABLISHED'} // ${formatBelieverNumber(believer.believer_number)}`
    );
  }



  // ----------------------------------------------------------
  // QR SIGNAL ENTRY GATEWAY
  // Business-card / physical QR target:
  // https://mcbiggz.github.io/the-viral-voice/?entry=signal
  // ----------------------------------------------------------
  function initializeSignalEntry() {
    const params = new URLSearchParams(window.location.search);
    const entry = (params.get('entry') || '').toLowerCase();
    const shouldPlay = entry === 'signal' || entry === 'qr';

    if (!shouldPlay) return;

    const gateway = document.querySelector('[data-signal-entry]');
    const video = document.querySelector('[data-signal-entry-video]');
    const audioButton = document.querySelector('[data-signal-entry-audio]');
    const skipButton = document.querySelector('[data-signal-entry-skip]');

    if (!gateway || !video) return;

    document.body.dataset.entrySource = entry;
    document.body.classList.add('signal-entry-active');
    gateway.classList.add('is-active');
    gateway.setAttribute('aria-hidden', 'false');

    // Browsers usually block sound on first-page autoplay. Start muted, then
    // let the visitor deliberately open the audio channel with one tap.
    video.muted = true;
    video.currentTime = 0;

    const cleanEntryUrl = () => {
      const clean = new URL(window.location.href);
      clean.searchParams.delete('entry');
      clean.searchParams.delete('replay');
      window.history.replaceState({}, '', clean.pathname + clean.search + clean.hash);
    };

    let closed = false;
    const closeGateway = () => {
      if (closed) return;
      closed = true;
      gateway.classList.add('is-closing');
      cleanEntryUrl();

      window.setTimeout(() => {
        video.pause();
        gateway.classList.remove('is-active', 'is-closing');
        gateway.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('signal-entry-active');

        window.dispatchEvent(
          new CustomEvent('viralvoice:entrycomplete', {
            detail: { source: entry }
          })
        );
      }, 560);
    };

    audioButton?.addEventListener('click', async () => {
      try {
        video.muted = false;
        video.volume = 1;
        await video.play();
        audioButton.textContent = 'AUDIO ACTIVE';
        audioButton.classList.add('is-enabled');
      } catch (error) {
        console.warn('[THE VIRAL VOICE] AUDIO CHANNEL BLOCKED', error);
      }
    });

    skipButton?.addEventListener('click', closeGateway);
    video.addEventListener('ended', closeGateway, { once: true });
    video.addEventListener('error', closeGateway, { once: true });

    const playAttempt = video.play();
    if (playAttempt?.catch) {
      playAttempt.catch(() => {
        // If even muted autoplay is blocked, the audio button becomes the
        // explicit start control rather than trapping the visitor.
        if (audioButton) audioButton.textContent = 'START TRANSMISSION';
      });
    }

    // Absolute escape hatch if media playback stalls for any reason.
    window.setTimeout(closeGateway, 14000);
  }

  // ----------------------------------------------------------
  // STARTUP
  // ----------------------------------------------------------
  initializeSignalEntry();

  const fallbackStrength = believerSection?.dataset.signalStrength ?? 10;
  applySignalStrength(fallbackStrength);

  establishSignal().catch((error) => {
    // Keep the site usable if Supabase is temporarily unavailable.
    document.body.dataset.signalConnection = 'offline';
    console.error('[THE VIRAL VOICE] SIGNAL CONNECTION FAILED', error);
  });
})();
