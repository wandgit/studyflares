import { DatabaseService } from './base';
import { DBActivity } from '../../types/database.types';

export class ActivityService extends DatabaseService {
  /**
   * Log a new activity
   */
  async logActivity(
    userId: string,
    activityType: 'document_upload' | 'material_creation' | 'exam_attempt' | 'study_session',
    referenceId: string | null = null,
    referenceType: 'document' | 'study_material' | 'exam' | 'exam_attempt' | null = null,
    metadata: Record<string, any> = {}
  ): Promise<DBActivity> {
    try {
      const { data, error } = await this.supabase
        .from('activities')
        .insert({
          user_id: userId,
          activity_type: activityType,
          reference_id: referenceId,
          reference_type: referenceType,
          metadata
        })
        .select('*')
        .single();

      if (error) {
        return this.handleError(error);
      }

      return data as DBActivity;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get recent activities for a user
   */
  async getRecentActivities(
    userId: string,
    limit: number = 10
  ): Promise<DBActivity[]> {
    try {
      const { data, error } = await this.supabase
        .from('activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        return this.handleError(error);
      }

      return data as DBActivity[];
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get activities by type
   */
  async getActivitiesByType(
    userId: string,
    activityType: 'document_upload' | 'material_creation' | 'exam_attempt' | 'study_session'
  ): Promise<DBActivity[]> {
    try {
      const { data, error } = await this.supabase
        .from('activities')
        .select('*')
        .eq('user_id', userId)
        .eq('activity_type', activityType)
        .order('created_at', { ascending: false });

      if (error) {
        return this.handleError(error);
      }

      return data as DBActivity[];
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get activities for a specific reference
   */
  async getReferenceActivities(
    referenceId: string,
    referenceType: 'document' | 'study_material' | 'exam' | 'exam_attempt'
  ): Promise<DBActivity[]> {
    try {
      const { data, error } = await this.supabase
        .from('activities')
        .select('*')
        .eq('reference_id', referenceId)
        .eq('reference_type', referenceType)
        .order('created_at', { ascending: false });

      if (error) {
        return this.handleError(error);
      }

      return data as DBActivity[];
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Clear old activities
   */
  async clearOldActivities(
    userId: string,
    olderThan: Date
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('activities')
        .delete()
        .eq('user_id', userId)
        .lt('created_at', olderThan.toISOString());

      if (error) {
        return this.handleError(error);
      }
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete a specific activity
   */
  async deleteActivity(activityId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('activities')
        .delete()
        .eq('id', activityId);

      if (error) {
        return this.handleError(error);
      }
    } catch (error) {
      return this.handleError(error);
    }
  }
}
