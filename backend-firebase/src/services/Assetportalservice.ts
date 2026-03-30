import {
    collection, query, orderBy, getDocs, getDoc,
    doc, addDoc, updateDoc, deleteDoc, where,
    serverTimestamp, Timestamp, WithFieldValue, DocumentData
} from 'firebase/firestore';
import { db } from '../firebase/config';
import {
    Asset, AssetFormData, AssetFilters, AssetStats,
    getAssetScopeForRole
} from '../../../src/core/entities/Asset';
import { UserRole } from '../../../src/core/entities/User';

export class AssetPortalService {
    private static readonly COLLECTION = 'assets';

    async getAssetsForRole(
        role: UserRole,
        assignedHubIds: string[],
        filters?: AssetFilters
    ): Promise<Asset[]> {
        const scope = getAssetScopeForRole(role, assignedHubIds);
        if (scope.scopedToHubs && scope.hubIds.length === 0) return [];

        try {
            const ref = collection(db, AssetPortalService.COLLECTION);
            let q = query(ref, orderBy('createdAt', 'desc'));

            if (filters?.status && filters.status !== 'all')
                q = query(q, where('status', '==', filters.status));
            if (filters?.category && filters.category !== 'all')
                q = query(q, where('category', '==', filters.category));
            if (filters?.condition && filters.condition !== 'all')
                q = query(q, where('condition', '==', filters.condition));

            if (scope.scopedToHubs && scope.hubIds.length > 0) {
                q = query(q, where('currentLocationId', 'in', scope.hubIds));
            } else if (filters?.locationId) {
                q = query(q, where('currentLocationId', '==', filters.locationId));
            }

            const snapshot = await getDocs(q);
            let assets: Asset[] = snapshot.docs.map(d => this.mapDoc(d));

            if (filters?.searchTerm) {
                const term = filters.searchTerm.toLowerCase();
                assets = assets.filter(a =>
                    a.name?.toLowerCase().includes(term) ||
                    a.assetId?.toLowerCase().includes(term) ||
                    a.serialNumber?.toLowerCase().includes(term) ||
                    a.manufacturer?.toLowerCase().includes(term) ||
                    a.model?.toLowerCase().includes(term) ||
                    a.type?.toLowerCase().includes(term)
                );
            }
            return assets;
        } catch (error) {
            console.error('Error fetching assets:', error);
            throw new Error('Failed to fetch assets');
        }
    }

    async getAssetById(id: string): Promise<Asset | null> {
        try {
            const ref = doc(db, AssetPortalService.COLLECTION, id);
            const snapshot = await getDoc(ref);
            if (!snapshot.exists()) return null;
            return this.mapDoc(snapshot);
        } catch (error) {
            console.error('Error fetching asset:', error);
            throw new Error('Failed to fetch asset');
        }
    }

