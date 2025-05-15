import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../../config/supabase';

export class DatabaseService {
  protected supabase: SupabaseClient;
  
  constructor() {
    this.supabase = supabase;
  }
  
  protected handleError(error: any): never {
    console.error('[Database Error]:', error);
    throw new Error(`Database operation failed: ${error.message}`);
  }
}
