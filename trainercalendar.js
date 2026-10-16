document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Settings menu: close when clicking outside ---------- */
  document.addEventListener('click', function (e) {
    document.querySelectorAll('details.settings-menu[open]').forEach(function (d) {
      if (!d.contains(e.target)) d.removeAttribute('open');
    });
  });

  /* ---------- Trainer schedule ----------
     Weekly template (0 = Sunday ... 6 = Saturday).
     Replace this with real data from your backend when it's ready. */
  const WEEKLY_SCHEDULE = {
    0: [],
    1: [{ cls: 'yoga',      time: '8:00 AM',  difficulty: 'Advanced',     filled: 12, capacity: 20 },
        { cls: 'zumba',     time: '9:00 AM',  difficulty: 'Advanced',     filled: 16, capacity: 25 },
        { cls: 'taekwondo', time: '1:00 PM',  difficulty: 'Intermediate', filled: 20, capacity: 25 }],
    2: [{ cls: 'zumba',     time: '9:00 AM',  difficulty: 'Beginner',     filled: 14, capacity: 25 },
        { cls: 'yoga',      time: '5:00 PM',  difficulty: 'Beginner',     filled: 9,  capacity: 20 }],
    3: [{ cls: 'yoga',      time: '8:00 AM',  difficulty: 'Intermediate', filled: 10, capacity: 20 },
        { cls: 'taekwondo', time: '1:00 PM',  difficulty: 'Intermediate', filled: 20, capacity: 25 },
        { cls: 'zumba',     time: '5:00 PM',  difficulty: 'Advanced',     filled: 18, capacity: 25 }],
    4: [{ cls: 'taekwondo', time: '10:00 AM', difficulty: 'Beginner',     filled: 3,  capacity: 5  },
        { cls: 'zumba',     time: '5:00 PM',  difficulty: 'Intermediate', filled: 15, capacity: 25 }],
    5: [{ cls: 'yoga',      time: '8:00 AM',  difficulty: 'Advanced',     filled: 12, capacity: 20 },
        { cls: 'zumba',     time: '9:00 AM',  difficulty: 'Advanced',     filled: 16, capacity: 25 },
        { cls: 'taekwondo', time: '1:00 PM',  difficulty: 'Intermediate', filled: 20, capacity: 25 }],
    6: [{ cls: 'zumba',     time: '10:00 AM', difficulty: 'Beginner',     filled: 22, capacity: 30 },
        { cls: 'yoga',      time: '1:00 PM',  difficulty: 'Beginner',     filled: 8,  capacity: 15 }]
  };

  const CLASS_LABELS = { taekwondo: 'Taekwondo', yoga: 'Yoga', zumba: 'Zumba' };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthSelect   = document.getElementById('month-select');
  const yearLabel     = document.getElementById('calendar-year');
  const calendar      = document.getElementById('big-calendar');
  const scheduleTitle = document.getElementById('schedule-title');
  const scheduleBody  = document.getElementById('schedule-body');

  if (!monthSelect || !yearLabel || !calendar || !scheduleBody) return;

  const today = new Date();
  const currentYear = today.getFullYear(); // year is always the real current year
  let selectedCell = null;

  function sessionsFor(year, month, day) {
    return WEEKLY_SCHEDULE[new Date(year, month, day).getDay()] || [];
  }

  function populateMonthSelect(selectedMonth) {
    monthSelect.innerHTML = monthNames
      .map((name, i) => `<option value="${i}"${i === selectedMonth ? ' selected' : ''}>${name}</option>`)
      .join('');
  }

  function addCell(day, year, month) {
    const cell = document.createElement(day ? 'button' : 'span');
    cell.className = 'big-calendar__cell' + (day ? '' : ' big-calendar__cell--blank');

    if (day) {
      cell.type = 'button';
      cell.appendChild(document.createTextNode(day));

      const sessions = sessionsFor(year, month, day);

      const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
      if (isToday) cell.classList.add('is-today');

      cell.setAttribute('aria-label',
        `${monthNames[month]} ${day}, ${year}` + (sessions.length ? `, ${sessions.length} class(es)` : ', no classes'));
      cell.addEventListener('click', () => selectDate(cell, year, month, day));
    }

    calendar.appendChild(cell);
    return cell;
  }

  function renderCalendar(year, month) {
    calendar.querySelectorAll('.big-calendar__cell').forEach(cell => cell.remove());
    calendar.setAttribute('aria-label', `${monthNames[month]} ${year}`);
    selectedCell = null;

    const firstWeekday = new Date(year, month, 1).getDay();       // 0=Sun ... 6=Sat
    const totalDays    = new Date(year, month + 1, 0).getDate();  // handles 28/29/30/31

    const cells = {};
    for (let i = 0; i < firstWeekday; i++) addCell(null, year, month);
    for (let day = 1; day <= totalDays; day++) cells[day] = addCell(day, year, month);

    // pad the last row out to a full 7 columns
    const trailingBlanks = (7 - ((firstWeekday + totalDays) % 7)) % 7;
    for (let i = 0; i < trailingBlanks; i++) addCell(null, year, month);

    return cells;
  }

  function renderSchedule(year, month, day) {
    const date = new Date(year, month, day);
    const isToday = date.toDateString() === today.toDateString();
    const sessions = sessionsFor(year, month, day);

    scheduleTitle.textContent = isToday
      ? "Today's Schedule"
      : `${monthNames[month]} ${day}'s Schedule`;

    let html = '';

    if (!sessions.length) {
      html += '<p class="select-date-note">No classes scheduled for this day.</p>';
    } else {
      html += '<ul class="schedule-list">' + sessions.map(function (s) {
        const pct = Math.round((s.filled / s.capacity) * 100);
        return `
          <li class="schedule-item">
            <h3 class="schedule-item__title">${s.time} \u2013 ${CLASS_LABELS[s.cls]}</h3>
            <p class="schedule-item__meta">Difficulty: ${s.difficulty}</p>
            <div class="schedule-item__slots">
              <span>${s.filled}/${s.capacity} slots filled</span>
              <div class="slot-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${s.capacity}"
                   aria-valuenow="${s.filled}" aria-label="${s.filled} of ${s.capacity} slots filled">
                <span class="slot-bar__fill" style="width:${pct}%"></span>
              </div>
            </div>
          </li>`;
      }).join('') + '</ul>';
    }

    scheduleBody.innerHTML = html;
  }

  function selectDate(cell, year, month, day) {
    if (selectedCell) selectedCell.classList.remove('is-selected');
    cell.classList.add('is-selected');
    selectedCell = cell;
    renderSchedule(year, month, day);
  }

  function showMonth(month) {
    const cells = renderCalendar(currentYear, month);
    // pick today if it's in this month, otherwise leave the panel waiting for a click
    if (month === today.getMonth()) {
      selectDate(cells[today.getDate()], currentYear, month, today.getDate());
    } else {
      scheduleTitle.textContent = 'Schedule';
      scheduleBody.innerHTML = '<p class="select-date-note">Select a date to see your classes.</p>';
    }
  }

  monthSelect.addEventListener('change', () => showMonth(parseInt(monthSelect.value, 10)));

  yearLabel.textContent = currentYear;
  populateMonthSelect(today.getMonth());
  showMonth(today.getMonth());
});