import {
    collection,
    query,
    orderBy,
    getDocs,
    getDoc,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    where,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
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

export class UserService implements IUserService {
    private static readonly COLLECTION_NAME = 'users';

    async getUsers(filters?: UserFilters): Promise<User[]> {
        try {
            const usersRef = collection(db, UserService.COLLECTION_NAME);
            let q = query(usersRef, orderBy('createdAt', 'desc'));

            if (filters) {
                if (filters.status && filters.status !== 'all') {
                    q = query(q, where('status', '==', filters.status));
                }
                if (filters.role && filters.role !== 'all') {
                    q = query(q, where('role', '==', filters.role));
                }
                if (filters.department) {
                    q = query(q, where('department', '==', filters.department));
                }
            }

            const snapshot = await getDocs(q);
            const users: User[] = [];

            snapshot.forEach((doc) => {
                const data = doc.data();
                users.push({
                    id: doc.id,
                    displayName: data.displayName,
                    email: data.email,
                    role: data.role,
                    department: data.department || '',
                    status: data.status,
                    uid: data.uid,
                    primaryLocationId: data.primaryLocationId,
                    assignedHubIds: data.assignedHubIds || [],
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date()
                });
            });

            // Apply search filter client-side if needed
            if (filters?.searchTerm) {
                const term = filters.searchTerm.toLowerCase();
                return users.filter(user =>
                    user.displayName?.toLowerCase().includes(term) ||
                    user.email?.toLowerCase().includes(term) ||
                    user.department?.toLowerCase().includes(term)
                );
            }

            return users;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw new Error('Failed to fetch users');
        }
    }

    async getUserById(id: string): Promise<User | null> {
        try {
            const userRef = doc(db, UserService.COLLECTION_NAME, id);
            const snapshot = await getDoc(userRef);

            if (!snapshot.exists()) {
                return null;
            }

            const data = snapshot.data();
            return {
                id: snapshot.id,
                displayName: data.displayName,
                email: data.email,
                role: data.role,
                department: data.department || '',
                status: data.status,
                uid: data.uid,
                primaryLocationId: data.primaryLocationId,
                assignedHubIds: data.assignedHubIds || [],
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date()
            };
        } catch (error) {
            console.error('Error fetching user:', error);
            throw new Error('Failed to fetch user');
        }
    }

    async createUser(userData: UserFormData): Promise<User> {
        try {
            // Validate user data
            const validation = this.validateUser(userData);
            if (!validation.isValid) {
                throw new Error('User data validation failed');
            }

            const newUserData = {
                displayName: userData.displayName,
                email: userData.email,
                role: userData.role,
                department: userData.department || '',
                status: userData.status || 'active',
                assignedHubIds: [],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, UserService.COLLECTION_NAME), newUserData);

            return {
                id: docRef.id,
                ...newUserData,
                createdAt: new Date(),
                updatedAt: new Date()
            };
        } catch (error) {
            console.error('Error creating user:', error);
            throw new Error('Failed to create user');
        }
    }

    async updateUser(id: string, updates: Partial<UserFormData>): Promise<User> {
        try {
            const userRef = doc(db, UserService.COLLECTION_NAME, id);
            const snapshot = await getDoc(userRef);

            if (!snapshot.exists()) {
                throw new Error('User not found');
            }

            const updateData = {
                ...updates,
                updatedAt: serverTimestamp()
            };

            await updateDoc(userRef, updateData);

            const updatedUser = await this.getUserById(id);
            if (!updatedUser) {
                throw new Error('User not found after update');
            }

            return updatedUser;
        } catch (error) {
            console.error('Error updating user:', error);
            throw new Error('Failed to update user');
        }
    }

    async deleteUser(id: string): Promise<void> {
        try {
            const userRef = doc(db, UserService.COLLECTION_NAME, id);
            const snapshot = await getDoc(userRef);

            if (!snapshot.exists()) {
                throw new Error('User not found');
            }

            await deleteDoc(userRef);
        } catch (error) {
            console.error('Error deleting user:', error);
            throw new Error('Failed to delete user');
        }
    }

    async toggleUserStatus(id: string): Promise<User> {
        try {
            const userRef = doc(db, UserService.COLLECTION_NAME, id);
            const snapshot = await getDoc(userRef);

            if (!snapshot.exists()) {
                throw new Error('User not found');
            }

            const data = snapshot.data();
            const newStatus = data.status === 'active' ? 'inactive' : 'active';

            await updateDoc(userRef, {
                status: newStatus,
                updatedAt: serverTimestamp()
            });

            const updatedUser = await this.getUserById(id);
            if (!updatedUser) {
                throw new Error('User not found after status update');
            }

            return updatedUser;
        } catch (error) {
            console.error('Error toggling user status:', error);
            throw new Error('Failed to toggle user status');
        }
    }

    async getUserStats(): Promise<UserStats> {
        try {
            const users = await this.getUsers();

            const totalUsers = users.length;
            const activeUsers = users.filter(u => u.status === 'active').length;
            const inactiveUsers = users.filter(u => u.status === 'inactive').length;
            const adminsCount = users.filter(u => u.role === 'admin').length;
            const facilitatorsCount = users.filter(u => u.role === 'facilitator').length;

            const usersByDepartment: Record<string, number> = {};
            users.forEach(user => {
                const dept = user.department || 'Unknown';
                usersByDepartment[dept] = (usersByDepartment[dept] || 0) + 1;
            });

            return {
                totalUsers,
                activeUsers,
                inactiveUsers,
                adminsCount,
                facilitatorsCount,
                usersByDepartment
            };
        } catch (error) {
            console.error('Error getting user stats:', error);
            throw new Error('Failed to get user stats');
        }
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