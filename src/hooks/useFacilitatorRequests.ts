// src/hooks/useFacilitatorRequests.ts
import { useState, useEffect, useMemo } from 'react';
import { FacilitatorRequestService } from '../../backend-firebase/src/services/FacilitatorRequestService';
import { IRequest, IRequestFilters } from '../core/types/request.types';

export const useFacilitatorRequests = (locationIds: string[], filters?: IRequestFilters) => {
    const [requests, setRequests] = useState<IRequest[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Create stable references for dependencies
    const locationIdsString = useMemo(() => JSON.stringify(locationIds), [locationIds]);
    const filtersString = useMemo(() => JSON.stringify(filters), [filters]);

    useEffect(() => {
        const fetchRequests = async () => {
            // Parse back the filters from the string for use in the service call
            const parsedFilters = filtersString ? JSON.parse(filtersString) : undefined;
            const parsedLocationIds = JSON.parse(locationIdsString);

            if (!parsedLocationIds.length) {
                setRequests([]);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const service = FacilitatorRequestService.getFacilitatorInstance();
                const data = await service.getAssignedRequests(parsedLocationIds, parsedFilters);
                setRequests(data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch requests');
                console.error('Error fetching facilitator requests:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, [locationIdsString, filtersString]);

    return { requests, loading, error };
};