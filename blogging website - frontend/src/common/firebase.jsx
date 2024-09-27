// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { GoogleAuthProvider, signInWithPopup,getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAdcOxtsv15nN-7U_I3RFb4LfqdQ5ysrJw",
  authDomain: "mern-blogging-web.firebaseapp.com",
  projectId: "mern-blogging-web",
  storageBucket: "mern-blogging-web.appspot.com",
  messagingSenderId: "447324675377",
  appId: "1:447324675377:web:05f0695b7a0dcf4301a410",
  measurementId: "G-PH8SHH3EGS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


// google auth 
const provider = new GoogleAuthProvider();

const auth = getAuth();

export const authWithGoogle = async () => {
    let uer = null;
    await signInWithPopup(auth,provider)
    .then((result) => {
        user = result.user
    })
    .catch((err) => {
        console.log(err)
    })
    return user;
}

