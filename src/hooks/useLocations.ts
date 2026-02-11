import { useState, useCallback } from 'react';
import { Location as FrontendLocation, LocationFormData } from '../core/entities/Location';
import { LocationService, CreateLocationData, UpdateLocationData } from '../../backend-firebase/src/services/LocationService';

// Type guard functions
const isValidType = (type: string): type is 'hq' | 'hub' | 'site' | 'other' | 'branch' => {
    return ['hq', 'hub', 'site', 'other', 'branch'].includes(type);
};

const isValidStatus = (status: string): status is 'active' | 'maintenance' | 'offline' => {
    return ['active', 'maintenance', 'offline'].includes(status);
};

const toFrontendType = (type: string): 'hq' | 'hub' | 'site' | 'other' | 'branch' => {
    return isValidType(type) ? type : 'other';
};

const toFrontendStatus = (status: string): 'active' | 'maintenance' | 'offline' => {
    return isValidStatus(status) ? status : 'active';
};

interface ServiceResponse<T = unknown> {
    success: boolean;
    data?: T;
    errors?: Record<string, string>;
    message?: string;
}

export const useLocations = () => {
    const [locations, setLocations] = useState<FrontendLocation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadLocations = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await LocationService.getAllLocations();
            if (result.success && result.data) {
                // Convert backend locations to frontend format with proper type casting
                const frontendLocations: FrontendLocation[] = result.data.map(loc => ({
                    id: loc.id,
                    name: loc.name,
                    type: toFrontendType(loc.type),
                    status: toFrontendStatus(loc.status),
                    code: loc.code,
                    capacity: loc.capacity,
                    address: loc.address,
                    totalAssets: loc.capacity.currentAssets,
                    createdAt: loc.createdAt,
                    updatedAt: loc.updatedAt,
                    // Optional fields
                    city: '',
                    country: 'South Africa',
                    managerId: '',
                    primaryContact: undefined,
                    description: '',
                    region: '',
                    lastAudit: ''
                }));
                setLocations(frontendLocations);
                return frontendLocations;
            } else {
                setError(result.message || 'Failed to load locations');
                return [];
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load locations');
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const createLocation = useCallback(async (locationData: LocationFormData): Promise<ServiceResponse<FrontendLocation>> => {
        try {
            setLoading(true);
            setError(null);

            // Generate location code if not provided
            const locationCode = locationData.code || LocationService.generateLocationCode(locationData.name);

            // Prepare data for Firebase
            const firestoreLocation: CreateLocationData = {
                name: locationData.name,
                type: locationData.type,
                status: locationData.status,
                code: locationCode,
                capacity: {
                    maxAssets: locationData.maxAssets || 100,
                    currentAssets: locationData.totalAssets || 0,
                    availableCapacity: (locationData.maxAssets || 100) - (locationData.totalAssets || 0)
                },
                address: locationData.address || ''
            };

            console.log('Creating location with data:', firestoreLocation);

            const result = await LocationService.createLocation(firestoreLocation);
            if (result.success && result.data?.id) {
                // Reload locations to get the latest data
                await loadLocations();

                // Create the frontend location object
                const newLocation: FrontendLocation = {
                    id: result.data.id,
                    name: firestoreLocation.name,
                    type: firestoreLocation.type as 'hq' | 'hub' | 'site' | 'other' | 'branch',
                    status: firestoreLocation.status as 'active' | 'maintenance' | 'offline',
                    code: firestoreLocation.code,
                    capacity: firestoreLocation.capacity,
                    address: firestoreLocation.address,
                    totalAssets: firestoreLocation.capacity.currentAssets,
                    city: locationData.city || '',
                    country: locationData.country || 'South Africa',
                    managerId: locationData.managerId || '',
                    primaryContact: locationData.contactName ? {
                        name: locationData.contactName,
                        email: locationData.contactEmail || '',
                        phone: locationData.contactPhone || ''
                    } : undefined,
                    description: locationData.description || '',
                    region: locationData.region || '',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    lastAudit: ''
                };

                return { success: true, data: newLocation };
            } else {
                const errorMsg = result.message || 'Failed to create location';
                setError(errorMsg);
                return {
                    success: false,
                    errors: { general: errorMsg }
                };
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create location';
            setError(errorMessage);
            return {
                success: false,
                errors: { general: errorMessage }
            };
        } finally {
            setLoading(false);
        }
    }, [loadLocations]);

    const updateLocation = useCallback(async (id: string, updates: Partial<LocationFormData>): Promise<ServiceResponse<FrontendLocation>> => {
        try {
            setLoading(true);
            setError(null);

            // Prepare update data for Firebase
            const updateData: UpdateLocationData = {};

            // Basic fields
            if (updates.name !== undefined) updateData.name = updates.name;
            if (updates.type !== undefined) updateData.type = updates.type;
            if (updates.status !== undefined) updateData.status = updates.status;
            if (updates.code !== undefined) updateData.code = updates.code;
            if (updates.address !== undefined) updateData.address = updates.address;

            // Handle capacity updates
            if (updates.maxAssets !== undefined || updates.totalAssets !== undefined) {
                const location = locations.find(loc => loc.id === id);
                const currentMax = location?.capacity?.maxAssets || 100;
                const currentAssets = location?.totalAssets || 0;

                updateData.capacity = {
                    maxAssets: updates.maxAssets !== undefined ? updates.maxAssets : currentMax,
                    currentAssets: updates.totalAssets !== undefined ? updates.totalAssets : currentAssets,
                    availableCapacity: (updates.maxAssets !== undefined ? updates.maxAssets : currentMax) -
                        (updates.totalAssets !== undefined ? updates.totalAssets : currentAssets)
                };
            }

            console.log('Updating location with data:', updateData);

            const result = await LocationService.updateLocation(id, updateData);
            if (result.success) {
                // Reload locations to get updated data
                await loadLocations();

                // Find the updated location
                const updatedLocation = locations.find(loc => loc.id === id);
                return {
                    success: true,
                    data: updatedLocation as FrontendLocation
                };
            } else {
                const errorMsg = result.message || 'Failed to update location';
                setError(errorMsg);
                return {
                    success: false,
                    errors: { general: errorMsg }
                };
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update location';
            setError(errorMessage);
            return {
                success: false,
                errors: { general: errorMessage }
            };
        } finally {
            setLoading(false);
        }
    }, [loadLocations, locations]);

    const deleteLocation = useCallback(async (id: string): Promise<ServiceResponse> => {
        try {
            setLoading(true);
            setError(null);

            const result = await LocationService.deleteLocation(id);
            if (result.success) {
                await loadLocations();
                return { success: true };
            } else {
                const errorMsg = result.message || 'Failed to delete location';
                setError(errorMsg);
                return {
                    success: false,
                    errors: { general: errorMsg }
                };
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete location';
            setError(errorMessage);
            return {
                success: false,
                errors: { general: errorMessage }
            };
        } finally {
            setLoading(false);
        }
    }, [loadLocations]);

    const getLocationStats = useCallback(async () => {
        try {
            const stats = {
                totalLocations: locations.length,
                activeLocations: locations.filter(l => l.status === 'active').length,
                maintenanceLocations: locations.filter(l => l.status === 'maintenance').length,
                offlineLocations: locations.filter(l => l.status === 'offline').length,
                totalCapacity: locations.reduce((sum, loc) => sum + (loc.capacity?.maxAssets || 0), 0),
                usedCapacity: locations.reduce((sum, loc) => sum + (loc.totalAssets || 0), 0),
                totalAssets: locations.reduce((sum, loc) => sum + (loc.totalAssets || 0), 0)
            };
            return stats;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load location stats');
            return null;
        }
    }, [locations]);

    return {
        locations,
        loading,
        error,
        loadLocations,
        createLocation,
        updateLocation,
        deleteLocation,
        getLocationStats,
        setError
    };
};