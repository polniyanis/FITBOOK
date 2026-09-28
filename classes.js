document.addEventListener('DOMContentLoaded', function () {

  var PRICING = {
    gym:       { 1: 100,  2: 180,  3: 250  },
    boxing:    { 1: 350,  2: 650,  3: 900  },
    muaythai:  { 1: 1500, 2: 2800, 3: 3500 },
    taekwondo: { 1: 300,  2: 550,  3: 750  },
    zumba:     { 1: 200,  2: 350,  3: 480  },
    yoga:      { 1: 250,  2: 450,  3: 600  }
  };

  var bookingModal = document.getElementById('booking-modal');
  var bookingTitle = document.getElementById('booking-modal-title');
  var bookingTotalAmount = document.getElementById('booking-total-amount');
  var bookingContinueBtn = document.getElementById('booking-continue-btn');
  var sessionOptions = document.querySelectorAll('.session-option');

  var paymentModal = document.getElementById('payment-modal');
  var paymentFormView = document.getElementById('payment-form-view');
  var paymentSuccessView = document.getElementById('payment-success-view');
  var paymentSummaryLine = document.getElementById('payment-summary-line');
  var paymentSuccessLine = document.getElementById('payment-success-line');
  var pmEmail = document.getElementById('pm-email');
  var pmQrImage = document.getElementById('pm-qr-image');
  var pmQrAmount = document.getElementById('pm-qr-amount');
  var paymentConfirmBtn = document.getElementById('payment-confirm-btn');

  var currentClassKey = null;
  var currentClassName = '';
  var currentSessions = null;

  function formatPeso(amount) {
    return '₱' + amount.toLocaleString('en-PH');
  }

  function resetSessionOptions() {
    currentSessions = null;
    sessionOptions.forEach(function (btn) {
      btn.classList.remove('is-selected');
    });
    bookingTotalAmount.textContent = '₱0';
    bookingContinueBtn.disabled = true;
  }

  document.querySelectorAll('.book-session-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      currentClassKey = btn.getAttribute('data-class');
      currentClassName = btn.getAttribute('data-name') || 'Class';
      bookingTitle.textContent = currentClassName;
      resetSessionOptions();
      bookingModal.showModal();
    });
  });

  sessionOptions.forEach(function (option) {
    option.addEventListener('click', function () {
      sessionOptions.forEach(function (btn) { btn.classList.remove('is-selected'); });
      option.classList.add('is-selected');
      currentSessions = Number(option.getAttribute('data-sessions'));

      var pricing = PRICING[currentClassKey] || {};
      var amount = pricing[currentSessions] || 0;
      bookingTotalAmount.textContent = formatPeso(amount);
      bookingContinueBtn.disabled = false;
    });
  });

  bookingContinueBtn.addEventListener('click', function () {
    if (!currentSessions) return;
    var pricing = PRICING[currentClassKey] || {};
    var amount = pricing[currentSessions] || 0;

    bookingModal.close();
    openPaymentModal(currentClassName, currentSessions, amount);
  });

  function formatSessions(count) {
    return count + (count === 1 ? ' Session' : ' Sessions');
  }

  function openPaymentModal(className, sessions, amount) {
    paymentFormView.hidden = false;
    paymentSuccessView.hidden = true;

    paymentSummaryLine.textContent = className + ' · ' + formatSessions(sessions) + ' · Total: ' + formatPeso(amount);

    pmEmail.value = '';
    document.getElementById('pm-save-info').checked = false;

    pmQrAmount.textContent = formatPeso(amount);
    pmQrImage.src =
      'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=GTGFITNESS-' +
      encodeURIComponent(className) + '-' + sessions + '-' + amount;

    paymentModal.dataset.className = className;
    paymentModal.dataset.sessions = sessions;
    paymentModal.dataset.amount = amount;

    paymentModal.showModal();
  }

  paymentConfirmBtn.addEventListener('click', function () {
    if (!pmEmail.value.trim()) {
      pmEmail.focus();
      return;
    }

    var className = paymentModal.dataset.className || 'Class';
    var sessions = Number(paymentModal.dataset.sessions) || 1;

    paymentSuccessLine.textContent =
      formatSessions(sessions) + ' for ' + className + ' — a confirmation will be emailed to you.';

    paymentFormView.hidden = true;
    paymentSuccessView.hidden = false;
  });

  paymentModal.addEventListener('click', function (e) {
    if (e.target === paymentModal) paymentModal.close();
  });

  document.querySelectorAll('[data-close-dialog]').forEach(function (closeBtn) {
    closeBtn.addEventListener('click', function () {
      var dialog = document.getElementById(closeBtn.getAttribute('data-close-dialog'));
      if (dialog) dialog.close();
    });
  });

  bookingModal.addEventListener('click', function (e) {
    if (e.target === bookingModal) bookingModal.close();
  });

  document.addEventListener('click', function (e) {
    document.querySelectorAll('details.settings-menu[open]').forEach(function (d) {
      if (!d.contains(e.target)) d.removeAttribute('open');
    });
  });

  document.querySelectorAll('.classes-arrow').forEach(function (arrow) {
    arrow.addEventListener('click', function () {
      var panelId = arrow.getAttribute('aria-controls');
      var panel = panelId ? document.getElementById(panelId) : null;
      if (!panel) return;

      var isOpen = panel.classList.toggle('is-open');
      arrow.classList.toggle('is-open', isOpen);
      arrow.setAttribute('aria-expanded', String(isOpen));
      panel.setAttribute('aria-hidden', String(!isOpen));
    });
  });

});
