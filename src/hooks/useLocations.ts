import { useState, useCallback } from 'react';
import { Location, LocationFormData, LocationFilters } from '../core/entities/Location';
import { locationService } from '../../backend-firebase/src/services/LocationService';

export const useLocations = () => {
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadLocations = useCallback(async (filters?: LocationFilters) => {
        try {
            setLoading(true);
            setError(null);
            const data = await locationService.getLocations(filters);
            setLocations(data);
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load locations');
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const createLocation = useCallback(async (locationData: LocationFormData) => {
        try {
            setLoading(true);
            const validation = locationService.validateLocation(locationData);

            if (!validation.isValid) {
                return { success: false, errors: validation.errors };
            }

            const newLocation = await locationService.createLocation(locationData);
            await loadLocations();
            return { success: true, data: newLocation };
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create location');
            return { success: false, errors: { general: 'Failed to create location' } };
        } finally {
            setLoading(false);
        }
    }, [loadLocations]);

    const updateLocation = useCallback(async (id: string, updates: Partial<LocationFormData>) => {
        try {
            setLoading(true);
            const validation = locationService.validateLocation(updates as LocationFormData);

            if (!validation.isValid) {
                return { success: false, errors: validation.errors };
            }

            const updatedLocation = await locationService.updateLocation(id, updates);
            await loadLocations();
            return { success: true, data: updatedLocation };
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update location');
            return { success: false, errors: { general: 'Failed to update location' } };
        } finally {
            setLoading(false);
        }
    }, [loadLocations]);

    const deleteLocation = useCallback(async (id: string) => {
        try {
            setLoading(true);
            await locationService.deleteLocation(id);
            await loadLocations();
            return { success: true };
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete location');
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, [loadLocations]);

    const getLocationStats = useCallback(async () => {
        try {
            return await locationService.getLocationStats();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load location stats');
            return null;
        }
    }, []);

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