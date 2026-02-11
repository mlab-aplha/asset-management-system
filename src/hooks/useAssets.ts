// src/hooks/useAssets.ts
import { useState, useCallback } from 'react';
import AssetService from '../../backend-firebase/src/services/AssetService';
import { Asset, CreateAssetDto, UpdateAssetDto } from '../core/entities/Asset';

interface AssetHookResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const useAssets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = useCallback(async (): Promise<AssetHookResponse<Asset[]>> => {
    setLoading(true);
    setError(null);
    try {
      const result = await AssetService.getAllAssets();
      if (result.success && result.data) {
        setAssets(result.data);
        return { success: true, data: result.data };
      } else {
        const errorMsg = result.message || 'Failed to fetch assets';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch assets';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAsset = useCallback(async (id: string): Promise<AssetHookResponse<Asset>> => {
    setLoading(true);
    setError(null);
    try {
      const result = await AssetService.getAsset(id);
      if (result.success && result.data) {
        return { success: true, data: result.data };
      } else {
        const errorMsg = result.message || 'Asset not found';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch asset';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const createAsset = useCallback(async (assetData: CreateAssetDto): Promise<AssetHookResponse<Asset>> => {
    setLoading(true);
    setError(null);
    try {
      const result = await AssetService.createAsset(assetData);
      if (result.success && result.data?.id) {
        // Fetch the newly created asset to get complete data
        const newAssetResult = await AssetService.getAsset(result.data.id);
        if (newAssetResult.success && newAssetResult.data) {
          // Update local state
          setAssets(prev => [newAssetResult.data!, ...prev]);
          return { success: true, data: newAssetResult.data };
        }
      }

      const errorMsg = result.message || 'Failed to create asset';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create asset';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAsset = useCallback(async (id: string, updates: UpdateAssetDto): Promise<AssetHookResponse<Asset>> => {
    setLoading(true);
    setError(null);
    try {
      const result = await AssetService.updateAsset(id, updates);
      if (result.success) {
        // Fetch updated asset
        const updatedAssetResult = await AssetService.getAsset(id);
        if (updatedAssetResult.success && updatedAssetResult.data) {
          // Update local state
          setAssets(prev =>
            prev.map(asset =>
              asset.id === id ? updatedAssetResult.data! : asset
            )
          );
          return { success: true, data: updatedAssetResult.data };
        }
      }

      const errorMsg = result.message || 'Failed to update asset';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update asset';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAsset = useCallback(async (id: string): Promise<AssetHookResponse> => {
    setLoading(true);
    setError(null);
    try {
      const result = await AssetService.deleteAsset(id);
      if (result.success) {
        setAssets(prev => prev.filter(asset => asset.id !== id));
        return { success: true, message: 'Asset deleted successfully' };
      } else {
        const errorMsg = result.message || 'Failed to delete asset';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete asset';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const getAssetsByStatus = useCallback(async (status: Asset['status']): Promise<AssetHookResponse<Asset[]>> => {
    setLoading(true);
    setError(null);
    try {
      const result = await AssetService.getAssetsByStatus(status);
      if (result.success) {
        return { success: true, data: result.data || [] };
      } else {
        const errorMsg = result.message || 'Failed to fetch assets by status';
        setError(errorMsg);
        return { success: false, error: errorMsg, data: [] };
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch assets by status';
      setError(errorMessage);
      return { success: false, error: errorMessage, data: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  const searchAssets = useCallback(async (searchTerm: string): Promise<AssetHookResponse<Asset[]>> => {
    setLoading(true);
    setError(null);
    try {
      const result = await AssetService.searchAssets(searchTerm);
      if (result.success) {
        return { success: true, data: result.data || [] };
      } else {
        const errorMsg = result.message || 'Failed to search assets';
        setError(errorMsg);
        return { success: false, error: errorMsg, data: [] };
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search assets';
      setError(errorMessage);
      return { success: false, error: errorMessage, data: [] };
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
    getAssetsByStatus,
    searchAssets,
    setError
  };
};