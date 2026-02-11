import React, { useState } from 'react';
import { useAssignmentRequests } from './hooks';
import { AssignmentRequest } from './types';

interface AssignmentQueueProps {
  facilitatorId: string;
  facilitatorName: string;
}

const AssignmentQueue: React.FC<AssignmentQueueProps> = ({ facilitatorId, facilitatorName }) => {
  const { requests, loading, error, approveRequest, rejectRequest, refresh } = useAssignmentRequests({
    status: 'pending'
  });

  const [selectedRequest, setSelectedRequest] = useState<AssignmentRequest | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const filteredRequests = requests.filter(request => {
    if (filterPriority === 'all') return true;
    return request.priority === filterPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleApprove = async (requestId: string) => {
    setActionInProgress(requestId);
    try {
      await approveRequest(requestId, facilitatorId, facilitatorName, approvalNotes);
      setSelectedRequest(null);
      setApprovalNotes('');
      refresh();
    } catch (error) {
      console.error('Error approving request:', error);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setActionInProgress(requestId);
    try {
      await rejectRequest(requestId, facilitatorId, rejectionReason);
      setShowRejectionModal(false);
      setRejectionReason('');
      setSelectedRequest(null);
      refresh();
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setActionInProgress(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-600">Error: {error}</p>
        <button
          onClick={refresh}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Assignment Request Queue</h2>
            <p className="text-sm text-gray-500 mt-1">
              {filteredRequests.length} pending request{filteredRequests.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <button
              onClick={refresh}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending requests</h3>
            <p className="mt-1 text-sm text-gray-500">All assignment requests have been processed.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredRequests.map((request) => (
              <li key={request.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(request.priority)}`}>
                        {request.priority.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">
                        Requested: {new Date(request.requestedDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="mt-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {request.assetName}
                      </h3>
                      <div className="mt-1 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">User:</span> {request.userName}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Department:</span> {request.userDepartment || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Return Date:</span>{' '}
                            {new Date(request.expectedReturnDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Purpose:</span> {request.purpose}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 flex items-center space-x-3">
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowRejectionModal(false);
                      }}
                      className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                      disabled={actionInProgress === request.id}
                    >
                      {actionInProgress === request.id ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowRejectionModal(true);
                      }}
                      className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                      disabled={actionInProgress === request.id}
                    >
                      Reject
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Approval Modal for this request */}
                {selectedRequest?.id === request.id && !showRejectionModal && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Approve Request</h4>
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="approvalNotes" className="block text-sm text-gray-700 mb-1">
                          Add Notes (Optional)
                        </label>
                        <textarea
                          id="approvalNotes"
                          rows={2}
                          value={approvalNotes}
                          onChange={(e) => setApprovalNotes(e.target.value)}
                          placeholder="Any instructions or notes for the user..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setSelectedRequest(null)}
                          className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleApprove(request.id)}
                          disabled={actionInProgress === request.id}
                          className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                          Confirm Approval
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rejection Modal */}
                {selectedRequest?.id === request.id && showRejectionModal && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Reject Request</h4>
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="rejectionReason" className="block text-sm text-gray-700 mb-1">
                          Reason for Rejection <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="rejectionReason"
                          rows={2}
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Please provide a reason..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setShowRejectionModal(false);
                            setSelectedRequest(null);
                            setRejectionReason('');
                          }}
                          className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          disabled={actionInProgress === request.id || !rejectionReason.trim()}
                          className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50"
                        >
                          Confirm Rejection
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AssignmentQueue;