/* ==========================================================
   THE VIRAL VOICE // SIGNAL CONTROL DASHBOARD
   ----------------------------------------------------------
   Private analytics dashboard powered by Supabase.

   Requires:
   - analytics.sql to be installed in Supabase
   - current user's email to exist in dashboard_admins
   - Supabase Auth magic-link email enabled
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

  let supabaseClient = null;
  let currentUser = null;

  /* ========================================================
     ELEMENTS
     ======================================================== */

  const loginView =
    document.querySelector(
      '[data-dashboard-login]'
    );

  const dashboardView =
    document.querySelector(
      '[data-dashboard-view]'
    );

  const loginForm =
    document.querySelector(
      '[data-login-form]'
    );

  const emailInput =
    document.querySelector(
      '[data-login-email]'
    );

  const loginMessage =
    document.querySelector(
      '[data-login-message]'
    );

  const logoutButton =
    document.querySelector(
      '[data-dashboard-logout]'
    );

  const refreshButton =
    document.querySelector(
      '[data-dashboard-refresh]'
    );

  const userEmail =
    document.querySelector(
      '[data-dashboard-email]'
    );

  const loadingIndicator =
    document.querySelector(
      '[data-dashboard-loading]'
    );

  const errorIndicator =
    document.querySelector(
      '[data-dashboard-error]'
    );

  const recentBody =
    document.querySelector(
      '[data-recent-visitors]'
    );

  const sourceBody =
    document.querySelector(
      '[data-source-list]'
    );

  const trafficChart =
    document.querySelector(
      '[data-traffic-chart]'
    );

  /* ========================================================
     BASIC HELPERS
     ======================================================== */

  function setText(
    selector,
    value
  ) {
    document
      .querySelectorAll(selector)
      .forEach(element => {
        element.textContent =
          value ?? '0';
      });
  }

  function escapeHTML(value) {
    return String(value ?? '')
      .replace(
        /&/g,
        '&amp;'
      )
      .replace(
        /</g,
        '&lt;'
      )
      .replace(
        />/g,
        '&gt;'
      )
      .replace(
        /"/g,
        '&quot;'
      )
      .replace(
        /'/g,
        '&#039;'
      );
  }

  function formatNumber(value) {
    const number =
      Number(value);

    if (
      !Number.isFinite(number)
    ) {
      return '0';
    }

    return new Intl.NumberFormat(
      'en-US'
    ).format(number);
  }

  function formatDate(value) {
    if (!value) {
      return 'UNKNOWN';
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return 'UNKNOWN';
    }

    return new Intl.DateTimeFormat(
      'en-US',
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      }
    ).format(date);
  }

  function formatShortDate(
    value
  ) {
    if (!value) {
      return '';
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }

    return new Intl.DateTimeFormat(
      'en-US',
      {
        month: 'short',
        day: 'numeric'
      }
    ).format(date);
  }

  function formatBelieverNumber(
    value
  ) {
    const number =
      Number(value);

    if (
      !Number.isFinite(number)
    ) {
      return '----';
    }

    return `#${String(
      Math.trunc(number)
    ).padStart(4, '0')}`;
  }

  function setLoading(
    loading
  ) {
    if (loadingIndicator) {
      loadingIndicator.hidden =
        !loading;
    }

    if (refreshButton) {
      refreshButton.disabled =
        loading;
    }

    document.body.classList.toggle(
      'dashboard-loading',
      loading
    );
  }

  function showError(
    message
  ) {
    if (!errorIndicator) {
      console.error(
        message
      );

      return;
    }

    errorIndicator.hidden =
      false;

    errorIndicator.textContent =
      message;
  }

  function clearError() {
    if (!errorIndicator) {
      return;
    }

    errorIndicator.hidden =
      true;

    errorIndicator.textContent =
      '';
  }

  /* ========================================================
     AUTHENTICATION UI
     ======================================================== */

  function showLogin() {
    if (loginView) {
      loginView.hidden =
        false;
    }

    if (dashboardView) {
      dashboardView.hidden =
        true;
    }

    currentUser =
      null;
  }

  function showDashboard(
    user
  ) {
    currentUser =
      user;

    if (loginView) {
      loginView.hidden =
        true;
    }

    if (dashboardView) {
      dashboardView.hidden =
        false;
    }

    if (userEmail) {
      userEmail.textContent =
        user?.email ||
        'AUTHENTICATED';
    }
  }

  async function sendMagicLink(
    email
  ) {
    const redirectURL =
      `${window.location.origin}${window.location.pathname}`;

    const {
      error
    } =
      await supabaseClient.auth
        .signInWithOtp({
          email,
          options: {
            emailRedirectTo:
              redirectURL
          }
        });

    if (error) {
      throw error;
    }
  }

  async function handleLogin(
    event
  ) {
    event.preventDefault();

    clearError();

    const email =
      emailInput
        ?.value
        ?.trim();

    if (!email) {
      if (loginMessage) {
        loginMessage.textContent =
          'ENTER AN AUTHORIZED EMAIL ADDRESS.';
      }

      return;
    }

    if (loginMessage) {
      loginMessage.textContent =
        'TRANSMITTING ACCESS REQUEST...';
    }

    try {
      await sendMagicLink(
        email
      );

      if (loginMessage) {
        loginMessage.textContent =
          'ACCESS LINK TRANSMITTED // CHECK YOUR EMAIL.';
      }
    } catch (error) {
      console.error(
        '[SIGNAL CONTROL] LOGIN FAILED',
        error
      );

      if (loginMessage) {
        loginMessage.textContent =
          error.message ||
          'ACCESS REQUEST FAILED.';
      }
    }
  }

  async function logout() {
    try {
      await supabaseClient.auth
        .signOut();
    } catch (error) {
      console.warn(
        '[SIGNAL CONTROL] LOGOUT ERROR',
        error
      );
    }

    showLogin();
  }

  /* ========================================================
     DASHBOARD RPC HELPERS
     ======================================================== */

  async function callRPC(
    name,
    parameters = {}
  ) {
    const {
      data,
      error
    } =
      await supabaseClient.rpc(
        name,
        parameters
      );

    if (error) {
      throw error;
    }

    return data;
  }

  async function loadSummary() {
    const data =
      await callRPC(
        'dashboard_summary'
      );

    if (!data) {
      return {};
    }

    if (
      Array.isArray(data)
    ) {
      return (
        data[0] || {}
      );
    }

    return data;
  }

  async function loadRecentVisitors() {
    const data =
      await callRPC(
        'dashboard_recent_visitors',
        {
          p_limit: 50
        }
      );

    return Array.isArray(data)
      ? data
      : [];
  }

  async function loadTrafficSources() {
    const data =
      await callRPC(
        'dashboard_traffic_sources'
      );

    return Array.isArray(data)
      ? data
      : [];
  }

  async function loadDailyTraffic() {
    const data =
      await callRPC(
        'dashboard_daily_traffic',
        {
          p_days: 30
        }
      );

    return Array.isArray(data)
      ? data
      : [];
  }

  /* ========================================================
     SUMMARY CARDS
     ======================================================== */

  function renderSummary(
    summary
  ) {
    setText(
      '[data-stat-pageviews]',
      formatNumber(
        summary.total_page_views ??
        summary.page_views ??
        0
      )
    );

    setText(
      '[data-stat-visitors]',
      formatNumber(
        summary.unique_visitors ??
        summary.total_visitors ??
        0
      )
    );

    setText(
      '[data-stat-returning]',
      formatNumber(
        summary.returning_visits ??
        summary.returning_visitors ??
        0
      )
    );

    setText(
      '[data-stat-qr]',
      formatNumber(
        summary.qr_entries ??
        summary.qr_scans ??
        0
      )
    );

    setText(
      '[data-stat-today]',
      formatNumber(
        summary.visits_today ??
        summary.today ??
        0
      )
    );

    setText(
      '[data-stat-week]',
      formatNumber(
        summary.last_7_days ??
        summary.visits_7_days ??
        0
      )
    );

    setText(
      '[data-stat-free4x6]',
      formatNumber(
        summary.free4x6_scans ??
        summary.free_4x6_scans ??
        0
      )
    );

    setText(
      '[data-stat-believers]',
      formatNumber(
        summary.total_believers ??
        summary.believers ??
        0
      )
    );
  }

  /* ========================================================
     TRAFFIC SOURCES
     ======================================================== */

  function renderSources(
    sources
  ) {
    if (!sourceBody) {
      return;
    }

    if (!sources.length) {
      sourceBody.innerHTML =
        `
          <div class="dashboard-empty">
            NO SOURCE DATA RECEIVED.
          </div>
        `;

      return;
    }

    const maximum =
      Math.max(
        ...sources.map(
          item =>
            Number(
              item.visits ??
              item.count ??
              0
            )
        ),
        1
      );

    sourceBody.innerHTML =
      sources
        .map(item => {
          const source =
            item.source ||
            'direct';

          const visits =
            Number(
              item.visits ??
              item.count ??
              0
            );

          const percentage =
            Math.max(
              2,
              Math.round(
                (
                  visits /
                  maximum
                ) * 100
              )
            );

          return `
            <div class="source-row">
              <div class="source-copy">
                <strong>
                  ${escapeHTML(
                    source
                  )}
                </strong>

                <span>
                  ${formatNumber(
                    visits
                  )}
                  VISITS
                </span>
              </div>

              <div
                class="source-meter"
                aria-label="${escapeHTML(
                  source
                )}: ${formatNumber(
                  visits
                )} visits"
              >
                <i
                  style="width:${percentage}%"
                ></i>
              </div>
            </div>
          `;
        })
        .join('');
  }

  /* ========================================================
     RECENT VISITORS
     ======================================================== */

  function renderRecentVisitors(
    rows
  ) {
    if (!recentBody) {
      return;
    }

    if (!rows.length) {
      recentBody.innerHTML =
        `
          <tr>
            <td
              colspan="7"
              class="dashboard-empty"
            >
              NO VISITOR ACTIVITY RECEIVED.
            </td>
          </tr>
        `;

      return;
    }

    recentBody.innerHTML =
      rows
        .map(row => {
          const believer =
            row.believer_number != null
              ? formatBelieverNumber(
                  row.believer_number
                )
              : 'UNASSIGNED';

          const returning =
            row.is_returning
              ? 'RETURNING'
              : 'NEW';

          const source =
            row.source ||
            'direct';

          const eventType =
            row.event_type ||
            'page_view';

          const page =
            row.page_path ||
            '/';

          const visits =
            row.visit_count ??
            '-';

          return `
            <tr>
              <td>
                ${escapeHTML(
                  formatDate(
                    row.created_at
                  )
                )}
              </td>

              <td>
                <strong>
                  ${escapeHTML(
                    believer
                  )}
                </strong>
              </td>

              <td>
                <span
                  class="visitor-state ${
                    row.is_returning
                      ? 'returning'
                      : 'new'
                  }"
                >
                  ${returning}
                </span>
              </td>

              <td>
                ${escapeHTML(
                  source
                )}
              </td>

              <td>
                ${escapeHTML(
                  eventType
                )}
              </td>

              <td>
                ${escapeHTML(
                  page
                )}
              </td>

              <td>
                ${escapeHTML(
                  visits
                )}
              </td>
            </tr>
          `;
        })
        .join('');
  }

  /* ========================================================
     30-DAY TRAFFIC CHART
     ======================================================== */

  function renderTrafficChart(
    rows
  ) {
    if (!trafficChart) {
      return;
    }

    if (!rows.length) {
      trafficChart.innerHTML =
        `
          <div class="dashboard-empty">
            NO TRAFFIC HISTORY RECEIVED.
          </div>
        `;

      return;
    }

    const values =
      rows.map(
        row =>
          Number(
            row.visits ??
            row.page_views ??
            row.count ??
            0
          )
      );

    const maximum =
      Math.max(
        ...values,
        1
      );

    trafficChart.innerHTML =
      rows
        .map(
          (
            row,
            index
          ) => {
            const visits =
              values[index];

            const height =
              Math.max(
                3,
                (
                  visits /
                  maximum
                ) * 100
              );

            const date =
              row.day ||
              row.date ||
              row.created_date;

            return `
              <div
                class="traffic-column"
                title="${escapeHTML(
                  formatShortDate(
                    date
                  )
                )} // ${formatNumber(
                  visits
                )} visits"
              >
                <span>
                  ${formatNumber(
                    visits
                  )}
                </span>

                <i
                  style="height:${height}%"
                ></i>

                <small>
                  ${escapeHTML(
                    formatShortDate(
                      date
                    )
                  )}
                </small>
              </div>
            `;
          }
        )
        .join('');
  }

  /* ========================================================
     LOAD ALL DASHBOARD DATA
     ======================================================== */

  async function loadDashboard() {
    clearError();
    setLoading(true);

    try {
      const [
        summary,
        recent,
        sources,
        daily
      ] =
        await Promise.all([
          loadSummary(),
          loadRecentVisitors(),
          loadTrafficSources(),
          loadDailyTraffic()
        ]);

      renderSummary(
        summary
      );

      renderRecentVisitors(
        recent
      );

      renderSources(
        sources
      );

      renderTrafficChart(
        daily
      );

      document.body.dataset
        .dashboardState =
          'online';

      const lastUpdated =
        document.querySelector(
          '[data-last-updated]'
        );

      if (lastUpdated) {
        lastUpdated.textContent =
          formatDate(
            new Date()
          );
      }
    } catch (error) {
      console.error(
        '[SIGNAL CONTROL] DASHBOARD LOAD FAILED',
        error
      );

      document.body.dataset
        .dashboardState =
          'error';

      showError(
        error.message ||
        'ANALYTICS SIGNAL COULD NOT BE ACQUIRED.'
      );
    } finally {
      setLoading(false);
    }
  }

  /* ========================================================
     VERIFY SESSION
     ======================================================== */

  async function handleSession(
    session
  ) {
    const user =
      session?.user;

    if (!user) {
      showLogin();
      return;
    }

    showDashboard(
      user
    );

    await loadDashboard();
  }

  /* ========================================================
     EVENT LISTENERS
     ======================================================== */

  loginForm?.addEventListener(
    'submit',
    handleLogin
  );

  logoutButton?.addEventListener(
    'click',
    logout
  );

  refreshButton?.addEventListener(
    'click',
    loadDashboard
  );

  /* ========================================================
     STARTUP
     ======================================================== */

  async function initialize() {
    if (
      !window.supabase
        ?.createClient
    ) {
      showError(
        'SUPABASE CLIENT LIBRARY DID NOT LOAD.'
      );

      return;
    }

    supabaseClient =
      window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
      );

    const {
      data,
      error
    } =
      await supabaseClient.auth
        .getSession();

    if (error) {
      console.error(
        '[SIGNAL CONTROL] SESSION CHECK FAILED',
        error
      );

      showLogin();

      return;
    }

    await handleSession(
      data?.session
    );

    supabaseClient.auth
      .onAuthStateChange(
        async (
          event,
          session
        ) => {
          if (
            event ===
            'SIGNED_OUT'
          ) {
            showLogin();
            return;
          }

          if (
            event ===
              'SIGNED_IN' ||
            event ===
              'TOKEN_REFRESHED' ||
            event ===
              'INITIAL_SESSION'
          ) {
            await handleSession(
              session
            );
          }
        }
      );
  }

  initialize().catch(
    error => {
      console.error(
        '[SIGNAL CONTROL] INITIALIZATION FAILED',
        error
      );

      showError(
        error.message ||
        'SIGNAL CONTROL FAILED TO INITIALIZE.'
      );
    }
  );
})();
