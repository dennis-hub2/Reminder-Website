// firebase-config.js

const firebaseConfig = {
	apiKey: "AIzaSyBZhOthdsnJRaD2KP2RyS7YkLgbqMoMzsc",
	authDomain: "reminder-website-c5ee6.firebaseapp.com",
	projectId: "reminder-website-c5ee6",
	storageBucket: "reminder-website-c5ee6.firebasestorage.app",
	messagingSenderId: "136649493182",
	appId: "1:136649493182:web:af58214be171fa192dacef",
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Export the instances to be used in other files
export { auth, db };
