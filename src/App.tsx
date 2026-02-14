import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { AssetRegistryPage } from './pages/AssetRegistry/AssetRegistryPage';
import { AssetDetailPage } from './pages/AssetDetail/AssetDetailPage';
import { UserManagementPage } from './pages/UserManagement/UserManagementPage';
import { LocationManagementPage } from './pages/LocationManagement/LocationManagementPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected routes - add authentication later */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/assets" element={<AssetRegistryPage />} />
        <Route path="/assets/:id" element={<AssetDetailPage />} />
        <Route path="/users" element={<UserManagementPage />} />
        <Route path="/locations" element={<LocationManagementPage />} />

        {/* Redirect any unknown routes to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
