import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { useState, useEffect } from 'react';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { state } = useAuth();
  const [hasBeenAuthenticated, setHasBeenAuthenticated] = useState(false);

  // Track authentication state to prevent loading flicker when switching tabs
  useEffect(() => {
    if (state.status === 'complete') {
      setHasBeenAuthenticated(true);
    }
  }, [state.status]);

  // If we've previously been authenticated, don't show loading state when switching tabs
  // This avoids the white loading screen when changing tabs and coming back
  if (!hasBeenAuthenticated && (state.status === 'authenticating' || state.status === 'profile_pending')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
          <p className="text-sm text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to home if not authenticated
  if (state.status === 'anonymous') {
    return <Navigate to="/" replace />;
  }

  // Redirect to profile setup if needed
  if (state.status === 'profile_incomplete') {
    return <Navigate to="/profile/setup" replace />;
  }

  // Show error if present
  if (state.error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          {state.error}
        </div>
      </div>
    );
  }

  // Allow access if authenticated and profile is complete
  return <>{children}</>;
}
