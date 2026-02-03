import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../core/services/AuthService';
import type { PasswordResetRequest } from '../../core/types/auth';
import { InputField } from '../../components/auth/InputField';
import { AuthButton } from '../../components/auth/Button';

export const ForgotPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const request: PasswordResetRequest = { email };
            const response = await AuthService.requestPasswordReset(request);

            if (response.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(response.message || 'Failed to send reset link');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred. Please try again.';
            setError(errorMessage);
            console.error('Password reset error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLogin = () => {
        navigate('/login');
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
                    <g className="hub-markers">
                        <circle cx="650" cy="280" fill="#94c73d" r="4" />
                        <circle cx="630" cy="320" fill="#94c73d" r="5" />
                        <circle cx="250" cy="680" fill="#94c73d" r="4" />
                        <circle cx="750" cy="550" fill="#94c73d" r="4" />
                        <circle cx="550" cy="450" fill="#94c73d" r="4" />
                    </g>
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
            </header>

            <main className="auth-main">
                <div className="auth-card">
                    <div className="auth-card-header text-center">
                        <div className="reset-icon">
                            <span className="material-icons">lock_reset</span>
                        </div>
                        <h1 className="auth-title">Reset Your Password</h1>
                        <p className="auth-subtitle">
                            {success
                                ? 'Reset link sent! Check your email and return to login.'
                                : "Enter the email address associated with your account and we'll send you a link to reset your password."
                            }
                        </p>
                    </div>

                    {!success ? (
                        <form className="auth-form" onSubmit={handleSubmit}>
                            {error && (
                                <div className="auth-error">
                                    <span className="material-icons">error</span>
                                    {error}
                                </div>
                            )}

                            <InputField
                                label="Work Email"
                                icon="mail"
                                type="email"
                                placeholder="name@mlab.co.za"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <AuthButton
                                type="submit"
                                loading={loading}
                                variant="primary"
                            >
                                Send Reset Link
                            </AuthButton>
                        </form>
                    ) : (
                        <div className="success-message">
                            <span className="material-icons success-icon">check_circle</span>
                            <p>Reset link sent successfully! Redirecting to login...</p>
                        </div>
                    )}

                    <div className="back-to-login">
                        <button className="back-button" onClick={handleBackToLogin}>
                            <span className="material-icons">arrow_back</span>
                            Back to Login
                        </button>
                    </div>
                </div>
            </main>

            <footer className="auth-footer compact">
                <div className="security-notice">
                    <span className="material-icons">shield</span>
                    <span>Secured by Neptune Tech Encryption</span>
                </div>

                <p className="copyright">
                    mLab South Africa © 2026
                </p>
            </footer>
        </div>
    );
};