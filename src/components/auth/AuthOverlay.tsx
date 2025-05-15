import { useState, useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../config/supabase';
import { useAuth } from './AuthProvider';

interface AuthOverlayProps {
  returnUrl?: string;
  onClose?: () => void;
}

export function AuthOverlay({ returnUrl = '/upload', onClose }: AuthOverlayProps) {
  const { state, error: authError } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // Watch for auth state changes and handle redirects
  useEffect(() => {
    console.log('[AuthOverlay] Auth state updated:', state);

    switch (state.status) {
      case 'profile_incomplete':
        console.log('[AuthOverlay] Profile incomplete, redirecting to setup');
        // Store the return URL in localStorage
        localStorage.setItem('returnTo', returnUrl);
        // Redirect to profile setup
        window.location.href = '/profile/setup';
        break;

      case 'complete':
        console.log('[AuthOverlay] Profile complete, redirecting to:', returnUrl);
        // If profile is complete, redirect back to original page
        window.location.href = returnUrl;
        break;

      case 'anonymous':
      case 'authenticating':
      case 'signed_in':
      case 'profile_pending':
        // These states don't require any action
        break;
    }
  }, [state, returnUrl]);

  // Show any auth errors
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  // Simple handler just for logging
  const handleAuthStateChange = (event: string, session: Session | null) => {
    console.log('[AuthOverlay] Supabase auth event:', event, session);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-sm bg-card dark:bg-card p-6 rounded-lg shadow-lg relative border border-border">
        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-2 rounded-full hover:bg-secondary/10"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}

        {/* Loading spinner for profile checks */}
        {state.status === 'profile_pending' && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-lg">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
              <p className="text-sm text-muted">Checking profile...</p>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <h3 className="text-xl font-semibold text-center mb-6">
          Sign in to Upload
        </h3>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(var(--primary))',
                  brandAccent: 'hsl(var(--primary))',
                  brandButtonText: 'hsl(var(--primary-foreground))',
                  defaultButtonBackground: 'hsl(var(--secondary))',
                  defaultButtonBackgroundHover: 'hsl(var(--secondary))',
                  inputBackground: 'transparent',
                  inputBorder: 'hsl(var(--border))',
                  inputBorderHover: 'hsl(var(--border))',
                  inputBorderFocus: 'hsl(var(--primary))',
                  dividerBackground: 'hsl(var(--border))',
                },
              },
              dark: {
                colors: {
                  brandButtonText: 'hsl(var(--primary-foreground))',
                  defaultButtonBackground: 'hsl(var(--secondary))',
                  defaultButtonBackgroundHover: 'hsl(var(--secondary))',
                  inputBackground: 'transparent',
                  inputBorder: 'hsl(var(--border))',
                  inputBorderHover: 'hsl(var(--border))',
                  inputBorderFocus: 'hsl(var(--primary))',
                  dividerBackground: 'hsl(var(--border))',
                },
              },
            },
            className: {
              container: 'text-text',
              label: 'text-text',
              button: 'text-text',
              input: 'text-text bg-card dark:bg-card',
            },
          }}
          providers={['google']}
          redirectTo={window.location.origin + returnUrl}
          view="sign_up"
          // @ts-expect-error - Supabase Auth UI types are incorrect
          onAuthStateChange={handleAuthStateChange}
        />
      </div>
    </div>
  );
}
