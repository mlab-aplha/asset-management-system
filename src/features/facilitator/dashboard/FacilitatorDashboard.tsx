import React, { useState } from 'react';
import PendingRequests from './PendingRequests';
import OverdueAssets from './OverdueAssets';
import QuickActions from './QuickActions';

interface DashboardStats {
  totalPending: number;
  urgentRequests: number;
  activeAssignments: number;
  overdueReturns: number;
  availableAssets: number;
  assetsInMaintenance: number;
}

interface DashboardProps {
  stats: DashboardStats;
  pendingRequests: any[];
  overdueAssignments: any[];
  loading?: boolean;
  onRefresh?: () => void;
  onViewAllRequests?: () => void;
  onViewAllOverdue?: () => void;
  onQuickAction: (action: string) => void;
}

const FacilitatorDashboard: React.FC<DashboardProps> = ({
  stats,
  pendingRequests,
  overdueAssignments,
  loading = false,
  onRefresh,
  onViewAllRequests,
  onViewAllOverdue,
  onQuickAction
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facilitator Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back! Here's what's happening with your assets today.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500 font-medium">Pending Requests</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalPending}</p>
          <p className="text-xs text-gray-400 mt-1">
            {stats.urgentRequests} urgent
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500 font-medium">Active Assignments</p>
          <p className="text-2xl font-bold text-gray-900">{stats.activeAssignments}</p>
          <p className="text-xs text-gray-400 mt-1">
            Currently checked out
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-red-500">
          <p className="text-sm text-gray-500 font-medium">Overdue Returns</p>
          <p className="text-2xl font-bold text-gray-900">{stats.overdueReturns}</p>
          <p className="text-xs text-red-500 mt-1">
            Action required
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-green-500">
          <p className="text-sm text-gray-500 font-medium">Available Assets</p>
          <p className="text-2xl font-bold text-gray-900">{stats.availableAssets}</p>
          <p className="text-xs text-gray-400 mt-1">
            Ready to assign
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-purple-500">
          <p className="text-sm text-gray-500 font-medium">In Maintenance</p>
          <p className="text-2xl font-bold text-gray-900">{stats.assetsInMaintenance || 0}</p>
          <p className="text-xs text-gray-400 mt-1">
            Under repair
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-5 border-l-4 border-gray-500">
          <p className="text-sm text-gray-500 font-medium">Utilization Rate</p>
          <p className="text-2xl font-bold text-gray-900">
            {stats.availableAssets + stats.activeAssignments > 0
              ? Math.round((stats.activeAssignments / (stats.availableAssets + stats.activeAssignments)) * 100)
              : 0}%
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Of total assets
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Pending Requests */}
        <div className="lg:col-span-2 space-y-6">
          <PendingRequests
            requests={pendingRequests}
            onViewAll={onViewAllRequests}
          />
          
          {/* Activity Timeline */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">John Doe</span> approved request for{' '}
                    <span className="font-medium">MacBook Pro</span>
                  </p>
                  <p className="text-xs text-gray-500">2 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Jane Smith</span> checked out{' '}
                    <span className="font-medium">Dell Monitor</span>
                  </p>
                  <p className="text-xs text-gray-500">15 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Mike Johnson</span> requested{' '}
                    <span className="font-medium">iPad Pro</span>
                  </p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <OverdueAssets
            assignments={overdueAssignments}
            onViewAll={onViewAllOverdue}
          />
          
          <QuickActions onAction={onQuickAction} />
          
          {/* Weekly Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">New requests</span>
                <span className="text-sm font-medium text-gray-900">24</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completed assignments</span>
                <span className="text-sm font-medium text-gray-900">18</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Assets returned</span>
                <span className="text-sm font-medium text-gray-900">15</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Maintenance completed</span>
                <span className="text-sm font-medium text-gray-900">3</span>
              </div>
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">Utilization rate</span>
                  <span className="text-sm font-medium text-green-600">↑ 12%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilitatorDashboard;