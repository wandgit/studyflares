import { supabase } from '../config/supabase';
import { Database } from '../types/supabase';

type ActivityHistory = Database['public']['Tables']['activity_history']['Row'];
type ActivityHistoryInsert = Database['public']['Tables']['activity_history']['Insert'];

class ActivityService {
  async logActivity(data: Omit<ActivityHistoryInsert, 'id' | 'created_at'>) {
    const { data: activity, error } = await supabase
      .from('activity_history')
      .insert(data)
      .select()
      .single();

    if (error) throw this.handleError(error);
    return activity;
  }

  async getUserActivity(userId: string, limit = 10) {
    const { data: activities, error } = await supabase
      .from('activity_history')
      .select(`
        *,
        study_materials (
          title,
          subject,
          type
        ),
        exam_results (
          score,
          total_questions
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw this.handleError(error);
    return activities;
  }

  async getStudyMaterialActivity(studyMaterialId: string) {
    const { data: activities, error } = await supabase
      .from('activity_history')
      .select('*, profiles(name)')
      .eq('study_material_id', studyMaterialId)
      .order('created_at', { ascending: false });

    if (error) throw this.handleError(error);
    return activities;
  }

  async deleteActivity(id: string) {
    const { error } = await supabase
      .from('activity_history')
      .delete()
      .eq('id', id);

    if (error) throw this.handleError(error);
  }

  private handleError(error: any): Error {
    console.error('Activity service error:', error);
    return new Error(error.message || 'An error occurred while managing activity history');
  }
}

export const activityService = new ActivityService();
