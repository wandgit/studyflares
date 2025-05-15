import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { AuthOverlay } from './AuthOverlay';

interface AuthTriggerProps {
  children: ReactNode;
  returnUrl?: string;
  className?: string;
}

export function AuthTrigger({
  children,
  returnUrl,
  className,
}: AuthTriggerProps) {
  const { state } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  const navigate = useNavigate();
  
  const handleClick = (e: React.MouseEvent) => {
    console.log('[AuthTrigger] Click, auth state:', state);
    
    // Prevent default for all auth-related clicks
    e.preventDefault();
    e.stopPropagation();
    
    if (state.status === 'anonymous') {
      // Show auth modal for anonymous users
      setShowAuth(true);
      console.log('[AuthTrigger] Showing auth modal, return URL:', returnUrl);
    } else if (state.status === 'complete') {
      // Navigate directly for users with complete profiles
      console.log('[AuthTrigger] Profile complete, navigating to:', returnUrl);
      if (returnUrl) {
        navigate(returnUrl);
      }
    } else if (state.status === 'profile_incomplete') {
      // Redirect to profile setup for users with incomplete profiles
      console.log('[AuthTrigger] Profile incomplete, redirecting to setup');
      localStorage.setItem('returnTo', returnUrl || '/');
      navigate('/profile/setup');
    }
  };

  return (
    <>
      <div onClick={handleClick} className={className}>
        {children}
      </div>
      {showAuth && (
        <AuthOverlay
          returnUrl={returnUrl}
          onClose={() => setShowAuth(false)}
        />
      )}
    </>
  );
}
