// ============================================
// FIREBASE CONFIGURATION — ES Module (CDN)
// ============================================
// INSTRUCTIONS:
// 1. Go to https://console.firebase.google.com
// 2. Create a project (or use existing)
// 3. Go to Project Settings → General → Your apps → Add Web App
// 4. Copy the firebaseConfig object and paste below
// 5. Enable Email/Password in Authentication → Sign-in method
// 6. Create a Firestore Database in test mode
//
// Until you add your credentials, the app runs in DEMO MODE
// (uses localStorage instead of Firebase).
// ============================================

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// ── Detect if Firebase is configured ──
const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

let app = null;
let auth = null;
let db = null;

if (isFirebaseConfigured) {
  // Real Firebase
  const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js');
  const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js');
  const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js');

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  console.log('🔥 Firebase initialized (Live Mode)');
} else {
  console.log('⚡ Running in DEMO MODE (localStorage) — Add Firebase config to go live');
}

export { auth, db, isFirebaseConfigured };
