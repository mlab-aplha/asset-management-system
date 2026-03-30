import { useState, useCallback } from 'react';
import { assetPortalService } from '@backend/services/Assetportalservice';
import { Asset, AssetFormData, AssetFilters, AssetStats } from '@/core/entities/Asset';
import { UserRole } from '@/core/entities/User';

interface ServiceResponse<T = unknown> {
    success: boolean;
    data?: T;
    errors?: Record<string, string>;
}

export const useAssetPortal = () => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [stats, setStats] = useState<AssetStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadAssets = useCallback(async (
        role: UserRole,
        assignedHubIds: string[],
        filters?: AssetFilters
    ): Promise<Asset[]> => {
        try {
            setLoading(true);
            setError(null);
            const data = await assetPortalService.getAssetsForRole(role, assignedHubIds, filters);
            setAssets(data);
            return data;
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to load assets';
            setError(msg);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const loadStats = useCallback(async (role: UserRole, assignedHubIds: string[]) => {
        try {
            const data = await assetPortalService.getStats(role, assignedHubIds);
            setStats(data);
            return data;
        } catch (err) {
            console.error('Failed to load asset stats:', err);
            return null;
        }
    }, []);

    const createAsset = useCallback(async (
        formData: AssetFormData
    ): Promise<ServiceResponse<Asset>> => {
        try {
            setLoading(true);
            setError(null);
            const asset = await assetPortalService.createAsset(formData);
            return { success: true, data: asset };
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to create asset';
            setError(msg);
            return { success: false, errors: { general: msg } };
        } finally {
            setLoading(false);
        }
    }, []);

    const updateAsset = useCallback(async (
        id: string,
        updates: Partial<AssetFormData>
    ): Promise<ServiceResponse<Asset>> => {
        try {
            setLoading(true);
            setError(null);
            const asset = await assetPortalService.updateAsset(id, updates);
            return { success: true, data: asset };
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to update asset';
            setError(msg);
            return { success: false, errors: { general: msg } };
        } finally {
            setLoading(false);
        }
    }, []);

    const updateAssetStatus = useCallback(async (
        id: string,
        status: Asset['status']
    ): Promise<ServiceResponse<Asset>> => {
        try {
            setLoading(true);
            setError(null);
            const asset = await assetPortalService.updateAssetStatus(id, status);
            return { success: true, data: asset };
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to update asset status';
            setError(msg);
            return { success: false, errors: { general: msg } };
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteAsset = useCallback(async (id: string): Promise<ServiceResponse> => {
        try {
            setLoading(true);
            setError(null);
            await assetPortalService.deleteAsset(id);
            return { success: true };
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to delete asset';
            setError(msg);
            return { success: false, errors: { general: msg } };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        assets, stats, loading, error, setError,
        loadAssets, loadStats, createAsset,
        updateAsset, updateAssetStatus, deleteAsset
    };
};