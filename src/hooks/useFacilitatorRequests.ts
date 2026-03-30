// src/hooks/useFacilitatorRequests.ts
// REPLACES the old combined file. This is the ONLY content this file should have.
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    FacilitatorRequestService,
} from '../../backend-firebase/src/services/RequestService';
import { IRequest, IRequestFilters, FulfillmentInput } from '../core/types/request.types';
import { useAuth } from './useAuth';

// ── Read hook ────────────────────────────────────────────────────────────────

export const useFacilitatorRequests = (
    locationIds: string[],
    filters?: IRequestFilters,
) => {
    const [requests, setRequests] = useState<IRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Stable keys prevent infinite re-render loops from array/object references
    const locKey = useMemo(() => JSON.stringify(locationIds), [locationIds]);
    const filKey = useMemo(() => JSON.stringify(filters ?? {}), [filters]);

    useEffect(() => {
        const ids: string[] = JSON.parse(locKey);
        const fil: IRequestFilters = JSON.parse(filKey);

        if (!ids.length) {
            setRequests([]);
            setLoading(false);
            return;
        }

        let cancelled = false;

        const load = async () => {
            setLoading(true);
            try {
                const svc = FacilitatorRequestService.getFacilitatorInstance();
                const data = await svc.getAssignedRequests(ids, fil);
                if (!cancelled) {
                    setRequests(data);
                    setError(null);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : 'Failed to fetch requests');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => { cancelled = true; };
    }, [locKey, filKey]);

    return { requests, loading, error };
};

// ── Action hook ──────────────────────────────────────────────────────────────

export const useFacilitatorActions = () => {
    const { user } = useAuth();
    const svc = FacilitatorRequestService.getFacilitatorInstance();

    const approveRequest = useCallback(
        async (requestId: string, comments?: string) => {
            if (!user?.uid) return { success: false as const, error: 'Not authenticated' };
            return svc.approveRequest(
                requestId,
                user.uid,
                user.displayName ?? user.email ?? '',
                comments,
            );
        },
        [user, svc],
    );

    const rejectRequest = useCallback(
        async (requestId: string, reason: string) => {
            if (!user?.uid) return { success: false as const, error: 'Not authenticated' };
            return svc.rejectRequest(
                requestId,
                reason,
                user.uid,
                user.displayName ?? user.email ?? '',
            );
        },
        [user, svc],
    );

    const fulfillRequest = useCallback(
        async (requestId: string, data: FulfillmentInput) => {
            if (!user?.uid) return { success: false as const, error: 'Not authenticated' };
            return svc.fulfillRequest(requestId, data, user.uid);
        },
        [user, svc],
    );

    return { approveRequest, rejectRequest, fulfillRequest };
};