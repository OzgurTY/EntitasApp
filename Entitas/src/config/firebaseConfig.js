import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCyG9oFNpa79QQpteub0V_SlTR28fUZArI",
  authDomain: "entitas-a4199.firebaseapp.com",
  projectId: "entitas-a4199",
  storageBucket: "entitas-a4199.firebasestorage.app",
  messagingSenderId: "662903371042",
  appId: "1:662903371042:web:6b9e5c5d710bf3bd41a17b",
  measurementId: "G-E8G87XF83C"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);