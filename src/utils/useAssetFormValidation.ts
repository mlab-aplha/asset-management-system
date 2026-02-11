// src/hooks/useAssetFormValidation.ts - Updated
import { AssetFormData, ValidationResult } from '../core/types/AssetFormTypes';

export const useAssetFormValidation = () => {
    const validateAssetForm = (formData: AssetFormData): ValidationResult => {
        const errors: Record<string, string> = {};

        // Required fields
        if (!formData.name?.trim()) {
            errors.name = 'Asset name is required';
        }

        if (!formData.assetId?.trim()) {
            errors.assetId = 'Asset ID is required';
        }

        if (!formData.type?.trim()) {
            errors.type = 'Asset type is required';
        }

        if (!formData.category?.trim()) {
            errors.category = 'Category is required';
        }

        if (!formData.status) {
            errors.status = 'Status is required';
        }

        if (!formData.condition) {
            errors.condition = 'Condition is required';
        }

        if (!formData.currentLocationId?.trim()) {
            errors.currentLocationId = 'Location is required';
        }

        // Numeric validations
        if (formData.purchasePrice !== undefined && formData.purchasePrice < 0) {
            errors.purchasePrice = 'Purchase price cannot be negative';
        }

        if (formData.value !== undefined && formData.value < 0) {
            errors.value = 'Value cannot be negative';
        }

        // Date validations
        if (formData.purchaseDate && new Date(formData.purchaseDate) > new Date()) {
            errors.purchaseDate = 'Purchase date cannot be in the future';
        }

        if (formData.assignmentDate && new Date(formData.assignmentDate) > new Date()) {
            errors.assignmentDate = 'Assignment date cannot be in the future';
        }

        // Simple Asset ID validation
        if (formData.assetId && formData.assetId.length < 3) {
            errors.assetId = 'Asset ID is too short';
        }

        // Serial number validation
        if (formData.serialNumber && formData.serialNumber.length < 3) {
            errors.serialNumber = 'Serial number is too short';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    };

    const validateRequiredFields = (formData: AssetFormData): string[] => {
        const missingFields: string[] = [];

        if (!formData.name?.trim()) missingFields.push('Asset Name');
        if (!formData.assetId?.trim()) missingFields.push('Asset ID');
        if (!formData.type?.trim()) missingFields.push('Type');
        if (!formData.category?.trim()) missingFields.push('Category');
        if (!formData.status) missingFields.push('Status');
        if (!formData.condition) missingFields.push('Condition');
        if (!formData.currentLocationId?.trim()) missingFields.push('Location');

        return missingFields;
    };

    return {
        validateAssetForm,
        validateRequiredFields
    };
};