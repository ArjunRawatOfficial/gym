// ============================================
// AUTH PAGE — Login & Signup Logic
// (Regular script — no ES modules)
// ============================================

(function () {
  'use strict';

  // ── Redirect if already logged in ──
  const session = ForgeFit.getSession();
  if (session) {
    window.location.href = 'dashboard.html';
    return;
  }

  // ── DOM Elements ──
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const showSignupBtn = document.getElementById('showSignup');
  const showLoginBtn = document.getElementById('showLogin');
  const authTitle = document.getElementById('authTitle');
  const authSubtitle = document.getElementById('authSubtitle');

  // ── Toggle between Login ↔ Signup ──
  if (showSignupBtn) {
    showSignupBtn.addEventListener('click', (e) => {
      e.preventDefault();
      loginForm.classList.add('hidden');
      signupForm.classList.remove('hidden');
      authTitle.textContent = 'Create Account';
      authSubtitle.textContent = 'Start your fitness journey today';
    });
  }

  if (showLoginBtn) {
    showLoginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      signupForm.classList.add('hidden');
      loginForm.classList.remove('hidden');
      authTitle.textContent = 'Welcome Back';
      authSubtitle.textContent = 'Sign in to continue your fitness journey';
    });
  }

  // ── Password Visibility Toggle ──
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

  // ══════════════════════════════════════
  // LOGIN
  // ══════════════════════════════════════
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      const btn = document.getElementById('loginBtn');
      const btnText = document.getElementById('loginBtnText');
      const spinner = document.getElementById('loginSpinner');

      if (!email || !password) {
        ForgeFit.showToast('Please fill in all fields', 'warning');
        return;
      }

      btn.disabled = true;
      btnText.textContent = 'Signing in...';
      spinner.classList.remove('hidden');

      try {
        ForgeFit.login(email, password);
        ForgeFit.showToast('Welcome back! Redirecting...', 'success');
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 600);
      } catch (error) {
        const messages = {
          'auth/user-not-found': 'No account found with this email',
          'auth/wrong-password': 'Incorrect password',
          'auth/invalid-credential': 'Invalid email or password'
        };
        ForgeFit.showToast(messages[error.code] || 'Login failed', 'error');
        btn.disabled = false;
        btnText.textContent = 'Sign In';
        spinner.classList.add('hidden');
      }
    });
  }

  // ══════════════════════════════════════
  // SIGNUP
  // ══════════════════════════════════════
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('signupName').value.trim();
      const email = document.getElementById('signupEmail').value.trim();
      const password = document.getElementById('signupPassword').value;
      const confirm = document.getElementById('signupConfirm').value;
      const goal = document.getElementById('signupGoal').value;
      const btn = document.getElementById('signupBtn');
      const btnText = document.getElementById('signupBtnText');
      const spinner = document.getElementById('signupSpinner');

      if (!name || !email || !password || !confirm || !goal) {
        ForgeFit.showToast('Please fill in all fields', 'warning');
        return;
      }
      if (password.length < 6) {
        ForgeFit.showToast('Password must be at least 6 characters', 'warning');
        return;
      }
      if (password !== confirm) {
        ForgeFit.showToast('Passwords do not match', 'error');
        return;
      }

      btn.disabled = true;
      btnText.textContent = 'Creating account...';
      spinner.classList.remove('hidden');

      try {
        ForgeFit.signup(name, email, password, goal);
        ForgeFit.showToast('Account created! Redirecting...', 'success');
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 600);
      } catch (error) {
        const messages = {
          'auth/email-already-in-use': 'An account with this email already exists',
          'auth/invalid-email': 'Invalid email address'
        };
        ForgeFit.showToast(messages[error.code] || 'Signup failed', 'error');
        btn.disabled = false;
        btnText.textContent = 'Create Account';
        spinner.classList.add('hidden');
      }
    });
  }
})();
