// src/core/entities/User.ts

export type UserRole =
    | 'super_admin'
    | 'hub_manager'
    | 'it'
    | 'asset_facilitator'
    | 'student';

export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
    id: string;
    uid?: string;
    displayName: string;
    email: string;
    role: UserRole;
    department?: string;
    status: UserStatus;
    primaryLocationId?: string;
    assignedHubIds?: string[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface UserFormData {
    displayName: string;
    email: string;
    role: UserRole;
    department: string;
    status: UserStatus;
    password?: string;
    passwordMethod?: 'manual' | 'auto';
    assignedHubIds?: string[];
    primaryLocationId?: string;
}

export interface UserFilters {
    searchTerm?: string;
    role?: UserRole | 'all';
    status?: UserStatus | 'all';
    department?: string;
}

export interface UserStats {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    adminsCount: number;
    managersCount: number;
    itCount: number;
    facilitatorsCount: number;
    studentsCount: number;
    usersByDepartment: Record<string, number>;
}