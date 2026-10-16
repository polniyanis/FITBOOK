document.addEventListener('DOMContentLoaded', function () {

  var params = new URLSearchParams(window.location.search);
  var className = params.get('name') || 'Class';
  var sessions = Number(params.get('sessions')) || 1;
  var amount = Number(params.get('amount')) || 0;

  function formatPeso(value) {
    return '₱' + value.toLocaleString('en-PH');
  }

  function sessionsLabel(count) {
    return count + (count === 1 ? ' Session' : ' Sessions');
  }

  document.getElementById('pay-class-name').textContent = className;
  document.getElementById('pay-sessions-line').textContent = sessionsLabel(sessions);
  document.getElementById('pay-amount').textContent = formatPeso(amount);
  document.getElementById('qr-amount').textContent = formatPeso(amount);
  document.getElementById('qr-image').src =
    'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=GTGFITNESS-' +
    encodeURIComponent(className) + '-' + sessions + '-' + amount;

  var payCard = document.getElementById('pay-card');
  var successCard = document.getElementById('pay-success');
  var agreeCheckbox = document.getElementById('pay-agree');
  var confirmBtn = document.getElementById('pay-confirm-btn');

  confirmBtn.addEventListener('click', function () {
    if (!agreeCheckbox.checked) {
      agreeCheckbox.focus();
      return;
    }
    document.getElementById('pay-success-line').textContent =
      sessionsLabel(sessions) + ' for ' + className + ' — a confirmation will be emailed to you.';
    payCard.hidden = true;
    successCard.hidden = false;
  });

});