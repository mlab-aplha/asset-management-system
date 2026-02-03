export interface AuthCredentials {
    email: string;
    password: string;
    rememberDevice?: boolean;
}

export interface PasswordResetRequest {
    email: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    token?: string;
    user?: UserProfile;
}

export interface UserProfile {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'facilitator';
    hub: string;
    department: string;
    avatar?: string;
}

export interface SecurityVerification {
    type: 'email' | 'sms';
    status: 'enabled' | 'disabled' | 'pending';
}