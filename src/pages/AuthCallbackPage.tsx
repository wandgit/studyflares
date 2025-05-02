import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authService } from '../services/authService';
import { supabase } from '../config/supabase';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session with retry mechanism
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (!session) {
          if (retryCount < maxRetries) {
            // Wait and retry
            console.log(`No session found, retrying... (${retryCount + 1}/${maxRetries})`);
            setTimeout(() => setRetryCount(prev => prev + 1), 1000);
            return;
          }
          throw new Error('No session found after retries');
        }

        // Get user profile
        const user = await authService.getCurrentUser();
        if (!user) {
          throw new Error('Failed to get user profile');
        }

        // Success! Navigate to stored path or home
        toast.success('Successfully signed in!');
        const preAuthPath = localStorage.getItem('preAuthPath') || '/';
        localStorage.removeItem('preAuthPath');
        navigate(preAuthPath, { replace: true });
      } catch (error) {
        console.error('Auth callback error:', error);
        const message = error instanceof Error ? error.message : 'Authentication failed';
        toast.error(message);
        navigate('/auth', { replace: true });
      }
    };

    handleCallback();
  }, [navigate, retryCount]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Authenticating...</h2>
        <p className="text-gray-600">
          {retryCount > 0 
            ? `Verifying your session (Attempt ${retryCount}/${maxRetries})...`
            : 'Please wait while we complete your authentication.'}
        </p>
      </div>
    </div>
  );
};
