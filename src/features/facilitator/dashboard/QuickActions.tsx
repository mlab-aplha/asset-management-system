import React from 'react';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

interface QuickActionsProps {
  onAction: (action: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onAction }) => {
  const actions: QuickAction[] = [
    {
      id: 'checkout',
      label: 'Check Out Asset',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
      ),
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Assign asset to user'
    },
    {
      id: 'return',
      label: 'Process Return',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14v-6a4 4 0 00-4-4h-1" />
        </svg>
      ),
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Accept returned asset'
    },
    {
      id: 'request',
      label: 'New Request',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Create assignment request'
    },
    {
      id: 'maintenance',
      label: 'Schedule Maintenance',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-yellow-500 hover:bg-yellow-600',
      description: 'Set up maintenance'
    },
    {
      id: 'report',
      label: 'Generate Report',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'bg-gray-500 hover:bg-gray-600',
      description: 'Export usage data'
    },
    {
      id: 'scan',
      label: 'Scan QR Code',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      ),
      color: 'bg-indigo-500 hover:bg-indigo-600',
      description: 'Quick scan & checkout'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        <p className="text-sm text-gray-500 mt-1">
          Frequently used operations
        </p>
      </div>

      <div className="p-4 grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onAction(action.id)}
            className="group relative flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <div className={`p-3 rounded-lg text-white ${action.color} transition-colors`}>
              {action.icon}
            </div>
            <span className="mt-2 text-sm font-medium text-gray-900">
              {action.label}
            </span>
            <span className="mt-1 text-xs text-gray-500 text-center">
              {action.description}
            </span>
          </button>
        ))}
      </div>

      {/* Recent Shortcuts */}
      <div className="bg-gray-50 px-6 py-4 rounded-b-lg border-t border-gray-200">
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
          Recent Shortcuts
        </h4>
        <div className="flex space-x-2">
          <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs text-gray-700 hover:bg-gray-50">
            Check out MacBook Pro
          </button>
          <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs text-gray-700 hover:bg-gray-50">
            Return Dell Monitor
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;