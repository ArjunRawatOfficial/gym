// ============================================
// APP.JS — Main Dashboard Controller
// Supports both Firebase and Demo mode
// ============================================

import { auth, db, isFirebaseConfigured } from './firebase-config.js';
import { logoutUser, showToast, getCurrentUser } from './auth.js';
import { initCalculator } from './bmi-calculator.js';
import { initWorkoutPlan, renderTodayPreview } from './workout-plan.js';
import { initDietPlan } from './diet-plan.js';
import { initExerciseLibrary } from './exercise-library.js';
import { initProgressCharts } from './progress-chart.js';

// Conditionally import Firebase modules
let onAuthStateChanged, docFn, getDoc, updateDoc;

if (isFirebaseConfigured) {
  const authMod = await import('https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js');
  onAuthStateChanged = authMod.onAuthStateChanged;

  const fsMod = await import('https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js');
  docFn = fsMod.doc;
  getDoc = fsMod.getDoc;
  updateDoc = fsMod.updateDoc;
}

// ── Section Titles ──
const SECTION_TITLES = {
  overview: 'Dashboard',
  calculator: 'BMI & Protein Calculator',
  workout: '7-Day Workout Plan',
  diet: 'Diet Plan & Nutrition',
  exercises: 'Exercise Library',
  progress: 'Progress Tracker',
  profile: 'Profile & Settings'
};

let currentSection = 'overview';
let userData = null;

// ══════════════════════════════════════════════
// AUTH GATE — Wait for auth, then init
// ══════════════════════════════════════════════

if (isFirebaseConfigured) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = 'index.html';
      return;
    }
    await loadUserProfile(user);
    initApp();
  });
} else {
  // Demo mode
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
  } else {
    userData = user;
    updateUserUI(user, userData);
    initApp();
  }
}

// ══════════════════════════════════════════════
// USER PROFILE
// ══════════════════════════════════════════════

async function loadUserProfile(user) {
  try {
    if (isFirebaseConfigured) {
      const docRef = docFn(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        userData = docSnap.data();
      } else {
        userData = {
          displayName: user.email.split('@')[0],
          email: user.email,
          fitnessGoal: 'maintenance'
        };
      }
    }
    updateUserUI(user, userData);
  } catch (error) {
    console.error('Load profile error:', error);
    userData = {
      displayName: user.email?.split('@')[0] || 'User',
      email: user.email || '',
      fitnessGoal: 'maintenance'
    };
    updateUserUI(user, userData);
  }
}

function updateUserUI(user, data) {
  const name = data.displayName || data.email?.split('@')[0] || 'User';
  const email = data.email || user.email || '';
  const initial = name.charAt(0).toUpperCase();

  // Sidebar
  const sidebarName = document.getElementById('sidebarUserName');
  const sidebarEmail = document.getElementById('sidebarUserEmail');
  const userAvatar = document.getElementById('userAvatar');

  if (sidebarName) sidebarName.textContent = name;
  if (sidebarEmail) sidebarEmail.textContent = email;
  if (userAvatar) userAvatar.textContent = initial;

  // Profile section
  const profileAvatar = document.getElementById('profileAvatar');
  const profileName = document.getElementById('profileName');
  const profileEmail = document.getElementById('profileEmail');
  const profileGoal = document.getElementById('profileGoal');
  const profileNameInput = document.getElementById('profileNameInput');
  const profileGoalSelect = document.getElementById('profileGoalSelect');

  if (profileAvatar) profileAvatar.textContent = initial;
  if (profileName) profileName.textContent = name;
  if (profileEmail) profileEmail.textContent = email;
  if (profileGoal) {
    const goalLabels = { bulking: '🏋️ Bulking', cutting: '🔥 Cutting', maintenance: '⚖️ Maintenance' };
    profileGoal.textContent = goalLabels[data.fitnessGoal] || data.fitnessGoal || '⚖️ Maintenance';
  }
  if (profileNameInput) profileNameInput.value = name;
  if (profileGoalSelect) profileGoalSelect.value = data.fitnessGoal || 'maintenance';
}

