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
   * Save study material from library to Supabase
   */
  async saveMaterialFromLibrary(
    userId: string,
    material: {
      fileName: string;
      studyGuide: string;
      flashcards: Array<{ question: string; answer: string }>;
      quiz: Array<any>;
      conceptMap: any;
      exam?: any;
    }
  ): Promise<DBStudyMaterial> {
    console.log('Saving material to library for user:', userId);
    try {
      // First check if this material already exists
      const { data: existingMaterial } = await this.supabase
        .from('study_materials')
        .select('*')
        .eq('user_id', userId)
        .eq('title', material.fileName)
        .maybeSingle();

      if (existingMaterial) {
        console.log('Material already exists in Supabase');
        return existingMaterial as DBStudyMaterial;
      }

      const insertData = {
        user_id: userId,
        title: material.fileName,
        description: 'Generated study materials',
        type: 'study_guide' as MaterialType,
        content: {
          studyGuide: material.studyGuide,
          flashcards: material.flashcards,
          quiz: material.quiz,
          conceptMap: material.conceptMap,
          exam: material.exam
        },
        metadata: {
          source: 'library',
          created_at: new Date().toISOString(),
          lastModified: new Date().toISOString()
        }
      };

      console.log('Inserting data:', insertData);

      const { data, error } = await this.supabase
        .from('study_materials')
        .insert(insertData)
        .select('*')
        .single();

      if (error) {
        console.error('Error saving to Supabase:', error);
        throw this.handleError(error);
      }

      console.log('Successfully saved to Supabase:', data);
      return data as DBStudyMaterial;
    } catch (error) {
      console.error('Error in saveMaterialFromLibrary:', error);
      throw this.handleError(error);
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
