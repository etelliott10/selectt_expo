import { initializeApp, getApps, getApp } from "firebase/app";

// Optionally import the services that you want to use
// import {...} from "firebase/auth";
// import {...} from "firebase/database";
// import {...} from "firebase/firestore";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";

// import {
//   getAuth,
//   initializeAuth,
//   getReactNativePersistence,
// } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Initialize Firebase

const firebaseConfig = {
  apiKey: "AIzaSyCpdPsEpUk7mddV3cdYawsn5c2D1oa-VZo",
  authDomain: "selectt-40f8b.firebaseapp.com",
  projectId: "selectt-40f8b",
  storageBucket: "selectt-40f8b.appspot.com",
  messagingSenderId: "507357652382",
  appId: "1:507357652382:web:b99b40eddd6a80b2c5228f",
  // apiKey: process.env.EXPO_PRIVATE_APIKEY,
  // authDomain: process.env.EXPO_PRIVATE_AUTHDOMAIN,
  // projectId: process.env.EXPO_PRIVATE_PROJECT_ID,
  // storageBucket: process.env.EXPO_PRIVATE_STORAGEBUCKET,
  // messagingSenderId: process.env.EXPO_PRIVATE_SENDER_ID,
  // appId: process.env.EXPO_PRIVATE_APP_ID,
};
// Check if Firebase app is already initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// // Initialize Firebase Auth with AsyncStorage
// const auth = !getApps().length
//   ? initializeAuth(app, {
//       persistence: getReactNativePersistence(AsyncStorage),
//     })
//   : getAuth(app);

const db = getFirestore(app);
const storage = getStorage(app);
export { db, storage };
// export { auth, db, storage };

// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase
