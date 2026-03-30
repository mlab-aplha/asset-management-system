import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  User,
  UserCredential
} from "firebase/auth";
import { auth } from "../firebase/config";

interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User | null;
}

interface UserData {
  displayName?: string;
  email: string;
  password: string;
}

export class AuthService {
  static async register(userData: UserData): Promise<AuthResponse> {
    try {
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      if (userData.displayName) {
        await updateProfile(userCredential.user, {
          displayName: userData.displayName
        });
      }

      return {
        success: true,
        message: "Registration successful",
        user: userCredential.user
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed";
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      return {
        success: true,
        message: "Login successful",
        user: userCredential.user
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Login failed";
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  static async logout(): Promise<AuthResponse> {
    try {
      await signOut(auth);
      return {
        success: true,
        message: "Logout successful"
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Logout failed";
      return {
        success: false,
        message: errorMessage
      };
    }
  }

  static async requestPasswordReset(request: { email: string }): Promise<AuthResponse> {
    try {
      await sendPasswordResetEmail(auth, request.email);
      return {
        success: true,
        message: "Password reset email sent successfully"
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Password reset failed";

      // Handle specific Firebase errors
      if (errorMessage.includes('auth/user-not-found')) {
        return {
          success: false,
          message: "No account found with this email address"
        };
      }
      if (errorMessage.includes('auth/invalid-email')) {
        return {
          success: false,
          message: "Invalid email address"
        };
      }
      if (errorMessage.includes('auth/too-many-requests')) {
        return {
          success: false,
          message: "Too many requests. Please try again later"
        };
      }

      return {
        success: false,
        message: "Failed to send reset link. Please try again."
      };
    }
  }

  static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  static async updateUserProfile(displayName?: string, photoURL?: string): Promise<AuthResponse> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return {
          success: false,
          message: "No user is currently logged in"
        };
      }

      await updateProfile(user, {
        displayName,
        photoURL
      });

      return {
        success: true,
        message: "Profile updated successfully",
        user
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Profile update failed";
      return {
        success: false,
        message: errorMessage
      };
    }
  }
}

export default AuthService;