import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import SignUpForm from '../components/auth/SignUpForm';
import useAuthStore from '../store/useAuthStore';
import LoadingScreen from '../components/ui/LoadingScreen';

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get('mode');
  const navigate = useNavigate();
  const { isAuthenticated, isAuthLoading, initializeAuth } = useAuthStore();

  const [isSignUp, setIsSignUp] = useState(modeParam === 'signup');

  useEffect(() => {
    const checkAuth = async () => {
      await initializeAuth();
      if (isAuthenticated) {
        navigate('/', { replace: true });
      }
    };
    checkAuth();
  }, [initializeAuth, isAuthenticated, navigate]);

  useEffect(() => {
    // Set default mode to signup for new users
    if (!modeParam) {
      navigate('/auth?mode=signup', { replace: true });
      setIsSignUp(true);
    }
  }, [modeParam, navigate]);

  const toggleForm = () => {
    setIsSignUp(!isSignUp);
    navigate(`/auth?mode=${!isSignUp ? 'signup' : 'login'}`);
  };

  if (isAuthLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h1>
        {isSignUp ? (
          <SignUpForm onToggleForm={toggleForm} />
        ) : (
          <LoginForm onToggleForm={toggleForm} />
        )}
      </div>
    </div>
  );
};

export default AuthPage;
