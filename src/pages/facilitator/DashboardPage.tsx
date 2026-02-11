import React, { useState, useEffect } from 'react';
import FacilitatorDashboard from '../../features/facilitator/dashboard/FacilitatorDashboard';
import { useAssignmentRequests, useAssignmentStats } from '../../features/facilitator/asset-assignment/hooks';
import { AssignmentService } from '../../../backend-firebase/src/services/AssignmentService';

interface OverdueAssignment {
  id: string;
  assetName: string;
  assetSerialNumber: string;
  userName: string;
  userEmail: string;
  expectedReturnDate: Date | string;
  daysOverdue: number;
}

const DashboardPage: React.FC = () => {
  const { requests, loading: requestsLoading } = useAssignmentRequests({ status: 'pending' });
  const { stats, loading: statsLoading } = useAssignmentStats();
  const [overdueAssignments, setOverdueAssignments] = useState<OverdueAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const overdue = await AssignmentService.getOverdue();
      if (overdue.success && overdue.data) {
        // Format the data to match OverdueAssignment interface
        const formattedData = (overdue.data as any[]).map(item => ({
          id: item.id,
          assetName: item.assetName || 'Unknown',
          assetSerialNumber: item.assetSerialNumber || 'N/A',
          userName: item.userName || 'Unknown',
          userEmail: item.userEmail || '',
          expectedReturnDate: item.expectedReturnDate,
          daysOverdue: item.daysOverdue || 0
        }));
        setOverdueAssignments(formattedData);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleQuickAction = (action: string) => {
    switch(action) {
      case 'checkout':
        window.location.href = '/facilitator/checkout';
        break;
      case 'request':
        window.location.href = '/facilitator/requests';
        break;
      case 'report':
        window.location.href = '/facilitator/reports';
        break;
      default:
        break;
    }
  };

  return (
    <FacilitatorDashboard
      stats={{
        totalPending: stats?.totalPending || 0,
        urgentRequests: stats?.urgentRequests || 0,
        activeAssignments: stats?.activeAssignments || 0,
        overdueReturns: overdueAssignments.length,
        availableAssets: stats?.availableAssets || 0,
        assetsInMaintenance: 0
      }}
      pendingRequests={requests}
      overdueAssignments={overdueAssignments}
      loading={requestsLoading || statsLoading || loading}
      onQuickAction={handleQuickAction}
    />
  );
};

export default DashboardPage;
