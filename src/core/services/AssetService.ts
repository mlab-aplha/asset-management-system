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
import { db } from "../../../backend-firebase/src/firebase/config";

export interface Asset {
  id?: string;
  name: string;
  description: string;
  category: string;
  status: 'available' | 'assigned' | 'maintenance' | 'retired';
  location: string;
  assignedTo?: string;
  serialNumber?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  createdAt?: any;
  updatedAt?: any;
}

export class AssetService {
  static async getAllAssets() {
    try {
      const assetsRef = collection(db, "assets");
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
    } catch (error: any) {
      console.error('Get assets error:', error);
      return {
        success: false,
        message: 'Failed to fetch assets'
      };
    }
  }

  static async getAsset(id: string) {
    try {
      const docRef = doc(db, "assets", id);
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
    } catch (error: any) {
      console.error('Get asset error:', error);
      return {
        success: false,
        message: 'Failed to fetch asset'
      };
    }
  }

  static async createAsset(asset: Omit<Asset, 'id'>) {
    try {
      const assetsRef = collection(db, "assets");
      const newAsset = {
        ...asset,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(assetsRef, newAsset);
      
      return {
        success: true,
        id: docRef.id,
        message: 'Asset created successfully'
      };
    } catch (error: any) {
      console.error('Create asset error:', error);
      return {
        success: false,
        message: 'Failed to create asset'
      };
    }
  }

  static async updateAsset(id: string, asset: Partial<Asset>) {
    try {
      const docRef = doc(db, "assets", id);
      await updateDoc(docRef, {
        ...asset,
        updatedAt: serverTimestamp()
      });
      
      return {
        success: true,
        message: 'Asset updated successfully'
      };
    } catch (error: any) {
      console.error('Update asset error:', error);
      return {
        success: false,
        message: 'Failed to update asset'
      };
    }
  }

  static async deleteAsset(id: string) {
    try {
      await deleteDoc(doc(db, "assets", id));
      return {
        success: true,
        message: 'Asset deleted successfully'
      };
    } catch (error: any) {
      console.error('Delete asset error:', error);
      return {
        success: false,
        message: 'Failed to delete asset'
      };
    }
  }

  static async getAssetsByStatus(status: Asset['status']) {
    try {
      const assetsRef = collection(db, "assets");
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
    } catch (error: any) {
      console.error('Get assets by status error:', error);
      return {
        success: false,
        message: 'Failed to fetch assets'
      };
    }
  }
}
