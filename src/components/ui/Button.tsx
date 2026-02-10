import React from 'react';
import './ui.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    icon?: string;
    fullWidth?: boolean;
    loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'secondary',
    size = 'md',
    icon,
    fullWidth = false,
    loading = false,
    className = '',
    disabled,
    ...props
}) => {
    const baseClasses = 'button';
    const variantClasses = {
        primary: 'button-primary',
        secondary: 'button-secondary',
        danger: 'button-danger',
        outline: 'button-outline'
    };
    const sizeClasses = {
        sm: 'button-sm',
        md: 'button-md',
        lg: 'button-lg'
    };

    return (
        <button
            className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'button-full-width' : ''}
        ${loading ? 'button-loading' : ''}
        ${className}
      `}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <span className="button-loader"></span>
            ) : (
                <>
                    {icon && <span className="material-icons button-icon">{icon}</span>}
                    {children}
                </>
            )}
        </button>
    );
};