import { supabase } from '../config/supabase';
import type {
  User as SupabaseUser,
  AuthError,
} from '@supabase/supabase-js';
import { User } from '../store/useUserStore';
import { toast } from 'react-hot-toast';

export interface SignUpPayload {
  email: string;
  password: string;
  name: string;
  school?: string;
  avatarFile?: File;
}

export interface Profile {
  id: string;
  email: string;
  name: string;
  school: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export class AuthService {
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (!session?.user) return null;

      // Check if user has a profile
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      // If no profile exists, create one
      if (!existingProfile) {
        const profile = await this.ensureProfile(session.user);
        return this.mapUserData(session.user, profile);
      }

      return this.mapUserData(session.user, existingProfile as Profile);
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
  /* -------------------------------------------------------------------------- */
  /*                              HELPER METHODS                                */
  /* -------------------------------------------------------------------------- */

  async uploadAvatar(userId: string, file?: File): Promise<string | null> {
    if (!file) return null;

    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('Avatar upload error:', uploadError);
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(filePath);

    return publicUrl;
  }

  /* -------------------------------------------------------------------------- */
  /*                                AUTH FLOW                                   */
  /* -------------------------------------------------------------------------- */

  async signUp({ email, password, name, school, avatarFile }: SignUpPayload): Promise<User> {
    try {
      // First, check if the user already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        throw new Error('An account with this email already exists');
      }

      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            school,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
      if (!data.user) throw new Error('No user data returned');

      // Wait a moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get or create profile
      const profile = await this.ensureProfile(data.user, { name, school });

      // Upload avatar if provided
      if (avatarFile) {
        const avatarUrl = await this.uploadAvatar(data.user.id, avatarFile);
        if (avatarUrl) {
          await this.ensureProfile(data.user, { avatar_url: avatarUrl });
        }
      }

      toast.success('Account created successfully! Logging you in...');
      return this.mapUserData(data.user, profile);
    } catch (error) {
      console.error('Sign-up error:', error);
      const message = error instanceof Error ? error.message : 'Failed to sign up';
      toast.error(message);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user || !data.session) {
        throw new Error('No session or user data returned');
      }

      // Ensure profile exists and get it
      const profile = await this.ensureProfile(data.user);
      if (!profile) throw new Error('Failed to get user profile');
      
      // Store the session
      localStorage.setItem('supabase.auth.token', data.session.access_token);

      toast.success('Login successful');
      return this.mapUserData(data.user, profile);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async loginWithGoogle(): Promise<void> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
      if (!data.url) throw new Error('No OAuth URL returned');

      // Store the current URL to redirect back after auth
      localStorage.setItem('preAuthPath', window.location.pathname);

      // Redirect to OAuth provider
      window.location.href = data.url;
    } catch (error) {
      const err = error as AuthError;
      toast.error(err.message || 'Failed to login with Google');
      throw err;
    }
  }

  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear any stored session
      localStorage.removeItem('supabase.auth.token');
      toast.success('Logged out successfully');
    } catch (error) {
      const err = error as AuthError;
      toast.error(err.message || 'Failed to logout');
      throw err;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      toast.success('Password reset instructions sent to your email');
    } catch (error) {
      const err = error as AuthError;
      toast.error(err.message || 'Failed to send reset password email');
      throw err;
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                             PROFILE HANDLING                               */
  /* -------------------------------------------------------------------------- */

  async ensureProfile(user: SupabaseUser, extra?: Partial<Profile>): Promise<Profile> {
    try {
      // First, try to get the existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingProfile) {
        if (!extra) {
          return existingProfile as Profile;
        }

        // Update existing profile
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({
            ...extra,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        return updatedProfile as Profile;
      }

      // Create new profile
      const newProfileData = {
        id: user.id,
        email: user.email!,
        name: extra?.name || user.user_metadata?.name || user.email!.split('@')[0],
        school: extra?.school || user.user_metadata?.school || null,
        avatar_url: extra?.avatar_url || user.user_metadata?.avatar_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: insertedProfile, error: insertError } = await supabase
        .from('profiles')
        .insert([newProfileData])
        .select()
        .single();

      if (insertError) {
        // Check if profile was created by another request
        if (insertError.code === '23505') {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (existingProfile) {
            return existingProfile as Profile;
          }
        }
        throw insertError;
      }

      return insertedProfile as Profile;
    } catch (error) {
      console.error('Error in ensureProfile:', error);
      throw error;
    }
  }

  mapUserData(user: SupabaseUser, profile: Profile): User {
    return {
      id: user.id,
      email: user.email ?? '',
      name: profile.name,
      school: profile.school,
      avatarUrl: profile.avatar_url,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    };
  }

  /* -------------------------------------------------------------------------- */
  /*                               CURRENT USER                                 */
  /* -------------------------------------------------------------------------- */

  async getCurrentSupabaseUser(): Promise<SupabaseUser | null> { 
    console.log('[authService.getCurrentSupabaseUser] Fetching session...');
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error('[authService.getCurrentSupabaseUser] Session fetch error:', error);
      return null;
    }
    
    const supabaseUser = session?.user ?? null;
    console.log('[authService.getCurrentSupabaseUser] Returning Supabase user:', supabaseUser);
    return supabaseUser;
  }

  /* -------------------------------------------------------------------------- */
  /*                                Upload Avatar                             */
  /* -------------------------------------------------------------------------- */

  // ... rest of the code remains the same ...
}

export const authService = new AuthService();
export default authService;
