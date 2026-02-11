export interface Location {
    id: string;
    name: string;
    type: LocationType;
    status: LocationStatus;
    code?: string;
    capacity?: {
        maxAssets: number;
        currentAssets: number;
        availableCapacity: number;
    };

    // Address fields (combining both)
    address?: string;
    city?: string;
    country?: string;

    // Legacy frontend fields
    totalAssets?: number;
    description?: string;
    region?: string;

    // Contact information
    managerId?: string;
    primaryContact?: {
        name: string;
        email: string;
        phone?: string;
    };

    // Timestamps
    createdAt?: Date;
    updatedAt?: Date;
    lastAudit?: string;
}
export type LocationType = 'hq' | 'hub' | 'site' | 'branch' | 'other';
export type LocationStatus = 'active' | 'maintenance' | 'offline';
export interface LocationFormData {
    name: string;
    type: LocationType;
    status: LocationStatus;
    code: string;
    maxAssets?: number;

    // Address fields
    address?: string;
    city?: string;
    country?: string;
    region?: string;

    // Contact information
    managerId?: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;

    // Legacy fields (for compatibility)
    totalAssets?: number;
    description?: string;
    capacity?: number;
}

export interface LocationFilters {
    searchTerm?: string;
    status?: 'all' | 'active' | 'maintenance' | 'offline';
    type?: 'all' | 'hq' | 'hub' | 'branch' | 'site' | 'other';
    region?: string;
    page?: number;
    itemsPerPage?: number;
}

export interface LocationStats {
    totalLocations: number;
    totalAssets: number;
    activeHubs: number;
    maintenanceLocations: number;
    locationsByType: Record<string, number>;
    locationsByStatus: Record<string, number>;
}

export interface BulkImportLocation {
    name: string;
    address: string;
    type: string;
    status: string;
    totalAssets: string;
    region: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    description: string;
}