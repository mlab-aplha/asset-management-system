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
  startAfter,
  QueryConstraint,
  DocumentData,
  QuerySnapshot,
  DocumentSnapshot,
  Timestamp
} from 'firebase/firestore';

// Base interface for all documents
export interface BaseDocument {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

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

  // Convert Firestore data to typed object
  protected convertToTypedObject(docSnap: DocumentSnapshot<DocumentData>): (T & BaseDocument) | null {
    if (!docSnap.exists()) return null;
    
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...this.convertTimestamps(data),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    } as T & BaseDocument;
  }

  // Convert Firestore Timestamps to Dates
  protected convertTimestamps(data: any): any {
    if (!data) return data;
    
    const result = { ...data };
    Object.keys(result).forEach(key => {
      const value = result[key];
      
      if (value instanceof Timestamp) {
        result[key] = value.toDate();
      } else if (value && typeof value === 'object' && value.toDate && typeof value.toDate === 'function') {
        result[key] = value.toDate();
      } else if (Array.isArray(value)) {
        result[key] = value.map(item => this.convertTimestamps(item));
      } else if (value && typeof value === 'object') {
        result[key] = this.convertTimestamps(value);
      }
    });
    
    return result;
  }

  async getAll(): Promise<(T & BaseDocument)[]> {
    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(this.getCollection());
    const results: (T & BaseDocument)[] = [];
    
    querySnapshot.forEach(doc => {
      const typedDoc = this.convertToTypedObject(doc);
      if (typedDoc) {
        results.push(typedDoc);
      }
    });
    
    return results;
  }

  async getById(id: string): Promise<(T & BaseDocument) | null> {
    const docRef = this.getDocRef(id);
    const docSnap: DocumentSnapshot<DocumentData> = await getDoc(docRef);
    return this.convertToTypedObject(docSnap);
  }

  async create(data: Omit<T, keyof BaseDocument>): Promise<string> {
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

  async queryByField(field: string, value: any): Promise<(T & BaseDocument)[]> {
    const q = query(this.getCollection(), where(field, '==', value));
    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);
    const results: (T & BaseDocument)[] = [];
    
    querySnapshot.forEach(doc => {
      const typedDoc = this.convertToTypedObject(doc);
      if (typedDoc) {
        results.push(typedDoc);
      }
    });
    
    return results;
  }

  async queryMultiple(filters: { field: string; value: any; operator?: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'in' | 'not-in' | 'array-contains' }[]): Promise<(T & BaseDocument)[]> {
    const constraints: QueryConstraint[] = filters.map(filter => 
      where(filter.field, filter.operator || '==', filter.value)
    );
    
    const q = query(this.getCollection(), ...constraints);
    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);
    const results: (T & BaseDocument)[] = [];
    
    querySnapshot.forEach(doc => {
      const typedDoc = this.convertToTypedObject(doc);
      if (typedDoc) {
        results.push(typedDoc);
      }
    });
    
    return results;
  }

  async queryWithOrder(field: string, direction: 'asc' | 'desc' = 'asc', limitCount?: number): Promise<(T & BaseDocument)[]> {
    const constraints: QueryConstraint[] = [orderBy(field, direction)];
    
    if (limitCount) {
      constraints.push(limit(limitCount));
    }
    
    const q = query(this.getCollection(), ...constraints);
    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);
    const results: (T & BaseDocument)[] = [];
    
    querySnapshot.forEach(doc => {
      const typedDoc = this.convertToTypedObject(doc);
      if (typedDoc) {
        results.push(typedDoc);
      }
    });
    
    return results;
  }

  async exists(id: string): Promise<boolean> {
    const docRef = this.getDocRef(id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  }

  async count(): Promise<number> {
    const querySnapshot = await getDocs(this.getCollection());
    return querySnapshot.size;
  }

  async countByField(field: string, value: any): Promise<number> {
    const items = await this.queryByField(field, value);
    return items.length;
  }

  // Pagination
  async paginate(limitCount: number, lastDoc?: DocumentSnapshot): Promise<{
    items: (T & BaseDocument)[];
    lastVisible: DocumentSnapshot | null;
    hasMore: boolean;
  }> {
    const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc'), limit(limitCount)];
    
    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }
    
    const q = query(this.getCollection(), ...constraints);
    const querySnapshot = await getDocs(q);
    
    const items: (T & BaseDocument)[] = [];
    querySnapshot.forEach(doc => {
      const typedDoc = this.convertToTypedObject(doc);
      if (typedDoc) {
        items.push(typedDoc);
      }
    });
    
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
    const hasMore = items.length === limitCount;
    
    return {
      items,
      lastVisible,
      hasMore
    };
  }

  // Batch operations
  async createBatch(items: Omit<T, keyof BaseDocument>[]): Promise<string[]> {
    const ids: string[] = [];
    
    for (const item of items) {
      const id = await this.create(item);
      ids.push(id);
    }
    
    return ids;
  }

  async updateBatch(updates: { id: string; data: Partial<T> }[]): Promise<void> {
    for (const update of updates) {
      await this.update(update.id, update.data);
    }
  }

  async deleteBatch(ids: string[]): Promise<void> {
    for (const id of ids) {
      await this.delete(id);
    }
  }
}

