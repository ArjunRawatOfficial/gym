// ============================================
// AUTH MODULE — Login, Signup, Logout
// Supports both Firebase and Demo (localStorage) mode
// ============================================

import { auth, db, isFirebaseConfigured } from './firebase-config.js';

// ── Conditionally import Firebase Auth/Firestore ──
let createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged;
let doc, setDoc, serverTimestamp;

if (isFirebaseConfigured) {
  const authMod = await import('https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js');
  createUserWithEmailAndPassword = authMod.createUserWithEmailAndPassword;
  signInWithEmailAndPassword = authMod.signInWithEmailAndPassword;
  signOut = authMod.signOut;
  onAuthStateChanged = authMod.onAuthStateChanged;

  const fsMod = await import('https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js');
  doc = fsMod.doc;
  setDoc = fsMod.setDoc;
  serverTimestamp = fsMod.serverTimestamp;
}

// ══════════════════════════════════════════════
// DEMO MODE — localStorage auth simulation
// ══════════════════════════════════════════════

const DEMO_USERS_KEY = 'forgefit_users';
const DEMO_SESSION_KEY = 'forgefit_session';

function getDemoUsers() {
  return JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || '{}');
}

function saveDemoUsers(users) {
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
}

function getDemoSession() {
  return JSON.parse(localStorage.getItem(DEMO_SESSION_KEY) || 'null');
}

function setDemoSession(user) {
  localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(user));
}

function clearDemoSession() {
  localStorage.removeItem(DEMO_SESSION_KEY);
}

/**
 * Demo: Create a new user
 */
function demoSignup(name, email, password, fitnessGoal) {
  const users = getDemoUsers();

  if (users[email]) {
    throw { code: 'auth/email-already-in-use' };
  }

  const uid = 'demo_' + Date.now();
  const user = {
    uid,
    displayName: name,
    email,
    password, // In demo only — never do this in production!
    fitnessGoal,
    createdAt: new Date().toISOString(),
    profileComplete: true
  };

  users[email] = user;
  saveDemoUsers(users);
  setDemoSession(user);
  return user;
}

/**
 * Demo: Login with email & password
 */
function demoLogin(email, password) {
  const users = getDemoUsers();
  const user = users[email];

  if (!user) {
    throw { code: 'auth/user-not-found' };
  }

  if (user.password !== password) {
    throw { code: 'auth/wrong-password' };
  }

  setDemoSession(user);
  return user;
}

/**
 * Demo: Logout
 */
function demoLogout() {
  clearDemoSession();
}

/**
 * Demo: Get current user
 */
function demoGetCurrentUser() {
  return getDemoSession();
}

