// backend-firebase/src/firebase/services.ts
// Fixed: removed unused `orderBy`, typed all `any` → proper types.

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
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from './config';

// ─── Response shapes ──────────────────────────────────────────────────────────

interface AuthSuccess {
  success: true;
  user: User;
}
interface AuthFailure {
  success: false;
  error: string;
}
type AuthResult = AuthSuccess | AuthFailure;

interface GenericSuccess<T = undefined> {
  success: true;
  data?: T;
  id?: string;
  url?: string;
}
interface GenericFailure {
  success: false;
  error: string;
}
type GenericResult<T = undefined> = GenericSuccess<T> | GenericFailure;

// ─── Asset shape ──────────────────────────────────────────────────────────────

interface AssetData {
  id: string;
  [key: string]: unknown;
}

// ─── Auth Services ────────────────────────────────────────────────────────────

export const authService = {
  signIn: async (email: string, password: string): Promise<AuthResult> => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: cred.user };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  },

  signUp: async (email: string, password: string): Promise<AuthResult> => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      return { success: true, user: cred.user };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  },

  signOut: async (): Promise<GenericResult> => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  },

  getCurrentUser: (): Promise<User | null> =>
    new Promise((resolve) => {
      const unsub = onAuthStateChanged(auth, (user) => {
        unsub();
        resolve(user);
      });
    }),

  onAuthStateChange: (cb: (user: User | null) => void) => onAuthStateChanged(auth, cb),
};

// ─── Asset Services ───────────────────────────────────────────────────────────

export const assetService = {
  getAllAssets: async (): Promise<GenericResult<AssetData[]>> => {
    try {
      const snap = await getDocs(collection(db, 'assets'));
      const assets: AssetData[] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return { success: true, data: assets };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  },

  getAsset: async (id: string): Promise<GenericResult<AssetData>> => {
    try {
      const snap = await getDoc(doc(db, 'assets', id));
      if (!snap.exists()) return { success: false, error: 'Asset not found' };
      return { success: true, data: { id: snap.id, ...snap.data() } };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  },

  createAsset: async (assetData: Record<string, unknown>): Promise<GenericResult<undefined>> => {
    try {
      const ref = await addDoc(collection(db, 'assets'), {
        ...assetData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return { success: true, id: ref.id };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  },

  updateAsset: async (id: string, assetData: Record<string, unknown>): Promise<GenericResult> => {
    try {
      await updateDoc(doc(db, 'assets', id), {
        ...assetData,
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  },

  deleteAsset: async (id: string): Promise<GenericResult> => {
    try {
      await deleteDoc(doc(db, 'assets', id));
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  },

  getAssetsByStatus: async (status: string): Promise<GenericResult<AssetData[]>> => {
    try {
      const q = query(collection(db, 'assets'), where('status', '==', status));
      const snap = await getDocs(q);
      const assets: AssetData[] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return { success: true, data: assets };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  },
};

// ─── Storage Services ─────────────────────────────────────────────────────────

export const storageService = {
  uploadFile: async (file: File, path: string): Promise<GenericResult> => {
    try {
      const storageRef = ref(storage, `${path}/${file.name}`);
      const snap = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snap.ref);
      return { success: true, url };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  },

  uploadAssetImage: (file: File, assetId: string): Promise<GenericResult> =>
    storageService.uploadFile(file, `assets/${assetId}/images`),
};