import { Firestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

export class BaseService<T extends { id?: string }> {
  private db: Firestore;
  private collectionName: string;

  constructor(db: Firestore, collectionName: string) {
    this.db = db;
    this.collectionName = collectionName;
  }

  async getAll(): Promise<T[]> {
    const snapshot = await getDocs(collection(this.db, this.collectionName));
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as T));
  }

  async getById(id: string): Promise<T | null> {
    const docRef = doc(this.db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as T) : null;
  }

  async create(item: T): Promise<string> {
    const docRef = await addDoc(collection(this.db, this.collectionName), item);
    return docRef.id;
  }

  async update(id: string, item: Partial<T>): Promise<void> {
    const docRef = doc(this.db, this.collectionName, id);
    await updateDoc(docRef, item);
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(this.db, this.collectionName, id);
    await deleteDoc(docRef);
  }
}
