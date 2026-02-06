import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAbTqnX_KiF1_HzY10IasX5Zh8vfrrfMsc",
  authDomain: "asset-management-6cee2.firebaseapp.com",
  projectId: "asset-management-6cee2",
  storageBucket: "asset-management-6cee2.firebasestorage.app",
  messagingSenderId: "421547632581",
  appId: "1:421547632581:web:a83f68169f9d675971cdac"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;