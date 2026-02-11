 import React, { useState } from 'react';
import { AssignmentRequest } from '../asset-assignment/types';

interface RequestDetailsProps {
  request: AssignmentRequest;
  onClose: () => void;
  onApprove?: (id: string, notes: string) => void;
  onReject?: (id: string, reason: string) => void;
}

const RequestDetails: React.FC<RequestDetailsProps> = ({
  request,
  onClose,
  onApprove,
  onReject
}) => {
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  // ✅ FIXED: Handle null, undefined, and invalid dates
  const formatDate = (date: Date | string | null | undefined): string => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      urgent: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
      overdue: 'bg-orange-100 text-orange-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-lg bg-white">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Assignment Request Details</h2>
            <p className="text-sm text-gray-500 mt-1">Request ID: {request.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Status Badges */}
        <div className="flex space-x-2 mb-6">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityBadge(request.priority)}`}>
            {request.priority.toUpperCase()} PRIORITY
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(request.status)}`}>
            {request.status.toUpperCase()}
          </span>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Asset Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">Asset Information</h3>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium text-gray-700">Name:</span>{' '}
                <span className="text-gray-900">{request.assetName}</span>
              </p>
              <p className="text-sm">
                <span className="font-medium text-gray-700">Serial Number:</span>{' '}
                <span className="text-gray-900">{request.assetSerialNumber}</span>
              </p>
            </div>
          </div>

          {/* User Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">User Information</h3>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium text-gray-700">Name:</span>{' '}
                <span className="text-gray-900">{request.userName}</span>
              </p>
              <p className="text-sm">
                <span className="font-medium text-gray-700">Email:</span>{' '}
                <span className="text-gray-900">{request.userEmail}</span>
              </p>
              <p className="text-sm">
                <span className="font-medium text-gray-700">Department:</span>{' '}
                <span className="text-gray-900">{request.userDepartment || 'N/A'}</span>
              </p>
            </div>
          </div>

          {/* Request Details */}
          <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">Request Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Requested Date:</span>{' '}
                  <span className="text-gray-900">{formatDate(request.requestedDate)}</span>
                </p>
                <p className="text-sm mt-2">
                  <span className="font-medium text-gray-700">Expected Return:</span>{' '}
                  <span className="text-gray-900">{formatDate(request.expectedReturnDate)}</span>
                </p>
              </div>
              <div>
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Purpose:</span>
                </p>
                <p className="text-sm text-gray-900 mt-1 bg-white p-2 rounded border">
                  {request.purpose}
                </p>
              </div>
            </div>
          </div>

          {/* Status Information (if approved/rejected) */}
          {(request.status === 'approved' || request.status === 'rejected') && (
            <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
              <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">
                {request.status === 'approved' ? 'Approval Information' : 'Rejection Information'}
              </h3>
              <div className="space-y-2">
                {request.status === 'approved' && (
                  <>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Approved By:</span>{' '}
                      <span className="text-gray-900">{request.approvedBy || 'N/A'}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Approved Date:</span>{' '}
                      {/* ✅ FIXED: Now handles null/undefined */}
                      <span className="text-gray-900">{formatDate(request.approvedDate)}</span>
                    </p>
                    {request.facilitatorNotes && (
                      <p className="text-sm">
                        <span className="font-medium text-gray-700">Notes:</span>{' '}
                        <span className="text-gray-900">{request.facilitatorNotes}</span>
                      </p>
                    )}
                  </>
                )}
                {request.status === 'rejected' && (
                  <>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Rejected By:</span>{' '}
                      <span className="text-gray-900">{request.rejectedBy || 'N/A'}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Rejected Date:</span>{' '}
                      {/* ✅ FIXED: Now handles null/undefined */}
                      <span className="text-gray-900">{formatDate(request.rejectedDate)}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-700">Reason:</span>{' '}
                      <span className="text-gray-900">{request.rejectionReason || 'N/A'}</span>
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {request.status === 'pending' && (
          <div className="mt-6 border-t pt-4">
            {!showRejectForm ? (
              <div className="flex space-x-3">
                {onApprove && (
                  <div className="flex-1">
                    <textarea
                      placeholder="Add approval notes (optional)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-2"
                      rows={2}
                    />
                    <button
                      onClick={() => onApprove(request.id, notes)}
                      className="w-full px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
                    >
                      Approve Request
                    </button>
                  </div>
                )}
                {onReject && (
                  <div className="flex-1">
                    <button
                      onClick={() => setShowRejectForm(true)}
                      className="w-full px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
                    >
                      Reject Request
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-red-800 mb-2">Reject Request</h4>
                <textarea
                  placeholder="Please provide a reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-red-300 rounded-md text-sm mb-2"
                  rows={3}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => onReject && onReject(request.id, rejectionReason)}
                    disabled={!rejectionReason.trim()}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    Confirm Rejection
                  </button>
                  <button
                    onClick={() => {
                      setShowRejectForm(false);
                      setRejectionReason('');
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Close Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestDetails;