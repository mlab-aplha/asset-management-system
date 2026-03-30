// backend-firebase/src/services/NotificationService.ts
import {
    collection,
    query,
    where,
    orderBy,
    getDocs,
    getDoc,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    writeBatch,
    Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationType =
    | 'approval_required'
    | 'request_approved'
    | 'request_rejected'
    | 'request_fulfilled'
    | 'request_submitted'
    | 'system';

export interface NotificationData {
    requestId?: string;
    assetType?: string;
    location?: string;
    quantity?: number;
    requesterName?: string;
    [key: string]: unknown;
}

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    actionUrl?: string;
    read: boolean;
    data?: NotificationData;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateNotificationInput {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    actionUrl?: string;
    data?: NotificationData;
}

interface ServiceResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

// ─── NotificationService ──────────────────────────────────────────────────────

const COLLECTION = 'notifications';

function mapDoc(d: { id: string; data: () => Record<string, unknown> }): Notification {
    const raw = d.data();
    const toDate = (v: unknown): Date =>
        v instanceof Timestamp ? v.toDate() : v instanceof Date ? v : new Date();

    return {
        id: d.id,
        userId: (raw.userId as string) || '',
        title: (raw.title as string) || '',
        message: (raw.message as string) || '',
        type: (raw.type as NotificationType) || 'system',
        actionUrl: raw.actionUrl as string | undefined,
        read: Boolean(raw.read),
        data: raw.data as NotificationData | undefined,
        createdAt: toDate(raw.createdAt),
        updatedAt: toDate(raw.updatedAt),
    };
}

export class NotificationService {
    // ── Read ──────────────────────────────────────────────────────────────────

    static async getForUser(userId: string): Promise<Notification[]> {
        try {
            const q = query(
                collection(db, COLLECTION),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc'),
            );
            const snap = await getDocs(q);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return snap.docs.map((d) => mapDoc(d as any));
        } catch (err) {
            console.error('[NotificationService.getForUser]', err);
            return [];
        }
    }

    static async getUnreadCount(userId: string): Promise<number> {
        try {
            const q = query(
                collection(db, COLLECTION),
                where('userId', '==', userId),
                where('read', '==', false),
            );
            const snap = await getDocs(q);
            return snap.size;
        } catch {
            return 0;
        }
    }

    static async getById(id: string): Promise<Notification | null> {
        try {
            const snap = await getDoc(doc(db, COLLECTION, id));
            if (!snap.exists()) return null;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return mapDoc(snap as any);
        } catch {
            return null;
        }
    }

    // ── Write ─────────────────────────────────────────────────────────────────

    static async create(input: CreateNotificationInput): Promise<ServiceResponse<Notification>> {
        try {
            const now = Timestamp.now();
            const payload = {
                userId: input.userId,
                title: input.title,
                message: input.message,
                type: input.type,
                actionUrl: input.actionUrl || null,
                data: input.data || null,
                read: false,
                createdAt: now,
                updatedAt: now,
            };
            const ref = await addDoc(collection(db, COLLECTION), payload);
            const created = await NotificationService.getById(ref.id);
            return { success: true, data: created! };
        } catch (err) {
            console.error('[NotificationService.create]', err);
            return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
        }
    }

    /** Notify a list of user IDs (e.g., all admins) about a new request. */
    static async notifyUsers(
        userIds: string[],
        input: Omit<CreateNotificationInput, 'userId'>,
    ): Promise<void> {
        try {
            const batch = writeBatch(db);
            const now = Timestamp.now();
            for (const userId of userIds) {
                const ref = doc(collection(db, COLLECTION));
                batch.set(ref, {
                    userId,
                    title: input.title,
                    message: input.message,
                    type: input.type,
                    actionUrl: input.actionUrl || null,
                    data: input.data || null,
                    read: false,
                    createdAt: now,
                    updatedAt: now,
                });
            }
            await batch.commit();
        } catch (err) {
            console.error('[NotificationService.notifyUsers]', err);
        }
    }

    static async markAsRead(id: string): Promise<ServiceResponse> {
        try {
            await updateDoc(doc(db, COLLECTION, id), {
                read: true,
                updatedAt: Timestamp.now(),
            });
            return { success: true };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
        }
    }

    static async markAllAsRead(userId: string): Promise<ServiceResponse> {
        try {
            const q = query(
                collection(db, COLLECTION),
                where('userId', '==', userId),
                where('read', '==', false),
            );
            const snap = await getDocs(q);
            const batch = writeBatch(db);
            snap.docs.forEach((d) => {
                batch.update(d.ref, { read: true, updatedAt: Timestamp.now() });
            });
            await batch.commit();
            return { success: true };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
        }
    }

    static async delete(id: string): Promise<ServiceResponse> {
        try {
            await deleteDoc(doc(db, COLLECTION, id));
            return { success: true };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
        }
    }

    // ── Convenience notification creators ─────────────────────────────────────

    /**
     * Notify admin users when a new request is submitted.
     * Call this after RequestService.createRequest() succeeds.
     */
    static async onRequestSubmitted(
        adminUserIds: string[],
        requestId: string,
        requesterName: string,
        assetType: string,
        quantity: number,
        locationName: string,
    ): Promise<void> {
        await NotificationService.notifyUsers(adminUserIds, {
            title: 'New Asset Request',
            message: `${requesterName} has requested ${quantity} ${assetType}(s) for ${locationName}`,
            type: 'approval_required',
            actionUrl: `/requests/${requestId}`,
            data: { requestId, requesterName, assetType, quantity, location: locationName },
        });
    }

    /**
     * Notify requester when their request is approved.
     */
    static async onRequestApproved(
        requesterId: string,
        requestId: string,
        approvedByName: string,
    ): Promise<void> {
        await NotificationService.create({
            userId: requesterId,
            title: 'Request Approved',
            message: `Your request has been approved by ${approvedByName}`,
            type: 'request_approved',
            actionUrl: `/requests/${requestId}`,
            data: { requestId },
        });
    }

    /**
     * Notify requester when their request is rejected.
     */
    static async onRequestRejected(
        requesterId: string,
        requestId: string,
        reason: string,
    ): Promise<void> {
        await NotificationService.create({
            userId: requesterId,
            title: 'Request Rejected',
            message: `Your request was rejected: ${reason}`,
            type: 'request_rejected',
            actionUrl: `/requests/${requestId}`,
            data: { requestId },
        });
    }

    /**
     * Notify requester when their request is fulfilled.
     */
    static async onRequestFulfilled(
        requesterId: string,
        requestId: string,
    ): Promise<void> {
        await NotificationService.create({
            userId: requesterId,
            title: 'Request Fulfilled',
            message: 'Your asset request has been fulfilled. Please collect your items.',
            type: 'request_fulfilled',
            actionUrl: `/requests/${requestId}`,
            data: { requestId },
        });
    }
}