import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../hooks/useAuth';
import { useStudents } from '../../hooks/useStudents';
import { useStudentFacilitatorLink } from '../../hooks/useStudentFacilitatorLink';
import './StudentDashboard.css';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { students, loading, error, loadStudents } = useStudents();
  const { getFacilitators } = useStudentFacilitatorLink();
  const [student, setStudent] = useState<any>(null);
  const [facilitator, setFacilitator] = useState<any>(null);
  const [facilitators, setFacilitators] = useState<any[]>([]);

  useEffect(() => {
    loadStudents();
    loadFacilitators();
  }, []);

  useEffect(() => {
    if (students.length > 0 && user?.email) {
      const currentStudent = students.find(s => s.email === user.email);
      setStudent(currentStudent);
    }
  }, [students, user]);

  useEffect(() => {
    if (student?.facilitatorId && facilitators.length > 0) {
      const fac = facilitators.find(f => f.uid === student.facilitatorId);
      setFacilitator(fac);
    }
  }, [student, facilitators]);

  const loadFacilitators = async () => {
    const data = await getFacilitators();
    setFacilitators(data);
  };

  if (loading) {
    return (
      <DashboardLayout activePage="student-dashboard">
        <div className="loading-state">Loading your dashboard...</div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout activePage="student-dashboard">
        <div className="error-state">Error: {error}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activePage="student-dashboard">
      <div className="student-dashboard-container">
        {/* Welcome Section */}
        <div className="welcome-section">
          <h1>Welcome back, {student?.firstName || 'Student'}!</h1>
          <p>Here's your personal dashboard overview</p>
        </div>

        {/* Student Info Cards */}
        <div className="info-grid">
          <div className="info-card">
            <div className="info-icon">🎓</div>
            <div className="info-content">
              <div className="info-label">Student ID</div>
              <div className="info-value">{student?.studentId || 'N/A'}</div>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon"></div>
            <div className="info-content">
              <div className="info-label">Email</div>
              <div className="info-value">{student?.email || user?.email || 'N/A'}</div>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon"></div>
            <div className="info-content">
              <div className="info-label">Course</div>
              <div className="info-value">{student?.course || 'Not Assigned'}</div>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon"></div>
            <div className="info-content">
              <div className="info-label">Hub</div>
              <div className="info-value">{student?.hub || 'Not Assigned'}</div>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon"></div>
            <div className="info-content">
              <div className="info-label">Cohort</div>
              <div className="info-value">{student?.cohort || 'Not Assigned'}</div>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon"></div>
            <div className="info-content">
              <div className="info-label">Facilitator</div>
              <div className="info-value">{facilitator?.displayName || 'Not Assigned'}</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon"></div>
            <div className="stat-value">0</div>
            <div className="stat-label">Assets Checked Out</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"></div>
            <div className="stat-value">0</div>
            <div className="stat-label">Pending Requests</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"></div>
            <div className="stat-value">0</div>
            <div className="stat-label">Total Requests</div>
          </div>
        </div>

        {/* Current Assets Section */}
        <div className="assets-section">
          <div className="section-header">
            <h2>My Current Assets</h2>
            <span className="asset-count">0 items</span>
          </div>
          <div className="empty-state">
            <p>No assets assigned to you yet.</p>
            <p className="text-muted">Contact your facilitator for asset allocation.</p>
          </div>
        </div>

        {/* Recent Requests Section */}
        <div className="requests-section">
          <div className="section-header">
            <h2>Recent Requests</h2>
            <span className="asset-count">0 requests</span>
          </div>
          <div className="empty-state">
            <p>You haven't made any requests yet.</p>
            <p className="text-muted">Request assets from your facilitator.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
