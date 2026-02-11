import React from 'react';

interface PendingRequest {
  id: string;
  userName: string;
  assetName: string;
  requestedDate: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  purpose: string;
}

interface PendingRequestsProps {
  requests: PendingRequest[];
  onViewAll?: () => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  limit?: number;
}

const PendingRequests: React.FC<PendingRequestsProps> = ({
  requests,
  onViewAll,
  onApprove,
  onReject,
  limit = 5
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const displayRequests = requests.slice(0, limit);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Pending Requests</h3>
            <p className="text-sm text-gray-500 mt-1">
              {requests.length} request{requests.length !== 1 ? 's' : ''} awaiting review
            </p>
          </div>
          {onViewAll && requests.length > limit && (
            <button
              onClick={onViewAll}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View all
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {displayRequests.length === 0 ? (
          <div className="p-6 text-center">
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
            <p className="mt-1 text-sm text-gray-500">
              All caught up! New requests will appear here.
            </p>
          </div>
        ) : (
          displayRequests.map((request) => (
            <div key={request.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(request.requestedDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-900">
                      {request.assetName}
                    </p>
                    <p className="text-xs text-gray-600">
                      Requested by: {request.userName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                      {request.purpose}
                    </p>
                  </div>
                </div>
                
                {(onApprove || onReject) && (
                  <div className="ml-4 flex space-x-2">
                    {onApprove && (
                      <button
                        onClick={() => onApprove(request.id)}
                        className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700"
                      >
                        Approve
                      </button>
                    )}
                    {onReject && (
                      <button
                        onClick={() => onReject(request.id)}
                        className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PendingRequests;