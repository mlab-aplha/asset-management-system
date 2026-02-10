import {
    collection,
    query,
    orderBy,
    getDocs
} from 'firebase/firestore';
import { db } from '../../backend-firebase/src/firebase/config';

export interface User {
    id?: string;
    email: string;
    displayName: string;
    role: 'admin' | 'manager' | 'user';
    status: 'active' | 'inactive';
    department?: string;
    phone?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface ServiceResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
}

export class UserService {
    private static collectionName = 'users';

    static async getUsers(): Promise<ServiceResponse<User[]>> {
        try {
            const usersRef = collection(db, this.collectionName);
            const q = query(usersRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);

            const users = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as User[];

            return { success: true, data: users };
        } catch (error: unknown) {
            console.error('Error fetching users:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch users';
            return { success: false, message: errorMessage };
        }
    }
}

export default UserService;