// backend-firebase/src/services/AssetService.ts - Fixed version
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
  serverTimestamp,
  DocumentData
} from "firebase/firestore";
import { db } from "../firebase/config";
import { Asset, CreateAssetDto, UpdateAssetDto } from "../../../src/core/entities/Asset";

interface ServiceResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export class AssetService {
  private static collectionName = 'assets';

  // Convert Firestore document to Asset
  private static convertToAsset(docData: DocumentData, docId: string): Asset {
    const data = docData;
    return {
      id: docId,
      assetId: data.assetId || '',
      name: data.name || '',
      category: data.category || '',
      status: data.status || 'available',
      condition: data.condition || 'good',
      currentLocationId: data.currentLocationId || '',
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate(),

      // Optional fields
      type: data.type,
      serialNumber: data.serialNumber,
      manufacturer: data.manufacturer,
      model: data.model,
      purchaseDate: data.purchaseDate,
      purchasePrice: data.purchasePrice,
      value: data.value,
      description: data.description,
      assignedTo: data.assignedTo,
      assignmentDate: data.assignmentDate,
      notes: data.notes,
      tags: data.tags
      // Removed: createdBy, updatedBy, specifications
    };
  }

  // Convert Asset to Firestore data
  private static convertToFirestore(asset: Partial<Asset>): DocumentData {
    const firestoreData: Record<string, unknown> = {};

    // Required fields
    if (asset.name !== undefined) firestoreData.name = asset.name;
    if (asset.assetId !== undefined) firestoreData.assetId = asset.assetId;
    if (asset.category !== undefined) firestoreData.category = asset.category;
    if (asset.status !== undefined) firestoreData.status = asset.status;
    if (asset.condition !== undefined) firestoreData.condition = asset.condition;
    if (asset.currentLocationId !== undefined) firestoreData.currentLocationId = asset.currentLocationId;

    // Optional fields
    if (asset.type !== undefined) firestoreData.type = asset.type;
    if (asset.serialNumber !== undefined) firestoreData.serialNumber = asset.serialNumber;
    if (asset.manufacturer !== undefined) firestoreData.manufacturer = asset.manufacturer;
    if (asset.model !== undefined) firestoreData.model = asset.model;
    if (asset.purchaseDate !== undefined) firestoreData.purchaseDate = asset.purchaseDate;
    if (asset.purchasePrice !== undefined) firestoreData.purchasePrice = asset.purchasePrice;
    if (asset.value !== undefined) firestoreData.value = asset.value;
    if (asset.description !== undefined) firestoreData.description = asset.description;
    if (asset.assignedTo !== undefined) firestoreData.assignedTo = asset.assignedTo;
    if (asset.assignmentDate !== undefined) firestoreData.assignmentDate = asset.assignmentDate;
    if (asset.notes !== undefined) firestoreData.notes = asset.notes;
    if (asset.tags !== undefined) firestoreData.tags = asset.tags;
    // Removed: createdBy, updatedBy, specifications

    // Timestamps
    firestoreData.updatedAt = serverTimestamp();

    return firestoreData;
  }

  static async getAllAssets(): Promise<ServiceResponse<Asset[]>> {
    try {
      const assetsRef = collection(db, this.collectionName);
      const q = query(assetsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      const assets = snapshot.docs.map(doc =>
        this.convertToAsset(doc.data(), doc.id)
      );

      return {
        success: true,
        data: assets
      };
    } catch (error: unknown) {
      console.error('Get assets error:', error);
      return {
        success: false,
        message: 'Failed to fetch assets',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async getAsset(id: string): Promise<ServiceResponse<Asset>> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const asset = this.convertToAsset(docSnap.data(), docSnap.id);
        return {
          success: true,
          data: asset
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
        message: 'Failed to fetch asset',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async createAsset(assetData: CreateAssetDto): Promise<ServiceResponse<{ id: string }>> {
    try {
      const assetsRef = collection(db, this.collectionName);

      // Prepare data for Firestore
      const firestoreData = this.convertToFirestore(assetData);
      firestoreData.createdAt = serverTimestamp();

      const docRef = await addDoc(assetsRef, firestoreData);

      return {
        success: true,
        data: { id: docRef.id },
        message: 'Asset created successfully'
      };
    } catch (error: unknown) {
      console.error('Create asset error:', error);
      return {
        success: false,
        message: 'Failed to create asset',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async updateAsset(id: string, updates: UpdateAssetDto): Promise<ServiceResponse> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return {
          success: false,
          message: 'Asset not found'
        };
      }

      const firestoreData = this.convertToFirestore(updates);
      await updateDoc(docRef, firestoreData);

      return {
        success: true,
        message: 'Asset updated successfully'
      };
    } catch (error: unknown) {
      console.error('Update asset error:', error);
      return {
        success: false,
        message: 'Failed to update asset',
        error: error instanceof Error ? error.message : 'Unknown error'
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
        message: 'Failed to delete asset',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async getAssetsByStatus(status: Asset['status']): Promise<ServiceResponse<Asset[]>> {
    try {
      const assetsRef = collection(db, this.collectionName);
      const q = query(assetsRef, where("status", "==", status));
      const snapshot = await getDocs(q);

      const assets = snapshot.docs.map(doc =>
        this.convertToAsset(doc.data(), doc.id)
      );

      return {
        success: true,
        data: assets
      };
    } catch (error: unknown) {
      console.error('Get assets by status error:', error);
      return {
        success: false,
        message: 'Failed to fetch assets by status',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async searchAssets(searchTerm: string): Promise<ServiceResponse<Asset[]>> {
    try {
      const assetsRef = collection(db, this.collectionName);
      const snapshot = await getDocs(assetsRef);

      const assets = snapshot.docs
        .map(doc => this.convertToAsset(doc.data(), doc.id))
        .filter(asset => {
          const searchLower = searchTerm.toLowerCase();
          return (
            asset.name.toLowerCase().includes(searchLower) ||
            (asset.assetId && asset.assetId.toLowerCase().includes(searchLower)) ||
            (asset.serialNumber && asset.serialNumber.toLowerCase().includes(searchLower)) ||
            (asset.description && asset.description.toLowerCase().includes(searchLower))
          );
        });

      return {
        success: true,
        data: assets
      };
    } catch (error: unknown) {
      console.error('Search assets error:', error);
      return {
        success: false,
        message: 'Failed to search assets',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export default AssetService;