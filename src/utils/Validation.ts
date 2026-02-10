// Location interfaces
export interface Location {
    id: string;
    name: string;
    address: string;
    type: 'hq' | 'hub' | 'branch' | 'site';
    status: 'active' | 'maintenance' | 'offline';
    totalAssets: number;
    primaryContact: {
        name: string;
        email: string;
        phone?: string;
    };
    description?: string;
    region: string;
    capacity?: number;
    lastAudit?: string;
}

export interface LocationFormData {
    name: string;
    address: string;
    type: 'hq' | 'hub' | 'branch' | 'site';
    status: 'active' | 'maintenance' | 'offline';
    totalAssets: number;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    description: string;
    region: string;
    capacity?: number;
}

export interface ValidationError {
    field: string;
    message: string;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

export interface BulkImportLocation {
    name: string;
    address: string;
    type: string;
    status: string;
    totalAssets: string;
    region: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    description: string;
}

export class LocationValidation {
    // Validate single location form
    static validateLocationForm(formData: LocationFormData): ValidationResult {
        const errors: ValidationError[] = [];

        // Required fields
        if (!formData.name.trim()) {
            errors.push({ field: 'name', message: 'Location name is required' });
        }

        if (!formData.address.trim()) {
            errors.push({ field: 'address', message: 'Address is required' });
        }

        if (!formData.contactName.trim()) {
            errors.push({ field: 'contactName', message: 'Contact name is required' });
        }

        // Email validation
        if (!formData.contactEmail.trim()) {
            errors.push({ field: 'contactEmail', message: 'Contact email is required' });
        } else if (!this.isValidEmail(formData.contactEmail)) {
            errors.push({ field: 'contactEmail', message: 'Invalid email format' });
        }

        // Type validation
        const validTypes = ['hq', 'hub', 'branch', 'site'];
        if (!validTypes.includes(formData.type)) {
            errors.push({ field: 'type', message: 'Invalid location type' });
        }

        // Status validation
        const validStatuses = ['active', 'maintenance', 'offline'];
        if (!validStatuses.includes(formData.status)) {
            errors.push({ field: 'status', message: 'Invalid status' });
        }

        // Number validations
        if (formData.totalAssets < 0) {
            errors.push({ field: 'totalAssets', message: 'Total assets cannot be negative' });
        }

        if (formData.capacity !== undefined && formData.capacity < 0) {
            errors.push({ field: 'capacity', message: 'Capacity cannot be negative' });
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Validate bulk import CSV data
    static validateBulkImport(lines: string[]): { isValid: boolean; errors: string[]; locations: BulkImportLocation[] } {
        const errors: string[] = [];
        const locations: BulkImportLocation[] = [];

        lines.forEach((line, index) => {
            const lineNumber = index + 1;
            const parts = line.split(',').map(part => part.trim());

            // Check minimum required fields
            if (parts.length < 6) {
                errors.push(`Line ${lineNumber}: Insufficient data. Expected at least 6 fields`);
                return;
            }

            const [
                name, address, type, status, totalAssets, region,
                contactName = '', contactEmail = '', contactPhone = '', description = ''
            ] = parts;

            // Validate required fields
            if (!name) {
                errors.push(`Line ${lineNumber}: Name is required`);
            }

            if (!address) {
                errors.push(`Line ${lineNumber}: Address is required`);
            }

            if (!contactName) {
                errors.push(`Line ${lineNumber}: Contact name is required`);
            }

            // Validate email
            if (contactEmail && !this.isValidEmail(contactEmail)) {
                errors.push(`Line ${lineNumber}: Invalid email format`);
            }

            // Validate type
            const validTypes = ['hq', 'hub', 'branch', 'site'];
            if (!validTypes.includes(type.toLowerCase())) {
                errors.push(`Line ${lineNumber}: Invalid type "${type}". Must be one of: ${validTypes.join(', ')}`);
            }

            // Validate status
            const validStatuses = ['active', 'maintenance', 'offline'];
            if (!validStatuses.includes(status.toLowerCase())) {
                errors.push(`Line ${lineNumber}: Invalid status "${status}". Must be one of: ${validStatuses.join(', ')}`);
            }

            // Validate total assets
            const assetsNum = parseInt(totalAssets);
            if (isNaN(assetsNum) || assetsNum < 0) {
                errors.push(`Line ${lineNumber}: Invalid total assets "${totalAssets}". Must be a positive number`);
            }

            // Add to locations if no errors for this line
            if (errors.filter(err => err.startsWith(`Line ${lineNumber}:`)).length === 0) {
                locations.push({
                    name,
                    address,
                    type: type.toLowerCase(),
                    status: status.toLowerCase(),
                    totalAssets: assetsNum.toString(),
                    region: region || 'Unknown',
                    contactName: contactName || 'Unknown',
                    contactEmail: contactEmail || 'unknown@mlab.co.za',
                    contactPhone,
                    description
                });
            }
        });

        return {
            isValid: errors.length === 0,
            errors,
            locations
        };
    }

    // Alternative: Remove the validateCSVRow method completely since it's redundant
    // OR keep it and add region validation:

    // Option 1: Remove the method (simpler)
    // static validateCSVRow(row: string[], lineNumber: number): ValidationResult {
    //     // This method is redundant with validateBulkImport
    //     return { isValid: true, errors: [] };
    // }

    // Option 2: Fix it by using the region parameter
    static validateCSVRow(row: string[], lineNumber: number): ValidationResult {
        const errors: ValidationError[] = [];

        if (row.length < 6) {
            errors.push({
                field: 'csv',
                message: `Line ${lineNumber}: Insufficient data. Expected at least 6 fields`
            });
            return { isValid: false, errors };
        }

        const [name, address, type, status, totalAssets, region] = row;

        // Validate required fields
        if (!name) {
            errors.push({
                field: 'name',
                message: `Line ${lineNumber}: Name is required`
            });
        }

        if (!address) {
            errors.push({
                field: 'address',
                message: `Line ${lineNumber}: Address is required`
            });
        }

        // Validate region
        if (!region) {
            errors.push({
                field: 'region',
                message: `Line ${lineNumber}: Region is required`
            });
        }

        // Validate type
        const validTypes = ['hq', 'hub', 'branch', 'site'];
        if (!validTypes.includes(type.toLowerCase())) {
            errors.push({
                field: 'type',
                message: `Line ${lineNumber}: Invalid type "${type}"`
            });
        }

        // Validate status
        const validStatuses = ['active', 'maintenance', 'offline'];
        if (!validStatuses.includes(status.toLowerCase())) {
            errors.push({
                field: 'status',
                message: `Line ${lineNumber}: Invalid status "${status}"`
            });
        }

        // Validate total assets
        const assetsNum = parseInt(totalAssets);
        if (isNaN(assetsNum) || assetsNum < 0) {
            errors.push({
                field: 'totalAssets',
                message: `Line ${lineNumber}: Invalid total assets "${totalAssets}"`
            });
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Email validation helper
    private static isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Phone number validation (optional)
    static isValidPhone(phone: string): boolean {
        if (!phone) return true; // Phone is optional
        const phoneRegex = /^\+?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/\s+/g, ''));
    }

    // Convert form errors to Record<string, string> format for React forms
    static formatFormErrors(errors: ValidationError[]): Record<string, string> {
        const formattedErrors: Record<string, string> = {};
        errors.forEach(error => {
            formattedErrors[error.field] = error.message;
        });
        return formattedErrors;
    }

    // Helper to get valid location types
    static getValidTypes(): string[] {
        return ['hq', 'hub', 'branch', 'site'];
    }

    // Helper to get valid statuses
    static getValidStatuses(): string[] {
        return ['active', 'maintenance', 'offline'];
    }

    // Helper to get South African regions
    static getSACountryRegions(): string[] {
        return [
            'Gauteng',
            'Limpopo',
            'KwaZulu-Natal',
            'Western Cape',
            'Eastern Cape',
            'Northern Cape',
            'Free State',
            'North West',
            'Mpumalanga'
        ];
    }
}

//
// User interfaces
export interface User {
    id: string;
    displayName: string;
    email: string;
    role: 'admin' | 'facilitator';
    department?: string;
    status: 'active' | 'inactive';
}

export interface UserFormData {
    displayName: string;
    email: string;
    role: 'admin' | 'facilitator';
    department: string;
    status: 'active' | 'inactive';
}

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
        const validStatuses = ['active', 'inactive'];
        if (!validStatuses.includes(formData.status)) {
            errors.push({ field: 'status', message: 'Invalid status' });
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Validate email
    private static isValidEmail(email: string): boolean {
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

    // Helper to get valid roles
    static getValidRoles(): string[] {
        return ['admin', 'facilitator'];
    }

    // Helper to get valid statuses
    static getValidStatuses(): string[] {
        return ['active', 'inactive'];
    }

    // Helper to get role display name
    static getRoleDisplayName(role: string): string {
        switch (role) {
            case 'admin': return 'Admin';
            case 'facilitator': return 'Facilitator';
            default: return role.charAt(0).toUpperCase() + role.slice(1);
        }
    }
}