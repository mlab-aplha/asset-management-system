import React, { useState, useEffect } from 'react';
import AssetUsageReport from '../../features/facilitator/reporting/AssetUsageReport';
import UserActivityReport from '../../features/facilitator/reporting/UserActivityReport';
import MaintenanceReport from '../../features/facilitator/reporting/MaintenanceReport';
import { ReportService } from '../../../backend-firebase/src/services/ReportService';

// Define the EXACT types that the components expect
type ReportType = 'asset' | 'user' | 'maintenance';

const ReportsPage: React.FC = () => {
  const [activeReport, setActiveReport] = useState<ReportType>('asset');
  const [assetData, setAssetData] = useState<any[]>([]);
  const [userData, setUserData] = useState<any[]>([]);
  const [maintenanceData, setMaintenanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      
      try {
        if (activeReport === 'asset') {
          const result = await ReportService.getAssetUsageReport();
          if (result.success && Array.isArray(result.data)) {
            setAssetData(result.data);
          }
        }
        
        if (activeReport === 'user') {
          const result = await ReportService.getUserActivityReport();
          if (result.success && Array.isArray(result.data)) {
            setUserData(result.data);
          }
        }
        
        if (activeReport === 'maintenance') {
          const result = await ReportService.getMaintenanceReport();
          if (result.success && Array.isArray(result.data)) {
            setMaintenanceData(result.data);
          }
        }
      } catch (error) {
        console.error('Error fetching report:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReports();
  }, [activeReport]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Reports</h1>
      
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setActiveReport('asset')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            activeReport === 'asset'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Asset Usage
        </button>
        <button
          onClick={() => setActiveReport('user')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            activeReport === 'user'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          User Activity
        </button>
        <button
          onClick={() => setActiveReport('maintenance')}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            activeReport === 'maintenance'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Maintenance
        </button>
      </div>

      {activeReport === 'asset' && (
        <AssetUsageReport data={assetData} loading={loading} />
      )}
      {activeReport === 'user' && (
        <UserActivityReport data={userData} loading={loading} />
      )}
      {activeReport === 'maintenance' && (
        <MaintenanceReport data={maintenanceData} loading={loading} />
      )}
    </div>
  );
};

export default ReportsPage;
