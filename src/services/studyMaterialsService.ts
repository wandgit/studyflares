import { supabase } from '../config/supabase';
import { Database } from '../types/supabase';

type StudyMaterial = Database['public']['Tables']['study_materials']['Row'];
type StudyMaterialInsert = Database['public']['Tables']['study_materials']['Insert'];
type StudyMaterialUpdate = Database['public']['Tables']['study_materials']['Update'];

class StudyMaterialsService {
  async createStudyMaterial(data: Omit<StudyMaterialInsert, 'id' | 'created_at' | 'updated_at'>) {
    const { data: material, error } = await supabase
      .from('study_materials')
      .insert(data)
      .select()
      .single();

    if (error) throw this.handleError(error);
    return material;
  }

  async updateStudyMaterial(id: string, data: StudyMaterialUpdate) {
    const { data: material, error } = await supabase
      .from('study_materials')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw this.handleError(error);
    return material;
  }

  async getStudyMaterial(id: string) {
    const { data: material, error } = await supabase
      .from('study_materials')
      .select('*, profiles(name, avatar_url)')
      .eq('id', id)
      .single();

    if (error) throw this.handleError(error);
    return material;
  }

  async getUserStudyMaterials(userId: string) {
    const { data: materials, error } = await supabase
      .from('study_materials')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw this.handleError(error);
    return materials;
  }

  async getPublicStudyMaterials(subject?: string) {
    let query = supabase
      .from('study_materials')
      .select('*, profiles(name, avatar_url)')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (subject) {
      query = query.eq('subject', subject);
    }

    const { data: materials, error } = await query;

    if (error) throw this.handleError(error);
    return materials;
  }

  async deleteStudyMaterial(id: string) {
    const { error } = await supabase
      .from('study_materials')
      .delete()
      .eq('id', id);

    if (error) throw this.handleError(error);
  }

  private handleError(error: any): Error {
    console.error('Study materials service error:', error);
    return new Error(error.message || 'An error occurred while managing study materials');
  }
}

export const studyMaterialsService = new StudyMaterialsService();
