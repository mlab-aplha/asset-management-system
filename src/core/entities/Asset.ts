import { UserRole } from './User';

// ─── Existing types (preserved exactly) ──────────────────────────────────────

export type AssetStatus = 'available' | 'assigned' | 'maintenance' | 'retired';
export type AssetCondition = 'excellent' | 'good' | 'fair' | 'poor';

export enum HubLocation {
    PTA = 'PTA',
    JHB = 'JHB',
    CPT = 'CPT',
    DBN = 'DBN',
    BFN = 'BFN'
}

// ─── New types (for portal + maintenance) ─────────────────────────────────────

export type AssetCategory = 'hardware' | 'software' | 'furniture' | 'vehicle' | 'other';

// ─── Core Asset entity (merged) ───────────────────────────────────────────────

export interface Asset {
    id: string;
    assetId: string;          // existing — human-readable ID e.g. "LAP-001"
    name: string;
    type: string;             // existing
    category: string;         // existing (kept as string to stay compatible)
    status: AssetStatus;
    condition: AssetCondition;
    currentLocationId: string; // existing — primary location reference

    // Optional existing fields
    description?: string;
    serialNumber?: string;
    manufacturer?: string;
    model?: string;
    purchaseDate?: Date;
    purchasePrice?: number;
    value?: number;
    assignedTo?: string;
    assignmentDate?: Date;
    notes?: string;
    tags?: string[];

    // New fields (added for portal + maintenance — optional so existing docs still work)
    locationName?: string;     // human-readable location name
    assignedToName?: string;   // human-readable assignee name
    lastMaintenanceDate?: Date;
    nextMaintenanceDate?: Date;

    createdAt: Date;
    updatedAt?: Date;
}

// ─── DTOs (existing — preserved exactly) ─────────────────────────────────────

export type CreateAssetDto = Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateAssetDto = Partial<Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>>;

// ─── Form data (for new Asset Portal form) ────────────────────────────────────

export interface AssetFormData {
    assetId: string;
    name: string;
    type: string;
    category: string;
    status?: AssetStatus;
    condition: AssetCondition;
    currentLocationId: string;
    locationName?: string;
    description?: string;
    serialNumber?: string;
    manufacturer?: string;
    model?: string;
    purchaseDate?: Date;
    purchasePrice?: number;
    assignedTo?: string;
    assignedToName?: string;
    notes?: string;
    tags?: string[];
}

// ─── Filters ──────────────────────────────────────────────────────────────────

export interface AssetFilters {
    searchTerm?: string;
    status?: AssetStatus | 'all';
    condition?: AssetCondition | 'all';
    category?: string | 'all';
    locationId?: string;
    assignedTo?: string;
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface AssetStats {
    total: number;
    available: number;
    assigned: number;
    maintenance: number;
    retired: number;
    byCategory: Record<string, number>;
    byLocation: Record<string, number>;
    byCondition: Record<string, number>;
}

// ─── Role scoping helper ──────────────────────────────────────────────────────

export const getAssetScopeForRole = (
    role: UserRole,
    assignedHubIds: string[]
): { scopedToHubs: boolean; hubIds: string[] } => {
    switch (role) {
        case 'admin':
        case 'it':
            return { scopedToHubs: false, hubIds: [] };   // see all
        case 'manager':
        case 'facilitator':
        case 'student':
            return { scopedToHubs: true, hubIds: assignedHubIds };
        default:
            return { scopedToHubs: true, hubIds: [] };
    }
};