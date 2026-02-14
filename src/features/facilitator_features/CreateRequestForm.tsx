// src/features/requests/components/facilitator/CreateRequestForm.tsx
import React, { useState } from 'react';
// We don't need these imports since we're defining our own types
// import { AssetRequest, RequestItem as ServiceRequestItem } from '../../../backend-firebase/src/services/RequestService';
import './create-request-form.css';

// Define the item type for the form
interface RequestItem {
    assetType: string;
    quantity: number;
    notes?: string;
}

// Define the form data type (omitting auto-generated fields)
interface CreateRequestFormData {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    department: string;
    neededBy: string;
    items: RequestItem[];
    notes: string;
}

// Define the submission data type (matches what the service expects)
interface CreateRequestSubmissionData {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    department: string;
    neededBy: string;
    items: RequestItem[];
    notes: string;
    status: 'pending';
    createdAt: Date;
    requestId: string;
}

interface CreateRequestFormProps {
    onSubmit: (data: CreateRequestSubmissionData) => Promise<void>;
    onCancel: () => void;
}

export const CreateRequestForm: React.FC<CreateRequestFormProps> = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState<CreateRequestFormData>({
        title: '',
        description: '',
        priority: 'medium',
        department: '',
        neededBy: '',
        items: [],
        notes: ''
    });

    const [currentItem, setCurrentItem] = useState<RequestItem>({
        assetType: '',
        quantity: 1,
        notes: ''
    });

    const [loading, setLoading] = useState(false);

    const handleAddItem = () => {
        if (currentItem.assetType && currentItem.quantity > 0) {
            setFormData({
                ...formData,
                items: [...formData.items, { ...currentItem }]
            });
            setCurrentItem({ assetType: '', quantity: 1, notes: '' });
        }
    };

    const handleRemoveItem = (index: number) => {
        setFormData({
            ...formData,
            items: formData.items.filter((_, i) => i !== index)
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.items.length === 0) {
            alert('Please add at least one item');
            return;
        }

        setLoading(true);
        try {
            const submissionData: CreateRequestSubmissionData = {
                ...formData,
                status: 'pending',
                createdAt: new Date(),
                requestId: `REQ-${Date.now()}`
            };
            await onSubmit(submissionData);
        } catch (error) {
            console.error('Error submitting request:', error);
            alert('Failed to create request');
        } finally {
            setLoading(false);
        }
    };

    const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value as 'low' | 'medium' | 'high' | 'urgent';
        setFormData({ ...formData, priority: value });
    };

    return (
        <form className="create-request-form" onSubmit={handleSubmit}>
            <div className="form-section">
                <h3>Request Details</h3>

                <div className="form-group">
                    <label htmlFor="title">Request Title *</label>
                    <input
                        type="text"
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        placeholder="e.g., Lab Equipment Request"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description *</label>
                    <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                        rows={3}
                        placeholder="Describe what you need and why"
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="priority">Priority *</label>
                        <select
                            id="priority"
                            value={formData.priority}
                            onChange={handlePriorityChange}
                            required
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="department">Department *</label>
                        <input
                            type="text"
                            id="department"
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            required
                            placeholder="e.g., IT, Facilities"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="neededBy">Needed By Date</label>
                    <input
                        type="date"
                        id="neededBy"
                        value={formData.neededBy}
                        onChange={(e) => setFormData({ ...formData, neededBy: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                    />
                </div>
            </div>

            <div className="form-section">
                <h3>Request Items</h3>

                <div className="items-list">
                    {formData.items.map((item, index) => (
                        <div key={index} className="item-row">
                            <span className="item-name">{item.assetType}</span>
                            <span className="item-quantity">x{item.quantity}</span>
                            {item.notes && <span className="item-notes">{item.notes}</span>}
                            <button
                                type="button"
                                className="remove-item-btn"
                                onClick={() => handleRemoveItem(index)}
                            >
                                <span className="material-icons">close</span>
                            </button>
                        </div>
                    ))}
                </div>

                <div className="add-item-form">
                    <h4>Add Item</h4>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Asset Type *</label>
                            <input
                                type="text"
                                value={currentItem.assetType}
                                onChange={(e) => setCurrentItem({ ...currentItem, assetType: e.target.value })}
                                placeholder="e.g., Laptop, Chair"
                            />
                        </div>
                        <div className="form-group">
                            <label>Quantity *</label>
                            <input
                                type="number"
                                min="1"
                                value={currentItem.quantity}
                                onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) || 1 })}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Notes (optional)</label>
                        <input
                            type="text"
                            value={currentItem.notes}
                            onChange={(e) => setCurrentItem({ ...currentItem, notes: e.target.value })}
                            placeholder="e.g., Prefer Dell laptops"
                        />
                    </div>
                    <button
                        type="button"
                        className="add-item-btn"
                        onClick={handleAddItem}
                        disabled={!currentItem.assetType}
                    >
                        <span className="material-icons">add</span>
                        Add Item
                    </button>
                </div>
            </div>

            <div className="form-section">
                <h3>Additional Notes</h3>
                <div className="form-group">
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={2}
                        placeholder="Any additional information..."
                    />
                </div>
            </div>

            <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={onCancel}>
                    Cancel
                </button>
                <button
                    type="submit"
                    className="submit-btn"
                    disabled={loading || formData.items.length === 0}
                >
                    {loading ? 'Creating...' : 'Create Request'}
                </button>
            </div>
        </form>
    );
};