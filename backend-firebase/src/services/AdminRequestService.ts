// backend-firebase/src/services/AdminRequestService.ts
import { RequestService, ServiceResponse } from './RequestService';
import { IRequest, IRequestFilters, FulfillmentInput } from '../../../src/core/types/request.types';

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

        return results.map(req => ({
            ...req,
            id: req.id || '',
        })) as IRequest[];
    }

    /**
     * Approve a request - Admin approves at 'admin' level
     * Must provide all required fields for ApproveInput
     */
    async approveRequest(
        requestId: string,
        approvedBy: string,
        approvedByName: string,
        comments?: string
    ): Promise<ServiceResponse> {
        try {
            // Pass the correct object structure that ApproveInput expects
            return await RequestService.approveRequest({
                requestId: requestId,
                level: 'admin',
                approvedBy: approvedBy,
                approvedByName: approvedByName,
                comments: comments
            });
        } catch (error) {
            console.error('Error approving request:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Reject a request - Must provide all required fields for RejectInput
     */
    async rejectRequest(
        requestId: string,
        reason: string,
        rejectedBy: string,
        rejectedByName: string
    ): Promise<ServiceResponse> {
        try {
            // Pass the correct object structure that RejectInput expects
            return await RequestService.rejectRequest({
                requestId: requestId,
                reason: reason,
                rejectedBy: rejectedBy,
                rejectedByName: rejectedByName
            });
        } catch (error) {
            console.error('Error rejecting request:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Fulfill a request
     */
    async fulfillRequest(
        requestId: string,
        fulfillmentData: FulfillmentInput,
        fulfilledBy: string
    ): Promise<ServiceResponse> {
        try {
            return await RequestService.fulfillRequest(requestId, fulfillmentData, fulfilledBy);
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
        return this.getRequests({ status: ['pending', 'under_review', 'pending_admin'] });
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