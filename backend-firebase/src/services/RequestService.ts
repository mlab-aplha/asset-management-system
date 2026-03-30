// backend-firebase/src/services/RequestService.ts

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
    Timestamp,
    QueryConstraint,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import {
    IRequest,
    IRequestFilters,
    CreateRequestInput,
    FulfillmentInput,
    ApproveInput,
    RejectInput,
    RequestItem,
    ApprovalData,
    ApprovalEntry,
    FulfillmentDetail,
    NEXT_STATUS,
    LEVEL_STATUS,
    APPROVAL_CHAIN,
} from '../../../src/core/types/request.types';

// ─── Service Response ─────────────────────────────────────────────────────────

export interface ServiceResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const COLLECTION = 'requests';

function toDate(val: unknown): Date | undefined {
    if (!val) return undefined;
    if (val instanceof Timestamp) return val.toDate();
    if (val instanceof Date) return val;
    if (typeof val === 'string') {
        const d = new Date(val);
        return isNaN(d.getTime()) ? undefined : d;
    }
    return undefined;
}

function convertTimestamps<T>(data: Record<string, unknown>): T {
    const out: Record<string, unknown> = { ...data };
    for (const key of Object.keys(out)) {
        const v = out[key];
        if (v instanceof Timestamp) {
            out[key] = v.toDate();
        } else if (Array.isArray(v)) {
            out[key] = v.map((item) =>
                item && typeof item === 'object' && !(item instanceof Date)
                    ? convertTimestamps(item as Record<string, unknown>)
                    : item,
            );
        } else if (v && typeof v === 'object' && !(v instanceof Date)) {
            out[key] = convertTimestamps(v as Record<string, unknown>);
        }
    }
    return out as T;
}

const VALID_ITEM_STATUSES = ['pending', 'fulfilled', 'cancelled', 'partial'] as const;

function normaliseItem(raw: Record<string, unknown>): RequestItem {
    const status = VALID_ITEM_STATUSES.includes(
        raw.itemStatus as (typeof VALID_ITEM_STATUSES)[number],
    )
        ? (raw.itemStatus as RequestItem['itemStatus'])
        : 'pending';

    return {
        assetType: (raw.assetType as string) || '',
        category: (raw.category as string) || '',
        quantity: (raw.quantity as number) || 0,
        itemStatus: status,
        purpose: raw.purpose as string | undefined,
        specifications: raw.specifications as Record<string, string> | undefined,
        urgency: raw.urgency as RequestItem['urgency'],
        fulfillmentDetails: (raw.fulfillmentDetails as FulfillmentDetail[]) || [],
    };
}

