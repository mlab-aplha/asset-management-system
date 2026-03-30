// src/hooks/useAdminRequests.ts
// Admin approves at the final 'admin' level.
import { useState, useEffect, useCallback } from 'react';
import { AdminRequestService } from '../../backend-firebase/src/services/RequestService';
import {
    IRequest,
    IRequestFilters,
    IRequestStats,
    FulfillmentInput,
} from '../core/types/request.types';
import { useAuth } from './useAuth';

export const useAdminRequests = () => {
    const [requests, setRequests] = useState<IRequest[]>([]);
    const [filteredRequests, setFilteredRequests] = useState<IRequest[]>([]);
    const [stats, setStats] = useState<IRequestStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeFilters, setActiveFilters] = useState<IRequestFilters>({});

    const { user } = useAuth();
    const svc = AdminRequestService.getInstance();

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

    const fetchRequests = useCallback(
        async (filters: IRequestFilters) => {
            setLoading(true);
            try {
                const data = await svc.getRequests(filters);
                setRequests(data);
                setFilteredRequests(data);
                setStats(computeStats(data));
                setError(null);
            } catch (err) {
                setError('Failed to fetch requests');
                console.error(err);
            } finally {
                setLoading(false);
            }
        },
        [svc],
    );

    useEffect(() => {
        fetchRequests(activeFilters);
    }, [activeFilters, fetchRequests]);

    const applyFilters = useCallback(
        (filters: IRequestFilters) => setActiveFilters(filters),
        [],
    );

    const clearFilters = useCallback(() => setActiveFilters({}), []);

    /** Admin approves — moves to 'approved' (final stage). */
    const approveRequest = useCallback(
        async (requestId: string, comments?: string) => {
            if (!user?.uid) return false;
            try {
                const res = await svc.approveRequest(
                    requestId,
                    user.uid,
                    user.displayName || user.email || '',
                    comments,
                );
                if (res.success) {
                    await fetchRequests(activeFilters);
                    return true;
                }
                return false;
            } catch {
                return false;
            }
        },
        [user, svc, fetchRequests, activeFilters],
    );

    const rejectRequest = useCallback(
        async (requestId: string, reason: string) => {
            if (!user?.uid) return false;
            try {
                const res = await svc.rejectRequest(
                    requestId,
                    reason,
                    user.uid,
                    user.displayName || user.email || '',
                );
                if (res.success) {
                    await fetchRequests(activeFilters);
                    return true;
                }
                return false;
            } catch {
                return false;
            }
        },
        [user, svc, fetchRequests, activeFilters],
    );

    const fulfillRequest = useCallback(
        async (requestId: string, fulfillmentData: FulfillmentInput) => {
            if (!user?.uid) return false;
            try {
                const res = await svc.fulfillRequest(requestId, fulfillmentData, user.uid);
                if (res.success) {
                    await fetchRequests(activeFilters);
                    return true;
                }
                return false;
            } catch {
                return false;
            }
        },
        [user, svc, fetchRequests, activeFilters],
    );

    const deleteRequest = useCallback(
        async (requestId: string) => {
            try {
                const res = await svc.deleteRequest(requestId);
                if (res.success) {
                    await fetchRequests(activeFilters);
                    return true;
                }
                return false;
            } catch {
                return false;
            }
        },
        [svc, fetchRequests, activeFilters],
    );

    return {
        requests,
        filteredRequests,
        stats,
        loading,
        error,
        activeFilters,
        applyFilters,
        clearFilters,
        approveRequest,
        rejectRequest,
        fulfillRequest,
        deleteRequest,
        refresh: () => fetchRequests(activeFilters),
    };
};