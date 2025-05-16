import { supabase } from './supabase';
import { Exam } from '../../types/exam';

class ExamService {
  async getExam(examId: string): Promise<Exam> {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('id', examId)
      .single();

    if (error) throw error;
    return data as Exam;
  }

  async listExams(): Promise<Exam[]> {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Exam[];
  }
}

export const examService = new ExamService();
