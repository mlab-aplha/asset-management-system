import React from 'react';
import './ui.css';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    glass?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    glass = true,
    padding = 'md'
}) => {
    const paddingClasses = {
        none: '',
        sm: 'card-padding-sm',
        md: 'card-padding-md',
        lg: 'card-padding-lg'
    };

    return (
        <div className={`card ${glass ? 'card-glass' : ''} ${paddingClasses[padding]} ${className}`}>
            {children}
        </div>
    );
};