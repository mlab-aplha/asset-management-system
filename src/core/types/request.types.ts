// src/core/types/request.types.ts
import { Timestamp } from 'firebase/firestore';

// Define types locally - don't import from service to avoid circular dependency
export interface FulfillmentDetail {
    fulfilledBy?: string;
    fulfilledAt?: Timestamp;
    quantity?: number;
    notes?: string;
}

export interface RequestItem {
    assetType: string;
    category: string;
    quantity: number;
    itemStatus: 'pending' | 'fulfilled' | 'cancelled' | 'partial';
    purpose?: string;
    specifications?: Record<string, string>; // This matches your Firestore data
    urgency?: 'low' | 'normal' | 'high' | 'urgent';
    fulfillmentDetails?: FulfillmentDetail[];
}

export interface Approver {
    approved: boolean;
    required: boolean;
    role: string;
}

export interface ApprovalData {
    approvers: Approver[];
    currentApproverIndex: number;
    requestedAt: Timestamp;
    status: 'pending' | 'approved' | 'rejected';
    rejectedBy?: string;
    rejectedAt?: Timestamp;
    reason?: string;
}

// This matches your actual Firestore document structure EXACTLY
export interface IRequest {
    // Core fields
    id: string;
    requestId: string;

    // Requester info
    requesterId: string;
    requesterName: string;
    requesterEmail: string;

    // Location
    locationId: string;
    locationName: string;
    department: string;

    // Status & Priority
    status: 'draft' | 'pending' | 'under_review' | 'approved' | 'rejected' | 'fulfilled' | 'cancelled' | 'partially_fulfilled';
    priority: 'low' | 'medium' | 'high' | 'urgent';

    // Items
    items: RequestItem[];

    // Dates
    createdAt: Timestamp;
    updatedAt: Timestamp;
    neededBy?: Timestamp;

    // Additional Fields
    notes?: string;
    expectedDuration?: number;

    // Approval Workflow
    approval: ApprovalData;

    // Optional fields that might exist
    rejectionReason?: string;

    // Computed fields (not in Firestore)
    formattedCreatedAt?: string;
    itemCount?: number;
    totalQuantity?: number;
}

export interface IRequestFilters {
    status?: string[];
    priority?: string[];
    dateFrom?: Date;
    dateTo?: Date;
    locationId?: string;
    department?: string;
    searchTerm?: string;
    requesterId?: string;
}

export interface IRequestStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    fulfilled: number;
    urgent: number;
}

export interface FirestoreDocument {
    id: string;
    [key: string]: unknown;
}

export abstract class BaseRequestService {
    protected collectionName = 'requests';

    abstract getRequests(filters?: IRequestFilters): Promise<IRequest[]>;
    abstract getRequestById(id: string): Promise<IRequest | null>;
    abstract getStats(): Promise<IRequestStats>;

    protected formatRequest(doc: FirestoreDocument): IRequest {
        const data = doc as unknown as Record<string, unknown>;

        // Format date
        let formattedDate = 'N/A';
        const createdAt = data.createdAt;
        if (createdAt instanceof Timestamp) {
            formattedDate = createdAt.toDate().toLocaleDateString();
        } else if (createdAt instanceof Date) {
            formattedDate = createdAt.toLocaleDateString();
        }

        // Calculate totals
        const items = (data.items as RequestItem[]) || [];
        const itemCount = items.length;
        const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

        return {
            id: doc.id,
            requestId: (data.requestId as string) || '',
            requesterId: (data.requesterId as string) || '',
            requesterName: (data.requesterName as string) || '',
            requesterEmail: (data.requesterEmail as string) || '',
            department: (data.department as string) || '',
            locationId: (data.locationId as string) || '',
            locationName: (data.locationName as string) || '',
            status: (data.status as IRequest['status']) || 'pending',
            priority: (data.priority as IRequest['priority']) || 'medium',
            items: items,
            notes: data.notes as string,
            neededBy: data.neededBy as Timestamp,
            createdAt: data.createdAt as Timestamp,
            updatedAt: data.updatedAt as Timestamp,
            approval: (data.approval as ApprovalData) || {
                approvers: [{ role: 'admin', required: true, approved: false }],
                currentApproverIndex: 0,
                requestedAt: Timestamp.now(),
                status: 'pending'
            },
            expectedDuration: data.expectedDuration as number,
            rejectionReason: data.rejectionReason as string,
            formattedCreatedAt: formattedDate,
            itemCount: itemCount,
            totalQuantity: totalQuantity
        };
    }
}