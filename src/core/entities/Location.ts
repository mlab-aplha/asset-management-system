export interface Location {
    id: string;
    name: string;
    address: string;
    type: 'hq' | 'hub' | 'branch' | 'site';
    status: 'active' | 'maintenance' | 'offline';
    totalAssets: number;
    primaryContact: {
        name: string;
        email: string;
        phone?: string;
    };
    description?: string;
    region?: string;
    capacity?: number;
    lastAudit?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface LocationFormData {
    name: string;
    address: string;
    type: 'hq' | 'hub' | 'branch' | 'site';
    status: 'active' | 'maintenance' | 'offline';
    totalAssets: number;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    description: string;
    region: string;
    capacity?: number;
}

export interface LocationFilters {
    searchTerm?: string;
    status?: 'all' | 'active' | 'maintenance' | 'offline';
    type?: 'all' | 'hq' | 'hub' | 'branch' | 'site';
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