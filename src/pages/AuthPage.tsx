import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../auth/AuthForm';
import { useAuth } from '../auth/AuthProvider';

const AuthPage = () => {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session && !isLoading) {
      navigate('/', { replace: true });
    }
  }, [session, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-gray-600">Sign in to your account to continue</p>
        </div>
        <div className="bg-white p-8 shadow-sm rounded-lg">
          <AuthForm />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
