import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD5d8Y119JnAFf_joiH151dPlPCg8XCY-I",
  authDomain: "gen-lang-client-0493715118.firebaseapp.com",
  projectId: "gen-lang-client-0493715118",
  storageBucket: "gen-lang-client-0493715118.firebasestorage.app",
  messagingSenderId: "172508893760",
  appId: "1:172508893760:web:0c161281d71513ecbd45a5"
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID from configuration
export const db = getFirestore(app, "ai-studio-d4f99f36-38be-4fee-86ff-a206badc0010");

export const auth = getAuth(app);
