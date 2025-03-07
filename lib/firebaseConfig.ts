// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDqhRkp6yRNJa-Z70aCTvBHKUxUzSNoigI",
  authDomain: "rideradar-56a38.firebaseapp.com",
  projectId: "rideradar-56a38",
  storageBucket: "rideradar-56a38.firebasestorage.app",
  messagingSenderId: "543345679400",
  appId: "1:543345679400:web:0c7f30cf081dc20ae3691d",
  measurementId: "G-BZZYNRV6NZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };