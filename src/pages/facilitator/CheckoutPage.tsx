import React, { useState, useEffect } from 'react';
import CheckoutForm from '../../features/facilitator/checkout-system/CheckoutForm';
import CheckoutHistory from '../../features/facilitator/checkout-system/CheckoutHistory';
import { useAvailableAssets, useUsers } from '../../features/facilitator/asset-assignment/hooks';
import { AssignmentService } from '../../../backend-firebase/src/services/AssignmentService';
import { Assignment } from '../../features/facilitator/asset-assignment/types';

const CheckoutPage: React.FC = () => {
  const { assets, loading: assetsLoading } = useAvailableAssets();
  const { users, loading: usersLoading } = useUsers();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchAssignments = async () => {
      const result = await AssignmentService.getActive();
      if (result.success && result.data) {
        setAssignments(result.data as Assignment[]);
      }
      setLoading(false);
    };
    fetchAssignments();
  }, []);

  const handleCheckout = async (data: any) => {
    console.log('Checkout:', data);
    setShowForm(false);
    // Refresh assignments after checkout
    const result = await AssignmentService.getActive();
    if (result.success && result.data) {
      setAssignments(result.data as Assignment[]);
    }
  };

  const handleReturn = async (assignment: Assignment) => {
    console.log('Return:', assignment);
    // Process return
    const result = await AssignmentService.processReturn(assignment.id, 'Good', 'Returned');
    if (result.success) {
      // Refresh assignments after return
      const activeResult = await AssignmentService.getActive();
      if (activeResult.success && activeResult.data) {
        setAssignments(activeResult.data as Assignment[]);
      }
    }
  };

  // Use the loading states
  const isPageLoading = assetsLoading || usersLoading || loading;

  if (isPageLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Checkout System</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Cancel' : 'New Checkout'}
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <CheckoutForm
            assets={assets}
            users={users}
            onSubmit={handleCheckout}
            onCancel={() => setShowForm(false)}
            loading={false}
          />
        </div>
      )}

      <CheckoutHistory
        assignments={assignments}
        loading={loading}
        onProcessReturn={handleReturn}
      />
    </div>
  );
};

export default CheckoutPage;
