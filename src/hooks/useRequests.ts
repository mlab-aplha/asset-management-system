// src/hooks/useRequests.ts
import { useState, useCallback, useEffect } from 'react';
import {
    AssetRequest,
    RequestService,
    CreateRequestInput,
    RequestFilters
} from '../../backend-firebase/src/services/RequestService';

export const useRequests = () => {
    const [requests, setRequests] = useState<AssetRequest[]>([]);
    const [pendingRequests, setPendingRequests] = useState<AssetRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [count, setCount] = useState(0);

    // Fetch all requests - using getRequests with empty filters
    const fetchAllRequests = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Use the instance method
            const service = RequestService.getInstance();
            const data = await service.getRequests({});
            setRequests(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to fetch requests');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch my requests - using getRequests with requesterId filter
    const fetchMyRequests = useCallback(async (userId: string) => {
        setLoading(true);
        setError(null);
        try {
            // Use the instance method with filters
            const service = RequestService.getInstance();
            const filters: RequestFilters = { requesterId: userId };
            const data = await service.getRequests(filters);
            setRequests(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to fetch your requests');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch pending requests - using getRequests with status filter
    const fetchPendingRequests = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Use the instance method with status filter
            const service = RequestService.getInstance();
            const filters: RequestFilters = { status: ['pending'] };
            const data = await service.getRequests(filters);
            setPendingRequests(data);
            setCount(data.length);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to fetch pending requests');
        } finally {
            setLoading(false);
        }
    }, []);

    // Auto-fetch pending requests on mount
    useEffect(() => {
        fetchPendingRequests();
    }, [fetchPendingRequests]);

    // Create request
    const createRequest = useCallback(async (requestData: CreateRequestInput) => {
        setLoading(true);
        setError(null);
        try {
            // Use static method
            const result = await RequestService.createRequest(requestData);
            if (result.success && result.data) {
                // Add the new request to the list if it's pending
                if (result.data.status === 'pending') {
                    setPendingRequests(prev => [...prev, result.data!]);
                    setCount(prev => prev + 1);
                }
                setRequests(prev => [...prev, result.data!]);
                return { success: true, data: result.data };
            } else {
                setError(result.message ?? 'Failed to create request');
                return { success: false, error: result.message };
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create request';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // Approve request - simplified, only needs requestId
    const approveRequest = useCallback(async (requestId: string) => {
        setLoading(true);
        setError(null);
        try {
            // Use static method - now only needs requestId
            const result = await RequestService.approveRequest(requestId);
            if (result.success) {
                // Update both states
                setRequests(prev =>
                    prev.map(req =>
                        req.id === requestId
                            ? { ...req, status: 'approved' as const }
                            : req
                    )
                );
                setPendingRequests(prev => prev.filter(req => req.id !== requestId));
                setCount(prev => Math.max(0, prev - 1));
                return { success: true, message: result.message };
            } else {
                setError(result.message ?? 'Failed to approve request');
                return { success: false, error: result.message };
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to approve request';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // Reject request - simplified, only needs requestId and reason
    const rejectRequest = useCallback(async (requestId: string, reason: string) => {
        setLoading(true);
        setError(null);
        try {
            // Use static method - now only needs requestId and reason
            const result = await RequestService.rejectRequest(requestId, reason);
            if (result.success) {
                // Update both states
                setRequests(prev =>
                    prev.map(req =>
                        req.id === requestId
                            ? { ...req, status: 'rejected' as const, rejectionReason: reason }
                            : req
                    )
                );
                setPendingRequests(prev => prev.filter(req => req.id !== requestId));
                setCount(prev => Math.max(0, prev - 1));
                return { success: true, message: result.message };
            } else {
                setError(result.message ?? 'Failed to reject request');
                return { success: false, error: result.message };
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to reject request';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // Get request by ID
    const getRequestById = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const service = RequestService.getInstance();
            const request = await service.getRequestById(id);
            return request;
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch request';
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Delete request
    const deleteRequest = useCallback(async (requestId: string) => {
        setLoading(true);
        setError(null);
        try {
            const result = await RequestService.deleteRequest(requestId);
            if (result.success) {
                // Remove from both states
                setRequests(prev => prev.filter(req => req.id !== requestId));
                setPendingRequests(prev => prev.filter(req => req.id !== requestId));
                setCount(prev => Math.max(0, prev - 1));
                return { success: true, message: result.message };
            } else {
                setError(result.message ?? 'Failed to delete request');
                return { success: false, error: result.message };
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete request';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // Update request
    const updateRequest = useCallback(async (requestId: string, updates: Partial<AssetRequest>) => {
        setLoading(true);
        setError(null);
        try {
            const result = await RequestService.updateRequest(requestId, updates as Record<string, unknown>);
            if (result.success) {
                // Update in both states
                setRequests(prev =>
                    prev.map(req =>
                        req.id === requestId
                            ? { ...req, ...updates }
                            : req
                    )
                );
                setPendingRequests(prev =>
                    prev.map(req =>
                        req.id === requestId
                            ? { ...req, ...updates }
                            : req
                    )
                );
                return { success: true, message: result.message };
            } else {
                setError(result.message ?? 'Failed to update request');
                return { success: false, error: result.message };
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update request';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        // Data
        requests,
        pendingRequests,
        loading,
        error,
        count,

        // Fetch methods
        fetchAllRequests,
        fetchMyRequests,
        fetchPendingRequests,
        getRequestById,

        // Action methods
        createRequest,
        approveRequest,
        rejectRequest,
        deleteRequest,
        updateRequest
    };
};