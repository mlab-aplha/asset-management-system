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
    QueryConstraint
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Define types locally to avoid circular dependency
export interface RequestItem {
    assetType: string;
    category: string;
    quantity: number;
    itemStatus: 'pending' | 'fulfilled' | 'cancelled' | 'partial';
    purpose?: string;
    specifications?: Record<string, string>;
    urgency?: 'low' | 'normal' | 'high' | 'urgent';
    fulfillmentDetails?: Array<{
        fulfilledBy: string;
        fulfilledAt: Timestamp;
        quantity: number;
        notes?: string;
    }>;
}

// Raw item type from Firestore (might have string itemStatus)
interface RawRequestItem {
    assetType: string;
    category?: string;
    quantity: number;
    itemStatus?: string;
    purpose?: string;
    specifications?: Record<string, string>;
    urgency?: 'low' | 'normal' | 'high' | 'urgent';
    fulfillmentDetails?: Array<{
        fulfilledBy: string;
        fulfilledAt: Timestamp;
        quantity: number;
        notes?: string;
    }>;
}

export interface ApprovalData {
    approvers: Array<{
        approved: boolean;
        required: boolean;
        role: string;
    }>;
    currentApproverIndex: number;
    requestedAt: Timestamp;
    status: 'pending' | 'approved' | 'rejected';
    rejectedBy?: string;
    rejectedAt?: Timestamp;
    reason?: string;
}

export interface FulfillmentData {
    fulfilledBy: string;
    fulfilledAt: Timestamp;
    notes?: string;
    items?: Array<{
        itemId: string;
        fulfilledQuantity: number;
        notes?: string;
    }>;
}

// Main request interface (matches Firestore structure exactly)
export interface AssetRequest {
    id?: string;
    requestId: string;
    requesterId: string;
    requesterName: string;
    requesterEmail: string;
    locationId: string;
    locationName: string;
    department: string;
    status: 'draft' | 'pending' | 'under_review' | 'approved' | 'rejected' | 'fulfilled' | 'cancelled' | 'partially_fulfilled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    items: RequestItem[];
    notes?: string;
    neededBy?: Timestamp | null;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    approval: ApprovalData;
    expectedDuration?: number;
    rejectionReason?: string;
}

// Define ServiceResponse type
export interface ServiceResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

// Define specific input types
export interface CreateRequestInput {
    requesterId: string;
    requesterName: string;
    requesterEmail: string;
    locationId: string;
    locationName: string;
    department: string;
    items: Array<{
        assetType: string;
        category: string;
        quantity: number;
        itemStatus?: 'pending' | 'fulfilled' | 'cancelled';
        purpose?: string;
        specifications?: Record<string, string>;
        urgency?: 'low' | 'normal' | 'high' | 'urgent';
        fulfillmentDetails?: Array<{
            fulfilledBy: string;
            fulfilledAt: Timestamp;
            quantity: number;
            notes?: string;
        }>;
    }>;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    notes?: string;
    neededBy?: Date | Timestamp | string;
    expectedDuration?: number;
}

export interface FulfillmentInput {
    notes?: string;
    items?: Array<{
        itemId: string;
        fulfilledQuantity: number;
        notes?: string;
    }>;
}

// Type for filter parameters
export interface RequestFilters {
    status?: string[];
    priority?: string[];
    locationId?: string;
    department?: string;
    requesterId?: string;
    searchTerm?: string;
    dateFrom?: Date;
    dateTo?: Date;
}

export class RequestService {
    private static instance: RequestService;
    protected collectionName = 'requests';

    protected constructor() { }

    public static getInstance(): RequestService {
        if (!RequestService.instance) {
            RequestService.instance = new RequestService();
        }
        return RequestService.instance;
    }

    // Helper to safely convert any value to Date
    private safeGetTime(value: unknown): number | null {
        if (!value) return null;

        if (value instanceof Timestamp) {
            return value.toDate().getTime();
        } else if (value instanceof Date) {
            return value.getTime();
        } else if (typeof value === 'string') {
            try {
                return new Date(value).getTime();
            } catch {
                return null;
            }
        }
        return null;
    }

