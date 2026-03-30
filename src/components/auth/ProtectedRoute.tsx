// src/components/auth/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/core/entities/User';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: UserRole[];
}

const ROLE_HOME: Record<UserRole, string> = {
    super_admin: '/dashboard',
    hub_manager: '/manager/dashboard',
    it: '/it/dashboard',
    asset_facilitator: '/facilitator/dashboard',
    student: '/student/dashboard',
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { user, loading, isAuthenticated } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner" />
                <p>Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        sessionStorage.clear();
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user && !allowedRoles.includes(user.role)) {
        const home = ROLE_HOME[user.role] ?? '/login';
        return <Navigate to={home} replace />;
    }

    return <>{children}</>;
};