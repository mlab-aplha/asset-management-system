import { auth } from '../backend-firebase/src/firebase/firebase/config';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile 
} from 'firebase/auth';
import { db } from '../backend-firebase/src/firebase/firebase/config';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { validateSouthAfricanPhone, validateMlabEmail } from './BaseService';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'manager' | 'user';
  status: 'active' | 'inactive';
  department: string;
  phone: string; // South African format
  hub: 'Tshwane' | 'Polokwane' | 'Galeshewe';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class AuthService {
  // Register new mLab South Africa user
  async register(userData: {
    email: string;
    password: string;
    displayName: string;
    phone: string;
    hub: 'Tshwane' | 'Polokwane' | 'Galeshewe';
    department: string;
    role?: 'admin' | 'manager' | 'user';
  }): Promise<User> {
    
    // Validate mLab email
    if (!validateMlabEmail(userData.email)) {
      throw new Error('Email must be from mLab domain (@mlab.co.za or @mlab.org.za)');
    }

    // Validate South African phone
    if (!validateSouthAfricanPhone(userData.phone)) {
      throw new Error('Invalid South African phone number format');
    }

    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );

    // Update profile
    await updateProfile(userCredential.user, {
      displayName: userData.displayName
    });

    // Create user document in Firestore
    const userDoc: Omit<User, 'id'> = {
      email: userData.email,
      displayName: userData.displayName,
      role: userData.role || 'user',
      status: 'active',
      department: userData.department,
      phone: userData.phone,
      hub: userData.hub,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), userDoc);

    return {
      id: userCredential.user.uid,
      ...userDoc
    };
  }

  // Login
  async login(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Get additional user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    const userData = userDoc.exists() ? userDoc.data() : null;
    
    return {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: userCredential.user.displayName,
      ...userData
    };
  }

  // Logout
  async logout() {
    await signOut(auth);
  }

  // Get current user with Firestore data
  async getCurrentUser(): Promise<User | null> {
    const user = auth.currentUser;
    if (!user) return null;

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) return null;

    return {
      id: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      ...userDoc.data()
    } as User;
  }

  // Reset password (mLabs South Africa specific)
  async resetPassword(email: string) {
    if (!validateMlabEmail(email)) {
      throw new Error('Email must be from mLab domain');
    }
    
    await sendPasswordResetEmail(auth, email);
  }

  // Update user profile
  async updateProfile(userId: string, updates: Partial<User>) {
    if (updates.phone && !validateSouthAfricanPhone(updates.phone)) {
      throw new Error('Invalid South African phone number');
    }

    await updateDoc(doc(db, 'users', userId), {
      ...updates,
      updatedAt: new Date()
    });
  }

  // Check if user is admin
  async isAdmin(userId: string): Promise<boolean> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() && userDoc.data()?.role === 'admin';
  }

  // Check if user is manager
  async isManager(userId: string): Promise<boolean> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    const role = userDoc.data()?.role;
    return role === 'manager' || role === 'admin';
  }
}

// Export singleton instance
export const authService = new AuthService();
