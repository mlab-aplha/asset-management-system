import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const FacilitatorProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // YOUR facilitator auth logic - completely separate from partner's auth
  const facilitatorToken = localStorage.getItem('facilitator_token');
  const isAuthenticated = !!facilitatorToken;

  if (!isAuthenticated) {
    return <Navigate to="/facilitator/login" replace />;
  }

  return <>{children}</>;
};

export default FacilitatorProtectedRoute;
