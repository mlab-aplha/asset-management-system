 import { 
  collection, 
  getDocs, 
  query, 
  where,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Define types for better type safety
interface AssetData {
  id: string;
  name?: string;
  category?: string;
  status?: string;
  nextMaintenanceDate?: Date | Timestamp | string | null;
  [key: string]: any;
}

interface AssignmentData {
  id: string;
  assetId?: string;
  userId?: string;
  status?: string;
  assignedDate?: Date | Timestamp | string;
  actualReturnDate?: Date | Timestamp | string | null;
  expectedReturnDate?: Date | Timestamp | string;
  userName?: string;
  assetCategory?: string;
  facilitatorName?: string;
  [key: string]: any;
}

interface UserData {
  id: string;
  name?: string;
  department?: string;
  [key: string]: any;
}

interface MaintenanceData {
  id: string;
  assetId?: string;
  date?: Date | Timestamp | string;
  cost?: number;
  [key: string]: any;
}

export const ReportService = {
  // Asset usage report
  async getAssetUsageReport(startDate?: Date, endDate?: Date) {
    try {
      const assetsSnapshot = await getDocs(collection(db, 'assets'));
      const assignmentsSnapshot = await getDocs(collection(db, 'assignments'));
      
      const assignments = assignmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AssignmentData[];
      
      const reportData = assetsSnapshot.docs.map(assetDoc => {
        const asset = { id: assetDoc.id, ...assetDoc.data() } as AssetData;
        const assetAssignments = assignments.filter(a => a.assetId === asset.id);
        
        const totalAssignments = assetAssignments.length;
        const totalDays = assetAssignments.reduce((sum, a) => {
          if (a.actualReturnDate) {
            const start = new Date(a.assignedDate as any).getTime();
            const end = new Date(a.actualReturnDate as any).getTime();
            const days = (end - start) / (1000 * 60 * 60 * 24);
            return sum + Math.ceil(days);
          }
          return sum;
        }, 0);
        
        const currentAssignment = assetAssignments.find(a => a.status === 'active');
        
        return {
          assetId: asset.id,
          assetName: asset.name || 'Unknown',
          category: asset.category || 'Uncategorized',
          totalAssignments,
          totalDays,
          currentUser: currentAssignment?.userName || null,
          lastAssigned: assetAssignments[0]?.assignedDate || null,
          status: asset.status || 'available'
        };
      });
      
      return { success: true, data: reportData };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // User activity report
  async getUserActivityReport() {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const assignmentsSnapshot = await getDocs(collection(db, 'assignments'));
      
      const assignments = assignmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AssignmentData[];
      
      const reportData = usersSnapshot.docs.map(userDoc => {
        const user = { id: userDoc.id, ...userDoc.data() } as UserData;
        const userAssignments = assignments.filter(a => a.userId === user.id);
        
        const activeAssignments = userAssignments.filter(a => a.status === 'active').length;
        const overdueAssignments = userAssignments.filter(a => 
          a.status === 'active' && new Date(a.expectedReturnDate as any) < new Date()
        ).length;
        
        // Get most used category
        const categoryCount: Record<string, number> = {};
        userAssignments.forEach(a => {
          const category = a.assetCategory || 'Uncategorized';
          categoryCount[category] = (categoryCount[category] || 0) + 1;
        });
        
        let mostUsedCategory = 'N/A';
        let maxCount = 0;
        Object.entries(categoryCount).forEach(([category, count]) => {
          if (count > maxCount) {
            maxCount = count;
            mostUsedCategory = category;
          }
        });
        
        return {
          userId: user.id,
          userName: user.name || 'Unknown',
          department: user.department || 'N/A',
          totalAssignments: userAssignments.length,
          activeAssignments,
          overdueReturns: overdueAssignments,
          lastAssignment: userAssignments[0]?.assignedDate || null,
          mostUsedCategory
        };
      });
      
      return { success: true, data: reportData };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Maintenance report
  async getMaintenanceReport() {
    try {
      const assetsSnapshot = await getDocs(collection(db, 'assets'));
      
      // Try to get maintenance collection, handle if it doesn't exist
      let maintenanceDocs: MaintenanceData[] = [];
      try {
        const maintenanceSnapshot = await getDocs(collection(db, 'maintenance'));
        maintenanceDocs = maintenanceSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as MaintenanceData[];
      } catch (error) {
        // Collection doesn't exist yet, use empty array
        maintenanceDocs = [];
      }
      
      const reportData = assetsSnapshot.docs.map(assetDoc => {
        const asset = { id: assetDoc.id, ...assetDoc.data() } as AssetData;
        const assetMaintenance = maintenanceDocs.filter(m => m.assetId === asset.id);
        
        const totalCost = assetMaintenance.reduce((sum, m) => sum + (m.cost || 0), 0);
        
        // Sort maintenance by date
        const sortedMaintenance = [...assetMaintenance].sort((a, b) => {
          const dateA = a.date ? new Date(a.date as any).getTime() : 0;
          const dateB = b.date ? new Date(b.date as any).getTime() : 0;
          return dateB - dateA;
        });
        
        const lastMaintenance = sortedMaintenance[0]?.date || null;
        const nextMaintenance = asset.nextMaintenanceDate || null;
        
        // Calculate priority based on days until next maintenance
        let priority: 'low' | 'medium' | 'high' | 'critical' = 'low';
        if (nextMaintenance) {
          const daysUntil = Math.ceil((new Date(nextMaintenance as any).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          if (daysUntil <= 0) priority = 'critical';
          else if (daysUntil <= 7) priority = 'high';
          else if (daysUntil <= 30) priority = 'medium';
        }
        
        return {
          assetId: asset.id,
          assetName: asset.name || 'Unknown',
          category: asset.category || 'Uncategorized',
          lastMaintenance,
          nextMaintenance,
          maintenanceCount: assetMaintenance.length,
          totalCost,
          status: asset.status || 'available',
          priority
        };
      });
      
      return { success: true, data: reportData };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Dashboard stats
  async getDashboardStats() {
    try {
      // Get counts with error handling for each collection
      let pendingCount = 0;
      let urgentCount = 0;
      let activeCount = 0;
      let overdueCount = 0;
      let availableCount = 0;
      let maintenanceCount = 0;
      let totalAssets = 0;
      let assignmentsToday = 0;
      let returnsToday = 0;
      
      // Get assignment requests stats
      try {
        const pendingSnapshot = await getDocs(query(
          collection(db, 'assignmentRequests'), 
          where('status', '==', 'pending')
        ));
        pendingCount = pendingSnapshot.size;
        
        const urgentSnapshot = await getDocs(query(
          collection(db, 'assignmentRequests'), 
          where('status', '==', 'pending'),
          where('priority', '==', 'urgent')
        ));
        urgentCount = urgentSnapshot.size;
      } catch (error) {
        // Collection might not exist yet
        console.log('assignmentRequests collection not ready yet');
      }
      
      // Get assignments stats
      try {
        const activeSnapshot = await getDocs(query(
          collection(db, 'assignments'), 
          where('status', '==', 'active')
        ));
        activeCount = activeSnapshot.size;
        
        const overdueSnapshot = await getDocs(query(
          collection(db, 'assignments'), 
          where('status', '==', 'active'),
          where('expectedReturnDate', '<', new Date())
        ));
        overdueCount = overdueSnapshot.size;
      } catch (error) {
        // Collection might not exist yet
        console.log('assignments collection not ready yet');
      }
      
      // Get assets stats
      try {
        const assetsSnapshot = await getDocs(collection(db, 'assets'));
        totalAssets = assetsSnapshot.size;
        
        const availableSnapshot = await getDocs(query(
          collection(db, 'assets'), 
          where('status', '==', 'available')
        ));
        availableCount = availableSnapshot.size;
        
        const maintenanceSnapshot = await getDocs(query(
          collection(db, 'assets'), 
          where('status', '==', 'maintenance')
        ));
        maintenanceCount = maintenanceSnapshot.size;
      } catch (error) {
        // Collection might not exist yet
        console.log('assets collection not ready yet');
      }
      
      // Get today's assignments and returns
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      try {
        const assignmentsTodaySnapshot = await getDocs(query(
          collection(db, 'assignments'),
          where('assignedDate', '>=', today),
          where('assignedDate', '<', tomorrow)
        ));
        assignmentsToday = assignmentsTodaySnapshot.size;
        
        const returnsTodaySnapshot = await getDocs(query(
          collection(db, 'assignments'),
          where('actualReturnDate', '>=', today),
          where('actualReturnDate', '<', tomorrow)
        ));
        returnsToday = returnsTodaySnapshot.size;
      } catch (error) {
        // Collection might not exist yet
        console.log('assignments collection not ready yet');
      }

      const utilizationRate = totalAssets > 0 
        ? Math.round((activeCount / (availableCount + activeCount)) * 100) 
        : 0;

      return {
        success: true,
        data: {
          totalPending: pendingCount,
          urgentRequests: urgentCount,
          activeAssignments: activeCount,
          overdueReturns: overdueCount,
          availableAssets: availableCount,
          assetsInMaintenance: maintenanceCount,
          totalAssets,
          utilizationRate,
          assignmentsToday,
          returnsToday
        }
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Get stats for facilitator dashboard
  async getFacilitatorStats() {
    try {
      const dashboardStats = await this.getDashboardStats();
      
      if (!dashboardStats.success) {
        return dashboardStats;
      }
      
      // Get recent activity
      let recentActivity: any[] = [];
      try {
        const activitySnapshot = await getDocs(query(
          collection(db, 'assignments'),
          orderBy('assignedDate', 'desc')
        ));
        
        recentActivity = activitySnapshot.docs.slice(0, 5).map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            type: data.actualReturnDate ? 'return' : 'checkout',
            assetName: data.assetName || 'Unknown',
            userName: data.userName || 'Unknown',
            date: data.assignedDate || data.actualReturnDate || new Date(),
            facilitatorName: data.facilitatorName || 'Unknown'
          };
        });
      } catch (error) {
        // No activity yet
        console.log('No recent activity found');
      }
      
      return {
        success: true,
        data: {
          ...dashboardStats.data,
          recentActivity
        }
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};
 