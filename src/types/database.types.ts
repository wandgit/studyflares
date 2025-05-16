export interface DBDocument {
  id: string;
  user_id: string;
  title: string;
  file_path: string;
  file_type: string;
  status: 'processing' | 'completed' | 'error';
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DBStudyMaterial {
  id: string;
  user_id: string;
  document_id: string | null;
  title: string;
  type: 'study_guide' | 'flashcards' | 'quiz' | 'concept_map' | 'exam' | 'practice_exam';
  content: Record<string, any>;
  is_public: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DBExam {
  id: string;
  user_id: string;
  title: string;
  description: string;
  duration_minutes: number;
  question_count: number;
  passing_score: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DBExamQuestion {
  id: string;
  exam_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  options: string[];
  correct_answer: string | string[];
  points: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PerformanceMetrics {
  accuracy_rate: number;
  completion_rate: number;
  average_time_per_question: number;
  difficulty_breakdown: {
    easy: number | null;
    medium: number | null;
    hard: number | null;
  };
}

export interface QuestionAnalytics {
  id: string;
  attempt_id: string;
  question_id: string;
  time_spent: string;
  score: number;
  is_correct: boolean;
  answer_text: string;
  feedback: string;
  key_concepts: string[];
  improvement_suggestions: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DBExamAttempt {
  id: string;
  user_id: string;
  exam_id: string;
  score: number;
  passed: boolean;
  start_time: string;
  end_time: string | null;
  total_time_spent: string;
  question_times: Record<string, number>;
  performance_metrics: PerformanceMetrics;
  question_feedback: Record<string, string>;
  strengths: string[];
  weaknesses: string[];
  improvement_areas: Record<string, string[]>;
  answers: Record<string, any>[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface WeeklyStudyTime {
  day: string;
  minutes: number;
}

export interface SubjectPerformance {
  subject: string;
  score: number;
}

export interface DBUserStatistics {
  id: string;
  user_id: string;
  study_time_minutes: number;
  exams_taken: number;
  exams_passed: number;
  materials_created: number;
  last_activity: string;
  weekly_study_time: WeeklyStudyTime[];
  subject_performance: SubjectPerformance[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DBActivity {
  id: string;
  user_id: string;
  activity_type: 'document_upload' | 'material_creation' | 'exam_attempt' | 'study_session';
  reference_id: string | null;
  reference_type: 'document' | 'study_material' | 'exam' | 'exam_attempt' | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}
