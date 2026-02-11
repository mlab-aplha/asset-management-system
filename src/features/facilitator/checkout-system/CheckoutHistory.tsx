import React, { useState } from 'react';
import { Assignment } from '../asset-assignment/types';

interface CheckoutHistoryProps {
  assignments: Assignment[];
  loading?: boolean;
  onViewDetails?: (assignment: Assignment) => void;
  onProcessReturn?: (assignment: Assignment) => void;
}

const CheckoutHistory: React.FC<CheckoutHistoryProps> = ({
  assignments,
  loading = false,
  onViewDetails,
  onProcessReturn
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'returned' | 'overdue'>('all');
  const [search, setSearch] = useState('');

  const filteredAssignments = assignments
    .filter(assignment => {
      if (filter === 'all') return true;
      if (filter === 'overdue') {
        return assignment.status === 'active' && 
               new Date(assignment.expectedReturnDate) < new Date();
      }
      return assignment.status === filter;
    })
    .filter(assignment =>
      search === '' ||
      assignment.assetName.toLowerCase().includes(search.toLowerCase()) ||
      assignment.userName.toLowerCase().includes(search.toLowerCase()) ||
      assignment.id.toLowerCase().includes(search.toLowerCase())
    );

  const getStatusBadge = (assignment: Assignment) => {
    const isOverdue = assignment.status === 'active' && 
                     new Date(assignment.expectedReturnDate) < new Date();
    
    if (isOverdue) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Overdue</span>;
    }
    
    switch (assignment.status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Active</span>;
      case 'returned':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Returned</span>;
      case 'lost':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Lost</span>;
      default:
        return null;
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by asset, user, or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Filters */}
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                filter === 'active' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('overdue')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                filter === 'overdue' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Overdue
            </button>
            <button
              onClick={() => setFilter('returned')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                filter === 'returned' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Returned
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Checkout Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Return Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAssignments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No checkout history found
                </td>
              </tr>
            ) : (
              filteredAssignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{assignment.assetName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{assignment.userName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{formatDate(assignment.assignedDate)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {formatDate(assignment.actualReturnDate || assignment.expectedReturnDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(assignment)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <button
                      onClick={() => onViewDetails?.(assignment)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View
                    </button>
                    {assignment.status === 'active' && onProcessReturn && (
                      <button
                        onClick={() => onProcessReturn(assignment)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Return
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Total: {assignments.length}</span>
          <span>Active: {assignments.filter(a => a.status === 'active').length}</span>
          <span>Overdue: {assignments.filter(a => 
            a.status === 'active' && new Date(a.expectedReturnDate) < new Date()
          ).length}</span>
          <span>Returned: {assignments.filter(a => a.status === 'returned').length}</span>
        </div>
      </div>
    </div>
  );
};

export default CheckoutHistory;