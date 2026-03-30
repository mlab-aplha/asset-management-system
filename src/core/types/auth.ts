// src/core/types/auth.ts

export interface AuthCredentials {
  email: string;
  password: string;
  rememberDevice: boolean;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User | null;
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  role?: 'admin' | 'facilitator' | 'student';
}
export type UserProfile = User;

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message?: string;
}