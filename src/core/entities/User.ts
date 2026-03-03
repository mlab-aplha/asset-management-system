export interface User {
    id: string;
    displayName: string;
    email: string;
    role: 'admin' | 'facilitator';
    department: string;
    status: 'active' | 'inactive';
    uid?: string; // Firebase Auth UID
    primaryLocationId?: string;
    assignedHubIds?: string[]; // Array of Firestore document IDs
    createdAt: Date;
    updatedAt: Date;
}

export interface UserFormData {
    displayName: string;
    email: string;
    role: 'admin' | 'facilitator';
    department: string;
    status?: 'active' | 'inactive';
    password?: string;
    passwordMethod?: 'manual' | 'auto';
    assignedHubIds?: string[]; // Add this for location assignments
    primaryLocationId?: string; // Add this for primary location
}

export interface UserFilters {
    searchTerm?: string;
    status?: 'active' | 'inactive' | 'all';
    role?: 'admin' | 'facilitator' | 'all';
    department?: string;
    locationId?: string; // Add this for filtering by location
}

export interface UserStats {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    adminsCount: number;
    facilitatorsCount: number;
    usersByDepartment: Record<string, number>;
}