import { useState } from 'react';
import { db } from '../../backend-firebase/src/firebase/config';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Student } from '../core/entities/student';
import { User } from '../core/entities/User';

export const useStudentFacilitatorLink = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFacilitators = async (): Promise<User[]> => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'facilitator'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    } catch (err) {
      console.error('Error loading facilitators:', err);
      setError('Failed to load facilitators');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const assignStudentToFacilitator = async (studentId: string, facilitatorId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const studentRef = doc(db, 'students', studentId);
      await updateDoc(studentRef, { 
        facilitatorId, 
        updatedAt: new Date() 
      });
      return true;
    } catch (err) {
      console.error('Error assigning student:', err);
      setError('Failed to assign student');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getStudentsByFacilitator = async (facilitatorId: string): Promise<Student[]> => {
    setLoading(true);
    try {
      const q = query(collection(db, 'students'), where('facilitatorId', '==', facilitatorId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
    } catch (err) {
      console.error('Error loading students by facilitator:', err);
      setError('Failed to load students');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getUnassignedStudents = async (): Promise<Student[]> => {
    setLoading(true);
    try {
      const q = query(collection(db, 'students'), where('facilitatorId', '==', null));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
    } catch (err) {
      console.error('Error loading unassigned students:', err);
      setError('Failed to load unassigned students');
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getFacilitators,
    assignStudentToFacilitator,
    getStudentsByFacilitator,
    getUnassignedStudents
  };
};
