// backend-firebase/src/services/UserService.ts

import {
    collection, query, orderBy, getDocs, getDoc, doc,
    addDoc, updateDoc, deleteDoc, where, serverTimestamp, Timestamp
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { db } from '../firebase/config';
import { auth } from '../firebase/config';
import {
    User, UserFormData, UserFilters, UserStats, UserRole,
} from '../../../src/core/entities/User';
import { UserValidation } from '../../../src/utils/Validation_userManagement';

const ALL_ROLES: UserRole[] = ['super_admin', 'hub_manager', 'it', 'asset_facilitator', 'student'];

async function createAuthUser(
    email: string,
    password: string,
    displayName?: string,
): Promise<{ uid: string }> {
    console.log('🔵 Creating auth user for:', email);

    try {

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('✅ Auth user created with UID:', userCredential.user.uid);

        if (displayName) {
            await updateProfile(userCredential.user, { displayName });
            console.log('✅ Display name updated:', displayName);
        }

        return { uid: userCredential.user.uid };
    } catch (error) {
        console.error('❌ Failed to create auth user:', error);
        throw error;
    }
}

// ─────────────────────────────────────────────────────────────────────────────

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
            console.log('🔵 Fetching users with filters:', filters);
            const usersRef = collection(db, UserService.COLLECTION_NAME);
            let q = query(usersRef, orderBy('createdAt', 'desc'));

            if (filters?.status && filters.status !== 'all')
                q = query(q, where('status', '==', filters.status));
            if (filters?.role && filters.role !== 'all')
                q = query(q, where('role', '==', filters.role));
            if (filters?.department)
                q = query(q, where('department', '==', filters.department));

            const snapshot = await getDocs(q);
            let users: User[] = snapshot.docs.map(d => {
                const data = d.data();
                return {
                    id: d.id,
                    displayName: data.displayName,
                    email: data.email,
                    role: data.role,
                    department: data.department || '',
                    status: data.status,
                    uid: data.uid,
                    primaryLocationId: data.primaryLocationId,
                    assignedHubIds: data.assignedHubIds || [],
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                };
            });

            if (filters?.searchTerm) {
                const term = filters.searchTerm.toLowerCase();
                users = users.filter(u =>
                    u.displayName?.toLowerCase().includes(term) ||
                    u.email?.toLowerCase().includes(term) ||
                    u.department?.toLowerCase().includes(term),
                );
            }

            console.log(`✅ Fetched ${users.length} users`);
            return users;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw new Error('Failed to fetch users');
        }
    }

    async getUserById(id: string): Promise<User | null> {
        try {
            const snap = await getDoc(doc(db, UserService.COLLECTION_NAME, id));
            if (!snap.exists()) return null;
            const data = snap.data();
            return {
                id: snap.id,
                displayName: data.displayName,
                email: data.email,
                role: data.role,
                department: data.department || '',
                status: data.status,
                uid: data.uid,
                primaryLocationId: data.primaryLocationId,
                assignedHubIds: data.assignedHubIds || [],
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
            };
        } catch (error) {
            console.error('Error fetching user:', error);
            throw new Error('Failed to fetch user');
        }
    }

    async createUser(userData: UserFormData): Promise<User> {
        console.log('🔵 Creating user with data:', { ...userData, password: '[HIDDEN]' });

        try {
            // Validation
            const validation = this.validateUser(userData);
            if (!validation.isValid) {
                console.error('❌ Validation failed:', validation.errors);
                throw new Error(Object.values(validation.errors).join(', '));
            }

            if (!userData.password) {
                throw new Error('Password is required for new users');
            }

            // Create Firebase Auth user (using the simplified function)
            console.log('🔵 Creating Firebase Auth user...');
            const { uid } = await createAuthUser(
                userData.email,
                userData.password,
                userData.displayName,
            );
            console.log('✅ Firebase Auth user created with UID:', uid);

            // Prepare Firestore document
            const now = Timestamp.now();
            const newUserData = {
                displayName: userData.displayName,
                email: userData.email,
                role: userData.role,
                department: userData.department || '',
                status: userData.status || 'active',
                uid: uid,
                assignedHubIds: userData.assignedHubIds || [],
                primaryLocationId: userData.primaryLocationId || null,
                createdAt: now,
                updatedAt: now,
            };

            // Add to Firestore
            console.log('🔵 Adding user to Firestore...');
            const docRef = await addDoc(
                collection(db, UserService.COLLECTION_NAME),
                newUserData,
            );
            console.log('✅ Firestore document created with ID:', docRef.id);

            // Return the created user
            return {
                id: docRef.id,
                displayName: newUserData.displayName,
                email: newUserData.email,
                role: newUserData.role as UserRole,
                department: newUserData.department,
                status: newUserData.status as 'active' | 'inactive',
                uid: newUserData.uid,
                primaryLocationId: newUserData.primaryLocationId || undefined,
                assignedHubIds: newUserData.assignedHubIds,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
        } catch (error) {
            console.error('❌ Error creating user:', error);
            throw new Error(error instanceof Error ? error.message : 'Failed to create user');
        }
    }

    async updateUser(id: string, updates: Partial<UserFormData>): Promise<User> {
        try {
            console.log('🔵 Updating user:', id, updates);
            const userRef = doc(db, UserService.COLLECTION_NAME, id);
            const snapshot = await getDoc(userRef);
            if (!snapshot.exists()) throw new Error('User not found');

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...safeUpdates } = updates;
            await updateDoc(userRef, { ...safeUpdates, updatedAt: serverTimestamp() });

            const updated = await this.getUserById(id);
            if (!updated) throw new Error('User not found after update');
            console.log('✅ User updated:', id);
            return updated;
        } catch (error) {
            console.error('Error updating user:', error);
            throw new Error('Failed to update user');
        }
    }

    async deleteUser(id: string): Promise<void> {
        try {
            console.log('🔵 Deleting user:', id);
            const userRef = doc(db, UserService.COLLECTION_NAME, id);
            const snapshot = await getDoc(userRef);
            if (!snapshot.exists()) throw new Error('User not found');

            const data = snapshot.data();
            if (data.uid) {
                console.log(`Note: Auth user ${data.uid} should be deleted via Cloud Function`);
            }

            await deleteDoc(userRef);
            console.log('✅ User deleted:', id);
        } catch (error) {
            console.error('Error deleting user:', error);
            throw new Error('Failed to delete user');
        }
    }

    async toggleUserStatus(id: string): Promise<User> {
        try {
            console.log('🔵 Toggling user status:', id);
            const userRef = doc(db, UserService.COLLECTION_NAME, id);
            const snapshot = await getDoc(userRef);
            if (!snapshot.exists()) throw new Error('User not found');

            const newStatus = snapshot.data().status === 'active' ? 'inactive' : 'active';
            await updateDoc(userRef, { status: newStatus, updatedAt: serverTimestamp() });

            const updated = await this.getUserById(id);
            if (!updated) throw new Error('User not found after status update');
            console.log('✅ Status toggled to:', newStatus);
            return updated;
        } catch (error) {
            console.error('Error toggling user status:', error);
            throw new Error('Failed to toggle user status');
        }
    }

    async getUserStats(): Promise<UserStats> {
        try {
            const users = await this.getUsers();
            const usersByDepartment: Record<string, number> = {};
            users.forEach(u => {
                const dept = u.department || 'Unknown';
                usersByDepartment[dept] = (usersByDepartment[dept] || 0) + 1;
            });
            return {
                totalUsers: users.length,
                activeUsers: users.filter(u => u.status === 'active').length,
                inactiveUsers: users.filter(u => u.status === 'inactive').length,
                adminsCount: users.filter(u => u.role === 'super_admin').length,
                managersCount: users.filter(u => u.role === 'hub_manager').length,
                itCount: users.filter(u => u.role === 'it').length,
                facilitatorsCount: users.filter(u => u.role === 'asset_facilitator').length,
                studentsCount: users.filter(u => u.role === 'student').length,
                usersByDepartment,
            };
        } catch (error) {
            console.error('Error getting user stats:', error);
            throw new Error('Failed to get user stats');
        }
    }

    validateUser(data: UserFormData): { isValid: boolean; errors: Record<string, string> } {
        const validationResult = UserValidation.validateUserForm(data);
        const errors: Record<string, string> = {};

        if (Array.isArray(validationResult.errors)) {
            validationResult.errors.forEach((error, index) => {
                if (typeof error === 'string') {
                    errors[`error${index}`] = error;
                } else if (error && typeof error === 'object') {
                    const e = error as { field?: string; message?: string };
                    if (e.field && e.message) errors[e.field] = e.message;
                    else if (e.message) errors[`error${index}`] = e.message;
                }
            });
        } else if (validationResult.errors && typeof validationResult.errors === 'object') {
            Object.entries(validationResult.errors as Record<string, unknown>).forEach(([key, val]) => {
                if (Array.isArray(val)) errors[key] = val.join('. ');
                else if (typeof val === 'string') errors[key] = val;
                else if (val && typeof val === 'object') {
                    const nested = val as { message?: string };
                    if (nested.message) errors[key] = nested.message;
                }
            });
        }

        if (data.role && !ALL_ROLES.includes(data.role)) {
            errors.role = `Invalid role. Must be one of: ${ALL_ROLES.join(', ')}`;
        }

        if (data.password) {
            const pw: string[] = [];
            if (data.password.length < 8) pw.push('at least 8 characters');
            if (!/[A-Z]/.test(data.password)) pw.push('an uppercase letter');
            if (!/[a-z]/.test(data.password)) pw.push('a lowercase letter');
            if (!/[0-9]/.test(data.password)) pw.push('a number');
            if (!/[!@#$%^&*]/.test(data.password)) pw.push('a special character (!@#$%^&*)');
            if (pw.length > 0) {
                errors.password = `Password must contain: ${pw.join(', ')}`;
            }
        }

        return { isValid: Object.keys(errors).length === 0, errors };
    }
}

export const userService = new UserService();