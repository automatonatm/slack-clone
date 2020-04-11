import firebase from 'firebase/app'
import "firebase/auth"
import "firebase/database"
import "firebase/storage"

var firebaseConfig = {
    apiKey: "AIzaSyCBfH888VQ_5FmOPBPqQVoL3BuX0b7aj6s",
    authDomain: "slack-app-c84ae.firebaseapp.com",
    databaseURL: "https://slack-app-c84ae.firebaseio.com",
    projectId: "slack-app-c84ae",
    storageBucket: "slack-app-c84ae.appspot.com",
    messagingSenderId: "928171382921",
    appId: "1:928171382921:web:a839b7a230f88ec26b0e58"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase