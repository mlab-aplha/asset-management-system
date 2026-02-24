// src/hooks/useFacilitatorAssets.ts
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import AssetService from '../../backend-firebase/src/services/AssetService';
import { LocationService } from '../../backend-firebase/src/services/LocationService';
// Import the service Location type, not the core type
import { Location as ServiceLocation } from '../../backend-firebase/src/services/LocationService';
import { Asset } from '../core/entities/Asset';

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

// Type for Firebase timestamp
interface FirebaseTimestamp {
    toDate: () => Date;
    seconds: number;
    nanoseconds: number;
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

    // Helper function to map asset status
    const mapAssetStatus = (status: string): 'in-use' | 'available' | 'maintenance' => {
        switch (status?.toLowerCase()) {
            case 'assigned':
            case 'active':
            case 'in-use':
                return 'in-use';
            case 'available':
                return 'available';
            case 'maintenance':
                return 'maintenance';
            default:
                return 'available';
        }
    };

    // Helper to format date
    const formatDate = (timestamp: Date | FirebaseTimestamp | undefined | null): string => {
        if (!timestamp) return 'N/A';

        try {
            if (typeof timestamp === 'object' && 'toDate' in timestamp && typeof timestamp.toDate === 'function') {
                const date = timestamp.toDate();
                return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });
            }