    // Helper to convert Firestore timestamps to Date objects
    protected convertTimestamps<T>(data: Record<string, unknown>): T {
        const converted: Record<string, unknown> = { ...data };

        Object.keys(converted).forEach(key => {
            const value = converted[key];

            if (value instanceof Timestamp) {
                converted[key] = value.toDate();
            } else if (Array.isArray(value)) {
                converted[key] = value.map(item =>
                    item && typeof item === 'object'
                        ? this.convertTimestamps(item as Record<string, unknown>)
                        : item
                );
            } else if (value && typeof value === 'object' && !(value instanceof Date)) {
                converted[key] = this.convertTimestamps(value as Record<string, unknown>);
            }
        });

        return converted as T;
    }

    // Helper to ensure item has correct status type
    private normalizeItem(item: RawRequestItem): RequestItem {
        const validStatuses = ['pending', 'fulfilled', 'cancelled', 'partial'];
        const itemStatus = item.itemStatus && validStatuses.includes(item.itemStatus)
            ? item.itemStatus as 'pending' | 'fulfilled' | 'cancelled' | 'partial'
            : 'pending';

        return {
            assetType: item.assetType || '',
            category: item.category || '',
            quantity: item.quantity || 0,
            itemStatus,
            purpose: item.purpose,
            specifications: item.specifications,
            urgency: item.urgency,
            fulfillmentDetails: item.fulfillmentDetails
        };
    }

    // Helper to normalize an array of items
    private normalizeItems(items: RawRequestItem[]): RequestItem[] {
        return items.map(item => this.normalizeItem(item));
    }

    // Helper to normalize approval data
    private normalizeApproval(data: unknown): ApprovalData {
        const approvalData = data as Record<string, unknown> || {};

        return {
            approvers: (approvalData.approvers as Array<{ approved: boolean; required: boolean; role: string; }>) ||
                [{ role: 'admin', required: true, approved: false }],
            currentApproverIndex: (approvalData.currentApproverIndex as number) || 0,
            requestedAt: (approvalData.requestedAt as Timestamp) || Timestamp.now(),
            status: (approvalData.status as 'pending' | 'approved' | 'rejected') || 'pending',
            rejectedBy: approvalData.rejectedBy as string,
            rejectedAt: approvalData.rejectedAt as Timestamp,
            reason: approvalData.reason as string
        };
    }

    // === INSTANCE METHODS FOR CHILD CLASSES ===
    async getRequests(filters?: RequestFilters): Promise<AssetRequest[]> {
        try {
            const requestsRef = collection(db, this.collectionName);
            const constraints: QueryConstraint[] = [];

            // Add filters
            if (filters?.status?.length) {
                constraints.push(where("status", "in", filters.status));
            }

            if (filters?.priority?.length) {
                constraints.push(where("priority", "in", filters.priority));
            }

            if (filters?.locationId) {
                constraints.push(where("locationId", "==", filters.locationId));
            }

            if (filters?.department) {
                constraints.push(where("department", "==", filters.department));
            }

            if (filters?.requesterId) {
                constraints.push(where("requesterId", "==", filters.requesterId));
            }

            // Always order by createdAt descending
            constraints.push(orderBy("createdAt", "desc"));

            const q = query(requestsRef, ...constraints);
            const snapshot = await getDocs(q);

            let requests = snapshot.docs.map(doc => {
                const data = doc.data();
                const converted = this.convertTimestamps<Omit<AssetRequest, 'id'>>(data);

                // Normalize items to ensure correct typing
                const items = converted.items as unknown;
                if (items && Array.isArray(items)) {
                    converted.items = this.normalizeItems(items as RawRequestItem[]);
                }

                // Normalize approval
                if (converted.approval) {
                    converted.approval = this.normalizeApproval(converted.approval);
                }

                return {
                    id: doc.id,
                    ...converted
                } as AssetRequest;
            });

            // Apply client-side filters that can't be done in Firestore
            if (filters?.searchTerm) {
                const term = filters.searchTerm.toLowerCase();
                requests = requests.filter(req =>
                    req.requesterName?.toLowerCase().includes(term) ||
                    req.requestId?.toLowerCase().includes(term) ||
                    req.department?.toLowerCase().includes(term) ||
                    req.items?.some(item =>
                        item.assetType.toLowerCase().includes(term) ||
                        (item.category && item.category.toLowerCase().includes(term))
                    )
                );
            }

            if (filters?.dateFrom) {
                const fromTime = filters.dateFrom.getTime();
                requests = requests.filter(req => {
                    const reqTime = this.safeGetTime(req.createdAt);
                    return reqTime !== null && reqTime >= fromTime;
                });
            }

            if (filters?.dateTo) {
                const toTime = filters.dateTo.getTime();
                requests = requests.filter(req => {
                    const reqTime = this.safeGetTime(req.createdAt);
                    return reqTime !== null && reqTime <= toTime;
                });
            }

            return requests;
        } catch (error) {
            console.error('Error fetching requests:', error);
            return [];
        }
    }

