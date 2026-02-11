import { useState, useCallback } from 'react';
import { AssetRequest, RequestService } from '../../backend-firebase/src/services/RequestService';

export const useRequests = () => {
    const [requests, setRequests] = useState<AssetRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAllRequests = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await RequestService.getAllRequests();
            if (result.success && result.data) {
                setRequests(result.data);
            } else {
                setError(result.message ?? 'Failed to fetch requests');
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to fetch requests');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchMyRequests = useCallback(async (userId: string) => {
        setLoading(true);
        setError(null);
        try {
            const result = await RequestService.getMyRequests(userId);
            if (result.success && result.data) {
                setRequests(result.data);
            } else {
                setError(result.message ?? 'Failed to fetch your requests');
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to fetch your requests');
        } finally {
            setLoading(false);
        }
    }, []);

    const createRequest = useCallback(async (requestData: Omit<AssetRequest, 'id' | 'requestId'>) => {
        setLoading(true);
        setError(null);
        try {
            const result = await RequestService.createRequest(requestData);
            if (result.success && result.data?.id) {
                return { success: true, requestId: result.data.requestId };
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

    const approveRequest = useCallback(async (
        requestId: string,
        adminId: string,
        adminName: string,
        comments?: string
    ) => {
        setLoading(true);
        setError(null);
        try {
            const result = await RequestService.approveRequest(requestId, adminId, adminName, comments);
            if (result.success) {
                // Update local state
                setRequests(prev =>
                    prev.map(req =>
                        req.id === requestId
                            ? { ...req, status: 'approved' }
                            : req
                    )
                );
                return { success: true };
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

    const rejectRequest = useCallback(async (
        requestId: string,
        adminId: string,
        adminName: string,
        reason: string
    ) => {
        setLoading(true);
        setError(null);
        try {
            const result = await RequestService.rejectRequest(requestId, adminId, adminName, reason);
            if (result.success) {
                setRequests(prev =>
                    prev.map(req =>
                        req.id === requestId
                            ? { ...req, status: 'rejected' }
                            : req
                    )
                );
                return { success: true };
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

    return {
        requests,
        loading,
        error,
        fetchAllRequests,
        fetchMyRequests,
        createRequest,
        approveRequest,
        rejectRequest
    };
};