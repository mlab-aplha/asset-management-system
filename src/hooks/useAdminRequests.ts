// src/hooks/useAdminRequests.ts
import { useState, useEffect, useCallback } from 'react';
import { AdminRequestService } from '../../backend-firebase/src/services/AdminRequestService';
import { IRequest, IRequestFilters, IRequestStats } from '../core/types/request.types';
import { useAuth } from './useAuth';

// Define type for fulfillment data
interface FulfillmentData {
    notes?: string;
    items?: Array<{ itemId: string; fulfilledQuantity: number; notes?: string }>;
}

export const useAdminRequests = () => {
    const [requests, setRequests] = useState<IRequest[]>([]);
    const [filteredRequests, setFilteredRequests] = useState<IRequest[]>([]);
    const [stats, setStats] = useState<IRequestStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeFilters, setActiveFilters] = useState<IRequestFilters>({});

    const { user } = useAuth();
    const adminService = AdminRequestService.getInstance();

    // Define fetch function separately from useEffect to avoid circular dependency
    const fetchRequests = useCallback(async (filtersToUse: IRequestFilters) => {
        setLoading(true);
        try {
            const data = await adminService.getRequests(filtersToUse);
            setRequests(data);
            setFilteredRequests(data);

            // Calculate stats from data
            const statsData: IRequestStats = {
                total: data.length,
                pending: data.filter(r => r.status === 'pending').length,
                approved: data.filter(r => r.status === 'approved').length,
                rejected: data.filter(r => r.status === 'rejected').length,
                fulfilled: data.filter(r => r.status === 'fulfilled').length,
                urgent: data.filter(r => r.priority === 'urgent').length
            };
            setStats(statsData);
            setError(null);
        } catch (err) {
            setError('Failed to fetch requests');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [adminService]);

    // Fetch when activeFilters changes
    useEffect(() => {
        fetchRequests(activeFilters);
    }, [activeFilters, fetchRequests]);

    // Apply filters
    const applyFilters = useCallback((filters: IRequestFilters) => {
        setActiveFilters(filters);
    }, []);

    // Clear filters
    const clearFilters = useCallback(() => {
        setActiveFilters({});
        setFilteredRequests(requests);
    }, [requests]);

    // Approve request - simplified to only need requestId
    const approveRequest = useCallback(async (requestId: string) => {
        if (!user?.uid) return false;

        try {
            const result = await adminService.approveRequest(requestId);

            if (result.success) {
                // Refresh with current filters
                await fetchRequests(activeFilters);
                return true;
            }
            return false;
        } catch (err) {
            console.error('Error approving request:', err);
            return false;
        }
    }, [user, adminService, fetchRequests, activeFilters]);

    // Reject request - simplified to only need requestId and reason
    const rejectRequest = useCallback(async (requestId: string, reason: string) => {
        if (!user?.uid) return false;

        try {
            const result = await adminService.rejectRequest(requestId, reason);

            if (result.success) {
                await fetchRequests(activeFilters);
                return true;
            }
            return false;
        } catch (err) {
            console.error('Error rejecting request:', err);
            return false;
        }
    }, [user, adminService, fetchRequests, activeFilters]);

    // Fulfill request - simplified to only need requestId and fulfillmentData
    const fulfillRequest = useCallback(async (requestId: string, fulfillmentData: FulfillmentData) => {
        if (!user?.uid) return false;

        try {
            const result = await adminService.fulfillRequest(requestId, fulfillmentData);

            if (result.success) {
                await fetchRequests(activeFilters);
                return true;
            }
            return false;
        } catch (err) {
            console.error('Error fulfilling request:', err);
            return false;
        }
    }, [user, adminService, fetchRequests, activeFilters]);

    // Delete request
    const deleteRequest = useCallback(async (requestId: string) => {
        try {
            const result = await adminService.deleteRequest(requestId);

            if (result.success) {
                await fetchRequests(activeFilters);
                return true;
            }
            return false;
        } catch (err) {
            console.error('Error deleting request:', err);
            return false;
        }
    }, [adminService, fetchRequests, activeFilters]);

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
        refresh: () => fetchRequests(activeFilters)
    };
};