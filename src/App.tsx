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
import { FacilitatorAssetRegistryPage } from './pages/FacilitatorAssetRegistry/FacilitatorAssetRegistryPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ManagerDashboardPage } from './pages/Managerdashboardpage/Managerdashboardpage';
import { ITDashboardPage } from './pages/Itdashboardpage/Itdashboardpage';
import { StudentDashboardPage } from './pages/Studentdashboardpage/Studentdashboardpage';
import { AssetPortalPage } from './pages/Assetportalpage/Assetportalpage';
import { MaintenancePage } from './pages/Maintenancepage/Maintenancepage';
import './App.css';

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Super Admin only */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/requests" element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <AdminRequestsPage />
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <UserManagementPage />
          </ProtectedRoute>
        } />
        <Route path="/locations" element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <LocationManagementPage />
          </ProtectedRoute>
        } />

        {/* Hub Manager */}
        <Route path="/manager/dashboard" element={
          <ProtectedRoute allowedRoles={['hub_manager']}>
            <ManagerDashboardPage />
          </ProtectedRoute>
        } />

        {/* IT */}
        <Route path="/it/dashboard" element={
          <ProtectedRoute allowedRoles={['it']}>
            <ITDashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/it/maintenance" element={
          <ProtectedRoute allowedRoles={['it', 'super_admin']}>
            <MaintenancePage />
          </ProtectedRoute>
        } />

        {/* Student */}
        <Route path="/student/dashboard" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboardPage />
          </ProtectedRoute>
        } />

        {/* Asset Facilitator */}
        <Route path="/facilitator/dashboard" element={
          <ProtectedRoute allowedRoles={['asset_facilitator']}>
            <FacilitatorDashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/facilitator/requests" element={
          <ProtectedRoute allowedRoles={['asset_facilitator']}>
            <FacilitatorRequestsPage />
          </ProtectedRoute>
        } />
        <Route path="/facilitator/assets" element={
          <ProtectedRoute allowedRoles={['asset_facilitator']}>
            <FacilitatorAssetRegistryPage />
          </ProtectedRoute>
        } />

        {/* Asset Portal — all roles */}
        <Route path="/asset-portal" element={
          <ProtectedRoute allowedRoles={['super_admin', 'hub_manager', 'it', 'asset_facilitator', 'student']}>
            <AssetPortalPage />
          </ProtectedRoute>
        } />

        {/* Shared */}
        <Route path="/assets" element={
          <ProtectedRoute allowedRoles={['super_admin', 'asset_facilitator']}>
            <AssetRegistryPage />
          </ProtectedRoute>
        } />
        <Route path="/assets/:id" element={
          <ProtectedRoute allowedRoles={['super_admin', 'asset_facilitator']}>
            <AssetDetailPage />
          </ProtectedRoute>
        } />
        <Route path="/asset-requests" element={
          <ProtectedRoute allowedRoles={['super_admin', 'asset_facilitator']}>
            <AssetRequestsPage />
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;