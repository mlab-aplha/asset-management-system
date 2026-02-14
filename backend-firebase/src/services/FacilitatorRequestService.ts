// backend-firebase/src/services/FacilitatorRequestService.ts
import { RequestService } from './RequestService';
import { IRequest, IRequestFilters } from '../../../src/core/types/request.types';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export class FacilitatorRequestService extends RequestService {
    private static facilitatorInstance: FacilitatorRequestService;
    protected collectionName = 'requests';

    protected constructor() {
        super();
    }

    public static getFacilitatorInstance(): FacilitatorRequestService {
        if (!FacilitatorRequestService.facilitatorInstance) {
            FacilitatorRequestService.facilitatorInstance = new FacilitatorRequestService();
        }
        return FacilitatorRequestService.facilitatorInstance;
    }

    // Helper method to safely get timestamp from various date types
    private getTimestampFromDate(dateValue: Date | Timestamp | string | undefined): number | null {
        if (!dateValue) return null;

        if (dateValue instanceof Timestamp) {
            return dateValue.toDate().getTime();
        } else if (dateValue instanceof Date) {
            return dateValue.getTime();
        } else {
            // Handle string dates
            try {
                return new Date(dateValue).getTime();
            } catch {
                return null;
            }
        }
    }

    // Get requests assigned to facilitator's locations
    async getAssignedRequests(locationIds: string[], filters?: IRequestFilters): Promise<IRequest[]> {
        try {
            const requestsRef = collection(db, this.collectionName);

            // Start with location filter
            let q = query(
                requestsRef,
                where("locationId", "in", locationIds),
                orderBy("createdAt", "desc")
            );

            // Add status filter if provided
            if (filters?.status?.length) {
                q = query(q, where("status", "in", filters.status));
            }

            // Add priority filter if provided
            if (filters?.priority?.length) {
                q = query(q, where("priority", "in", filters.priority));
            }

            const snapshot = await getDocs(q);
            const requests = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data
                } as IRequest;
            });

            // Apply client-side filters
            let filteredRequests = requests;

            // Date range filtering (client-side since Firestore can't do multiple date filters easily)
            if (filters?.dateFrom) {
                const fromTime = filters.dateFrom.getTime();
                filteredRequests = filteredRequests.filter(req => {
                    const reqTime = this.getTimestampFromDate(req.createdAt);
                    return reqTime !== null && reqTime >= fromTime;
                });
            }

            if (filters?.dateTo) {
                const toTime = filters.dateTo.getTime();
                filteredRequests = filteredRequests.filter(req => {
                    const reqTime = this.getTimestampFromDate(req.createdAt);
                    return reqTime !== null && reqTime <= toTime;
                });
            }

            // Search term filtering
            if (filters?.searchTerm) {
                const term = filters.searchTerm.toLowerCase();
                filteredRequests = filteredRequests.filter(req =>
                    req.requesterName?.toLowerCase().includes(term) ||
                    req.requestId?.toLowerCase().includes(term) ||
                    req.department?.toLowerCase().includes(term) ||
                    req.items?.some(item => item.assetType.toLowerCase().includes(term))
                );
            }

            return filteredRequests;
        } catch (error) {
            console.error('Error fetching assigned requests:', error);
            return [];
        }
    }

    // Get pending requests for facilitator's locations
    async getPendingRequests(locationIds: string[]): Promise<IRequest[]> {
        return this.getAssignedRequests(locationIds, { status: ['pending'] });
    }

    // Get requests needing fulfillment
    async getRequestsNeedingFulfillment(locationIds: string[]): Promise<IRequest[]> {
        return this.getAssignedRequests(locationIds, { status: ['approved'] });
    }
}