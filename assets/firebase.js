import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA_kvyDshMXYNqj87bqXZC8tKAi_Kko2Rs",
  authDomain: "rabapp-520b5.firebaseapp.com",
  databaseURL: "https://rabapp-520b5-default-rtdb.firebaseio.com",
  projectId: "rabapp-520b5",
  storageBucket: "rabapp-520b5.firebasestorage.app",
  messagingSenderId: "1060443577862",
  appId: "1:1060443577862:web:6618775410d09ae16cad87"
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
