import { getDocs, collection, Firestore } from "firebase/firestore";

export class DashboardService {
  private db: Firestore;

  constructor(db: Firestore) {
    this.db = db;
  }

  async getTotalUsers(): Promise<number> {
    const snapshot = await getDocs(collection(this.db, "users"));
    return snapshot.size;
  }

  async getTotalAssets(): Promise<number> {
    const snapshot = await getDocs(collection(this.db, "assets"));
    return snapshot.size;
  }

  async getTotalLocations(): Promise<number> {
    const snapshot = await getDocs(collection(this.db, "locations"));
    return snapshot.size;
  }
}
