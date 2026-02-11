import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '../../src/components/ui/Modal';
import { AssetFormData, AssetFormProps, generateAssetId } from '../core/types/AssetFormTypes';
import { useAssetFormValidation } from '../utils/useAssetFormValidation';
import './AssetForm.css';

const AssetFormModal: React.FC<AssetFormProps> = ({
    asset,
    isOpen,
    onClose,
    onSubmit,
    mode,
    existingAssets = []
}) => {
    const [formData, setFormData] = useState<AssetFormData>({
        name: '',
        assetId: '',
        type: '',
        category: '',
        status: 'available',
        condition: 'good',
        currentLocationId: '',
        description: '',
        serialNumber: '',
        manufacturer: '',
        model: '',
        purchaseDate: undefined,
        purchasePrice: undefined,
        value: undefined,
        assignedTo: '',
        assignmentDate: undefined,
        notes: '',
        tags: []
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { validateAssetForm } = useAssetFormValidation();

    // Initialize form with asset data when editing
    useEffect(() => {
        if (asset) {
            setFormData({
                name: asset.name || '',
                assetId: asset.assetId || '',
                type: asset.type || '',
                category: asset.category || '',
                status: asset.status || 'available',
                condition: asset.condition || 'good',
                currentLocationId: asset.currentLocationId || '',
                description: asset.description || '',
                serialNumber: asset.serialNumber || '',
                manufacturer: asset.manufacturer || '',
                model: asset.model || '',
                purchaseDate: asset.purchaseDate || undefined,
                purchasePrice: asset.purchasePrice || undefined,
                value: asset.value || undefined,
                assignedTo: asset.assignedTo || '',
                assignmentDate: asset.assignmentDate || undefined,
                notes: asset.notes || '',
                tags: asset.tags || []
            });
        } else {
            // Reset form for new asset
            setFormData({
                name: '',
                assetId: '',
                type: '',
                category: '',
                status: 'available',
                condition: 'good',
                currentLocationId: '',
                description: '',
                serialNumber: '',
                manufacturer: '',
                model: '',
                purchaseDate: undefined,
                purchasePrice: undefined,
                value: undefined,
                assignedTo: '',
                assignmentDate: undefined,
                notes: '',
                tags: []
            });
        }
        setErrors({});
    }, [asset, isOpen]);

    // Auto-generate asset ID when location changes (add mode only)
    useEffect(() => {
        if (mode === 'add' && formData.currentLocationId) {
            const generatedId = generateAssetId(formData.currentLocationId, existingAssets);
            if (generatedId && generatedId !== formData.assetId) {
                setFormData(prev => ({ ...prev, assetId: generatedId }));
            }
        }
    }, [formData.currentLocationId, mode, existingAssets, formData.assetId]);

    const handleChange = useCallback((
        field: keyof AssetFormData,
        value: string | number | Date | string[] | undefined
    ) => {
        // Don't allow editing assetId in edit mode
        if (mode === 'edit' && field === 'assetId') return;

        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    }, [errors, mode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const validation = validateAssetForm(formData);
        if (!validation.isValid) {
            setErrors(validation.errors);
            setIsSubmitting(false);
            return;
        }

        try {
            await onSubmit(formData);
        } catch (error) {
            console.error('Failed to submit form:', error);
            setErrors({ general: 'Failed to save asset. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'add' ? 'Add New Asset' : 'Edit Asset'}
            size="lg"
        >
            {errors.general && (
                <div className="error-message">
                    <span className="material-icons">error</span>
                    <span>{errors.general}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="asset-form">
                {/* Required Fields Section */}
                <div className="form-section">
                    <h3 className="section-title">Required Information</h3>

                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="name">
                                Asset Name <span className="required">*</span>
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className={errors.name ? 'error' : ''}
                                placeholder="e.g., Dell Latitude Laptop"
                                disabled={isSubmitting}
                            />
                            {errors.name && <span className="error-text">{errors.name}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="currentLocationId">
                                Location <span className="required">*</span>
                            </label>
                            <select
                                id="currentLocationId"
                                value={formData.currentLocationId}
                                onChange={(e) => handleChange('currentLocationId', e.target.value)}
                                className={errors.currentLocationId ? 'error' : ''}
                                disabled={isSubmitting}
                            >
                                <option value="">Select Location</option>
                                <option value="Pretoria">Pretoria (MLAB-PR)</option>
                                <option value="Polokwane">Polokwane (MLAB-PL)</option>
                                <option value="Tshwane">Tshwane (MLAB-TS)</option>
                                <option value="Tembisa">Tembisa (MLAB-TB)</option>
                                <option value="Soweto">Soweto (MLAB-SW)</option>
                                <option value="Imbali">Imbali (MLAB-IM)</option>
                                <option value="Kimberly">Kimberly (MLAB-KM)</option>
                                <option value="Upington">Upington (MLAB-UP)</option>
                                <option value="Johannesburg">Johannesburg (MLAB-JB)</option>
                                <option value="Cape Town">Cape Town (MLAB-CT)</option>
                                <option value="Durban">Durban (MLAB-DB)</option>
                                <option value="Bloemfontein">Bloemfontein (MLAB-BF)</option>
                            </select>
                            {errors.currentLocationId && <span className="error-text">{errors.currentLocationId}</span>}
                            <div className="field-hint">
                                Asset ID will be auto-generated based on location
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="assetId">
                                Asset ID
                            </label>
                            <input
                                id="assetId"
                                type="text"
                                value={formData.assetId}
                                readOnly={mode === 'add'}
                                onChange={(e) => handleChange('assetId', e.target.value)}
                                className={`${mode === 'add' ? 'readonly-input' : ''} ${errors.assetId ? 'error' : ''}`}
                                placeholder="Will be auto-generated"
                                disabled={isSubmitting || mode === 'add'}
                            />
                            {mode === 'add' ? (
                                <div className="field-hint">
                                    Auto-generated: {formData.assetId || 'Select location first'}
                                </div>
                            ) : (
                                <div className="field-hint">Edit only if necessary</div>
                            )}
                            {errors.assetId && <span className="error-text">{errors.assetId}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="type">
                                Type <span className="required">*</span>
                            </label>
                            <select
                                id="type"
                                value={formData.type}
                                onChange={(e) => handleChange('type', e.target.value)}
                                className={errors.type ? 'error' : ''}
                                disabled={isSubmitting}
                            >
                                <option value="">Select Type</option>
                                <option value="laptop">Laptop</option>
                                <option value="desktop">Desktop</option>
                                <option value="mobile">Mobile Phone</option>
                                <option value="tablet">Tablet</option>
                                <option value="printer">Printer</option>
                                <option value="server">Server</option>
                                <option value="network">Network Equipment</option>
                                <option value="furniture">Furniture</option>
                                <option value="other">Other</option>
                            </select>
                            {errors.type && <span className="error-text">{errors.type}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="category">
                                Category <span className="required">*</span>
                            </label>
                            <select
                                id="category"
                                value={formData.category}
                                onChange={(e) => handleChange('category', e.target.value)}
                                className={errors.category ? 'error' : ''}
                                disabled={isSubmitting}
                            >
                                <option value="">Select Category</option>
                                <option value="hardware">Hardware</option>
                                <option value="software">Software</option>
                                <option value="network">Network</option>
                                <option value="peripheral">Peripheral</option>
                                <option value="furniture">Furniture</option>
                                <option value="equipment">Equipment</option>
                            </select>
                            {errors.category && <span className="error-text">{errors.category}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="status">
                                Status <span className="required">*</span>
                            </label>
                            <select
                                id="status"
                                value={formData.status}
                                onChange={(e) => handleChange('status', e.target.value)}
                                className={errors.status ? 'error' : ''}
                                disabled={isSubmitting}
                            >
                                <option value="available">Available</option>
                                <option value="assigned">Assigned</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="retired">Retired</option>
                            </select>
                            {errors.status && <span className="error-text">{errors.status}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="condition">
                                Condition <span className="required">*</span>
                            </label>
                            <select
                                id="condition"
                                value={formData.condition}
                                onChange={(e) => handleChange('condition', e.target.value)}
                                className={errors.condition ? 'error' : ''}
                                disabled={isSubmitting}
                            >
                                <option value="excellent">Excellent</option>
                                <option value="good">Good</option>
                                <option value="fair">Fair</option>
                                <option value="poor">Poor</option>
                            </select>
                            {errors.condition && <span className="error-text">{errors.condition}</span>}
                        </div>
                    </div>
                </div>

                {/* Optional Fields Section */}
                <div className="form-section">
                    <h3 className="section-title">Optional Information</h3>

                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="serialNumber">
                                Serial Number
                            </label>
                            <input
                                id="serialNumber"
                                type="text"
                                value={formData.serialNumber || ''}
                                onChange={(e) => handleChange('serialNumber', e.target.value)}
                                placeholder="Enter serial number"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="manufacturer">
                                Manufacturer
                            </label>
                            <input
                                id="manufacturer"
                                type="text"
                                value={formData.manufacturer || ''}
                                onChange={(e) => handleChange('manufacturer', e.target.value)}
                                placeholder="e.g., Dell, HP, Apple"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="model">
                                Model
                            </label>
                            <input
                                id="model"
                                type="text"
                                value={formData.model || ''}
                                onChange={(e) => handleChange('model', e.target.value)}
                                placeholder="e.g., Latitude 5440"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="value">
                                Value (ZAR)
                            </label>
                            <input
                                id="value"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.value || ''}
                                onChange={(e) => handleChange('value', e.target.value ? parseFloat(e.target.value) : undefined)}
                                placeholder="0.00"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="description">
                                Description
                            </label>
                            <textarea
                                id="description"
                                value={formData.description || ''}
                                onChange={(e) => handleChange('description', e.target.value)}
                                placeholder="Describe the asset..."
                                rows={3}
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                </div>

                {/* Form Actions */}
                <div className="form-actions">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-secondary"
                        disabled={isSubmitting}
                    >
                        <span className="material-icons">cancel</span>
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="material-icons spinner">refresh</span>
                                Saving...
                            </>
                        ) : mode === 'add' ? (
                            <>
                                <span className="material-icons">add_circle</span>
                                Add Asset
                            </>
                        ) : (
                            <>
                                <span className="material-icons">save</span>
                                Update Asset
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export { AssetFormModal };