    async getRequestById(id: string): Promise<AssetRequest | null> {
        try {
            const docRef = doc(db, this.collectionName, id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                const converted = this.convertTimestamps<Omit<AssetRequest, 'id'>>(data);

                // Normalize items
                const items = converted.items as unknown;
                if (items && Array.isArray(items)) {
                    converted.items = this.normalizeItems(items as RawRequestItem[]);
                }

                // Normalize approval
                if (converted.approval) {
                    converted.approval = this.normalizeApproval(converted.approval);
                }

                return {
                    id: docSnap.id,
                    ...converted
                } as AssetRequest;
            }
            return null;
        } catch (error) {
            console.error('Error fetching request:', error);
            return null;
        }
    }

    // === STATIC METHODS FOR DIRECT USE ===
    static async createRequest(data: CreateRequestInput): Promise<ServiceResponse<AssetRequest>> {
        try {
            const requestsRef = collection(db, 'requests');

            // Generate request ID
            const requestId = `REQ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

            // Prepare items with default values
            const items = data.items.map(item => ({
                assetType: item.assetType,
                category: item.category,
                quantity: item.quantity,
                itemStatus: item.itemStatus || 'pending',
                purpose: item.purpose,
                specifications: item.specifications,
                urgency: item.urgency,
                fulfillmentDetails: item.fulfillmentDetails || []
            }));

            // Prepare approval structure
            const approval = {
                approvers: [
                    {
                        role: 'admin',
                        required: true,
                        approved: false
                    }
                ],
                currentApproverIndex: 0,
                requestedAt: Timestamp.now(),
                status: 'pending' as const
            };

            // Prepare the request data
            const requestData = {
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
                    ? (data.neededBy instanceof Timestamp ? data.neededBy : Timestamp.fromDate(new Date(data.neededBy)))
                    : null,
                expectedDuration: data.expectedDuration || 0,
                approval
            };

            const docRef = await addDoc(requestsRef, requestData);

            // Get the instance for helper methods
            const instance = RequestService.getInstance();

            // Convert timestamps to Dates for the response
            const converted = instance.convertTimestamps<Omit<AssetRequest, 'id'>>(requestData);

            // Normalize items in the result
            const resultItems = converted.items as unknown;
            if (resultItems && Array.isArray(resultItems)) {
                converted.items = instance.normalizeItems(resultItems as RawRequestItem[]);
            }

            const result = {
                id: docRef.id,
                ...converted
            } as AssetRequest;

            return {
                success: true,
                data: result,
                message: 'Request created successfully'
            };
        } catch (error) {
            console.error('Error creating request:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    // SIMPLIFIED: Just need requestId - Firebase rules handle authorization
    static async approveRequest(requestId: string): Promise<ServiceResponse> {
        try {
            const docRef = doc(db, 'requests', requestId);

            // First get the current request to update approval
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) {
                return { success: false, error: 'Request not found' };
            }

            const currentData = docSnap.data();
            const currentApproval = (currentData.approval as ApprovalData) || {
                approvers: [{ role: 'admin', required: true, approved: false }],
                currentApproverIndex: 0,
                requestedAt: Timestamp.now(),
                status: 'pending'
            };

            // Update the approver
            const updatedApprovers = (currentApproval.approvers || []).map((approver: { role: string; required: boolean; approved: boolean }) =>
                approver.role === 'admin' ? { ...approver, approved: true } : approver
            );

            // Check if all required approvers have approved
            const allApproved = updatedApprovers.every((a: { role: string; required: boolean; approved: boolean }) =>
                !a.required || a.approved
            );

            await updateDoc(docRef, {
                status: allApproved ? 'approved' : 'under_review',
                approval: {
                    ...currentApproval,
                    approvers: updatedApprovers,
                    status: allApproved ? 'approved' : 'pending'
                },
                updatedAt: Timestamp.now()
            });

            return {
                success: true,
                message: allApproved ? 'Request approved' : 'Request approved, pending other approvers'
            };
        } catch (error) {
            console.error('Error approving request:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    // SIMPLIFIED: Just need requestId and reason - Firebase rules handle authorization
    static async rejectRequest(requestId: string, reason: string): Promise<ServiceResponse> {
        try {
            const docRef = doc(db, 'requests', requestId);

            await updateDoc(docRef, {
                status: 'rejected',
                rejectionReason: reason,
                approval: {
                    status: 'rejected',
                    rejectedAt: Timestamp.now(),
                    reason
                },
                updatedAt: Timestamp.now()
            });

            return {
                success: true,
                message: 'Request rejected'
            };
        } catch (error) {
            console.error('Error rejecting request:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    static async fulfillRequest(
        requestId: string,
        fulfillmentData: FulfillmentInput
    ): Promise<ServiceResponse> {
        try {
            const docRef = doc(db, 'requests', requestId);

            // Get current request to update item statuses
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) {
                return { success: false, error: 'Request not found' };
            }

            const currentData = docSnap.data();
            const currentItems = (currentData.items as RequestItem[]) || [];

            // If specific items are being fulfilled, update their status
            const updatedItems = currentItems.map((item: RequestItem, index: number) => {
                const fulfillmentItem = fulfillmentData.items?.find(fi => fi.itemId === String(index));
                if (fulfillmentItem) {
                    const fulfillmentDetails = item.fulfillmentDetails || [];
                    const totalFulfilled = fulfillmentDetails.reduce((sum, f) => sum + f.quantity, 0) + fulfillmentItem.fulfilledQuantity;

                    return {
                        ...item,
                        itemStatus: totalFulfilled >= item.quantity ? 'fulfilled' : 'partial',
                        fulfillmentDetails: [
                            ...fulfillmentDetails,
                            {
                                fulfilledBy: 'admin', // Firebase rules handle authorization
                                fulfilledAt: Timestamp.now(),
                                quantity: fulfillmentItem.fulfilledQuantity,
                                notes: fulfillmentItem.notes || fulfillmentData.notes
                            }
                        ]
                    } as RequestItem;
                }
                return item;
            });

            // Check if all items are fulfilled
            const allFulfilled = updatedItems.every((item: RequestItem) => {
                const totalFulfilled = (item.fulfillmentDetails || []).reduce((sum, f) => sum + f.quantity, 0);
                return totalFulfilled >= item.quantity;
            });

            await updateDoc(docRef, {
                status: allFulfilled ? 'fulfilled' : 'partially_fulfilled',
                items: updatedItems,
                fulfillmentData: {
                    ...fulfillmentData,
                    fulfilledAt: Timestamp.now()
                },
                updatedAt: Timestamp.now()
            });

            return {
                success: true,
                message: allFulfilled ? 'Request fulfilled' : 'Request partially fulfilled'
            };
        } catch (error) {
            console.error('Error fulfilling request:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    static async deleteRequest(requestId: string): Promise<ServiceResponse> {
        try {
            const docRef = doc(db, 'requests', requestId);
            await deleteDoc(docRef);
            return {
                success: true,
                message: 'Request deleted successfully'
            };
        } catch (error) {
            console.error('Error deleting request:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    static async updateRequest(requestId: string, updates: Record<string, unknown>): Promise<ServiceResponse> {
        try {
            const docRef = doc(db, 'requests', requestId);

            // Remove fields that shouldn't be updated directly
            const safeUpdates = { ...updates };
            delete safeUpdates.id;
            delete safeUpdates.requestId;
            delete safeUpdates.createdAt;

            await updateDoc(docRef, {
                ...safeUpdates,
                updatedAt: Timestamp.now()
            });

            return {
                success: true,
                message: 'Request updated successfully'
            };
        } catch (error) {
            console.error('Error updating request:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}