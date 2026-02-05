export interface AuthCredentials {
  email: string;
  password: string;
  rememberDevice: boolean;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
}
