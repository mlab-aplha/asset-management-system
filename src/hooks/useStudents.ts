import { useState, useCallback } from 'react';
import { studentService } from '../services/studentService';
import { Student, StudentFormData } from '../core/entities/student';

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await studentService.getStudents();
      setStudents(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  }, []);

  const createStudent = useCallback(async (data: StudentFormData) => {
    setLoading(true);
    setError(null);
    try {
      const newStudent = await studentService.createStudent(data);
      setStudents(prev => [newStudent, ...prev]);
      return { success: true, data: newStudent };
    } catch (err: any) {
      setError(err.message || 'Failed to create student');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStudent = useCallback(async (id: string, data: Partial<StudentFormData>) => {
    setLoading(true);
    setError(null);
    try {
      await studentService.updateStudent(id, data);
      setStudents(prev => prev.map(s => s.id === id ? { ...s, ...data } as Student : s));
      return { success: true };
    } catch (err: any) {
      setError(err.message || 'Failed to update student');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteStudent = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await studentService.deleteStudent(id);
      setStudents(prev => prev.filter(s => s.id !== id));
      return { success: true };
    } catch (err: any) {
      setError(err.message || 'Failed to delete student');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    students,
    loading,
    error,
    loadStudents,
    createStudent,
    updateStudent,
    deleteStudent
  };
};
