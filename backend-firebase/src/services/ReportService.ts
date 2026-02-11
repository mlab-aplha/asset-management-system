import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

export const ReportService = {
  async getAssetUsageReport() {
    try {
      const assetsSnapshot = await getDocs(collection(db, 'assets'));
      const assignmentsSnapshot = await getDocs(collection(db, 'assignments'));
      
      const assignments = assignmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const reportData = assetsSnapshot.docs.map(assetDoc => {
        const asset = { id: assetDoc.id, ...assetDoc.data() };
        const assetAssignments = assignments.filter(a => a.assetId === asset.id);
        
        return {
          assetId: asset.id,
          assetName: asset.name || 'Unknown',
          category: asset.category || 'Uncategorized',
          totalAssignments: assetAssignments.length,
          totalDays: 0,
          currentUser: assetAssignments.find(a => a.status === 'active')?.userName || null,
          lastAssigned: assetAssignments[0]?.assignedDate || null,
          status: asset.status || 'available'
        };
      });
      
      return { success: true, data: reportData };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async getUserActivityReport() {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const assignmentsSnapshot = await getDocs(collection(db, 'assignments'));
      
      const assignments = assignmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const reportData = usersSnapshot.docs.map(userDoc => {
        const user = { id: userDoc.id, ...userDoc.data() };
        const userAssignments = assignments.filter(a => a.userId === user.id);
        
        return {
          userId: user.id,
          userName: user.name || 'Unknown',
          department: user.department || 'N/A',
          totalAssignments: userAssignments.length,
          activeAssignments: userAssignments.filter(a => a.status === 'active').length,
          overdueReturns: 0,
          lastAssignment: userAssignments[0]?.assignedDate || null,
          mostUsedCategory: 'N/A'
        };
      });
      
      return { success: true, data: reportData };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async getMaintenanceReport() {
    try {
      const assetsSnapshot = await getDocs(collection(db, 'assets'));
      
      const reportData = assetsSnapshot.docs.map(assetDoc => {
        const asset = { id: assetDoc.id, ...assetDoc.data() };
        return {
          assetId: asset.id,
          assetName: asset.name || 'Unknown',
          category: asset.category || 'Uncategorized',
          lastMaintenance: null,
          nextMaintenance: null,
          maintenanceCount: 0,
          totalCost: 0,
          status: asset.status || 'available',
          priority: 'low'
        };
      });
      
      return { success: true, data: reportData };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async getDashboardStats() {
    try {
      let pendingCount = 0, activeCount = 0, availableCount = 0;
      
      try {
        const pendingSnapshot = await getDocs(query(collection(db, 'assignmentRequests'), where('status', '==', 'pending')));
        pendingCount = pendingSnapshot.size;
      } catch (e) {}
      
      try {
        const activeSnapshot = await getDocs(query(collection(db, 'assignments'), where('status', '==', 'active')));
        activeCount = activeSnapshot.size;
      } catch (e) {}
      
      try {
        const availableSnapshot = await getDocs(query(collection(db, 'assets'), where('status', '==', 'available')));
        availableCount = availableSnapshot.size;
      } catch (e) {}

      return {
        success: true,
        data: {
          totalPending: pendingCount,
          urgentRequests: 0,
          activeAssignments: activeCount,
          overdueReturns: 0,
          availableAssets: availableCount,
          assetsInMaintenance: 0,
          totalAssets: 0,
          utilizationRate: 0,
          assignmentsToday: 0,
          returnsToday: 0
        }
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};
