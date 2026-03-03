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
import { AuthService } from './AuthService';

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
                throw new Error(Object.values(validation.errors).join(', '));
            }

            // Check if password is provided for new user
            if (!userData.password) {
                throw new Error('Password is required for new users');
            }

            // First create the user in Firebase Auth
            const authResponse = await AuthService.register({
                email: userData.email,
                password: userData.password,
                displayName: userData.displayName
            });

            if (!authResponse.success || !authResponse.user) {
                throw new Error(authResponse.message || 'Failed to create authentication user');
            }

            // Then create the user document in Firestore with the Auth UID
            const newUserData = {
                displayName: userData.displayName,
                email: userData.email,
                role: userData.role,
                department: userData.department || '',
                status: userData.status || 'active',
                uid: authResponse.user.uid,

                assignedHubIds: userData.assignedHubIds || [],
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
            throw new Error(error instanceof Error ? error.message : 'Failed to create user');
        }
    }

    async updateUser(id: string, updates: Partial<UserFormData>): Promise<User> {
        try {
            const userRef = doc(db, UserService.COLLECTION_NAME, id);
            const snapshot = await getDoc(userRef);

            if (!snapshot.exists()) {
                throw new Error('User not found');
            }

            // Remove password from updates if present (can't update password through this method)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...safeUpdates } = updates;

            const updateData = {
                ...safeUpdates,
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

            const userData = snapshot.data();

            // If the user has a Firebase Auth UID, delete them from Auth as well
            if (userData.uid) {
                // Note: Deleting users from Firebase Auth requires Admin SDK
                // You might want to handle this separately or use Firebase Admin
                console.log(`User ${userData.uid} needs to be deleted from Auth`);
                // You could call a cloud function here to delete the auth user
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
        // Get base validation from UserValidation
        const validationResult = UserValidation.validateUserForm(data);

        // Create a properly typed errors object
        const errors: Record<string, string> = {};

        // Handle validationResult.errors based on its actual structure
        // It might be an array of ValidationError objects
        if (Array.isArray(validationResult.errors)) {
            // If it's an array, convert each error to a string and store with a generic key
            validationResult.errors.forEach((error, index) => {
                if (typeof error === 'string') {
                    errors[`error${index}`] = error;
                } else if (error && typeof error === 'object') {
                    // If it's an object with message property
                    const errorObj = error as { field?: string; message?: string };
                    if (errorObj.field && errorObj.message) {
                        errors[errorObj.field] = errorObj.message;
                    } else if (errorObj.message) {
                        errors[`error${index}`] = errorObj.message;
                    }
                }
            });
        } else if (validationResult.errors && typeof validationResult.errors === 'object') {
            // If it's an object, process each key
            const errorObj = validationResult.errors as Record<string, unknown>;

            Object.keys(errorObj).forEach(key => {
                const errorValue = errorObj[key];
                if (Array.isArray(errorValue)) {
                    errors[key] = errorValue.join('. ');
                } else if (typeof errorValue === 'string') {
                    errors[key] = errorValue;
                } else if (errorValue && typeof errorValue === 'object') {
                    // Handle nested error objects
                    const nestedError = errorValue as { message?: string };
                    if (nestedError.message) {
                        errors[key] = nestedError.message;
                    }
                }
            });
        }

        // Add password validation for new users
        // Check if this is a new user (no existing displayName in initial data)
        const isNewUser = !data.displayName; // Use displayName to determine if it's new/edit

        if (isNewUser) {
            if (!data.password) {
                errors.password = 'Password is required';
            } else {
                const passwordErrors: string[] = [];

                // Password validation
                const hasUppercase = /[A-Z]/.test(data.password);
                const hasLowercase = /[a-z]/.test(data.password);
                const hasNumber = /[0-9]/.test(data.password);
                const hasSpecial = /[!@#$%^&*]/.test(data.password);
                const isLongEnough = data.password.length >= 8;

                if (!isLongEnough) {
                    passwordErrors.push('Password must be at least 8 characters');
                }
                if (!hasUppercase) {
                    passwordErrors.push('Password must contain an uppercase letter');
                }
                if (!hasLowercase) {
                    passwordErrors.push('Password must contain a lowercase letter');
                }
                if (!hasNumber) {
                    passwordErrors.push('Password must contain a number');
                }
                if (!hasSpecial) {
                    passwordErrors.push('Password must contain a special character (!@#$%^&*)');
                }

                if (passwordErrors.length > 0) {
                    errors.password = passwordErrors.join('. ');
                }
            }
        }

        // Determine overall validity
        const isValid = Object.keys(errors).length === 0;

        return {
            isValid,
            errors
        };
    }
}
//*9#8VgzDV7v4
//user@example.com
export const userService = new UserService();