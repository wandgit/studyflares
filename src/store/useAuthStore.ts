import { create } from 'zustand';
import { toast } from 'react-hot-toast';
import { supabase } from '../config/supabase';
import { authService } from '../services/authService.ts';
import { User } from './useUserStore';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean; // For user actions like login/signup
  isAuthLoading: boolean; // For initial auth check
  currentUser: User | null;
  rawSupabaseUser: any | null; // Add rawSupabaseUser state
  error: string | null;
  // actions
  initializeAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, school: string, avatarFile?: File) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  clearError: () => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // helper to set loading true when starting action
  const startLoading = () => set({ isLoading: true, error: null });
  const stopLoading = () => set({ isLoading: false });

  // helper for initial auth loading
  const startAuthLoading = () => set({ isAuthLoading: true, error: null });
  const stopAuthLoading = () => set({ isAuthLoading: false });

  // listen to auth changes once at store creation
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log(`[onAuthStateChange] Event received: ${event}`);

    if (event === 'SIGNED_OUT') {
      set({
        isAuthenticated: false,
        currentUser: null,
        isLoading: false,
        isAuthLoading: false,
        error: null,
        rawSupabaseUser: null
      });
      return;
    }

    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
      try {
        if (!session?.user) {
          console.error('No user in session during auth event:', event);
          return;
        }

        const user = await authService.getCurrentUser();
        if (user) {
          set({
            isAuthenticated: true,
            currentUser: user,
            rawSupabaseUser: session.user,
            isLoading: false,
            isAuthLoading: false,
            error: null
          });
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
        set({
          isAuthenticated: false,
          currentUser: null,
          rawSupabaseUser: null,
          isLoading: false,
          isAuthLoading: false,
          error: 'Failed to get user profile'
        });
      }
    }
  });

  return {
    isAuthenticated: false,
    isLoading: false,
    isAuthLoading: true, // Start as true until initial check completes
    currentUser: null,
    rawSupabaseUser: null, // Initialize rawSupabaseUser
    error: null,

    setError: (error: string | null) => set({ error }),
    clearError: () => set({ error: null }),

    initializeAuth: async () => {
      startAuthLoading();
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user) {
          const user = await authService.getCurrentUser();
          if (user) {
            set({
              isAuthenticated: true,
              currentUser: user,
              rawSupabaseUser: session.user,
              error: null
            });
            return;
          }
        }

        // No valid session
        set({
          isAuthenticated: false,
          currentUser: null,
          rawSupabaseUser: null,
          error: null
        });
      } catch (error) {
        console.error('Error initializing auth:', error);
        set({
          isAuthenticated: false,
          currentUser: null,
          rawSupabaseUser: null,
          error: error instanceof Error ? error.message : 'Failed to initialize auth'
        });
      } finally {
        stopAuthLoading();
      }
    },

    login: async (email: string, password: string) => {
      startLoading();
      try {
        console.log('[useAuthStore.login] Calling authService.login...');
        const supabaseUser = await authService.login(email, password); // Returns SupabaseUser now
        console.log('[useAuthStore.login] authService.login successful, Supabase user:', supabaseUser);
        // Set authenticated, but currentUser will be fetched later by useUserStore
        set({ isAuthenticated: true, currentUser: null, error: null, rawSupabaseUser: supabaseUser }); 
        toast.success('Authentication successful');
      } catch (error: any) {
        console.error('[useAuthStore.login] Login error:', error);
        // Ensure state reflects failed login
        set({ error: error.message, isAuthenticated: false, currentUser: null, rawSupabaseUser: null }); 
        toast.error(error.message || 'Login failed');
      } finally {
        stopLoading();
      }
    },

    signUp: async (email: string, password: string, name: string, school: string, avatarFile?: File) => {
      startLoading();
      try {
        // Revert to passing a single object argument, matching the function definition
        const user = await authService.signUp({ email, password, name, school, avatarFile });
        set({ currentUser: user, isAuthenticated: true, rawSupabaseUser: user });
        toast.success('Account created successfully! Please check your email to verify your account.');
      } catch (error: any) {
        console.error('Sign‑up error:', error);
        const errorMessage = error.message?.includes('row-level security')
          ? 'Unable to create profile. Please try again.'
          : error.message || 'Sign‑up failed';
        set({ error: errorMessage });
        toast.error(errorMessage);
      } finally {
        stopLoading();
      }
    },

    loginWithGoogle: async () => {
      startLoading();
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent'
            }
          }
        });

        if (error) throw error;
        if (!data) throw new Error('No data returned from OAuth sign in');

      } catch (error) {
        console.error('Google login error:', error);
        set({ error: error instanceof Error ? error.message : 'Failed to sign in with Google' });
        stopLoading();
        toast.error('Failed to sign in with Google. Please try again.');
      }
    },

    resetPassword: async (email: string) => {
      startLoading();
      try {
        await authService.resetPassword(email);
        toast.success('Password reset email sent');
        return true;
      } catch (error: any) {
        console.error('Reset password error:', error);
        set({ error: error.message });
        toast.error(error.message || 'Failed to send reset email');
        return false;
      } finally {
        stopLoading();
      }
    },

    logout: async () => {
      startLoading();
      try {
        await authService.logout();
        // State will be updated by onAuthStateChange 'SIGNED_OUT' event
        set({ currentUser: null, isAuthenticated: false, rawSupabaseUser: null, error: null }); 
      } catch (error: any) {
        console.error('Logout error:', error);
        set({ error: error.message });
        toast.error(error.message || 'Logout failed');
      } finally {
        stopLoading();
      }
    },
  };
});

export default useAuthStore;
