import { db } from '../firebase/config';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';

// Define Asset type based on your Firestore structure
interface Asset {
    id: string;
    assetId: string;
    category: string;
    condition: string;
    createdAt: Timestamp;  // Fixed: Use Timestamp type instead of any
    currentLocationId: string;
    name: string;
    status: 'available' | 'assigned' | 'maintenance';
    type: string;
}

export interface DashboardStats {
    totalAssets: number;
    availableAssets: number;
    assignedAssets: number;
    maintenanceAssets: number;
    byCategory: { name: string; value: number }[];
    byStatus: { name: string; value: number }[];
    byType: { name: string; value: number }[];
    byLocation: { locationId: string; count: number; locationName?: string }[];
    recentAssets: RecentAsset[];
}

interface RecentAsset {
    id: string;
    name: string;
    type: string;
    createdAt: Timestamp;  // Fixed: Use Timestamp type instead of any
}

interface LocationAssetData {
    locationId: string;
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
}

export interface ConditionStats {
    overall: { condition: string; count: number }[];
    byType: { type: string; conditions: { condition: string; count: number }[] }[];
}

class AnalyticsService {
    async getAssetDashboardStats(): Promise<DashboardStats> {
        try {
            const assetsRef = collection(db, 'assets');
            const assetsSnapshot = await getDocs(assetsRef);

            const stats: DashboardStats = {
                totalAssets: 0,
                availableAssets: 0,
                assignedAssets: 0,
                maintenanceAssets: 0,
                byCategory: [],
                byStatus: [],
                byType: [],
                byLocation: [],
                recentAssets: []
            };

            // Maps for aggregation
            const categoryMap = new Map<string, number>();
            const statusMap = new Map<string, number>();
            const typeMap = new Map<string, number>();
            const locationMap = new Map<string, number>();

            // Recent assets (last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const recentAssets: RecentAsset[] = [];

            assetsSnapshot.docs.forEach(doc => {
                const assetData = doc.data();
                const asset: Asset = {
                    id: doc.id,
                    assetId: assetData.assetId,
                    category: assetData.category,
                    condition: assetData.condition,
                    createdAt: assetData.createdAt,
                    currentLocationId: assetData.currentLocationId,
                    name: assetData.name,
                    status: assetData.status,
                    type: assetData.type
                };

                // Count total
                stats.totalAssets++;

                // Count by status
                switch (asset.status) {
                    case 'available':
                        stats.availableAssets++;
                        break;
                    case 'assigned':
                        stats.assignedAssets++;
                        break;
                    case 'maintenance':
                        stats.maintenanceAssets++;
                        break;
                }

                // Aggregate by category
                if (asset.category) {
                    categoryMap.set(asset.category, (categoryMap.get(asset.category) || 0) + 1);
                }

                // Aggregate by status
                if (asset.status) {
                    statusMap.set(asset.status, (statusMap.get(asset.status) || 0) + 1);
                }

                // Aggregate by type
                if (asset.type) {
                    typeMap.set(asset.type, (typeMap.get(asset.type) || 0) + 1);
                }

                // Aggregate by location
                if (asset.currentLocationId) {
                    locationMap.set(asset.currentLocationId, (locationMap.get(asset.currentLocationId) || 0) + 1);
                }

                // Check if recent - Fixed: Use toMillis() or toDate() comparison
                if (asset.createdAt?.toDate() > thirtyDaysAgo) {
                    recentAssets.push({
                        id: asset.id,
                        name: asset.name,
                        type: asset.type,
                        createdAt: asset.createdAt
                    });
                }
            });

            // Convert maps to arrays
            stats.byCategory = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));
            stats.byStatus = Array.from(statusMap.entries()).map(([name, value]) => ({ name, value }));
            stats.byType = Array.from(typeMap.entries()).map(([name, value]) => ({ name, value }));
            stats.byLocation = Array.from(locationMap.entries()).map(([locationId, count]) => ({ locationId, count }));
            stats.recentAssets = recentAssets
                .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()) // Fixed: Use toMillis()
                .slice(0, 5);

            return stats;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    }

    // Get assets by location with location details
    async getAssetsByLocation(locationIds?: string[]): Promise<LocationAssetData[]> {
        try {
            const assetsRef = collection(db, 'assets');
            let q = query(assetsRef);

            if (locationIds && locationIds.length > 0) {
                q = query(assetsRef, where('currentLocationId', 'in', locationIds));
            }

            const snapshot = await getDocs(q);
            const locationMap = new Map<string, LocationAssetData>();

            snapshot.docs.forEach(doc => {
                const asset = doc.data() as Asset;
                const locationId = asset.currentLocationId || 'unassigned';

                if (!locationMap.has(locationId)) {
                    locationMap.set(locationId, {
                        locationId,
                        total: 0,
                        byStatus: {},
                        byType: {}
                    });
                }

                const locationData = locationMap.get(locationId)!;
                locationData.total++;
                locationData.byStatus[asset.status] = (locationData.byStatus[asset.status] || 0) + 1;
                locationData.byType[asset.type] = (locationData.byType[asset.type] || 0) + 1;
            });

            return Array.from(locationMap.values());
        } catch (error) {
            console.error('Error fetching assets by location:', error);
            return [];
        }
    }

    // Get asset condition analytics
    async getAssetConditionStats(): Promise<ConditionStats> {
        try {
            const assetsRef = collection(db, 'assets');
            const snapshot = await getDocs(assetsRef);

            const conditionMap = new Map<string, number>();
            const conditionByType = new Map<string, Map<string, number>>();

            snapshot.docs.forEach(doc => {
                const asset = doc.data() as Asset;
                const condition = asset.condition || 'unknown';

                // Overall condition
                conditionMap.set(condition, (conditionMap.get(condition) || 0) + 1);

                // Condition by type
                if (!conditionByType.has(asset.type)) {
                    conditionByType.set(asset.type, new Map<string, number>());
                }

                const typeConditionMap = conditionByType.get(asset.type)!;
                typeConditionMap.set(condition, (typeConditionMap.get(condition) || 0) + 1);
            });

            return {
                overall: Array.from(conditionMap.entries()).map(([condition, count]) => ({ condition, count })),
                byType: Array.from(conditionByType.entries()).map(([type, conditions]) => ({
                    type,
                    conditions: Array.from(conditions.entries()).map(([condition, count]) => ({ condition, count }))
                }))
            };
        } catch (error) {
            console.error('Error fetching condition stats:', error);
            return { overall: [], byType: [] };
        }
    }
}

export const analyticsService = new AnalyticsService();