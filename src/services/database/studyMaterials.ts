import { DatabaseService } from './base';
import { DBStudyMaterial } from '../../types/database.types';

type MaterialType = 'study_guide' | 'flashcards' | 'quiz' | 'concept_map' | 'exam' | 'practice_exam';

export class StudyMaterialsService extends DatabaseService {
  /**
   * Create a new study material
   */
  async createMaterial(
    userId: string,
    title: string,
    type: MaterialType,
    content: Record<string, any>,
    documentId: string | null = null,
    isPublic: boolean = false,
    metadata: Record<string, any> = {}
  ): Promise<DBStudyMaterial> {
    try {
      const { data, error } = await this.supabase
        .from('study_materials')
        .insert({
          user_id: userId,
          document_id: documentId,
          title,
          type,
          content,
          is_public: isPublic,
          metadata
        })
        .select('*')
        .single();

      if (error) {
        return this.handleError(error);
      }

      return data as DBStudyMaterial;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get all study materials for a user
   */
  async getMaterials(
    userId: string,
    type?: MaterialType,
    documentId?: string
  ): Promise<DBStudyMaterial[]> {
    try {
      let query = this.supabase
        .from('study_materials')
        .select('*')
        .eq('user_id', userId);

      if (type) {
        query = query.eq('type', type);
      }

      if (documentId) {
        query = query.eq('document_id', documentId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        return this.handleError(error);
      }

      return data as DBStudyMaterial[];
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get a single study material by ID
   */
  async getMaterial(materialId: string): Promise<DBStudyMaterial> {
    try {
      const { data, error } = await this.supabase
        .from('study_materials')
        .select('*')
        .eq('id', materialId)
        .single();

      if (error) {
        return this.handleError(error);
      }

      return data as DBStudyMaterial;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get public study materials
   */
  async getPublicMaterials(type?: MaterialType): Promise<DBStudyMaterial[]> {
    try {
      let query = this.supabase
        .from('study_materials')
        .select('*')
        .eq('is_public', true);

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        return this.handleError(error);
      }

      return data as DBStudyMaterial[];
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update a study material
   */
  async updateMaterial(
    materialId: string,
    updates: Partial<Omit<DBStudyMaterial, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<DBStudyMaterial> {
    try {
      const { data, error } = await this.supabase
        .from('study_materials')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', materialId)
        .select('*')
        .single();

      if (error) {
        return this.handleError(error);
      }

      return data as DBStudyMaterial;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete a study material
   */
  async deleteMaterial(materialId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('study_materials')
        .delete()
        .eq('id', materialId);

      if (error) {
        return this.handleError(error);
      }
    } catch (error) {
      return this.handleError(error);
    }
  }
}
