// src/core/entities/Asset.ts
export interface Asset {
    id: string;
    name: string;
    category: string;
    status: 'available' | 'assigned' | 'maintenance' | 'retired';
    location: string;
    serialNumber?: string;
    purchaseDate?: Date;
    value?: number;
    assignedTo?: string;
    notes?: string;
    manufacturer?: string;
    description?: string;
    assignedDate?: Date;
    updatedAt?: Date;
    createdAt?: Date;
}

export type CreateAssetDto = Omit<Asset, 'id'>;
export type UpdateAssetDto = Partial<CreateAssetDto>;

export enum AssetCategory {
    HARDWARE = 'hardware',
    SOFTWARE = 'software',
    NETWORK = 'network',
    PERIPHERAL = 'peripheral',
    SERVER = 'server'
}

export enum AssetStatus {
    AVAILABLE = 'available',
    ASSIGNED = 'assigned',
    MAINTENANCE = 'maintenance',
    RETIRED = 'retired',
    LOST = 'lost'
}

export enum HubLocation {
    CPT = 'cape_town',
    JHB = 'johannesburg',
    DBN = 'durban',
    PTA = 'pretoria',
    BFN = 'bloemfontein'
}

export const HubLabels: Record<HubLocation, string> = {
    [HubLocation.CPT]: 'Cape Town',
    [HubLocation.JHB]: 'Johannesburg',
    [HubLocation.DBN]: 'Durban',
    [HubLocation.PTA]: 'Pretoria',
    [HubLocation.BFN]: 'Bloemfontein'
};