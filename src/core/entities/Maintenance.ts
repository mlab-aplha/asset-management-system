export type MaintenancePriority = 'low' | 'medium' | 'high' | 'critical';
export type MaintenanceStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';
export type MaintenanceType = 'repair' | 'inspection' | 'replacement' | 'upgrade';

export interface MaintenanceTicket {
    id: string;
    assetId: string;
    assetName: string;
    assetTag?: string;
    locationId?: string;
    locationName?: string;
    type: MaintenanceType;
    priority: MaintenancePriority;
    status: MaintenanceStatus;
    description: string;
    reportedBy: string;
    reportedByName: string;
    assignedTo?: string;
    assignedToName?: string;
    estimatedCompletionDate?: Date;
    resolvedAt?: Date;
    resolutionNotes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface MaintenanceFormData {
    assetId: string;
    assetName: string;
    assetTag?: string;
    locationId?: string;
    locationName?: string;
    type: MaintenanceType;
    priority: MaintenancePriority;
    status?: MaintenanceStatus;
    description: string;
    assignedTo?: string;
    assignedToName?: string;
    estimatedCompletionDate?: Date;
    resolutionNotes?: string;
}

export interface MaintenanceFilters {
    status?: MaintenanceStatus | 'all';
    priority?: MaintenancePriority | 'all';
    type?: MaintenanceType | 'all';
    assetId?: string;
    assignedTo?: string;
    locationId?: string;
    searchTerm?: string;
}

export interface MaintenanceStats {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    critical: number;
    high: number;
    overdue: number;
}