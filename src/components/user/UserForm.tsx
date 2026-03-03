import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { UserFormData } from '../../core/entities/User';
import { UserValidation } from '../../utils/Validation_userManagement';
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

export const UserForm: React.FC<UserFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    isSubmitting,
    title,
    errors: externalErrors
}) => {
    const [formData, setFormData] = useState<UserFormData>({
        displayName: '',
        email: '',
        role: 'facilitator',
        department: '',
        status: 'active',
        password: '',
        passwordMethod: 'manual',
        assignedHubIds: [], // Initialize empty array for locations
        ...initialData
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState<{
        score: number;
        feedback: string[];
    }>({ score: 0, feedback: [] });
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [showGeneratedPassword, setShowGeneratedPassword] = useState(false);

    // Determine if this is edit mode (no password field needed)
    const isEditMode = !!initialData?.displayName;

    // Merge external errors with internal errors
    const allErrors = { ...errors, ...externalErrors };

    // Get validation data
    const roles = UserValidation.getValidRoles();
    const statuses = UserValidation.getValidStatuses();
    const departments = UserValidation.getCommonDepartments();

    // Check password strength
    const checkPasswordStrength = (password: string) => {
        const validation = PasswordUtils.validatePassword(password);
        const commonCheck = PasswordUtils.isCommonPassword(password);

        let score = 0;
        const feedback: string[] = [];

        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[!@#$%^&*]/.test(password)) score++;

        if (commonCheck) {
            score = Math.min(score, 2);
            feedback.push('This password is too common');
        }

        feedback.push(...validation.errors);

        setPasswordStrength({ score, feedback });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'departmentOther') {
            setFormData(prev => ({
                ...prev,
                department: value
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        // Check password strength if password field changes
        if (name === 'password') {
            checkPasswordStrength(value);
        }

        // Clear error for this field when user starts typing
        if (allErrors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handlePasswordMethodChange = (method: 'manual' | 'auto') => {
        setFormData(prev => ({
            ...prev,
            passwordMethod: method,
            password: method === 'auto' ? generatedPassword : prev.password
        }));

        if (method === 'auto' && !generatedPassword) {
            const newPassword = PasswordUtils.generateSecurePassword();
            setGeneratedPassword(newPassword);
            setFormData(prev => ({
                ...prev,
                password: newPassword
            }));
            checkPasswordStrength(newPassword);
        }
    };

    const handleGenerateNewPassword = () => {
        const newPassword = PasswordUtils.generateSecurePassword();
        setGeneratedPassword(newPassword);
        setFormData(prev => ({
            ...prev,
            password: newPassword
        }));
        checkPasswordStrength(newPassword);
        setShowGeneratedPassword(true);
    };

    const handleLocationChange = (locationIds: string[]) => {
        setFormData(prev => ({
            ...prev,
            assignedHubIds: locationIds
        }));

        // Clear any location errors
        if (allErrors.assignedHubIds) {
            setErrors(prev => ({
                ...prev,
                assignedHubIds: ''
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // For edit mode, remove password from form data
        const submitData = isEditMode
            ? { ...formData, password: undefined, passwordMethod: undefined }
            : formData;

        const result = await onSubmit(submitData);

        if (!result.success && result.errors) {
            setErrors(result.errors);
        }
    };

    // Get password strength color
    const getStrengthColor = () => {
        switch (passwordStrength.score) {
            case 0: return '#ff4444';
            case 1: return '#ff7744';
            case 2: return '#ffaa44';
            case 3: return '#88cc44';
            case 4: return '#44aa44';
            case 5: return '#228822';
            default: return '#ddd';
        }
    };

    const getStrengthLabel = () => {
        switch (passwordStrength.score) {
            case 0: return 'Very Weak';
            case 1: return 'Weak';
            case 2: return 'Fair';
            case 3: return 'Good';
            case 4: return 'Strong';
            case 5: return 'Very Strong';
            default: return '';
        }
    };

    return (
        <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
                <label className="form-label">
                    Display Name <span className="required-star">*</span>
                </label>
                <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    className={`form-input ${allErrors.displayName ? 'error' : ''}`}
                    placeholder="Enter full name"
                    disabled={isSubmitting}
                />
                {allErrors.displayName && (
                    <span className="error-text">{allErrors.displayName}</span>
                )}
            </div>

            <div className="form-group">
                <label className="form-label">
                    Email Address <span className="required-star">*</span>
                </label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`form-input ${allErrors.email ? 'error' : ''}`}
                    placeholder="user@example.com"
                    disabled={isSubmitting || isEditMode}
                />
                {allErrors.email && (
                    <span className="error-text">{allErrors.email}</span>
                )}
                {isEditMode && (
                    <small className="form-hint">Email cannot be changed after creation</small>
                )}
            </div>

            {/* Password Section - Only show for new users */}
            {!isEditMode && (
                <div className="form-section">
                    <h4 className="form-section-title">Password</h4>

                    <div className="password-method-selector">
                        <Button
                            type="button"
                            variant={formData.passwordMethod === 'manual' ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => handlePasswordMethodChange('manual')}
                        >
                            Enter Password
                        </Button>
                        <Button
                            type="button"
                            variant={formData.passwordMethod === 'auto' ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => handlePasswordMethodChange('auto')}
                        >
                            Auto-generate
                        </Button>
                    </div>

                    {formData.passwordMethod === 'manual' && (
                        <div className="form-group">
                            <label className="form-label">
                                Password <span className="required-star">*</span>
                            </label>
                            <div className="password-input-container">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password || ''}
                                    onChange={handleInputChange}
                                    className={`form-input ${allErrors.password ? 'error' : ''}`}
                                    placeholder="Enter password"
                                    disabled={isSubmitting}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <span className="material-icons">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>

                            {/* Password Strength Meter */}
                            {formData.password && (
                                <div className="password-strength">
                                    <div className="strength-meter">
                                        <div
                                            className="strength-meter-fill"
                                            style={{
                                                width: `${(passwordStrength.score / 5) * 100}%`,
                                                backgroundColor: getStrengthColor()
                                            }}
                                        />
                                    </div>
                                    <span className="strength-label" style={{ color: getStrengthColor() }}>
                                        {getStrengthLabel()}
                                    </span>
                                    {passwordStrength.feedback.length > 0 && (
                                        <ul className="strength-feedback">
                                            {passwordStrength.feedback.map((msg, idx) => (
                                                <li key={idx}>{msg}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {formData.passwordMethod === 'auto' && (
                        <div className="auto-password-section">
                            <div className="generated-password">
                                <input
                                    type={showGeneratedPassword ? 'text' : 'password'}
                                    value={generatedPassword || PasswordUtils.generateSecurePassword()}
                                    readOnly
                                    className="form-input"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowGeneratedPassword(!showGeneratedPassword)}
                                >
                                    <span className="material-icons">
                                        {showGeneratedPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    className="refresh-password"
                                    onClick={handleGenerateNewPassword}
                                    title="Generate new password"
                                >
                                    <span className="material-icons">refresh</span>
                                </button>
                            </div>
                            <small className="form-hint">
                                Password will be shown once. Make sure to save it securely.
                            </small>
                            {passwordStrength.feedback.length > 0 && (
                                <ul className="strength-feedback">
                                    {passwordStrength.feedback.map((msg, idx) => (
                                        <li key={idx}>{msg}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    {allErrors.password && (
                        <span className="error-text">{allErrors.password}</span>
                    )}
                </div>
            )}

            <div className="form-group">
                <label className="form-label">
                    Role <span className="required-star">*</span>
                </label>
                <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className={`form-select ${allErrors.role ? 'error' : ''}`}
                    disabled={isSubmitting}
                >
                    {roles.map((role) => (
                        <option key={role.value} value={role.value}>
                            {role.label}
                        </option>
                    ))}
                </select>
                {allErrors.role && (
                    <span className="error-text">{allErrors.role}</span>
                )}
            </div>

            <div className="form-group">
                <label className="form-label">
                    Department <span className="required-star">*</span>
                </label>
                <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className={`form-select ${allErrors.department ? 'error' : ''}`}
                    disabled={isSubmitting}
                >
                    <option value="">Select department</option>
                    {departments.map((dept) => (
                        <option key={dept} value={dept}>
                            {dept}
                        </option>
                    ))}
                    <option value="Other">Other</option>
                </select>
                {formData.department === 'Other' && (
                    <input
                        type="text"
                        name="departmentOther"
                        value={formData.department === 'Other' ? '' : formData.department}
                        onChange={handleInputChange}
                        className={`form-input mt-2 ${allErrors.department ? 'error' : ''}`}
                        placeholder="Enter custom department"
                        disabled={isSubmitting}
                    />
                )}
                {allErrors.department && (
                    <span className="error-text">{allErrors.department}</span>
                )}
            </div>

            {/* Location Assignment Section */}
            <div className="form-section">
                <h4 className="form-section-title">Location Access</h4>

                <LocationSelector
                    selectedLocations={formData.assignedHubIds || []}
                    onChange={handleLocationChange}
                    disabled={isSubmitting}
                />

                {allErrors.assignedHubIds && (
                    <span className="error-text">{allErrors.assignedHubIds}</span>
                )}
            </div>

            <div className="form-group">
                <label className="form-label">
                    Status <span className="required-star">*</span>
                </label>
                <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className={`form-select ${allErrors.status ? 'error' : ''}`}
                    disabled={isSubmitting}
                >
                    {statuses.map((status) => (
                        <option key={status.value} value={status.value}>
                            {status.label}
                        </option>
                    ))}
                </select>
                {allErrors.status && (
                    <span className="error-text">{allErrors.status}</span>
                )}
            </div>

            <div className="form-actions">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Saving...' : title}
                </Button>
            </div>
        </form>
    );
};