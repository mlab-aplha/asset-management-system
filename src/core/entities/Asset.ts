// src/core/entities/Asset.ts
export type AssetStatus = 'available' | 'assigned' | 'maintenance' | 'retired';
export type AssetCondition = 'excellent' | 'good' | 'fair' | 'poor';

export interface Asset {
    id: string;
    assetId: string;
    name: string;
    type: string;
    category: string;
    status: AssetStatus;
    condition: AssetCondition;
    currentLocationId: string;
    createdAt: Date;
    updatedAt?: Date;

    // Optional fields
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
}
export enum HubLocation {
    PTA = 'PTA',
    JHB = 'JHB',
    CPT = 'CPT',
    DBN = 'DBN',
    BFN = 'BFN'
}

export type CreateAssetDto = Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateAssetDto = Partial<Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>>;