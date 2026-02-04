import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../core/services/AuthService';
import type { AuthCredentials } from '../../core/types/auth';
import { InputField } from '../../components/auth/InputField';
import { AuthButton } from '../../components/auth/Button';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState<AuthCredentials>({
        email: '',
        password: '',
        rememberDevice: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await AuthService.login(credentials);

            if (response.success) {
                navigate('/dashboard');
            } else {
                setError(response.message || 'Invalid credentials');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred. Please try again.';
            setError(errorMessage);
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = () => {
        navigate('/forgot-password');
    };

    const handleContactAdmin = () => {
        window.location.href = 'mailto:admin@mlab.co.za?subject=AMS%20Account%20Request';
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
                    <button className="auth-header-button" onClick={handleContactAdmin}>
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

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {error && (
                            <div className="auth-error">
                                <span className="material-icons">error</span>
                                {error}
                            </div>
                        )}

                        <InputField
                            label="Email Address"
                            icon="mail"
                            type="email"
                            placeholder="name@company.com"
                            value={credentials.email}
                            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                            required
                        />

                        <div className="password-field-wrapper">
                            <InputField
                                label="Password"
                                icon="lock"
                                type="password"
                                placeholder="••••••••"
                                value={credentials.password}
                                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                required
                            />
                            <div className="forgot-password-wrapper">
                                <a className="forgot-password-link" onClick={handleForgotPassword}>
                                    Forgot Password?
                                </a>
                            </div>
                        </div>

                        <div className="remember-device">
                            <input
                                type="checkbox"
                                id="remember"
                                checked={credentials.rememberDevice}
                                onChange={(e) => setCredentials({ ...credentials, rememberDevice: e.target.checked })}
                            />
                            <label htmlFor="remember">Remember this device</label>
                        </div>

                        <AuthButton
                            type="submit"
                            loading={loading}
                            icon="login"
                            iconPosition="right"
                        >
                            Sign In
                        </AuthButton>
                    </form>

                    <div className="security-verification">
                        <p className="security-title">Security Verification</p>
                        <div className="security-icons">
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
                    <span className="material-icons">shield</span>
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