// ============================================
// PROGRESS CHART MODULE — Chart.js Integration
// Supports both Firebase and Demo mode
// ============================================

import { auth, db, isFirebaseConfigured } from './firebase-config.js';
import { getCurrentUser } from './auth.js';

let addDoc, collection, getDocs, query, orderBy, limit, serverTimestamp;

if (isFirebaseConfigured) {
  const fsMod = await import('https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js');
  addDoc = fsMod.addDoc;
  collection = fsMod.collection;
  getDocs = fsMod.getDocs;
  query = fsMod.query;
  orderBy = fsMod.orderBy;
  limit = fsMod.limit;
  serverTimestamp = fsMod.serverTimestamp;
}

let weightChart = null;
let workoutChart = null;
let bmiChart = null;
let miniWeightChart = null;

function getUid() {
  if (isFirebaseConfigured && auth?.currentUser) return auth.currentUser.uid;
  const user = getCurrentUser();
  return user?.uid || 'demo';
}

// ── Chart.js dark theme defaults ──
const CHART_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: '#a0a0a0', font: { family: 'Inter', size: 12 } }
    }
  },
  scales: {
    x: {
      ticks: { color: '#666666', font: { size: 11 } },
      grid: { color: 'rgba(255,255,255,0.05)' }
    },
    y: {
      ticks: { color: '#666666', font: { size: 11 } },
      grid: { color: 'rgba(255,255,255,0.05)' }
    }
  }
};

// ══════════════════════════════════════════════
// DATA LOADING
// ══════════════════════════════════════════════

async function loadWeightLogs() {
  if (isFirebaseConfigured && auth?.currentUser) {
    try {
      const q = query(
        collection(db, 'users', auth.currentUser.uid, 'weightLogs'),
        orderBy('date', 'asc'), limit(30)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          weight: data.weight,
          bmi: data.bmi || null,
          date: data.date?.toDate?.() ? data.date.toDate() : new Date(data.date)
        };
      });
    } catch (e) { console.error('Load weight logs:', e); return []; }
  } else {
    // Demo mode — localStorage
    const logs = JSON.parse(localStorage.getItem(`forgefit_weightlogs_${getUid()}`) || '[]');
    return logs.map(l => ({ ...l, date: new Date(l.date) }));
  }
}

async function loadWorkoutStats() {
  if (isFirebaseConfigured && auth?.currentUser) {
    try {
      const q = query(
        collection(db, 'users', auth.currentUser.uid, 'workoutProgress'),
        orderBy('date', 'desc'), limit(28)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data()).reverse();
    } catch (e) { console.error('Load workout stats:', e); return []; }
  } else {
    const progress = JSON.parse(localStorage.getItem(`forgefit_workout_${getUid()}`) || '{}');
    return Object.values(progress).sort((a, b) => a.date?.localeCompare(b.date));
  }
}

// ══════════════════════════════════════════════
// CHART RENDERING
// ══════════════════════════════════════════════

function renderWeightChart(logs) {
  const ctx = document.getElementById('weightChart');
  if (!ctx) return;

  const labels = logs.map(l => l.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  const weights = logs.map(l => l.weight);

  if (weightChart) weightChart.destroy();

  weightChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels.length > 0 ? labels : ['No data yet'],
      datasets: [{
        label: 'Weight (kg)',
        data: weights.length > 0 ? weights : [0],
        borderColor: '#ccff00',
        backgroundColor: 'rgba(204, 255, 0, 0.1)',
        borderWidth: 2, fill: true, tension: 0.4,
        pointBackgroundColor: '#ccff00', pointBorderColor: '#0a0a0a',
        pointBorderWidth: 2, pointRadius: 4, pointHoverRadius: 6
      }]
    },
    options: { ...CHART_DEFAULTS,
      plugins: { ...CHART_DEFAULTS.plugins,
        tooltip: {
          backgroundColor: '#1a1a1a', titleColor: '#f0f0f0',
          bodyColor: '#ccff00', borderColor: '#2a2a2a',
          borderWidth: 1, padding: 12, displayColors: false
        }
      }
    }
  });
}

function renderMiniWeightChart(logs) {
  const ctx = document.getElementById('miniWeightChart');
  if (!ctx) return;

  const recentLogs = logs.slice(-7);
  const labels = recentLogs.map(l => l.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  const weights = recentLogs.map(l => l.weight);

  if (miniWeightChart) miniWeightChart.destroy();

  miniWeightChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels.length > 0 ? labels : ['No data'],
      datasets: [{
        data: weights.length > 0 ? weights : [0],
        borderColor: '#ccff00',
        backgroundColor: 'rgba(204, 255, 0, 0.08)',
        borderWidth: 2, fill: true, tension: 0.4,
        pointRadius: 3, pointBackgroundColor: '#ccff00'
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#666', font: { size: 10 } }, grid: { display: false } },
        y: { ticks: { color: '#666', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.03)' } }
      }
    }
  });
}

