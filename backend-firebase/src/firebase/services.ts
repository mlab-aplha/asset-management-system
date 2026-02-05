import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy
} from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, auth, storage } from "./config";

// Auth Services
export const authService = {
  // Sign in with email/password
  signIn: async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Sign up new user
  signUp: async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Get current user
  getCurrentUser: () => {
    return new Promise<User | null>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  },

  // Listen to auth state changes
  onAuthStateChange: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
  }
};

// Asset Services
export const assetService = {
  // Get all assets
  getAllAssets: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "assets"));
      const assets = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return { success: true, data: assets };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Get single asset
  getAsset: async (id: string) => {
    try {
      const docRef = doc(db, "assets", id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
      } else {
        return { success: false, error: "Asset not found" };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Create asset
  createAsset: async (assetData: any) => {
    try {
      const docRef = await addDoc(collection(db, "assets"), {
        ...assetData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return { success: true, id: docRef.id, data: assetData };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Update asset
  updateAsset: async (id: string, assetData: any) => {
    try {
      const docRef = doc(db, "assets", id);
      await updateDoc(docRef, {
        ...assetData,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Delete asset
  deleteAsset: async (id: string) => {
    try {
      await deleteDoc(doc(db, "assets", id));
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Get assets by status
  getAssetsByStatus: async (status: string) => {
    try {
      const q = query(
        collection(db, "assets"),
        where("status", "==", status)
      );
      const querySnapshot = await getDocs(q);
      const assets = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return { success: true, data: assets };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};

// Storage Services
export const storageService = {
  // Upload file
  uploadFile: async (file: File, path: string) => {
    try {
      const storageRef = ref(storage, `${path}/${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return { success: true, url: downloadURL };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Upload asset image
  uploadAssetImage: async (file: File, assetId: string) => {
    return storageService.uploadFile(file, `assets/${assetId}/images`);
  }
};
