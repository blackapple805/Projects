import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCoYngAZXCb6yadqgeOG8TPczfX_iAHgzQ",
    authDomain: "crypto-tracker-14a52.firebaseapp.com",
    projectId: "crypto-tracker-14a52",
    storageBucket: "crypto-tracker-14a52.appspot.com",
    messagingSenderId: "785533097434",
    appId: "1:785533097434:web:e666ae8314976d64dc1ce3",
    measurementId: "G-1WN78TND62"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
