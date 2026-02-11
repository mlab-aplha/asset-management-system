import React from 'react';

interface OverdueAssignment {
  id: string;
  assetName: string;
  assetSerialNumber: string;
  userName: string;
  userEmail: string;
  expectedReturnDate: Date;
  daysOverdue: number;
}

interface OverdueAssetsProps {
  assignments: OverdueAssignment[];
  onViewAll?: () => void;
  onSendReminder?: (id: string) => void;
  onProcessReturn?: (id: string) => void;
  limit?: number;
}

const OverdueAssets: React.FC<OverdueAssetsProps> = ({
  assignments,
  onViewAll,
  onSendReminder,
  onProcessReturn,
  limit = 5
}) => {
  const displayAssignments = assignments.slice(0, limit);

  const getOverdueColor = (days: number) => {
    if (days > 14) return 'bg-red-100 text-red-800';
    if (days > 7) return 'bg-orange-100 text-orange-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Overdue Returns</h3>
            <p className="text-sm text-gray-500 mt-1">
              {assignments.length} asset{assignments.length !== 1 ? 's' : ''} overdue
            </p>
          </div>
          {onViewAll && assignments.length > limit && (
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
        {displayAssignments.length === 0 ? (
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
                d="M9 12l2 2 4-5m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No overdue assets</h3>
            <p className="mt-1 text-sm text-gray-500">
              All assets have been returned on time.
            </p>
          </div>
        ) : (
          displayAssignments.map((assignment) => (
            <div key={assignment.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOverdueColor(assignment.daysOverdue)}`}>
                      {assignment.daysOverdue} days overdue
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-900">
                      {assignment.assetName}
                    </p>
                    <p className="text-xs text-gray-600">
                      SN: {assignment.assetSerialNumber}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      <span className="font-medium">User:</span> {assignment.userName}
                    </p>
                    <p className="text-xs text-gray-500">
                      Expected: {new Date(assignment.expectedReturnDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="ml-4 flex flex-col space-y-2">
                  {onProcessReturn && (
                    <button
                      onClick={() => onProcessReturn(assignment.id)}
                      className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700"
                    >
                      Return
                    </button>
                  )}
                  {onSendReminder && (
                    <button
                      onClick={() => onSendReminder(assignment.id)}
                      className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700"
                    >
                      Remind
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OverdueAssets;