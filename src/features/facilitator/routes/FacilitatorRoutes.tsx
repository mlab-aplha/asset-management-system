import { Routes, Route, Navigate } from 'react-router-dom';
import FacilitatorDashboard from '../dashboard/FacilitatorDashboard';
import RequestsPage from '../../../pages/facilitator/RequestsPage';
import CheckoutPage from '../../../pages/facilitator/CheckoutPage';
import ReportsPage from '../../../pages/facilitator/ReportsPage';
import ProtectedRoute from './FacilitatorProtectedRoute';

const FacilitatorRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/facilitator/dashboard" replace />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <FacilitatorDashboard />
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
    </Routes>
  );
};

export default FacilitatorRoutes;
