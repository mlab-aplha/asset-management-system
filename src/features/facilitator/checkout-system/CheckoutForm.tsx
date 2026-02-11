import React, { useState } from 'react';
import { Asset, User } from '../asset-assignment/types';

interface CheckoutFormProps {
  assets: Asset[];
  users: User[];
  onSubmit: (data: CheckoutData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export interface CheckoutData {
  assetId: string;
  userId: string;
  expectedReturnDate: string;
  conditionAtCheckout: string;
  notes?: string;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  assets,
  users,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState<CheckoutData>({
    assetId: '',
    userId: '',
    expectedReturnDate: '',
    conditionAtCheckout: 'Good',
    notes: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CheckoutData, string>> = {};

    if (!formData.assetId) newErrors.assetId = 'Please select an asset';
    if (!formData.userId) newErrors.userId = 'Please select a user';
    if (!formData.expectedReturnDate) {
      newErrors.expectedReturnDate = 'Please select return date';
    } else {
      const returnDate = new Date(formData.expectedReturnDate);
      const today = new Date();
      if (returnDate <= today) {
        newErrors.expectedReturnDate = 'Return date must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await onSubmit(formData);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Check Out Asset</h2>

      {/* Asset Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Asset <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.assetId}
          onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
          className={`w-full px-3 py-2 border rounded-md ${
            errors.assetId ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">-- Choose an asset --</option>
          {assets.map(asset => (
            <option key={asset.id} value={asset.id}>
              {asset.name} - {asset.serialNumber} ({asset.category})
            </option>
          ))}
        </select>
        {errors.assetId && (
          <p className="mt-1 text-sm text-red-600">{errors.assetId}</p>
        )}
      </div>

      {/* User Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select User <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.userId}
          onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
          className={`w-full px-3 py-2 border rounded-md ${
            errors.userId ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">-- Choose a user --</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.name} - {user.department || 'No Dept'} ({user.email})
            </option>
          ))}
        </select>
        {errors.userId && (
          <p className="mt-1 text-sm text-red-600">{errors.userId}</p>
        )}
      </div>

      {/* Expected Return Date */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Expected Return Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={formData.expectedReturnDate}
          onChange={(e) => setFormData({ ...formData, expectedReturnDate: e.target.value })}
          min={minDate}
          className={`w-full px-3 py-2 border rounded-md ${
            errors.expectedReturnDate ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.expectedReturnDate && (
          <p className="mt-1 text-sm text-red-600">{errors.expectedReturnDate}</p>
        )}
      </div>

      {/* Condition */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Asset Condition <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.conditionAtCheckout}
          onChange={(e) => setFormData({ ...formData, conditionAtCheckout: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="Excellent">Excellent - Like new</option>
          <option value="Good">Good - Normal wear</option>
          <option value="Fair">Fair - Visible wear</option>
          <option value="Poor">Poor - Needs repair</option>
        </select>
      </div>

      {/* Notes */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Additional Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          placeholder="Any special instructions or notes..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Check Out Asset'}
        </button>
      </div>
    </form>
  );
};

export default CheckoutForm;