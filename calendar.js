const monthSelect    = document.getElementById('month-select');
const yearLabel      = document.getElementById('calendar-year');
const calendar       = document.querySelector('.big-calendar');
const scheduleTitle  = document.getElementById('schedule-title');

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const today = new Date();
const currentYear = today.getFullYear(); // year is always the real current year

let selectedCell = null; // tracks the currently highlighted day button

function populateMonthSelect(selectedMonth) {
  monthSelect.innerHTML = monthNames
    .map((name, i) => `<option value="${i}"${i === selectedMonth ? ' selected' : ''}>${name}</option>`)
    .join('');
}

function addCell(day, isTodayCell = false) {
  const cell = document.createElement(day ? 'button' : 'span');
  cell.className = 'big-calendar__cell' + (day ? '' : ' big-calendar__cell--blank') + (isTodayCell ? ' is-today' : '');
  if (day) {
    cell.type = 'button';
    cell.textContent = day;
    cell.addEventListener('click', () => selectDate(cell, day));
  }
  calendar.appendChild(cell);
}

function renderCalendar(year, month) {
  calendar.querySelectorAll('.big-calendar__cell').forEach(cell => cell.remove());
  calendar.setAttribute('aria-label', `${monthNames[month]} ${year}`);
  selectedCell = null;

  const firstWeekday = new Date(year, month, 1).getDay();       // 0=Sun ... 6=Sat
  const totalDays     = new Date(year, month + 1, 0).getDate(); // handles 28/29/30/31 automatically

  for (let i = 0; i < firstWeekday; i++) addCell(null);
  for (let day = 1; day <= totalDays; day++) addCell(day, isToday(year, month, day));

  // pad the last row out to a full 7 columns
  const trailingBlanks = (7 - ((firstWeekday + totalDays) % 7)) % 7;
  for (let i = 0; i < trailingBlanks; i++) addCell(null);

  // if we're showing the current month, highlight today and select it
  const todayCell = calendar.querySelector('.is-today');
  if (todayCell) selectDate(todayCell, today.getDate());
  else document.dispatchEvent(new CustomEvent('date-cleared'));
}

function isToday(year, month, day) {
  return year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
}

function selectDate(cell, day) {
  if (selectedCell) selectedCell.classList.remove('is-selected');
  cell.classList.add('is-selected');
  selectedCell = cell;

  const month = parseInt(monthSelect.value, 10);
  scheduleTitle.textContent = isToday(currentYear, month, day)
    ? "Today's Schedule"
    : `${monthNames[month]} ${day}'s Schedule`;

  // lets other pages (e.g. schedule.html) react to the chosen date
  document.dispatchEvent(new CustomEvent('date-selected', {
    detail: { year: currentYear, month, day }
  }));
}

monthSelect.addEventListener('change', () => {
  renderCalendar(currentYear, parseInt(monthSelect.value, 10));
});

// Initial setup — defaults to today's real month/year
yearLabel.textContent = currentYear;
populateMonthSelect(today.getMonth());
renderCalendar(currentYear, today.getMonth());

// Make the "My Schedule" button open schedule.html
document.querySelectorAll('button, a, .btn').forEach(el => {
  if (el.textContent.trim() === 'My Schedule') {
    el.style.cursor = 'pointer';
    el.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'schedule.html';
    });
  }
});