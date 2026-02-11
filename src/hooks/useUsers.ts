import { useState, useCallback } from 'react';
import { User, UserFormData, UserFilters } from '../core/entities/User';
import { userService } from '../../backend-firebase/src/services/UserService';

interface ServiceResponse<T = unknown> {
    success: boolean;
    data?: T;
    errors?: Record<string, string>;
    message?: string;
}

export const useUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadUsers = useCallback(async (filters?: UserFilters): Promise<User[]> => {
        try {
            setLoading(true);
            setError(null);
            const data = await userService.getUsers(filters);
            setUsers(data);
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load users';
            setError(errorMessage);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const createUser = useCallback(async (userData: UserFormData): Promise<ServiceResponse<User>> => {
        try {
            setLoading(true);
            setError(null);

            const validation = userService.validateUser(userData);
            if (!validation.isValid) {
                return { success: false, errors: validation.errors };
            }

            const newUser = await userService.createUser(userData);
            await loadUsers();
            return { success: true, data: newUser };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create user';
            setError(errorMessage);
            return { success: false, errors: { general: errorMessage } };
        } finally {
            setLoading(false);
        }
    }, [loadUsers]);

    const updateUser = useCallback(async (id: string, updates: Partial<UserFormData>): Promise<ServiceResponse<User>> => {
        try {
            setLoading(true);
            setError(null);

            const validation = userService.validateUser(updates as UserFormData);
            if (!validation.isValid) {
                return { success: false, errors: validation.errors };
            }

            const updatedUser = await userService.updateUser(id, updates);
            await loadUsers();
            return { success: true, data: updatedUser };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
            setError(errorMessage);
            return { success: false, errors: { general: errorMessage } };
        } finally {
            setLoading(false);
        }
    }, [loadUsers]);

    const deleteUser = useCallback(async (id: string): Promise<ServiceResponse> => {
        try {
            setLoading(true);
            setError(null);

            await userService.deleteUser(id);
            await loadUsers();
            return { success: true };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
            setError(errorMessage);
            return { success: false, errors: { general: errorMessage } };
        } finally {
            setLoading(false);
        }
    }, [loadUsers]);

    const toggleUserStatus = useCallback(async (id: string): Promise<ServiceResponse<User>> => {
        try {
            setLoading(true);
            setError(null);

            const updatedUser = await userService.toggleUserStatus(id);
            await loadUsers();
            return { success: true, data: updatedUser };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to toggle user status';
            setError(errorMessage);
            return { success: false, errors: { general: errorMessage } };
        } finally {
            setLoading(false);
        }
    }, [loadUsers]);

    return {
        users,
        loading,
        error,
        loadUsers,
        createUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        setError
    };
};