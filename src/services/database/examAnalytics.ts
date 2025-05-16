import { DatabaseService } from './base';
import { DBExamAttempt } from '../../types/database.types';
import { ExamReport } from '../geminiService';
import { supabase } from './supabase';

interface PerformanceMetrics {
  strengths: string[];
  weaknesses: string[];
  timeSpent: number;
  questionTimes: Record<string, number>;
  conceptMastery: Record<string, number>;
}

export interface ExamResult {
  id: string;
  user_id: string;
  exam_id: string;
  score: number;
  answers: Record<string, string>;
  correct_answers: Record<string, string>;
  time_taken: number;
  feedback: Record<string, string>;
  created_at: string;
}

export class ExamAnalyticsService {
  /**
   * Save detailed exam analytics
   */
  async saveExamResult(
    userId: string,
    examId: string,
    score: number,
    answers: Record<string, string>,
    correctAnswers: Record<string, string>,
    timeTaken: number,
    feedback: Record<string, string>
  ): Promise<ExamResult> {
    const { data, error } = await supabase
      .from('exam_results')
      .insert({
        user_id: userId,
        exam_id: examId,
        score,
        answers,
        correct_answers: correctAnswers,
        time_taken: timeTaken,
        feedback
      })
      .select()
      .single();

    if (error) throw error;
    return data as ExamResult;
  }

  async getExamResults(userId: string): Promise<ExamResult[]> {
    const { data, error } = await supabase
      .from('exam_results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as ExamResult[];
  }

  async getExamResult(resultId: string): Promise<ExamResult> {
    const { data, error } = await supabase
      .from('exam_results')
      .select('*')
      .eq('id', resultId)
      .single();

    if (error) throw error;
    return data as ExamResult;
  }
  async saveExamAnalytics(
    attemptId: string,
    report: ExamReport,
    timeSpent: number,
    questionTimes: Record<string, number>
  ) {
    try {
      const totalQuestions = Object.keys(report.questionScores).length;
      const correctAnswers = Object.values(report.questionScores).filter(
        score => score > 0
      ).length;

      // Calculate concept mastery
      const conceptMastery = Object.entries(report.keyConcepts).reduce((acc, [qId, concepts]) => {
        concepts.forEach(concept => {
          if (!acc[concept]) acc[concept] = { total: 0, correct: 0 };
          acc[concept].total++;
          if (report.questionScores[qId] > 0) acc[concept].correct++;
        });
        return acc;
      }, {} as Record<string, { total: number; correct: number }>);

      const metrics: PerformanceMetrics = {
        strengths: report.strengths,
        weaknesses: report.weaknesses,
        timeSpent,
        questionTimes,
        conceptMastery: Object.entries(conceptMastery).reduce((acc, [concept, stats]) => {
          acc[concept] = (stats.correct / stats.total) * 100;
          return acc;
        }, {} as Record<string, number>)
      };

      // Save attempt analytics
      const { data: attempt, error } = await supabase
        .from('exam_attempts')
        .update({
          score: (correctAnswers / totalQuestions) * 100,
          strengths: metrics.strengths,
          weaknesses: metrics.weaknesses,
          key_concepts: report.keyConcepts,
          improvement_suggestions: report.improvements,
          time_tracking: {
            total: metrics.timeSpent,
            questions: metrics.questionTimes
          },
          performance_metrics: {
            accuracy: (correctAnswers / totalQuestions) * 100,
            conceptMastery: metrics.conceptMastery,
            timeSpent: metrics.timeSpent,
            avgTimePerQuestion: metrics.timeSpent / totalQuestions
          },
          total_time_spent: `${timeSpent} seconds`,
          question_times: questionTimes,
          question_feedback: report.feedback,
          improvement_areas: report.improvements,
          status: 'completed',
          end_time: new Date().toISOString()
        })
        .eq('id', attemptId)
        .select('*')
        .single();

      if (error) throw error;

      // Save detailed question analytics
      await this.saveQuestionAnalytics(attemptId, report, questionTimes);

      return attempt;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Save analytics for individual questions
   */
  private async saveQuestionAnalytics(
    attemptId: string,
    report: ExamReport,
    questionTimes: Record<string, number>
  ) {
    const analytics = Object.entries(report.questionScores).map(
      ([qId, score]) => ({
        attempt_id: attemptId,
        question_id: qId,
        time_spent: questionTimes[qId] || 0,
        score,
        is_correct: score > 0,
        feedback: report.feedback[qId],
        key_concepts: report.keyConcepts[qId] || [],
        improvement_suggestions: report.improvements[qId] || [],
        metadata: {
          strengths: report.strengths.filter(s => 
            report.feedback[qId]?.toLowerCase().includes(s.toLowerCase())
          ),
          weaknesses: report.weaknesses.filter(w => 
            report.feedback[qId]?.toLowerCase().includes(w.toLowerCase())
          )
        }
      })
    );

    const { error } = await supabase
      .from('question_analytics')
      .upsert(analytics, { onConflict: 'attempt_id,question_id' });

    if (error) throw error;
  }

  /**
   * Get analytics for a specific exam attempt
   */
  async getAttemptAnalytics(attemptId: string) {
    try {
      const { data: attempt, error: attemptError } = await supabase
        .from('exam_attempts')
        .select(`
          *,
          exam:exams(*),
          questions:question_analytics(*)
        `)
        .eq('id', attemptId)
        .single();

      if (attemptError) throw attemptError;
      return attempt;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get performance trends for a user
   */
  async getUserPerformanceTrends(userId: string) {
    try {
      type ExamAttemptWithExam = {
        id: string;
        score: number;
        performance_metrics: Record<string, any>;
        created_at: string;
        exam: { id: string; title: string };
      };

      const { data, error } = await supabase
        .from('exam_attempts')
        .select(`
          id,
          score,
          performance_metrics,
          created_at,
          exam:exams!inner(id, title)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (!data) throw new Error('No attempts found');
      if (error) throw error;

      const attempts = data as unknown as ExamAttemptWithExam[];

      return attempts.map(attempt => ({
        id: attempt.id,
        examTitle: attempt.exam?.title || 'Unknown Exam',
        score: attempt.score,
        metrics: attempt.performance_metrics,
        date: attempt.created_at
      }));
    } catch (error) {
      throw error;
    }
  }
}



export const examAnalyticsService = new ExamAnalyticsService();
