// src/hooks/useFacilitatorAssets.ts
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import AssetService from '../../backend-firebase/src/services/AssetService';
import { LocationService } from '../../backend-firebase/src/services/LocationService';
import { Location } from '../../backend-firebase/src/services/LocationService';

export interface FacilitatorAsset {
    id: string;
    name: string;
    serialNumber: string;
    assetNumber: string;
    brand: string;
    assignedTo: string;
    status: 'in-use' | 'available' | 'maintenance';
    location: string;
    locationCode: string;
    assignedDate: string;
    category: string;
    model: string;
}

export const useFacilitatorAssets = () => {
    const { user } = useAuth();
    const [myAssets, setMyAssets] = useState<FacilitatorAsset[]>([]);
    const [locationAssets, setLocationAssets] = useState<FacilitatorAsset[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({
        totalAssets: 0,
        availableAssets: 0,
        assignedToMe: 0,
        maintenanceAssets: 0
    });

    // Helper function to map asset status - FIXED to handle 'active' status
    const mapAssetStatus = (status: string): 'in-use' | 'available' | 'maintenance' => {
        switch (status) {
            case 'assigned':
            case 'active':  // Add this line - your assets have status "active"
                return 'in-use';
            case 'available':
                return 'available';
            case 'maintenance':
                return 'maintenance';
            default:
                return 'available';
        }
    };

    const loadFacilitatorAssets = useCallback(async () => {
        if (!user?.uid) return;

        setLoading(true);
        setError(null);

        try {
            // Get all assets
            const assetsResult = await AssetService.getAllAssets();

            if (!assetsResult.success || !assetsResult.data) {
                throw new Error('Failed to load assets');
            }

            // Get all locations to map location IDs to names
            const locationsResult = await LocationService.getAllLocations();
            const locationMap = new Map();
            if (locationsResult.success && locationsResult.data) {
                locationsResult.data.forEach((loc: Location) => {
                    locationMap.set(loc.id, {
                        name: loc.name,
                        code: loc.code
                    });
                });
            }

            // Get user's assigned location IDs
            const userLocationIds = user.assignedHubIds || [];

            console.log('User ID:', user.uid);
            console.log('User location IDs:', userLocationIds);
            console.log('All assets:', assetsResult.data);
            console.log('Assets assigned to user:', assetsResult.data.filter(a => a.assignedTo === user.uid));

            // Filter assets assigned to this user
            const myAssignedAssets = assetsResult.data
                .filter(asset => asset.assignedTo === user.uid)
                .map(asset => ({
                    id: asset.id,
                    name: asset.name,
                    serialNumber: asset.serialNumber || 'N/A',
                    assetNumber: asset.assetId || asset.id.substring(0, 8),
                    brand: asset.manufacturer || 'Unknown',
                    assignedTo: user.displayName || 'Me',
                    status: mapAssetStatus(asset.status), // Now handles 'active' correctly
                    location: locationMap.get(asset.currentLocationId)?.name || 'Unknown',
                    locationCode: locationMap.get(asset.currentLocationId)?.code || '',
                    assignedDate: asset.assignmentDate ? new Date(asset.assignmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
                    category: asset.category || 'Uncategorized',
                    model: asset.model || ''
                }));

            // Filter assets at user's assigned locations
            const locationBasedAssets = assetsResult.data
                .filter(asset =>
                    userLocationIds.includes(asset.currentLocationId) &&
                    asset.assignedTo !== user.uid // Exclude assets assigned to current user
                )
                .map(asset => ({
                    id: asset.id,
                    name: asset.name,
                    serialNumber: asset.serialNumber || 'N/A',
                    assetNumber: asset.assetId || asset.id.substring(0, 8),
                    brand: asset.manufacturer || 'Unknown',
                    assignedTo: asset.assignedTo || 'Unassigned',
                    status: mapAssetStatus(asset.status), // Now handles 'active' correctly
                    location: locationMap.get(asset.currentLocationId)?.name || 'Unknown',
                    locationCode: locationMap.get(asset.currentLocationId)?.code || '',
                    assignedDate: asset.assignmentDate ? new Date(asset.assignmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
                    category: asset.category || 'Uncategorized',
                    model: asset.model || ''
                }));

            console.log('My assigned assets:', myAssignedAssets);
            console.log('Location assets:', locationBasedAssets);

            setMyAssets(myAssignedAssets);
            setLocationAssets(locationBasedAssets);

            // Update stats
            setStats({
                totalAssets: assetsResult.data.length,
                availableAssets: assetsResult.data.filter(a => a.status === 'available').length,
                assignedToMe: myAssignedAssets.length,
                maintenanceAssets: assetsResult.data.filter(a => a.status === 'maintenance').length
            });

        } catch (err) {
            console.error('Error loading facilitator assets:', err);
            setError(err instanceof Error ? err.message : 'Failed to load assets');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user?.uid) {
            loadFacilitatorAssets();
        }
    }, [user, loadFacilitatorAssets]);

    return {
        myAssets,
        locationAssets,
        loading,
        error,
        stats,
        refreshAssets: loadFacilitatorAssets
    };
};