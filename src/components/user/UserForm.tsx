import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { UserFormData } from '../../core/entities/User';
import { UserValidation } from '../../utils/Validation_userManagement';

interface UserFormProps {
    initialData?: Partial<UserFormData>;
    onSubmit: (data: UserFormData) => Promise<{ success: boolean; errors?: Record<string, string> }>;
    onCancel: () => void;
    isSubmitting: boolean;
    title: string;
}

export const UserForm: React.FC<UserFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    isSubmitting,
    title
}) => {
    const [formData, setFormData] = useState<UserFormData>({
        displayName: '',
        email: '',
        role: 'facilitator',
        department: '',
        status: 'active',
        ...initialData
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Get validation data
    const roles = UserValidation.getValidRoles();
    const statuses = UserValidation.getValidStatuses();
    const departments = UserValidation.getCommonDepartments();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await onSubmit(formData);

        if (!result.success && result.errors) {
            setErrors(result.errors);
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
                    className="form-input"
                    placeholder="Enter full name"
                    disabled={isSubmitting}
                />
                {errors.displayName && (
                    <span className="error-text">{errors.displayName}</span>
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
                    className="form-input"
                    placeholder="user@example.com"
                    disabled={isSubmitting}
                />
                {errors.email && (
                    <span className="error-text">{errors.email}</span>
                )}
            </div>

            <div className="form-group">
                <label className="form-label">
                    Role <span className="required-star">*</span>
                </label>
                <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="form-select"
                    disabled={isSubmitting}
                >
                    {roles.map((role) => (
                        <option key={role.value} value={role.value}>
                            {role.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label className="form-label">
                    Department <span className="required-star">*</span>
                </label>
                <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="form-select"
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
                        value={formData.department}
                        onChange={handleInputChange}
                        className="form-input mt-2"
                        placeholder="Enter custom department"
                        disabled={isSubmitting}
                    />
                )}
                {errors.department && (
                    <span className="error-text">{errors.department}</span>
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
                    className="form-select"
                    disabled={isSubmitting}
                >
                    {statuses.map((status) => (
                        <option key={status.value} value={status.value}>
                            {status.label}
                        </option>
                    ))}
                </select>
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