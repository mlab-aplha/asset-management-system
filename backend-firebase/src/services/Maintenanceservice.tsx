import {
    collection, query, orderBy, getDocs, getDoc,
    doc, addDoc, updateDoc, deleteDoc, where,
    serverTimestamp, Timestamp, WithFieldValue, DocumentData
} from 'firebase/firestore';
import { db } from '../firebase/config';
import {
    MaintenanceTicket, MaintenanceFormData,
    MaintenanceFilters, MaintenanceStats
} from '../../../src/core/entities/Maintenance';

export class MaintenanceService {
    private static readonly COLLECTION = 'maintenance';

    // ─── Read ─────────────────────────────────────────────────────────────────

    async getTickets(filters?: MaintenanceFilters): Promise<MaintenanceTicket[]> {
        try {
            const ref = collection(db, MaintenanceService.COLLECTION);
            let q = query(ref, orderBy('createdAt', 'desc'));

            if (filters?.status && filters.status !== 'all')
                q = query(q, where('status', '==', filters.status));
            if (filters?.priority && filters.priority !== 'all')
                q = query(q, where('priority', '==', filters.priority));
            if (filters?.type && filters.type !== 'all')
                q = query(q, where('type', '==', filters.type));
            if (filters?.assetId)
                q = query(q, where('assetId', '==', filters.assetId));
            if (filters?.assignedTo)
                q = query(q, where('assignedTo', '==', filters.assignedTo));
            if (filters?.locationId)
                q = query(q, where('locationId', '==', filters.locationId));

            const snapshot = await getDocs(q);
            let tickets: MaintenanceTicket[] = snapshot.docs.map(d => this.mapDoc(d));

            if (filters?.searchTerm) {
                const term = filters.searchTerm.toLowerCase();
                tickets = tickets.filter(t =>
                    t.assetName?.toLowerCase().includes(term) ||
                    t.assetTag?.toLowerCase().includes(term) ||
                    t.description?.toLowerCase().includes(term) ||
                    t.reportedByName?.toLowerCase().includes(term) ||
                    t.assignedToName?.toLowerCase().includes(term)
                );
            }
            return tickets;
        } catch (error) {
            console.error('Error fetching tickets:', error);
            throw new Error('Failed to fetch maintenance tickets');
        }
    }

    async getTicketById(id: string): Promise<MaintenanceTicket | null> {
        try {
            const ref = doc(db, MaintenanceService.COLLECTION, id);
            const snapshot = await getDoc(ref);
            if (!snapshot.exists()) return null;
            return this.mapDoc(snapshot);
        } catch (error) {
            console.error('Error fetching ticket:', error);
            throw new Error('Failed to fetch maintenance ticket');
        }
    }

    async getTicketsByAsset(assetId: string): Promise<MaintenanceTicket[]> {
        return this.getTickets({ assetId });
    }

    async getTicketsByLocation(locationId: string): Promise<MaintenanceTicket[]> {
        return this.getTickets({ locationId });
    }

    // ─── Write ────────────────────────────────────────────────────────────────

