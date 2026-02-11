import { LocationFormData, BulkImportLocation } from '../core/entities/Location';

export interface ValidationError {
    field: string;
    message: string;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

export interface BulkImportResult {
    isValid: boolean;
    errors: string[];
    locations: BulkImportLocation[];
}

export class LocationValidation {
    // Validate single location form
    static validateLocationForm(formData: LocationFormData): ValidationResult {
        const errors: ValidationError[] = [];

        // Required fields
        if (!formData.name.trim()) {
            errors.push({ field: 'name', message: 'Location name is required' });
        }

        if (!formData.address?.trim()) {
            errors.push({ field: 'address', message: 'Address is required' });
        }

        if (!formData.contactName?.trim()) {
            errors.push({ field: 'contactName', message: 'Contact name is required' });
        }

        // Email validation
        if (!formData.contactEmail?.trim()) {
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

        // Region validation (optional but recommended)
        if (!formData.region?.trim()) {
            errors.push({ field: 'region', message: 'Region is recommended' });
        }

        // Number validations
        if (formData.totalAssets !== undefined && formData.totalAssets < 0) {
            errors.push({ field: 'totalAssets', message: 'Total assets cannot be negative' });
        }

        if (formData.capacity !== undefined && formData.capacity < 0) {
            errors.push({ field: 'capacity', message: 'Capacity cannot be negative' });
        }

        // Phone validation (optional)
        if (formData.contactPhone && !this.isValidPhone(formData.contactPhone)) {
            errors.push({ field: 'contactPhone', message: 'Invalid phone number format' });
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Validate bulk import CSV data
    static validateBulkImport(lines: string[]): BulkImportResult {
        const errors: string[] = [];
        const locations: BulkImportLocation[] = [];

        lines.forEach((line, index) => {
            const lineNumber = index + 1;
            const parts = line.split(',').map(part => part.trim());

            // Check minimum required fields (name, address, type, status, totalAssets, region)
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

            if (!region) {
                errors.push(`Line ${lineNumber}: Region is required`);
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
            const normalizedType = type.toLowerCase();
            if (!validTypes.includes(normalizedType)) {
                errors.push(`Line ${lineNumber}: Invalid type "${type}". Must be one of: ${validTypes.join(', ')}`);
            }

            // Validate status
            const validStatuses = ['active', 'maintenance', 'offline'];
            const normalizedStatus = status.toLowerCase();
            if (!validStatuses.includes(normalizedStatus)) {
                errors.push(`Line ${lineNumber}: Invalid status "${status}". Must be one of: ${validStatuses.join(', ')}`);
            }

            // Validate total assets
            const assetsNum = parseInt(totalAssets);
            if (isNaN(assetsNum) || assetsNum < 0) {
                errors.push(`Line ${lineNumber}: Invalid total assets "${totalAssets}". Must be a positive number`);
            }

            // Validate phone (optional)
            if (contactPhone && !this.isValidPhone(contactPhone)) {
                errors.push(`Line ${lineNumber}: Invalid phone number format`);
            }

            // Add to locations if no errors for this line
            if (errors.filter(err => err.startsWith(`Line ${lineNumber}:`)).length === 0) {
                locations.push({
                    name,
                    address,
                    type: normalizedType,
                    status: normalizedStatus,
                    totalAssets: assetsNum.toString(),
                    region,
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

    // Validate CSV row (individual row validation)
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
    static isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Phone number validation (optional)
    static isValidPhone(phone: string): boolean {
        if (!phone.trim()) return true; // Phone is optional

        // Remove spaces and dashes
        const cleanedPhone = phone.replace(/[\s-]+/g, '');

        // South African phone number validation (optional country code + 9 digits)
        const phoneRegex = /^(\+27|0)?[1-9]\d{8}$/;
        return phoneRegex.test(cleanedPhone);
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
    static getValidTypes(): Array<{ value: string; label: string }> {
        return [
            { value: 'hq', label: 'Headquarters (HQ)' },
            { value: 'hub', label: 'Regional Hub' },
            { value: 'branch', label: 'Branch Office' },
            { value: 'site', label: 'Site/Lab' }
        ];
    }

    // Helper to get valid statuses
    static getValidStatuses(): Array<{ value: string; label: string }> {
        return [
            { value: 'active', label: 'Active' },
            { value: 'maintenance', label: 'Maintenance' },
            { value: 'offline', label: 'Offline' }
        ];
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

    // Get region display name
    static getRegionDisplayName(region: string): string {
        const regionMap: Record<string, string> = {
            'Gauteng': 'Gauteng',
            'Limpopo': 'Limpopo',
            'KwaZulu-Natal': 'KwaZulu-Natal',
            'Western Cape': 'Western Cape',
            'Eastern Cape': 'Eastern Cape',
            'Northern Cape': 'Northern Cape',
            'Free State': 'Free State',
            'North West': 'North West',
            'Mpumalanga': 'Mpumalanga'
        };

        return regionMap[region] || region;
    }

    // Get type display name
    static getTypeDisplayName(type: string): string {
        const typeMap: Record<string, string> = {
            'hq': 'Headquarters',
            'hub': 'Regional Hub',
            'branch': 'Branch Office',
            'site': 'Site/Lab'
        };

        return typeMap[type] || type;
    }

    // Get status display name
    static getStatusDisplayName(status: string): string {
        const statusMap: Record<string, string> = {
            'active': 'Active',
            'maintenance': 'Maintenance',
            'offline': 'Offline'
        };

        return statusMap[status] || status;
    }

    // Generate sample CSV template
    static generateSampleCSV(): string {
        return `name,address,type,status,totalAssets,region,contactName,contactEmail,contactPhone,description
"Tshwane HQ","U8, Enterprise Building, The Innovation Hub, Mark Shuttleworth Street, Pretoria, 0087",hq,active,245,Gauteng,"John Smith",john.smith@mlab.co.za,+27 012 844 0240,"mLab Tshwane is a proud partnership between mLab, The Innovation Hub and The Department of Science and Innovation."
"Polokwane Hub","Enterprise Building, Polokwane Central, Limpopo",hub,active,187,Limpopo,"Sarah Johnson",sarah.j@mlab.co.za,+27 015 123 4567,"mLab Limpopo serves the Limpopo region with digital innovation."
"Soweto Branch","456 Vilakazi Street, Orlando West, Soweto",branch,maintenance,92,Gauteng,"Mike Brown",mike.b@mlab.co.za,+27 011 234 5678,"Soweto branch focuses on youth entrepreneurship."`;
    }

    // Validate import headers
    static validateCSVHeaders(headers: string[]): boolean {
        const requiredHeaders = ['name', 'address', 'type', 'status', 'totalAssets', 'region'];
        const normalizedHeaders = headers.map(h => h.toLowerCase().trim());

        return requiredHeaders.every(header =>
            normalizedHeaders.includes(header)
        );
    }
}