import { useState, useCallback } from 'react';
import AssetService, { Asset } from '../../backend-firebase/src/services/AssetService';

export const useAssets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await AssetService.getAllAssets();
      if (result.success && result.data) {
        setAssets(result.data);
      } else {
        setError(result.message ?? 'Failed to fetch assets');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch assets';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAsset = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await AssetService.getAsset(id);
      if (result.success && result.data) {
        return result.data;
      } else {
        setError(result.message ?? 'Asset not found');
        return null;
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch asset';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createAsset = useCallback(async (assetData: Omit<Asset, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await AssetService.createAsset(assetData);
      if (result.success && result.data?.id) {
        const newAsset = { ...assetData, id: result.data.id };
        setAssets(prev => [...prev, newAsset]);
        return { success: true, id: result.data.id };
      } else {
        setError(result.message ?? 'Failed to create asset');
        return { success: false, error: result.message };
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create asset';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAsset = useCallback(async (id: string, assetData: Partial<Asset>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await AssetService.updateAsset(id, assetData);
      if (result.success) {
        setAssets(prev =>
          prev.map(asset =>
            asset.id === id
              ? { ...asset, ...assetData }
              : asset
          )
        );
        return { success: true };
      } else {
        setError(result.message ?? 'Failed to update asset');
        return { success: false, error: result.message };
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update asset';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAsset = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await AssetService.deleteAsset(id);
      if (result.success) {
        setAssets(prev => prev.filter(asset => asset.id !== id));
        return { success: true };
      } else {
        setError(result.message ?? 'Failed to delete asset');
        return { success: false, error: result.message };
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete asset';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const getAssetsByStatus = useCallback(async (status: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await AssetService.getAssetsByStatus(status as Asset['status']);
      if (result.success) {
        return { success: true, data: result.data || [] };
      } else {
        setError(result.message ?? 'Failed to fetch assets by status');
        return { success: false, error: result.message, data: [] };
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch assets by status';
      setError(errorMessage);
      return { success: false, error: errorMessage, data: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  const searchAssets = useCallback(async (searchTerm: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await AssetService.searchAssets(searchTerm);
      if (result.success) {
        return { success: true, data: result.data || [] };
      } else {
        setError(result.message ?? 'Failed to search assets');
        return { success: false, error: result.message, data: [] };
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
    searchAssets
  };
};