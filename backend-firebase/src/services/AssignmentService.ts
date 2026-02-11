import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Assignment } from '../../../src/features/facilitator/asset-assignment/types';

const collectionName = 'assignments';
const ref = collection(db, collectionName);

export const AssignmentService = {
  async create(data: Partial<Assignment>) {
    try {
      const now = new Date();
      const docRef = await addDoc(ref, {
        ...data,
        status: 'active',
        createdAt: now,
        updatedAt: now
      });
      return { success: true, id: docRef.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async getActive() {
    try {
      const q = query(ref, where('status', '==', 'active'), orderBy('expectedReturnDate', 'asc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async getOverdue() {
    try {
      const now = new Date();
      const q = query(
        ref,
        where('status', '==', 'active'),
        where('expectedReturnDate', '<', now),
        orderBy('expectedReturnDate', 'asc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => {
        const data = doc.data();
        const daysOverdue = Math.ceil((now.getTime() - new Date(data.expectedReturnDate).getTime()) / (1000 * 60 * 60 * 24));
        return { id: doc.id, ...data, daysOverdue };
      });
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async processReturn(id: string, condition: string, notes?: string) {
    try {
      const docRef = doc(db, collectionName, id);
      const now = new Date();
      await updateDoc(docRef, {
        status: 'returned',
        actualReturnDate: now,
        conditionAtReturn: condition,
        notes: notes || '',
        updatedAt: now
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async getById(id: string) {
    try {
      const docRef = doc(db, collectionName, id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { success: true, data: { id: snapshot.id, ...snapshot.data() } };
      }
      return { success: false, error: 'Assignment not found' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};
