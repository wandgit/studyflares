import { Session, User } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

export type Profile = Database['public']['Tables']['profiles']['Row'];

export interface AuthUser extends User {
  profile: Profile;
}

export interface AuthContextType {
  session: Session | null;
  user: AuthUser | null;
  isLoading: boolean;
  error: Error | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}
