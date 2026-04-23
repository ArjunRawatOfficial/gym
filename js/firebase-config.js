// ============================================
// FIREBASE CONFIGURATION — Compat SDK (Script Tags)
// ============================================
// INSTRUCTIONS:
// 1. Go to https://console.firebase.google.com
// 2. Create a project (or use existing)
// 3. Go to Project Settings → General → Your apps → Add Web App
// 4. Copy the firebaseConfig values and paste below
// 5. Enable Email/Password in Authentication → Sign-in method
// 6. Create a Firestore Database in test mode
//
// Until you add your credentials, the app runs in DEMO MODE
// (uses localStorage instead of Firebase).
// ============================================

// ── Your Firebase Config ──
// Replace the placeholder values below with your actual Firebase project config.
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDGQ2re8zXjxn1fhGiCoTK7k1_UNp_NS_M",
  authDomain: "forgefit-f00ca.firebaseapp.com",
  projectId: "forgefit-f00ca",
  storageBucket: "forgefit-f00ca.firebasestorage.app",
  messagingSenderId: "519942036922",
  appId: "1:519942036922:web:e1aaa3fae4f701818e1183",
  measurementId: "G-C5138BBTFJ"
};

// ── Detect if Firebase is configured ──
const IS_FIREBASE_CONFIGURED = FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY" &&
  FIREBASE_CONFIG.projectId !== "YOUR_PROJECT_ID";

// ── Initialize Firebase (only if configured) ──
if (IS_FIREBASE_CONFIGURED && typeof firebase !== 'undefined') {
  try {
    firebase.initializeApp(FIREBASE_CONFIG);
    console.log('🔥 Firebase initialized (Live Mode) — Project:', FIREBASE_CONFIG.projectId);
  } catch (e) {
    if (e.code !== 'app/duplicate-app') {
      console.error('Firebase init error:', e);
    }
  }
} else {
  console.log('⚡ Running in DEMO MODE (localStorage) — Add Firebase config in firebase-config.js to go live');
}
