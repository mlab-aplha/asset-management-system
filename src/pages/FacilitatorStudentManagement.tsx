import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useStudents } from '../hooks/useStudents';
import { useAuth } from '../hooks/useAuth';
import { StudentForm } from '../components/student/StudentForm';
import { EditStudentForm } from '../components/student/EditStudentForm';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../backend-firebase/src/firebase/config';
import './StudentManagement.css';

interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  course: string;
  cohort: string;
  hub: string;
  status: string;
}

export const FacilitatorStudentManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const { user } = useAuth();
  
  const {
    students,
    loading,
    error,
    createStudent,
    updateStudent,
    deleteStudent,
    loadStudents
  } = useStudents();

  const facilitatorHub: string = (user as any)?.assignedHubIds?.[0] || (user as any)?.primaryLocationId || '';

  useEffect(() => {
    loadStudents();
  }, [refreshTrigger, loadStudents]);

  const filteredStudents: Student[] = students.filter((student: Student) => {
    const matchesHub = student.hub === facilitatorHub;
    const matchesSearch = searchTerm === '' ||
      student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === '' || student.status === filterStatus;
    
    return matchesHub && matchesSearch && matchesStatus;
  });

  const handleCreateStudent = async (data: any): Promise<void> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      
      const studentData = {
        ...data,
        uid: userCredential.user.uid,
        role: 'student',
        hub: facilitatorHub,
        facilitatorId: user?.uid,
        studentId: data.studentId || `STU-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await createStudent(studentData);
      
      if (result.success) {
        setIsModalOpen(false);
        setRefreshTrigger(prev => prev + 1);
        alert(`Student created!\nEmail: ${data.email}\nPassword: ${data.password}`);
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handleUpdateStudent = async (id: string, data: any): Promise<void> => {
    const result = await updateStudent(id, data);
    if (result.success) {
      setIsEditModalOpen(false);
      setEditingStudent(null);
      setRefreshTrigger(prev => prev + 1);
      alert('Student updated successfully!');
    } else {
      alert('Failed to update student');
    }
  };

  const handleDeleteStudent = async (studentId: string): Promise<void> => {
    if (window.confirm('Delete this student?')) {
      const result = await deleteStudent(studentId);
      if (result.success) {
        setRefreshTrigger(prev => prev + 1);
        alert('Student deleted');
      }
    }
  };

  const handleViewStudent = (student: Student): void => {
    alert(`Student Details:\nName: ${student.firstName} ${student.lastName}\nEmail: ${student.email}\nCourse: ${student.course}\nCohort: ${student.cohort}\nHub: ${student.hub}\nStatus: ${student.status}`);
  };

  const stats = {
    total: filteredStudents.length,
    active: filteredStudents.filter((s: Student) => s.status === 'active').length,
    graduated: filteredStudents.filter((s: Student) => s.status === 'graduated').length,
  };

  return (
    <DashboardLayout activePage="my-students">
      <div className="student-management-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">My Students</h1>
            <p className="page-subtitle">Manage students in your hub: {facilitatorHub || 'Not assigned'}</p>
          </div>
          <button className="add-button" onClick={() => setIsModalOpen(true)}>
            + Add Student
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">TOTAL STUDENTS</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">ACTIVE</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.graduated}</div>
            <div className="stat-label">GRADUATED</div>
          </div>
        </div>

        <div className="search-filters-row">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filters-group">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="graduated">Graduated</option>
              <option value="dropped">Dropped</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading...</div>
        ) : error ? (
          <div className="error-state">Error: {error}</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>STUDENT ID</th>
                  <th>NAME</th>
                  <th>EMAIL</th>
                  <th>COURSE</th>
                  <th>COHORT</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student: Student) => (
                  <tr key={student.id}>
                    <td className="student-id">{student.studentId}</td>
                    <td>{student.firstName} {student.lastName}</td>
                    <td>{student.email}</td>
                    <td>{student.course || 'Web Development'}</td>
                    <td>{student.cohort || 'Cohort 1'}</td>
                    <td>
                      <span className={`status-badge ${student.status}`}>
                        {student.status === 'active' ? 'Active' : 
                         student.status === 'graduated' ? 'Graduated' : 
                         student.status === 'inactive' ? 'Inactive' : 'Dropped'}
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button className="view-btn" onClick={() => handleViewStudent(student)}>View</button>
                      <button className="edit-btn" onClick={() => {
                        setEditingStudent(student);
                        setIsEditModalOpen(true);
                      }}>Edit</button>
                      <button className="delete-btn" onClick={() => handleDeleteStudent(student.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={7} className="empty-state">No students found in your hub</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Student</h2>
              <button onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <StudentForm
                onSubmit={handleCreateStudent}
                onCancel={() => setIsModalOpen(false)}
                loading={loading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {isEditModalOpen && editingStudent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Student</h2>
              <button onClick={() => setIsEditModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <EditStudentForm
                student={editingStudent}
                onSubmit={handleUpdateStudent}
                onCancel={() => setIsEditModalOpen(false)}
                loading={loading}
              />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