function normaliseApproval(raw: unknown): ApprovalData {
    const a = (raw as Record<string, unknown>) || {};

    // Build default 3-level approvers if none stored yet
    const defaultApprovers: ApprovalEntry[] = APPROVAL_CHAIN.map((role) => ({
        role,
        required: true,
        approved: false,
    }));

    return {
        approvers: ((a.approvers as ApprovalEntry[]) || defaultApprovers),
        currentApproverIndex: (a.currentApproverIndex as number) ?? 0,
        requestedAt: (a.requestedAt as Timestamp | Date) || Timestamp.now(),
        status: (a.status as 'pending' | 'approved' | 'rejected') || 'pending',
        rejectedBy: a.rejectedBy as string | undefined,
        rejectedByName: a.rejectedByName as string | undefined,
        rejectedAt: a.rejectedAt as Timestamp | Date | undefined,
        reason: a.reason as string | undefined,
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDoc(d: any): IRequest {
    const raw = d.data() as Record<string, unknown>;
    const converted = convertTimestamps<Record<string, unknown>>(raw);

    const rawItems = (converted.items as Record<string, unknown>[]) || [];

    return {
        id: d.id,
        requestId: (converted.requestId as string) || d.id,
        requesterId: (converted.requesterId as string) || '',
        requesterName: (converted.requesterName as string) || '',
        requesterEmail: (converted.requesterEmail as string) || '',
        locationId: (converted.locationId as string) || '',
        locationName: (converted.locationName as string) || '',
        department: (converted.department as string) || '',
        status: (converted.status as IRequest['status']) || 'pending',
        priority: (converted.priority as IRequest['priority']) || 'medium',
        items: rawItems.map(normaliseItem),
        notes: converted.notes as string | undefined,
        neededBy: converted.neededBy as Date | null | undefined,
        createdAt: (converted.createdAt as Date) || new Date(),
        updatedAt: (converted.updatedAt as Date) || new Date(),
        approval: normaliseApproval(converted.approval),
        expectedDuration: converted.expectedDuration as number | undefined,
        rejectionReason: converted.rejectionReason as string | undefined,
        fulfilledBy: converted.fulfilledBy as string | undefined,
        fulfilledAt: converted.fulfilledAt as Date | undefined,
    };
}

// ─── RequestService ───────────────────────────────────────────────────────────

export class RequestService {
    private static _instance: RequestService;

    static getInstance(): RequestService {
        if (!RequestService._instance) {
            RequestService._instance = new RequestService();
        }
        return RequestService._instance;
    }

    // ── Read ──────────────────────────────────────────────────────────────────

    async getRequests(
        filters?: IRequestFilters & { locationIds?: string[] },
    ): Promise<IRequest[]> {
        try {
            const ref = collection(db, COLLECTION);
            const constraints: QueryConstraint[] = [];

            if (filters?.status?.length) {
                constraints.push(where('status', 'in', filters.status));
            }
            if (filters?.priority?.length) {
                constraints.push(where('priority', 'in', filters.priority));
            }
            if (filters?.locationId) {
                constraints.push(where('locationId', '==', filters.locationId));
            }
            if (filters?.locationIds?.length) {
                constraints.push(where('locationId', 'in', filters.locationIds));
            }
            if (filters?.department) {
                constraints.push(where('department', '==', filters.department));
            }
            if (filters?.requesterId) {
                constraints.push(where('requesterId', '==', filters.requesterId));
            }

            constraints.push(orderBy('createdAt', 'desc'));

            const snap = await getDocs(query(ref, ...constraints));
            let results: IRequest[] = snap.docs.map(mapDoc);

            // Client-side filters
            if (filters?.searchTerm) {
                const term = filters.searchTerm.toLowerCase();
                results = results.filter(
                    (r) =>
                        r.requesterName?.toLowerCase().includes(term) ||
                        r.requestId?.toLowerCase().includes(term) ||
                        r.department?.toLowerCase().includes(term) ||
                        r.items?.some((i) => i.assetType.toLowerCase().includes(term)),
                );
            }
            if (filters?.dateFrom) {
                const from = filters.dateFrom.getTime();
                results = results.filter((r) => {
                    const t = toDate(r.createdAt)?.getTime();
                    return t !== undefined && t >= from;
                });
            }
            if (filters?.dateTo) {
                const to = filters.dateTo.getTime();
                results = results.filter((r) => {
                    const t = toDate(r.createdAt)?.getTime();
                    return t !== undefined && t <= to;
                });
            }

            return results;
        } catch (err) {
            console.error('[RequestService.getRequests]', err);
            return [];
        }
    }

    async getRequestById(id: string): Promise<IRequest | null> {
        try {
            const snap = await getDoc(doc(db, COLLECTION, id));
            if (!snap.exists()) return null;
            return mapDoc(snap);
        } catch (err) {
            console.error('[RequestService.getRequestById]', err);
            return null;
        }
    }

    // ── Static mutations ──────────────────────────────────────────────────────


    static async createRequest(
        data: CreateRequestInput,
    ): Promise<ServiceResponse<IRequest>> {
        try {
            const requestId = `REQ-${new Date().getFullYear()}-${String(
                Math.floor(Math.random() * 9000) + 1000,
            )}`;

            const items = data.items.map((i) => ({
                ...i,
                itemStatus: 'pending' as const,
                fulfillmentDetails: [],
            }));

            // Full 3-level approval chain stored in Firestore from creation
            const approval: ApprovalData = {
                approvers: APPROVAL_CHAIN.map((role) => ({
                    role,
                    required: true,
                    approved: false,
                })),
                currentApproverIndex: 0,
                requestedAt: Timestamp.now(),
                status: 'pending',
            };

            const payload = {
                requestId,
                requesterId: data.requesterId,
                requesterName: data.requesterName,
                requesterEmail: data.requesterEmail,
                locationId: data.locationId,
                locationName: data.locationName,
                department: data.department,
                items,
                status: 'pending' as const,
                priority: data.priority,
                notes: data.notes || '',
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                neededBy: data.neededBy
                    ? Timestamp.fromDate(new Date(data.neededBy))
                    : null,
                expectedDuration: data.expectedDuration || 0,
                approval,
            };

            const ref = await addDoc(collection(db, COLLECTION), payload);
            const svc = RequestService.getInstance();
            const created = await svc.getRequestById(ref.id);

            return {
                success: true,
                data: created!,
                message: 'Request submitted successfully',
            };
        } catch (err) {
            console.error('[RequestService.createRequest]', err);
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Unknown error',
            };
        }
    }


    static async approveRequest(input: ApproveInput): Promise<ServiceResponse> {
        try {
            const ref = doc(db, COLLECTION, input.requestId);
            const snap = await getDoc(ref);
            if (!snap.exists()) return { success: false, error: 'Request not found' };

            const current = mapDoc(snap);
            const { approval } = current;

            // Find the approver entry for this level
            const approverIndex = approval.approvers.findIndex(
                (a) => a.role === input.level,
            );

            if (approverIndex === -1) {
                return { success: false, error: `No approver entry found for level: ${input.level}` };
            }

            // Verify it is actually this level's turn
            const expectedStatus = LEVEL_STATUS[input.level];
            if (current.status !== expectedStatus) {
                return {
                    success: false,
                    error: `Request is not at the ${input.level} stage (current: ${current.status})`,
                };
            }

            // Mark this level as approved
            const updatedApprovers: ApprovalEntry[] = approval.approvers.map((a, i) => {
                if (i !== approverIndex) return a;
                return {
                    ...a,
                    approved: true,
                    approvedBy: input.approvedBy,
                    approvedByName: input.approvedByName,
                    approvedAt: Timestamp.now(),
                    comments: input.comments,
                };
            });

            const nextStatus = NEXT_STATUS[input.level];
            const nextIndex = approverIndex + 1;

            await updateDoc(ref, {
                status: nextStatus,
                approval: {
                    ...approval,
                    approvers: updatedApprovers,
                    currentApproverIndex: nextIndex,
                    // Mark overall approval complete only when admin approves
                    status: nextStatus === 'approved' ? 'approved' : 'pending',
                },
                updatedAt: Timestamp.now(),
            });

            return {
                success: true,
                message:
                    nextStatus === 'approved'
                        ? 'Request fully approved'
                        : `Approved — forwarded to ${nextIndex < APPROVAL_CHAIN.length
                            ? APPROVAL_CHAIN[nextIndex]
                            : 'next stage'
                        }`,
            };
        } catch (err) {
            console.error('[RequestService.approveRequest]', err);
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Unknown error',
            };
        }
    }


    static async rejectRequest(input: RejectInput): Promise<ServiceResponse> {
        try {
            const ref = doc(db, COLLECTION, input.requestId);
            const snap = await getDoc(ref);
            if (!snap.exists()) return { success: false, error: 'Request not found' };

            const current = mapDoc(snap);
            const { approval } = current;

            await updateDoc(ref, {
                status: 'rejected',
                rejectionReason: input.reason,
                approval: {
                    ...approval,
                    status: 'rejected',
                    rejectedBy: input.rejectedBy,
                    rejectedByName: input.rejectedByName,
                    rejectedAt: Timestamp.now(),
                    reason: input.reason,
                },
                updatedAt: Timestamp.now(),
            });

            return { success: true, message: 'Request rejected' };
        } catch (err) {
            console.error('[RequestService.rejectRequest]', err);
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Unknown error',
            };
        }
    }


    static async fulfillRequest(
        requestId: string,
        fulfillmentData: FulfillmentInput,
        fulfilledBy: string,
    ): Promise<ServiceResponse> {
        try {
            const ref = doc(db, COLLECTION, requestId);
            const snap = await getDoc(ref);
            if (!snap.exists()) return { success: false, error: 'Request not found' };

            const current = mapDoc(snap);
            if (current.status !== 'approved') {
                return {
                    success: false,
                    error: `Request must be approved before fulfillment (current: ${current.status})`,
                };
            }

            const updatedItems = current.items.map((item, index) => {
                const fi = fulfillmentData.items?.find((x) => x.itemId === String(index));
                if (!fi) return item;

                const prev = item.fulfillmentDetails || [];
                const totalDone =
                    prev.reduce((s, f) => s + f.quantity, 0) + fi.fulfilledQuantity;
                const newStatus: RequestItem['itemStatus'] =
                    totalDone >= item.quantity ? 'fulfilled' : 'partial';

                return {
                    ...item,
                    itemStatus: newStatus,
                    fulfillmentDetails: [
                        ...prev,
                        {
                            fulfilledBy,
                            fulfilledAt: Timestamp.now(),
                            quantity: fi.fulfilledQuantity,
                            notes: fi.notes || fulfillmentData.notes,
                        },
                    ],
                };
            });

            const allDone = updatedItems.every((i) => {
                const total = (i.fulfillmentDetails || []).reduce(
                    (s, f) => s + f.quantity,
                    0,
                );
                return total >= i.quantity;
            });

            await updateDoc(ref, {
                status: allDone ? 'fulfilled' : 'partially_fulfilled',
                items: updatedItems,
                fulfilledBy,
                fulfilledAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            });

            return {
                success: true,
                message: allDone ? 'Request fulfilled' : 'Request partially fulfilled',
            };
        } catch (err) {
            console.error('[RequestService.fulfillRequest]', err);
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Unknown error',
            };
        }
    }

    static async deleteRequest(requestId: string): Promise<ServiceResponse> {
        try {
            await deleteDoc(doc(db, COLLECTION, requestId));
            return { success: true, message: 'Request deleted' };
        } catch (err) {
            console.error('[RequestService.deleteRequest]', err);
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Unknown error',
            };
        }
    }

    static async updateRequest(
        requestId: string,
        updates: Record<string, unknown>,
    ): Promise<ServiceResponse> {
        try {
            const safe = { ...updates };
            delete safe.id;
            delete safe.requestId;
            delete safe.createdAt;

            await updateDoc(doc(db, COLLECTION, requestId), {
                ...safe,
                updatedAt: Timestamp.now(),
            });

            return { success: true, message: 'Request updated' };
        } catch (err) {
            console.error('[RequestService.updateRequest]', err);
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Unknown error',
            };
        }
    }
}

