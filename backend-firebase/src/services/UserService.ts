import { User, UserFormData, UserFilters, UserStats } from '../../../src/core/entities/User';
import { UserValidation } from '../../../src/utils/Validation_userManagement';

export interface IUserService {
    getUsers(filters?: UserFilters): Promise<User[]>;
    getUserById(id: string): Promise<User | null>;
    createUser(userData: UserFormData): Promise<User>;
    updateUser(id: string, updates: Partial<UserFormData>): Promise<User>;
    deleteUser(id: string): Promise<void>;
    toggleUserStatus(id: string): Promise<User>;
    getUserStats(): Promise<UserStats>;
    validateUser(data: UserFormData): { isValid: boolean; errors: Record<string, string> };
}

// Define a type for the raw user data stored in localStorage
interface StoredUser {
    id: string;
    displayName: string;
    email: string;
    role: 'admin' | 'facilitator';
    department?: string;
    status: 'active' | 'inactive';
    createdAt?: string;
    updatedAt?: string;
}

export class UserService implements IUserService {
    private static readonly STORAGE_KEY = 'mlab_users';
    private users: User[];

    constructor() {
        this.users = this.initializeData();
    }

    private initializeData(): User[] {
        const mockData: User[] = [
            { id: '1', displayName: 'John Smith', email: 'john.smith@mlab.co.za', role: 'admin', department: 'IT', status: 'active', createdAt: new Date('2024-01-15'), updatedAt: new Date('2024-01-15') },
            { id: '2', displayName: 'Sarah Johnson', email: 'sarah.j@mlab.co.za', role: 'facilitator', department: 'Operations', status: 'active', createdAt: new Date('2024-02-10'), updatedAt: new Date('2024-02-10') },
            { id: '3', displayName: 'Mike Brown', email: 'mike.b@mlab.co.za', role: 'facilitator', department: 'Sales', status: 'active', createdAt: new Date('2024-02-15'), updatedAt: new Date('2024-02-15') },
            { id: '4', displayName: 'Lisa Wang', email: 'lisa.w@mlab.co.za', role: 'facilitator', department: 'Marketing', status: 'inactive', createdAt: new Date('2024-03-01'), updatedAt: new Date('2024-03-01') },
            { id: '5', displayName: 'David Miller', email: 'david.m@mlab.co.za', role: 'facilitator', department: 'Finance', status: 'active', createdAt: new Date('2024-03-05'), updatedAt: new Date('2024-03-05') },
            { id: '6', displayName: 'Emma Wilson', email: 'emma.w@mlab.co.za', role: 'facilitator', department: 'HR', status: 'active', createdAt: new Date('2024-03-10'), updatedAt: new Date('2024-03-10') },
            { id: '7', displayName: 'Robert Chen', email: 'robert.c@mlab.co.za', role: 'admin', department: 'IT', status: 'active', createdAt: new Date('2024-03-15'), updatedAt: new Date('2024-03-15') },
            { id: '8', displayName: 'Maria Garcia', email: 'maria.g@mlab.co.za', role: 'facilitator', department: 'Operations', status: 'inactive', createdAt: new Date('2024-03-20'), updatedAt: new Date('2024-03-20') },
        ];

        const existingData = this.getStoredData();
        if (existingData.length === 0) {
            localStorage.setItem(UserService.STORAGE_KEY, JSON.stringify(mockData));
            return mockData;
        }
        return existingData;
    }

    private getStoredData(): User[] {
        try {
            const data = localStorage.getItem(UserService.STORAGE_KEY);
            if (!data) return [];

            const storedUsers: StoredUser[] = JSON.parse(data);

            return storedUsers.map((storedUser: StoredUser) => ({
                id: storedUser.id,
                displayName: storedUser.displayName,
                email: storedUser.email,
                role: storedUser.role,
                department: storedUser.department,
                status: storedUser.status,
                createdAt: storedUser.createdAt ? new Date(storedUser.createdAt) : new Date(),
                updatedAt: storedUser.updatedAt ? new Date(storedUser.updatedAt) : new Date()
            }));
        } catch (error) {
            console.error('Error reading user data:', error);
            return [];
        }
    }

