// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCvjOISxbBRNAt3CZ-R3u3vUQw8k1CUk20",
  authDomain: "cookmymedia.firebaseapp.com",
  projectId: "cookmymedia",
  storageBucket: "cookmymedia.firebasestorage.app",
  messagingSenderId: "317700895974",
  appId: "1:317700895974:web:156f14a951be94432d3727",
  measurementId: "G-VQHY4FBM5B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, analytics, db };