            if (timestamp instanceof Date) {
                return timestamp.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });
            }

            return 'N/A';
        } catch {
            return 'N/A';
        }
    };

    const loadFacilitatorAssets = useCallback(async () => {
        if (!user?.uid) {
            console.log('No user logged in');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            console.log('Loading facilitator assets for user:', user.uid);

            // Get all assets
            const assetsResult = await AssetService.getAllAssets();
            if (!assetsResult.success || !assetsResult.data) {
                throw new Error('Failed to load assets');
            }

            // DEBUG: Log all assets from Firebase
            console.log('========== DEBUG ASSETS ==========');
            console.log('All assets from Firebase:', assetsResult.data);

            // Log all vehicles specifically
            const vehicles = assetsResult.data.filter((a: Asset) =>
                a.category === 'vehicles' ||
                a.name?.toLowerCase().includes('car') ||
                a.name?.toLowerCase().includes('van') ||
                a.manufacturer?.toLowerCase() === 'volkswagen' ||
                a.manufacturer?.toLowerCase() === 'toyota'
            );

            console.log('All vehicles in Firebase:', vehicles);

            vehicles.forEach((v: Asset) => {
                console.log(`Vehicle: ${v.name} | Manufacturer: ${v.manufacturer} | Serial: ${v.serialNumber} | Asset#: ${v.assetId} | Status: ${v.status}`);
            });

            // Specifically check for the Cargo Van
            const cargoVan = assetsResult.data.find((a: Asset) =>
                a.serialNumber === 'JLNKO5A2KL19' ||
                a.assetId === 'MLAB-VH-011'
            );

            console.log('Looking for Cargo Van (JLNKO5A2KL19):', cargoVan || 'NOT FOUND');
            console.log('===============================');

            // Get all locations
            const locationsResult = await LocationService.getAllLocations();
            const locationMap = new Map<string, { name: string; code: string }>();

            if (locationsResult.success && locationsResult.data) {
                // Cast to ServiceLocation[]
                const locations = locationsResult.data as ServiceLocation[];

                locations.forEach((loc: ServiceLocation) => {
                    locationMap.set(loc.id, {
                        name: loc.name,
                        code: loc.code || ''
                    });
                });
                console.log('Location map created:', Object.fromEntries(locationMap));
            }

            // Get user's assigned location IDs from user object
            const userLocationIds = user.assignedHubIds || [];

            // If no assignedHubIds, try to find location by code or name that matches user's email/name
            let finalLocationIds = userLocationIds;
            if (finalLocationIds.length === 0 && locationsResult.success && locationsResult.data) {
                const locations = locationsResult.data as ServiceLocation[];

                // Try to find location that matches user's email domain or name
                if (user.email) {
                    const emailDomain = user.email.split('@')[1]?.split('.')[0].toLowerCase();
                    const matchingLocation = locations.find((loc: ServiceLocation) =>
                        loc.name.toLowerCase().includes(emailDomain || '') ||
                        loc.code.toLowerCase().includes(emailDomain || '')
                    );

                    if (matchingLocation) {
                        finalLocationIds = [matchingLocation.id];
                        console.log('Found location by email domain:', matchingLocation.id);
                    }
                }

                // If still no match, use the first location as default (temporary)
                if (finalLocationIds.length === 0 && locations.length > 0) {
                    finalLocationIds = [locations[0].id];
                    console.log('Using first location as default:', locations[0].id);
                }
            }

            console.log('Final location IDs for user:', finalLocationIds);

            // Process all assets
            const allAssets = assetsResult.data as Asset[];

            // Filter assets assigned to this user
            const myAssignedAssets = allAssets
                .filter(asset => asset.assignedTo === user.uid)
                .map(asset => {
                    const locationInfo = locationMap.get(asset.currentLocationId) || { name: 'Unknown', code: '' };

                    return {
                        id: asset.id,
                        name: asset.name,
                        serialNumber: asset.serialNumber || 'N/A',
                        assetNumber: asset.assetId || asset.id.substring(0, 8),
                        brand: asset.manufacturer || 'Unknown',
                        assignedTo: user.displayName || 'Me',
                        status: mapAssetStatus(asset.status),
                        location: locationInfo.name,
                        locationCode: locationInfo.code,
                        assignedDate: formatDate(asset.assignmentDate || asset.createdAt),
                        category: asset.category || 'Uncategorized',
                        model: asset.model || ''
                    };
                });

            // Filter assets at user's locations (not assigned to user)
            const locationBasedAssets = allAssets
                .filter(asset => {
                    const isAtUserLocation = finalLocationIds.includes(asset.currentLocationId);
                    const isNotAssignedToCurrentUser = asset.assignedTo !== user.uid;
                    return isAtUserLocation && isNotAssignedToCurrentUser;
                })
                .map(asset => {
                    const locationInfo = locationMap.get(asset.currentLocationId) || { name: 'Unknown', code: '' };

                    // FIXED: Show "Unassigned" when assignedTo is empty/null/undefined
                    // Show "Assigned" when it's assigned to someone else (not the current user)
                    let assignedToName = 'Unassigned';
                    if (asset.assignedTo && asset.assignedTo.trim() !== '') {
                        // In a production app, you would fetch the user's name here
                        // For now, we'll just indicate it's assigned to someone
                        assignedToName = 'Assigned';
                    }

                    return {
                        id: asset.id,
                        name: asset.name,
                        serialNumber: asset.serialNumber || 'N/A',
                        assetNumber: asset.assetId || asset.id.substring(0, 8),
                        brand: asset.manufacturer || 'Unknown',
                        assignedTo: assignedToName, // Now shows "Unassigned" or "Assigned"
                        status: mapAssetStatus(asset.status),
                        location: locationInfo.name,
                        locationCode: locationInfo.code,
                        assignedDate: formatDate(asset.assignmentDate || asset.createdAt),
                        category: asset.category || 'Uncategorized',
                        model: asset.model || ''
                    };
                });

            // DEBUG: Log location assets result
            console.log('========== LOCATION ASSETS RESULT ==========');
            console.log('Final locationAssets count:', locationBasedAssets.length);
            locationBasedAssets.forEach((asset: FacilitatorAsset, index: number) => {
                console.log(`${index + 1}. ${asset.name} (${asset.brand}) | Serial: ${asset.serialNumber} | Asset#: ${asset.assetNumber} | Status: ${asset.status}`);
            });
            console.log('==========================================');

            console.log('My assigned assets:', myAssignedAssets);
            console.log('Location assets:', locationBasedAssets);

            setMyAssets(myAssignedAssets);
            setLocationAssets(locationBasedAssets);

            // Update stats
            const assetsAtMyLocation = allAssets.filter(a =>
                finalLocationIds.includes(a.currentLocationId)
            );

            setStats({
                totalAssets: assetsAtMyLocation.length,
                availableAssets: assetsAtMyLocation.filter(a => a.status === 'available').length,
                assignedToMe: myAssignedAssets.length,
                maintenanceAssets: assetsAtMyLocation.filter(a => a.status === 'maintenance').length
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