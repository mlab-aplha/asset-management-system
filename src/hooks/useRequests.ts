// src/hooks/useRequests.ts
// General-purpose hook — used by students (own requests) and shared mutations.
import { useState, useCallback, useEffect } from 'react';
import {
    RequestService,
    ServiceResponse,
} from '../../backend-firebase/src/services/RequestService';
import {
    IRequest,
    CreateRequestInput,
    FulfillmentInput,
} from '../core/types/request.types';

export const useRequests = () => {
    const [requests, setRequests] = useState<IRequest[]>([]);
    const [pendingRequests, setPendingRequests] = useState<IRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [count, setCount] = useState(0);

    const svc = RequestService.getInstance();

    // ── Fetchers ───────────────────────────────────────────────────────────────

    const fetchAllRequests = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await svc.getRequests({});
            setRequests(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to fetch requests');
        } finally {
            setLoading(false);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    /** Fetch only the current student's requests. */
    const fetchMyRequests = useCallback(async (userId: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await svc.getRequests({ requesterId: userId });
            setRequests(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to fetch your requests');
        } finally {
            setLoading(false);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchPendingRequests = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await svc.getRequests({ status: ['pending'] });
            setPendingRequests(data);
            setCount(data.length);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to fetch pending requests');
        } finally {
            setLoading(false);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const getRequestById = useCallback(async (id: string): Promise<IRequest | null> => {
        setLoading(true);
        setError(null);
        try {
            return await svc.getRequestById(id);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to fetch request');
            return null;
        } finally {
            setLoading(false);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        fetchPendingRequests();
    }, [fetchPendingRequests]);

    // ── Mutations ──────────────────────────────────────────────────────────────

    /**
     * STUDENT creates a request → status 'pending', goes to facilitator queue.
     */
    const createRequest = useCallback(
        async (data: CreateRequestInput): Promise<ServiceResponse<IRequest>> => {
            setLoading(true);
            setError(null);
            try {
                const res = await RequestService.createRequest(data);
                if (res.success && res.data) {
                    setRequests((prev) => [res.data!, ...prev]);
                    if (res.data.status === 'pending') {
                        setPendingRequests((prev) => [res.data!, ...prev]);
                        setCount((c) => c + 1);
                    }
                } else {
                    setError(res.error ?? 'Failed to create request');
                }
                return res;
            } catch (e) {
                const msg = e instanceof Error ? e.message : 'Failed to create request';
                setError(msg);
                return { success: false, error: msg };
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    const deleteRequest = useCallback(
        async (requestId: string): Promise<ServiceResponse> => {
            setLoading(true);
            setError(null);
            try {
                const res = await RequestService.deleteRequest(requestId);
                if (res.success) {
                    setRequests((prev) => prev.filter((r) => r.id !== requestId));
                    setPendingRequests((prev) => prev.filter((r) => r.id !== requestId));
                    setCount((c) => Math.max(0, c - 1));
                } else {
                    setError(res.error ?? 'Failed to delete request');
                }
                return res;
            } catch (e) {
                const msg = e instanceof Error ? e.message : 'Failed to delete request';
                setError(msg);
                return { success: false, error: msg };
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    const updateRequest = useCallback(
        async (requestId: string, updates: Partial<IRequest>): Promise<ServiceResponse> => {
            setLoading(true);
            setError(null);
            try {
                const res = await RequestService.updateRequest(
                    requestId,
                    updates as Record<string, unknown>,
                );
                if (res.success) {
                    setRequests((prev) =>
                        prev.map((r) => (r.id === requestId ? { ...r, ...updates } : r)),
                    );
                    setPendingRequests((prev) =>
                        prev.map((r) => (r.id === requestId ? { ...r, ...updates } : r)),
                    );
                } else {
                    setError(res.error ?? 'Failed to update request');
                }
                return res;
            } catch (e) {
                const msg = e instanceof Error ? e.message : 'Failed to update request';
                setError(msg);
                return { success: false, error: msg };
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    const fulfillRequest = useCallback(
        async (
            requestId: string,
            data: FulfillmentInput,
            fulfilledBy: string,
        ): Promise<ServiceResponse> => {
            setLoading(true);
            setError(null);
            try {
                const res = await RequestService.fulfillRequest(requestId, data, fulfilledBy);
                if (!res.success) {
                    setError(res.error ?? 'Failed to fulfill request');
                }
                return res;
            } catch (e) {
                const msg = e instanceof Error ? e.message : 'Failed to fulfill request';
                setError(msg);
                return { success: false, error: msg };
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    return {
        requests,
        pendingRequests,
        loading,
        error,
        count,
        fetchAllRequests,
        fetchMyRequests,
        fetchPendingRequests,
        getRequestById,
        createRequest,
        deleteRequest,
        updateRequest,
        fulfillRequest,
    };
};