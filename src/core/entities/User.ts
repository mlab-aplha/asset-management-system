import type { HubLocation } from './Asset';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    department: string;
    hub: HubLocation;
    phone?: string;
    isActive: boolean;
    createdAt: Date;
}

export enum UserRole {
    FACILITATOR = 'facilitator',
    ADMIN = 'admin'
}

export const UserRoleLabels: Record<UserRole, string> = {
    [UserRole.FACILITATOR]: 'Facilitator',
    [UserRole.ADMIN]: 'Administrator'
};

export type CreateUserDto = Omit<User, 'id' | 'createdAt'>;
export type UpdateUserDto = Partial<CreateUserDto>;