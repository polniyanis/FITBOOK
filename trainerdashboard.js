document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Settings menu: close when clicking outside ---------- */
  document.addEventListener('click', function (e) {
    document.querySelectorAll('details.settings-menu[open]').forEach(function (d) {
      if (!d.contains(e.target)) d.removeAttribute('open');
    });
  });

  /* ---------- Check-in / check-out log: role filter ---------- */
  const roleFilter = document.getElementById('role-filter');
  const logRows    = document.querySelectorAll('#checkin-table tbody tr');
  const emptyState = document.getElementById('checkin-empty');

  // Re-apply filter + alternate the row colours on the rows that are actually visible
  function applyLogFilter() {
    const role = roleFilter.value;
    let visibleCount = 0;

    logRows.forEach(function (row) {
      const matches = role === 'all' || row.getAttribute('data-role') === role;
      row.classList.toggle('is-hidden', !matches);
      row.classList.remove('is-striped');
      if (matches) {
        if (visibleCount % 2 === 1) row.classList.add('is-striped');
        visibleCount++;
      }
    });

    if (emptyState) emptyState.hidden = visibleCount !== 0;
  }

  if (roleFilter) {
    roleFilter.addEventListener('change', applyLogFilter);
    applyLogFilter(); // stripe the rows on first load
  }

  /* ---------- Attended Classes calendar ---------- */
  const dashMonthSelect = document.getElementById('dash-month-select');
  const dashYearLabel   = document.getElementById('dash-calendar-year');
  const dashCalendar    = document.getElementById('dash-big-calendar');

  if (dashMonthSelect && dashYearLabel && dashCalendar) {
    const dashMonthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dashToday = new Date();
    const dashCurrentYear = dashToday.getFullYear(); // always the real current year

    let dashSelectedCell = null; // currently highlighted day button

    function dashPopulateMonthSelect(selectedMonth) {
      dashMonthSelect.innerHTML = dashMonthNames
        .map((name, i) => `<option value="${i}"${i === selectedMonth ? ' selected' : ''}>${name}</option>`)
        .join('');
    }

    function dashAddCell(day) {
      const cell = document.createElement(day ? 'button' : 'span');
      cell.className = 'big-calendar__cell' + (day ? '' : ' big-calendar__cell--blank');
      if (day) {
        cell.type = 'button';
        cell.textContent = day;
        cell.addEventListener('click', () => dashSelectDate(cell));
      }
      dashCalendar.appendChild(cell);
    }

    function dashRenderCalendar(year, month) {
      dashCalendar.querySelectorAll('.big-calendar__cell').forEach(cell => cell.remove());
      dashCalendar.setAttribute('aria-label', `${dashMonthNames[month]} ${year}`);
      dashSelectedCell = null;

      const firstWeekday = new Date(year, month, 1).getDay();       // 0=Sun ... 6=Sat
      const totalDays    = new Date(year, month + 1, 0).getDate();  // handles 28/29/30/31

      for (let i = 0; i < firstWeekday; i++) dashAddCell(null);
      for (let day = 1; day <= totalDays; day++) dashAddCell(day);

      // pad the last row out to a full 7 columns
      const trailingBlanks = (7 - ((firstWeekday + totalDays) % 7)) % 7;
      for (let i = 0; i < trailingBlanks; i++) dashAddCell(null);
    }

    function dashSelectDate(cell) {
      if (dashSelectedCell) dashSelectedCell.classList.remove('is-selected');
      cell.classList.add('is-selected');
      dashSelectedCell = cell;
    }

    dashMonthSelect.addEventListener('change', () => {
      dashRenderCalendar(dashCurrentYear, parseInt(dashMonthSelect.value, 10));
    });

    // Initial setup: today's real month/year
    dashYearLabel.textContent = dashCurrentYear;
    dashPopulateMonthSelect(dashToday.getMonth());
    dashRenderCalendar(dashCurrentYear, dashToday.getMonth());
  }

});