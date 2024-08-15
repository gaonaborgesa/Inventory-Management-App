// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore} from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBv5ymqy1_sNmaCIS8cpwPmt2jZINVCK7M",
  authDomain: "inventory-management-5e46a.firebaseapp.com",
  projectId: "inventory-management-5e46a",
  storageBucket: "inventory-management-5e46a.appspot.com",
  messagingSenderId: "1092954765889",
  appId: "1:1092954765889:web:626bd032f12a6edcdfe4c0",
  measurementId: "G-3MS0KPFYV7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app)

export {firestore} // IN ORDER TO ACCESS FIRESTORE FROM OTHER FILES