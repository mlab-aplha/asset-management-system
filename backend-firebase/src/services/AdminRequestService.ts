// backend-firebase/src/services/AdminRequestService.ts
import { RequestService, ServiceResponse } from './RequestService';
import { IRequest, IRequestFilters } from '../../../src/core/types/request.types';

export class AdminRequestService extends RequestService {
    private static adminInstance: AdminRequestService;

    protected constructor() {
        super();
    }

    public static getInstance(): AdminRequestService {
        if (!AdminRequestService.adminInstance) {
            AdminRequestService.adminInstance = new AdminRequestService();
        }
        return AdminRequestService.adminInstance;
    }

    async getRequests(filters?: IRequestFilters): Promise<IRequest[]> {
        // Admin can see all requests, but may have additional filters
        const results = await super.getRequests({
            status: filters?.status,
            priority: filters?.priority,
            locationId: filters?.locationId,
            department: filters?.department,
            requesterId: filters?.requesterId,
            searchTerm: filters?.searchTerm,
            dateFrom: filters?.dateFrom,
            dateTo: filters?.dateTo
        });

        // Convert AssetRequest[] to IRequest[]
        return results.map(req => ({
            ...req,
            id: req.id || '', // Ensure id is string (required in IRequest)
        })) as IRequest[];
    }

    async approveRequest(requestId: string): Promise<ServiceResponse> {
        try {
            // Use the simplified static method from RequestService (only needs requestId)
            return await RequestService.approveRequest(requestId);
        } catch (error) {
            console.error('Error approving request:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    async rejectRequest(requestId: string, reason: string): Promise<ServiceResponse> {
        try {
            // Use the simplified static method from RequestService (only needs requestId and reason)
            return await RequestService.rejectRequest(requestId, reason);
        } catch (error) {
            console.error('Error rejecting request:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    async fulfillRequest(
        requestId: string,
        fulfillmentData: { notes?: string; items?: Array<{ itemId: string; fulfilledQuantity: number; notes?: string; }> }
    ): Promise<ServiceResponse> {
        try {
            // Use the simplified static method from RequestService (only needs requestId and fulfillmentData)
            return await RequestService.fulfillRequest(requestId, fulfillmentData);
        } catch (error) {
            console.error('Error fulfilling request:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    async deleteRequest(requestId: string): Promise<ServiceResponse> {
        try {
            return await RequestService.deleteRequest(requestId);
        } catch (error) {
            console.error('Error deleting request:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    async updateRequest(requestId: string, updates: Partial<IRequest>): Promise<ServiceResponse> {
        try {
            return await RequestService.updateRequest(requestId, updates as Record<string, unknown>);
        } catch (error) {
            console.error('Error updating request:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    async getPendingRequests(): Promise<IRequest[]> {
        return this.getRequests({ status: ['pending', 'under_review'] });
    }

    async getRequestsByStatus(statuses: string[]): Promise<IRequest[]> {
        return this.getRequests({ status: statuses });
    }

    async getRequestsByLocation(locationId: string): Promise<IRequest[]> {
        return this.getRequests({ locationId });
    }

    async getRequestsByDateRange(dateFrom: Date, dateTo: Date): Promise<IRequest[]> {
        return this.getRequests({ dateFrom, dateTo });
    }
}