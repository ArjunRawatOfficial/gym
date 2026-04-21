// ============================================
// 7-DAY WORKOUT PLAN MODULE
// Supports both Firebase and Demo mode
// ============================================

import { auth, db, isFirebaseConfigured } from './firebase-config.js';
import { getCurrentUser } from './auth.js';

let docFn, setDoc, getDoc;

if (isFirebaseConfigured) {
  const fsMod = await import('https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js');
  docFn = fsMod.doc;
  setDoc = fsMod.setDoc;
  getDoc = fsMod.getDoc;
}

// ── Workout Plan Data ──
const WORKOUT_PLANS = {
  ppl: {
    name: 'Push / Pull / Legs',
    days: [
      {
        day: 'Monday', focus: 'Push (Chest, Shoulders, Triceps)',
        exercises: [
          { id: 'bench-press', name: 'Barbell Bench Press', sets: 4, reps: '8-10', muscle: 'Chest', rest: '90s' },
          { id: 'incline-db', name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', muscle: 'Upper Chest', rest: '60s' },
          { id: 'ohp', name: 'Overhead Press', sets: 4, reps: '8-10', muscle: 'Shoulders', rest: '90s' },
          { id: 'lateral-raise', name: 'Lateral Raises', sets: 3, reps: '12-15', muscle: 'Side Delts', rest: '45s' },
          { id: 'tricep-pushdown', name: 'Tricep Pushdown', sets: 3, reps: '10-12', muscle: 'Triceps', rest: '45s' },
          { id: 'overhead-ext', name: 'Overhead Tricep Extension', sets: 3, reps: '10-12', muscle: 'Triceps', rest: '45s' }
        ]
      },
      {
        day: 'Tuesday', focus: 'Pull (Back, Biceps)',
        exercises: [
          { id: 'deadlift', name: 'Conventional Deadlift', sets: 4, reps: '5-6', muscle: 'Back', rest: '120s' },
          { id: 'pullup', name: 'Pull-Ups / Lat Pulldown', sets: 4, reps: '8-10', muscle: 'Lats', rest: '90s' },
          { id: 'barbell-row', name: 'Barbell Bent-Over Row', sets: 4, reps: '8-10', muscle: 'Mid Back', rest: '90s' },
          { id: 'face-pull', name: 'Face Pulls', sets: 3, reps: '15-20', muscle: 'Rear Delts', rest: '45s' },
          { id: 'barbell-curl', name: 'Barbell Bicep Curls', sets: 3, reps: '10-12', muscle: 'Biceps', rest: '45s' },
          { id: 'hammer-curl', name: 'Hammer Curls', sets: 3, reps: '10-12', muscle: 'Biceps', rest: '45s' }
        ]
      },
      {
        day: 'Wednesday', focus: 'Legs & Core',
        exercises: [
          { id: 'squat', name: 'Barbell Back Squat', sets: 4, reps: '6-8', muscle: 'Quads', rest: '120s' },
          { id: 'rdl', name: 'Romanian Deadlift', sets: 3, reps: '10-12', muscle: 'Hamstrings', rest: '90s' },
          { id: 'leg-press', name: 'Leg Press', sets: 3, reps: '10-12', muscle: 'Quads', rest: '90s' },
          { id: 'leg-curl', name: 'Lying Leg Curls', sets: 3, reps: '10-12', muscle: 'Hamstrings', rest: '60s' },
          { id: 'calf-raise', name: 'Standing Calf Raises', sets: 4, reps: '12-15', muscle: 'Calves', rest: '45s' },
          { id: 'plank', name: 'Plank Hold', sets: 3, reps: '60s', muscle: 'Core', rest: '30s' }
        ]
      },
      {
        day: 'Thursday', focus: 'Push (Chest, Shoulders, Triceps)',
        exercises: [
          { id: 'db-press', name: 'Dumbbell Bench Press', sets: 4, reps: '10-12', muscle: 'Chest', rest: '90s' },
          { id: 'cable-fly', name: 'Cable Flyes', sets: 3, reps: '12-15', muscle: 'Chest', rest: '60s' },
          { id: 'arnold-press', name: 'Arnold Press', sets: 3, reps: '10-12', muscle: 'Shoulders', rest: '60s' },
          { id: 'front-raise', name: 'Front Raises', sets: 3, reps: '12-15', muscle: 'Front Delts', rest: '45s' },
          { id: 'dips', name: 'Weighted Dips', sets: 3, reps: '8-10', muscle: 'Triceps', rest: '60s' },
          { id: 'skull-crusher', name: 'Skull Crushers', sets: 3, reps: '10-12', muscle: 'Triceps', rest: '45s' }
        ]
      },
      {
        day: 'Friday', focus: 'Pull (Back, Biceps)',
        exercises: [
          { id: 'tbar-row', name: 'T-Bar Rows', sets: 4, reps: '8-10', muscle: 'Back', rest: '90s' },
          { id: 'seated-row', name: 'Seated Cable Row', sets: 3, reps: '10-12', muscle: 'Mid Back', rest: '60s' },
          { id: 'single-arm-row', name: 'Single Arm Dumbbell Row', sets: 3, reps: '10-12', muscle: 'Lats', rest: '60s' },
          { id: 'rear-delt-fly', name: 'Reverse Pec Dec Fly', sets: 3, reps: '12-15', muscle: 'Rear Delts', rest: '45s' },
          { id: 'incline-curl', name: 'Incline Dumbbell Curls', sets: 3, reps: '10-12', muscle: 'Biceps', rest: '45s' },
          { id: 'concentration-curl', name: 'Concentration Curls', sets: 3, reps: '10-12', muscle: 'Biceps', rest: '45s' }
        ]
      },
      {
        day: 'Saturday', focus: 'Legs & Abs',
        exercises: [
          { id: 'front-squat', name: 'Front Squats', sets: 4, reps: '8-10', muscle: 'Quads', rest: '120s' },
          { id: 'bulgarian', name: 'Bulgarian Split Squats', sets: 3, reps: '10 each', muscle: 'Quads', rest: '60s' },
          { id: 'hip-thrust', name: 'Hip Thrusts', sets: 4, reps: '10-12', muscle: 'Glutes', rest: '90s' },
          { id: 'leg-ext', name: 'Leg Extensions', sets: 3, reps: '12-15', muscle: 'Quads', rest: '45s' },
          { id: 'hanging-raise', name: 'Hanging Leg Raises', sets: 3, reps: '12-15', muscle: 'Abs', rest: '45s' },
          { id: 'cable-crunch', name: 'Cable Crunches', sets: 3, reps: '15-20', muscle: 'Abs', rest: '30s' }
        ]
      },
      {
        day: 'Sunday', focus: 'Rest & Recovery',
        exercises: [
          { id: 'stretch', name: 'Full Body Stretching', sets: 1, reps: '15 min', muscle: 'Flexibility', rest: '--' },
          { id: 'foam-roll', name: 'Foam Rolling', sets: 1, reps: '10 min', muscle: 'Recovery', rest: '--' },
          { id: 'yoga', name: 'Light Yoga / Meditation', sets: 1, reps: '20 min', muscle: 'Mobility', rest: '--' },
          { id: 'walk', name: 'Light Walk', sets: 1, reps: '30 min', muscle: 'Active Recovery', rest: '--' }
        ]
      }
    ]
  },
  upperlower: {
    name: 'Upper / Lower Split',
    days: [
      {
        day: 'Monday', focus: 'Upper Body A',
        exercises: [
          { id: 'bench-press-ul', name: 'Bench Press', sets: 4, reps: '6-8', muscle: 'Chest', rest: '120s' },
          { id: 'barbell-row-ul', name: 'Barbell Row', sets: 4, reps: '6-8', muscle: 'Back', rest: '120s' },
          { id: 'ohp-ul', name: 'Overhead Press', sets: 3, reps: '8-10', muscle: 'Shoulders', rest: '90s' },
          { id: 'pullup-ul', name: 'Pull-Ups', sets: 3, reps: '8-10', muscle: 'Back', rest: '90s' },
          { id: 'curl-ul', name: 'Bicep Curls', sets: 2, reps: '12-15', muscle: 'Arms', rest: '45s' },
          { id: 'tri-ext-ul', name: 'Tricep Extensions', sets: 2, reps: '12-15', muscle: 'Arms', rest: '45s' }
        ]
      },
      {
        day: 'Tuesday', focus: 'Lower Body A',
        exercises: [
          { id: 'squat-ul', name: 'Back Squat', sets: 4, reps: '6-8', muscle: 'Quads', rest: '120s' },
          { id: 'rdl-ul', name: 'Romanian Deadlift', sets: 3, reps: '8-10', muscle: 'Hamstrings', rest: '90s' },
          { id: 'lunge-ul', name: 'Walking Lunges', sets: 3, reps: '10 each', muscle: 'Quads', rest: '60s' },
          { id: 'leg-curl-ul', name: 'Leg Curls', sets: 3, reps: '10-12', muscle: 'Hamstrings', rest: '60s' },
          { id: 'calf-ul', name: 'Calf Raises', sets: 4, reps: '15-20', muscle: 'Calves', rest: '45s' },
          { id: 'plank-ul', name: 'Plank', sets: 3, reps: '45-60s', muscle: 'Core', rest: '30s' }
        ]
      },
      {
        day: 'Wednesday', focus: 'Rest / Light Cardio',
        exercises: [
          { id: 'cardio-ul', name: 'Light Jogging / Cycling', sets: 1, reps: '30 min', muscle: 'Cardio', rest: '--' },
          { id: 'stretch-ul', name: 'Stretching Routine', sets: 1, reps: '15 min', muscle: 'Flexibility', rest: '--' }
        ]
      },
      {
        day: 'Thursday', focus: 'Upper Body B',
        exercises: [
          { id: 'incline-bench-ul', name: 'Incline Bench Press', sets: 4, reps: '8-10', muscle: 'Upper Chest', rest: '90s' },
          { id: 'cable-row-ul', name: 'Seated Cable Row', sets: 4, reps: '8-10', muscle: 'Back', rest: '90s' },
          { id: 'db-shoulder-ul', name: 'Dumbbell Shoulder Press', sets: 3, reps: '10-12', muscle: 'Shoulders', rest: '60s' },
          { id: 'lat-pull-ul', name: 'Lat Pulldowns', sets: 3, reps: '10-12', muscle: 'Lats', rest: '60s' },
          { id: 'hammer-curl-ul', name: 'Hammer Curls', sets: 2, reps: '12-15', muscle: 'Arms', rest: '45s' },
          { id: 'dips-ul', name: 'Dips', sets: 2, reps: '10-12', muscle: 'Arms', rest: '45s' }
        ]
      },
      {
        day: 'Friday', focus: 'Lower Body B',
        exercises: [
          { id: 'front-squat-ul', name: 'Front Squat', sets: 4, reps: '8-10', muscle: 'Quads', rest: '120s' },
          { id: 'hip-thrust-ul', name: 'Hip Thrusts', sets: 4, reps: '10-12', muscle: 'Glutes', rest: '90s' },
          { id: 'step-up-ul', name: 'Step-Ups', sets: 3, reps: '10 each', muscle: 'Quads', rest: '60s' },
          { id: 'db-rdl-ul', name: 'Dumbbell RDL', sets: 3, reps: '10-12', muscle: 'Hamstrings', rest: '60s' },
          { id: 'seated-calf-ul', name: 'Seated Calf Raises', sets: 3, reps: '15-20', muscle: 'Calves', rest: '45s' },
          { id: 'russian-twist-ul', name: 'Russian Twists', sets: 3, reps: '20', muscle: 'Core', rest: '30s' }
        ]
      },
      {
        day: 'Saturday', focus: 'Active Recovery',
        exercises: [
          { id: 'swim-ul', name: 'Swimming / Sports', sets: 1, reps: '45 min', muscle: 'Full Body', rest: '--' },
          { id: 'foam-ul', name: 'Foam Rolling', sets: 1, reps: '15 min', muscle: 'Recovery', rest: '--' }
        ]
      },
      {
        day: 'Sunday', focus: 'Full Rest',
        exercises: [
          { id: 'rest-ul', name: 'Complete Rest Day', sets: 0, reps: '--', muscle: 'Recovery', rest: '--' },
          { id: 'meditate-ul', name: 'Meditation / Mindfulness', sets: 1, reps: '10 min', muscle: 'Mental', rest: '--' }
        ]
      }
    ]
  },
  fullbody: {
    name: 'Full Body',
    days: [
      {
        day: 'Monday', focus: 'Full Body A',
        exercises: [
          { id: 'squat-fb', name: 'Barbell Squat', sets: 4, reps: '6-8', muscle: 'Legs', rest: '120s' },
          { id: 'bench-fb', name: 'Bench Press', sets: 4, reps: '6-8', muscle: 'Chest', rest: '120s' },
          { id: 'row-fb', name: 'Barbell Row', sets: 3, reps: '8-10', muscle: 'Back', rest: '90s' },
          { id: 'ohp-fb', name: 'Overhead Press', sets: 3, reps: '8-10', muscle: 'Shoulders', rest: '90s' },
          { id: 'plank-fb', name: 'Plank', sets: 3, reps: '45s', muscle: 'Core', rest: '30s' }
        ]
      },
      {
        day: 'Tuesday', focus: 'Rest / Cardio',
        exercises: [
          { id: 'hiit-fb', name: 'HIIT Cardio', sets: 1, reps: '20 min', muscle: 'Cardio', rest: '--' },
          { id: 'stretch-fb', name: 'Stretching', sets: 1, reps: '10 min', muscle: 'Flexibility', rest: '--' }
        ]
      },
      {
        day: 'Wednesday', focus: 'Full Body B',
        exercises: [
          { id: 'deadlift-fb', name: 'Deadlift', sets: 4, reps: '5-6', muscle: 'Back/Legs', rest: '120s' },
          { id: 'incline-fb', name: 'Incline DB Press', sets: 3, reps: '10-12', muscle: 'Chest', rest: '60s' },
          { id: 'pullup-fb', name: 'Pull-Ups', sets: 3, reps: 'AMRAP', muscle: 'Back', rest: '90s' },
          { id: 'lunge-fb', name: 'Lunges', sets: 3, reps: '10 each', muscle: 'Legs', rest: '60s' },
          { id: 'crunch-fb', name: 'Cable Crunches', sets: 3, reps: '15', muscle: 'Core', rest: '30s' }
        ]
      },
      {
        day: 'Thursday', focus: 'Rest / Light Activity',
        exercises: [
          { id: 'walk-fb', name: 'Walk / Yoga', sets: 1, reps: '30 min', muscle: 'Recovery', rest: '--' }
        ]
      },
      {
        day: 'Friday', focus: 'Full Body C',
        exercises: [
          { id: 'front-sq-fb', name: 'Front Squat', sets: 4, reps: '8-10', muscle: 'Quads', rest: '120s' },
          { id: 'db-press-fb', name: 'DB Shoulder Press', sets: 3, reps: '10-12', muscle: 'Shoulders', rest: '60s' },
          { id: 'cable-row-fb', name: 'Seated Cable Row', sets: 3, reps: '10-12', muscle: 'Back', rest: '60s' },
          { id: 'chest-fly-fb', name: 'Chest Flyes', sets: 3, reps: '12-15', muscle: 'Chest', rest: '45s' },
          { id: 'leg-raise-fb', name: 'Hanging Leg Raises', sets: 3, reps: '12', muscle: 'Core', rest: '30s' }
        ]
      },
      {
        day: 'Saturday', focus: 'Active Recovery',
        exercises: [
          { id: 'sport-fb', name: 'Sports / Outdoor Activity', sets: 1, reps: '60 min', muscle: 'Full Body', rest: '--' },
          { id: 'foam-fb', name: 'Foam Rolling', sets: 1, reps: '10 min', muscle: 'Recovery', rest: '--' }
        ]
      },
      {
        day: 'Sunday', focus: 'Rest',
        exercises: [
          { id: 'rest-fb', name: 'Complete Rest', sets: 0, reps: '--', muscle: 'Recovery', rest: '--' }
        ]
      }
    ]
  }
};

let currentPlan = 'ppl';
let currentDay = 0;
let completedExercises = {};

function getTodayIndex() {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

function getDateForDay(dayIndex) {
  const now = new Date();
  const todayIdx = getTodayIndex();
  const diff = dayIndex - todayIdx;
  const target = new Date(now);
  target.setDate(now.getDate() + diff);
  return target.toISOString().slice(0, 10);
}

function getUid() {
  if (isFirebaseConfigured && auth?.currentUser) return auth.currentUser.uid;
  const user = getCurrentUser();
  return user?.uid || 'demo';
}

// ── localStorage helpers ──
function getDemoProgress() {
  return JSON.parse(localStorage.getItem(`forgefit_workout_${getUid()}`) || '{}');
}
function saveDemoProgress(data) {
  localStorage.setItem(`forgefit_workout_${getUid()}`, JSON.stringify(data));
}

function renderDay(dayIndex) {
  const plan = WORKOUT_PLANS[currentPlan];
  const dayData = plan.days[dayIndex];
  const container = document.getElementById('workoutDayContent');
  if (!container) return;

  const dateStr = getDateForDay(dayIndex);

  container.innerHTML = `
    <div class="workout-day-card animate-fade-up">
      <div class="workout-day-header">
        <div>
          <div class="workout-day-name">${dayData.day}</div>
          <div class="workout-focus">${dayData.focus}</div>
        </div>
        <span class="badge badge-neon" id="dayProgressBadge">0 / ${dayData.exercises.length}</span>
      </div>
      <div class="exercise-list">
        ${dayData.exercises.map((ex) => {
          const key = `${dateStr}_${ex.id}`;
          const done = completedExercises[key] || false;
          return `
            <div class="exercise-item ${done ? 'completed' : ''}" data-key="${key}">
              <button class="exercise-item-check ${done ? 'checked' : ''}" onclick="window.toggleExercise('${key}', this)">
                ${done ? '✓' : ''}
              </button>
              <div class="exercise-info">
                <div class="exercise-name">${ex.name}</div>
                <div class="exercise-detail">${ex.sets} sets × ${ex.reps} · Rest: ${ex.rest}</div>
              </div>
              <span class="exercise-muscle-tag">${ex.muscle}</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  updateDayProgress(dayData.exercises.length, dateStr);
}

window.toggleExercise = function(key, btnElement) {
  completedExercises[key] = !completedExercises[key];

  const item = btnElement.closest('.exercise-item');
  if (completedExercises[key]) {
    btnElement.classList.add('checked');
    btnElement.textContent = '✓';
    item.classList.add('completed');
  } else {
    btnElement.classList.remove('checked');
    btnElement.textContent = '';
    item.classList.remove('completed');
  }

  const plan = WORKOUT_PLANS[currentPlan];
  const dayData = plan.days[currentDay];
  const dateStr = getDateForDay(currentDay);
  updateDayProgress(dayData.exercises.length, dateStr);
  saveWorkoutProgress(dateStr, dayData);
};

function updateDayProgress(totalExercises, dateStr) {
  const badge = document.getElementById('dayProgressBadge');
  if (!badge) return;

  let completed = 0;
  for (const key in completedExercises) {
    if (key.startsWith(dateStr) && completedExercises[key]) completed++;
  }
  badge.textContent = `${completed} / ${totalExercises}`;
  updateWeeklyWorkoutStat();
}

function updateWeeklyWorkoutStat() {
  const statEl = document.getElementById('statWorkouts');
  if (!statEl) return;

  let daysWorkedOut = 0;
  for (let i = 0; i < 7; i++) {
    const dateStr = getDateForDay(i);
    for (const key in completedExercises) {
      if (key.startsWith(dateStr) && completedExercises[key]) {
        daysWorkedOut++;
        break;
      }
    }
  }
  statEl.textContent = daysWorkedOut;
}

async function saveWorkoutProgress(dateStr, dayData) {
  const exercises = {};
  dayData.exercises.forEach(ex => {
    const key = `${dateStr}_${ex.id}`;
    exercises[ex.id] = { completed: !!completedExercises[key] };
  });
  const completed = Object.values(exercises).filter(e => e.completed).length;

  if (isFirebaseConfigured && auth?.currentUser) {
    try {
      await setDoc(docFn(db, 'users', auth.currentUser.uid, 'workoutProgress', dateStr), {
        date: dateStr, day: dayData.day, plan: currentPlan,
        exercises, totalCompleted: completed, totalExercises: dayData.exercises.length
      });
    } catch (e) { console.error('Save workout error:', e); }
  } else {
    const progress = getDemoProgress();
    progress[dateStr] = {
      date: dateStr, day: dayData.day, plan: currentPlan,
      exercises, totalCompleted: completed, totalExercises: dayData.exercises.length
    };
    saveDemoProgress(progress);
  }
}

async function loadWorkoutProgress() {
  if (isFirebaseConfigured && auth?.currentUser) {
    try {
      for (let i = 0; i < 7; i++) {
        const dateStr = getDateForDay(i);
        const docSnap = await getDoc(docFn(db, 'users', auth.currentUser.uid, 'workoutProgress', dateStr));
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.exercises) {
            for (const [exId, exData] of Object.entries(data.exercises)) {
              completedExercises[`${dateStr}_${exId}`] = exData.completed;
            }
          }
        }
      }
    } catch (e) { console.error('Load workout error:', e); }
  } else {
    const progress = getDemoProgress();
    for (let i = 0; i < 7; i++) {
      const dateStr = getDateForDay(i);
      if (progress[dateStr]?.exercises) {
        for (const [exId, exData] of Object.entries(progress[dateStr].exercises)) {
          completedExercises[`${dateStr}_${exId}`] = exData.completed;
        }
      }
    }
  }
}

