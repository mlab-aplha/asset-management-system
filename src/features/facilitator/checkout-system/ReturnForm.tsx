import React, { useState } from 'react';
import { Assignment } from '../asset-assignment/types';

interface ReturnFormProps {
  assignment: Assignment;
  onSubmit: (data: ReturnData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export interface ReturnData {
  assignmentId: string;
  conditionAtReturn: string;
  notes?: string;
}

const ReturnForm: React.FC<ReturnFormProps> = ({
  assignment,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState<ReturnData>({
    assignmentId: assignment.id,
    conditionAtReturn: 'Good',
    notes: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ReturnData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ReturnData, string>> = {};
    if (!formData.conditionAtReturn) {
      newErrors.conditionAtReturn = 'Please select condition';
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

  const isOverdue = new Date(assignment.expectedReturnDate) < new Date();
  const daysOverdue = isOverdue 
    ? Math.floor((new Date().getTime() - new Date(assignment.expectedReturnDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Return Asset</h2>

      {/* Asset Info */}
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Asset Information</h3>
        <p className="text-sm text-gray-900"><span className="font-medium">Asset:</span> {assignment.assetName}</p>
        <p className="text-sm text-gray-900"><span className="font-medium">User:</span> {assignment.userName}</p>
        <p className="text-sm text-gray-900">
          <span className="font-medium">Checkout Date:</span> {new Date(assignment.assignedDate).toLocaleDateString()}
        </p>
        <p className="text-sm text-gray-900">
          <span className="font-medium">Expected Return:</span> {new Date(assignment.expectedReturnDate).toLocaleDateString()}
        </p>
        {isOverdue && (
          <p className="text-sm text-red-600 font-medium mt-1">
            ⚠️ {daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue
          </p>
        )}
      </div>

      {/* Condition at Return */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Condition at Return <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.conditionAtReturn}
          onChange={(e) => setFormData({ ...formData, conditionAtReturn: e.target.value })}
          className={`w-full px-3 py-2 border rounded-md ${
            errors.conditionAtReturn ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="Excellent">Excellent - Like new</option>
          <option value="Good">Good - Normal wear</option>
          <option value="Fair">Fair - Visible wear</option>
          <option value="Poor">Poor - Needs repair</option>
          <option value="Damaged">Damaged - Requires maintenance</option>
        </select>
        {errors.conditionAtReturn && (
          <p className="mt-1 text-sm text-red-600">{errors.conditionAtReturn}</p>
        )}
      </div>

      {/* Checkout Condition (Read-only) */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Condition at Checkout
        </label>
        <input
          type="text"
          value={assignment.conditionAtCheckout}
          disabled
          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600"
        />
      </div>

      {/* Notes */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Return Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          placeholder="Any damage, issues, or additional notes..."
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
          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Confirm Return'}
        </button>
      </div>
    </form>
  );
};

export default ReturnForm;