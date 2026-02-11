import React, { useState } from 'react';
import { useAvailableAssets, useUsers } from './hooks';
import { AssignmentFormData, User, Asset } from './types';

interface AssignmentFormProps {
  onSubmit: (formData: AssignmentFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<AssignmentFormData>;
}

const AssignmentForm: React.FC<AssignmentFormProps> = ({
  onSubmit,
  onCancel,
  initialData
}) => {
  const { assets, loading: assetsLoading } = useAvailableAssets();
  const { users, loading: usersLoading } = useUsers();
  
  const [formData, setFormData] = useState<AssignmentFormData>({
    userId: initialData?.userId || '',
    assetId: initialData?.assetId || '',
    expectedReturnDate: initialData?.expectedReturnDate || '',
    purpose: initialData?.purpose || '',
    priority: initialData?.priority || 'medium',
    notes: initialData?.notes || ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AssignmentFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AssignmentFormData, string>> = {};

    if (!formData.userId) {
      newErrors.userId = 'Please select a user';
    }
    if (!formData.assetId) {
      newErrors.assetId = 'Please select an asset';
    }
    if (!formData.expectedReturnDate) {
      newErrors.expectedReturnDate = 'Please select expected return date';
    } else {
      const selectedDate = new Date(formData.expectedReturnDate);
      const today = new Date();
      if (selectedDate <= today) {
        newErrors.expectedReturnDate = 'Return date must be in the future';
      }
    }
    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Please enter the purpose of assignment';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name as keyof AssignmentFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }

    // Update selected user/asset
    if (name === 'userId') {
      const user = users.find(u => u.id === value) || null;
      setSelectedUser(user);
    }
    if (name === 'assetId') {
      const asset = assets.find(a => a.id === value) || null;
      setSelectedAsset(asset);
    }
  };

  // Set minimum date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  if (assetsLoading || usersLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-900">New Asset Assignment</h2>
      
      {/* User Selection */}
      <div>
        <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
          Select User <span className="text-red-500">*</span>
        </label>
        <select
          id="userId"
          name="userId"
          value={formData.userId}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
            errors.userId ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">-- Select a user --</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.name} - {user.department || 'No Department'} ({user.email})
            </option>
          ))}
        </select>
        {errors.userId && (
          <p className="mt-1 text-sm text-red-600">{errors.userId}</p>
        )}
        {selectedUser && (
          <div className="mt-2 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Selected User:</span> {selectedUser.name}
              <br />
              <span className="font-medium">Email:</span> {selectedUser.email}
              <br />
              <span className="font-medium">Department:</span> {selectedUser.department || 'N/A'}
            </p>
          </div>
        )}
      </div>

      {/* Asset Selection */}
      <div>
        <label htmlFor="assetId" className="block text-sm font-medium text-gray-700 mb-1">
          Select Asset <span className="text-red-500">*</span>
        </label>
        <select
          id="assetId"
          name="assetId"
          value={formData.assetId}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
            errors.assetId ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">-- Select an asset --</option>
          {assets.map(asset => (
            <option key={asset.id} value={asset.id}>
              {asset.name} - SN: {asset.serialNumber} ({asset.category})
            </option>
          ))}
        </select>
        {errors.assetId && (
          <p className="mt-1 text-sm text-red-600">{errors.assetId}</p>
        )}
        {selectedAsset && (
          <div className="mt-2 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Selected Asset:</span> {selectedAsset.name}
              <br />
              <span className="font-medium">Serial Number:</span> {selectedAsset.serialNumber}
              <br />
              <span className="font-medium">Category:</span> {selectedAsset.category}
              <br />
              <span className="font-medium">Location:</span> {selectedAsset.location || 'N/A'}
            </p>
          </div>
        )}
      </div>

      {/* Expected Return Date */}
      <div>
        <label htmlFor="expectedReturnDate" className="block text-sm font-medium text-gray-700 mb-1">
          Expected Return Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          id="expectedReturnDate"
          name="expectedReturnDate"
          value={formData.expectedReturnDate}
          onChange={handleChange}
          min={minDate}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
            errors.expectedReturnDate ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.expectedReturnDate && (
          <p className="mt-1 text-sm text-red-600">{errors.expectedReturnDate}</p>
        )}
      </div>

      {/* Priority */}
      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
          Priority Level <span className="text-red-500">*</span>
        </label>
        <select
          id="priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      {/* Purpose */}
      <div>
        <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
          Purpose of Assignment <span className="text-red-500">*</span>
        </label>
        <textarea
          id="purpose"
          name="purpose"
          rows={3}
          value={formData.purpose}
          onChange={handleChange}
          placeholder="Explain why this asset is needed..."
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
            errors.purpose ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.purpose && (
          <p className="mt-1 text-sm text-red-600">{errors.purpose}</p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Additional Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          value={formData.notes}
          onChange={handleChange}
          placeholder="Any additional information..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating...' : 'Create Assignment Request'}
        </button>
      </div>
    </form>
  );
};

export default AssignmentForm;