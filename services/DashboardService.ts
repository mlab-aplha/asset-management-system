import { assetService } from './AssetService';
import { userService } from './UserService';
import { locationService } from './LocationService';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../src/firebase/config';

export interface DashboardStats {
  // Asset statistics
  totalAssets: number;
  assignedAssets: number;
  availableAssets: number;
  maintenanceAssets: number;
  retiredAssets: number;
  totalAssetValue: number;
  
  // User statistics
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  managerUsers: number;
  
  // Location distribution
  tshwaneStats: LocationStats;
  polokwaneStats: LocationStats;
  galesheweStats: LocationStats;
  
  // Maintenance
  totalMaintenance: number;
  completedMaintenance: number;
  pendingMaintenance: number;
  totalMaintenanceCost: number;
  
  // Recent activity
  recentAssignments: any[];
  recentMaintenance: any[];
}

export interface LocationStats {
  assets: number;
  assigned: number;
  available: number;
  maintenance: number;
  totalValue: number;
  users: number;
}

export class DashboardService {
  async getDashboardStats(): Promise<DashboardStats> {
    // Get all data in parallel
    const [assets, users, assignments, maintenance] = await Promise.all([
      assetService.getAll(),
      userService.getAll(),
      this.getRecentAssignments(),
      this.getMaintenanceStats()
    ]);

    // Calculate statistics
    const assetStats = this.calculateAssetStats(assets);
    const userStats = this.calculateUserStats(users);
    const locationStats = this.calculateLocationStats(assets, users);

    return {
      ...assetStats,
      ...userStats,
      ...locationStats,
      ...maintenance,
      recentAssignments: assignments.slice(0, 5),
      recentMaintenance: maintenance.records.slice(0, 5)
    };
  }

  private calculateAssetStats(assets: any[]) {
    return {
      totalAssets: assets.length,
      assignedAssets: assets.filter(a => a.status === 'assigned').length,
      availableAssets: assets.filter(a => a.status === 'available').length,
      maintenanceAssets: assets.filter(a => a.status === 'maintenance').length,
      retiredAssets: assets.filter(a => a.status === 'retired').length,
      totalAssetValue: assets.reduce((sum, a) => sum + (a.value || 0), 0)
    };
  }

  private calculateUserStats(users: any[]) {
    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isActive).length,
      adminUsers: users.filter(u => u.role === 'admin').length,
      managerUsers: users.filter(u => u.role === 'manager').length
    };
  }

  private calculateLocationStats(assets: any[], users: any[]) {
    const locations = ['Tshwane', 'Polokwane', 'Galeshewe'];
    const stats: any = {};
    
    locations.forEach(location => {
      const locationAssets = assets.filter(a => a.location === location);
      const locationUsers = users.filter(u => u.hub === location);
      
      stats[`${location.toLowerCase()}Stats`] = {
        assets: locationAssets.length,
        assigned: locationAssets.filter(a => a.status === 'assigned').length,
        available: locationAssets.filter(a => a.status === 'available').length,
        maintenance: locationAssets.filter(a => a.status === 'maintenance').length,
        totalValue: locationAssets.reduce((sum, a) => sum + (a.value || 0), 0),
        users: locationUsers.length
      };
    });

    return stats;
  }

  private async getRecentAssignments() {
    const q = query(
      collection(db, 'assignments'),
      orderBy('assignedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  private async getMaintenanceStats() {
    const q = query(collection(db, 'maintenance_records'));
    const querySnapshot = await getDocs(q);
    const records = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      records,
      totalMaintenance: records.length,
      completedMaintenance: records.filter(r => r.status === 'completed').length,
      pendingMaintenance: records.filter(r => r.status === 'scheduled').length,
      totalMaintenanceCost: records.reduce((sum, r) => sum + (r.cost || 0), 0)
    };
  }

  async getAssetCategories() {
    const assets = await assetService.getAll();
    const categories: Record<string, number> = {};
    
    assets.forEach(asset => {
      const category = asset.category || 'Other';
      categories[category] = (categories[category] || 0) + 1;
    });
    
    return Object.entries(categories).map(([name, count]) => ({ name, count }));
  }

  async getMonthlyMaintenanceCost() {
    const maintenance = await getDocs(collection(db, 'maintenance_records'));
    const records = maintenance.docs.map(doc => {
      const data = doc.data();
      // Handle Firestore timestamp conversion
      let performedDate = data.performedDate;
      if (performedDate && typeof performedDate.toDate === 'function') {
        performedDate = performedDate.toDate();
      }
      return { ...data, performedDate };
    });
    
    const monthlyCosts: Record<string, number> = {};
    
    records.forEach(record => {
      if (record.performedDate && record.status === 'completed') {
        const date = new Date(record.performedDate);
        const month = date.toLocaleString('en-ZA', { month: 'short', year: 'numeric' });
        monthlyCosts[month] = (monthlyCosts[month] || 0) + (record.cost || 0);
      }
    });
    
    return Object.entries(monthlyCosts)
      .map(([month, cost]) => ({ month, cost }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }
}

// Export singleton instance
export const dashboardService = new DashboardService();
