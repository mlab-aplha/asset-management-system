import { BaseService, isValidLocation } from './BaseService';
import { collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../backend-firebase/src/firebase/firebase/config';

export interface Asset {
  id: string;
  assetId: string; // ASSET-001 format
  name: string;
  category: 'Laptop' | 'Workstation' | 'Tablet' | 'Camera' | 'Server' | 'Network Equipment' | 'Other';
  status: 'available' | 'assigned' | 'maintenance' | 'retired';
  location: 'Tshwane' | 'Polokwane' | 'Galeshewe';
  serialNumber?: string;
  purchaseDate: Date;
  value: number; // ZAR
  assignedTo?: string; // User ID
  assignedDate?: Date;
  manufacturer?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class AssetService extends BaseService<Asset> {
  constructor() {
    super('assets');
  }

  async createAsset(assetData: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'assetId'>): Promise<string> {
    // Validate South Africa location
    if (!isValidLocation(assetData.location)) {
      throw new Error(`Invalid location. Must be Tshwane, Polokwane, or Galeshewe`);
    }

    // Validate ZAR value
    if (assetData.value <= 0) {
      throw new Error('Asset value must be positive ZAR amount');
    }

    // Generate asset ID (ASSET-001, ASSET-002, etc.)
    const lastAsset = await this.getLastAsset();
    const nextId = this.generateNextAssetId(lastAsset);

    const asset: Omit<Asset, 'id'> = {
      ...assetData,
      assetId: nextId,
      status: assetData.status || 'available',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(this.getCollection(), asset);
    return docRef.id;
  }

  async getAssetsByLocation(location: 'Tshwane' | 'Polokwane' | 'Galeshewe'): Promise<Asset[]> {
    return this.queryByField('location', location);
  }

  async getAssetsByStatus(status: Asset['status']): Promise<Asset[]> {
    return this.queryByField('status', status);
  }

  async assignAsset(assetId: string, userId: string, condition: 'excellent' | 'good' | 'fair' | 'poor'): Promise<void> {
    const asset = await this.getById(assetId);
    if (!asset) throw new Error('Asset not found');
    
    if (asset.status !== 'available') {
      throw new Error(`Asset is currently ${asset.status}`);
    }

    // Update asset
    await this.update(assetId, {
      status: 'assigned',
      assignedTo: userId,
      assignedDate: new Date()
    } as Partial<Asset>);

    // Create assignment record
    const assignments = collection(db, 'assignments');
    await addDoc(assignments, {
      assetId: asset.assetId,
      userId,
      assignedAt: new Date(),
      condition,
      createdAt: new Date()
    });
  }

  async getLocationStats() {
    const allAssets = await this.getAll();
    
    const stats = {
      Tshwane: this.calculateStats(allAssets, 'Tshwane'),
      Polokwane: this.calculateStats(allAssets, 'Polokwane'),
      Galeshewe: this.calculateStats(allAssets, 'Galeshewe')
    };

    return stats;
  }

  private calculateStats(assets: Asset[], location: string) {
    const locationAssets = assets.filter(a => a.location === location);
    
    return {
      total: locationAssets.length,
      assigned: locationAssets.filter(a => a.status === 'assigned').length,
      available: locationAssets.filter(a => a.status === 'available').length,
      maintenance: locationAssets.filter(a => a.status === 'maintenance').length,
      totalValue: locationAssets.reduce((sum, a) => sum + a.value, 0)
    };
  }

  private async getLastAsset(): Promise<Asset | null> {
    const q = query(this.getCollection(), orderBy('assetId', 'desc'), limit(1));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty ? null : querySnapshot.docs[0].data() as Asset;
  }

  private generateNextAssetId(lastAsset: Asset | null): string {
    if (!lastAsset || !lastAsset.assetId) return 'ASSET-001';
    
    const lastId = lastAsset.assetId;
    const lastNum = parseInt(lastId.split('-')[1]);
    return `ASSET-${(lastNum + 1).toString().padStart(3, '0')}`;
  }
}

// Export singleton instance
export const assetService = new AssetService();
