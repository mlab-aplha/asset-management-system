import React, { useEffect } from 'react';
import './ui.css';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md'
}) => {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);

            document.body.classList.add('modal-open');
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.classList.remove('modal-open');
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeClass = { sm: 'modal-sm', md: 'modal-md', lg: 'modal-lg' }[size];

    return (

        <div className="modal-overlay" onClick={onClose}>
            <div
                className={`modal-container ${sizeClass}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <button className="modal-close-btn" onClick={onClose} type="button" aria-label="Close modal">
                        <span className="material-icons">close</span>
                    </button>
                </div>
                <div className="modal-content">
                    {children}
                </div>
            </div>
        </div>
    );
};