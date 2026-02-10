import { useState, useCallback } from 'react';
import { User, UserFormData, UserFilters } from '../core/entities/User';
import { userService } from '../../backend-firebase/src/services/UserService';

export const useUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadUsers = useCallback(async (filters?: UserFilters) => {
        try {
            setLoading(true);
            setError(null);
            const data = await userService.getUsers(filters);
            setUsers(data);
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load users');
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const createUser = useCallback(async (userData: UserFormData) => {
        try {
            setLoading(true);
            const validation = userService.validateUser(userData);

            if (!validation.isValid) {
                return { success: false, errors: validation.errors };
            }

            const newUser = await userService.createUser(userData);
            await loadUsers();
            return { success: true, data: newUser };
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create user');
            return { success: false, errors: { general: 'Failed to create user' } };
        } finally {
            setLoading(false);
        }
    }, [loadUsers]);

    const updateUser = useCallback(async (id: string, updates: Partial<UserFormData>) => {
        try {
            setLoading(true);
            const validation = userService.validateUser(updates as UserFormData);

            if (!validation.isValid) {
                return { success: false, errors: validation.errors };
            }

            const updatedUser = await userService.updateUser(id, updates);
            await loadUsers();
            return { success: true, data: updatedUser };
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update user');
            return { success: false, errors: { general: 'Failed to update user' } };
        } finally {
            setLoading(false);
        }
    }, [loadUsers]);

    const deleteUser = useCallback(async (id: string) => {
        try {
            setLoading(true);
            await userService.deleteUser(id);
            await loadUsers();
            return { success: true };
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete user');
            return { success: false };
        } finally {
            setLoading(false);
        }
    }, [loadUsers]);

    const toggleUserStatus = useCallback(async (id: string) => {
        try {
            setLoading(true);
            const updatedUser = await userService.toggleUserStatus(id);
            await loadUsers();
            return { success: true, data: updatedUser };
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to toggle user status');
            return { success: false };
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