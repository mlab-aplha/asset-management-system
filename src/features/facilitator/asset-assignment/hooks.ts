import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../../backend-firebase/src/firebase/config';
import { AssignmentRequest, AssignmentFormData, User, Asset } from './types';

// ============================================================================
// useAssignmentRequests - Main hook for facilitator
// ============================================================================
export const useAssignmentRequests = (initialFilter?: any) => {
  const [requests, setRequests] = useState<AssignmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState(initialFilter || {});

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const constraints: any[] = [];
      if (filter.status) constraints.push(where('status', '==', filter.status));
      if (filter.priority) constraints.push(where('priority', '==', filter.priority));
      constraints.push(orderBy('requestedDate', 'desc'));
      
      const q = query(collection(db, 'assignmentRequests'), ...constraints);
      const snapshot = await getDocs(q);
      
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AssignmentRequest[];
      setRequests(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [filter.status, filter.priority]);

  const createRequest = async (formData: AssignmentFormData, userData: User, assetData: Asset) => {
    try {
      const now = new Date();
      const newRequest = {
        userId: userData.id,
        userName: userData.name,
        userEmail: userData.email,
        userDepartment: userData.department || '',
        assetId: assetData.id,
        assetName: assetData.name,
        assetSerialNumber: assetData.serialNumber,
        requestedDate: now,
        expectedReturnDate: new Date(formData.expectedReturnDate),
        purpose: formData.purpose,
        priority: formData.priority,
        status: 'pending',
        facilitatorNotes: formData.notes || '',
        approvedDate: null,
        approvedBy: '',
        rejectedDate: null,
        rejectedBy: '',
        rejectionReason: '',
        completedDate: null,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(collection(db, 'assignmentRequests'), newRequest);
      const newRequestWithId = {
  id: docRef.id,
  ...newRequest
} as unknown as AssignmentRequest;
      setRequests(prev => [newRequestWithId, ...prev]);
      return { success: true, id: docRef.id };
    } catch (err) {
      return { success: false, error: 'Failed to create request' };
    }
  };

  const approveRequest = async (requestId: string, facilitatorId: string, facilitatorName: string, notes?: string) => {
    try {
      const now = new Date();
      await updateDoc(doc(db, 'assignmentRequests', requestId), {
        status: 'approved',
        approvedDate: now,
        approvedBy: facilitatorId,
        facilitatorNotes: notes || '',
        updatedAt: now
      });

      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { 
              ...req, 
              status: 'approved', 
              approvedDate: now, 
              approvedBy: facilitatorId, 
              facilitatorNotes: notes || '', 
              updatedAt: now 
            }
          : req
      ));

      const request = requests.find(r => r.id === requestId);
      if (request) {
        await addDoc(collection(db, 'assignments'), {
          requestId,
          userId: request.userId,
          userName: request.userName,
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
    } catch (err) {
      return { success: false, error: 'Failed to approve request' };
    }
  };

  const rejectRequest = async (requestId: string, facilitatorId: string, reason: string) => {
    try {
      const now = new Date();
      await updateDoc(doc(db, 'assignmentRequests', requestId), {
        status: 'rejected',
        rejectedDate: now,
        rejectedBy: facilitatorId,
        rejectionReason: reason,
        updatedAt: now
      });

      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { 
              ...req, 
              status: 'rejected', 
              rejectedDate: now, 
              rejectedBy: facilitatorId, 
              rejectionReason: reason, 
              updatedAt: now 
            }
          : req
      ));
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Failed to reject request' };
    }
  };

  return {
    requests,
    loading,
    error,
    filter,
    setFilter,
    createRequest,
    approveRequest,
    rejectRequest,
    refresh: fetchRequests
  };
};

// ============================================================================
// useAvailableAssets - Get available assets
// ============================================================================
export const useAvailableAssets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const q = query(collection(db, 'assets'), where('status', '==', 'available'), orderBy('name'));
        const snapshot = await getDocs(q);
        setAssets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Asset[]);
        setError(null);
      } catch (err) {
        setError('Failed to fetch assets');
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  return { assets, loading, error };
};

// ============================================================================
// useUsers - Get all users
// ============================================================================
export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('name'));
        const snapshot = await getDocs(q);
        setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[]);
        setError(null);
      } catch (err) {
        setError('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return { users, loading, error };
};

// ============================================================================
// useAssignmentStats - Quick stats for dashboard
// ============================================================================
export const useAssignmentStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [pending, urgent, active, overdue, available] = await Promise.all([
          getDocs(query(collection(db, 'assignmentRequests'), where('status', '==', 'pending'))),
          getDocs(query(collection(db, 'assignmentRequests'), where('status', '==', 'pending'), where('priority', '==', 'urgent'))),
          getDocs(query(collection(db, 'assignments'), where('status', '==', 'active'))),
          getDocs(query(collection(db, 'assignments'), where('status', '==', 'active'), where('expectedReturnDate', '<', new Date()))),
          getDocs(query(collection(db, 'assets'), where('status', '==', 'available')))
        ]);

        setStats({
          totalPending: pending.size,
          urgentRequests: urgent.size,
          activeAssignments: active.size,
          overdueReturns: overdue.size,
          availableAssets: available.size
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return { stats, loading };
};