// ══════════════════════════════════════════════
// APP INIT
// ══════════════════════════════════════════════

function initApp() {
  setupNavigation();
  setupMobileMenu();
  setupLogout();
  setupProfileForm();
  setCurrentDate();

  // Initialize all feature modules
  initCalculator();
  initWorkoutPlan();
  initDietPlan(userData?.fitnessGoal);
  initExerciseLibrary();
  initProgressCharts();

  // Mark body as loaded
  document.body.style.opacity = '1';

  // Demo mode banner
  if (!isFirebaseConfigured) {
    showToast('⚡ Running in Demo Mode — data saved to localStorage', 'info');
  }
}

// ══════════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════════

function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item[data-section]');
  const sections = document.querySelectorAll('.section-panel');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const section = item.dataset.section;
      if (!section) return;

      // Update nav active state
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      // Switch section
      sections.forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none';
      });

      const targetSection = document.getElementById(`section${capitalize(section)}`);
      if (targetSection) {
        targetSection.style.display = 'block';
        void targetSection.offsetWidth; // reflow for animation
        targetSection.classList.add('active');
      }

      // Update page title
      const pageTitle = document.getElementById('pageTitle');
      if (pageTitle) pageTitle.textContent = SECTION_TITLES[section] || 'Dashboard';

      // Close mobile sidebar
      closeMobileSidebar();
      currentSection = section;
    });
  });
}

// ══════════════════════════════════════════════
// MOBILE MENU
// ══════════════════════════════════════════════

function setupMobileMenu() {
  const hamburger = document.getElementById('hamburgerBtn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('active');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', closeMobileSidebar);
  }
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('active');
}

// ══════════════════════════════════════════════
// LOGOUT
// ══════════════════════════════════════════════

function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  const logoutBtnProfile = document.getElementById('logoutBtnProfile');

  const handleLogout = (e) => {
    e.preventDefault();
    logoutUser();
  };

  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
  if (logoutBtnProfile) logoutBtnProfile.addEventListener('click', handleLogout);
}

// ══════════════════════════════════════════════
// PROFILE FORM
// ══════════════════════════════════════════════

function setupProfileForm() {
  const form = document.getElementById('profileForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('profileNameInput').value.trim();
    const goal = document.getElementById('profileGoalSelect').value;
    if (!name) return;

    const btn = form.querySelector('.btn');
    btn.disabled = true;
    btn.textContent = 'Updating...';

    try {
      if (isFirebaseConfigured && auth.currentUser) {
        await updateDoc(docFn(db, 'users', auth.currentUser.uid), {
          displayName: name,
          fitnessGoal: goal
        });
      } else {
        // Demo mode — update localStorage
        const session = getCurrentUser();
        if (session) {
          session.displayName = name;
          session.fitnessGoal = goal;
          localStorage.setItem('forgefit_session', JSON.stringify(session));

          const users = JSON.parse(localStorage.getItem('forgefit_users') || '{}');
          if (users[session.email]) {
            users[session.email].displayName = name;
            users[session.email].fitnessGoal = goal;
            localStorage.setItem('forgefit_users', JSON.stringify(users));
          }
        }
      }

      userData.displayName = name;
      userData.fitnessGoal = goal;
      const user = isFirebaseConfigured ? auth.currentUser : getCurrentUser();
      updateUserUI(user, userData);

      showToast('Profile updated successfully!', 'success');
      btn.textContent = '✅ Updated!';
      setTimeout(() => {
        btn.textContent = 'Update Profile';
        btn.disabled = false;
      }, 1500);
    } catch (error) {
      console.error('Update profile error:', error);
      showToast('Failed to update profile', 'error');
      btn.textContent = 'Update Profile';
      btn.disabled = false;
    }
  });
}

// ══════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════

function setCurrentDate() {
  const dateEl = document.getElementById('currentDate');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Global access for toast
window.showToast = showToast;
