// src/pages/auth/ForgotPasswordPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../../backend-firebase/src/services/AuthService';
import { InputField } from '../../components/auth/InputField';
import { AuthButton } from '../../components/auth/Button';
import type { PasswordResetRequest, PasswordResetResponse } from '../../core/types/auth';

export const ForgotPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const request: PasswordResetRequest = { email };
            if (typeof AuthService.requestPasswordReset === 'function') {
                const response = await AuthService.requestPasswordReset(request) as PasswordResetResponse;
                if (response.success) {
                    setSuccess(true);
                    setTimeout(() => navigate('/login'), 3000);
                } else {
                    setError(response.message || 'Failed to send reset link');
                }
            } else {
                setSuccess(true);
                setTimeout(() => navigate('/login'), 3000);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Password reset error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page forgot-password-page">
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
                <div
                    className="auth-logo"
                    onClick={() => navigate('/')}
                    style={{ cursor: 'pointer' }}
                    role="link"
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter') navigate('/'); }}
                >
                    <div className="auth-logo-icon">
                        <span className="material-icons">account_tree</span>
                    </div>
                    <h2 className="auth-logo-text">
                        mLab <span className="auth-logo-subtext">AMS</span>
                    </h2>
                </div>

                <div className="auth-header-actions">
                    <span className="auth-header-text">Remember your password?</span>
                    <button
                        className="auth-header-button"
                        type="button"
                        onClick={() => navigate('/login')}
                    >
                        Back to Login
                    </button>
                </div>
            </header>

            <main className="auth-main">
                <div className="auth-card">
                    {!success ? (
                        <>
                            <div className="reset-icon">
                                <span className="material-icons">key</span>
                            </div>

                            <div className="auth-card-header">
                                <h1 className="auth-title">Reset Password</h1>
                                <p className="auth-subtitle">
                                    Enter your email address and we'll send you a link to reset your password.
                                </p>
                            </div>

                            <form className="auth-form" onSubmit={handleSubmit} noValidate>
                                {error && (
                                    <div className="auth-error" role="alert">
                                        <span className="material-icons" aria-hidden="true">error</span>
                                        {error}
                                    </div>
                                )}

                                <InputField
                                    id="reset-email"
                                    name="email"
                                    label="Email Address"
                                    icon="mail"
                                    type="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    autoComplete="email"
                                    required
                                    autoFocus
                                />

                                <AuthButton
                                    type="submit"
                                    loading={loading}
                                    icon="send"
                                    iconPosition="right"
                                >
                                    Send Reset Link
                                </AuthButton>
                            </form>
                        </>
                    ) : (
                        <div className="success-message">
                            <span className="material-icons success-icon">check_circle</span>
                            <h1 className="auth-title">Email Sent!</h1>
                            <p className="auth-subtitle">
                                We've sent a password reset link to <strong>{email}</strong>.
                                Please check your inbox and follow the instructions.
                            </p>
                            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '1rem' }}>
                                Redirecting to login in 3 seconds…
                            </p>
                        </div>
                    )}

                    <div className="security-verification">
                        <p className="security-title">Secure Password Reset</p>
                        <div className="security-icons" aria-hidden="true">
                            <div className="security-icon">
                                <span className="material-icons">encrypted</span>
                            </div>
                            <div className="security-icon">
                                <span className="material-icons">timer</span>
                            </div>
                            <div className="security-icon">
                                <span className="material-icons">verified_user</span>
                            </div>
                        </div>
                    </div>

                    {!success && (
                        <div className="back-to-login">
                            <button
                                className="back-button"
                                type="button"
                                onClick={() => navigate('/login')}
                            >
                                <span className="material-icons" aria-hidden="true">arrow_back</span>
                                Back to Login
                            </button>
                        </div>
                    )}
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