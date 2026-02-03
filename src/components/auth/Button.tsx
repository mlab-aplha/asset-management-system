import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    icon?: string;
    iconPosition?: 'left' | 'right';
}

export const AuthButton: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    iconPosition = 'right',
    className = '',
    disabled,
    ...props
}) => {
    const baseClass = 'auth-button';
    const variantClass = `auth-button-${variant}`;
    const sizeClass = `auth-button-${size}`;
    const loadingClass = loading ? 'auth-button-loading' : '';
    const disabledClass = disabled ? 'auth-button-disabled' : '';

    return (
        <button
            className={`${baseClass} ${variantClass} ${sizeClass} ${loadingClass} ${disabledClass} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading && <span className="auth-button-spinner"></span>}

            {!loading && icon && iconPosition === 'left' && (
                <span className="auth-button-icon-left material-icons">{icon}</span>
            )}

            <span className="auth-button-text">{children}</span>

            {!loading && icon && iconPosition === 'right' && (
                <span className="auth-button-icon-right material-icons">{icon}</span>
            )}
        </button>
    );
};