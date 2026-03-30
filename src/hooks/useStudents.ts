// src/hooks/useStudents.ts
import { useState, useCallback } from 'react';
import {
    StudentService,
    Student,
    CreateStudentInput,
    UpdateStudentInput,
    StudentFilters,
} from '../../backend-firebase/src/services/Studentservice';

interface ServiceResponse<T = unknown> {
    success: boolean;
    data?: T;
    errors?: Record<string, string>;
    message?: string;
}

export const useStudents = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadStudents = useCallback(async (filters?: StudentFilters): Promise<Student[]> => {
        setLoading(true);
        setError(null);
        try {
            const data = await StudentService.getAll(filters);
            setStudents(data);
            return data;
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to load students';
            setError(msg);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const createStudent = useCallback(
        async (input: CreateStudentInput): Promise<ServiceResponse<Student>> => {
            setLoading(true);
            setError(null);
            try {
                const res = await StudentService.create(input);
                if (res.success) {
                    await loadStudents();
                    return { success: true, data: res.data };
                }
                return { success: false, errors: { general: res.error || 'Failed to create student' } };
            } catch (err) {
                const msg = err instanceof Error ? err.message : 'Failed to create student';
                setError(msg);
                return { success: false, errors: { general: msg } };
            } finally {
                setLoading(false);
            }
        },
        [loadStudents],
    );

    const updateStudent = useCallback(
        async (id: string, updates: UpdateStudentInput): Promise<ServiceResponse<Student>> => {
            setLoading(true);
            setError(null);
            try {
                const res = await StudentService.update(id, updates);
                if (res.success) {
                    await loadStudents();
                    return { success: true, data: res.data };
                }
                return { success: false, errors: { general: res.error || 'Failed to update student' } };
            } catch (err) {
                const msg = err instanceof Error ? err.message : 'Failed to update student';
                setError(msg);
                return { success: false, errors: { general: msg } };
            } finally {
                setLoading(false);
            }
        },
        [loadStudents],
    );

    const deleteStudent = useCallback(
        async (id: string): Promise<ServiceResponse> => {
            setLoading(true);
            setError(null);
            try {
                const res = await StudentService.delete(id);
                if (res.success) {
                    setStudents((prev) => prev.filter((s) => s.id !== id));
                    return { success: true };
                }
                return { success: false, errors: { general: res.error || 'Failed to delete student' } };
            } catch (err) {
                const msg = err instanceof Error ? err.message : 'Failed to delete student';
                setError(msg);
                return { success: false, errors: { general: msg } };
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    const toggleStatus = useCallback(
        async (id: string): Promise<ServiceResponse<Student>> => {
            setLoading(true);
            setError(null);
            try {
                const res = await StudentService.toggleStatus(id);
                if (res.success) {
                    await loadStudents();
                    return { success: true, data: res.data };
                }
                return { success: false, errors: { general: res.error || 'Failed to toggle status' } };
            } catch (err) {
                const msg = err instanceof Error ? err.message : 'Failed to toggle status';
                setError(msg);
                return { success: false, errors: { general: msg } };
            } finally {
                setLoading(false);
            }
        },
        [loadStudents],
    );

    return {
        students,
        loading,
        error,
        setError,
        loadStudents,
        createStudent,
        updateStudent,
        deleteStudent,
        toggleStatus,
    };
};