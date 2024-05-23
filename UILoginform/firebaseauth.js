// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { get } from "firebase/database";

function showMessage(message, divId){
  var messageDiv = document.getElementById(divId);
  messageDiv.style.display = "block";
  messageDiv.innerHTML = message;
  messageDiv.style.opacity = 1;
  setTimeout(function(){
    messageDiv.style.opacity = 0;
  }, 5000);
}

const firebaseConfig = {
  apiKey: "AIzaSyCb8KkLm0em_Iynw3uD3ZhlbucPjv5PoXU",
  authDomain: "ui-logindatabase.firebaseapp.com",
  projectId: "ui-logindatabase",
  storageBucket: "ui-logindatabase.appspot.com",
  messagingSenderId: "736922134147",
  appId: "1:736922134147:web:6c72f268ec2758df9a9db6",
  measurementId: "G-B9KZRF12JT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const signUp = document.getElementById('submitSignUp');
signUp.addEventListener('click', (event) => {
  event.preventDefault();
  const email = document.getElementById('rEmail').value;
  const password = document.getElementById('rPassword').value;
  const firstname = document.getElementById('fName').value;
  const lastname = document.getElementById('lName').value;

  const auth = getAuth();
  const db = getFirestore();

  createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    const user = userCredential.user;
    const userData = {
      email: email,
      firstname: firstname,
      lastname: lastname
    };
    showMessage('Account Created Successfully', 'signUpMessage');
    const docRef = doc(db, "users", user.uid);
    setDoc(docRef, userData)
    .then(() => {
      window.location.href = 'index.html';
    })
    .catch((error) => {
      console.error("error writing document", error);
    });
  })
  .catch((error) => {
    const errorCode = error.code;
    if (errorCode === 'auth/email-already-in-use') {
      showMessage('Email Address Already Exists.', 'signUpMessage');
    } else {
      showMessage('Unable to create User', 'signUpMessage');
    }
  })
});

const signIn=document.getElementById('submitSignIn');
signIn.addEventListener('click', (event)=>{
  event.preventDefault();
  const email=document.getElementById('email').value;
  const password=document.getElementById('password').value;
  const auth=getAuth();

  signInWithEmailAndPassword(auth, email,password)
    .then((userCredential)=>{
      showMessage('login is successful','signInMessage');
      const user=userCredential.user;
      localStorage.setItem('loggedInUserId', user.uid);
      window.location.href='homepage.html';
    })
    .catch((error)=>{
      const errorCode=error.code;
      if(errorCode='auth/invalid-credential'){
        showMessage('Incorret Email or Password','signInMessage');
      }
      else{
        showMessage('Account does not Exist', 'signInMessage');
      }

    })
})