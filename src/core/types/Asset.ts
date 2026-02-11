export interface Asset {
    id: string;
    name: string;
    assetId?: string;
    type: string;
    category: string;
    status: string;
    condition: string;
    currentLocationId?: string;
    assignedTo?: string;
    assignmentDate?: Date;
    serialNumber?: string;
    manufacturer?: string;
    model?: string;
    purchaseDate?: Date;
    purchasePrice?: number;
    value?: number;
    description?: string;
    specifications?: {
        processor?: string;
        ram?: string;
        storage?: string;
        display?: string;
        os?: string;
        batteryHealth?: number;
        warrantyExpiry?: Date;
        serviceTag?: string;
        macAddress?: string;
        ipAddress?: string;
    };
    notes?: string;
    tags?: string[];
    createdAt: Date;
    updatedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
}