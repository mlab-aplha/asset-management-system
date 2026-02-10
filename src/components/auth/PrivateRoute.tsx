import React from 'react';
import { Navigate } from 'react-router-dom';
import { AuthService } from '../../../backend-firebase/src/services/AuthService';

interface PrivateRouteProps {
    children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const isAuthenticated = AuthService.isAuthenticated();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};