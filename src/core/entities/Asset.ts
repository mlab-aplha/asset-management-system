export interface Asset {
    id: string;
    name: string;
    serialNumber: string;
    category: AssetCategory;
    status: AssetStatus;
    assignedTo?: string;
    purchaseDate: Date;
    warrantyExpiry?: Date;
    location: HubLocation;
    tags: string[];
    value: number;
    maintenanceSchedule?: Date;
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