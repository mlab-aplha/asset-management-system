export interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  course: string;
  cohort: string;
  hub: 'Tshwane' | 'Polokwane' | 'Galeshewe';
  status: 'active' | 'inactive' | 'graduated' | 'dropped';
  enrollmentDate: Date;
  facilitatorId?: string;
  uid?: string; // Firebase Auth UID
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentFormData {
  firstName: string;
  lastName: string;
  email: string;
  studentId?: string;
  phone?: string;
  course: string;
  cohort: string;
  hub: 'Tshwane' | 'Polokwane' | 'Galeshewe';
  status: 'active' | 'inactive' | 'graduated' | 'dropped';
  enrollmentDate: Date;
  facilitatorId?: string;
  password?: string;
  uid?: string;
}

export interface StudentFilters {
  search?: string;
  hub?: string;
  course?: string;
  cohort?: string;
  status?: string;
} 
export interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  course: string;
  cohort: string;
  hub: 'Tshwane' | 'Polokwane' | 'Galeshewe';
  status: 'active' | 'inactive' | 'graduated' | 'dropped';
  enrollmentDate: Date;
  facilitatorId?: string;
  uid?: string; // Firebase Auth UID
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentFormData {
  firstName: string;
  lastName: string;
  email: string;
  studentId?: string;
  phone?: string;
  course: string;
  cohort: string;
  hub: 'Tshwane' | 'Polokwane' | 'Galeshewe';
  status: 'active' | 'inactive' | 'graduated' | 'dropped';
  enrollmentDate: Date;
  facilitatorId?: string;
  password?: string;
  uid?: string;
}

export interface StudentFilters {
  search?: string;
  hub?: string;
  course?: string;
  cohort?: string;
  status?: string;
}