    async createTicket(
        data: MaintenanceFormData,
        reportedBy: string,
        reportedByName: string
    ): Promise<MaintenanceTicket> {
        try {
            const payload: WithFieldValue<DocumentData> = {
                assetId: data.assetId,
                assetName: data.assetName,
                assetTag: data.assetTag || '',
                locationId: data.locationId || '',
                locationName: data.locationName || '',
                type: data.type,
                priority: data.priority,
                status: data.status || 'pending',
                description: data.description,
                reportedBy,
                reportedByName,
                assignedTo: data.assignedTo || null,
                assignedToName: data.assignedToName || null,
                estimatedCompletionDate: data.estimatedCompletionDate
                    ? Timestamp.fromDate(data.estimatedCompletionDate)
                    : null,
                resolutionNotes: data.resolutionNotes || '',
                resolvedAt: null,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const docRef = await addDoc(
                collection(db, MaintenanceService.COLLECTION),
                payload
            );

            return {
                id: docRef.id,
                ...data,
                status: 'pending',
                reportedBy,
                reportedByName,
                createdAt: new Date(),
                updatedAt: new Date()
            } as MaintenanceTicket;
        } catch (error) {
            console.error('Error creating ticket:', error);
            throw new Error('Failed to create maintenance ticket');
        }
    }

    async updateTicket(
        id: string,
        updates: Partial<MaintenanceFormData>
    ): Promise<MaintenanceTicket> {
        try {
            const ref = doc(db, MaintenanceService.COLLECTION, id);
            const snapshot = await getDoc(ref);
            if (!snapshot.exists()) throw new Error('Ticket not found');

            const payload: WithFieldValue<DocumentData> = {
                ...updates,
                updatedAt: serverTimestamp()
            };
            if (updates.estimatedCompletionDate) {
                payload.estimatedCompletionDate = Timestamp.fromDate(
                    updates.estimatedCompletionDate
                );
            }

            await updateDoc(ref, payload);
            const updated = await this.getTicketById(id);
            if (!updated) throw new Error('Ticket not found after update');
            return updated;
        } catch (error) {
            console.error('Error updating ticket:', error);
            throw new Error('Failed to update maintenance ticket');
        }
    }

    async updateStatus(
        id: string,
        status: MaintenanceTicket['status'],
        resolutionNotes?: string
    ): Promise<MaintenanceTicket> {
        try {
            const ref = doc(db, MaintenanceService.COLLECTION, id);
            const updates: WithFieldValue<DocumentData> = {
                status,
                updatedAt: serverTimestamp()
            };
            if (status === 'completed') {
                updates.resolvedAt = serverTimestamp();
                if (resolutionNotes) updates.resolutionNotes = resolutionNotes;
            }
            await updateDoc(ref, updates);
            const updated = await this.getTicketById(id);
            if (!updated) throw new Error('Ticket not found after status update');
            return updated;
        } catch (error) {
            console.error('Error updating ticket status:', error);
            throw new Error('Failed to update ticket status');
        }
    }

    async assignTicket(
        id: string,
        assignedTo: string,
        assignedToName: string
    ): Promise<MaintenanceTicket> {
        return this.updateTicket(id, { assignedTo, assignedToName });
    }

    async deleteTicket(id: string): Promise<void> {
        try {
            const ref = doc(db, MaintenanceService.COLLECTION, id);
            const snapshot = await getDoc(ref);
            if (!snapshot.exists()) throw new Error('Ticket not found');
            await deleteDoc(ref);
        } catch (error) {
            console.error('Error deleting ticket:', error);
            throw new Error('Failed to delete maintenance ticket');
        }
    }

    // ─── Stats ────────────────────────────────────────────────────────────────

    async getStats(locationId?: string): Promise<MaintenanceStats> {
        try {
            const tickets = await this.getTickets(
                locationId ? { locationId } : undefined
            );
            const now = new Date();
            return {
                total: tickets.length,
                pending: tickets.filter(t => t.status === 'pending').length,
                inProgress: tickets.filter(t => t.status === 'in-progress').length,
                completed: tickets.filter(t => t.status === 'completed').length,
                cancelled: tickets.filter(t => t.status === 'cancelled').length,
                critical: tickets.filter(t => t.priority === 'critical').length,
                high: tickets.filter(t => t.priority === 'high').length,
                overdue: tickets.filter(t =>
                    t.estimatedCompletionDate &&
                    t.estimatedCompletionDate < now &&
                    t.status !== 'completed' &&
                    t.status !== 'cancelled'
                ).length
            };
        } catch (error) {
            console.error('Error getting maintenance stats:', error);
            throw new Error('Failed to get maintenance stats');
        }
    }

    // ─── Private ─────────────────────────────────────────────────────────────

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private mapDoc(d: any): MaintenanceTicket {
        const data = d.data();
        return {
            id: d.id,
            assetId: data.assetId,
            assetName: data.assetName,
            assetTag: data.assetTag,
            locationId: data.locationId,
            locationName: data.locationName,
            type: data.type,
            priority: data.priority,
            status: data.status,
            description: data.description,
            reportedBy: data.reportedBy,
            reportedByName: data.reportedByName,
            assignedTo: data.assignedTo,
            assignedToName: data.assignedToName,
            estimatedCompletionDate: data.estimatedCompletionDate?.toDate?.() || undefined,
            resolvedAt: data.resolvedAt?.toDate?.() || undefined,
            resolutionNotes: data.resolutionNotes,
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date()
        };
    }
}

export const maintenanceService = new MaintenanceService();