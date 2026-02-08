   import { auth } from '../backend-firebase/src/firebase/firebase/config';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  UserCredential
} from 'firebase/auth';
import { db } from '../backend-firebase/src/firebase/firebase/config';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { AuthValidations } from '../validations/auth.validations';

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
  lastLogin?: Date;
}

export interface RegisterData {
  email: string;
  password: string;
  displayName: string;
  phone: string;
  hub: 'Tshwane' | 'Polokwane' | 'Galeshewe';
  department: string;
  role?: 'admin' | 'manager' | 'user';
}

export class AuthService {
  // Register new mLab South Africa user
  async register(userData: RegisterData): Promise<User> {
    
    // Validate mLab email
    if (!AuthValidations.validateMlabEmail(userData.email).isValid) {
      throw new Error('Email must be from mLab domain (@mlab.co.za or @mlab.org.za)');
    }

    // Validate South African phone
    const phoneValidation = AuthValidations.validateSouthAfricanPhone(userData.phone);
    if (!phoneValidation.isValid) {
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
      phone: phoneValidation.formatted || userData.phone,
      hub: userData.hub,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: new Date()
    };

    await setDoc(doc(db, 'users', userCredential.user.uid), userDoc);

    // Return without duplicate fields
    return {
      id: userCredential.user.uid,
      email: userDoc.email,
      displayName: userDoc.displayName,
      role: userDoc.role,
      status: userDoc.status,
      department: userDoc.department,
      phone: userDoc.phone,
      hub: userDoc.hub,
      isActive: userDoc.isActive,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt,
      lastLogin: userDoc.lastLogin
    };
  }

  // Login
  async login(email: string, password: string): Promise<User> {
    // Validate mLab email
    if (!AuthValidations.validateMlabEmail(email).isValid) {
      throw new Error('Please use your mLab email to login');
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Get additional user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    
    if (!userDoc.exists()) {
      throw new Error('User profile not found in mLab system');
    }

    const userData = userDoc.data() as User;
    
    // Check if user is active
    if (!userData.isActive || userData.status !== 'active') {
      throw new Error('Your mLab account is inactive. Contact administrator.');
    }

    // Update last login timestamp
    await updateDoc(doc(db, 'users', userCredential.user.uid), {
      lastLogin: new Date(),
      updatedAt: new Date()
    });

    // Return merged user data without duplicates
    return {
      id: userCredential.user.uid,
      email: userCredential.user.email || email,
      displayName: userCredential.user.displayName || userData.displayName,
      // Fields from Firestore
      role: userData.role,
      status: userData.status,
      department: userData.department,
      phone: userData.phone,
      hub: userData.hub,
      isActive: userData.isActive,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
      lastLogin: userData.lastLogin || new Date()
    };
  }

  // Logout
  async logout(): Promise<void> {
    await signOut(auth);
  }

  // Get current user with Firestore data
  async getCurrentUser(): Promise<User | null> {
    const user = auth.currentUser;
    if (!user) return null;

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) return null;

    const userData = userDoc.data() as User;
    
    // Return without duplicates
    return {
      id: user.uid,
      email: user.email || userData.email,
      displayName: user.displayName || userData.displayName,
      role: userData.role,
      status: userData.status,
      department: userData.department,
      phone: userData.phone,
      hub: userData.hub,
      isActive: userData.isActive,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
      lastLogin: userData.lastLogin
    };
  }

  // Reset password (mLabs South Africa specific)
  async resetPassword(email: string) {
    if (!AuthValidations.validateMlabEmail(email).isValid) {
      throw new Error('Email must be from mLab domain');
    }
    
    await sendPasswordResetEmail(auth, email);
  }

