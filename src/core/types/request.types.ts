// src/core/types/request.types.ts


import { Timestamp } from 'firebase/firestore';

// ─── Status & Priority ────────────────────────────────────────────────────────

export type RequestStatus =
    | 'draft'
    | 'pending'              // Submitted — awaiting facilitator
    | 'under_review'         // Facilitator approved — awaiting manager
    | 'pending_admin'        // Manager approved — awaiting super admin
    | 'approved'             // All levels approved
    | 'rejected'             // Rejected at any level
    | 'fulfilled'
    | 'partially_fulfilled'
    | 'cancelled';

export type RequestPriority = 'low' | 'medium' | 'high' | 'urgent';

export type ApprovalLevel = 'facilitator' | 'manager' | 'admin';

// ─── Approval ─────────────────────────────────────────────────────────────────

export interface ApprovalEntry {
    role: ApprovalLevel;
    required: boolean;
    approved: boolean;
    approvedBy?: string;
    approvedByName?: string;
    approvedAt?: Timestamp | Date;
    comments?: string;
}

export interface ApprovalData {
    approvers: ApprovalEntry[];
    currentApproverIndex: number;
    requestedAt: Timestamp | Date;
    status: 'pending' | 'approved' | 'rejected';
    rejectedBy?: string;
    rejectedByName?: string;
    rejectedAt?: Timestamp | Date;
    reason?: string;
}

// ─── Items ────────────────────────────────────────────────────────────────────

export interface FulfillmentDetail {
    fulfilledBy: string;
    fulfilledAt: Timestamp | Date;
    quantity: number;
    notes?: string;
}

export interface RequestItem {
    assetType: string;
    category: string;
    quantity: number;
    itemStatus: 'pending' | 'fulfilled' | 'cancelled' | 'partial';
    purpose?: string;
    specifications?: Record<string, string>;
    urgency?: 'low' | 'normal' | 'high' | 'urgent';
    fulfillmentDetails?: FulfillmentDetail[];
}

// ─── Main Request Interface ───────────────────────────────────────────────────

export interface IRequest {
    id: string;
    requestId: string;
    requesterId: string;
    requesterName: string;
    requesterEmail: string;
    locationId: string;
    locationName: string;
    department: string;
    status: RequestStatus;
    priority: RequestPriority;
    items: RequestItem[];
    notes?: string;
    neededBy?: Timestamp | Date | null;
    createdAt: Timestamp | Date;
    updatedAt: Timestamp | Date;
    approval: ApprovalData;
    expectedDuration?: number;
    rejectionReason?: string;
    fulfilledBy?: string;
    fulfilledAt?: Timestamp | Date;
}

// ─── Filters ──────────────────────────────────────────────────────────────────

export interface IRequestFilters {
    status?: string[];
    priority?: string[];
    locationId?: string;
    locationIds?: string[];
    department?: string;
    requesterId?: string;
    searchTerm?: string;
    dateFrom?: Date;
    dateTo?: Date;
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface IRequestStats {
    total: number;
    pending: number;
    underReview: number;
    pendingAdmin: number;
    approved: number;
    rejected: number;
    fulfilled: number;
    partiallyFulfilled: number;
    urgent: number;
}

// ─── Input types ──────────────────────────────────────────────────────────────

export interface CreateRequestInput {
    requesterId: string;
    requesterName: string;
    requesterEmail: string;
    locationId: string;
    locationName: string;
    department: string;
    items: Omit<RequestItem, 'itemStatus' | 'fulfillmentDetails'>[];
    priority: RequestPriority;
    notes?: string;
    neededBy?: Date | string;
    expectedDuration?: number;
}

export interface ApproveInput {
    requestId: string;
    level: ApprovalLevel;
    approvedBy: string;
    approvedByName: string;
    comments?: string;
}

export interface RejectInput {
    requestId: string;
    reason: string;
    rejectedBy: string;
    rejectedByName: string;
}

export interface FulfillmentInput {
    notes?: string;
    items?: Array<{
        itemId: string;
        fulfilledQuantity: number;
        notes?: string;
    }>;
}

// ─── Approval flow constants ──────────────────────────────────────────────────

/**
 * After a level approves, the request moves to this status.
 * Admin approval → 'approved' (final).
 */
export const NEXT_STATUS: Record<ApprovalLevel, RequestStatus> = {
    facilitator: 'under_review',
    manager: 'pending_admin',
    admin: 'approved',
};

/**
 * The request status that means it is currently at this level's queue.
 */
export const LEVEL_STATUS: Record<ApprovalLevel, RequestStatus> = {
    facilitator: 'pending',
    manager: 'under_review',
    admin: 'pending_admin',
};

/** Human-readable label for each level. */
export const LEVEL_LABELS: Record<ApprovalLevel, string> = {
    facilitator: 'Asset Facilitator',
    manager: 'Hub Manager',
    admin: 'Super Admin',
};

/** Ordered chain. */
export const APPROVAL_CHAIN: ApprovalLevel[] = ['facilitator', 'manager', 'admin'];