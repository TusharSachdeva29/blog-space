// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
// Uncomment if using analytics
// import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAdcOxtsv15nN-7U_I3RFb4LfqdQ5ysrJw",
  authDomain: "mern-blogging-web.firebaseapp.com",
  projectId: "mern-blogging-web",
  storageBucket: "mern-blogging-web.appspot.com",
  messagingSenderId: "447324675377",
  appId: "1:447324675377:web:05f0695b7a0dcf4301a410",
  measurementId: "G-PH8SHH3EGS"
};

const app = initializeApp(firebaseConfig)

const provider = new GoogleAuthProvider();
const auth = getAuth(app); 



const authWithGoogle = async () => {
    let user = null;
    try {
        const result = await signInWithPopup(auth, provider);
        user = result.user;
    } catch (err) {
        console.log("Error during Google authentication:", err);
        // Optionally handle the error (e.g., display a message to the user)
    }
    return user;
}
// firebase.js

// import { initializeApp } from "firebase/app";
// import { GoogleAuthProvider, getAuth } from 'firebase/auth';

// // Your web app's Firebase configuration
// const firebaseConfig = {
//     apiKey: "AIzaSyAdcOxtsv15nN-7U_I3RFb4LfqdQ5ysrJw",
//     authDomain: "mern-blogging-web.firebaseapp.com",
//     projectId: "mern-blogging-web",
//     storageBucket: "mern-blogging-web.appspot.com",
//     messagingSenderId: "447324675377",
//     appId: "1:447324675377:web:05f0695b7a0dcf4301a410",
//     measurementId: "G-PH8SHH3EGS"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app); // Pass the app instance here
// const provider = new GoogleAuthProvider();

// export { auth, provider };
