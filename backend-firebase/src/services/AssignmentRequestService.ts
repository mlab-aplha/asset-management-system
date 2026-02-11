import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { AssignmentRequest, RequestFilter } from '../../../src/features/facilitator/asset-assignment/types';

const collectionName = 'assignmentRequests';
const ref = collection(db, collectionName);

export const AssignmentRequestService = {
  async create(data: Partial<AssignmentRequest>) {
    try {
      const now = new Date();
      const docRef = await addDoc(ref, {
        ...data,
        status: 'pending',
        createdAt: now,
        updatedAt: now
      });
      return { success: true, id: docRef.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async getAll(filter?: RequestFilter) {
    try {
      let constraints: any[] = [];
      if (filter?.status) constraints.push(where('status', '==', filter.status));
      if (filter?.priority) constraints.push(where('priority', '==', filter.priority));
      constraints.push(orderBy('requestedDate', 'desc'));
      
      const q = query(ref, ...constraints);
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return { success: true, data };
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
      return { success: false, error: 'Request not found' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async approve(id: string, facilitatorId: string, facilitatorName: string, notes?: string) {
    try {
      const docRef = doc(db, collectionName, id);
      const now = new Date();
      
      await updateDoc(docRef, {
        status: 'approved',
        approvedDate: now,
        approvedBy: facilitatorId,
        facilitatorNotes: notes || '',
        updatedAt: now
      });

      const requestResult = await this.getById(id);
      if (requestResult.success && requestResult.data) {
        const request = requestResult.data;
        await addDoc(collection(db, 'assignments'), {
          requestId: id,
          userId: request.userId,
          userName: request.userName,
          userEmail: request.userEmail || '',
          assetId: request.assetId,
          assetName: request.assetName,
          assignedDate: now,
          expectedReturnDate: request.expectedReturnDate,
          status: 'active',
          conditionAtCheckout: 'Good',
          facilitatorId,
          facilitatorName,
          notes: notes || '',
          createdAt: now,
          updatedAt: now
        });
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async reject(id: string, facilitatorId: string, reason: string) {
    try {
      const docRef = doc(db, collectionName, id);
      const now = new Date();
      await updateDoc(docRef, {
        status: 'rejected',
        rejectedDate: now,
        rejectedBy: facilitatorId,
        rejectionReason: reason,
        updatedAt: now
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};
