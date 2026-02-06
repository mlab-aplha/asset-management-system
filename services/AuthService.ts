  
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  User, 
  UserCredential 
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  Timestamp 
} from "firebase/firestore";
import { auth, db } from "../backend-firebase/src/firebase/firebase/config";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'manager' | 'employee' | 'user';
  department?: string;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class AuthService {
  private auth = auth;

   
  async register(
    email: string, 
    password: string, 
    profileData: { displayName: string; role?: string }
  ): Promise<{ user: User; profile: UserProfile }> {
     
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    
     
    await updateProfile(userCredential.user, {
      displayName: profileData.displayName
    });
    
    
    const userProfile: Omit<UserProfile, 'uid'> = {
      email,
      displayName: profileData.displayName,
      role: (profileData.role as UserProfile['role']) || 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await setDoc(doc(db, 'users', userCredential.user.uid), userProfile);
    
    return {
      user: userCredential.user,
      profile: {
        uid: userCredential.user.uid,
        ...userProfile
      }
    };
  }

  async login(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async logout(): Promise<void> {
    return signOut(this.auth);
  }

  async resetPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(this.auth, email);
  }

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

   
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const userDoc = await getDoc(doc(db, 'users', uid));
    
    if (!userDoc.exists()) return null;
    
    const data = userDoc.data();
    return {
      uid: userDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    } as UserProfile;
  }

   
  async updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    await updateDoc(doc(db, 'users', uid), {
      ...data,
      updatedAt: Timestamp.now()
    });
  }
}

export const authService = new AuthService();