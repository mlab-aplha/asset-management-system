// src/features/requests/utils/requestHelpers.ts
import { IRequest } from '../core/types/request.types';
import { Timestamp } from 'firebase/firestore';

// Define a type for date values that can come from Firestore
type DateValue = Date | Timestamp | string | undefined | null;

// Define the export row type
interface ExportRow {
    'Request ID': string | undefined;
    'Requester Name': string;
    'Requester Email': string;
    'Department': string;
    'Status': string;
    'Priority': string;
    'Items Count': number | undefined;
    'Total Quantity': number | undefined;
    'Created Date': string | undefined;
    'Notes': string;
}

export const requestHelpers = {
    // Check if request is editable by facilitator
    isEditable(request: IRequest, userId: string): boolean {
        return request.requesterId === userId &&
            ['draft', 'pending'].includes(request.status || '');
    },

    // Check if request is cancellable
    isCancellable(request: IRequest, userId: string): boolean {
        return request.requesterId === userId &&
            !['fulfilled', 'cancelled', 'rejected'].includes(request.status || '');
    },

    // Get time elapsed since creation
    getTimeElapsed(createdAt: DateValue): string {
        if (!createdAt) return 'Unknown';

        try {
            // Handle Firestore Timestamp
            const date = createdAt instanceof Timestamp
                ? createdAt.toDate()
                : createdAt instanceof Date
                    ? createdAt
                    : new Date(createdAt);

            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);

            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
            if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
            if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

            // For older dates, return the actual date
            return date.toLocaleDateString();
        } catch {
            return 'Invalid date';
        }
    },

    // Group requests by status
    groupByStatus(requests: IRequest[]): Record<string, IRequest[]> {
        return requests.reduce((groups, request) => {
            const status = request.status || 'unknown';
            if (!groups[status]) groups[status] = [];
            groups[status].push(request);
            return groups;
        }, {} as Record<string, IRequest[]>);
    },

    // Format request for export
    formatForExport(requests: IRequest[]): ExportRow[] {
        return requests.map(request => ({
            'Request ID': request.requestId,
            'Requester Name': request.requesterName,
            'Requester Email': request.requesterEmail,
            'Department': request.department || 'N/A',
            'Status': request.status,
            'Priority': request.priority,
            'Items Count': request.itemCount,
            'Total Quantity': request.totalQuantity,
            'Created Date': request.formattedCreatedAt || 'N/A',
            'Notes': request.notes || ''
        }));
    }
};