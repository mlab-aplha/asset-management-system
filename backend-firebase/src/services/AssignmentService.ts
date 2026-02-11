 import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Assignment } from '../../../src/features/facilitator/asset-assignment/types';

const collectionName = 'assignments';
const ref = collection(db, collectionName);

export const AssignmentService = {
  // Create new assignment
  async create(data: Partial<Assignment>) {
    try {
      const now = new Date();
      const docRef = await addDoc(ref, {
        ...data,
        status: 'active',
        createdAt: now,
        updatedAt: now
      });

      // Update asset status to 'assigned'
      if (data.assetId) {
        const assetRef = doc(db, 'assets', data.assetId);
        await updateDoc(assetRef, {
          status: 'assigned',
          updatedAt: now
        });
      }
      
      return { success: true, id: docRef.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Get all assignments
  async getAll(filters?: any) {
    try {
      let constraints: any[] = [];
      
      if (filters?.status) constraints.push(where('status', '==', filters.status));
      if (filters?.userId) constraints.push(where('userId', '==', filters.userId));
      if (filters?.assetId) constraints.push(where('assetId', '==', filters.assetId));
      
      constraints.push(orderBy('assignedDate', 'desc'));
      
      const q = query(ref, ...constraints);
      const snapshot = await getDocs(q);
      
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Assignment[];
      
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Get active assignments
  async getActive() {
    try {
      const q = query(
        ref, 
        where('status', '==', 'active'),
        orderBy('expectedReturnDate', 'asc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as Assignment[];
      
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Get overdue assignments
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
        const expectedDate = new Date(data.expectedReturnDate);
        const daysOverdue = Math.ceil((now.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          id: doc.id,
          ...data,
          daysOverdue
        } as Assignment & { daysOverdue: number };
      });
      
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Process return
  async processReturn(id: string, condition: string, notes?: string) {
    try {
      const docRef = doc(db, collectionName, id);
      const now = new Date();
      
      // Get assignment before updating
      const assignmentResult = await this.getById(id);
      
      await updateDoc(docRef, {
        status: 'returned',
        actualReturnDate: now,
        conditionAtReturn: condition,
        notes: notes || '',
        updatedAt: now
      });

      // Update asset status to 'available'
      if (assignmentResult.success && assignmentResult.data) {
        const assetRef = doc(db, 'assets', assignmentResult.data.assetId);
        await updateDoc(assetRef, {
          status: 'available',
          updatedAt: now
        });
      }
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Get by ID
  async getById(id: string) {
    try {
      const docRef = doc(db, collectionName, id);
      const snapshot = await getDoc(docRef);
      
      if (snapshot.exists()) {
        return { 
          success: true, 
          data: { 
            id: snapshot.id, 
            ...snapshot.data() 
          } as Assignment 
        };
      }
      return { success: false, error: 'Assignment not found' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Get user assignment history
  async getUserHistory(userId: string) {
    try {
      const q = query(
        ref,
        where('userId', '==', userId),
        orderBy('assignedDate', 'desc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as Assignment[];
      
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Get asset assignment history
  async getAssetHistory(assetId: string) {
    try {
      const q = query(
        ref,
        where('assetId', '==', assetId),
        orderBy('assignedDate', 'desc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as Assignment[];
      
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Update assignment
  async update(id: string, data: Partial<Assignment>) {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date()
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Delete assignment
  async delete(id: string) {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Get active count
  async getActiveCount() {
    try {
      const q = query(ref, where('status', '==', 'active'));
      const snapshot = await getDocs(q);
      return { success: true, count: snapshot.size };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Get overdue count
  async getOverdueCount() {
    try {
      const now = new Date();
      const q = query(
        ref, 
        where('status', '==', 'active'),
        where('expectedReturnDate', '<', now)
      );
      const snapshot = await getDocs(q);
      return { success: true, count: snapshot.size };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};
