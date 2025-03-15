import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBDnRBNWRHtUQsM_RJNSFUL-SU-ALAtl8A",
  authDomain: "linkup-c3274.firebaseapp.com",
  databaseURL: "https://linkup-c3274-default-rtdb.firebaseio.com",
  projectId: "linkup-c3274",
  storageBucket: "linkup-c3274.firebasestorage.app",
  messagingSenderId: "618853464271",
  appId: "1:618853464271:web:0c434109eaffb2edf11fba"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); 