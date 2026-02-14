import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from '../../../pages/facilitator/DashboardPage';
import RequestsPage from '../../../pages/facilitator/RequestsPage';
import CheckoutPage from '../../../pages/facilitator/CheckoutPage';
import ReportsPage from '../../../pages/facilitator/ReportsPage';
import LoginPage from '../../../pages/facilitator/LoginPage';
import ProtectedRoute from './FacilitatorProtectedRoute';

const FacilitatorRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />
      <Route path="/requests" element={
        <ProtectedRoute>
          <RequestsPage />
        </ProtectedRoute>
      } />
      <Route path="/checkout" element={
        <ProtectedRoute>
          <CheckoutPage />
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute>
          <ReportsPage />
        </ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to="/facilitator/dashboard" replace />} />
    </Routes>
  );
};

export default FacilitatorRoutes;