function renderWorkoutChart(stats) {
  const ctx = document.getElementById('workoutChart');
  if (!ctx) return;

  const weeklyData = {};
  stats.forEach(s => {
    const date = new Date(s.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const weekKey = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!weeklyData[weekKey]) weeklyData[weekKey] = 0;
    if (s.totalCompleted > 0) weeklyData[weekKey]++;
  });

  const labels = Object.keys(weeklyData);
  const values = Object.values(weeklyData);

  if (workoutChart) workoutChart.destroy();

  workoutChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels.length > 0 ? labels : ['No data yet'],
      datasets: [{
        label: 'Workouts Completed',
        data: values.length > 0 ? values : [0],
        backgroundColor: 'rgba(204, 255, 0, 0.6)',
        borderColor: '#ccff00', borderWidth: 1,
        borderRadius: 6, maxBarThickness: 40
      }]
    },
    options: { ...CHART_DEFAULTS,
      scales: { ...CHART_DEFAULTS.scales,
        y: { ...CHART_DEFAULTS.scales.y, beginAtZero: true, max: 7,
          ticks: { ...CHART_DEFAULTS.scales.y.ticks, stepSize: 1 }
        }
      }
    }
  });
}

function renderBMIChart(logs) {
  const ctx = document.getElementById('bmiChart');
  if (!ctx) return;

  const logsWithBMI = logs.filter(l => l.bmi);
  const labels = logsWithBMI.map(l => l.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  const bmis = logsWithBMI.map(l => l.bmi);

  if (bmiChart) bmiChart.destroy();

  bmiChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels.length > 0 ? labels : ['No data yet'],
      datasets: [
        {
          label: 'BMI', data: bmis.length > 0 ? bmis : [0],
          borderColor: '#40c4ff', backgroundColor: 'rgba(64, 196, 255, 0.1)',
          borderWidth: 2, fill: true, tension: 0.4,
          pointRadius: 4, pointBackgroundColor: '#40c4ff'
        },
        {
          label: 'Normal Range (18.5-24.9)',
          data: labels.length > 0 ? new Array(labels.length).fill(24.9) : [24.9],
          borderColor: 'rgba(0, 230, 118, 0.4)', borderWidth: 1,
          borderDash: [5, 5], pointRadius: 0, fill: false
        },
        {
          label: '',
          data: labels.length > 0 ? new Array(labels.length).fill(18.5) : [18.5],
          borderColor: 'rgba(0, 230, 118, 0.4)', borderWidth: 1,
          borderDash: [5, 5], pointRadius: 0, fill: false
        }
      ]
    },
    options: { ...CHART_DEFAULTS,
      plugins: { ...CHART_DEFAULTS.plugins,
        legend: { labels: { color: '#a0a0a0', font: { family: 'Inter', size: 12 },
          filter: (item) => item.text !== '' } }
      }
    }
  });
}

// ══════════════════════════════════════════════
// WEIGHT LOGGING
// ══════════════════════════════════════════════

function setupWeightLog() {
  const form = document.getElementById('logWeightForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const weightInput = document.getElementById('logWeight');
    const weight = parseFloat(weightInput.value);
    if (!weight) return;

    const btn = form.querySelector('.btn');
    btn.disabled = true;
    btn.textContent = 'Logging...';

    try {
      if (isFirebaseConfigured && auth?.currentUser) {
        await addDoc(collection(db, 'users', auth.currentUser.uid, 'weightLogs'), {
          weight, bmi: null, date: serverTimestamp()
        });
      } else {
        // Demo mode
        const key = `forgefit_weightlogs_${getUid()}`;
        const logs = JSON.parse(localStorage.getItem(key) || '[]');
        logs.push({ weight, bmi: null, date: new Date().toISOString() });
        localStorage.setItem(key, JSON.stringify(logs));
      }

      // Refresh charts
      const logs = await loadWeightLogs();
      renderWeightChart(logs);
      renderMiniWeightChart(logs);
      renderBMIChart(logs);

      weightInput.value = '';
      btn.textContent = '✅ Logged!';
      setTimeout(() => { btn.textContent = 'Log Weight'; btn.disabled = false; }, 1500);
    } catch (error) {
      console.error('Log weight error:', error);
      btn.textContent = '❌ Error';
      btn.disabled = false;
    }
  });
}

// ══════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════

export async function initProgressCharts() {
  const [weightLogs, workoutStats] = await Promise.all([
    loadWeightLogs(),
    loadWorkoutStats()
  ]);

  renderWeightChart(weightLogs);
  renderMiniWeightChart(weightLogs);
  renderWorkoutChart(workoutStats);
  renderBMIChart(weightLogs);
  setupWeightLog();
}
