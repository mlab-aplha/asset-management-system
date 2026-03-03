import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import './user-form.css';

interface UserFormProps {
    initialData?: {
        displayName: string;
        email: string;
        role: string;
        department: string;
        status: string;
    };
    onSubmit: (data: any) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
    title?: string;
    errors?: Record<string, string>;
}

export const UserForm: React.FC<UserFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    isSubmitting = false,
    title = 'User Information',
    errors = {}
}) => {
    const [formData, setFormData] = useState({
        displayName: initialData?.displayName || '',
        email: initialData?.email || '',
        role: initialData?.role || 'user',
        department: initialData?.department || '',
        status: initialData?.status || 'active'
    });

    // Password generator states - only for new users
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Generate password for new users
    const generatePassword = () => {
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const special = '!@#$%^&*';
        
        let password = '';
        
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += special[Math.floor(Math.random() * special.length)];
        
        const allChars = uppercase + lowercase + numbers + special;
        for (let i = password.length; i < 12; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }
        
        password = password.split('').sort(() => 0.5 - Math.random()).join('');
        setGeneratedPassword(password);
    };

    // Generate password on mount for new users
    useEffect(() => {
        if (!initialData) {
            generatePassword();
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Include password only for new users
        const submitData = !initialData 
            ? { ...formData, password: generatedPassword }
            : formData;
        
        onSubmit(submitData);
    };

    return (
        <Card className="user-form-card">
            <form onSubmit={handleSubmit} className="user-form">
                <h2 className="form-title">{title}</h2>
                
                {errors.general && (
                    <div className="error-message">{errors.general}</div>
                )}

                <div className="form-grid">
                    {/* Display Name */}
                    <div className="form-group">
                        <label htmlFor="displayName">
                            Full Name <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="displayName"
                            name="displayName"
                            value={formData.displayName}
                            onChange={handleChange}
                            required
                            className={errors.displayName ? 'error' : ''}
                        />
                        {errors.displayName && (
                            <span className="field-error">{errors.displayName}</span>
                        )}
                    </div>

                    {/* Email */}
                    <div className="form-group">
                        <label htmlFor="email">
                            Email Address <span className="required">*</span>
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className={errors.email ? 'error' : ''}
                            placeholder="user@mlab.co.za"
                        />
                        {errors.email && (
                            <span className="field-error">{errors.email}</span>
                        )}
                        <small className="field-hint">Must be @mlab.co.za or @mlab.org.za</small>
                    </div>

                    {/* Role */}
                    <div className="form-group">
                        <label htmlFor="role">
                            Role <span className="required">*</span>
                        </label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                            className={errors.role ? 'error' : ''}
                        >
                            <option value="user">User</option>
                            <option value="facilitator">Facilitator</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                        </select>
                        {errors.role && (
                            <span className="field-error">{errors.role}</span>
                        )}
                    </div>

                    {/* Department */}
                    <div className="form-group">
                        <label htmlFor="department">
                            Department
                        </label>
                        <select
                            id="department"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                        >
                            <option value="">Select department</option>
                            <option value="Training">Training</option>
                            <option value="IT">IT</option>
                            <option value="Finance">Finance</option>
                            <option value="Operations">Operations</option>
                            <option value="Management">Management</option>
                        </select>
                    </div>

                    {/* Status */}
                    <div className="form-group">
                        <label htmlFor="status">
                            Status
                        </label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    {/* PASSWORD GENERATOR - Only for new users */}
                    {!initialData && (
                        <div className="form-group full-width password-section">
                            <label>Generated Password</label>
                            <div className="password-container">
                                <div className="password-input-wrapper">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={generatedPassword}
                                        readOnly
                                        className="password-input"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="password-toggle"
                                    >
                                        {showPassword ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                </div>
                                <div className="password-actions">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={generatePassword}
                                    >
                                        Generate New
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            navigator.clipboard.writeText(generatedPassword);
                                            alert('Password copied to clipboard!');
                                        }}
                                    >
                                        Copy
                                    </Button>
                                </div>
                            </div>
                            <small className="password-hint">
                                Password auto-generated. Save it to share with the user.
                            </small>
                        </div>
                    )}
                </div>

                {/* Form Actions */}
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
                        {isSubmitting ? 'Saving...' : (initialData ? 'Update User' : 'Create User')}
                    </Button>
                </div>
            </form>
        </Card>
    );
};

export default UserForm;
