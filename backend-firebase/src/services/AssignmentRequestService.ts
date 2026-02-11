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
  // Create new request
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

  // Get all requests with filters
  async getAll(filter?: RequestFilter) {
    try {
      let constraints: any[] = [];
      
      if (filter?.status) constraints.push(where('status', '==', filter.status));
      if (filter?.priority) constraints.push(where('priority', '==', filter.priority));
      if (filter?.userId) constraints.push(where('userId', '==', filter.userId));
      if (filter?.assetId) constraints.push(where('assetId', '==', filter.assetId));
      
      constraints.push(orderBy('requestedDate', 'desc'));
      
      const q = query(ref, ...constraints);
      const snapshot = await getDocs(q);
      
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Get single request
  async getById(id: string) {
    try {
      const docRef = doc(db, collectionName, id);
      const snapshot = await getDoc(docRef);
      
      if (snapshot.exists()) {
        const data = snapshot.data();
        return { 
          success: true, 
          data: { 
            id: snapshot.id, 
            ...data,
            userId: data.userId || '',
            userName: data.userName || '',
            userEmail: data.userEmail || '',
            assetId: data.assetId || '',
            assetName: data.assetName || '',
            assetSerialNumber: data.assetSerialNumber || '',
            expectedReturnDate: data.expectedReturnDate || new Date(),
            purpose: data.purpose || '',
            priority: data.priority || 'medium',
            status: data.status || 'pending'
          } as AssignmentRequest 
        };
      }
      return { success: false, error: 'Request not found' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Approve request
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

      // ✅ FIXED: Get request data properly
      const requestResult = await this.getById(id);
      if (requestResult.success && requestResult.data) {
        const request = requestResult.data;
        
        await addDoc(collection(db, 'assignments'), {
          requestId: id,
          userId: request.userId,
          userName: request.userName,
          userEmail: request.userEmail || '',
          userDepartment: request.userDepartment || '',
          assetId: request.assetId,
          assetName: request.assetName,
          assetSerialNumber: request.assetSerialNumber || '',
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

        // ✅ Update asset status to 'assigned'
        const assetRef = doc(db, 'assets', request.assetId);
        await updateDoc(assetRef, {
          status: 'assigned',
          updatedAt: now
        });
      }
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Reject request
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
  },

  // Update request
  async update(id: string, data: Partial<AssignmentRequest>) {
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

  // Delete request
  async delete(id: string) {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Get pending count
  async getPendingCount() {
    try {
      const q = query(ref, where('status', '==', 'pending'));
      const snapshot = await getDocs(q);
      return { success: true, count: snapshot.size };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};