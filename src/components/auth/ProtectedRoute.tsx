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
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user && !allowedRoles.includes(user.role)) {
        if (user.role === 'admin') {
            return <Navigate to="/dashboard" replace />;
        } else if (user.role === 'facilitator') {
            return <Navigate to="/facilitator/dashboard" replace />; // FIXED: lowercase f, with slash
        }
    }

    return <>{children}</>;
};