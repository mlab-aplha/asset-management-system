import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { StudentForm } from '../components/student/StudentForm';
import { useStudents } from '../hooks/useStudents';
import { useAuth } from '../hooks/useAuth';
import { useStudentFacilitatorLink } from '../hooks/useStudentFacilitatorLink';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../backend-firebase/src/firebase/config';
import './StudentManagement.css';

export const StudentManagementPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterHub, setFilterHub] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterFacilitator, setFilterFacilitator] = useState('all');
  const [facilitators, setFacilitators] = useState<any[]>([]);
  const [selectedFacilitatorId, setSelectedFacilitatorId] = useState('');

  const { isAdmin } = useAuth();
  
  const {
    students,
    loading,
    error,
    createStudent,
    updateStudent,
    deleteStudent,
    loadStudents
  } = useStudents();

  const { getFacilitators, assignStudentToFacilitator } = useStudentFacilitatorLink();

  useEffect(() => {
    loadStudents();
    loadFacilitators();
  }, [refreshTrigger]);

  const loadFacilitators = async () => {
    const data = await getFacilitators();
    setFacilitators(data);
  };

  const handleCreateStudent = async (data: any) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const studentData = {
        ...data,
        uid: userCredential.user.uid,
        role: 'student',
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

  const handleUpdateStudent = async (id: string, data: any) => {
    const result = await updateStudent(id, data);
    if (result.success) {
      setIsEditModalOpen(false);
      setSelectedStudent(null);
      setRefreshTrigger(prev => prev + 1);
      alert('Student updated successfully!');
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (window.confirm('Delete this student?')) {
      const result = await deleteStudent(studentId);
      if (result.success) {
        setRefreshTrigger(prev => prev + 1);
        alert('Student deleted');
      }
    }
  };

  const handleViewStudent = (student: any) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  const handleEditStudent = (student: any) => {
    setSelectedStudent(student);
    setIsEditModalOpen(true);
  };

  const handleAssignClick = (student: any) => {
    setSelectedStudent(student);
    setSelectedFacilitatorId(student.facilitatorId || '');
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = async () => {
    if (!selectedStudent || !selectedFacilitatorId) {
      alert('Please select a facilitator');
      return;
    }
    const success = await assignStudentToFacilitator(selectedStudent.id, selectedFacilitatorId);
    if (success) {
      setIsAssignModalOpen(false);
      setSelectedStudent(null);
      setRefreshTrigger(prev => prev + 1);
      alert('Student assigned successfully!');
    }
  };

  const handleUnassignStudent = async (studentId: string) => {
    if (window.confirm('Unassign this student from facilitator?')) {
      const success = await assignStudentToFacilitator(studentId, '');
      if (success) {
        setRefreshTrigger(prev => prev + 1);
        alert('Student unassigned successfully!');
      }
    }
  };

  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = student.firstName?.toLowerCase().includes(searchLower) ||
      student.lastName?.toLowerCase().includes(searchLower) ||
      student.email?.toLowerCase().includes(searchLower) ||
      student.studentId?.toLowerCase().includes(searchLower);
    const matchesHub = filterHub === 'all' || student.hub === filterHub;
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    const matchesFacilitator = filterFacilitator === 'all' || 
      (filterFacilitator === 'unassigned' ? !student.facilitatorId : student.facilitatorId === filterFacilitator);
    return matchesSearch && matchesHub && matchesStatus && matchesFacilitator;
  });

  const hubs = ['Tshwane', 'Polokwane', 'Galeshewe'];
  const statuses = ['active', 'inactive', 'graduated', 'dropped'];

  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'active').length;
  const graduatedStudents = students.filter(s => s.status === 'graduated').length;
  const hubsCount = new Set(students.map(s => s.hub).filter(Boolean)).size;

  return (
    <DashboardLayout activePage="students">
      <div className="student-management-container">
        <div className="page-header">
          <div>
            <h1>Student Management</h1>
            <p>Manage all students across mLab hubs</p>
          </div>
          {isAdmin && <button className="add-button" onClick={() => setIsModalOpen(true)}>+ Add Student</button>}
        </div>

        <div className="stats-grid">
          <div className="stat-card"><div className="stat-value">{totalStudents}</div><div className="stat-label">TOTAL STUDENTS</div></div>
          <div className="stat-card"><div className="stat-value">{activeStudents}</div><div className="stat-label">ACTIVE</div></div>
          <div className="stat-card"><div className="stat-value">{graduatedStudents}</div><div className="stat-label">GRADUATED</div></div>
          <div className="stat-card"><div className="stat-value">{hubsCount}</div><div className="stat-label">HUBS</div></div>
        </div>

        <div className="search-filters-row">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search by name or ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="filters-group">
            <select value={filterHub} onChange={(e) => setFilterHub(e.target.value)}><option value="all">All Hubs</option>{hubs.map(hub => <option key={hub} value={hub}>{hub}</option>)}</select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}><option value="all">All Status</option>{statuses.map(status => <option key={status} value={status}>{status}</option>)}</select>
            <select value={filterFacilitator} onChange={(e) => setFilterFacilitator(e.target.value)}><option value="all">All Facilitators</option><option value="unassigned">Unassigned</option>{facilitators.map(fac => <option key={fac.id} value={fac.uid}>{fac.displayName}</option>)}</select>
          </div>
        </div>

        {loading ? <div>Loading...</div> : error ? <div>Error: {error}</div> : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>STUDENT ID</th>
                  <th>NAME</th>
                  <th>EMAIL</th>
                  <th>COURSE</th>
                  <th>COHORT</th>
                  <th>HUB</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => {
                  const facilitator = facilitators.find(f => f.uid === student.facilitatorId);
                  return (
                    <tr key={student.id}>
                      <td className="student-id">{student.studentId}</td>
                      <td>{student.firstName} {student.lastName}</td>
                      <td>{student.email}</td>
                      <td>{student.course || 'Web Development'}</td>
                      <td>{student.cohort || 'Cohort 1'}</td>
                      <td><span className={`hub-badge ${student.hub?.toLowerCase()}`}>{student.hub || 'Tshwane'}</span></td>
                      <td><span className={`status-badge ${student.status}`}>{student.status === 'active' ? 'Active' : student.status === 'graduated' ? 'Graduated' : student.status === 'inactive' ? 'Inactive' : 'Dropped'}</span></td>
                      <td className="action-buttons">
                        <button className="view-btn" onClick={() => handleViewStudent(student)}>View</button>
                        <button className="edit-btn" onClick={() => handleEditStudent(student)}>Edit</button>
                        {isAdmin && (
                          facilitator ? (
                            <button className="unassign-btn" onClick={() => handleUnassignStudent(student.id)}>Unassign</button>
                          ) : (
                            <button className="assign-btn" onClick={() => handleAssignClick(student)}>Assign</button>
                          )
                        )}
                        <button className="delete-btn" onClick={() => handleDeleteStudent(student.id)}>Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header"><h2>Add New Student</h2><button onClick={() => setIsModalOpen(false)}>×</button></div>
            <div className="modal-body"><StudentForm onSubmit={handleCreateStudent} onCancel={() => setIsModalOpen(false)} loading={loading} /></div>
          </div>
        </div>
      )}

      {/* View Student Modal */}
      {isViewModalOpen && selectedStudent && (
        <div className="modal-overlay">
          <div className="modal-content view-modal">
            <div className="modal-header"><h2>Student Details</h2><button onClick={() => setIsViewModalOpen(false)}>×</button></div>
            <div className="modal-body">
              <div className="student-details">
                <div><strong>Student ID:</strong> {selectedStudent.studentId}</div>
                <div><strong>Name:</strong> {selectedStudent.firstName} {selectedStudent.lastName}</div>
                <div><strong>Email:</strong> {selectedStudent.email}</div>
                <div><strong>Phone:</strong> {selectedStudent.phone || 'N/A'}</div>
                <div><strong>Course:</strong> {selectedStudent.course || 'Web Development'}</div>
                <div><strong>Cohort:</strong> {selectedStudent.cohort || 'Cohort 1'}</div>
                <div><strong>Hub:</strong> {selectedStudent.hub || 'Tshwane'}</div>
                <div><strong>Status:</strong> {selectedStudent.status}</div>
                <div><strong>Enrollment Date:</strong> {selectedStudent.enrollmentDate ? new Date(selectedStudent.enrollmentDate).toLocaleDateString() : 'N/A'}</div>
                <div><strong>Facilitator:</strong> {facilitators.find(f => f.uid === selectedStudent.facilitatorId)?.displayName || 'Unassigned'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {isEditModalOpen && selectedStudent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header"><h2>Edit Student</h2><button onClick={() => setIsEditModalOpen(false)}>×</button></div>
            <div className="modal-body"><StudentForm onSubmit={(data) => handleUpdateStudent(selectedStudent.id, data)} onCancel={() => setIsEditModalOpen(false)} loading={loading} initialData={selectedStudent} /></div>
          </div>
        </div>
      )}

      {/* Assign Student Modal */}
      {isAssignModalOpen && selectedStudent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header"><h2>Assign Student to Facilitator</h2><button onClick={() => setIsAssignModalOpen(false)}>×</button></div>
            <div className="modal-body">
              <div className="assign-form">
                <p>Assigning: <strong>{selectedStudent.firstName} {selectedStudent.lastName}</strong></p>
                <select className="facilitator-select" value={selectedFacilitatorId} onChange={(e) => setSelectedFacilitatorId(e.target.value)}>
                  <option value="">Select a facilitator</option>
                  {facilitators.map(fac => <option key={fac.id} value={fac.uid}>{fac.displayName} - {fac.department}</option>)}
                </select>
                <div className="modal-actions">
                  <button className="cancel-btn" onClick={() => setIsAssignModalOpen(false)}>Cancel</button>
                  <button className="assign-btn" onClick={handleAssignSubmit}>Assign</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
