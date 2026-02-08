  import { BaseService } from './BaseService';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  where, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '../backend-firebase/src/firebase/firebase/config';
import { AssetValidations } from '../validations/asset.validations';

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
    // Validate asset data using AssetValidations
    const validation = AssetValidations.validateCreateAsset(assetData);
    if (!validation.isValid) {
      throw new Error(`Asset validation failed: ${validation.errors.join(', ')}`);
    }

    // Generate asset ID (ASSET-001, ASSET-002, etc.)
    const lastAsset = await this.getLastAsset();
    const nextId = AssetValidations.generateAssetId(lastAsset?.assetId);

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

  async updateAsset(id: string, updates: Partial<Omit<Asset, 'id' | 'assetId' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    // Validate update data
    const validation = AssetValidations.validateUpdateAsset(updates);
    if (!validation.isValid) {
      throw new Error(`Asset update validation failed: ${validation.errors.join(', ')}`);
    }

    await this.update(id, {
      ...updates,
      updatedAt: new Date()
    } as Partial<Asset>);
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

    // Validate condition
    const validConditions = ['excellent', 'good', 'fair', 'poor'];
    if (!validConditions.includes(condition)) {
      throw new Error(`Invalid condition. Must be one of: ${validConditions.join(', ')}`);
    }

    // Validate user exists (basic check)
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required for assignment');
    }

    // Update asset
    await this.update(assetId, {
      status: 'assigned',
      assignedTo: userId,
      assignedDate: new Date(),
      updatedAt: new Date()
    } as Partial<Asset>);

    // Create assignment record
    const assignments = collection(db, 'assignments');
    await addDoc(assignments, {
      assetId: asset.assetId,
      userId,
      assignedAt: new Date(),
      condition,
      createdAt: new Date(),
      updatedAt: new Date(),
      notes: `Asset assigned to user ${userId}`
    });
  }

  async returnAsset(assetId: string, condition: 'excellent' | 'good' | 'fair' | 'poor', notes?: string): Promise<void> {
    const asset = await this.getById(assetId);
    if (!asset) throw new Error('Asset not found');
    
    if (asset.status !== 'assigned') {
      throw new Error(`Asset is not currently assigned. Status: ${asset.status}`);
    }

    // Validate condition
    const validConditions = ['excellent', 'good', 'fair', 'poor'];
    if (!validConditions.includes(condition)) {
      throw new Error(`Invalid condition. Must be one of: ${validConditions.join(', ')}`);
    }

    // Update asset - clear assignment
    await this.update(assetId, {
      status: 'available',
      assignedTo: undefined,
      assignedDate: undefined,
      updatedAt: new Date()
    } as Partial<Asset>);

    // Find and update the latest assignment record
    const assignmentsQuery = query(
      collection(db, 'assignments'),
      where('assetId', '==', asset.assetId),
      where('userId', '==', asset.assignedTo),
      orderBy('assignedAt', 'desc'),
      limit(1)
    );

    const assignmentsSnapshot = await getDocs(assignmentsQuery);
    
    if (!assignmentsSnapshot.empty) {
      const assignmentDoc = assignmentsSnapshot.docs[0];
      await updateDoc(assignmentDoc.ref, {
        returnedAt: new Date(),
        returnCondition: condition,
        returnNotes: notes || 'Asset returned',
        updatedAt: new Date()
      });
    } else {
      // Create a return record if no assignment found
      await addDoc(collection(db, 'assignments'), {
        assetId: asset.assetId,
        userId: asset.assignedTo,
        assignedAt: new Date(asset.assignedDate || new Date()),
        returnedAt: new Date(),
        condition: 'unknown',
        returnCondition: condition,
        returnNotes: notes || 'Asset returned (no original assignment found)',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }

  async getAssetValueSummary(): Promise<{
    totalValue: number;
    locationValues: Record<string, number>;
    categoryValues: Record<string, number>;
  }> {
    const allAssets = await this.getAll();
    
    const totalValue = allAssets.reduce((sum, asset) => sum + asset.value, 0);
    
    const locationValues: Record<string, number> = {};
    const categoryValues: Record<string, number> = {};
    
    allAssets.forEach(asset => {
      // Location values
      locationValues[asset.location] = (locationValues[asset.location] || 0) + asset.value;
      
      // Category values
      categoryValues[asset.category] = (categoryValues[asset.category] || 0) + asset.value;
    });

    return {
      totalValue,
      locationValues,
      categoryValues
    };
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
    
    const totalValue = locationAssets.reduce((sum, a) => sum + a.value, 0);
    const averageValue = locationAssets.length > 0 ? totalValue / locationAssets.length : 0;
    
    return {
      total: locationAssets.length,
      assigned: locationAssets.filter(a => a.status === 'assigned').length,
      available: locationAssets.filter(a => a.status === 'available').length,
      maintenance: locationAssets.filter(a => a.status === 'maintenance').length,
      totalValue,
      averageValue,
      formattedTotalValue: AssetValidations.formatZAR(totalValue),
      formattedAverageValue: AssetValidations.formatZAR(averageValue)
    };
  }

  private async getLastAsset(): Promise<Asset | null> {
    try {
      const q = query(this.getCollection(), orderBy('assetId', 'desc'), limit(1));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as Asset;
    } catch (error) {
      // If no assets exist yet or ordering fails
      return null;
    }
  }

  async searchAssets(criteria: {
    name?: string;
    category?: string;
    location?: string;
    status?: string;
    minValue?: number;
    maxValue?: number;
    manufacturer?: string;
  }): Promise<Asset[]> {
    const allAssets = await this.getAll();
    
    return allAssets.filter(asset => {
      // Name search (case insensitive)
      if (criteria.name && !asset.name.toLowerCase().includes(criteria.name.toLowerCase())) {
        return false;
      }
      
      // Category filter
      if (criteria.category && asset.category !== criteria.category) {
        return false;
      }
      
      // Location filter
      if (criteria.location && asset.location !== criteria.location) {
        return false;
      }
      
      // Status filter
      if (criteria.status && asset.status !== criteria.status) {
        return false;
      }
      
      // Value range filter
      if (criteria.minValue !== undefined && asset.value < criteria.minValue) {
        return false;
      }
      
      if (criteria.maxValue !== undefined && asset.value > criteria.maxValue) {
        return false;
      }
      
      // Manufacturer filter
      if (criteria.manufacturer && asset.manufacturer !== criteria.manufacturer) {
        return false;
      }
      
      return true;
    });
  }

  async getAssetsDueForMaintenance(): Promise<Asset[]> {
    const allAssets = await this.getAll();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    return allAssets.filter(asset => {
      // Assets purchased more than 1 year ago and not in maintenance
      return asset.purchaseDate < oneYearAgo && asset.status !== 'maintenance';
    });
  }

  async getAssetDepreciation(assetId: string): Promise<number> {
    const asset = await this.getById(assetId);
    if (!asset) {
      throw new Error('Asset not found');
    }
    
    return AssetValidations.calculateDepreciation(asset.purchaseDate, asset.value);
  }

  async markAsMaintenance(assetId: string, reason: string): Promise<void> {
    const asset = await this.getById(assetId);
    if (!asset) throw new Error('Asset not found');

    await this.update(assetId, {
      status: 'maintenance',
      updatedAt: new Date()
    } as Partial<Asset>);

    // Create maintenance record
    const maintenanceRecords = collection(db, 'maintenance_records');
    await addDoc(maintenanceRecords, {
      assetId: asset.assetId,
      type: 'repair',
      description: reason,
      status: 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  async completeMaintenance(assetId: string, cost: number, performedBy: string, notes?: string): Promise<void> {
    const asset = await this.getById(assetId);
    if (!asset) throw new Error('Asset not found');

    if (asset.status !== 'maintenance') {
      throw new Error(`Asset is not in maintenance. Status: ${asset.status}`);
    }

    await this.update(assetId, {
      status: 'available',
      updatedAt: new Date()
    } as Partial<Asset>);

    // Update maintenance record
    const maintenanceQuery = query(
      collection(db, 'maintenance_records'),
      where('assetId', '==', asset.assetId),
      where('status', '==', 'scheduled'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const maintenanceSnapshot = await getDocs(maintenanceQuery);
    
    if (!maintenanceSnapshot.empty) {
      const maintenanceDoc = maintenanceSnapshot.docs[0];
      await updateDoc(maintenanceDoc.ref, {
        status: 'completed',
        cost,
        performedBy,
        performedDate: new Date(),
        notes,
        updatedAt: new Date()
      });
    }
  }
}

// Export singleton instance
export const assetService = new AssetService();