export class AdminRequestService extends RequestService {
    private static _admin: AdminRequestService;

    static getInstance(): AdminRequestService {
        if (!AdminRequestService._admin) {
            AdminRequestService._admin = new AdminRequestService();
        }
        return AdminRequestService._admin;
    }

    async getRequests(filters?: IRequestFilters): Promise<IRequest[]> {
        return super.getRequests(filters);
    }

    async getPendingRequests(): Promise<IRequest[]> {
        return this.getRequests({ status: ['pending', 'under_review', 'pending_admin'] });
    }

    /** Admin approves at the final 'admin' level. */
    async approveRequest(
        requestId: string,
        approvedBy: string,
        approvedByName: string,
        comments?: string,
    ): Promise<ServiceResponse> {
        return RequestService.approveRequest({
            requestId,
            level: 'admin',
            approvedBy,
            approvedByName,
            comments,
        });
    }

    async rejectRequest(
        requestId: string,
        reason: string,
        rejectedBy: string,
        rejectedByName: string,
    ): Promise<ServiceResponse> {
        return RequestService.rejectRequest({ requestId, reason, rejectedBy, rejectedByName });
    }

    async fulfillRequest(
        requestId: string,
        data: FulfillmentInput,
        fulfilledBy: string,
    ): Promise<ServiceResponse> {
        return RequestService.fulfillRequest(requestId, data, fulfilledBy);
    }

