export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  points: number;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  duration: number;
  created_at: string;
  updated_at: string;
}
