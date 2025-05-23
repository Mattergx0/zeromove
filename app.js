// Data opslag in localStorage onder 'activities'
const storageKey = 'zeromove-activities';

function getActivities() {
  const data = localStorage.getItem(storageKey);
  return data ? JSON.parse(data) : [];
}

function saveActivities(activities) {
  localStorage.setItem(storageKey, JSON.stringify(activities));
}

// Format datum in DD-MM-YYYY
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Format tijd (minuten) naar uur:min
function formatDuration(min) {
  const hours = Math.floor(min / 60);
  const minutes = min % 60;
  return hours > 0 ? `${hours}u ${minutes}m` : `${minutes}m`;
}

// --- Dashboard (index.html) ---
if (document.body.classList.contains('dashboard') || location.pathname.endsWith('index.html') || location.pathname === '/') {
  const activitiesList = document.getElementById('activities-list');

  function renderActivities() {
    const activities = getActivities().slice().reverse();
    if (activities.length === 0) {
      activitiesList.innerHTML = '<p>Je hebt nog geen activiteiten.</p>';
      return;
    }
    activitiesList.innerHTML = '';
    activities.forEach((act, i) => {
      const div = document.createElement('div');
      div.tabIndex = 0;
      div.className = 'activity-item';
      div.innerHTML = `
        <div class="activity-info">
          <h3>${act.type.charAt(0).toUpperCase() + act.type.slice(1)}</h3>
          <time datetime="${act.date}">${formatDate(act.date)}</time>
        </div>
        <div class="activity-stats">
          <span>${act.distance} km</span>
          <span>${formatDuration(act.duration)}</span>
        </div>
      `;
      div.onclick = () => {
        localStorage.setItem('zeromove-selected', i);
        location.href = 'detail.html';
      };
      div.onkeypress = e => {
        if (e.key === 'Enter' || e.key === ' ') {
          div.onclick();
        }
      };
      activitiesList.appendChild(div);
    });
  }

  renderActivities();
}

// --- Nieuwe Activiteit (activiteit.html) ---
if (location.pathname.endsWith('activiteit.html')) {
  const form = document.getElementById('activity-form');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const type = form.type.value;
    const distance = parseFloat(form.distance.value).toFixed(2);
    const duration = parseInt(form.duration.value);
    const date = form.date.value;

    if (!type || !distance || !duration || !date) {
      alert('Vul alle velden correct in!');
      return;
    }

    const activities = getActivities();
    activities.push({ type, distance, duration, date });
    saveActivities(activities);
    alert('Activiteit opgeslagen!');
    location.href = 'index.html';
  });
}

// --- Activiteit Detail (detail.html) ---
if (location.pathname.endsWith('detail.html')) {
  const container = document.getElementById('activity-detail');
  const index = localStorage.getItem('zeromove-selected');
  const activities = getActivities();

  if (index === null || !activities[index]) {
    container.innerHTML = '<p>Geen activiteit gevonden.</p>';
  } else {
    const act = activities[index];
    container.innerHTML = `
      <article class="activity-detail-card">
        <h2>${act.type.charAt(0).toUpperCase() + act.type.slice(1)}</h2>
        <p><strong>Datum:</strong> ${formatDate(act.date)}</p>
        <p><strong>Afstand:</strong> ${act.distance} km</p>
        <p><strong>Duur:</strong> ${formatDuration(act.duration)}</p>
        <p><strong>Geschatte snelheid:</strong> ${(act.distance / (act.duration / 60)).toFixed(2)} km/u</p>
        <button id="back-btn">Terug</button>
      </article>
    `;

    document.getElementById('back-btn').addEventListener('click', () => {
      history.back();
    });
  }
}

// --- Profiel pagina (profiel.html) ---
if (location.pathname.endsWith('profiel.html')) {
  const totalRunning = document.getElementById('total-running');
  const totalCycling = document.getElementById('total-cycling');
  const totalActivities = document.getElementById('total-activities');

  const activities = getActivities();

  const runningSum = activities.filter(a => a.type === 'hardlopen').reduce((sum, a) => sum + parseFloat(a.distance), 0);
  const cyclingSum = activities.filter(a => a.type === 'fietsen').reduce((sum, a) => sum + parseFloat(a.distance), 0);

  totalRunning.textContent = `${runningSum.toFixed(2)} km`;
  totalCycling.textContent = `${cyclingSum.toFixed(2)} km`;
  totalActivities.textContent = activities.length;
}
