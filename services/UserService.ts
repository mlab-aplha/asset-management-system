import { BaseService, validateSouthAfricanPhone, validateMlabEmail } from './BaseService';
import { query, where, getDocs, QuerySnapshot, DocumentData, Query } from 'firebase/firestore';
import { auth } from '../backend-firebase/src/firebase/firebase/config';

export interface UserData {
  email: string;
  displayName: string;
  role: 'admin' | 'manager' | 'user';
  status: 'active' | 'inactive';
  department: string;
  phone: string; // South African format
  hub: 'Tshwane' | 'Polokwane' | 'Galeshewe';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type User = UserData & { id: string };

export class UserService extends BaseService<UserData> {
  constructor() {
    super('users');
  }

  // Get users by mLab hub
  async getUsersByHub(hub: 'Tshwane' | 'Polokwane' | 'Galeshewe'): Promise<User[]> {
    return this.queryByField('hub', hub);
  }

  // Get users by role
  async getUsersByRole(role: UserData['role']): Promise<User[]> {
    return this.queryByField('role', role);
  }

  // Get active users only
  async getActiveUsers(): Promise<User[]> {
    const q: Query<DocumentData> = query(this.getCollection(), where('isActive', '==', true));
    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as User));
  }

  // Update user with validation
  async updateUser(id: string, updates: Partial<UserData>): Promise<void> {
    // Validate South African phone
    if (updates.phone && !validateSouthAfricanPhone(updates.phone)) {
      throw new Error('Invalid South African phone number format');
    }

    // Validate mLab email
    if (updates.email && !validateMlabEmail(updates.email)) {
      throw new Error('Email must be from mLab domain');
    }

    await super.update(id, {
      ...updates,
      updatedAt: new Date()
    });
  }

  // Deactivate user (soft delete)
  async deactivateUser(id: string): Promise<void> {
    await this.updateUser(id, {
      isActive: false,
      status: 'inactive'
    });
  }

  // Get user statistics per hub
  async getUserStats() {
    const allUsers = await this.getAll();
    
    return {
      Tshwane: this.calculateUserStats(allUsers, 'Tshwane'),
      Polokwane: this.calculateUserStats(allUsers, 'Polokwane'),
      Galeshewe: this.calculateUserStats(allUsers, 'Galeshewe'),
      total: allUsers.length,
      active: allUsers.filter(u => u.isActive).length,
      admins: allUsers.filter(u => u.role === 'admin').length,
      managers: allUsers.filter(u => u.role === 'manager').length
    };
  }

  private calculateUserStats(users: User[], hub: string) {
    const hubUsers = users.filter(u => u.hub === hub);
    return {
      total: hubUsers.length,
      active: hubUsers.filter(u => u.isActive).length,
      admins: hubUsers.filter(u => u.role === 'admin').length,
      managers: hubUsers.filter(u => u.role === 'manager').length
    };
  }

  // Get current user from auth
  async getCurrentUser(): Promise<User | null> {
    const user = auth.currentUser;
    if (!user) return null;

    return this.getById(user.uid);
  }
}

// Export singleton instance
export const userService = new UserService();
