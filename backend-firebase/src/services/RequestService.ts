import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp,
    FieldValue,
    DocumentData,
    QueryDocumentSnapshot
} from "firebase/firestore";
import { db } from "../firebase/config";

// Define specification interface
export interface AssetSpecifications {
    [key: string]: string | number | boolean | string[] | undefined;
    processor?: string;
    ram?: string;
    storage?: string;
    os?: string;
    resolution?: string;
    connectivity?: string[];
    type?: string;
    color?: string;
    speed?: string;
}

export interface RequestItem {
    assetType: string;
    category: 'hardware' | 'software' | 'furniture' | 'equipment' | 'other';
    quantity: number;
    specifications?: AssetSpecifications;
    purpose: string;
    urgency: 'normal' | 'urgent';
    itemStatus: 'pending' | 'approved' | 'rejected' | 'fulfilled' | 'partially_fulfilled';
    fulfillmentDetails?: Array<{
        assetId: string;
        assetName: string;
        serialNumber?: string;
        assignedDate: Date | Timestamp;
        assignedBy: string;
    }>;
}

export interface ApprovalApprover {
    role: string;
    required: boolean;
    approved: boolean;
    approvedAt?: Date | Timestamp;
    comments?: string;
}

export interface ApprovalData {
    status: string;
    requestedAt: Date | Timestamp;
    approvers: ApprovalApprover[];
    currentApproverIndex: number;
    approvedAt?: Date | Timestamp;
    approvedBy?: string;
    rejectedAt?: Date | Timestamp;
    rejectedBy?: string;
    rejectionReason?: string;
}

export interface FulfillmentData {
    fulfilledAt?: Date | Timestamp;
    fulfilledBy?: string;
    fulfillmentLocationId?: string;
    fulfillmentLocationName?: string;
    itemsFulfilled: number;
    itemsPending: number;
    notes?: string;
}

export interface AssetRequest {
    id?: string;
    requestId: string;
    requesterId: string;
    requesterName: string;
    requesterEmail: string;
    locationId: string;
    locationName: string;
    department?: string;
    items: RequestItem[];
    status: 'draft' | 'pending' | 'under_review' | 'approved' | 'rejected' | 'fulfilled' | 'cancelled' | 'expired';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    neededBy?: Date | Timestamp;
    expectedDuration?: number;
    approval?: ApprovalData;
    fulfillment?: FulfillmentData;
    notes?: string;
    attachments?: string[];
    createdAt?: Timestamp | FieldValue;
    updatedAt?: Timestamp | FieldValue;
}

// Helper function to safely convert Firestore data
function convertTimestamp(timestamp: Timestamp | Date | unknown): Date | undefined {
    if (!timestamp) return undefined;
    if (timestamp instanceof Timestamp) {
        return timestamp.toDate();
    }
    if (timestamp instanceof Date) {
        return timestamp;
    }
    return undefined;
}

// Helper function to convert Firestore data to AssetRequest
function mapDocToRequest(doc: QueryDocumentSnapshot<DocumentData>): AssetRequest {
    const data = doc.data();

    // Convert approval data if exists
    let approval: ApprovalData | undefined;
    if (data.approval) {
        approval = {
            status: data.approval.status || 'pending',
            requestedAt: convertTimestamp(data.approval.requestedAt) || new Date(),
            approvers: (data.approval.approvers || []).map((approver: DocumentData) => ({
                role: approver.role || 'admin',
                required: approver.required !== undefined ? approver.required : true,
                approved: approver.approved || false,
                approvedAt: convertTimestamp(approver.approvedAt),
                comments: approver.comments || ''
            })),
            currentApproverIndex: data.approval.currentApproverIndex || 0,
            approvedAt: convertTimestamp(data.approval.approvedAt),
            approvedBy: data.approval.approvedBy,
            rejectedAt: convertTimestamp(data.approval.rejectedAt),
            rejectedBy: data.approval.rejectedBy,
            rejectionReason: data.approval.rejectionReason
        };
    }

    // Convert fulfillment data if exists
    let fulfillment: FulfillmentData | undefined;
    if (data.fulfillment) {
        fulfillment = {
            fulfilledAt: convertTimestamp(data.fulfillment.fulfilledAt),
            fulfilledBy: data.fulfillment.fulfilledBy,
            fulfillmentLocationId: data.fulfillment.fulfillmentLocationId,
            fulfillmentLocationName: data.fulfillment.fulfillmentLocationName,
            itemsFulfilled: data.fulfillment.itemsFulfilled || 0,
            itemsPending: data.fulfillment.itemsPending || 0,
            notes: data.fulfillment.notes
        };
    }

    // Convert items data
    const items: RequestItem[] = (data.items || []).map((item: DocumentData) => ({
        assetType: item.assetType || '',
        category: item.category || 'hardware',
        quantity: item.quantity || 1,
        specifications: item.specifications || {},
        purpose: item.purpose || '',
        urgency: item.urgency || 'normal',
        itemStatus: item.itemStatus || 'pending',
        fulfillmentDetails: (item.fulfillmentDetails || []).map((detail: DocumentData) => ({
            assetId: detail.assetId || '',
            assetName: detail.assetName || '',
            serialNumber: detail.serialNumber,
            assignedDate: convertTimestamp(detail.assignedDate) || new Date(),
            assignedBy: detail.assignedBy || ''
        }))
    }));

    return {
        id: doc.id,
        requestId: data.requestId || '',
        requesterId: data.requesterId || '',
        requesterName: data.requesterName || '',
        requesterEmail: data.requesterEmail || '',
        locationId: data.locationId || '',
        locationName: data.locationName || '',
        department: data.department,
        items,
        status: data.status || 'draft',
        priority: data.priority || 'medium',
        neededBy: convertTimestamp(data.neededBy),
        expectedDuration: data.expectedDuration,
        approval,
        fulfillment,
        notes: data.notes,
        attachments: data.attachments || [],
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
    };
}

