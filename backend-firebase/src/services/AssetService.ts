import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase/config";

export interface Asset {
  id?: string;
  name: string;
  description?: string;
  category: string;
  status: 'available' | 'assigned' | 'maintenance' | 'retired';
  location?: string;
  assignedTo?: {
    name: string;
    email?: string;
    location?: string;
  };
  assignedDate?: string;
  serialNumber?: string;
  manufacturer?: string;
  purchaseDate?: string;
  value?: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

interface ServiceResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

export class AssetService {
  private static collectionName = 'assets';

  static async getAllAssets(): Promise<ServiceResponse<Asset[]>> {
    try {
      const assetsRef = collection(db, this.collectionName);
      const q = query(assetsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      const assets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Asset[];

      return {
        success: true,
        data: assets
      };
    } catch (error: unknown) {
      console.error('Get assets error:', error);
      return {
        success: false,
        message: 'Failed to fetch assets'
      };
    }
  }

  static async getAsset(id: string): Promise<ServiceResponse<Asset>> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          success: true,
          data: { id: docSnap.id, ...docSnap.data() } as Asset
        };
      } else {
        return {
          success: false,
          message: 'Asset not found'
        };
      }
    } catch (error: unknown) {
      console.error('Get asset error:', error);
      return {
        success: false,
        message: 'Failed to fetch asset'
      };
    }
  }

  static async createAsset(asset: Omit<Asset, 'id'>): Promise<ServiceResponse<{ id: string }>> {
    try {
      const assetsRef = collection(db, this.collectionName);
      const newAsset = {
        ...asset,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(assetsRef, newAsset);

      return {
        success: true,
        data: { id: docRef.id },
        message: 'Asset created successfully'
      };
    } catch (error: unknown) {
      console.error('Create asset error:', error);
      return {
        success: false,
        message: 'Failed to create asset'
      };
    }
  }

  static async updateAsset(id: string, asset: Partial<Asset>): Promise<ServiceResponse> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        ...asset,
        updatedAt: serverTimestamp()
      });

      return {
        success: true,
        message: 'Asset updated successfully'
      };
    } catch (error: unknown) {
      console.error('Update asset error:', error);
      return {
        success: false,
        message: 'Failed to update asset'
      };
    }
  }

  static async deleteAsset(id: string): Promise<ServiceResponse> {
    try {
      await deleteDoc(doc(db, this.collectionName, id));
      return {
        success: true,
        message: 'Asset deleted successfully'
      };
    } catch (error: unknown) {
      console.error('Delete asset error:', error);
      return {
        success: false,
        message: 'Failed to delete asset'
      };
    }
  }

  static async getAssetsByStatus(status: Asset['status']): Promise<ServiceResponse<Asset[]>> {
    try {
      const assetsRef = collection(db, this.collectionName);
      const q = query(assetsRef, where("status", "==", status));
      const snapshot = await getDocs(q);

      const assets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Asset[];

      return {
        success: true,
        data: assets
      };
    } catch (error: unknown) {
      console.error('Get assets by status error:', error);
      return {
        success: false,
        message: 'Failed to fetch assets'
      };
    }
  }

  static async getAssetsByLocation(locationId: string): Promise<ServiceResponse<Asset[]>> {
    try {
      const assetsRef = collection(db, this.collectionName);
      const q = query(assetsRef, where("location", "==", locationId));
      const snapshot = await getDocs(q);

      const assets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Asset[];

      return {
        success: true,
        data: assets
      };
    } catch (error: unknown) {
      console.error('Get assets by location error:', error);
      return {
        success: false,
        message: 'Failed to fetch assets'
      };
    }
  }

  static async searchAssets(searchTerm: string): Promise<ServiceResponse<Asset[]>> {
    try {
      const assetsRef = collection(db, this.collectionName);
      const snapshot = await getDocs(assetsRef);

      const assets = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Asset))
        .filter(asset =>
          asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );

      return {
        success: true,
        data: assets
      };
    } catch (error: unknown) {
      console.error('Search assets error:', error);
      return {
        success: false,
        message: 'Failed to search assets'
      };
    }
  }
}

export default AssetService;