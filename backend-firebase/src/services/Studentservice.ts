// backend-firebase/src/services/StudentService.ts
// Matches Firestore `students` collection schema exactly.

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
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { AuthService } from './AuthService';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Student {
    id: string;
    uid: string;
    studentId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: 'student';
    status: 'active' | 'inactive';
    hub: string;           // Location name e.g. "Polokwane"
    cohort?: string;       // e.g. "Cohort 2"
    course?: string;       // e.g. "UI/UX Design"
    enrollmentDate?: string;
    password?: string;     // Only used during creation — never read back
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateStudentInput {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    hub: string;
    cohort?: string;
    course?: string;
    enrollmentDate?: string;
    studentId?: string;    // Auto-generated if omitted
}

export interface UpdateStudentInput {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    hub?: string;
    cohort?: string;
    course?: string;
    enrollmentDate?: string;
    status?: 'active' | 'inactive';
}

export interface StudentFilters {
    hub?: string;
    cohort?: string;
    course?: string;
    status?: 'active' | 'inactive';
    searchTerm?: string;
}

interface ServiceResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const COLLECTION = 'students';

function mapDoc(d: { id: string; data: () => Record<string, unknown> }): Student {
    const raw = d.data();
    const toDate = (v: unknown): Date =>
        v instanceof Timestamp ? v.toDate() : v instanceof Date ? v : new Date();

    return {
        id: d.id,
        uid: (raw.uid as string) || '',
        studentId: (raw.studentId as string) || '',
        firstName: (raw.firstName as string) || '',
        lastName: (raw.lastName as string) || '',
        email: (raw.email as string) || '',
        phone: raw.phone as string | undefined,
        role: 'student',
        status: (raw.status as 'active' | 'inactive') || 'active',
        hub: (raw.hub as string) || '',
        cohort: raw.cohort as string | undefined,
        course: raw.course as string | undefined,
        enrollmentDate: raw.enrollmentDate as string | undefined,
        createdAt: toDate(raw.createdAt),
        updatedAt: toDate(raw.updatedAt),
    };
}

// ─── StudentService ───────────────────────────────────────────────────────────

export class StudentService {
    // ── Read ──────────────────────────────────────────────────────────────────

    static async getAll(filters?: StudentFilters): Promise<Student[]> {
        try {
            const ref = collection(db, COLLECTION);
            let q = query(ref, orderBy('createdAt', 'desc'));

            if (filters?.hub) q = query(q, where('hub', '==', filters.hub));
            if (filters?.cohort) q = query(q, where('cohort', '==', filters.cohort));
            if (filters?.course) q = query(q, where('course', '==', filters.course));
            if (filters?.status) q = query(q, where('status', '==', filters.status));

            const snap = await getDocs(q);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let students = snap.docs.map((d) => mapDoc(d as any));

            if (filters?.searchTerm) {
                const term = filters.searchTerm.toLowerCase();
                students = students.filter(
                    (s) =>
                        s.firstName.toLowerCase().includes(term) ||
                        s.lastName.toLowerCase().includes(term) ||
                        s.email.toLowerCase().includes(term) ||
                        s.studentId.toLowerCase().includes(term),
                );
            }

            return students;
        } catch (err) {
            console.error('[StudentService.getAll]', err);
            return [];
        }
    }

    static async getById(id: string): Promise<Student | null> {
        try {
            const snap = await getDoc(doc(db, COLLECTION, id));
            if (!snap.exists()) return null;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return mapDoc(snap as any);
        } catch {
            return null;
        }
    }

    static async getByUid(uid: string): Promise<Student | null> {
        try {
            const q = query(collection(db, COLLECTION), where('uid', '==', uid));
            const snap = await getDocs(q);
            if (snap.empty) return null;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return mapDoc(snap.docs[0] as any);
        } catch {
            return null;
        }
    }

    static async getByHub(hub: string): Promise<Student[]> {
        return StudentService.getAll({ hub });
    }

    // ── Write ─────────────────────────────────────────────────────────────────

    static async create(input: CreateStudentInput): Promise<ServiceResponse<Student>> {
        try {
            // 1. Create Firebase Auth account
            const authRes = await AuthService.register({
                email: input.email,
                password: input.password,
                displayName: `${input.firstName} ${input.lastName}`,
            });

            if (!authRes.success || !authRes.user) {
                return { success: false, error: authRes.message || 'Failed to create auth account' };
            }

            // 2. Generate student ID if not provided
            const studentId =
                input.studentId ||
                `stud-${String(Math.floor(Math.random() * 9000) + 1000)}`;

            // 3. Write to Firestore
            const payload = {
                uid: authRes.user.uid,
                studentId,
                firstName: input.firstName,
                lastName: input.lastName,
                email: input.email,
                phone: input.phone || '',
                role: 'student' as const,
                status: 'active' as const,
                hub: input.hub,
                cohort: input.cohort || '',
                course: input.course || '',
                enrollmentDate: input.enrollmentDate || new Date().toISOString().split('T')[0],
                password: input.password, // stored per your existing schema
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            const ref = await addDoc(collection(db, COLLECTION), payload);
            const created = await StudentService.getById(ref.id);

            return { success: true, data: created!, message: 'Student created successfully' };
        } catch (err) {
            console.error('[StudentService.create]', err);
            return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
        }
    }

    static async update(id: string, updates: UpdateStudentInput): Promise<ServiceResponse<Student>> {
        try {
            const ref = doc(db, COLLECTION, id);
            const snap = await getDoc(ref);
            if (!snap.exists()) return { success: false, error: 'Student not found' };

            await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
            const updated = await StudentService.getById(id);
            return { success: true, data: updated!, message: 'Student updated' };
        } catch (err) {
            console.error('[StudentService.update]', err);
            return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
        }
    }

    static async toggleStatus(id: string): Promise<ServiceResponse<Student>> {
        try {
            const student = await StudentService.getById(id);
            if (!student) return { success: false, error: 'Student not found' };
            const newStatus = student.status === 'active' ? 'inactive' : 'active';
            return StudentService.update(id, { status: newStatus });
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
        }
    }

    static async delete(id: string): Promise<ServiceResponse> {
        try {
            await deleteDoc(doc(db, COLLECTION, id));
            return { success: true, message: 'Student deleted' };
        } catch (err) {
            return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
        }
    }

    // ── Stats ─────────────────────────────────────────────────────────────────

    static async getStats(hub?: string): Promise<{
        total: number;
        active: number;
        inactive: number;
        byHub: Record<string, number>;
        byCohort: Record<string, number>;
        byCourse: Record<string, number>;
    }> {
        const students = await StudentService.getAll(hub ? { hub } : undefined);
        const byHub: Record<string, number> = {};
        const byCohort: Record<string, number> = {};
        const byCourse: Record<string, number> = {};

        for (const s of students) {
            byHub[s.hub] = (byHub[s.hub] || 0) + 1;
            if (s.cohort) byCohort[s.cohort] = (byCohort[s.cohort] || 0) + 1;
            if (s.course) byCourse[s.course] = (byCourse[s.course] || 0) + 1;
        }

        return {
            total: students.length,
            active: students.filter((s) => s.status === 'active').length,
            inactive: students.filter((s) => s.status === 'inactive').length,
            byHub,
            byCohort,
            byCourse,
        };
    }
}

export const studentService = new (class {
    getAll = StudentService.getAll.bind(StudentService);
    getById = StudentService.getById.bind(StudentService);
    getByUid = StudentService.getByUid.bind(StudentService);
    getByHub = StudentService.getByHub.bind(StudentService);
    create = StudentService.create.bind(StudentService);
    update = StudentService.update.bind(StudentService);
    toggleStatus = StudentService.toggleStatus.bind(StudentService);
    delete = StudentService.delete.bind(StudentService);
    getStats = StudentService.getStats.bind(StudentService);
})();