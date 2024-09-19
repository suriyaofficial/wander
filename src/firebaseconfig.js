import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore"
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
    apiKey: "AIzaSyA5ALvrT1jy6AI60pKQzp1csJgX0Q7UY8I",
    authDomain: "travel-spend-tracker.firebaseapp.com",
    projectId: "travel-spend-tracker",
    storageBucket: "travel-spend-tracker.appspot.com",
    messagingSenderId: "368640826754",
    appId: "1:368640826754:web:1c51e1d5794e6d40a7c39b"
};
// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)
export const auth = getAuth(app);
export const storage = getStorage(app);
