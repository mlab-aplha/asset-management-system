// src/pages/auth/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../../backend-firebase/src/services/AuthService';
import type { AuthCredentials } from '../../core/types/auth';
import { AuthButton } from '../../components/auth/Button';
import { userService } from '../../../backend-firebase/src/services/UserService';
import './auth.css';

const ROLE_HOME: Record<string, string> = {
    super_admin: '/dashboard',
    hub_manager: '/manager/dashboard',
    it: '/it/dashboard',
    asset_facilitator: '/facilitator/dashboard',
    student: '/student/dashboard',
};

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();

    const [credentials, setCredentials] = useState<AuthCredentials>({
        email: '',
        password: '',
        rememberDevice: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await AuthService.login(credentials.email, credentials.password);

            if (response.success && response.user) {
                const users = await userService.getUsers();
                const userData = users.find(u => u.uid === response.user!.uid) ?? null;

                const destination = userData?.role
                    ? (ROLE_HOME[userData.role] ?? '/facilitator/dashboard')
                    : '/facilitator/dashboard';

                navigate(destination);
            } else {
                const msg = response.message ?? '';
                if (
                    msg.includes('auth/invalid-credential') ||
                    msg.includes('auth/user-not-found') ||
                    msg.includes('auth/wrong-password')
                ) {
                    setError('Invalid email or password. Please try again.');
                } else {
                    setError(msg || 'Invalid credentials');
                }
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'An error occurred. Please try again.';
            if (
                msg.includes('auth/invalid-credential') ||
                msg.includes('auth/user-not-found') ||
                msg.includes('auth/wrong-password')
            ) {
                setError('Invalid email or password. Please try again.');
            } else {
                setError(msg);
            }
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page login-page">
            <div className="auth-background">
                <svg className="auth-svg" viewBox="0 0 1000 800">
                    <path
                        d="M400,100 L600,100 L800,300 L800,600 L600,750 L200,750 L100,600 L100,300 Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="0.5"
                    />
                </svg>
            </div>

            <header className="auth-header">
                <div className="auth-logo">
                    <div className="auth-logo-icon">
                        <span className="material-icons">account_tree</span>
                    </div>
                    <h2 className="auth-logo-text">
                        mLab <span className="auth-logo-subtext">AMS</span>
                    </h2>
                </div>
                <div className="auth-header-actions">
                    <span className="auth-header-text">Don't have an account?</span>
                    <button
                        className="auth-header-button"
                        type="button"
                        onClick={() => {
                            window.location.href = 'mailto:admin@mlab.co.za?subject=AMS%20Account%20Request';
                        }}
                    >
                        Contact Admin
                    </button>
                </div>
            </header>

            <main className="auth-main">
                <div className="auth-card">
                    <div className="auth-card-header">
                        <h1 className="auth-title">Welcome Back</h1>
                        <p className="auth-subtitle">
                            Enter your credentials to access the asset portal.
                        </p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit} noValidate>
                        {error && (
                            <div className="auth-error" role="alert">
                                <span className="material-icons" aria-hidden="true">error</span>
                                {error}
                            </div>
                        )}

                        {/* Email */}
                        <div className="input-field">
                            <label htmlFor="login-email" className="input-label">
                                Email Address
                            </label>
                            <div className="input-container">
                                <span className="input-icon material-icons" aria-hidden="true">mail</span>
                                <input
                                    id="login-email"
                                    name="email"
                                    type="email"
                                    className="input-element"
                                    placeholder="name@company.com"
                                    value={credentials.email}
                                    onChange={e => setCredentials({ ...credentials, email: e.target.value })}
                                    autoComplete="email"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="input-field password-field-wrapper">
                            <label htmlFor="login-password" className="input-label">
                                Password
                            </label>
                            <div className="input-container">
                                <span className="input-icon material-icons" aria-hidden="true">lock</span>
                                <input
                                    id="login-password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="input-element"
                                    placeholder="******"
                                    value={credentials.password}
                                    onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                                    autoComplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowPassword(v => !v)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    <span className="material-icons" aria-hidden="true">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                            <div className="forgot-password-wrapper">
                                <a
                                    className="forgot-password-link"
                                    onClick={() => navigate('/forgot-password')}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={e => { if (e.key === 'Enter') navigate('/forgot-password'); }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    Forgot Password?
                                </a>
                            </div>
                        </div>

                        {/* Remember device */}
                        <div className="remember-device">
                            <input
                                type="checkbox"
                                id="remember-device"
                                name="rememberDevice"
                                checked={credentials.rememberDevice}
                                onChange={e => setCredentials({ ...credentials, rememberDevice: e.target.checked })}
                            />
                            <label htmlFor="remember-device">Remember this device</label>
                        </div>

                        <AuthButton type="submit" loading={loading} icon="login" iconPosition="right">
                            Sign In
                        </AuthButton>
                    </form>

                    <div className="security-verification">
                        <p className="security-title">Security Verification</p>
                        <div className="security-icons" aria-hidden="true">
                            <div className="security-icon">
                                <span className="material-icons">fingerprint</span>
                            </div>
                            <div className="security-icon">
                                <span className="material-icons">shield_with_heart</span>
                            </div>
                            <div className="security-icon">
                                <span className="material-icons">vpn_key</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="auth-footer">
                <div className="security-notice">
                    <span className="material-icons" aria-hidden="true">shield</span>
                    <span>Secured by Neptune Tech Encryption</span>
                </div>
                <div className="footer-links">
                    <a href="#">Privacy Policy</a>
                    <a href="#">System Status</a>
                    <a href="#">mLab South Africa © 2026</a>
                </div>
            </footer>
        </div>
    );
};