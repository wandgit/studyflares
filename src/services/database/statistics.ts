import { DatabaseService } from './base';
import { DBUserStatistics } from '../../types/database.types';

export class StatisticsService extends DatabaseService {
  /**
   * Get or create user statistics
   */
  async getOrCreateStatistics(userId: string): Promise<DBUserStatistics> {
    try {
      // First try to get existing statistics
      const { data: existingStats, error: getError } = await this.supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existingStats) {
        return existingStats as DBUserStatistics;
      }

      // If not found, create new statistics
      if (getError && getError.code === 'PGRST116') {
        const { data: newStats, error: insertError } = await this.supabase
          .from('user_statistics')
          .insert({
            user_id: userId,
            study_time_minutes: 0,
            exams_taken: 0,
            exams_passed: 0,
            materials_created: 0,
            last_activity: new Date().toISOString(),
            metadata: {}
          })
          .select('*')
          .single();

        if (insertError) {
          return this.handleError(insertError);
        }

        return newStats as DBUserStatistics;
      }

      if (getError) {
        return this.handleError(getError);
      }

      return existingStats as DBUserStatistics;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update study time
   */
  async updateStudyTime(
    userId: string,
    additionalMinutes: number
  ): Promise<DBUserStatistics> {
    try {
      // First get or create the statistics
      const stats = await this.getOrCreateStatistics(userId);

      // Update the study time
      const { data, error } = await this.supabase
        .from('user_statistics')
        .update({
          study_time_minutes: stats.study_time_minutes + additionalMinutes,
          last_activity: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select('*')
        .single();

      if (error) {
        return this.handleError(error);
      }

      return data as DBUserStatistics;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update exam statistics
   */
  async updateExamStats(
    userId: string,
    passed: boolean
  ): Promise<DBUserStatistics> {
    try {
      // First get or create the statistics
      const stats = await this.getOrCreateStatistics(userId);

      // Update the exam statistics
      const { data, error } = await this.supabase
        .from('user_statistics')
        .update({
          exams_taken: stats.exams_taken + 1,
          exams_passed: passed ? stats.exams_passed + 1 : stats.exams_passed,
          last_activity: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select('*')
        .single();

      if (error) {
        return this.handleError(error);
      }

      return data as DBUserStatistics;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Increment materials created count
   */
  async incrementMaterialsCreated(userId: string): Promise<DBUserStatistics> {
    try {
      // First get or create the statistics
      const stats = await this.getOrCreateStatistics(userId);

      // Update the materials created count
      const { data, error } = await this.supabase
        .from('user_statistics')
        .update({
          materials_created: stats.materials_created + 1,
          last_activity: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select('*')
        .single();

      if (error) {
        return this.handleError(error);
      }

      return data as DBUserStatistics;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Track user progress on a specific material
   */
  async trackProgress(
    userId: string,
    materialId: string,
    progressPercentage: number,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    try {
      // Check if progress entry exists
      const { data: existingProgress, error: getError } = await this.supabase
        .from('material_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('material_id', materialId)
        .single();

      if (existingProgress) {
        // Update existing progress
        const { error: updateError } = await this.supabase
          .from('material_progress')
          .update({
            progress_percentage: progressPercentage,
            last_accessed: new Date().toISOString(),
            metadata: {
              ...existingProgress.metadata,
              ...metadata
            }
          })
          .eq('user_id', userId)
          .eq('material_id', materialId);

        if (updateError) {
          return this.handleError(updateError);
        }
      } else {
        // Create new progress entry
        const { error: insertError } = await this.supabase
          .from('material_progress')
          .insert({
            user_id: userId,
            material_id: materialId,
            progress_percentage: progressPercentage,
            last_accessed: new Date().toISOString(),
            metadata
          });

        if (insertError) {
          return this.handleError(insertError);
        }
      }

      // Also update the last activity time in user statistics
      await this.getOrCreateStatistics(userId);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get progress for all materials for a user
   */
  async getUserProgress(userId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('material_progress')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        return this.handleError(error);
      }

      return data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get progress for a specific material
   */
  async getMaterialProgress(
    userId: string,
    materialId: string
  ): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('material_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('material_id', materialId)
        .single();

      if (error && error.code !== 'PGRST116') {
        return this.handleError(error);
      }

      return data || { progress_percentage: 0 };
    } catch (error) {
      return this.handleError(error);
    }
  }
}