    private saveData(): void {
        try {
            const storedUsers: StoredUser[] = this.users.map(user => ({
                id: user.id,
                displayName: user.displayName,
                email: user.email,
                role: user.role,
                department: user.department,
                status: user.status,
                createdAt: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString(),
                updatedAt: user.updatedAt ? user.updatedAt.toISOString() : new Date().toISOString()
            }));

            localStorage.setItem(UserService.STORAGE_KEY, JSON.stringify(storedUsers));
        } catch (error) {
            console.error('Error saving user data:', error);
        }
    }

    private generateId(): string {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    async getUsers(filters?: UserFilters): Promise<User[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                let filtered = [...this.users];

                if (filters) {
                    if (filters.searchTerm) {
                        const term = filters.searchTerm.toLowerCase();
                        filtered = filtered.filter(user =>
                            user.displayName.toLowerCase().includes(term) ||
                            user.email.toLowerCase().includes(term) ||
                            (user.department && user.department.toLowerCase().includes(term))
                        );
                    }

                    if (filters.status && filters.status !== 'all') {
                        filtered = filtered.filter(user => user.status === filters.status);
                    }

                    if (filters.role && filters.role !== 'all') {
                        filtered = filtered.filter(user => user.role === filters.role);
                    }

                    if (filters.department) {
                        filtered = filtered.filter(user => user.department === filters.department);
                    }
                }

                resolve(filtered);
            }, 500);
        });
    }

    async getUserById(id: string): Promise<User | null> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const user = this.users.find(u => u.id === id);
                resolve(user || null);
            }, 300);
        });
    }

    async createUser(userData: UserFormData): Promise<User> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newUser: User = {
                    ...userData,
                    id: this.generateId(),
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                this.users.push(newUser);
                this.saveData();
                resolve(newUser);
            }, 300);
        });
    }

    async updateUser(id: string, updates: Partial<UserFormData>): Promise<User> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = this.users.findIndex(u => u.id === id);

                if (index === -1) {
                    reject(new Error('User not found'));
                    return;
                }

                const existingUser = this.users[index];
                const updatedUser: User = {
                    ...existingUser,
                    displayName: updates.displayName ?? existingUser.displayName,
                    email: updates.email ?? existingUser.email,
                    role: updates.role ?? existingUser.role,
                    department: updates.department ?? existingUser.department,
                    status: updates.status ?? existingUser.status,
                    updatedAt: new Date()
                };

                this.users[index] = updatedUser;
                this.saveData();
                resolve(updatedUser);
            }, 300);
        });
    }

    async deleteUser(id: string): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = this.users.findIndex(u => u.id === id);

                if (index === -1) {
                    reject(new Error('User not found'));
                    return;
                }

                this.users.splice(index, 1);
                this.saveData();
                resolve();
            }, 300);
        });
    }

    async toggleUserStatus(id: string): Promise<User> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = this.users.findIndex(u => u.id === id);

                if (index === -1) {
                    reject(new Error('User not found'));
                    return;
                }

                const updatedUser: User = {
                    ...this.users[index],
                    status: this.users[index].status === 'active' ? 'inactive' : 'active',
                    updatedAt: new Date()
                };

                this.users[index] = updatedUser;
                this.saveData();
                resolve(updatedUser);
            }, 300);
        });
    }

    async getUserStats(): Promise<UserStats> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const totalUsers = this.users.length;
                const activeUsers = this.users.filter(u => u.status === 'active').length;
                const inactiveUsers = this.users.filter(u => u.status === 'inactive').length;
                const adminsCount = this.users.filter(u => u.role === 'admin').length;
                const facilitatorsCount = this.users.filter(u => u.role === 'facilitator').length;

                const usersByDepartment: Record<string, number> = {};
                this.users.forEach(user => {
                    const dept = user.department || 'Unknown';
                    usersByDepartment[dept] = (usersByDepartment[dept] || 0) + 1;
                });

                resolve({
                    totalUsers,
                    activeUsers,
                    inactiveUsers,
                    adminsCount,
                    facilitatorsCount,
                    usersByDepartment
                });
            }, 200);
        });
    }

    validateUser(data: UserFormData): { isValid: boolean; errors: Record<string, string> } {
        const validationResult = UserValidation.validateUserForm(data);

        return {
            isValid: validationResult.isValid,
            errors: UserValidation.formatFormErrors(validationResult.errors)
        };
    }
}

export const userService = new UserService();