// ══════════════════════════════════════════════
// TOAST NOTIFICATION
// ══════════════════════════════════════════════

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <span>${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
  `;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ══════════════════════════════════════════════
// AUTH STATE MANAGEMENT
// ══════════════════════════════════════════════

function checkAuthRedirect() {
  const isAuthPage = window.location.pathname.endsWith('index.html') ||
    window.location.pathname === '/' ||
    window.location.pathname.endsWith('/');

  if (isFirebaseConfigured) {
    // Firebase auth state listener
    onAuthStateChanged(auth, (user) => {
      if (user && isAuthPage) {
        window.location.href = 'dashboard.html';
      } else if (!user && !isAuthPage) {
        window.location.href = 'index.html';
      }
    });
  } else {
    // Demo mode check
    const user = demoGetCurrentUser();
    if (user && isAuthPage) {
      window.location.href = 'dashboard.html';
    } else if (!user && !isAuthPage) {
      window.location.href = 'index.html';
    }
  }
}

// Run auth check
checkAuthRedirect();

// ══════════════════════════════════════════════
// DOM SETUP — Form toggling, password visibility
// ══════════════════════════════════════════════

const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const showSignupBtn = document.getElementById('showSignup');
const showLoginBtn = document.getElementById('showLogin');
const authTitle = document.getElementById('authTitle');
const authSubtitle = document.getElementById('authSubtitle');

// Toggle: Show signup form
if (showSignupBtn) {
  showSignupBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    authTitle.textContent = 'Create Account';
    authSubtitle.textContent = 'Start your fitness journey today';
  });
}

// Toggle: Show login form
if (showLoginBtn) {
  showLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    authTitle.textContent = 'Welcome Back';
    authSubtitle.textContent = 'Sign in to continue your fitness journey';
  });
}

// Password visibility toggles
function setupPasswordToggle(toggleId, inputId) {
  const toggle = document.getElementById(toggleId);
  const input = document.getElementById(inputId);
  if (toggle && input) {
    toggle.addEventListener('click', () => {
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      toggle.textContent = isPassword ? '🙈' : '👁️';
    });
  }
}

setupPasswordToggle('loginPassToggle', 'loginPassword');
setupPasswordToggle('signupPassToggle', 'signupPassword');

// ══════════════════════════════════════════════
// LOGIN HANDLER
// ══════════════════════════════════════════════

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const btn = document.getElementById('loginBtn');
    const btnText = document.getElementById('loginBtnText');
    const spinner = document.getElementById('loginSpinner');

    if (!email || !password) {
      showToast('Please fill in all fields', 'warning');
      return;
    }

    // Loading state
    btn.disabled = true;
    btnText.textContent = 'Signing in...';
    spinner.classList.remove('hidden');

    try {
      if (isFirebaseConfigured) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        demoLogin(email, password);
      }
      showToast('Welcome back! Redirecting...', 'success');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
    } catch (error) {
      console.error('Login error:', error);
      const messages = {
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/invalid-email': 'Invalid email address',
        'auth/too-many-requests': 'Too many attempts. Try again later.',
        'auth/invalid-credential': 'Invalid email or password'
      };
      showToast(messages[error.code] || 'Login failed. Please try again.', 'error');
    } finally {
      btn.disabled = false;
      btnText.textContent = 'Sign In';
      spinner.classList.add('hidden');
    }
  });
}

// ══════════════════════════════════════════════
// SIGNUP HANDLER
// ══════════════════════════════════════════════

if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;
    const goal = document.getElementById('signupGoal').value;
    const btn = document.getElementById('signupBtn');
    const btnText = document.getElementById('signupBtnText');
    const spinner = document.getElementById('signupSpinner');

    // Validation
    if (!name || !email || !password || !confirm || !goal) {
      showToast('Please fill in all fields', 'warning');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'warning');
      return;
    }

    if (password !== confirm) {
      showToast('Passwords do not match', 'error');
      return;
    }

    // Loading state
    btn.disabled = true;
    btnText.textContent = 'Creating account...';
    spinner.classList.remove('hidden');

    try {
      if (isFirebaseConfigured) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await setDoc(doc(db, 'users', user.uid), {
          displayName: name,
          email: email,
          fitnessGoal: goal,
          createdAt: serverTimestamp(),
          profileComplete: true
        });
      } else {
        demoSignup(name, email, password, goal);
      }
      showToast('Account created! Redirecting...', 'success');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
    } catch (error) {
      console.error('Signup error:', error);
      const messages = {
        'auth/email-already-in-use': 'An account with this email already exists',
        'auth/invalid-email': 'Invalid email address',
        'auth/weak-password': 'Password is too weak (min 6 characters)'
      };
      showToast(messages[error.code] || 'Signup failed. Please try again.', 'error');
    } finally {
      btn.disabled = false;
      btnText.textContent = 'Create Account';
      spinner.classList.add('hidden');
    }
  });
}

// ══════════════════════════════════════════════
// EXPORTS
// ══════════════════════════════════════════════

export { showToast };

export function getCurrentUser() {
  if (isFirebaseConfigured) {
    return auth.currentUser;
  } else {
    return demoGetCurrentUser();
  }
}

export async function logoutUser() {
  try {
    if (isFirebaseConfigured) {
      await signOut(auth);
    } else {
      demoLogout();
    }
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Logout error:', error);
    showToast('Logout failed', 'error');
  }
}
