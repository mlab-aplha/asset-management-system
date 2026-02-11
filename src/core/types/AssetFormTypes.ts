// src/core/types/AssetFormTypes.ts
import { AssetStatus, AssetCondition } from '../entities/Asset';
export type AssetFormData = {
    name: string;
    assetId: string;
    type: string;
    category: string;
    status: AssetStatus;
    condition: AssetCondition;
    currentLocationId: string;
    description?: string;
    serialNumber?: string;
    manufacturer?: string;
    model?: string;
    purchaseDate?: Date;
    purchasePrice?: number;
    value?: number;
    assignedTo?: string;
    assignmentDate?: Date;
    notes?: string;
    tags?: string[];
};

export interface AssetFormProps {
    asset?: AssetFormData;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: AssetFormData) => Promise<void>;
    mode: 'add' | 'edit';
    existingAssets?: Array<{ assetId?: string; currentLocationId?: string }>; // Add this line
}

export interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
}

export const STATUS_OPTIONS: Array<{ value: AssetStatus; label: string; color: string }> = [
    { value: 'available', label: 'Available', color: '#10b981' },
    { value: 'assigned', label: 'Assigned', color: '#3b82f6' },
    { value: 'maintenance', label: 'Maintenance', color: '#f59e0b' },
    { value: 'retired', label: 'Retired', color: '#ef4444' },
];
export const CONDITION_OPTIONS: Array<{ value: AssetCondition; label: string; color: string }> = [
    { value: 'excellent', label: 'Excellent', color: '#10b981' },
    { value: 'good', label: 'Good', color: '#3b82f6' },
    { value: 'fair', label: 'Fair', color: '#f59e0b' },
    { value: 'poor', label: 'Poor', color: '#ef4444' },
];
export const LOCATION_CODES: Record<string, string> = {
    'pretoria': 'PR',
    'polokwane': 'PL',
    'tshwane': 'TS',
    'tembisa': 'TB',
    'soweto': 'SW',
    'imbali': 'IM',
    'kimberly': 'KM',
    'upington': 'UP',
    'johannesburg': 'JB',
    'cape town': 'CT',
    'durban': 'DB',
    'bloemfontein': 'BF'
} as const;

// Helper function to generate asset ID
export const generateAssetId = (
    locationName: string,
    existingAssets: Array<{ assetId?: string }> = []
): string => {
    if (!locationName) return '';

    // Normalize location name
    const normalizedLocation = locationName.toLowerCase().trim();

    // Find matching location code
    let locationCode = '';
    for (const [key, code] of Object.entries(LOCATION_CODES)) {
        if (normalizedLocation.includes(key.toLowerCase()) ||
            normalizedLocation === key.toLowerCase()) {
            locationCode = code;
            break;
        }
    }

    if (!locationCode) {
        // If no specific code found, use first 2 letters of location
        locationCode = locationName.substring(0, 2).toUpperCase();
    }

    // Filter existing assets for this location
    const locationAssets = existingAssets.filter(a => {
        if (!a.assetId) return false;
        return a.assetId.startsWith(`MLAB-${locationCode}-`);
    });

    let maxNumber = 0;
    locationAssets.forEach(asset => {
        if (asset.assetId) {
            const match = asset.assetId.match(/MLAB-\w+-(\d+)/);
            if (match) {
                const num = parseInt(match[1], 10);
                if (num > maxNumber) maxNumber = num;
            }
        }
    });

    const nextNumber = (maxNumber + 1).toString().padStart(3, '0');
    return `MLAB-${locationCode}-${nextNumber}`;
};