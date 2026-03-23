// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { AssetRegistryPage } from './pages/AssetRegistry/AssetRegistryPage';
import { AssetDetailPage } from './pages/AssetDetail/AssetDetailPage';
import { UserManagementPage } from './pages/UserManagement/UserManagementPage';
import { LocationManagementPage } from './pages/LocationManagement/LocationManagementPage';
import { FacilitatorDashboardPage } from './pages/FacilitatorDashboard/FacilitatorDashboardPage';
import { AdminRequestsPage } from './pages/AdminRequestsPage/AdminRequestsPage';
import { FacilitatorRequestsPage } from './pages/FacilitatorRequestsPage/FacilitatorRequestsPage';
import { AssetRequestsPage } from './pages/AssetRequests/AssetRequestsPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { FacilitatorAssetRegistryPage } from './pages/FacilitatorAssetRegistry/FacilitatorAssetRegistryPage';
import { StudentManagementPage } from './pages/StudentManagement';
import { StudentDashboard } from './pages/student/StudentDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Admin only routes */}
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><DashboardPage /></ProtectedRoute>} />
        <Route path="/admin/requests" element={<ProtectedRoute allowedRoles={['admin']}><AdminRequestsPage /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute allowedRoles={['admin']}><UserManagementPage /></ProtectedRoute>} />
        <Route path="/students" element={<ProtectedRoute allowedRoles={['admin', 'facilitator']}><StudentManagementPage /></ProtectedRoute>} />
        <Route path="/locations" element={<ProtectedRoute allowedRoles={['admin']}><LocationManagementPage /></ProtectedRoute>} />

        {/* Facilitator only routes */}
        <Route path="/facilitator/dashboard" element={<ProtectedRoute allowedRoles={['facilitator']}><FacilitatorDashboardPage /></ProtectedRoute>} />
        <Route path="/facilitator/requests" element={<ProtectedRoute allowedRoles={['facilitator']}><FacilitatorRequestsPage /></ProtectedRoute>} />
        <Route path="/facilitator/assets" element={<ProtectedRoute allowedRoles={['facilitator']}><FacilitatorAssetRegistryPage /></ProtectedRoute>} />

        {/* Student routes */}
        <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />

        {/* Shared routes */}
        <Route path="/assets" element={<ProtectedRoute allowedRoles={['admin', 'facilitator', 'student']}><AssetRegistryPage /></ProtectedRoute>} />
        <Route path="/assets/:id" element={<ProtectedRoute allowedRoles={['admin', 'facilitator']}><AssetDetailPage /></ProtectedRoute>} />
        <Route path="/asset-requests" element={<ProtectedRoute allowedRoles={['admin', 'facilitator', 'student']}><AssetRequestsPage /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
