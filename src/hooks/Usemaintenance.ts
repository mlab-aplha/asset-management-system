import { useState, useCallback } from 'react';
import { maintenanceService } from '@backend/services/Maintenanceservice';
import {
    MaintenanceTicket, MaintenanceFormData,
    MaintenanceFilters, MaintenanceStats
} from '@/core/entities/Maintenance';

interface ServiceResponse<T = unknown> {
    success: boolean;
    data?: T;
    errors?: Record<string, string>;
}

export const useMaintenance = () => {
    const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
    const [stats, setStats] = useState<MaintenanceStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadTickets = useCallback(async (filters?: MaintenanceFilters): Promise<MaintenanceTicket[]> => {
        try {
            setLoading(true);
            setError(null);
            const data = await maintenanceService.getTickets(filters);
            setTickets(data);
            return data;
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to load tickets';
            setError(msg);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const loadStats = useCallback(async (locationId?: string) => {
        try {
            const data = await maintenanceService.getStats(locationId);
            setStats(data);
            return data;
        } catch (err) {
            console.error('Failed to load maintenance stats:', err);
            return null;
        }
    }, []);

    const createTicket = useCallback(async (
        formData: MaintenanceFormData,
        reportedBy: string,
        reportedByName: string
    ): Promise<ServiceResponse<MaintenanceTicket>> => {
        try {
            setLoading(true);
            setError(null);
            const ticket = await maintenanceService.createTicket(formData, reportedBy, reportedByName);
            await loadTickets();
            return { success: true, data: ticket };
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to create ticket';
            setError(msg);
            return { success: false, errors: { general: msg } };
        } finally {
            setLoading(false);
        }
    }, [loadTickets]);

    const updateTicket = useCallback(async (
        id: string,
        updates: Partial<MaintenanceFormData>
    ): Promise<ServiceResponse<MaintenanceTicket>> => {
        try {
            setLoading(true);
            setError(null);
            const ticket = await maintenanceService.updateTicket(id, updates);
            await loadTickets();
            return { success: true, data: ticket };
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to update ticket';
            setError(msg);
            return { success: false, errors: { general: msg } };
        } finally {
            setLoading(false);
        }
    }, [loadTickets]);

    const updateStatus = useCallback(async (
        id: string,
        status: MaintenanceTicket['status'],
        resolutionNotes?: string
    ): Promise<ServiceResponse<MaintenanceTicket>> => {
        try {
            setLoading(true);
            setError(null);
            const ticket = await maintenanceService.updateStatus(id, status, resolutionNotes);
            await loadTickets();
            return { success: true, data: ticket };
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to update status';
            setError(msg);
            return { success: false, errors: { general: msg } };
        } finally {
            setLoading(false);
        }
    }, [loadTickets]);

    const assignTicket = useCallback(async (
        id: string,
        assignedTo: string,
        assignedToName: string
    ): Promise<ServiceResponse<MaintenanceTicket>> => {
        try {
            setLoading(true);
            setError(null);
            const ticket = await maintenanceService.assignTicket(id, assignedTo, assignedToName);
            await loadTickets();
            return { success: true, data: ticket };
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to assign ticket';
            setError(msg);
            return { success: false, errors: { general: msg } };
        } finally {
            setLoading(false);
        }
    }, [loadTickets]);

    const deleteTicket = useCallback(async (id: string): Promise<ServiceResponse> => {
        try {
            setLoading(true);
            setError(null);
            await maintenanceService.deleteTicket(id);
            await loadTickets();
            return { success: true };
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to delete ticket';
            setError(msg);
            return { success: false, errors: { general: msg } };
        } finally {
            setLoading(false);
        }
    }, [loadTickets]);

    return {
        tickets, stats, loading, error, setError,
        loadTickets, loadStats, createTicket,
        updateTicket, updateStatus, assignTicket, deleteTicket
    };
};