import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getMessaging, isSupported } from "firebase/messaging";
import { getPerformance } from "firebase/performance";

// Firebase configuration - Your actual Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyCh55YtpFUAlF4WcuOmFUhbTC1vgKI6VRU",
  authDomain: "remitxpress-41f49.firebaseapp.com",
  projectId: "remitxpress-41f49",
  storageBucket: "remitxpress-41f49.firebasestorage.app",
  messagingSenderId: "589588653662",
  appId: "1:589588653662:web:382f525a71be0e77b2f6cf",
  measurementId: "G-FCQFFX2KCF",
};

// Initialize Firebase
let app;
let db;
let auth;
let messaging;
let performance;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);

  // Initialize performance monitoring only in browser environment
  if (typeof window !== "undefined") {
    try {
      performance = getPerformance(app);
      console.log("Firebase Performance Monitoring initialized successfully");
    } catch (perfError) {
      console.warn("Firebase Performance Monitoring not available:", perfError);
      performance = null;
    }

    // Initialize messaging
    isSupported().then((supported) => {
      if (supported) {
        messaging = getMessaging(app);
        console.log("Firebase Messaging initialized successfully");
      } else {
        console.log("Firebase Messaging not supported in this browser");
        messaging = null;
      }
    });
  } else {
    messaging = null;
    performance = null;
  }

  console.log("Firebase initialized successfully");
} catch (error) {
  console.warn("Firebase initialization failed, using fallback:", error);
  // Fallback - app will work without Firebase
  db = null;
  auth = null;
  messaging = null;
  performance = null;
}

export { db, auth, messaging, performance };
export default app;