interface ServiceResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
}

export class RequestService {
    private static collectionName = 'requests';

    // Facilitator: Create a new request
    static async createRequest(request: Omit<AssetRequest, 'id' | 'requestId'>): Promise<ServiceResponse<{ id: string; requestId: string }>> {
        try {
            const requestsRef = collection(db, this.collectionName);

            // Generate request ID
            const year = new Date().getFullYear();
            const count = await this.getRequestCount(year);
            const requestId = `REQ-${year}-${String(count + 1).padStart(3, '0')}`;

            const newRequest: Omit<AssetRequest, 'id'> = {
                ...request,
                requestId,
                status: 'pending', // Start as pending for admin approval
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                approval: {
                    status: 'pending',
                    requestedAt: new Date(),
                    approvers: [{
                        role: 'admin',
                        required: true,
                        approved: false
                    }],
                    currentApproverIndex: 0
                }
            };

            const docRef = await addDoc(requestsRef, newRequest);

            return {
                success: true,
                data: { id: docRef.id, requestId },
                message: 'Request submitted successfully. Waiting for admin approval.'
            };
        } catch (error: unknown) {
            console.error('Create request error:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to create request'
            };
        }
    }

    // Admin: Get all requests
    static async getAllRequests(): Promise<ServiceResponse<AssetRequest[]>> {
        try {
            const requestsRef = collection(db, this.collectionName);
            const q = query(requestsRef, orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);

            const requests = snapshot.docs.map(mapDocToRequest);

            return {
                success: true,
                data: requests
            };
        } catch (error: unknown) {
            console.error('Get requests error:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch requests'
            };
        }
    }

    // Facilitator: Get requests for their location
    static async getRequestsByLocation(locationId: string): Promise<ServiceResponse<AssetRequest[]>> {
        try {
            const requestsRef = collection(db, this.collectionName);
            const q = query(
                requestsRef,
                where("locationId", "==", locationId),
                orderBy("createdAt", "desc")
            );
            const snapshot = await getDocs(q);

            const requests = snapshot.docs.map(mapDocToRequest);

            return {
                success: true,
                data: requests
            };
        } catch (error: unknown) {
            console.error('Get requests by location error:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch requests'
            };
        }
    }

    // Facilitator: Get their own requests
    static async getMyRequests(userId: string): Promise<ServiceResponse<AssetRequest[]>> {
        try {
            const requestsRef = collection(db, this.collectionName);
            const q = query(
                requestsRef,
                where("requesterId", "==", userId),
                orderBy("createdAt", "desc")
            );
            const snapshot = await getDocs(q);

            const requests = snapshot.docs.map(mapDocToRequest);

            return {
                success: true,
                data: requests
            };
        } catch (error: unknown) {
            console.error('Get my requests error:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch your requests'
            };
        }
    }

