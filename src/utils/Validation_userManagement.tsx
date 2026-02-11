import { UserFormData } from '../core/entities/User';

export interface ValidationError {
    field: string;
    message: string;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

export class UserValidation {
    // Validate user form
    static validateUserForm(formData: UserFormData): ValidationResult {
        const errors: ValidationError[] = [];

        // Required fields
        if (!formData.displayName.trim()) {
            errors.push({ field: 'displayName', message: 'Display name is required' });
        } else if (formData.displayName.trim().length < 2) {
            errors.push({ field: 'displayName', message: 'Display name must be at least 2 characters' });
        }

        if (!formData.email.trim()) {
            errors.push({ field: 'email', message: 'Email is required' });
        } else if (!this.isValidEmail(formData.email)) {
            errors.push({ field: 'email', message: 'Email is invalid' });
        }

        if (!formData.department.trim()) {
            errors.push({ field: 'department', message: 'Department is required' });
        }

        // Role validation
        const validRoles = ['admin', 'facilitator'];
        if (!validRoles.includes(formData.role)) {
            errors.push({ field: 'role', message: 'Invalid role' });
        }

        // Status validation
        if (formData.status) {
            const validStatuses = ['active', 'inactive'];
            if (!validStatuses.includes(formData.status)) {
                errors.push({ field: 'status', message: 'Invalid status' });
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Validate email
    static isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Convert form errors to Record<string, string> format
    static formatFormErrors(errors: ValidationError[]): Record<string, string> {
        const formattedErrors: Record<string, string> = {};
        errors.forEach(error => {
            formattedErrors[error.field] = error.message;
        });
        return formattedErrors;
    }

    // Helper to get valid roles with display labels
    static getValidRoles(): Array<{ value: string; label: string }> {
        return [
            { value: 'facilitator', label: 'Facilitator' },
            { value: 'admin', label: 'Administrator' }
        ];
    }

    // Helper to get valid statuses with display labels
    static getValidStatuses(): Array<{ value: string; label: string }> {
        return [
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' }
        ];
    }

    // Helper to get common departments
    static getCommonDepartments(): string[] {
        return [
            'IT',
            'Operations',
            'Sales',
            'Marketing',
            'Finance',
            'HR',
            'Support',
            'Management',
            'Development',
            'Research'
        ];
    }

    // Helper to get role display name
    static getRoleDisplayName(role: string): string {
        const roleMap: Record<string, string> = {
            'admin': 'Administrator',
            'facilitator': 'Facilitator'
        };
        return roleMap[role] || role.charAt(0).toUpperCase() + role.slice(1);
    }

    // Helper to get status display name
    static getStatusDisplayName(status: string): string {
        const statusMap: Record<string, string> = {
            'active': 'Active',
            'inactive': 'Inactive'
        };
        return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
    }
}