import React, { useState, useEffect } from 'react';
import { QuizQuestion, QuestionDifficulty, DIFFICULTY_ORDER, generateQuiz } from '../../services/geminiService';
import useProgressStore from '../../store/useProgressStore';
import TopicMasteryCard from './TopicMasteryCard';
import { Loader2 } from 'lucide-react';

interface QuizProps {
  initialQuestions: QuizQuestion[];
  content: string;
  topicId: string;
  topicName: string;
  onComplete?: (score: number, totalPoints: number) => void;
}

const Quiz: React.FC<QuizProps> = ({ initialQuestions, content, topicId, topicName, onComplete }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => {
    // Ensure exactly 20 questions
    return initialQuestions.slice(0, 20);
  });
  const [isLoading, setIsLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(() => {
    const saved = localStorage.getItem(`quiz_attempt_${topicId}`);
    return saved ? parseInt(saved) : 0;
  });
  const [currentDifficulty, setCurrentDifficulty] = useState(() => {
    const saved = localStorage.getItem(`quiz_difficulty_${topicId}`);
    return saved ? saved as QuestionDifficulty : QuestionDifficulty.BEGINNER;
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(0);
  
  const { updateTopicProgress, addExperiencePoints } = useProgressStore();
  const currentQuestion = questions[currentQuestionIndex];

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem(`quiz_attempt_${topicId}`, attemptCount.toString());
    localStorage.setItem(`quiz_difficulty_${topicId}`, currentDifficulty);
  }, [attemptCount, currentDifficulty, topicId]);

  useEffect(() => {
    if (isComplete) {
      const totalQuestions = questions.length;
      const correctAnswers = score / 10; // Assuming each question is worth 10 points
      
      // Update topic progress
      updateTopicProgress(topicId, {
        id: topicId,
        name: topicName,
        quizzesTaken: 1,
        correctAnswers,
        totalQuestions,
        lastStudied: new Date(),
      });

      // Award XP based on performance
      const baseXP = 50;
      const accuracyBonus = Math.floor((score / (totalQuestions * 10)) * 50);
      addExperiencePoints(baseXP + accuracyBonus);
    }
  }, [isComplete, score, questions.length, topicId, topicName, updateTopicProgress, addExperiencePoints]);

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setScore(score + currentQuestion.points);
    }
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setIsComplete(true);
      const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
      onComplete?.(score + (selectedAnswer === currentQuestion.correctAnswer ? currentQuestion.points : 0), totalPoints);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="text-sm font-medium text-text/70 mb-4">
        Attempt #{attemptCount + 1} • Level: {currentDifficulty}
      </div>
      {isComplete ? (
        <div className="text-center">
          <TopicMasteryCard topicId={topicId} topicName={topicName} />
          <h2 className="text-2xl font-bold my-4">Quiz Complete!</h2>
          <p className="text-xl mb-4">
            Your Score: {score + (selectedAnswer === questions[questions.length - 1].correctAnswer ? questions[questions.length - 1].points : 0)} /{' '}
            {questions.reduce((sum, q) => sum + q.points, 0)} points
          </p>
          <button
            onClick={async () => {
              setIsLoading(true);
              try {
                // Get next difficulty level
                const currentIndex = DIFFICULTY_ORDER.indexOf(currentDifficulty);
                const nextDifficulty = currentIndex < DIFFICULTY_ORDER.length - 1
                  ? DIFFICULTY_ORDER[currentIndex + 1]
                  : currentDifficulty;
                
                // Generate new questions at higher difficulty
                const newQuestions = await generateQuiz(content, nextDifficulty);
                
                // Reset quiz state with new questions (ensure 20 questions)
                setQuestions(newQuestions.slice(0, 20));
                setCurrentQuestionIndex(0);
                setSelectedAnswer(null);
                setShowExplanation(false);
                setIsComplete(false);
                setScore(0);
                setAttemptCount(prev => prev + 1);
                setCurrentDifficulty(nextDifficulty);
              } catch (error) {
                console.error('Failed to generate new questions:', error);
                alert('Failed to generate new questions. Please try again.');
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating New Quiz...
              </>
            ) : (
              <>Start Over (Next Level: {
              (() => {
                const currentIndex = DIFFICULTY_ORDER.indexOf(currentDifficulty);
                return currentIndex < DIFFICULTY_ORDER.length - 1
                  ? DIFFICULTY_ORDER[currentIndex + 1]
                  : 'MAX LEVEL';
              })()}
              )</>
            )}
          </button>
        </div>
      ) : (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-text/70">Difficulty: {currentQuestion.difficulty}</span>
            <span className="text-sm font-medium text-text/70">{currentQuestion.points} points</span>
          </div>
          <h3 className="text-xl font-semibold mb-4">{currentQuestion.question}</h3>
          <div className="space-y-2">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={showExplanation}
                className={`w-full p-3 text-left rounded transition-colors ${selectedAnswer === option
                  ? option === currentQuestion.correctAnswer
                    ? 'bg-green-500/10 dark:bg-green-500/20 text-green-700 dark:text-green-300 border border-green-500/50'
                    : 'bg-red-500/10 dark:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/50'
                  : 'bg-secondary hover:bg-secondary/80'
                  } ${showExplanation ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {option}
              </button>
            ))}
          </div>
          {showExplanation && (
            <div className="mt-4 p-4 bg-primary/5 dark:bg-primary/10 rounded border border-primary/20">
              <p className="text-text/90">
                <strong>Explanation:</strong> {currentQuestion.explanation}
              </p>
            </div>
          )}
          {showExplanation && (
            <button
              onClick={handleNext}
              className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded transition-colors"
            >
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </button>
          )}
          <div className="mt-4 text-text/70">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;