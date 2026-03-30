// src/hooks/useManagerRequests.ts
// Hub manager approves at 'manager' level → moves request to admin queue.
import { useState, useEffect, useCallback, useMemo } from 'react';
import { ManagerRequestService } from '../../backend-firebase/src/services/RequestService';
import { IRequest, IRequestFilters, IRequestStats } from '../core/types/request.types';
import { useAuth } from './useAuth';

export const useManagerRequests = (locationIds: string[], filters?: IRequestFilters) => {
    const [requests, setRequests] = useState<IRequest[]>([]);
    const [stats, setStats] = useState<IRequestStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { user } = useAuth();
    const svc = ManagerRequestService.getManagerInstance();

    const locKey = useMemo(() => JSON.stringify(locationIds), [locationIds]);
    const filKey = useMemo(() => JSON.stringify(filters ?? {}), [filters]);

    const computeStats = (data: IRequest[]): IRequestStats => ({
        total: data.length,
        pending: data.filter((r) => r.status === 'pending').length,
        underReview: data.filter((r) => r.status === 'under_review').length,
        pendingAdmin: data.filter((r) => r.status === 'pending_admin').length,
        approved: data.filter((r) => r.status === 'approved').length,
        rejected: data.filter((r) => r.status === 'rejected').length,
        fulfilled: data.filter((r) => r.status === 'fulfilled').length,
        partiallyFulfilled: data.filter((r) => r.status === 'partially_fulfilled').length,
        urgent: data.filter((r) => r.priority === 'urgent').length,
    });

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
                const data = await svc.getAssignedRequests(ids, fil);
                if (!cancelled) {
                    setRequests(data);
                    setStats(computeStats(data));
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
    }, [locKey, filKey, svc]);

    /** Manager approves → request moves to 'pending_admin' (super admin queue). */
    const approveRequest = useCallback(
        async (requestId: string, comments?: string) => {
            if (!user?.uid) return { success: false, error: 'Not authenticated' };
            const res = await svc.approveRequest(
                requestId,
                user.uid,
                user.displayName || user.email || '',
                comments,
            );
            if (res.success) {
                setRequests((prev) =>
                    prev.map((r) =>
                        r.id === requestId ? { ...r, status: 'pending_admin' as const } : r,
                    ),
                );
            }
            return res;
        },
        [user, svc],
    );

    /** Manager rejects — request stops. */
    const rejectRequest = useCallback(
        async (requestId: string, reason: string) => {
            if (!user?.uid) return { success: false, error: 'Not authenticated' };
            const res = await svc.rejectRequest(
                requestId,
                reason,
                user.uid,
                user.displayName || user.email || '',
            );
            if (res.success) {
                setRequests((prev) =>
                    prev.map((r) =>
                        r.id === requestId ? { ...r, status: 'rejected' as const } : r,
                    ),
                );
            }
            return res;
        },
        [user, svc],
    );

    return {
        requests,
        stats,
        loading,
        error,
        approveRequest,
        rejectRequest,
        /** Requests currently awaiting manager review. */
        pendingReview: requests.filter((r) => r.status === 'under_review'),
    };
};