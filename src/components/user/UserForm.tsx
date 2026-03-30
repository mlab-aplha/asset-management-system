// src/components/user/UserForm.tsx
import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { UserFormData, UserRole } from '../../core/entities/User';
import { PasswordUtils } from '../../utils/passwordUtils';
import { LocationSelector } from './LocationSelector';

interface UserFormProps {
    initialData?: Partial<UserFormData>;
    onSubmit: (data: UserFormData) => Promise<{ success: boolean; errors?: Record<string, string> }>;
    onCancel: () => void;
    isSubmitting: boolean;
    title: string;
    errors?: Record<string, string>;
}

const ROLES: { value: UserRole; label: string }[] = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'hub_manager', label: 'Hub Manager' },
    { value: 'it', label: 'IT Technician' },
    { value: 'asset_facilitator', label: 'Asset Facilitator' },
    { value: 'student', label: 'Student' },
];

const STATUSES = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
];

export const UserForm: React.FC<UserFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    isSubmitting,
    title,
    errors: externalErrors,
}) => {
    const isEditMode = !!initialData?.displayName;

    const [formData, setFormData] = useState<UserFormData>({
        displayName: initialData?.displayName ?? '',
        email: initialData?.email ?? '',
        role: initialData?.role ?? 'asset_facilitator',
        department: initialData?.department ?? '',
        status: initialData?.status ?? 'active',
        password: initialData?.password ?? '',
        passwordMethod: initialData?.passwordMethod ?? 'manual',
        assignedHubIds: initialData?.assignedHubIds ?? [],
        primaryLocationId: initialData?.primaryLocationId,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] as string[] });
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [showGenPassword, setShowGenPassword] = useState(false);

    const allErrors = { ...errors, ...externalErrors };

    const checkStrength = (pwd: string) => {
        let score = 0;
        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[a-z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[!@#$%^&*]/.test(pwd)) score++;
        setPasswordStrength({ score, feedback: [] });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'password') checkStrength(value);
        if (allErrors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handlePasswordMethod = (method: 'manual' | 'auto') => {
        if (method === 'auto') {
            const pwd = PasswordUtils.generateSecurePassword();
            setGeneratedPassword(pwd);
            setFormData(prev => ({ ...prev, passwordMethod: 'auto', password: pwd }));
            checkStrength(pwd);
        } else {
            setFormData(prev => ({ ...prev, passwordMethod: 'manual' }));
        }
    };

    const handleNewPassword = () => {
        const pwd = PasswordUtils.generateSecurePassword();
        setGeneratedPassword(pwd);
        setFormData(prev => ({ ...prev, password: pwd }));
        checkStrength(pwd);
        setShowGenPassword(true);
    };

    const strengthColor = (
        ['#ef4444', '#f97316', '#fbbf24', '#84cc16', '#22c55e', '#16a34a'] as string[]
    )[passwordStrength.score] ?? '#e5e7eb';

    const strengthLabel = (
        ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'] as string[]
    )[passwordStrength.score] ?? '';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const submitData: UserFormData = isEditMode
            ? { ...formData, password: undefined, passwordMethod: undefined }
            : formData;
        const result = await onSubmit(submitData);
        if (!result.success && result.errors) setErrors(result.errors);
    };

    return (
        <form onSubmit={handleSubmit} className="modal-form" noValidate>

            {/* ── Display Name ── */}
            <div className="form-group">
                <label htmlFor="uf-displayName" className="form-label">
                    Display Name <span className="required-star">*</span>
                </label>
                <input
                    id="uf-displayName"
                    name="displayName"
                    type="text"
                    autoComplete="name"
                    value={formData.displayName}
                    onChange={handleChange}
                    className={`form-input ${allErrors.displayName ? 'error' : ''}`}
                    placeholder="Full name"
                    disabled={isSubmitting}
                />
                {allErrors.displayName && <span className="error-text">{allErrors.displayName}</span>}
            </div>

            {/* ── Email ── */}
            <div className="form-group">
                <label htmlFor="uf-email" className="form-label">
                    Email Address <span className="required-star">*</span>
                </label>
                <input
                    id="uf-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`form-input ${allErrors.email ? 'error' : ''}`}
                    placeholder="user@example.com"
                    disabled={isSubmitting || isEditMode}
                />
                {allErrors.email && <span className="error-text">{allErrors.email}</span>}
                {isEditMode && (
                    <small className="form-hint">Email cannot be changed after creation</small>
                )}
            </div>

            {/* ── Password (new users only) ── */}
            {!isEditMode && (
                <div className="form-section">
                    <h4 className="form-section-title">Password</h4>

                    <div className="password-method-selector">
                        <Button
                            type="button"
                            variant={formData.passwordMethod === 'manual' ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => handlePasswordMethod('manual')}
                        >
                            Enter Password
                        </Button>
                        <Button
                            type="button"
                            variant={formData.passwordMethod === 'auto' ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => handlePasswordMethod('auto')}
                        >
                            Auto-generate
                        </Button>
                    </div>

                    {formData.passwordMethod === 'manual' && (
                        <div className="form-group">
                            <label htmlFor="uf-password" className="form-label">
                                Password <span className="required-star">*</span>
                            </label>
                            <div className="password-input-container">
                                <input
                                    id="uf-password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    value={formData.password ?? ''}
                                    onChange={handleChange}
                                    className={`form-input ${allErrors.password ? 'error' : ''}`}
                                    placeholder="Enter password"
                                    disabled={isSubmitting}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(v => !v)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    <span className="material-icons" aria-hidden="true">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                            {formData.password && (
                                <div className="password-strength">
                                    <div className="strength-meter">
                                        <div
                                            className="strength-meter-fill"
                                            style={{
                                                width: `${(passwordStrength.score / 5) * 100}%`,
                                                backgroundColor: strengthColor,
                                            }}
                                        />
                                    </div>
                                    <span className="strength-label" style={{ color: strengthColor }}>
                                        {strengthLabel}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {formData.passwordMethod === 'auto' && (
                        <div className="auto-password-section">
                            <div className="generated-password">
                                {/* read-only display — no id/name needed, not a real form field */}
                                <input
                                    type={showGenPassword ? 'text' : 'password'}
                                    value={generatedPassword}
                                    readOnly
                                    className="form-input"
                                    aria-label="Generated password"
                                    autoComplete="off"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowGenPassword(v => !v)}
                                    aria-label={showGenPassword ? 'Hide generated password' : 'Show generated password'}
                                >
                                    <span className="material-icons" aria-hidden="true">
                                        {showGenPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    className="refresh-password"
                                    onClick={handleNewPassword}
                                    title="Generate new password"
                                    aria-label="Generate new password"
                                >
                                    <span className="material-icons" aria-hidden="true">refresh</span>
                                </button>
                            </div>
                            <small className="form-hint">
                                Copy this password — it won't be shown again.
                            </small>
                        </div>
                    )}

                    {allErrors.password && <span className="error-text">{allErrors.password}</span>}
                </div>
            )}

            {/* ── Role ── */}
            <div className="form-group">
                <label htmlFor="uf-role" className="form-label">
                    Role <span className="required-star">*</span>
                </label>
                <select
                    id="uf-role"
                    name="role"
                    autoComplete="off"
                    value={formData.role}
                    onChange={handleChange}
                    className={`form-select ${allErrors.role ? 'error' : ''}`}
                    disabled={isSubmitting}
                >
                    {ROLES.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                </select>
                {allErrors.role && <span className="error-text">{allErrors.role}</span>}
            </div>

            {/* ── Location Access ── */}
            <div className="form-section">
                <h4 className="form-section-title">Location Access</h4>
                <LocationSelector
                    selectedLocations={formData.assignedHubIds ?? []}
                    onChange={ids => setFormData(prev => ({ ...prev, assignedHubIds: ids }))}
                    disabled={isSubmitting}
                />
                {allErrors.assignedHubIds && (
                    <span className="error-text">{allErrors.assignedHubIds}</span>
                )}
            </div>

            {/* ── Status ── */}
            <div className="form-group">
                <label htmlFor="uf-status" className="form-label">
                    Status <span className="required-star">*</span>
                </label>
                <select
                    id="uf-status"
                    name="status"
                    autoComplete="off"
                    value={formData.status}
                    onChange={handleChange}
                    className={`form-select ${allErrors.status ? 'error' : ''}`}
                    disabled={isSubmitting}
                >
                    {STATUSES.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                </select>
                {allErrors.status && <span className="error-text">{allErrors.status}</span>}
            </div>

            {/* ── Actions ── */}
            <div className="form-actions">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving…' : title}
                </Button>
            </div>
        </form>
    );
};