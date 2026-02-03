import type { Asset } from './Asset';
import type { User } from './User';

export interface Assignment {
    id: string;
    assetId: string;
    userId: string;
    assignedAt: Date;
    returnedAt?: Date;
    condition: AssetCondition;
    notes?: string;
}

export enum AssetCondition {
    EXCELLENT = 'excellent',
    GOOD = 'good',
    FAIR = 'fair',
    POOR = 'poor'
}
export interface AssignmentWithDetails extends Assignment {
    asset: Asset;
    user: User;
}