export function renderTodayPreview() {
  const dayIndex = getTodayIndex();
  const plan = WORKOUT_PLANS[currentPlan];
  const dayData = plan.days[dayIndex];

  const dayNameEl = document.getElementById('todayDayName');
  const focusEl = document.getElementById('todayFocus');
  const listEl = document.getElementById('todayExerciseList');

  if (dayNameEl) dayNameEl.textContent = dayData.day;
  if (focusEl) focusEl.textContent = dayData.focus.split('(')[0].trim();

  if (listEl) {
    listEl.innerHTML = dayData.exercises.slice(0, 4).map(ex => `
      <div class="exercise-item">
        <div class="exercise-info">
          <div class="exercise-name">${ex.name}</div>
          <div class="exercise-detail">${ex.sets}×${ex.reps}</div>
        </div>
        <span class="exercise-muscle-tag">${ex.muscle}</span>
      </div>
    `).join('');

    if (dayData.exercises.length > 4) {
      listEl.innerHTML += `<div style="padding: var(--space-2) var(--space-4); color: var(--text-tertiary); font-size: var(--text-sm);">+${dayData.exercises.length - 4} more exercises</div>`;
    }
  }
}

export async function initWorkoutPlan() {
  const tabs = document.getElementById('workoutTabs');
  const planSelect = document.getElementById('workoutPlanSelect');

  await loadWorkoutProgress();

  const todayIndex = getTodayIndex();
  currentDay = todayIndex;

  if (tabs) {
    const tabBtns = tabs.querySelectorAll('.tab');
    tabBtns.forEach(btn => btn.classList.remove('active'));
    if (tabBtns[todayIndex]) tabBtns[todayIndex].classList.add('active');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDay = parseInt(btn.dataset.day);
        renderDay(currentDay);
      });
    });
  }

  if (planSelect) {
    planSelect.addEventListener('change', (e) => {
      currentPlan = e.target.value;
      renderDay(currentDay);
      renderTodayPreview();
    });
  }

  renderDay(currentDay);
  renderTodayPreview();
}