    async deleteRequest(requestId: string): Promise<ServiceResponse> {
        return RequestService.deleteRequest(requestId);
    }

    async updateRequest(
        requestId: string,
        updates: Record<string, unknown>,
    ): Promise<ServiceResponse> {
        return RequestService.updateRequest(requestId, updates);
    }
}


export class FacilitatorRequestService extends RequestService {
    private static _fac: FacilitatorRequestService;

    static getFacilitatorInstance(): FacilitatorRequestService {
        if (!FacilitatorRequestService._fac) {
            FacilitatorRequestService._fac = new FacilitatorRequestService();
        }
        return FacilitatorRequestService._fac;
    }

    async getAssignedRequests(
        locationIds: string[],
        filters?: IRequestFilters,
    ): Promise<IRequest[]> {
        if (!locationIds.length) return [];
        return super.getRequests({ ...filters, locationIds });
    }

    async getPendingRequests(locationIds: string[]): Promise<IRequest[]> {
        return this.getAssignedRequests(locationIds, { status: ['pending'] });
    }

    /** Approved requests that need physical fulfillment. */
    async getRequestsToFulfill(locationIds: string[]): Promise<IRequest[]> {
        return this.getAssignedRequests(locationIds, { status: ['approved'] });
    }

    /** Facilitator approves — moves request to 'under_review' (manager queue). */
    async approveRequest(
        requestId: string,
        approvedBy: string,
        approvedByName: string,
        comments?: string,
    ): Promise<ServiceResponse> {
        return RequestService.approveRequest({
            requestId,
            level: 'facilitator',
            approvedBy,
            approvedByName,
            comments,
        });
    }

