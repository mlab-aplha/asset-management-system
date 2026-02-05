import { useState, useCallback } from 'react';
import { assetService } from '../../backend-firebase/src/firebase/services';

export interface Asset {
  id?: string;
  name: string;
  description?: string;
  category: string;
  status: 'available' | 'assigned' | 'maintenance' | 'retired';
  location?: string;
  assignedTo?: string;
  purchaseDate?: string;
  serialNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const useAssets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get all assets
  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await assetService.getAllAssets();
      if (result.success) {
        setAssets(result.data as Asset[]);
      } else {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get single asset
  const fetchAsset = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await assetService.getAsset(id);
      if (result.success) {
        return result.data as Asset;
      } else {
        setError(result.error);
        return null;
      }
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create asset
  const createAsset = useCallback(async (assetData: Omit<Asset, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await assetService.createAsset(assetData);
      if (result.success) {
        // Add new asset to local state
        setAssets(prev => [...prev, { id: result.id, ...assetData }]);
        return { success: true, id: result.id };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update asset
  const updateAsset = useCallback(async (id: string, assetData: Partial<Asset>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await assetService.updateAsset(id, assetData);
      if (result.success) {
        // Update asset in local state
        setAssets(prev => 
          prev.map(asset => 
            asset.id === id 
              ? { ...asset, ...assetData, updatedAt: new Date().toISOString() }
              : asset
          )
        );
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete asset
  const deleteAsset = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await assetService.deleteAsset(id);
      if (result.success) {
        // Remove asset from local state
        setAssets(prev => prev.filter(asset => asset.id !== id));
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get assets by status
  const getAssetsByStatus = useCallback(async (status: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await assetService.getAssetsByStatus(status);
      if (result.success) {
        return { success: true, data: result.data as Asset[] };
      } else {
        setError(result.error);
        return { success: false, error: result.error, data: [] };
      }
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message, data: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    assets,
    loading,
    error,
    fetchAssets,
    fetchAsset,
    createAsset,
    updateAsset,
    deleteAsset,
    getAssetsByStatus
  };
};
