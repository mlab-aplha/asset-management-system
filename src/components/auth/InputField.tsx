import React from 'react';

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
    ...props
}) => {
    return (
        <div className={`input-field ${containerClassName}`}>
            <label className="input-label">
                {label}
            </label>
            <div className="input-container">
                {icon && (
                    <span className="input-icon material-icons">
                        {icon}
                    </span>
                )}
                <input
                    type={type}
                    className={`input-element ${error ? 'input-error' : ''} ${className}`}
                    {...props}
                />
            </div>
            {error && <p className="input-error-message">{error}</p>}
        </div>
    );
};