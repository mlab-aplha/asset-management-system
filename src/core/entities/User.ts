export interface User {
    id: string;
    displayName: string;
    email: string;
    role: 'admin' | 'facilitator';
    department?: string;
    status: 'active' | 'inactive';
    createdAt?: Date;
    updatedAt?: Date;
}

export interface UserFormData {
    displayName: string;
    email: string;
    role: 'admin' | 'facilitator';
    department: string;
    status: 'active' | 'inactive';
}

export interface UserFilters {
    searchTerm?: string;
    status?: 'all' | 'active' | 'inactive';
    role?: 'all' | 'admin' | 'facilitator';
    department?: string;
    page?: number;
    itemsPerPage?: number;
}

export interface UserStats {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    adminsCount: number;
    facilitatorsCount: number;
    usersByDepartment: Record<string, number>;
}