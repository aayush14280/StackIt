// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCJm7kDZgJMT0UjrQjsCcTnTIgk-Npg28k",
  authDomain: "stackit-54f7d.firebaseapp.com",
  projectId: "stackit-54f7d",
  storageBucket: "stackit-54f7d.firebasestorage.app",
  messagingSenderId: "552626217101",
  appId: "1:552626217101:web:71699bd7807144753502c4",
  measurementId: "G-Z505JSC8DY",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export { app };
