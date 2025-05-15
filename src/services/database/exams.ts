import { DatabaseService } from './base';
import { DBExam, DBExamQuestion, DBExamAttempt } from '../../types/database.types';

export class ExamService extends DatabaseService {
  /**
   * Create a new exam
   */
  async createExam(
    userId: string,
    title: string,
    description: string,
    durationMinutes: number,
    questionCount: number,
    passingScore: number,
    metadata: Record<string, any> = {}
  ): Promise<DBExam> {
    try {
      const { data, error } = await this.supabase
        .from('exams')
        .insert({
          user_id: userId,
          title,
          description,
          duration_minutes: durationMinutes,
          question_count: questionCount,
          passing_score: passingScore,
          metadata
        })
        .select('*')
        .single();

      if (error) {
        return this.handleError(error);
      }

      return data as DBExam;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get all exams for a user
   */
  async getExams(userId: string): Promise<DBExam[]> {
    try {
      const { data, error } = await this.supabase
        .from('exams')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return this.handleError(error);
      }

      return data as DBExam[];
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get a single exam by ID
   */
  async getExam(examId: string): Promise<DBExam> {
    try {
      const { data, error } = await this.supabase
        .from('exams')
        .select('*')
        .eq('id', examId)
        .single();

      if (error) {
        return this.handleError(error);
      }

      return data as DBExam;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update an exam
   */
  async updateExam(
    examId: string,
    updates: Partial<Omit<DBExam, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<DBExam> {
    try {
      const { data, error } = await this.supabase
        .from('exams')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', examId)
        .select('*')
        .single();

      if (error) {
        return this.handleError(error);
      }

      return data as DBExam;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete an exam
   */
  async deleteExam(examId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('exams')
        .delete()
        .eq('id', examId);

      if (error) {
        return this.handleError(error);
      }
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Add a question to an exam
   */
  async addQuestion(
    examId: string,
    questionText: string,
    questionType: 'multiple_choice' | 'true_false' | 'short_answer',
    options: string[],
    correctAnswer: string | string[],
    points: number,
    metadata: Record<string, any> = {}
  ): Promise<DBExamQuestion> {
    try {
      const { data, error } = await this.supabase
        .from('exam_questions')
        .insert({
          exam_id: examId,
          question_text: questionText,
          question_type: questionType,
          options,
          correct_answer: correctAnswer,
          points,
          metadata
        })
        .select('*')
        .single();

      if (error) {
        return this.handleError(error);
      }

      return data as DBExamQuestion;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get all questions for an exam
   */
  async getQuestions(examId: string): Promise<DBExamQuestion[]> {
    try {
      const { data, error } = await this.supabase
        .from('exam_questions')
        .select('*')
        .eq('exam_id', examId);

      if (error) {
        return this.handleError(error);
      }

      return data as DBExamQuestion[];
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Start an exam attempt
   */
  async startExamAttempt(
    userId: string,
    examId: string,
    metadata: Record<string, any> = {}
  ): Promise<DBExamAttempt> {
    try {
      const { data, error } = await this.supabase
        .from('exam_attempts')
        .insert({
          user_id: userId,
          exam_id: examId,
          score: 0,
          passed: false,
          start_time: new Date().toISOString(),
          end_time: null,
          answers: [],
          metadata
        })
        .select('*')
        .single();

      if (error) {
        return this.handleError(error);
      }

      return data as DBExamAttempt;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Submit an exam attempt
   */
  async submitExamAttempt(
    attemptId: string,
    answers: Record<string, any>[],
    score: number,
    passed: boolean,
    metadata: Record<string, any> = {}
  ): Promise<DBExamAttempt> {
    try {
      const { data, error } = await this.supabase
        .from('exam_attempts')
        .update({
          end_time: new Date().toISOString(),
          answers,
          score,
          passed,
          metadata: {
            ...metadata,
            completed: true
          }
        })
        .eq('id', attemptId)
        .select('*')
        .single();

      if (error) {
        return this.handleError(error);
      }

      return data as DBExamAttempt;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get all attempts for a user
   */
  async getUserAttempts(userId: string): Promise<DBExamAttempt[]> {
    try {
      const { data, error } = await this.supabase
        .from('exam_attempts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return this.handleError(error);
      }

      return data as DBExamAttempt[];
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get all attempts for an exam
   */
  async getExamAttempts(examId: string): Promise<DBExamAttempt[]> {
    try {
      const { data, error } = await this.supabase
        .from('exam_attempts')
        .select('*')
        .eq('exam_id', examId)
        .order('created_at', { ascending: false });

      if (error) {
        return this.handleError(error);
      }

      return data as DBExamAttempt[];
    } catch (error) {
      return this.handleError(error);
    }
  }
}