    // Admin: Approve a request
    static async approveRequest(
        requestId: string,
        adminId: string,
        _adminName: string, // Using underscore to indicate intentionally unused
        comments?: string
    ): Promise<ServiceResponse> {
        try {
            const docRef = doc(db, this.collectionName, requestId);

            await updateDoc(docRef, {
                status: 'approved',
                'approval.status': 'approved',
                'approval.approvedAt': serverTimestamp(),
                'approval.approvedBy': adminId,
                'approval.approvers': [{
                    role: 'admin',
                    required: true,
                    approved: true,
                    approvedAt: serverTimestamp(),
                    comments: comments || ''
                }],
                updatedAt: serverTimestamp()
            });

            return {
                success: true,
                message: 'Request approved successfully'
            };
        } catch (error: unknown) {
            console.error('Approve request error:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to approve request'
            };
        }
    }

    // Admin: Reject a request
    static async rejectRequest(
        requestId: string,
        adminId: string,
        _adminName: string, // Using underscore to indicate intentionally unused
        reason: string
    ): Promise<ServiceResponse> {
        try {
            const docRef = doc(db, this.collectionName, requestId);

            await updateDoc(docRef, {
                status: 'rejected',
                'approval.status': 'rejected',
                'approval.rejectedAt': serverTimestamp(),
                'approval.rejectedBy': adminId,
                'approval.rejectionReason': reason,
                updatedAt: serverTimestamp()
            });

            return {
                success: true,
                message: 'Request rejected'
            };
        } catch (error: unknown) {
            console.error('Reject request error:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to reject request'
            };
        }
    }

    // Admin: Fulfill a request (assign assets)
    static async fulfillRequest(
        requestId: string,
        _adminId: string, // Using underscore to indicate intentionally unused
        fulfillmentData: {
            fulfilledBy: string;
            fulfillmentLocationId: string;
            fulfillmentLocationName: string;
            itemsFulfilled: number;
            itemsPending: number;
            notes?: string;
        }
    ): Promise<ServiceResponse> {
        try {
            const docRef = doc(db, this.collectionName, requestId);

            await updateDoc(docRef, {
                status: 'fulfilled',
                fulfillment: {
                    ...fulfillmentData,
                    fulfilledAt: serverTimestamp()
                },
                updatedAt: serverTimestamp()
            });

            return {
                success: true,
                message: 'Request fulfilled successfully'
            };
        } catch (error: unknown) {
            console.error('Fulfill request error:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fulfill request'
            };
        }
    }

    // Get single request by ID
    static async getRequestById(requestId: string): Promise<ServiceResponse<AssetRequest>> {
        try {
            const docRef = doc(db, this.collectionName, requestId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return {
                    success: true,
                    data: mapDocToRequest(docSnap as QueryDocumentSnapshot<DocumentData>)
                };
            } else {
                return {
                    success: false,
                    message: 'Request not found'
                };
            }
        } catch (error: unknown) {
            console.error('Get request error:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch request'
            };
        }
    }

    // Update request (for facilitators to edit drafts)
    static async updateRequest(
        requestId: string,
        updates: Partial<Omit<AssetRequest, 'id' | 'requestId' | 'createdAt' | 'updatedAt'>>
    ): Promise<ServiceResponse> {
        try {
            const docRef = doc(db, this.collectionName, requestId);

            await updateDoc(docRef, {
                ...updates,
                updatedAt: serverTimestamp()
            });

            return {
                success: true,
                message: 'Request updated successfully'
            };
        } catch (error: unknown) {
            console.error('Update request error:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to update request'
            };
        }
    }

    // Delete request
    static async deleteRequest(requestId: string): Promise<ServiceResponse> {
        try {
            await deleteDoc(doc(db, this.collectionName, requestId));
            return {
                success: true,
                message: 'Request deleted successfully'
            };
        } catch (error: unknown) {
            console.error('Delete request error:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to delete request'
            };
        }
    }

    // Get pending requests for admin dashboard
    static async getPendingRequests(): Promise<ServiceResponse<AssetRequest[]>> {
        try {
            const requestsRef = collection(db, this.collectionName);
            const q = query(
                requestsRef,
                where("status", "in", ["pending", "under_review"]),
                orderBy("createdAt", "desc")
            );
            const snapshot = await getDocs(q);

            const requests = snapshot.docs.map(mapDocToRequest);

            return {
                success: true,
                data: requests
            };
        } catch (error: unknown) {
            console.error('Get pending requests error:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to fetch pending requests'
            };
        }
    }

    // Private helper to get request count
    private static async getRequestCount(year: number): Promise<number> {
        try {
            const requestsRef = collection(db, this.collectionName);
            // Get all requests from this year
            const startOfYear = new Date(year, 0, 1);
            const q = query(
                requestsRef,
                where("createdAt", ">=", startOfYear)
            );
            const snapshot = await getDocs(q);
            return snapshot.size;
        } catch (error) {
            console.error('Get request count error:', error);
            return 0;
        }
    }
}

export default RequestService;