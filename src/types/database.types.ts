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

export interface DBExamAttempt {
  id: string;
  user_id: string;
  exam_id: string;
  score: number;
  passed: boolean;
  start_time: string;
  end_time: string | null;
  answers: Record<string, any>[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DBUserStatistics {
  id: string;
  user_id: string;
  study_time_minutes: number;
  exams_taken: number;
  exams_passed: number;
  materials_created: number;
  last_activity: string;
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
