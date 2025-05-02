import React, { useState } from 'react';
import Button from '../ui/Button';
import useAuthStore from '../../store/useAuthStore.ts';
import { FcGoogle } from 'react-icons/fc';

interface LoginFormProps {
  onToggleForm: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onToggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);
  const { login, loginWithGoogle, resetPassword, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (isResetMode) {
      const success = await resetPassword(email);
      if (success) {
        setIsResetMode(false);
      }
    } else {
      try {
        await login(email, password);
      } catch (error) {
        console.error('Login error:', error);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    clearError();
    try {
      await loginWithGoogle();
      // toast.success('Successfully signed in with Google!');
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      // Don't show toast here as the error will already be shown by the store
    }
  };

  const toggleResetMode = () => {
    setIsResetMode(!isResetMode);
    clearError();
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <h2 className="font-handwriting text-3xl text-center mb-6">
        {isResetMode ? 'Reset Password' : 'Welcome Back'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg border border-secondary bg-paper"
            placeholder="your@email.com"
            required
          />
        </div>
        
        {!isResetMode && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium">Password</label>
              <button 
                type="button" 
                onClick={toggleResetMode}
                className="text-xs text-leather hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg border border-secondary bg-paper"
              placeholder="••••••••"
              required
            />
          </div>
        )}
        
        <Button
          variant="primary"
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading 
            ? 'Processing...' 
            : isResetMode 
              ? 'Send Reset Link' 
              : 'Log In'
          }
        </Button>

        {!isResetMode && (
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-secondary"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-paper text-text">Or continue with</span>
            </div>
          </div>
        )}

        {!isResetMode && (
          <Button
            variant="outline"
            type="button"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <FcGoogle size={20} />
            <span>Sign in with Google</span>
          </Button>
        )}
      </form>
      
      {isResetMode ? (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={toggleResetMode}
            className="text-leather hover:underline"
          >
            Back to login
          </button>
        </div>
      ) : (
        <div className="mt-6 text-center">
          <p className="text-text">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onToggleForm}
              className="text-leather hover:underline"
            >
              Sign Up
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

export default LoginForm;
