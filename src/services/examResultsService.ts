import { supabase } from '../config/supabase';
import { Database } from '../types/supabase';

type ExamResult = Database['public']['Tables']['exam_results']['Row'];
type ExamResultInsert = Database['public']['Tables']['exam_results']['Insert'];

class ExamResultsService {
  async createExamResult(data: Omit<ExamResultInsert, 'id' | 'created_at'>) {
    const { data: result, error } = await supabase
      .from('exam_results')
      .insert(data)
      .select()
      .single();

    if (error) throw this.handleError(error);
    return result;
  }

  async getUserExamResults(userId: string) {
    const { data: results, error } = await supabase
      .from('exam_results')
      .select('*, study_materials(title, subject)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw this.handleError(error);
    return results;
  }

  async getExamResult(id: string) {
    const { data: result, error } = await supabase
      .from('exam_results')
      .select('*, study_materials(title, subject), profiles(name)')
      .eq('id', id)
      .single();

    if (error) throw this.handleError(error);
    return result;
  }

  async getStudyMaterialResults(studyMaterialId: string) {
    const { data: results, error } = await supabase
      .from('exam_results')
      .select('*, profiles(name)')
      .eq('study_material_id', studyMaterialId)
      .order('score', { ascending: false });

    if (error) throw this.handleError(error);
    return results;
  }

  async deleteExamResult(id: string) {
    const { error } = await supabase
      .from('exam_results')
      .delete()
      .eq('id', id);

    if (error) throw this.handleError(error);
  }

  private handleError(error: any): Error {
    console.error('Exam results service error:', error);
    return new Error(error.message || 'An error occurred while managing exam results');
  }
}

export const examResultsService = new ExamResultsService();
