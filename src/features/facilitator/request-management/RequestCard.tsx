import React from 'react';
import { AssignmentRequest } from '../asset-assignment/types';

interface RequestCardProps {
  request: AssignmentRequest;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onView: (id: string) => void;
}

const RequestCard: React.FC<RequestCardProps> = ({ request, onApprove, onReject, onView }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-5">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
              {request.priority.toUpperCase()}
            </span>
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
              {request.status.toUpperCase()}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {formatDate(request.requestedDate)}
          </span>
        </div>

        {/* Asset Info */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900">{request.assetName}</h3>
          <p className="text-sm text-gray-600">SN: {request.assetSerialNumber}</p>
        </div>

        {/* User Info */}
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-700">{request.userName}</p>
          <p className="text-xs text-gray-500">{request.userEmail}</p>
          <p className="text-xs text-gray-500">{request.userDepartment || 'No Department'}</p>
        </div>

        {/* Purpose */}
        <div className="mb-4">
          <p className="text-sm text-gray-700 line-clamp-2">{request.purpose}</p>
        </div>

        {/* Return Date */}
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Return: {formatDate(request.expectedReturnDate)}</span>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          {request.status === 'pending' && (
            <>
              <button
                onClick={() => onApprove(request.id)}
                className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => onReject(request.id)}
                className="flex-1 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
              >
                Reject
              </button>
            </>
          )}
          <button
            onClick={() => onView(request.id)}
            className="px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestCard;