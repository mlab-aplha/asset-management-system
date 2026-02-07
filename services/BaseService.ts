import { db } from '../backend-firebase/src/firebase/firebase/config';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Query,
  DocumentData,
  QuerySnapshot,
  DocumentSnapshot
} from 'firebase/firestore';

export abstract class BaseService<T extends DocumentData> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  protected getCollection() {
    return collection(db, this.collectionName);
  }

  protected getDocRef(id: string) {
    return doc(db, this.collectionName, id);
  }

  async getAll(): Promise<(T & { id: string })[]> {
    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(this.getCollection());
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as T & { id: string }));
  }

  async getById(id: string): Promise<(T & { id: string }) | null> {
    const docRef = this.getDocRef(id);
    const docSnap: DocumentSnapshot<DocumentData> = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as T & { id: string } : null;
  }

  async create(data: Omit<T, 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(this.getCollection(), {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return docRef.id;
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    const docRef = this.getDocRef(id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date()
    });
  }

  async delete(id: string): Promise<void> {
    const docRef = this.getDocRef(id);
    await deleteDoc(docRef);
  }

  async queryByField(field: string, value: any): Promise<(T & { id: string })[]> {
    const q: Query<DocumentData> = query(this.getCollection(), where(field, '==', value));
    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as T & { id: string }));
  }
}

// South Africa specific validators
export const validateSouthAfricanPhone = (phone: string): boolean => {
  const saPhoneRegex = /^(\+27|0)[1-9][0-9]{8}$/;
  const cleanPhone = phone.replace(/\s+/g, '');
  return saPhoneRegex.test(cleanPhone);
};

export const validateMlabEmail = (email: string): boolean => {
  return email.endsWith('@mlab.co.za') || email.endsWith('@mlab.org.za');
};

export const formatZAR = (amount: number): string => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR'
  }).format(amount);
};

export const isValidLocation = (location: string): boolean => {
  const validLocations = ['Tshwane', 'Polokwane', 'Galeshewe'] as const;
  return validLocations.includes(location as any);
};
