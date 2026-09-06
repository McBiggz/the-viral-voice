/* ==========================================================
   THE VIRAL VOICE // LIVE SIGNAL + SECRET TRANSMISSION SYSTEM
   ----------------------------------------------------------
   Handles:
   - Supabase True Believer identity
   - Persistent visitor recognition
   - Base signal strength
   - Secret transmission discoveries
   - Transmission progression / prerequisites
   - One-time signal rewards
   - Decoding animations
   - Recovered transmission tracker
   - Archive mutations
   - Completion state
   ========================================================== */

(() => {
  'use strict';

  /* ========================================================
     SUPABASE CONFIG
     ======================================================== */

  const SUPABASE_URL =
    'https://vogyjohoxerhcjpbifim.supabase.co';

  const SUPABASE_PUBLISHABLE_KEY =
    'sb_publishable_8QXKs6ZGfecrasgNzQfAjw_beTJIpMg';

  const VISITOR_TOKEN_KEY =
    'viral_voice_visitor_token';

  const TRANSMISSION_STORAGE_KEY =
    'viral_voice_recovered_transmissions';


  /* ========================================================
     SIGNAL CONFIG
     ======================================================== */

  const STAGES = [
    'signal-stage-low',
    'signal-stage-mid',
    'signal-stage-high',
    'signal-stage-psychedelic',
    'signal-stage-locked'
  ];

  const TRANSMISSION_REWARDS = {
    1: 8,
    2: 8,
    3: 10,
    4: 12,
    5: 12
  };

  const TRANSMISSION_MESSAGES = {
    1: 'SOMETHING ELSE IS HERE.',
    2: 'KEEP LOOKING.',
    3: 'THE ARCHIVE IS INCOMPLETE.',
    4: 'THE LAST SIGNAL WAS NEVER HIDDEN.',
    5: 'ACCESS GRANTED.'
  };

  let supabaseClient = null;

  let baseSignalStrength = 10;

  let lastTransmissionTrigger = null;

  let decodeTimer = null;

  let missingVideoTimer = null;


  /* ========================================================
     DOM REFERENCES
     ======================================================== */

  const believerSection =
    document.querySelector('#believer');

  const believerNumber =
    document.querySelector(
      '.believer-number, [data-believer-number]'
    );

  const believerVisits =
    document.querySelector('.believer-visits');

  const strengthValue =
    document.querySelector(
      '.strength-header strong'
    );

  const meter =
    document.querySelector('.signal-meter');

  const statusValue =
    document.querySelector(
      '.identity-meta b'
    );


  /* ========================================================
     SECRET TRANSMISSION DOM
     ======================================================== */

  const modal =
    document.querySelector(
      '#secret-transmission-modal'
    );

  const transmissionTriggers = [
    ...document.querySelectorAll(
      '[data-secret-transmission]'
    )
  ];

  const transmissionTrackerRows = [
    ...document.querySelectorAll(
      '[data-tracker-id]'
    )
  ];

  const archiveFrequencyCard =
    document.querySelector(
      '[data-archive-frequency]'
    );

  const archiveFrequencyTitle =
    document.querySelector(
      '[data-archive-frequency-title]'
    );

  const archiveFrequencyStatus =
    document.querySelector(
      '[data-archive-frequency-status]'
    );


  /* ========================================================
     BASIC HELPERS
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


  function formatBelieverNumber(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return '#----';
    }

    return `#${String(
      Math.trunc(number)
    ).padStart(4, '0')}`;
  }


  function formatTransmissionID(id) {
    return String(id).padStart(
      3,
      '0'
    );
  }


  /* ========================================================
     TRANSMISSION STORAGE
     ======================================================== */

  function loadRecoveredTransmissions() {
    try {
      const stored =
        JSON.parse(
          localStorage.getItem(
            TRANSMISSION_STORAGE_KEY
          ) || '[]'
        );

      if (!Array.isArray(stored)) {
        return new Set();
      }

      return new Set(
        stored
          .map(Number)
          .filter(
            id =>
              Number.isInteger(id) &&
              id >= 1 &&
              id <= 5
          )
      );

    } catch (error) {

      console.warn(
        '[THE VIRAL VOICE] Could not read recovered transmissions.',
        error
      );

      return new Set();
    }
  }


  function saveRecoveredTransmissions(
    recovered
  ) {
    localStorage.setItem(
      TRANSMISSION_STORAGE_KEY,
      JSON.stringify(
        [...recovered].sort(
          (a, b) => a - b
        )
      )
    );
  }


  /* ========================================================
     SIGNAL REWARD CALCULATION
     ======================================================== */

  function calculateTransmissionBonus() {
    const recovered =
      loadRecoveredTransmissions();

    let bonus = 0;

    recovered.forEach(id => {
      bonus +=
        TRANSMISSION_REWARDS[id] || 0;
    });

    return bonus;
  }


  function getCompositeSignalStrength() {
    return clampStrength(
      baseSignalStrength +
      calculateTransmissionBonus()
    );
  }


  /* ========================================================
     APPLY SIGNAL STRENGTH
     ======================================================== */

  function applySignalStrength(value) {
    const strength =
      clampStrength(value);

    const stage =
      getStage(strength);

    const status =
      getStatus(strength);

    document.body.classList.remove(
      ...STAGES
    );

    document.body.classList.add(
      stage
    );

    document.documentElement
      .style
      .setProperty(
        '--live-signal-strength',
        `${strength}%`
      );

    if (believerSection) {

      believerSection.style.setProperty(
        '--signal-strength',
        `${strength}%`
      );

      believerSection.dataset
        .signalStrength =
        String(strength);
    }

    if (strengthValue) {
      strengthValue.textContent =
        `${strength}%`;
    }

    if (meter) {
      meter.setAttribute(
        'aria-label',
        `Signal strength ${strength} percent`
      );
    }

    if (statusValue) {
      statusValue.textContent =
        status;
    }

    document.body.dataset.signalStrength =
      String(strength);

    window.dispatchEvent(
      new CustomEvent(
        'viralvoice:signalchange',
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


  function applyCompositeSignal() {
    return applySignalStrength(
      getCompositeSignalStrength()
    );
  }


  // Useful for testing in DevTools.
  window.setSignalStrength =
    applySignalStrength;


  /* ========================================================
     TRUE BELIEVER UI
     ======================================================== */

  function updateBelieverUI(record) {
    if (!record) {
      return;
    }

    if (believerNumber) {

      believerNumber.textContent =
        formatBelieverNumber(
          record.believer_number
        );
    }

    if (
      believerVisits &&
      record.visit_count != null
    ) {

      believerVisits.textContent =
        String(
          record.visit_count
        ).padStart(2, '0');
    }

    baseSignalStrength =
      clampStrength(
        record.signal_strength ?? 0
      );

    applyCompositeSignal();
  }


  /* ========================================================
     SUPABASE RPC
     ======================================================== */

  async function registerBeliever() {

    const {
      data,
      error
    } =
      await supabaseClient.rpc(
        'register_believer'
      );

    if (error) {
      throw error;
    }

    const record =
      Array.isArray(data)
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


  async function recognizeBeliever(
    visitorToken
  ) {

    const {
      data,
      error
    } =
      await supabaseClient.rpc(
        'recognize_believer',
        {
          p_visitor_token:
            visitorToken
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

    if (
      !window.supabase?.createClient
    ) {

      throw new Error(
        'Supabase client library did not load.'
      );
    }

    supabaseClient =
      window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
      );

    const savedToken =
      localStorage.getItem(
        VISITOR_TOKEN_KEY
      );

    let believer = null;

    let returning = false;


    if (savedToken) {

      believer =
        await recognizeBeliever(
          savedToken
        );

      returning =
        Boolean(believer);


      if (!believer) {

        localStorage.removeItem(
          VISITOR_TOKEN_KEY
        );

        believer =
          await registerBeliever();
      }

    } else {

      believer =
        await registerBeliever();
    }


    updateBelieverUI(
      believer
    );


    document.body.dataset
      .signalConnection =
      'online';

    document.body.dataset
      .believerState =
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
              getCompositeSignalStrength(),

            baseSignalStrength:
              believer.signal_strength,

            transmissionBonus:
              calculateTransmissionBonus(),

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


  /* ========================================================
     TRANSMISSION PREREQUISITES
     ======================================================== */

  function getRequirements(trigger) {

    const raw =
      trigger?.dataset.requires;

    if (!raw) {
      return [];
    }

    return raw
      .split(',')
      .map(Number)
      .filter(Number.isInteger);
  }


  function requirementsMet(trigger) {

    const requirements =
      getRequirements(trigger);

    if (!requirements.length) {
      return true;
    }

    const recovered =
      loadRecoveredTransmissions();

    return requirements.every(
      id => recovered.has(id)
    );
  }


  function missingRequirements(trigger) {

    const recovered =
      loadRecoveredTransmissions();

    return getRequirements(trigger)
      .filter(
        id => !recovered.has(id)
      );
  }


  /* ========================================================
     TRACKER UI
     ======================================================== */

  function updateTrackerRow(
    row,
    recovered
  ) {

    const id =
      Number(
        row.dataset.trackerId
      );

    const label =
      row.querySelector('b');

    const detail =
      row.querySelector('small');

    const isRecovered =
      recovered.has(id);


    row.classList.toggle(
      'tracker-recovered',
      isRecovered
    );


    if (isRecovered) {

      row.classList.remove(
        'tracker-locked'
      );

      if (label) {
        label.textContent =
          'RECOVERED';
      }

      if (detail) {
        detail.textContent =
          `TRANSMISSION ${formatTransmissionID(
            id
          )}`;
      }

      return;
    }


    if (id <= 3) {

      row.classList.remove(
        'tracker-locked'
      );

      if (label) {
        label.textContent =
          'UNKNOWN';
      }

      if (detail) {
        detail.textContent =
          'HIDDEN';
      }

      return;
    }


    if (id === 4) {

      const unlocked =
        [1, 2, 3].every(
          required =>
            recovered.has(
              required
            )
        );

      row.classList.toggle(
        'tracker-locked',
        !unlocked
      );

      if (label) {
        label.textContent =
          unlocked
            ? 'SIGNAL DETECTED'
            : 'LOCKED';
      }

      if (detail) {
        detail.textContent =
          unlocked
            ? 'FREQUENCY AVAILABLE'
            : 'REQUIRES 001–003';
      }

      return;
    }


    if (id === 5) {

      const unlocked =
        [1, 2, 3, 4].every(
          required =>
            recovered.has(
              required
            )
        );

      row.classList.toggle(
        'tracker-locked',
        !unlocked
      );

      if (label) {
        label.textContent =
          unlocked
            ? 'SIGNAL DETECTED'
            : '████████';
      }

      if (detail) {
        detail.textContent =
          unlocked
            ? 'FINAL TRANSMISSION'
            : 'NO SIGNAL';
      }
    }
  }


  function updateArchiveFrequency(
    recovered
  ) {

    if (!archiveFrequencyCard) {
      return;
    }


    const recovered003 =
      recovered.has(3);


    archiveFrequencyCard.classList.toggle(
      'is-recovered',
      recovered003
    );


    if (archiveFrequencyTitle) {

      archiveFrequencyTitle.textContent =
        recovered003
          ? 'RECOVERED ARCHIVE'
          : 'UNKNOWN FREQUENCY';
    }


    if (archiveFrequencyStatus) {

      archiveFrequencyStatus.textContent =
        recovered003
          ? 'ACCESS PARTIAL'
          : 'SIGNAL CORRUPTED';
    }
  }


  function updateAccessUnknown(
    recovered
  ) {

    const accessButton =
      document.querySelector(
        '.access-unknown-trigger'
      );

    if (!accessButton) {
      return;
    }


    if (recovered.has(1)) {

      accessButton.textContent =
        'ACCESS // 001 RECOVERED';

    } else {

      accessButton.textContent =
        'ACCESS // UNKNOWN';
    }
  }


  function updateUnknownSignalCard(
    recovered
  ) {

    const card =
      document.querySelector(
        '#unknown-signal'
      );

    if (!card) {
      return;
    }

    const hud =
      card.querySelector(
        '.hud-label'
      );


    if (
      recovered.has(3) &&
      hud
    ) {

      hud.textContent =
        'UNKNOWN SIGNAL // RECOVERED';

    } else if (hud) {

      hud.textContent =
        'UNKNOWN SIGNAL // LOCKED';
    }
  }


  function updateTriggerStates(
    recovered
  ) {

    transmissionTriggers
      .forEach(trigger => {

        const id =
          Number(
            trigger.dataset
              .secretTransmission
          );

        const recoveredState =
          recovered.has(id);

        const locked =
          !requirementsMet(
            trigger
          );


        trigger.classList.toggle(
          'is-recovered',
          recoveredState
        );

        trigger.classList.toggle(
          'is-locked',
          locked
        );

        trigger.dataset.locked =
          locked
            ? 'true'
            : 'false';
      });
  }


  function updateTransmissionTracker() {

    const recovered =
      loadRecoveredTransmissions();

    const recoveredCount =
      recovered.size;


    transmissionTrackerRows
      .forEach(row => {

        updateTrackerRow(
          row,
          recovered
        );
      });


    const trackerCount =
      document.querySelector(
        '.tracker-count'
      );

    if (trackerCount) {

      trackerCount.textContent =
        `${recoveredCount} / 5 RECOVERED`;
    }


    const trackerCompletion =
      document.querySelector(
        '.tracker-completion'
      );

    if (trackerCompletion) {

      trackerCompletion.textContent =
        recoveredCount === 5
          ? 'ARCHIVE // COMPLETE'
          : 'ARCHIVE // INCOMPLETE';
    }


    document.body.classList.toggle(
      'transmission-archive-complete',
      recoveredCount === 5
    );


    document.body.dataset
      .transmissionsRecovered =
      String(recoveredCount);


    updateArchiveFrequency(
      recovered
    );

    updateAccessUnknown(
      recovered
    );

    updateUnknownSignalCard(
      recovered
    );

    updateTriggerStates(
      recovered
    );


    applyCompositeSignal();
  }


  /* ========================================================
     MODAL HELPERS
     ======================================================== */

  function getModalElements() {

    if (!modal) {
      return {};
    }

    return {

      decodeStage:
        modal.querySelector(
          '.secret-stage-decode'
        ),

      videoStage:
        modal.querySelector(
          '.secret-stage-video'
        ),

      resultStage:
        modal.querySelector(
          '.secret-stage-result'
        ),

      mainTitle:
        modal.querySelector(
          '#secret-transmission-title'
        ),

      decodeLabel:
        modal.querySelector(
          '.decode-label'
        ),

      decodeBar:
        modal.querySelector(
          '.decode-bar i'
        ),

      decodePercent:
        modal.querySelector(
          '.decode-percent'
        ),

      video:
        modal.querySelector(
          '.secret-transmission-video'
        ),

      videoTitle:
        modal.querySelector(
          '.secret-video-title'
        ),

      missingMessage:
        modal.querySelector(
          '.secret-video-missing'
        ),

      resultTitle:
        modal.querySelector(
          '.secret-result-title'
        ),

      recoveredCount:
        modal.querySelector(
          '.secret-recovered-count'
        ),

      reward:
        modal.querySelector(
          '.secret-signal-reward'
        ),

      resultMessage:
        modal.querySelector(
          '.secret-result-message'
        ),

      progressBlocks: [
        ...modal.querySelectorAll(
          '.secret-progress-blocks i'
        )
      ]
    };
  }


  function setModalStage(stageName) {

    const {
      decodeStage,
      videoStage,
      resultStage
    } =
      getModalElements();


    if (decodeStage) {
      decodeStage.hidden =
        stageName !== 'decode';
    }

    if (videoStage) {
      videoStage.hidden =
        stageName !== 'video';
    }

    if (resultStage) {
      resultStage.hidden =
        stageName !== 'result';
    }
  }


  function openModal() {

    if (!modal) {
      return;
    }

    modal.hidden = false;

    modal.setAttribute(
      'aria-hidden',
      'false'
    );

    document.body.classList.add(
      'secret-transmission-open'
    );

    modal
      .querySelector(
        '.secret-transmission-close'
      )
      ?.focus();
  }


  function stopModalVideo() {

    const {
      video
    } =
      getModalElements();

    if (!video) {
      return;
    }

    video.pause();

    video.removeAttribute(
      'src'
    );

    video.load();
  }


  function closeTransmissionModal() {

    clearInterval(
      decodeTimer
    );

    clearTimeout(
      missingVideoTimer
    );

    stopModalVideo();

    if (!modal) {
      return;
    }

    modal.hidden = true;

    modal.setAttribute(
      'aria-hidden',
      'true'
    );

    document.body.classList.remove(
      'secret-transmission-open'
    );


    if (lastTransmissionTrigger) {

      lastTransmissionTrigger.focus({
        preventScroll: true
      });
    }
  }


  /* ========================================================
     LOCKED TRANSMISSION EXPERIENCE
     ======================================================== */

  function showLockedTransmission(
    trigger
  ) {

    if (!modal) {
      return;
    }


    lastTransmissionTrigger =
      trigger;


    const missing =
      missingRequirements(
        trigger
      );


    const {
      mainTitle,
      decodeLabel,
      decodeBar,
      decodePercent
    } =
      getModalElements();


    setModalStage(
      'decode'
    );


    if (mainTitle) {
      mainTitle.textContent =
        'FREQUENCY LOCKED';
    }


    if (decodeLabel) {

      decodeLabel.textContent =
        `REQUIRES TRANSMISSION${
          missing.length > 1
            ? 'S'
            : ''
        } // ${missing
          .map(
            formatTransmissionID
          )
          .join(' // ')}`;
    }


    if (decodeBar) {
      decodeBar.style.width =
        '0%';
    }


    if (decodePercent) {
      decodePercent.textContent =
        'ACCESS DENIED';
    }


    openModal();


    modal.classList.add(
      'transmission-denied'
    );


    setTimeout(
      () => {

        modal.classList.remove(
          'transmission-denied'
        );

      },
      900
    );
  }


  /* ========================================================
     RECOVER TRANSMISSION
     ======================================================== */

  function recoverTransmission(id) {

    const recovered =
      loadRecoveredTransmissions();

    const firstRecovery =
      !recovered.has(id);


    if (firstRecovery) {

      recovered.add(id);

      saveRecoveredTransmissions(
        recovered
      );
    }


    updateTransmissionTracker();


    window.dispatchEvent(
      new CustomEvent(
        'viralvoice:transmissionfound',
        {
          detail: {

            transmission: id,

            firstRecovery,

            recovered:
              recovered.size,

            reward:
              firstRecovery
                ? TRANSMISSION_REWARDS[id]
                : 0,

            totalSignal:
              getCompositeSignalStrength()
          }
        }
      )
    );


    return {
      recovered,
      firstRecovery
    };
  }


  /* ========================================================
     DECODING ANIMATION
     ======================================================== */

  function runDecodeAnimation(
    id,
    callback
  ) {

    const {
      mainTitle,
      decodeLabel,
      decodeBar,
      decodePercent
    } =
      getModalElements();


    if (mainTitle) {

      mainTitle.textContent =
        'UNAUTHORIZED FREQUENCY DETECTED';
    }


    if (decodeLabel) {

      decodeLabel.textContent =
        `DECODING TRANSMISSION // ${formatTransmissionID(
          id
        )}`;
    }


    if (decodeBar) {
      decodeBar.style.width =
        '0%';
    }


    if (decodePercent) {
      decodePercent.textContent =
        '0%';
    }


    let progress = 0;


    clearInterval(
      decodeTimer
    );


    decodeTimer =
      setInterval(
        () => {

          const increase =
            Math.floor(
              Math.random() * 13
            ) + 4;

          progress +=
            increase;


          if (progress >= 100) {

            progress = 100;
          }


          if (decodeBar) {

            decodeBar.style.width =
              `${progress}%`;
          }


          if (decodePercent) {

            decodePercent.textContent =
              `${progress}%`;
          }


          if (progress >= 100) {

            clearInterval(
              decodeTimer
            );

            setTimeout(
              callback,
              350
            );
          }

        },
        90
      );
  }


  /* ========================================================
     VIDEO STAGE
     ======================================================== */

  function showTransmissionVideo(
    trigger,
    id,
    firstRecovery
  ) {

    const {
      video,
      videoTitle,
      missingMessage
    } =
      getModalElements();


    setModalStage(
      'video'
    );


    if (videoTitle) {

      videoTitle.textContent =
        `TRANSMISSION // ${formatTransmissionID(
          id
        )}`;
    }


    if (missingMessage) {
      missingMessage.hidden =
        true;
    }


    if (!video) {

      showTransmissionResult(
        id,
        firstRecovery
      );

      return;
    }


    video.pause();

    video.removeAttribute(
      'src'
    );

    video.load();


    const source =
      trigger.dataset.video;


    if (!source) {

      if (missingMessage) {
        missingMessage.hidden =
          false;
      }

      missingVideoTimer =
        setTimeout(
          () => {

            showTransmissionResult(
              id,
              firstRecovery
            );

          },
          2200
        );

      return;
    }


    let resolved =
      false;


    function handleVideoFailure() {

      if (resolved) {
        return;
      }

      resolved =
        true;


      if (missingMessage) {
        missingMessage.hidden =
          false;
      }


      missingVideoTimer =
        setTimeout(
          () => {

            showTransmissionResult(
              id,
              firstRecovery
            );

          },
          2400
        );
    }


    function handleVideoLoaded() {

      if (resolved) {
        return;
      }

      resolved =
        true;


      video
        .play()
        .catch(
          () => {
            // Browser may require
            // user interaction.
          }
        );
    }


    video.addEventListener(
      'loadeddata',
      handleVideoLoaded,
      {
        once: true
      }
    );


    video.addEventListener(
      'error',
      handleVideoFailure,
      {
        once: true
      }
    );


    video.addEventListener(
      'ended',
      () => {

        showTransmissionResult(
          id,
          firstRecovery
        );

      },
      {
        once: true
      }
    );


    video.src =
      source;

    video.load();
  }


  /* ========================================================
     RESULT STAGE
     ======================================================== */

  function showTransmissionResult(
    id,
    firstRecovery
  ) {

    const recovered =
      loadRecoveredTransmissions();

    const {
      resultTitle,
      recoveredCount,
      reward,
      resultMessage,
      progressBlocks
    } =
      getModalElements();


    setModalStage(
      'result'
    );


    if (resultTitle) {

      resultTitle.textContent =
        `TRANSMISSION // ${formatTransmissionID(
          id
        )}`;
    }


    if (recoveredCount) {

      recoveredCount.textContent =
        `${recovered.size} OF 5`;
    }


    if (reward) {

      reward.textContent =
        firstRecovery
          ? `+${
              TRANSMISSION_REWARDS[id]
            }`
          : 'ALREADY RECOVERED';
    }


    if (resultMessage) {

      resultMessage.textContent =
        TRANSMISSION_MESSAGES[id] ||
        'THE SIGNAL CONTINUES.';
    }


    progressBlocks.forEach(
      (block, index) => {

        block.classList.toggle(
          'active',
          index < recovered.size
        );
      }
    );


    updateTransmissionTracker();
  }


  /* ========================================================
     OPEN TRANSMISSION
     ======================================================== */

  function openTransmission(
    trigger
  ) {

    if (!trigger) {
      return;
    }


    const id =
      Number(
        trigger.dataset
          .secretTransmission
      );


    if (
      !Number.isInteger(id) ||
      id < 1 ||
      id > 5
    ) {

      return;
    }


    if (
      !requirementsMet(
        trigger
      )
    ) {

      showLockedTransmission(
        trigger
      );

      return;
    }


    lastTransmissionTrigger =
      trigger;


    modal?.classList.remove(
      'transmission-denied'
    );


    setModalStage(
      'decode'
    );


    openModal();


    runDecodeAnimation(
      id,
      () => {

        const {
          firstRecovery
        } =
          recoverTransmission(
            id
          );


        showTransmissionVideo(
          trigger,
          id,
          firstRecovery
        );
      }
    );
  }


  /* ========================================================
     TRIGGER EVENTS
     ======================================================== */

  transmissionTriggers
    .forEach(
      trigger => {

        trigger.addEventListener(
          'click',
          event => {

            event.preventDefault();

            openTransmission(
              trigger
            );
          }
        );
      }
    );


  /* ========================================================
     ARCHIVE 003 REPLAY
     ======================================================== */

  if (archiveFrequencyCard) {

    archiveFrequencyCard.style.cursor =
      'pointer';


    archiveFrequencyCard
      .addEventListener(
        'click',
        () => {

          const recovered =
            loadRecoveredTransmissions();


          if (!recovered.has(3)) {

            archiveFrequencyCard
              .classList
              .add(
                'archive-denied'
              );


            setTimeout(
              () => {

                archiveFrequencyCard
                  .classList
                  .remove(
                    'archive-denied'
                  );

              },
              500
            );

            return;
          }


          const transmission003 =
            transmissionTriggers.find(
              trigger =>
                Number(
                  trigger.dataset
                    .secretTransmission
                ) === 3
            );


          if (transmission003) {

            openTransmission(
              transmission003
            );
          }
        }
      );
  }


  /* ========================================================
     MODAL CLOSE EVENTS
     ======================================================== */

  if (modal) {

    modal
      .querySelectorAll(
        '[data-secret-close]'
      )
      .forEach(
        button => {

          button.addEventListener(
            'click',
            closeTransmissionModal
          );
        }
      );
  }


  document.addEventListener(
    'keydown',
    event => {

      if (
        event.key === 'Escape' &&
        modal &&
        !modal.hidden
      ) {

        closeTransmissionModal();
      }
    }
  );


  /* ========================================================
     INITIALIZATION
     ======================================================== */

  baseSignalStrength =
    clampStrength(
      believerSection?.dataset
        .signalStrength ??
      10
    );


  updateTransmissionTracker();

  applyCompositeSignal();


  establishSignal()
    .catch(
      error => {

        document.body.dataset
          .signalConnection =
          'offline';


        console.error(
          '[THE VIRAL VOICE] SIGNAL CONNECTION FAILED',
          error
        );


        // The ARG still works locally
        // if Supabase is unavailable.
        applyCompositeSignal();
      }
    );


  /* ========================================================
     DEV HELPERS
     --------------------------------------------------------
     Useful while testing the ARG.
     Remove these later if desired.
     ======================================================== */

  window.getRecoveredTransmissions =
    () =>
      [
        ...loadRecoveredTransmissions()
      ].sort(
        (a, b) => a - b
      );


  window.resetSecretTransmissions =
    () => {

      localStorage.removeItem(
        TRANSMISSION_STORAGE_KEY
      );

      updateTransmissionTracker();

      console.info(
        '[THE VIRAL VOICE] SECRET TRANSMISSION PROGRESS RESET.'
      );
    };

})();
