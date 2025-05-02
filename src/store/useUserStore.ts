import { create } from 'zustand';
import { supabase } from '../config/supabase';
import { toast } from 'react-hot-toast';
import { AuthService } from '../services/authService';
import { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  name: string;
  school: string | null;
  avatarUrl: string | null;
  created_at: string;
  updated_at: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface UserState {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  passwordData: PasswordData;
  initializeUser: (supabaseUser: SupabaseUser) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
  changePassword: () => Promise<void>;
  updatePasswordField: (field: keyof PasswordData, value: string) => void;
}

// List of universities for recommendations
export const universities = [
  'Stanford University',
  'MIT',
  'Harvard University',
  'University of California, Berkeley',
  'University of Michigan',
  'University of Washington',
  'Georgia Tech',
  'University of Texas at Austin',
  'Carnegie Mellon University',
  'Cornell University',
  'Princeton University',
  'Yale University',
  'Columbia University',
  'University of Chicago',
  'California Institute of Technology',
];

const useUserStore = create<UserState>((set, get) => ({
  currentUser: null,
  loading: false,
  error: null,
  passwordData: {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  },

  setUser: (user: User | null) => set({ currentUser: user }),

  initializeUser: async (supabaseUser: SupabaseUser) => { 
    console.log('[useUserStore.initializeUser] Initializing with Supabase user:', supabaseUser);
    set({ loading: true, error: null });
    try {
      if (!supabaseUser) {
        console.warn('[useUserStore.initializeUser] No Supabase user provided.');
        set({ loading: false, currentUser: null });
        return;
      }

      const auth = new AuthService();

      console.log('[useUserStore.initializeUser] Calling authService.ensureProfile...');
      const profile = await auth.ensureProfile(supabaseUser);
      if (!profile) {
        console.error('[useUserStore.initializeUser] ensureProfile failed to return a profile.');
        throw new Error('Failed to initialize user profile after ensureProfile.');
      }
      console.log('[useUserStore.initializeUser] Profile ensured/found:', profile);

      const user = auth.mapUserData(supabaseUser, profile);
      console.log('[useUserStore.initializeUser] User mapped:', user);

      set({ currentUser: user, loading: false, error: null });
      console.log('[useUserStore.initializeUser] User state set.');

    } catch (error: any) {
      console.error('[useUserStore.initializeUser] Error:', error);
      set({ loading: false, error: error.message, currentUser: null });
      throw error;
    }
  },

  updateProfile: async (data: Partial<User>) => {
    try {
      const { currentUser } = get();
      if (!currentUser) throw new Error('No user logged in');

      const { error } = await supabase
        .from('profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentUser.id);

      if (error) throw error;

      set((state) => ({
        currentUser: state.currentUser
          ? { ...state.currentUser, ...data }
          : null,
      }));
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      throw error;
    }
  },
  clearError: () => set({ error: null }),

  updatePasswordField: (field: keyof PasswordData, value: string) => {
    set((state) => ({
      passwordData: {
        ...state.passwordData,
        [field]: value
      }
    }));
  },

  changePassword: async () => {
    const { passwordData } = get();
    set({ loading: true, error: null });

    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('New passwords do not match');
      }

      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      // Reset password data
      set({
        loading: false,
        passwordData: {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }
      });

      toast.success('Password updated successfully');
    } catch (error: any) {
      console.error('Error changing password:', error);
      set({ loading: false, error: error.message });
      toast.error(error.message || 'Failed to change password');
      throw error;
    }
  }
}));

export default useUserStore;