// South Africa specific validators
export const validateSouthAfricanPhone = (phone: string): { isValid: boolean; formatted?: string; message?: string } => {
  const saPhoneRegex = /^(\+27|0)[1-9][0-9]{8}$/;
  const cleanPhone = phone.replace(/[\s\-()]/g, '');
  
  if (!saPhoneRegex.test(cleanPhone)) {
    return { 
      isValid: false, 
      message: 'Invalid South African phone number. Use format: +27 82 123 4567 or 082 123 4567' 
    };
  }

  // Format to standard +27 format
  let formatted = cleanPhone;
  if (cleanPhone.startsWith('0')) {
    formatted = '+27' + cleanPhone.substring(1);
  }

  return { 
    isValid: true, 
    formatted 
  };
};

export const validateMlabEmail = (email: string): { isValid: boolean; message?: string } => {
  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Invalid email format' };
  }

  const validDomains = ['mlab.co.za', 'mlab.org.za'];
  const domain = email.split('@')[1];
  
  if (!validDomains.includes(domain)) {
    return { 
      isValid: false, 
      message: `Email must be from mLab domain (@${validDomains.join(' or @')})` 
    };
  }

  return { isValid: true };
};

export const formatZAR = (amount: number): string => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return 'R 0.00';
  }
  
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const parseZAR = (amountString: string): number => {
  // Remove currency symbols and spaces
  const cleaned = amountString.replace(/[R\s,]/g, '');
  return parseFloat(cleaned) || 0;
};

export const isValidLocation = (location: string): boolean => {
  const validLocations = ['Tshwane', 'Polokwane', 'Galeshewe'] as const;
  return validLocations.includes(location as any);
};

export const getLocationType = (location: string): 'hq' | 'hub' | 'unknown' => {
  if (location === 'Tshwane') return 'hq';
  if (location === 'Polokwane' || location === 'Galeshewe') return 'hub';
  return 'unknown';
};

export const validateSouthAfricanID = (id: string): { isValid: boolean; message?: string } => {
  // Basic South African ID validation (13 digits, valid date, checksum)
  if (!id || id.length !== 13 || !/^\d+$/.test(id)) {
    return { isValid: false, message: 'South African ID must be 13 digits' };
  }

  // Extract birth date (YYMMDD)
  const year = parseInt(id.substring(0, 2));
  const month = parseInt(id.substring(2, 4));
  const day = parseInt(id.substring(4, 6));

  // Validate date (simplified check)
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return { isValid: false, message: 'Invalid date in ID number' };
  }

  // Luhn algorithm check (simplified)
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    let digit = parseInt(id.charAt(i));
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }

  const checksum = (10 - (sum % 10)) % 10;
  const lastDigit = parseInt(id.charAt(12));

  if (checksum !== lastDigit) {
    return { isValid: false, message: 'Invalid ID checksum' };
  }

  return { isValid: true };
};

// Utility to format date for South Africa
export const formatSADate = (date: Date): string => {
  return date.toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
};

// Utility to get South Africa timezone
export const getSATimezone = (): string => {
  return 'Africa/Johannesburg';
};