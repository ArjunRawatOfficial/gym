// ============================================
// FORGEFIT — Global Config & Utilities
// Dual-mode: Firestore (live) + localStorage (demo)
// ============================================

const ForgeFit = {

  // ══════════════════════════════════════════════
  // DETECTION
  // ══════════════════════════════════════════════

  get isLive() {
    return typeof IS_FIREBASE_CONFIGURED !== 'undefined' && IS_FIREBASE_CONFIGURED &&
           typeof firebase !== 'undefined' && firebase.apps?.length > 0;
  },

  get fireAuth() {
    return this.isLive ? firebase.auth() : null;
  },

  get fireDB() {
    return this.isLive ? firebase.firestore() : null;
  },

  // ══════════════════════════════════════════════
  // SESSION (localStorage cache — always used for quick access)
  // ══════════════════════════════════════════════

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

  // ══════════════════════════════════════════════
  // AUTH — Signup / Login / Logout
  // ══════════════════════════════════════════════

  async signup(name, email, password, fitnessGoal) {
    if (this.isLive) {
      // ── Firebase Auth ──
      const cred = await this.fireAuth.createUserWithEmailAndPassword(email, password);
      await cred.user.updateProfile({ displayName: name });

      const userData = {
        uid: cred.user.uid,
        displayName: name,
        email: email,
        fitnessGoal: fitnessGoal,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        profileComplete: true,
        healthProfileComplete: false
      };

      // Save to Firestore
      await this.fireDB.collection('users').doc(cred.user.uid).set(userData);

      // Cache locally (use ISO string for local timestamp)
      const localData = { ...userData, createdAt: new Date().toISOString() };
      this.setSession(localData);
      return localData;

    } else {
      // ── Demo Mode (localStorage) ──
      const users = this.getDemoUsers();
      if (users[email]) throw { code: 'auth/email-already-in-use' };
      const user = {
        uid: 'demo_' + Date.now(),
        displayName: name,
        email, password, fitnessGoal,
        createdAt: new Date().toISOString(),
        profileComplete: true,
        healthProfileComplete: false
      };
      users[email] = user;
      this.saveDemoUsers(users);
      this.setSession(user);
      return user;
    }
  },

  async login(email, password) {
    if (this.isLive) {
      // ── Firebase Auth ──
      const cred = await this.fireAuth.signInWithEmailAndPassword(email, password);
      
      // Load user data from Firestore
      const doc = await this.fireDB.collection('users').doc(cred.user.uid).get();
      let userData;

      if (doc.exists) {
        userData = doc.data();
        userData.uid = cred.user.uid;
        // Convert Firestore timestamps to ISO strings for local use
        if (userData.createdAt && userData.createdAt.toDate) {
          userData.createdAt = userData.createdAt.toDate().toISOString();
        }
        if (userData.healthProfile?.completedAt && userData.healthProfile.completedAt.toDate) {
          userData.healthProfile.completedAt = userData.healthProfile.completedAt.toDate().toISOString();
        }
      } else {
        // User exists in Auth but not Firestore — create doc
        userData = {
          uid: cred.user.uid,
          displayName: cred.user.displayName || email.split('@')[0],
          email: email,
          createdAt: new Date().toISOString(),
          profileComplete: true,
          healthProfileComplete: false
        };
        await this.fireDB.collection('users').doc(cred.user.uid).set(userData);
      }

      this.setSession(userData);
      return userData;

    } else {
      // ── Demo Mode ──
      const users = this.getDemoUsers();
      const user = users[email];
      if (!user) throw { code: 'auth/user-not-found' };
      if (user.password !== password) throw { code: 'auth/wrong-password' };
      this.setSession(user);
      return user;
    }
  },

  async logout() {
    if (this.isLive) {
      try { await this.fireAuth.signOut(); } catch (e) { console.error('Logout error:', e); }
    }
    this.clearSession();
    window.location.href = 'index.html';
  },

  // ══════════════════════════════════════════════
  // DATA — Read / Write (dual-mode)
  // ══════════════════════════════════════════════

  getData(key, fallback = '[]') {
    const uid = this.getSession()?.uid || 'demo';
    return JSON.parse(localStorage.getItem(`forgefit_${key}_${uid}`) || fallback);
  },

  saveData(key, value) {
    const uid = this.getSession()?.uid || 'demo';
    // Always save locally for instant access
    localStorage.setItem(`forgefit_${key}_${uid}`, JSON.stringify(value));

    // Also sync to Firestore if live
    if (this.isLive && uid !== 'demo' && !uid.startsWith('demo_')) {
      this._syncToFirestore(uid, key, value);
    }
  },

  // Internal: Write a field to Firestore user doc
  _syncToFirestore(uid, key, value) {
    try {
      this.fireDB.collection('users').doc(uid).set(
        { [key]: value, lastUpdated: firebase.firestore.FieldValue.serverTimestamp() },
        { merge: true }
      ).catch(err => console.error('Firestore sync error:', err));
    } catch (e) {
      console.error('Firestore sync error:', e);
    }
  },

  // Load all user data from Firestore into localStorage cache
  async loadFromFirestore() {
    if (!this.isLive) return;
    const session = this.getSession();
    if (!session?.uid || session.uid.startsWith('demo_')) return;

    try {
      const doc = await this.fireDB.collection('users').doc(session.uid).get();
      if (!doc.exists) return;

      const data = doc.data();
      const uid = session.uid;

      // Map Firestore fields to localStorage keys
      const fieldMappings = [
        'healthProfile', 'workoutProgress', 'customPlans',
        'calcResults', 'waterLog', 'weightLogs', 'workout', 'calc'
      ];

      fieldMappings.forEach(field => {
        if (data[field] !== undefined) {
          localStorage.setItem(`forgefit_${field}_${uid}`, JSON.stringify(data[field]));
        }
      });

      // Update session with latest Firestore data
      if (data.healthProfileComplete !== undefined) {
        session.healthProfileComplete = data.healthProfileComplete;
      }
      if (data.fitnessGoal) session.fitnessGoal = data.fitnessGoal;
      if (data.displayName) session.displayName = data.displayName;
      this.setSession(session);

      console.log('📥 User data loaded from Firestore');
    } catch (e) {
      console.error('Failed to load Firestore data:', e);
    }
  },

  // ══════════════════════════════════════════════
  // TOAST NOTIFICATIONS
  // ══════════════════════════════════════════════

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

  // ══════════════════════════════════════════════
  // HEALTH PROFILE HELPERS
  // ══════════════════════════════════════════════

  isHealthProfileComplete() {
    const session = this.getSession();
    return session?.healthProfileComplete === true;
  },

  async setHealthProfileComplete() {
    const session = this.getSession();
    if (session) {
      session.healthProfileComplete = true;
      this.setSession(session);

      if (this.isLive && session.uid && !session.uid.startsWith('demo_')) {
        // Update Firestore
        try {
          await this.fireDB.collection('users').doc(session.uid).set(
            { healthProfileComplete: true },
            { merge: true }
          );
        } catch (e) {
          console.error('Firestore update error:', e);
        }
      } else {
        // Demo mode: update users store
        const users = this.getDemoUsers();
        if (users[session.email]) {
          users[session.email].healthProfileComplete = true;
          this.saveDemoUsers(users);
        }
      }
    }
  }
};
