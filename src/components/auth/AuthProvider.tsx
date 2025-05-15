import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../../config/supabase';
import { Profile } from '../../types/profile';

// New state machine types
// New state machine types
type AuthStatus = 
  | 'anonymous'        // No user is signed in
  | 'authenticating'   // Auth process is ongoing
  | 'signed_in'        // User is signed in but profile status unknown
  | 'profile_pending'  // Checking/waiting for profile
  | 'profile_incomplete' // Profile exists but incomplete
  | 'profile_required'  // For backward compatibility
  | 'complete';        // Profile exists and complete

type AuthState = {
  status: AuthStatus;
  returnTo?: string;
  error?: string;
};

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  error?: string;

  signOut: () => Promise<void>;
  // For backward compatibility, expose both new state and old string state
  authState: AuthStatus;  // Old string state
  state: AuthState;       // New state machine state
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'anonymous' });
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // For logging and debugging
  useEffect(() => {
    console.log('[AuthProvider] Auth state changed:', state);
  }, [state]);

  // Profile polling function
  const startProfilePolling = useCallback(async (userId: string) => {
    setState(prev => ({ ...prev, status: 'profile_pending' }));
    console.log('[AuthProvider] Starting profile polling for user:', userId);

    // Try up to 5 times with 200ms delay
    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      try {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select()
          .eq('id', userId);

        if (error) throw error;

        if (profiles && profiles.length > 0) {
          const profile = profiles[0];
          setProfile(profile);
          // Check if profile is complete
          const isComplete = Boolean(profile.school);
          setState(prev => ({
            ...prev,
            status: isComplete ? 'complete' : 'profile_incomplete',
            error: undefined // Clear any previous errors
          }));
          console.log('[AuthProvider] Profile found:', isComplete ? 'complete' : 'incomplete');
          return;
        }
      } catch (error) {
        console.error('[AuthProvider] Error checking profile:', error);
        // Don't throw here, let it try again
      }
    }

    // If we get here, something went wrong
    setState(prev => ({
      ...prev,
      status: 'profile_incomplete',
      error: 'Failed to load profile'
    }));
  }, []);

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      console.log('[AuthProvider] Initializing auth...');
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setState(prev => ({ ...prev, status: 'signed_in' }));
        startProfilePolling(session.user.id);
      } else {
        setProfile(null);
        setState({ status: 'anonymous' });
      }
      
      setIsLoading(false);
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthProvider] Auth event:', event);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        if (event === 'SIGNED_IN') {
          setState(prev => ({ ...prev, status: 'signed_in' }));
          startProfilePolling(session.user.id);
        }
      } else {
        setProfile(null);
        setState({ status: 'anonymous' });
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [startProfilePolling]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Map new state to old state for backward compatibility
  const legacyAuthState: AuthStatus = (() => {
    switch (state.status) {
      case 'anonymous': return 'anonymous';
      case 'authenticating': return 'authenticating';
      case 'signed_in': return 'authenticating';
      case 'profile_pending': return 'authenticating';
      case 'profile_incomplete': return 'profile_required';
      case 'complete': return 'complete';
      default: return 'anonymous';
    }
  })();

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        isLoading,
        signOut,
        authState: legacyAuthState,  // For backward compatibility
        state,                       // New state machine state
        error: state.error
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
