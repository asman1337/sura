import React, { useEffect, useState } from 'react';
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
  const { auth, isInitialized } = useData();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      if (!isInitialized) return;
      
      const token = auth.getToken();
      setIsAuthenticated(!!token);
    };
    
    checkAuth();
  }, [auth, isInitialized]);
  
  // Show nothing while checking
  if (!isInitialized || isAuthenticated === null) {
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