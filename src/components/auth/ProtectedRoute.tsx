import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import LoadingScreen from '../ui/LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isAuthLoading, initializeAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      if (!isAuthenticated) {
        await initializeAuth();
      }
    };
    init();
  }, [initializeAuth, isAuthenticated]);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      navigate('/auth', { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  if (isAuthLoading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? <>{children}</> : null;
};

export default ProtectedRoute;
