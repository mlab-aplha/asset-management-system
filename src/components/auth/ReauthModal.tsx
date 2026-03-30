// src/components/auth/ReauthModal.tsx
import React, { useState } from 'react';
import './reauth-modal.css';

interface ReauthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (password: string) => Promise<void>;
    loading: boolean;
    error: string | null;
    actionType: 'create' | 'edit' | 'delete' | 'assign' | 'approve';
    resourceType: 'user' | 'asset' | 'request' | 'hub';
    resourceName?: string;
    userName?: string;
}

// ── Inner form — mounted fresh each time via `key` prop ───────────────────────
// Mounting fresh resets `password` to '' without needing useEffect + setState.

const ReauthForm: React.FC<ReauthModalProps> = ({
    onClose,
    onSubmit,
    loading,
    error,
    actionType,
    resourceType,
    resourceName,
    userName,
}) => {
    const [password, setPassword] = useState('');

    const actionLabel: Record<string, string> = {
        create: 'Creating',
        edit: 'Editing',
        delete: 'Deleting',
        assign: 'Assigning',
        approve: 'Approving',
    };

    const resourceLabel: Record<string, string> = {
        user: 'user account',
        asset: 'asset',
        request: 'asset request',
        hub: 'hub',
    };

    const confirmIcon: Record<string, string> = {
        create: 'person_add',
        edit: 'edit',
        delete: 'delete_forever',
        assign: 'assignment_ind',
        approve: 'check_circle',
    };

    const contextIcon: Record<string, string> = {
        create: 'person_add',
        edit: 'edit',
        delete: 'delete',
        assign: 'assignment_ind',
        approve: 'check_circle',
    };

    return (
        <div className="reauth-overlay" onClick={onClose}>
            <div className="reauth-modal" onClick={e => e.stopPropagation()}>

                {/* Icon */}
                <div className="reauth-icon-wrap">
                    <span className="material-icons">lock</span>
                </div>

                <h3 className="reauth-title">Confirm Identity</h3>

                {/* Context chip */}
                <div className="reauth-context">
                    <span className="material-icons">{contextIcon[actionType]}</span>
                    <span>
                        {actionLabel[actionType]}{' '}
                        <strong>{resourceName || resourceLabel[resourceType]}</strong>
                    </span>
                </div>

                <p className="reauth-subtitle">
                    Enter your admin password to authorise this action.
                    Your session will remain active.
                </p>

                {/* Who is authenticating */}
                {userName && (
                    <div className="reauth-user-context">
                        <span className="material-icons">person</span>
                        <span>Authenticating as: <strong>{userName}</strong></span>
                    </div>
                )}

                {/* Password */}
                <input
                    type="password"
                    className={`reauth-input ${error ? 'reauth-input-error' : ''}`}
                    placeholder="Enter your password"
                    value={password}
                    autoFocus
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter' && password && !loading) onSubmit(password);
                    }}
                />

                {error && (
                    <p className="reauth-error">
                        <span className="material-icons">error_outline</span>
                        {error}
                    </p>
                )}

                {/* Warning for destructive actions */}
                {(actionType === 'delete') && (
                    <div className="reauth-warning">
                        <span className="material-icons">warning</span>
                        <span>This action cannot be undone. Please confirm carefully.</span>
                    </div>
                )}

                <div className="reauth-actions">
                    <button
                        className="reauth-cancel"
                        onClick={onClose}
                        disabled={loading}
                        type="button"
                    >
                        Cancel
                    </button>
                    <button
                        className="reauth-confirm"
                        onClick={() => onSubmit(password)}
                        disabled={!password || loading}
                        type="button"
                    >
                        {loading
                            ? <span className="reauth-spinner" />
                            : <span className="material-icons">{confirmIcon[actionType]}</span>
                        }
                        {loading ? 'Verifying…' : `Confirm ${actionLabel[actionType]}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Public export — wraps ReauthForm with a key so it remounts on each open ──

export const ReauthModal: React.FC<ReauthModalProps> = (props) => {
    if (!props.isOpen) return null;
    // key={Date.now()} forces a full remount each time isOpen flips true,
    // resetting password state without any useEffect + setState.
    return <ReauthForm key={String(props.isOpen)} {...props} />;
};