    /** Facilitator rejects. */
    async rejectRequest(
        requestId: string,
        reason: string,
        rejectedBy: string,
        rejectedByName: string,
    ): Promise<ServiceResponse> {
        return RequestService.rejectRequest({ requestId, reason, rejectedBy, rejectedByName });
    }

    async fulfillRequest(
        requestId: string,
        data: FulfillmentInput,
        fulfilledBy: string,
    ): Promise<ServiceResponse> {
        return RequestService.fulfillRequest(requestId, data, fulfilledBy);
    }
}


export class ManagerRequestService extends RequestService {
    private static _mgr: ManagerRequestService;

    static getManagerInstance(): ManagerRequestService {
        if (!ManagerRequestService._mgr) {
            ManagerRequestService._mgr = new ManagerRequestService();
        }
        return ManagerRequestService._mgr;
    }

    async getAssignedRequests(
        locationIds: string[],
        filters?: IRequestFilters,
    ): Promise<IRequest[]> {
        if (!locationIds.length) return [];
        return super.getRequests({ ...filters, locationIds });
    }

    async getPendingRequests(locationIds: string[]): Promise<IRequest[]> {
        return this.getAssignedRequests(locationIds, { status: ['under_review'] });
    }

    async approveRequest(
        requestId: string,
        approvedBy: string,
        approvedByName: string,
        comments?: string,
    ): Promise<ServiceResponse> {
        return RequestService.approveRequest({
            requestId,
            level: 'manager',
            approvedBy,
            approvedByName,
            comments,
        });
    }

    async rejectRequest(
        requestId: string,
        reason: string,
        rejectedBy: string,
        rejectedByName: string,
    ): Promise<ServiceResponse> {
        return RequestService.rejectRequest({ requestId, reason, rejectedBy, rejectedByName });
    }
}