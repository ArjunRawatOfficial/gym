// ============================================
// HEALTH PROFILE — Multi-Step Wizard Logic
// (Regular script — no ES modules)
// ============================================

(function () {
  'use strict';

  // ── Auth Gate ──
  const currentUser = ForgeFit.getSession();
  if (!currentUser) {
    window.location.href = 'index.html';
    return;
  }

  // If profile already complete, redirect to dashboard
  if (ForgeFit.isHealthProfileComplete()) {
    window.location.href = 'dashboard.html';
    return;
  }

  // ══════════════════════════════════════════════
  // STATE
  // ══════════════════════════════════════════════

  let currentStep = 1;
  const totalSteps = 4;
  let exerciseRows = [];
  let exerciseIdCounter = 0;

  // Greeting
  const greetEl = document.getElementById('hpGreeting');
  if (greetEl) {
    const name = currentUser.displayName || currentUser.email?.split('@')[0] || 'User';
    greetEl.textContent = `Welcome, ${name}! Let's set up your health profile`;
  }

  // ══════════════════════════════════════════════
  // STEP NAVIGATION
  // ══════════════════════════════════════════════

  const progressFill = document.getElementById('hpProgressFill');
  const stepDots = document.querySelectorAll('.hp-step-dot');
  const steps = document.querySelectorAll('.hp-step');
  const backBtn = document.getElementById('hpBackBtn');
  const nextBtn = document.getElementById('hpNextBtn');

  function updateProgress() {
    const pct = (currentStep / totalSteps) * 100;
    if (progressFill) progressFill.style.width = pct + '%';

    stepDots.forEach(dot => {
      const stepNum = parseInt(dot.dataset.step);
      dot.classList.remove('active', 'completed');
      if (stepNum === currentStep) dot.classList.add('active');
      else if (stepNum < currentStep) dot.classList.add('completed');
    });

    // Show/hide back button
    if (backBtn) backBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';

    // Update next button text
    if (nextBtn) {
      if (currentStep === totalSteps) {
        nextBtn.innerHTML = '✅ Complete Profile';
      } else {
        nextBtn.innerHTML = 'Next →';
      }
    }
  }

  function showStep(stepNum) {
    steps.forEach(s => {
      s.classList.remove('active', 'slide-out-left', 'slide-out-right', 'slide-in-left', 'slide-in-right');
    });

    const targetStep = document.getElementById(`hpStep${stepNum}`);
    if (targetStep) {
      targetStep.classList.add('active');
    }

    currentStep = stepNum;
    updateProgress();

    // If step 4, populate summary
    if (stepNum === 4) {
      populateSummary();
    }
  }

  function goNext() {
    if (currentStep >= totalSteps) {
      submitProfile();
      return;
    }

    if (!validateStep(currentStep)) return;

    const oldStep = document.getElementById(`hpStep${currentStep}`);
    if (oldStep) {
      oldStep.classList.add('slide-out-left');
      oldStep.addEventListener('animationend', function handler() {
        oldStep.removeEventListener('animationend', handler);
        oldStep.classList.remove('active', 'slide-out-left');
        showStep(currentStep); // currentStep is already incremented below
      }, { once: true });
    }

    currentStep++;
    // Direct show (fallback if animation doesn't fire)
    setTimeout(() => {
      if (!document.getElementById(`hpStep${currentStep}`).classList.contains('active')) {
        showStep(currentStep);
      }
    }, 400);
  }

  function goBack() {
    if (currentStep <= 1) return;

    const oldStep = document.getElementById(`hpStep${currentStep}`);
    if (oldStep) {
      oldStep.classList.remove('active');
    }

    currentStep--;
    showStep(currentStep);
  }

  if (nextBtn) nextBtn.addEventListener('click', goNext);
  if (backBtn) backBtn.addEventListener('click', goBack);

  // ══════════════════════════════════════════════
  // VALIDATION
  // ══════════════════════════════════════════════

  function validateStep(step) {
    switch (step) {
      case 1:
        const age = document.getElementById('hpAge').value;
        const gender = document.getElementById('hpGender').value;
        const height = document.getElementById('hpHeight').value;
        const weight = document.getElementById('hpWeight').value;

        if (!age || !gender || !height || !weight) {
          ForgeFit.showToast('Please fill in age, gender, height, and weight', 'warning');
          return false;
        }
        if (parseInt(age) < 10 || parseInt(age) > 120) {
          ForgeFit.showToast('Please enter a valid age (10-120)', 'warning');
          return false;
        }
        return true;

      case 2:
        // Health step — all fields optional, always valid
        return true;

      case 3:
        const exp = document.getElementById('hpExperience').value;
        const freq = document.getElementById('hpFrequency').value;
        const type = document.getElementById('hpWorkoutType').value;
        const dur = document.getElementById('hpDuration').value;

        if (!exp || !freq || !type || !dur) {
          ForgeFit.showToast('Please fill in all workout details', 'warning');
          return false;
        }
        return true;

      case 4:
        const goal = document.getElementById('hpGoal').value;
        if (!goal) {
          ForgeFit.showToast('Please select your primary fitness goal', 'warning');
          return false;
        }
        return true;
    }
    return true;
  }

  // ══════════════════════════════════════════════
  // HEALTH CONDITIONS — "None" toggle
  // ══════════════════════════════════════════════

  const noIssuesCheckbox = document.getElementById('hpNoIssues');
  const healthIssuesContainer = document.getElementById('hpHealthIssues');

  if (noIssuesCheckbox && healthIssuesContainer) {
    noIssuesCheckbox.addEventListener('change', () => {
      if (noIssuesCheckbox.checked) {
        healthIssuesContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
          if (cb !== noIssuesCheckbox) cb.checked = false;
        });
      }
    });

    healthIssuesContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      if (cb !== noIssuesCheckbox) {
        cb.addEventListener('change', () => {
          if (cb.checked) noIssuesCheckbox.checked = false;
        });
      }
    });
  }

  // ══════════════════════════════════════════════
  // DYNAMIC EXERCISE ROWS
  // ══════════════════════════════════════════════

  const exerciseListEl = document.getElementById('hpExerciseList');
  const addExerciseBtn = document.getElementById('hpAddExercise');

  function createExerciseRow(data = {}) {
    const id = ++exerciseIdCounter;
    const row = document.createElement('div');
    row.className = 'hp-exercise-row animate-fade-up';
    row.dataset.id = id;

    row.innerHTML = `
      <div class="hp-exercise-row-fields">
        <div class="form-group hp-ex-name-group">
          <input class="form-input" type="text" placeholder="Exercise name (e.g., Bench Press)" value="${data.name || ''}" data-field="name">
        </div>
        <div class="form-group hp-ex-small-group">
          <input class="form-input" type="number" placeholder="Sets" min="1" max="20" value="${data.sets || ''}" data-field="sets">
        </div>
        <div class="form-group hp-ex-small-group">
          <input class="form-input" type="text" placeholder="Reps (e.g., 8-12)" value="${data.reps || ''}" data-field="reps">
        </div>
        <div class="form-group hp-ex-small-group">
          <input class="form-input" type="text" placeholder="Weight (kg)" value="${data.weight || ''}" data-field="weight">
        </div>
        <button type="button" class="hp-remove-exercise" data-id="${id}" aria-label="Remove exercise">✕</button>
      </div>
    `;

    // Remove handler
    row.querySelector('.hp-remove-exercise').addEventListener('click', () => {
      row.classList.add('hp-row-removing');
      setTimeout(() => {
        row.remove();
        exerciseRows = exerciseRows.filter(r => r.id !== id);
        updateExerciseLabels();
      }, 300);
    });

    exerciseRows.push({ id, element: row });
    return row;
  }

  function updateExerciseLabels() {
    const count = exerciseListEl.querySelectorAll('.hp-exercise-row').length;
    if (count === 0) {
      exerciseListEl.innerHTML = `
        <div class="hp-exercise-empty" id="hpExerciseEmpty">
          <div style="font-size: 2rem; margin-bottom: var(--space-2);">💪</div>
          <div>No exercises added yet. Click "Add Exercise" to start.</div>
        </div>
      `;
    } else {
      const empty = document.getElementById('hpExerciseEmpty');
      if (empty) empty.remove();
    }
  }

  function addExercise(data = {}) {
    const empty = document.getElementById('hpExerciseEmpty');
    if (empty) empty.remove();

    const row = createExerciseRow(data);
    exerciseListEl.appendChild(row);
  }

  if (addExerciseBtn) {
    addExerciseBtn.addEventListener('click', () => addExercise());
  }

  // Initialize with empty state
  updateExerciseLabels();

  // Add 2 default rows
  addExercise();
  addExercise();

  // ══════════════════════════════════════════════
  // SUMMARY (Step 4)
  // ══════════════════════════════════════════════

  function populateSummary() {
    const summaryEl = document.getElementById('hpSummaryContent');
    if (!summaryEl) return;

    // Gather data
    const age = document.getElementById('hpAge').value || '--';
    const gender = document.getElementById('hpGender').value || '--';
    const height = document.getElementById('hpHeight').value || '--';
    const weight = document.getElementById('hpWeight').value || '--';
    const bodyFat = document.getElementById('hpBodyFat').value || '--';
    const bloodType = document.getElementById('hpBloodType').value || '--';

    // Health issues
    const issues = [];
    healthIssuesContainer.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
      const label = cb.closest('.hp-checkbox-card').querySelector('.hp-checkbox-text').textContent;
      issues.push(label);
    });

    const meds = document.getElementById('hpMedications').value.trim() || 'None';
    const allergies = document.getElementById('hpAllergies').value.trim() || 'None';
    const injuries = document.getElementById('hpInjuries').value.trim() || 'None';

    // Fitness
    const experience = document.getElementById('hpExperience');
    const expText = experience.options[experience.selectedIndex]?.text || '--';
    const frequency = document.getElementById('hpFrequency');
    const freqText = frequency.options[frequency.selectedIndex]?.text || '--';
    const workoutType = document.getElementById('hpWorkoutType');
    const typeText = workoutType.options[workoutType.selectedIndex]?.text || '--';
    const duration = document.getElementById('hpDuration');
    const durText = duration.options[duration.selectedIndex]?.text || '--';

    // Exercises
    const exercises = getExerciseData();

    summaryEl.innerHTML = `
      <div class="hp-summary-section">
        <div class="hp-summary-title">📏 Body</div>
        <div class="hp-summary-items">
          <div class="hp-summary-item"><span class="hp-summary-key">Age</span><span class="hp-summary-val">${age}</span></div>
          <div class="hp-summary-item"><span class="hp-summary-key">Gender</span><span class="hp-summary-val">${gender}</span></div>
          <div class="hp-summary-item"><span class="hp-summary-key">Height</span><span class="hp-summary-val">${height} cm</span></div>
          <div class="hp-summary-item"><span class="hp-summary-key">Weight</span><span class="hp-summary-val">${weight} kg</span></div>
          <div class="hp-summary-item"><span class="hp-summary-key">Body Fat</span><span class="hp-summary-val">${bodyFat}${bodyFat !== '--' ? '%' : ''}</span></div>
          <div class="hp-summary-item"><span class="hp-summary-key">Blood Type</span><span class="hp-summary-val">${bloodType}</span></div>
        </div>
      </div>

      <div class="hp-summary-section">
        <div class="hp-summary-title">🩺 Health</div>
        <div class="hp-summary-items">
          <div class="hp-summary-item"><span class="hp-summary-key">Conditions</span><span class="hp-summary-val">${issues.length ? issues.join(', ') : 'None'}</span></div>
          <div class="hp-summary-item"><span class="hp-summary-key">Medications</span><span class="hp-summary-val">${meds}</span></div>
          <div class="hp-summary-item"><span class="hp-summary-key">Allergies</span><span class="hp-summary-val">${allergies}</span></div>
          <div class="hp-summary-item"><span class="hp-summary-key">Injuries</span><span class="hp-summary-val">${injuries}</span></div>
        </div>
      </div>

      <div class="hp-summary-section">
        <div class="hp-summary-title">🏋️ Fitness</div>
        <div class="hp-summary-items">
          <div class="hp-summary-item"><span class="hp-summary-key">Level</span><span class="hp-summary-val">${expText}</span></div>
          <div class="hp-summary-item"><span class="hp-summary-key">Frequency</span><span class="hp-summary-val">${freqText}</span></div>
          <div class="hp-summary-item"><span class="hp-summary-key">Type</span><span class="hp-summary-val">${typeText}</span></div>
          <div class="hp-summary-item"><span class="hp-summary-key">Duration</span><span class="hp-summary-val">${durText}</span></div>
        </div>
      </div>

      ${exercises.length ? `
        <div class="hp-summary-section">
          <div class="hp-summary-title">💪 Current Exercises</div>
          <div class="hp-summary-exercises">
            ${exercises.map(ex => `
              <div class="hp-summary-exercise">
                <span class="hp-summary-ex-name">${ex.name}</span>
                <span class="hp-summary-ex-detail">${ex.sets} sets × ${ex.reps} ${ex.weight ? '@ ' + ex.weight + 'kg' : ''}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    `;
  }

  function getExerciseData() {
    const rows = exerciseListEl.querySelectorAll('.hp-exercise-row');
    const exercises = [];

    rows.forEach(row => {
      const name = row.querySelector('[data-field="name"]').value.trim();
      const sets = row.querySelector('[data-field="sets"]').value.trim();
      const reps = row.querySelector('[data-field="reps"]').value.trim();
      const weight = row.querySelector('[data-field="weight"]').value.trim();

      if (name) {
        exercises.push({
          name,
          sets: sets || '0',
          reps: reps || '0',
          weight: weight || ''
        });
      }
    });

    return exercises;
  }

  // ══════════════════════════════════════════════
  // SUBMIT PROFILE
  // ══════════════════════════════════════════════

  function submitProfile() {
    if (!validateStep(4)) return;

    // Disable button
    if (nextBtn) {
      nextBtn.disabled = true;
      nextBtn.innerHTML = '<div class="spinner"></div> Saving...';
    }

    // Gather all data
    const healthIssues = [];
    healthIssuesContainer.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
      healthIssues.push(cb.value);
    });

    const profileData = {
      // Step 1: Body
      body: {
        age: parseInt(document.getElementById('hpAge').value),
        gender: document.getElementById('hpGender').value,
        height: parseFloat(document.getElementById('hpHeight').value),
        weight: parseFloat(document.getElementById('hpWeight').value),
        bodyFat: document.getElementById('hpBodyFat').value ? parseFloat(document.getElementById('hpBodyFat').value) : null,
        bloodType: document.getElementById('hpBloodType').value || null
      },
      // Step 2: Health
      health: {
        conditions: healthIssues,
        medications: document.getElementById('hpMedications').value.trim(),
        allergies: document.getElementById('hpAllergies').value.trim(),
        injuries: document.getElementById('hpInjuries').value.trim()
      },
      // Step 3: Fitness
      fitness: {
        experience: document.getElementById('hpExperience').value,
        frequency: document.getElementById('hpFrequency').value,
        workoutType: document.getElementById('hpWorkoutType').value,
        duration: document.getElementById('hpDuration').value,
        exercises: getExerciseData()
      },
      // Step 4: Goals
      goals: {
        primary: document.getElementById('hpGoal').value,
        targetWeight: document.getElementById('hpTargetWeight').value ? parseFloat(document.getElementById('hpTargetWeight').value) : null,
        timeline: document.getElementById('hpTimeline').value || null
      },
      // Metadata
      completedAt: new Date().toISOString()
    };

    // Save to localStorage
    ForgeFit.saveData('healthProfile', profileData);

    // Mark profile as complete
    ForgeFit.setHealthProfileComplete();

    // Also update the fitness goal in main session from step 4
    const session = ForgeFit.getSession();
    if (session) {
      session.fitnessGoal = profileData.goals.primary;
      ForgeFit.setSession(session);

      const users = ForgeFit.getDemoUsers();
      if (users[session.email]) {
        users[session.email].fitnessGoal = profileData.goals.primary;
        ForgeFit.saveDemoUsers(users);
      }
    }

    ForgeFit.showToast('🎉 Profile completed! Redirecting to dashboard...', 'success');

    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1200);
  }

  // ══════════════════════════════════════════════
  // KEYBOARD NAVIGATION
  // ══════════════════════════════════════════════

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      goNext();
    }
  });

  // Initialize
  updateProgress();

})();
