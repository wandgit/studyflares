import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { examService } from '../services/database/exam';
import { examAnalyticsService } from '../services/database/examAnalytics';
import { Exam } from '../types/exam';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ExamPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeStarted, setTimeStarted] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examReport, setExamReport] = useState<ExamReport | null>(null);
  const [isGrading, setIsGrading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const loadExam = async () => {
      try {
        if (!examId) throw new Error('No exam ID provided');
        const loadedExam = await examService.getExam(examId);
        setExam(loadedExam);
        setTimeStarted(new Date());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load exam');
      } finally {
        setLoading(false);
      }
    };

    loadExam();
  }, [examId]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (!exam || !user || !timeStarted) return;

    setIsSubmitting(true);
    try {
      const timeTaken = Math.floor((new Date().getTime() - timeStarted.getTime()) / 1000);
      const score = calculateScore(exam, answers);
      const correctAnswers = exam.questions.reduce((acc, q) => {
        acc[q.id] = q.correctAnswer;
        return acc;
      }, {} as Record<string, string>);
      const feedback = generateFeedback(exam, answers);

      await examAnalyticsService.saveExamResult(
        user.id,
        exam.id,
        score,
        answers,
        correctAnswers,
        timeTaken,
        feedback
      );

      navigate(`/results/${exam.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit exam');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateScore = (exam: Exam, answers: Record<string, string>): number => {
    const totalQuestions = exam.questions.length;
    const correctAnswers = exam.questions.filter(q => answers[q.id] === q.correctAnswer).length;
    return Math.round((correctAnswers / totalQuestions) * 100);
  };

  const generateFeedback = (exam: Exam, answers: Record<string, string>): Record<string, string> => {
    return exam.questions.reduce((acc, q) => {
      const isCorrect = answers[q.id] === q.correctAnswer;
      acc[q.id] = isCorrect ? 'Correct!' : `Incorrect. The correct answer was: ${q.correctAnswer}`;
      return acc;
    }, {} as Record<string, string>);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!exam) return <div>No exam found</div>;

  const currentQuestion = exam.questions[currentQuestionIndex];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{exam.title}</h1>
      <p className="mb-6">{exam.description}</p>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Question {currentQuestionIndex + 1} of {exam.questions.length}</h2>
        <p className="mb-4">{currentQuestion.text}</p>

        <div className="space-y-2">
          {currentQuestion.options.map((option, index) => (
            <label key={index} className="flex items-center space-x-2">
              <input
                type="radio"
                name={`question-${currentQuestion.id}`}
                value={option}
                checked={answers[currentQuestion.id] === option}
                onChange={() => handleAnswerChange(currentQuestion.id, option)}
                className="form-radio"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
          disabled={currentQuestionIndex === 0}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>

        {currentQuestionIndex === exam.questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Exam'}
          </button>
        ) : (
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.min(exam.questions.length - 1, prev + 1))}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default ExamPage;
