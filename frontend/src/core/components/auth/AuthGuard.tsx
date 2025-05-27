import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useData } from '../../data';

interface AuthGuardProps {
  children: React.ReactNode;
  loginPath?: string;
}

/**
 * Auth guard component that protects routes requiring authentication
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  loginPath = '/login'
}) => {
  const { isInitialized, isAuthenticated } = useData();
  const location = useLocation();
  
  // Show nothing while checking
  if (!isInitialized) {
    return <div>Loading...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Preserve the attempted URL for redirect after login
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }
  
  // Render children if authenticated
  return <>{children}</>;
};

export default AuthGuard; 