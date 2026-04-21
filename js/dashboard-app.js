// ============================================
// FORGEFIT DASHBOARD — All-in-One Bundle
// (Regular script — no ES modules, no server needed)
// ============================================

(function () {
  'use strict';

  // ── Auth Gate ──
  const currentUser = ForgeFit.getSession();
  if (!currentUser) {
    window.location.href = 'index.html';
    return;
  }

  // ══════════════════════════════════════════════
  // 1. USER PROFILE SETUP
  // ══════════════════════════════════════════════

  const userName = currentUser.displayName || currentUser.email?.split('@')[0] || 'User';
  const userEmail = currentUser.email || '';
  const userGoal = currentUser.fitnessGoal || 'maintenance';
  const userInitial = userName.charAt(0).toUpperCase();

  function updateUserUI() {
    const fields = {
      'sidebarUserName': userName,
      'sidebarUserEmail': userEmail,
      'userAvatar': userInitial,
      'profileAvatar': userInitial,
      'profileName': userName,
      'profileEmail': userEmail,
    };
    for (const [id, val] of Object.entries(fields)) {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    }

    const goalLabels = { bulking: '🏋️ Bulking', cutting: '🔥 Cutting', maintenance: '⚖️ Maintenance' };
    const profileGoal = document.getElementById('profileGoal');
    if (profileGoal) profileGoal.textContent = goalLabels[userGoal] || userGoal;

    const nameInput = document.getElementById('profileNameInput');
    if (nameInput) nameInput.value = userName;
    const goalSelect = document.getElementById('profileGoalSelect');
    if (goalSelect) goalSelect.value = userGoal;
  }

  updateUserUI();

  // ══════════════════════════════════════════════
  // 2. NAVIGATION
  // ══════════════════════════════════════════════

  const SECTION_TITLES = {
    overview: 'Dashboard', calculator: 'BMI & Protein Calculator',
    workout: '7-Day Workout Plan', diet: 'Diet Plan & Nutrition',
    exercises: 'Exercise Library', progress: 'Progress Tracker',
    profile: 'Profile & Settings'
  };

  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  const navItems = document.querySelectorAll('.nav-item[data-section]');
  const sections = document.querySelectorAll('.section-panel');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const section = item.dataset.section;
      if (!section) return;

      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      sections.forEach(s => { s.classList.remove('active'); s.style.display = 'none'; });

      const target = document.getElementById(`section${capitalize(section)}`);
      if (target) {
        target.style.display = 'block';
        void target.offsetWidth;
        target.classList.add('active');
      }

      const pageTitle = document.getElementById('pageTitle');
      if (pageTitle) pageTitle.textContent = SECTION_TITLES[section] || 'Dashboard';

      // Close mobile sidebar
      document.getElementById('sidebar')?.classList.remove('open');
      document.getElementById('sidebarOverlay')?.classList.remove('active');
    });
  });

  // Mobile menu
  const hamburger = document.getElementById('hamburgerBtn');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      document.getElementById('sidebar')?.classList.toggle('open');
      document.getElementById('sidebarOverlay')?.classList.toggle('active');
    });
  }
  document.getElementById('sidebarOverlay')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('sidebarOverlay')?.classList.remove('active');
  });

  // Current date
  const dateEl = document.getElementById('currentDate');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  // Logout
  document.getElementById('logoutBtn')?.addEventListener('click', (e) => { e.preventDefault(); ForgeFit.logout(); });
  document.getElementById('logoutBtnProfile')?.addEventListener('click', (e) => { e.preventDefault(); ForgeFit.logout(); });

  // Profile form
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('profileNameInput').value.trim();
      const goal = document.getElementById('profileGoalSelect').value;
      if (!name) return;

      const session = ForgeFit.getSession();
      session.displayName = name;
      session.fitnessGoal = goal;
      ForgeFit.setSession(session);

      const users = ForgeFit.getDemoUsers();
      if (users[session.email]) {
        users[session.email].displayName = name;
        users[session.email].fitnessGoal = goal;
        ForgeFit.saveDemoUsers(users);
      }

      ForgeFit.showToast('Profile updated!', 'success');
    });
  }

  // Demo mode toast
  ForgeFit.showToast('⚡ Running in Demo Mode — data saved locally', 'info');

  // ══════════════════════════════════════════════
  // 3. BMI & PROTEIN CALCULATOR
  // ══════════════════════════════════════════════

  const ACTIVITY = {
    sedentary: { tdee: 1.2, protein: 0.8 }, light: { tdee: 1.375, protein: 1.0 },
    moderate: { tdee: 1.55, protein: 1.3 }, active: { tdee: 1.725, protein: 1.6 },
    athlete: { tdee: 1.9, protein: 2.0 }
  };

  const BMI_CATS = [
    { max: 18.5, label: 'Underweight', color: '#40c4ff' },
    { max: 24.9, label: 'Normal', color: '#00e676' },
    { max: 29.9, label: 'Overweight', color: '#ffc107' },
    { max: Infinity, label: 'Obese', color: '#ff5252' }
  ];

  function getBMICat(bmi) {
    for (const c of BMI_CATS) { if (bmi <= c.max) return c; }
    return BMI_CATS[3];
  }

  function animateValue(elId, start, end, dur) {
    const el = document.getElementById(elId);
    if (!el) return;
    const startT = performance.now();
    const isDec = end % 1 !== 0;
    (function tick(now) {
      const p = Math.min((now - startT) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = isDec ? (start + (end - start) * e).toFixed(1) : Math.round(start + (end - start) * e);
      if (p < 1) requestAnimationFrame(tick);
    })(startT);
  }

  const calcForm = document.getElementById('calculatorForm');
  const calcResults = document.getElementById('calculatorResults');
  let lastCalcResults = null;

  if (calcForm) {
    calcForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const w = parseFloat(document.getElementById('calcWeight').value);
      const h = parseFloat(document.getElementById('calcHeight').value);
      const age = parseInt(document.getElementById('calcAge').value);
      const gender = document.getElementById('calcGender').value;
      const act = document.getElementById('calcActivity').value;
      if (!w || !h || !age) return;

      const hm = h / 100;
      const bmi = Math.round((w / (hm * hm)) * 10) / 10;
      const cat = getBMICat(bmi);
      const bmr = Math.round(gender === 'male' ? (10 * w + 6.25 * h - 5 * age + 5) : (10 * w + 6.25 * h - 5 * age - 161));
      const mult = ACTIVITY[act];
      const tdee = Math.round(bmr * mult.tdee);
      const protein = Math.round(w * mult.protein);
      const water = Math.round(w * 0.033 * 10) / 10;

      lastCalcResults = { bmi, cat: cat.label, protein, tdee, bmr, water };
      calcResults.style.display = 'flex';

      animateValue('bmiValue', 0, bmi, 800);
      document.getElementById('bmiCategory').textContent = cat.label;
      document.getElementById('bmiCategory').style.color = cat.color;
      animateValue('proteinResult', 0, protein, 600);
      animateValue('tdeeResult', 0, tdee, 700);
      animateValue('bmrResult', 0, bmr, 650);
      document.getElementById('waterResult').textContent = water + 'L';

      // Gauge
      const circle = document.getElementById('bmiGaugeCircle');
      if (circle) {
        const pct = Math.min(Math.max((bmi - 10) / 30, 0), 1);
        setTimeout(() => {
          circle.style.strokeDashoffset = 534 - pct * 534;
          circle.style.stroke = cat.color;
        }, 100);
      }

      const statBMI = document.getElementById('statBMI');
      if (statBMI) statBMI.textContent = bmi;
    });
  }

  document.getElementById('saveResultsBtn')?.addEventListener('click', () => {
    if (!lastCalcResults) return;
    const results = ForgeFit.getData('calc', '[]');
    results.push({ ...lastCalcResults, date: new Date().toISOString() });
    ForgeFit.saveData('calc', results);
    ForgeFit.showToast('Results saved!', 'success');
  });

  // ══════════════════════════════════════════════
  // 4. WORKOUT PLAN
  // ══════════════════════════════════════════════

  const PLANS = {
    ppl: [
      { day: 'Monday', focus: 'Push (Chest, Shoulders, Triceps)', exercises: [
        { id: 'bp', name: 'Barbell Bench Press', sets: 4, reps: '8-10', muscle: 'Chest', rest: '90s' },
        { id: 'idp', name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', muscle: 'Upper Chest', rest: '60s' },
        { id: 'ohp', name: 'Overhead Press', sets: 4, reps: '8-10', muscle: 'Shoulders', rest: '90s' },
        { id: 'lr', name: 'Lateral Raises', sets: 3, reps: '12-15', muscle: 'Side Delts', rest: '45s' },
        { id: 'tpd', name: 'Tricep Pushdown', sets: 3, reps: '10-12', muscle: 'Triceps', rest: '45s' },
        { id: 'ote', name: 'Overhead Tricep Extension', sets: 3, reps: '10-12', muscle: 'Triceps', rest: '45s' }
      ]},
      { day: 'Tuesday', focus: 'Pull (Back, Biceps)', exercises: [
        { id: 'dl', name: 'Conventional Deadlift', sets: 4, reps: '5-6', muscle: 'Back', rest: '120s' },
        { id: 'pu', name: 'Pull-Ups / Lat Pulldown', sets: 4, reps: '8-10', muscle: 'Lats', rest: '90s' },
        { id: 'br', name: 'Barbell Bent-Over Row', sets: 4, reps: '8-10', muscle: 'Mid Back', rest: '90s' },
        { id: 'fp', name: 'Face Pulls', sets: 3, reps: '15-20', muscle: 'Rear Delts', rest: '45s' },
        { id: 'bc', name: 'Barbell Bicep Curls', sets: 3, reps: '10-12', muscle: 'Biceps', rest: '45s' },
        { id: 'hc', name: 'Hammer Curls', sets: 3, reps: '10-12', muscle: 'Biceps', rest: '45s' }
      ]},
      { day: 'Wednesday', focus: 'Legs & Core', exercises: [
        { id: 'sq', name: 'Barbell Back Squat', sets: 4, reps: '6-8', muscle: 'Quads', rest: '120s' },
        { id: 'rdl', name: 'Romanian Deadlift', sets: 3, reps: '10-12', muscle: 'Hamstrings', rest: '90s' },
        { id: 'lp', name: 'Leg Press', sets: 3, reps: '10-12', muscle: 'Quads', rest: '90s' },
        { id: 'lc', name: 'Lying Leg Curls', sets: 3, reps: '10-12', muscle: 'Hamstrings', rest: '60s' },
        { id: 'cr', name: 'Standing Calf Raises', sets: 4, reps: '12-15', muscle: 'Calves', rest: '45s' },
        { id: 'pl', name: 'Plank Hold', sets: 3, reps: '60s', muscle: 'Core', rest: '30s' }
      ]},
      { day: 'Thursday', focus: 'Push (Chest, Shoulders, Triceps)', exercises: [
        { id: 'dbp', name: 'Dumbbell Bench Press', sets: 4, reps: '10-12', muscle: 'Chest', rest: '90s' },
        { id: 'cf', name: 'Cable Flyes', sets: 3, reps: '12-15', muscle: 'Chest', rest: '60s' },
        { id: 'ap', name: 'Arnold Press', sets: 3, reps: '10-12', muscle: 'Shoulders', rest: '60s' },
        { id: 'fr', name: 'Front Raises', sets: 3, reps: '12-15', muscle: 'Front Delts', rest: '45s' },
        { id: 'wd', name: 'Weighted Dips', sets: 3, reps: '8-10', muscle: 'Triceps', rest: '60s' },
        { id: 'sc', name: 'Skull Crushers', sets: 3, reps: '10-12', muscle: 'Triceps', rest: '45s' }
      ]},
      { day: 'Friday', focus: 'Pull (Back, Biceps)', exercises: [
        { id: 'tbr', name: 'T-Bar Rows', sets: 4, reps: '8-10', muscle: 'Back', rest: '90s' },
        { id: 'scr', name: 'Seated Cable Row', sets: 3, reps: '10-12', muscle: 'Mid Back', rest: '60s' },
        { id: 'sar', name: 'Single Arm DB Row', sets: 3, reps: '10-12', muscle: 'Lats', rest: '60s' },
        { id: 'rdf', name: 'Reverse Pec Dec Fly', sets: 3, reps: '12-15', muscle: 'Rear Delts', rest: '45s' },
        { id: 'idc', name: 'Incline DB Curls', sets: 3, reps: '10-12', muscle: 'Biceps', rest: '45s' },
        { id: 'cc', name: 'Concentration Curls', sets: 3, reps: '10-12', muscle: 'Biceps', rest: '45s' }
      ]},
      { day: 'Saturday', focus: 'Legs & Abs', exercises: [
        { id: 'fsq', name: 'Front Squats', sets: 4, reps: '8-10', muscle: 'Quads', rest: '120s' },
        { id: 'bss', name: 'Bulgarian Split Squats', sets: 3, reps: '10 each', muscle: 'Quads', rest: '60s' },
        { id: 'ht', name: 'Hip Thrusts', sets: 4, reps: '10-12', muscle: 'Glutes', rest: '90s' },
        { id: 'le', name: 'Leg Extensions', sets: 3, reps: '12-15', muscle: 'Quads', rest: '45s' },
        { id: 'hlr', name: 'Hanging Leg Raises', sets: 3, reps: '12-15', muscle: 'Abs', rest: '45s' },
        { id: 'ccr', name: 'Cable Crunches', sets: 3, reps: '15-20', muscle: 'Abs', rest: '30s' }
      ]},
      { day: 'Sunday', focus: 'Rest & Recovery', exercises: [
        { id: 'str', name: 'Full Body Stretching', sets: 1, reps: '15 min', muscle: 'Flexibility', rest: '--' },
        { id: 'frl', name: 'Foam Rolling', sets: 1, reps: '10 min', muscle: 'Recovery', rest: '--' },
        { id: 'yg', name: 'Light Yoga / Meditation', sets: 1, reps: '20 min', muscle: 'Mobility', rest: '--' },
        { id: 'wk', name: 'Light Walk', sets: 1, reps: '30 min', muscle: 'Active Recovery', rest: '--' }
      ]}
    ]
  };

  let curPlan = 'ppl';
  let curDayIdx = 0;
  let completedEx = ForgeFit.getData('workout', '{}');
  if (typeof completedEx !== 'object' || Array.isArray(completedEx)) completedEx = {};

  function getTodayIdx() { const d = new Date().getDay(); return d === 0 ? 6 : d - 1; }
  function getDateStr(idx) {
    const now = new Date(); const diff = idx - getTodayIdx();
    const t = new Date(now); t.setDate(now.getDate() + diff);
    return t.toISOString().slice(0, 10);
  }

  function renderWorkoutDay(idx) {
    const days = PLANS[curPlan];
    const day = days[idx];
    const container = document.getElementById('workoutDayContent');
    if (!container || !day) return;
    const ds = getDateStr(idx);

    container.innerHTML = `
      <div class="workout-day-card animate-fade-up">
        <div class="workout-day-header">
          <div><div class="workout-day-name">${day.day}</div><div class="workout-focus">${day.focus}</div></div>
          <span class="badge badge-neon" id="dayProgressBadge">0/${day.exercises.length}</span>
        </div>
        <div class="exercise-list">
          ${day.exercises.map(ex => {
            const key = `${ds}_${ex.id}`;
            const done = completedEx[key] || false;
            return `<div class="exercise-item ${done ? 'completed' : ''}" data-key="${key}">
              <button class="exercise-item-check ${done ? 'checked' : ''}" data-key="${key}">${done ? '✓' : ''}</button>
              <div class="exercise-info"><div class="exercise-name">${ex.name}</div><div class="exercise-detail">${ex.sets} sets × ${ex.reps} · Rest: ${ex.rest}</div></div>
              <span class="exercise-muscle-tag">${ex.muscle}</span>
            </div>`;
          }).join('')}
        </div>
      </div>`;

    // Event delegation for checkboxes
    container.querySelectorAll('.exercise-item-check').forEach(btn => {
      btn.addEventListener('click', () => {
        const k = btn.dataset.key;
        completedEx[k] = !completedEx[k];
        btn.classList.toggle('checked', completedEx[k]);
        btn.textContent = completedEx[k] ? '✓' : '';
        btn.closest('.exercise-item').classList.toggle('completed', completedEx[k]);
        ForgeFit.saveData('workout', completedEx);
        updateDayBadge(ds, day.exercises.length);
        updateWeeklyStat();
      });
    });

    updateDayBadge(ds, day.exercises.length);
  }

  function updateDayBadge(ds, total) {
    const badge = document.getElementById('dayProgressBadge');
    if (!badge) return;
    let done = 0;
    for (const k in completedEx) { if (k.startsWith(ds) && completedEx[k]) done++; }
    badge.textContent = `${done}/${total}`;
  }

  function updateWeeklyStat() {
    const el = document.getElementById('statWorkouts');
    if (!el) return;
    let daysWorked = 0;
    for (let i = 0; i < 7; i++) {
      const ds = getDateStr(i);
      for (const k in completedEx) { if (k.startsWith(ds) && completedEx[k]) { daysWorked++; break; } }
    }
    el.textContent = daysWorked;
  }

  // Day tabs
  const workoutTabs = document.getElementById('workoutTabs');
  if (workoutTabs) {
    const todayIdx = getTodayIdx();
    curDayIdx = todayIdx;
    const btns = workoutTabs.querySelectorAll('.tab');
    btns.forEach(b => b.classList.remove('active'));
    if (btns[todayIdx]) btns[todayIdx].classList.add('active');

    btns.forEach(b => {
      b.addEventListener('click', () => {
        btns.forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        curDayIdx = parseInt(b.dataset.day);
        renderWorkoutDay(curDayIdx);
      });
    });
  }

  // Today's preview
  function renderTodayPreview() {
    const days = PLANS[curPlan];
    const day = days[getTodayIdx()];
    const nameEl = document.getElementById('todayDayName');
    const focusEl = document.getElementById('todayFocus');
    const listEl = document.getElementById('todayExerciseList');

    if (nameEl) nameEl.textContent = day.day;
    if (focusEl) focusEl.textContent = day.focus.split('(')[0].trim();
    if (listEl) {
      listEl.innerHTML = day.exercises.slice(0, 4).map(ex => `
        <div class="exercise-item"><div class="exercise-info"><div class="exercise-name">${ex.name}</div><div class="exercise-detail">${ex.sets}×${ex.reps}</div></div><span class="exercise-muscle-tag">${ex.muscle}</span></div>
      `).join('') + (day.exercises.length > 4 ? `<div style="padding:4px 16px;color:var(--text-tertiary);font-size:var(--text-sm);">+${day.exercises.length - 4} more</div>` : '');
    }
  }

  renderWorkoutDay(curDayIdx);
  renderTodayPreview();
  updateWeeklyStat();

  // ══════════════════════════════════════════════
  // 5. DIET PLAN
  // ══════════════════════════════════════════════

  const MEALS = {
    bulking: {
      cal: 3200, p: 180, c: 400, f: 90,
      meals: [
        { time: 'Breakfast', icon: '🌅', name: 'Power Oats & Eggs', cal: 650, p: 40, c: 80, f: 18, ing: 'Oats (80g), eggs (3), banana, peanut butter, honey, milk' },
        { time: 'Mid-Morning', icon: '🍌', name: 'Protein Shake & Almonds', cal: 400, p: 35, c: 30, f: 15, ing: 'Whey protein, banana, milk (300ml), almonds (20g)' },
        { time: 'Lunch', icon: '☀️', name: 'Chicken Rice Bowl', cal: 750, p: 50, c: 90, f: 18, ing: 'Grilled chicken (200g), brown rice (150g), vegetables, olive oil' },
        { time: 'Snack', icon: '🥜', name: 'Greek Yogurt & Granola', cal: 350, p: 25, c: 40, f: 10, ing: 'Greek yogurt (200g), granola (40g), berries, honey' },
        { time: 'Dinner', icon: '🌙', name: 'Salmon & Sweet Potato', cal: 700, p: 45, c: 70, f: 25, ing: 'Salmon (180g), sweet potato (200g), broccoli, asparagus' },
        { time: 'Before Bed', icon: '🌜', name: 'Casein Shake', cal: 350, p: 30, c: 15, f: 8, ing: 'Casein protein, milk (250ml), peanut butter, cinnamon' }
      ]
    },
    cutting: {
      cal: 2000, p: 180, c: 150, f: 65,
      meals: [
        { time: 'Breakfast', icon: '🌅', name: 'Egg White Omelette', cal: 350, p: 35, c: 20, f: 12, ing: 'Egg whites (5), spinach, peppers, tomatoes, wheat toast' },
        { time: 'Mid-Morning', icon: '🍏', name: 'Protein & Apple', cal: 250, p: 30, c: 20, f: 5, ing: 'Whey protein with water, green apple' },
        { time: 'Lunch', icon: '☀️', name: 'Grilled Chicken Salad', cal: 450, p: 45, c: 25, f: 18, ing: 'Chicken (180g), mixed greens, tomatoes, quinoa (50g)' },
        { time: 'Snack', icon: '🥒', name: 'Cottage Cheese & Veggies', cal: 200, p: 25, c: 10, f: 6, ing: 'Low-fat cottage cheese (150g), celery, carrot sticks' },
        { time: 'Dinner', icon: '🌙', name: 'Fish & Vegetables', cal: 450, p: 40, c: 30, f: 16, ing: 'White fish (200g), broccoli, green beans, brown rice (80g)' },
        { time: 'Before Bed', icon: '🌜', name: 'Casein & Almonds', cal: 300, p: 28, c: 10, f: 12, ing: 'Casein protein with water, almonds (15g)' }
      ]
    },
    maintenance: {
      cal: 2500, p: 150, c: 280, f: 80,
      meals: [
        { time: 'Breakfast', icon: '🌅', name: 'Balanced Bowl', cal: 480, p: 30, c: 55, f: 15, ing: 'Oats (60g), eggs (2), banana, milk, seeds' },
        { time: 'Mid-Morning', icon: '🍎', name: 'Trail Mix & Fruit', cal: 300, p: 15, c: 35, f: 12, ing: 'Mixed nuts (25g), dried fruits, apple, dark chocolate' },
        { time: 'Lunch', icon: '☀️', name: 'Turkey Wrap', cal: 550, p: 40, c: 50, f: 18, ing: 'Turkey (150g), wheat wrap, avocado, lettuce, cheese' },
        { time: 'Snack', icon: '🥛', name: 'Protein Smoothie', cal: 320, p: 25, c: 35, f: 8, ing: 'Whey protein, berries, banana, oat milk' },
        { time: 'Dinner', icon: '🌙', name: 'Steak & Potatoes', cal: 600, p: 42, c: 55, f: 20, ing: 'Lean steak (180g), baby potatoes, asparagus, salad' },
        { time: 'Before Bed', icon: '🌜', name: 'Greek Yogurt', cal: 250, p: 20, c: 15, f: 10, ing: 'Greek yogurt (200g), walnuts (10g), honey' }
      ]
    }
  };

  let curGoal = userGoal;
  let waterCount = 0;

  function renderDiet(goal) {
    const plan = MEALS[goal]; if (!plan) return;
    const summary = document.getElementById('macroSummary');
    if (summary) {
      summary.innerHTML = `
        <div class="macro-card animate-fade-up stagger-1"><div class="macro-value" style="color:var(--color-neon)">${plan.cal}<span class="macro-unit">kcal</span></div><div class="macro-label">Daily Calories</div></div>
        <div class="macro-card animate-fade-up stagger-2"><div class="macro-value" style="color:var(--color-info)">${plan.p}<span class="macro-unit">g</span></div><div class="macro-label">Protein</div></div>
        <div class="macro-card animate-fade-up stagger-3"><div class="macro-value" style="color:var(--color-warning)">${plan.c}<span class="macro-unit">g</span></div><div class="macro-label">Carbs</div></div>
        <div class="macro-card animate-fade-up stagger-4"><div class="macro-value" style="color:var(--color-error)">${plan.f}<span class="macro-unit">g</span></div><div class="macro-label">Fats</div></div>`;
    }
    const grid = document.getElementById('mealGrid');
    if (grid) {
      grid.innerHTML = plan.meals.map((m, i) => `
        <div class="meal-card animate-fade-up stagger-${i + 1}">
          <div class="meal-card-header"><span class="meal-time-icon">${m.icon}</span><span class="meal-time">${m.time}</span><span class="badge badge-neon" style="margin-left:auto">${m.cal} kcal</span></div>
          <div class="meal-card-body"><div class="meal-name">${m.name}</div>
            <div class="meal-macros"><span class="meal-macro"><strong>${m.p}g</strong> protein</span><span class="meal-macro"><strong>${m.c}g</strong> carbs</span><span class="meal-macro"><strong>${m.f}g</strong> fats</span></div>
            <div class="meal-ingredients">📝 ${m.ing}</div>
          </div></div>`).join('');
    }
    renderWater();
  }

  function renderWater() {
    const container = document.getElementById('waterGlasses');
    const countEl = document.getElementById('waterCount');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 8; i++) {
      const g = document.createElement('div');
      g.className = `water-glass ${i < waterCount ? 'filled' : ''}`;
      g.addEventListener('click', () => { waterCount = i + 1; renderWater(); const s = document.getElementById('statWater'); if (s) s.textContent = `${waterCount}/8`; });
      container.appendChild(g);
    }
    if (countEl) countEl.textContent = waterCount;
  }

  const dietTabs = document.getElementById('dietGoalTabs');
  if (dietTabs) {
    const btns = dietTabs.querySelectorAll('.tab');
    btns.forEach(b => { b.classList.remove('active'); if (b.dataset.goal === curGoal) b.classList.add('active'); });
    btns.forEach(b => b.addEventListener('click', () => { btns.forEach(x => x.classList.remove('active')); b.classList.add('active'); curGoal = b.dataset.goal; renderDiet(curGoal); }));
  }
  renderDiet(curGoal);

  // ══════════════════════════════════════════════
  // 6. EXERCISE LIBRARY
  // ══════════════════════════════════════════════

  const EXERCISES = [
    { id: 'bp', name: 'Barbell Bench Press', muscle: 'chest', diff: 3, inst: ['Lie flat, grip wider than shoulders.','Lower bar to mid-chest.','Press up until arms extended.','Keep shoulder blades squeezed.','Control the weight throughout.'] },
    { id: 'idp', name: 'Incline Dumbbell Press', muscle: 'chest', diff: 2, inst: ['Set bench to 30-45°.','Hold DBs at shoulder height.','Press up and slightly inward.','Lower slowly with control.','Focus on upper chest.'] },
    { id: 'cf', name: 'Cable Chest Flyes', muscle: 'chest', diff: 2, inst: ['Set pulleys at chest height.','Step forward, slight elbow bend.','Bring hands together in front.','Squeeze chest at the peak.','Return slowly in a wide arc.'] },
    { id: 'pup', name: 'Push-Ups', muscle: 'chest', diff: 1, inst: ['Hands wider than shoulders.','Straight line head to heels.','Lower chest to floor.','Push up to full extension.','Engage core throughout.'] },
    { id: 'dl', name: 'Conventional Deadlift', muscle: 'back', diff: 3, inst: ['Feet hip-width, bar over mid-foot.','Grip just outside legs.','Chest up, back flat.','Drive through heels.','Squeeze glutes at top.'] },
    { id: 'pullup', name: 'Pull-Ups', muscle: 'back', diff: 3, inst: ['Overhand grip, wider than shoulders.','Pull chin above bar.','Keep core tight, no swinging.','Lower with control.','Use bands for assistance.'] },
    { id: 'row', name: 'Bent-Over Barbell Row', muscle: 'back', diff: 2, inst: ['Bend hips to 45°.','Grip wider than shoulders.','Pull to lower ribcage.','Squeeze shoulder blades.','Lower with control.'] },
    { id: 'lpd', name: 'Lat Pulldown', muscle: 'back', diff: 1, inst: ['Secure thighs under pads.','Wide overhand grip.','Pull to upper chest.','Lean back slightly.','Return slowly.'] },
    { id: 'ohp', name: 'Overhead Press', muscle: 'shoulders', diff: 3, inst: ['Feet shoulder-width apart.','Bar on upper chest.','Press overhead in straight line.','Lock out at top.','Lower to shoulders with control.'] },
    { id: 'lr', name: 'Lateral Raises', muscle: 'shoulders', diff: 1, inst: ['DBs at sides.','Slight elbow bend, raise to side.','Lift to shoulder height.','Pause at top.','Lower slowly.'] },
    { id: 'fp', name: 'Face Pulls', muscle: 'shoulders', diff: 1, inst: ['Cable at upper chest, rope attachment.','Pull towards face, elbows high.','Externally rotate at end.','Squeeze rear delts.','Return slowly.'] },
    { id: 'bc', name: 'Barbell Bicep Curls', muscle: 'arms', diff: 1, inst: ['Stand, underhand grip.','Elbows pinned to sides.','Curl up contracting biceps.','Squeeze at top.','Lower with control.'] },
    { id: 'tpd', name: 'Tricep Pushdown', muscle: 'arms', diff: 1, inst: ['Face cable machine.','Overhand grip, elbows tucked.','Push down to full extension.','Squeeze triceps.','Return slowly.'] },
    { id: 'hc', name: 'Hammer Curls', muscle: 'arms', diff: 1, inst: ['Neutral grip (palms in).','Elbows stationary.','Curl up without rotating.','Squeeze at top.','Lower slowly.'] },
    { id: 'sc', name: 'Skull Crushers', muscle: 'arms', diff: 2, inst: ['Lie on bench, EZ-bar above.','Upper arms vertical.','Lower towards forehead.','Stop just before touching.','Extend using triceps only.'] },
    { id: 'sq', name: 'Barbell Back Squat', muscle: 'legs', diff: 3, inst: ['Bar on upper back.','Feet shoulder-width, toes out.','Brace core, push hips back.','Thighs parallel to floor.','Drive through heels.'] },
    { id: 'rdl', name: 'Romanian Deadlift', muscle: 'legs', diff: 2, inst: ['Bar at hip height.','Push hips back, slight knee bend.','Lower along legs until stretch.','Keep back flat.','Drive hips forward.'] },
    { id: 'lp', name: 'Leg Press', muscle: 'legs', diff: 2, inst: ['Back against pad.','Feet shoulder-width on platform.','Lower to 90° knee bend.','Don\'t round lower back.','Press through heels.'] },
    { id: 'lng', name: 'Walking Lunges', muscle: 'legs', diff: 2, inst: ['Stand with DBs at sides.','Long stride forward.','Lower back knee to floor.','Front knee over toes.','Push off, step forward.'] },
    { id: 'plk', name: 'Plank Hold', muscle: 'core', diff: 1, inst: ['Forearms on ground.','Extend legs behind.','Straight line head to heels.','Engage core and glutes.','Breathe normally, hold time.'] },
    { id: 'hlr', name: 'Hanging Leg Raises', muscle: 'core', diff: 3, inst: ['Hang from bar, arms straight.','Keep legs straight.','Raise to parallel or higher.','No swinging.','Lower slowly.'] },
    { id: 'rt', name: 'Russian Twists', muscle: 'core', diff: 2, inst: ['Sit, knees bent, feet elevated.','Lean back 45°.','Hold weight with both hands.','Rotate to touch each side.','Keep core tight.'] },
    { id: 'jr', name: 'Jump Rope', muscle: 'cardio', diff: 1, inst: ['Handles at hip height.','Use wrist motion to spin.','Small quick bounces.','Land on balls of feet.','Build up duration.'] },
    { id: 'brp', name: 'Burpees', muscle: 'cardio', diff: 3, inst: ['Squat, hands on floor.','Jump feet back to plank.','Optional push-up.','Jump feet forward.','Explode up, hands overhead.'] },
    { id: 'mc', name: 'Mountain Climbers', muscle: 'cardio', diff: 2, inst: ['Push-up position.','Drive knee to chest.','Switch legs quickly.','Keep hips low.','Maintain form at speed.'] },
  ];

  let exFilter = 'all';
  let exSearch = '';

  function renderExercises() {
    const grid = document.getElementById('exerciseGrid');
    if (!grid) return;

    const filtered = EXERCISES.filter(ex => {
      return (exFilter === 'all' || ex.muscle === exFilter) &&
        (!exSearch || ex.name.toLowerCase().includes(exSearch.toLowerCase()));
    });

    if (filtered.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-tertiary)"><div style="font-size:2rem;margin-bottom:1rem">🔍</div>No exercises found</div>';
      return;
    }

    grid.innerHTML = filtered.map((ex, i) => {
      const dots = [1, 2, 3].map(d => `<div class="difficulty-dot ${d <= ex.diff ? 'active' : ''}"></div>`).join('');
      return `<div class="exercise-lib-card animate-fade-up stagger-${(i % 6) + 1}" id="ex-${ex.id}">
        <div class="exercise-lib-visual" style="display:flex;align-items:center;justify-content:center;font-size:3rem;height:140px;background:var(--bg-secondary)">
          ${{ chest: '🏋️', back: '🔙', shoulders: '💪', arms: '💪', legs: '🦵', core: '🧘', cardio: '🏃' }[ex.muscle] || '💪'}
        </div>
        <div class="exercise-lib-info">
          <div class="exercise-lib-name">${ex.name}</div>
          <div class="exercise-lib-muscle">${ex.muscle}</div>
          <div class="exercise-difficulty">${dots}</div>
        </div>
        <div class="exercise-lib-instructions">
          <h4>How to Perform</h4>
          <ol>${ex.inst.map(s => `<li>${s}</li>`).join('')}</ol>
        </div>
      </div>`;
    }).join('');

    // Click to expand
    grid.querySelectorAll('.exercise-lib-card').forEach(card => {
      card.addEventListener('click', () => card.classList.toggle('expanded'));
    });
  }

  document.getElementById('exerciseFilters')?.addEventListener('click', e => {
    if (e.target.classList.contains('filter-btn')) {
      document.querySelectorAll('#exerciseFilters .filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      exFilter = e.target.dataset.filter;
      renderExercises();
    }
  });

  document.getElementById('exerciseSearch')?.addEventListener('input', e => {
    exSearch = e.target.value;
    renderExercises();
  });

  renderExercises();

  // ══════════════════════════════════════════════
  // 7. PROGRESS CHARTS (Chart.js)
  // ══════════════════════════════════════════════

  const chartDark = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#a0a0a0', font: { family: 'Inter', size: 12 } } } },
    scales: {
      x: { ticks: { color: '#666', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: '#666', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.05)' } }
    }
  };

  let wChart, miniWChart, woChart, bChart;

  function getWeightLogs() {
    return ForgeFit.getData('weightlogs', '[]').map(l => ({ ...l, date: new Date(l.date) }));
  }

  function renderCharts() {
    const logs = getWeightLogs();
    const labels = logs.map(l => l.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    const weights = logs.map(l => l.weight);

    // Weight chart
    const wCtx = document.getElementById('weightChart');
    if (wCtx) {
      if (wChart) wChart.destroy();
      wChart = new Chart(wCtx, { type: 'line', data: {
        labels: labels.length ? labels : ['No data'], datasets: [{
          label: 'Weight (kg)', data: weights.length ? weights : [0],
          borderColor: '#ccff00', backgroundColor: 'rgba(204,255,0,0.1)',
          borderWidth: 2, fill: true, tension: 0.4, pointBackgroundColor: '#ccff00', pointRadius: 4
        }]
      }, options: chartDark });
    }

    // Mini chart
    const mCtx = document.getElementById('miniWeightChart');
    if (mCtx) {
      const recent = logs.slice(-7);
      if (miniWChart) miniWChart.destroy();
      miniWChart = new Chart(mCtx, { type: 'line', data: {
        labels: recent.length ? recent.map(l => l.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) : ['No data'],
        datasets: [{ data: recent.length ? recent.map(l => l.weight) : [0], borderColor: '#ccff00', backgroundColor: 'rgba(204,255,0,0.08)', borderWidth: 2, fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: '#ccff00' }]
      }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#666', font: { size: 10 } }, grid: { display: false } }, y: { ticks: { color: '#666', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.03)' } } } } });
    }

    // Workout consistency
    const woCtx = document.getElementById('workoutChart');
    if (woCtx) {
      const workoutData = ForgeFit.getData('workout', '{}');
      // Count days with any completed exercise for each of last 4 weeks
      const weekLabels = []; const weekValues = [];
      for (let w = 3; w >= 0; w--) {
        let count = 0; const start = new Date(); start.setDate(start.getDate() - (w * 7 + 6));
        const label = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        weekLabels.push(label);
        for (let d = 0; d < 7; d++) {
          const date = new Date(start); date.setDate(start.getDate() + d);
          const ds = date.toISOString().slice(0, 10);
          for (const k in workoutData) { if (k.startsWith(ds) && workoutData[k]) { count++; break; } }
        }
        weekValues.push(count);
      }

      if (woChart) woChart.destroy();
      woChart = new Chart(woCtx, { type: 'bar', data: {
        labels: weekLabels, datasets: [{ label: 'Workouts', data: weekValues,
          backgroundColor: 'rgba(204,255,0,0.6)', borderColor: '#ccff00', borderWidth: 1, borderRadius: 6, maxBarThickness: 40
        }]
      }, options: { ...chartDark, scales: { ...chartDark.scales, y: { ...chartDark.scales.y, beginAtZero: true, max: 7 } } } });
    }

    // BMI chart 
    const bCtx = document.getElementById('bmiChart');
    if (bCtx) {
      const calcResults = ForgeFit.getData('calc', '[]');
      const bLabels = calcResults.map(r => new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      const bmis = calcResults.map(r => r.bmi);

      if (bChart) bChart.destroy();
      bChart = new Chart(bCtx, { type: 'line', data: {
        labels: bLabels.length ? bLabels : ['No data'],
        datasets: [
          { label: 'BMI', data: bmis.length ? bmis : [0], borderColor: '#40c4ff', backgroundColor: 'rgba(64,196,255,0.1)', borderWidth: 2, fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#40c4ff' },
          { label: 'Upper Normal (24.9)', data: new Array(Math.max(bLabels.length, 1)).fill(24.9), borderColor: 'rgba(0,230,118,0.4)', borderWidth: 1, borderDash: [5, 5], pointRadius: 0, fill: false },
          { label: 'Lower Normal (18.5)', data: new Array(Math.max(bLabels.length, 1)).fill(18.5), borderColor: 'rgba(0,230,118,0.4)', borderWidth: 1, borderDash: [5, 5], pointRadius: 0, fill: false }
        ]
      }, options: chartDark });
    }
  }

  // Weight logging
  const logForm = document.getElementById('logWeightForm');
  if (logForm) {
    logForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('logWeight');
      const w = parseFloat(input.value); if (!w) return;
      const btn = logForm.querySelector('.btn');
      btn.disabled = true; btn.textContent = 'Logging...';

      const logs = JSON.parse(localStorage.getItem(`forgefit_weightlogs_${currentUser.uid}`) || '[]');
      logs.push({ weight: w, date: new Date().toISOString() });
      localStorage.setItem(`forgefit_weightlogs_${currentUser.uid}`, JSON.stringify(logs));

      renderCharts();
      input.value = '';
      btn.textContent = '✅ Logged!';
      setTimeout(() => { btn.textContent = 'Log Weight'; btn.disabled = false; }, 1200);
    });
  }

  renderCharts();

})();
