// src/components/auth/InputField.tsx
import React, { useId } from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon?: string;
    error?: string;
    containerClassName?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
    label,
    icon,
    error,
    containerClassName = '',
    className = '',
    type = 'text',
    id,
    ...props
}) => {
    // Generate a stable unique id if one isn't passed in
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
        <div className={`input-field ${containerClassName}`}>
            {/* htmlFor connects the label to the input — fixes "no label associated" warning */}
            <label htmlFor={inputId} className="input-label">
                {label}
            </label>
            <div className="input-container">
                {icon && (
                    <span className="input-icon material-icons" aria-hidden="true">
                        {icon}
                    </span>
                )}
                <input
                    id={inputId}
                    type={type}
                    className={`input-element ${error ? 'input-error' : ''} ${className}`}
                    aria-describedby={error ? `${inputId}-error` : undefined}
                    aria-invalid={error ? true : undefined}
                    {...props}
                />
            </div>
            {error && (
                <p id={`${inputId}-error`} className="input-error-message" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
};