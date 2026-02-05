import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  User
} from "firebase/auth";
import { auth } from "../../../backend-firebase/src/firebase/config";
import type { AuthCredentials } from "../types/auth";

export class AuthService {
  static async login(credentials: AuthCredentials) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      
      // Store remember device preference (simple localStorage)
      if (credentials.rememberDevice) {
        localStorage.setItem('rememberDevice', 'true');
      }

      return {
        success: true,
        user: userCredential.user,
        message: 'Login successful'
      };
    } catch (error: any) {
      console.error('Login error:', error);
      
      // User-friendly error messages
      let message = 'Invalid email or password';
      switch (error.code) {
        case 'auth/invalid-email':
          message = 'Please enter a valid email address';
          break;
        case 'auth/user-disabled':
          message = 'This account has been disabled';
          break;
        case 'auth/user-not-found':
          message = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          message = 'Incorrect password';
          break;
        case 'auth/too-many-requests':
          message = 'Too many failed attempts. Try again later';
          break;
      }

      return {
        success: false,
        message: message
      };
    }
  }

  static async register(credentials: AuthCredentials) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      return {
        success: true,
        user: userCredential.user,
        message: 'Registration successful'
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let message = 'An error occurred during registration';
      switch (error.code) {
        case 'auth/email-already-in-use':
          message = 'Email already in use';
          break;
        case 'auth/invalid-email':
          message = 'Invalid email address';
          break;
        case 'auth/weak-password':
          message = 'Password is too weak';
          break;
      }

      return {
        success: false,
        message: message
      };
    }
  }

  static async forgotPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
      return {
        success: true,
        message: 'Password reset email sent. Check your inbox.'
      };
    } catch (error: any) {
      console.error('Forgot password error:', error);
      
      let message = 'Failed to send reset email';
      if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email';
      }

      return {
        success: false,
        message: message
      };
    }
  }

  static async logout() {
    try {
      await signOut(auth);
      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error: any) {
      console.error('Logout error:', error);
      return {
        success: false,
        message: 'Error during logout'
      };
    }
  }

  static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  static onAuthStateChanged(callback: (user: User | null) => void) {
    return auth.onAuthStateChanged(callback);
  }

  // Check if user is logged in
  static isAuthenticated() {
    return !!auth.currentUser;
  }
}