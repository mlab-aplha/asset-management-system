import type { AuthCredentials, PasswordResetRequest, AuthResponse, UserProfile } from '../types/auth';

export class AuthService {
    private static readonly API_BASE = '/api/auth';

    static async login(credentials: AuthCredentials): Promise<AuthResponse> {
        try {
            const response = await fetch(`${this.API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (data.success && data.token) {
                localStorage.setItem('auth_token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            return data;
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Network error. Please check your connection.'
            };
        }
    }

    static async logout(): Promise<void> {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        await fetch(`${this.API_BASE}/logout`, { method: 'POST' });
    }

    static async requestPasswordReset(request: PasswordResetRequest): Promise<AuthResponse> {
        const response = await fetch(`${this.API_BASE}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request)
        });
        return response.json();
    }

    static async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
        const response = await fetch(`${this.API_BASE}/reset-password/${token}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newPassword })
        });
        return response.json();
    }

    static getCurrentUser(): UserProfile | null {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    static isAuthenticated(): boolean {
        return !!localStorage.getItem('auth_token');
    }

    static hasRole(role: 'admin' | 'facilitator'): boolean {
        const user = this.getCurrentUser();
        return user?.role === role;
    }
}