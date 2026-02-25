// src/components/auth/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: Array<'admin' | 'facilitator'>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRoles
}) => {
    const { user, loading, isAuthenticated } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Clear any cached/stale data that might cause issues
        sessionStorage.clear();
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user && !allowedRoles.includes(user.role)) {
        if (user.role === 'admin') {
            return <Navigate to="/dashboard" replace />;
        } else if (user.role === 'facilitator') {
            return <Navigate to="/facilitator/dashboard" replace />;
        }
    }

    return <>{children}</>;
};