    async createAsset(data: AssetFormData): Promise<Asset> {
        try {
            const payload: WithFieldValue<DocumentData> = {
                assetId: data.assetId,
                name: data.name,
                type: data.type,
                category: data.category,
                status: data.status || 'available',
                condition: data.condition,
                currentLocationId: data.currentLocationId,
                locationName: data.locationName || '',
                description: data.description || '',
                serialNumber: data.serialNumber || '',
                manufacturer: data.manufacturer || '',
                model: data.model || '',
                purchaseDate: data.purchaseDate ? Timestamp.fromDate(data.purchaseDate) : null,
                purchasePrice: data.purchasePrice || null,
                assignedTo: data.assignedTo || null,
                assignedToName: data.assignedToName || null,
                notes: data.notes || '',
                tags: data.tags || [],
                lastMaintenanceDate: null,
                nextMaintenanceDate: null,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            const docRef = await addDoc(
                collection(db, AssetPortalService.COLLECTION), payload
            );
            return {
                id: docRef.id,
                ...data,
                status: (data.status || 'available'),
                createdAt: new Date(),
                updatedAt: new Date()
            } as Asset;
        } catch (error) {
            console.error('Error creating asset:', error);
            throw new Error('Failed to create asset');
        }
    }

    async updateAsset(id: string, updates: Partial<AssetFormData>): Promise<Asset> {
        try {
            const ref = doc(db, AssetPortalService.COLLECTION, id);
            const snapshot = await getDoc(ref);
            if (!snapshot.exists()) throw new Error('Asset not found');

            // Cast to WithFieldValue to satisfy Firestore's updateDoc signature
            const payload: WithFieldValue<DocumentData> = {
                ...updates,
                updatedAt: serverTimestamp()
            };
            if (updates.purchaseDate)
                payload.purchaseDate = Timestamp.fromDate(updates.purchaseDate);

            await updateDoc(ref, payload);
            const updated = await this.getAssetById(id);
            if (!updated) throw new Error('Asset not found after update');
            return updated;
        } catch (error) {
            console.error('Error updating asset:', error);
            throw new Error('Failed to update asset');
        }
    }

    async updateAssetStatus(id: string, status: Asset['status']): Promise<Asset> {
        const ref = doc(db, AssetPortalService.COLLECTION, id);
        await updateDoc(ref, { status, updatedAt: serverTimestamp() });
        const updated = await this.getAssetById(id);
        if (!updated) throw new Error('Asset not found after status update');
        return updated;
    }

    async deleteAsset(id: string): Promise<void> {
        try {
            const ref = doc(db, AssetPortalService.COLLECTION, id);
            const snapshot = await getDoc(ref);
            if (!snapshot.exists()) throw new Error('Asset not found');
            await deleteDoc(ref);
        } catch (error) {
            console.error('Error deleting asset:', error);
            throw new Error('Failed to delete asset');
        }
    }

    async getStats(role: UserRole, assignedHubIds: string[]): Promise<AssetStats> {
        try {
            const assets = await this.getAssetsForRole(role, assignedHubIds);
            const byCategory: Record<string, number> = {};
            const byLocation: Record<string, number> = {};
            const byCondition: Record<string, number> = {};

            assets.forEach(a => {
                byCategory[a.category] = (byCategory[a.category] || 0) + 1;
                const loc = a.locationName || a.currentLocationId || 'Unknown';
                byLocation[loc] = (byLocation[loc] || 0) + 1;
                byCondition[a.condition] = (byCondition[a.condition] || 0) + 1;
            });

            return {
                total: assets.length,
                available: assets.filter(a => a.status === 'available').length,
                assigned: assets.filter(a => a.status === 'assigned').length,
                maintenance: assets.filter(a => a.status === 'maintenance').length,
                retired: assets.filter(a => a.status === 'retired').length,
                byCategory,
                byLocation,
                byCondition
            };
        } catch (error) {
            console.error('Error getting asset stats:', error);
            throw new Error('Failed to get asset stats');
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private mapDoc(d: any): Asset {
        const data = d.data();
        return {
            id: d.id,
            assetId: data.assetId,
            name: data.name,
            type: data.type,
            category: data.category,
            status: data.status,
            condition: data.condition,
            currentLocationId: data.currentLocationId,
            locationName: data.locationName,
            description: data.description,
            serialNumber: data.serialNumber,
            manufacturer: data.manufacturer,
            model: data.model,
            purchaseDate: data.purchaseDate?.toDate?.() || undefined,
            purchasePrice: data.purchasePrice,
            value: data.value,
            assignedTo: data.assignedTo,
            assignedToName: data.assignedToName,
            assignmentDate: data.assignmentDate?.toDate?.() || undefined,
            notes: data.notes,
            tags: data.tags || [],
            lastMaintenanceDate: data.lastMaintenanceDate?.toDate?.() || undefined,
            nextMaintenanceDate: data.nextMaintenanceDate?.toDate?.() || undefined,
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || undefined
        };
    }
}

export const assetPortalService = new AssetPortalService();