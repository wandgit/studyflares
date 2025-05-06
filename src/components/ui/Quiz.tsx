import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../../services/geminiService';
import useProgressStore from '../../store/useProgressStore';
import TopicMasteryCard from './TopicMasteryCard';

interface QuizProps {
  questions: QuizQuestion[];
  topicId: string;
  topicName: string;
  onComplete?: (score: number, totalPoints: number) => void;
}

const Quiz: React.FC<QuizProps> = ({ questions, topicId, topicName, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(0);
  
  const { updateTopicProgress, addExperiencePoints } = useProgressStore();
  const currentQuestion = questions[currentQuestionIndex];

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
      {isComplete ? (
        <div className="text-center">
          <TopicMasteryCard topicId={topicId} topicName={topicName} />
          <h2 className="text-2xl font-bold my-4">Quiz Complete!</h2>
          <p className="text-xl mb-4">
            Your Score: {score + (selectedAnswer === questions[questions.length - 1].correctAnswer ? questions[questions.length - 1].points : 0)} /{' '}
            {questions.reduce((sum, q) => sum + q.points, 0)} points
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Start Over
          </button>
        </div>
      ) : (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-500">Difficulty: {currentQuestion.difficulty}</span>
            <span className="text-sm font-medium text-gray-500">{currentQuestion.points} points</span>
          </div>
          <h3 className="text-xl font-semibold mb-4">{currentQuestion.question}</h3>
          <div className="space-y-2">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={showExplanation}
                className={`w-full p-3 text-left rounded ${selectedAnswer === option
                  ? option === currentQuestion.correctAnswer
                    ? 'bg-green-100 border-green-500'
                    : 'bg-red-100 border-red-500'
                  : 'bg-gray-100 hover:bg-gray-200'
                  } ${showExplanation ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {option}
              </button>
            ))}
          </div>
          {showExplanation && (
            <div className="mt-4 p-4 bg-blue-50 rounded">
              <p className="text-blue-800">
                <strong>Explanation:</strong> {currentQuestion.explanation}
              </p>
            </div>
          )}
          {showExplanation && (
            <button
              onClick={handleNext}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </button>
          )}
          <div className="mt-4 text-gray-500">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;