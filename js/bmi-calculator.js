// ============================================
// BMI & PROTEIN CALCULATOR MODULE
// Supports both Firebase and Demo mode
// ============================================

import { auth, db, isFirebaseConfigured } from './firebase-config.js';
import { getCurrentUser } from './auth.js';

let addDoc, collection, serverTimestamp;

if (isFirebaseConfigured) {
  const fsMod = await import('https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js');
  addDoc = fsMod.addDoc;
  collection = fsMod.collection;
  serverTimestamp = fsMod.serverTimestamp;
}

// ── Activity Level Multipliers ──
const ACTIVITY_MULTIPLIERS = {
  sedentary: { tdee: 1.2, protein: 0.8 },
  light: { tdee: 1.375, protein: 1.0 },
  moderate: { tdee: 1.55, protein: 1.3 },
  active: { tdee: 1.725, protein: 1.6 },
  athlete: { tdee: 1.9, protein: 2.0 }
};

// ── BMI Categories ──
const BMI_CATEGORIES = [
  { max: 18.5, label: 'Underweight', color: '#40c4ff' },
  { max: 24.9, label: 'Normal', color: '#00e676' },
  { max: 29.9, label: 'Overweight', color: '#ffc107' },
  { max: Infinity, label: 'Obese', color: '#ff5252' }
];

function calculateBMI(weight, height) {
  const heightM = height / 100;
  return weight / (heightM * heightM);
}

function getBMICategory(bmi) {
  for (const cat of BMI_CATEGORIES) {
    if (bmi <= cat.max) return cat;
  }
  return BMI_CATEGORIES[BMI_CATEGORIES.length - 1];
}

function calculateBMR(weight, height, age, gender) {
  if (gender === 'male') {
    return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    return (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
}

function calculateAll(weight, height, age, gender, activityLevel) {
  const bmi = calculateBMI(weight, height);
  const bmiCategory = getBMICategory(bmi);
  const bmr = calculateBMR(weight, height, age, gender);
  const multipliers = ACTIVITY_MULTIPLIERS[activityLevel];
  const tdee = bmr * multipliers.tdee;
  const protein = weight * multipliers.protein;
  const waterLiters = weight * 0.033;

  return {
    bmi: Math.round(bmi * 10) / 10,
    bmiCategory,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    protein: Math.round(protein),
    waterLiters: Math.round(waterLiters * 10) / 10
  };
}

function updateGauge(bmi, color) {
  const circle = document.getElementById('bmiGaugeCircle');
  if (!circle) return;

  const percentage = Math.min(Math.max((bmi - 10) / 30, 0), 1);
  const circumference = 534;
  const offset = circumference - (percentage * circumference);

  circle.style.strokeDashoffset = offset;
  circle.style.stroke = color;
}

function animateValue(elementId, start, end, duration) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const startTime = performance.now();
  const isDecimal = end % 1 !== 0;

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = start + (end - start) * eased;

    element.textContent = isDecimal ? current.toFixed(1) : Math.round(current);

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

/**
 * Save results — Firebase or localStorage
 */
async function saveResults(results) {
  if (isFirebaseConfigured) {
    const user = auth.currentUser;
    if (!user) return;
    await addDoc(collection(db, 'users', user.uid, 'calculatorResults'), {
      bmi: results.bmi,
      bmiCategory: results.bmiCategory.label,
      proteinNeeds: results.protein,
      tdee: results.tdee,
      bmr: results.bmr,
      waterLiters: results.waterLiters,
      date: serverTimestamp()
    });
  } else {
    const user = getCurrentUser();
    if (!user) return;
    const key = `forgefit_calc_${user.uid}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    existing.push({
      bmi: results.bmi,
      bmiCategory: results.bmiCategory.label,
      proteinNeeds: results.protein,
      tdee: results.tdee,
      bmr: results.bmr,
      waterLiters: results.waterLiters,
      date: new Date().toISOString()
    });
    localStorage.setItem(key, JSON.stringify(existing));
  }
}

/**
 * Initialize the calculator
 */
export function initCalculator() {
  const form = document.getElementById('calculatorForm');
  const resultsSection = document.getElementById('calculatorResults');
  const saveBtn = document.getElementById('saveResultsBtn');

  if (!form) return;

  let currentResults = null;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const weight = parseFloat(document.getElementById('calcWeight').value);
    const height = parseFloat(document.getElementById('calcHeight').value);
    const age = parseInt(document.getElementById('calcAge').value);
    const gender = document.getElementById('calcGender').value;
    const activity = document.getElementById('calcActivity').value;

    if (!weight || !height || !age) return;

    currentResults = calculateAll(weight, height, age, gender, activity);

    resultsSection.style.display = 'flex';

    animateValue('bmiValue', 0, currentResults.bmi, 800);
    document.getElementById('bmiCategory').textContent = currentResults.bmiCategory.label;
    document.getElementById('bmiCategory').style.color = currentResults.bmiCategory.color;

    animateValue('proteinResult', 0, currentResults.protein, 600);
    animateValue('tdeeResult', 0, currentResults.tdee, 700);
    animateValue('bmrResult', 0, currentResults.bmr, 650);
    document.getElementById('waterResult').textContent = currentResults.waterLiters + 'L';

    setTimeout(() => {
      updateGauge(currentResults.bmi, currentResults.bmiCategory.color);
    }, 100);

    const statBMI = document.getElementById('statBMI');
    if (statBMI) statBMI.textContent = currentResults.bmi;

    if (window.innerWidth < 1024) {
      resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
  });

  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      if (!currentResults) return;

      try {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';

        await saveResults(currentResults);

        saveBtn.textContent = '✅ Saved Successfully!';
        setTimeout(() => {
          saveBtn.textContent = '💾 Save Results to Profile';
          saveBtn.disabled = false;
        }, 2000);
      } catch (error) {
        console.error('Save error:', error);
        saveBtn.textContent = '❌ Save Failed';
        saveBtn.disabled = false;
      }
    });
  }
}
