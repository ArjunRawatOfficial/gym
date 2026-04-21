// ============================================
// FORGEFIT — Global Config & Utilities
// Works without a server (no ES modules needed)
// ============================================

const ForgeFit = {
  // ── Set to true and fill in credentials when you have Firebase ──
  useFirebase: false,
  firebaseConfig: {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  },

  // ── Demo Auth (localStorage) ──
  USERS_KEY: 'forgefit_users',
  SESSION_KEY: 'forgefit_session',

  getDemoUsers() {
    return JSON.parse(localStorage.getItem(this.USERS_KEY) || '{}');
  },
  saveDemoUsers(users) {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  },
  getSession() {
    return JSON.parse(localStorage.getItem(this.SESSION_KEY) || 'null');
  },
  setSession(user) {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
  },
  clearSession() {
    localStorage.removeItem(this.SESSION_KEY);
  },

  // ── Demo Signup ──
  signup(name, email, password, fitnessGoal) {
    const users = this.getDemoUsers();
    if (users[email]) throw { code: 'auth/email-already-in-use' };
    const user = {
      uid: 'demo_' + Date.now(),
      displayName: name,
      email, password, fitnessGoal,
      createdAt: new Date().toISOString(),
      profileComplete: true
    };
    users[email] = user;
    this.saveDemoUsers(users);
    this.setSession(user);
    return user;
  },

  // ── Demo Login ──
  login(email, password) {
    const users = this.getDemoUsers();
    const user = users[email];
    if (!user) throw { code: 'auth/user-not-found' };
    if (user.password !== password) throw { code: 'auth/wrong-password' };
    this.setSession(user);
    return user;
  },

  // ── Demo Logout ──
  logout() {
    this.clearSession();
    window.location.href = 'index.html';
  },

  // ── Toast Notifications ──
  showToast(message, type = 'info') {
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
  },

  // ── localStorage data helpers ──
  getData(key, fallback = '[]') {
    const uid = this.getSession()?.uid || 'demo';
    return JSON.parse(localStorage.getItem(`forgefit_${key}_${uid}`) || fallback);
  },
  saveData(key, value) {
    const uid = this.getSession()?.uid || 'demo';
    localStorage.setItem(`forgefit_${key}_${uid}`, JSON.stringify(value));
  }
};
