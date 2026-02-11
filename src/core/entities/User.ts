export interface User {
    id: string;
    displayName: string;
    email: string;
    role: 'admin' | 'facilitator';
    department: string;
    status: 'active' | 'inactive';
    uid?: string;
    primaryLocationId?: string;
    assignedHubIds?: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface UserFormData {
    displayName: string;
    email: string;
    role: 'admin' | 'facilitator';
    department: string;
    status?: 'active' | 'inactive';
}

export interface UserFilters {
    searchTerm?: string;
    status?: 'active' | 'inactive' | 'all';
    role?: 'admin' | 'facilitator' | 'all';
    department?: string;
}

export interface UserStats {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    adminsCount: number;
    facilitatorsCount: number;
    usersByDepartment: Record<string, number>;
}