  // Update user profile
  async updateProfile(userId: string, updates: Partial<User>): Promise<void> {
    if (updates.phone && !AuthValidations.validateSouthAfricanPhone(updates.phone).isValid) {
      throw new Error('Invalid South African phone number');
    }

    if (updates.email && !AuthValidations.validateMlabEmail(updates.email).isValid) {
      throw new Error('Email must be from mLab domain');
    }

    await updateDoc(doc(db, 'users', userId), {
      ...updates,
      updatedAt: new Date()
    });
  }

  // Check if user is admin
  async isAdmin(userId: string): Promise<boolean> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.exists() ? userDoc.data() as User : null;
    return userData?.role === 'admin';
  }

  // Check if user is manager or admin
  async isManager(userId: string): Promise<boolean> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.exists() ? userDoc.data() as User : null;
    const role = userData?.role;
    return role === 'manager' || role === 'admin';
  }

  // Get all users (admin only)
  async getAllUsers(): Promise<User[]> {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error('You must be logged in');
      }

      const isAdminUser = await this.isAdmin(currentUser.id);
      if (!isAdminUser) {
        throw new Error('Only administrators can view all users');
      }

      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users: User[] = [];
      
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          id: doc.id,
          email: data.email || '',
          displayName: data.displayName || '',
          role: data.role || 'user',
          status: data.status || 'inactive',
          department: data.department || '',
          phone: data.phone || '',
          hub: data.hub || 'Tshwane',
          isActive: data.isActive || false,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastLogin: data.lastLogin?.toDate()
        });
      });

      return users;
    } catch (error: any) {
      throw new Error(`Failed to get users: ${error.message}`);
    }
  }

  // Get users by hub
  async getUsersByHub(hub: 'Tshwane' | 'Polokwane' | 'Galeshewe'): Promise<User[]> {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error('You must be logged in to view users');
      }

      // Users can see others in their hub, admins can see all
      if (currentUser.hub !== hub && !(await this.isAdmin(currentUser.id))) {
        throw new Error('You can only view users in your own hub');
      }

      const q = query(
        collection(db, 'users'),
        where('hub', '==', hub),
        where('isActive', '==', true)
      );
      
      const usersSnapshot = await getDocs(q);
      const users: User[] = [];
      
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          id: doc.id,
          email: data.email || '',
          displayName: data.displayName || '',
          role: data.role || 'user',
          status: data.status || 'active',
          department: data.department || '',
          phone: data.phone || '',
          hub: data.hub || hub,
          isActive: data.isActive || true,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastLogin: data.lastLogin?.toDate()
        });
      });

      return users;
    } catch (error: any) {
      throw new Error(`Failed to get users by hub: ${error.message}`);
    }
  }

  // Deactivate user (soft delete)
  async deactivateUser(userId: string, reason?: string): Promise<void> {
    try {
      // Don't allow deactivating yourself
      const currentUser = await this.getCurrentUser();
      if (currentUser?.id === userId) {
        throw new Error('You cannot deactivate your own account');
      }

      await updateDoc(doc(db, 'users', userId), {
        isActive: false,
        status: 'inactive',
        deactivationReason: reason,
        deactivatedAt: new Date(),
        updatedAt: new Date()
      });
    } catch (error: any) {
      throw new Error(`Failed to deactivate user: ${error.message}`);
    }
  }

  // Reactivate user
  async reactivateUser(userId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isActive: true,
        status: 'active',
        reactivatedAt: new Date(),
        updatedAt: new Date()
      });
    } catch (error: any) {
      throw new Error(`Failed to reactivate user: ${error.message}`);
    }
  }

  // Check if user is in specific hub
  async isUserInHub(userId: string, hub: 'Tshwane' | 'Polokwane' | 'Galeshewe'): Promise<boolean> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return false;
    
    const userData = userDoc.data() as User;
    return userData.hub === hub;
  }

  // Check if email exists
  async checkEmailExists(email: string): Promise<boolean> {
    const q = query(collection(db, 'users'), where('email', '==', email.toLowerCase()));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }
}

// Export singleton instance
export const authService = new AuthService();