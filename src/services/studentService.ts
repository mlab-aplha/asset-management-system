import { db } from '../../backend-firebase/src/firebase/config';
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Student, StudentFormData } from '../core/entities/student';

const COLLECTION = 'students';

export const studentService = {
  async getStudents(): Promise<Student[]> {
    try {
      const studentsRef = collection(db, COLLECTION);
      const snapshot = await getDocs(studentsRef);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Student));
    } catch (error) {
      console.error('Error getting students:', error);
      throw error;
    }
  },

  async getStudentById(id: string): Promise<Student | null> {
    try {
      const docRef = doc(db, COLLECTION, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Student;
      }
      return null;
    } catch (error) {
      console.error('Error getting student:', error);
      throw error;
    }
  },

  async createStudent(data: StudentFormData): Promise<Student> {
    try {
      const studentData = {
        ...data,
        studentId: data.studentId || `STU${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const docRef = await addDoc(collection(db, COLLECTION), studentData);
      return { id: docRef.id, ...studentData } as Student;
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  },

  async updateStudent(id: string, data: Partial<StudentFormData>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  },

  async deleteStudent(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  }
};
