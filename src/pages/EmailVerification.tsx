import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import Button from '../components/ui/Button';
import { toast } from 'react-hot-toast';
import { authService } from '../services/authService';

const EmailVerification = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (!session) {
          setError('No session found. Please try signing in again.');
          return;
        }

        if (session.user.email_confirmed_at) {
          toast.success('Email verified successfully! Redirecting...');
          navigate('/');
        } else {
          setError('Email not yet verified. Please check your email and click the verification link.');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    handleEmailConfirmation();
  }, [navigate]);

  const handleResendEmail = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) {
        throw new Error('No email found');
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: session.user.email
      });

      if (error) throw error;
      toast.success('Verification email resent! Please check your inbox.');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleBackToLogin = async () => {
    try {
      await authService.logout();
      navigate('/auth?mode=login');
    } catch (err: any) {
      toast.error(`Logout failed: ${err.message}`);
      navigate('/auth?mode=login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text">Verifying your email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full bg-paper p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Email Verification</h1>
        
        {error ? (
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={handleResendEmail} variant="secondary">
              Resend Verification Email
            </Button>
          </div>
        ) : (
          <p className="text-text text-center">
            Please check your email for the verification link. 
            Once verified, you will be automatically redirected.
          </p>
        )}

        <div className="mt-6 text-center">
          <Button onClick={handleBackToLogin} variant="ghost">
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
