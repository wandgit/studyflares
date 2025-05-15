import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Exam, ExamQuestion } from '../services/geminiService';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const ExamPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const exam = location.state?.exam as Exam;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  // Initialize timer from localStorage or exam duration
  const [timeLeft, setTimeLeft] = useState(() => {
    const savedTime = localStorage.getItem(`exam-${exam?.id}-time`);
    return savedTime ? parseInt(savedTime) : exam?.duration * 60;
  });
  
  useEffect(() => {
    if (!exam) {
      navigate('/study?tab=exam');
      return;
    }

    // Save initial time if not already saved
    if (!localStorage.getItem(`exam-${exam.id}-time`)) {
      localStorage.setItem(`exam-${exam.id}-time`, String(exam.duration * 60));
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev <= 1 ? 0 : prev - 1;
        localStorage.setItem(`exam-${exam.id}-time`, String(newTime));
        
        if (newTime === 0) {
          clearInterval(timer);
          handleSubmit();
        }
        return newTime;
      });
    }, 1000);

    // Cleanup timer and storage on unmount
    return () => {
      clearInterval(timer);
      if (timeLeft <= 0) {
        localStorage.removeItem(`exam-${exam.id}-time`);
      }
    };
  }, [exam, navigate]);

  const handleSubmit = () => {
    if (!exam) {
      console.error('No exam data available');
      navigate('/study?tab=exam');
      return;
    }

    const examData = { exam, answers };
    console.log('Submitting exam with data:', examData);
    
    // Store in session storage as backup
    sessionStorage.setItem('examData', JSON.stringify(examData));

    // Navigate to results page
    navigate('/exam/results', { 
      state: examData,
      replace: true // Replace current history entry to prevent back navigation
    });
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [exam.questions[currentQuestion].id]: value
    }));
  };

  const renderQuestion = (question: ExamQuestion) => {
    switch (question.type) {
      case 'multipleChoice':
        return (
          <div className="space-y-4">
            {question.options?.map((option, index) => (
              <label
                key={index}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-secondary cursor-pointer"
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={answers[question.id] === option}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  className="mt-1"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'shortAnswer':
      case 'essay':
      case 'problemSolving':
        return (
          <textarea
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
            className="w-full h-48 p-3 rounded-lg bg-secondary resize-none"
            placeholder="Type your answer here..."
          />
        );
    }
  };

  if (!exam) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Timer */}
      <div className="fixed top-4 right-4 bg-paper dark:bg-paper-dark shadow-lg rounded-lg p-4">
        <div className="text-2xl font-mono">{formatTime(timeLeft)}</div>
      </div>

      <div className="max-w-3xl mx-auto">
        <Card className="p-6">
          <div className="space-y-6">
            {/* Question number and type */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-medium">
                  Question {currentQuestion + 1} of {exam.questions.length}
                </h2>
                <p className="text-text dark:text-white opacity-70 capitalize">
                  {exam.questions[currentQuestion].type}
                </p>
              </div>
              <div className="text-accent font-medium">
                {exam.questions[currentQuestion].points} points
              </div>
            </div>

            {/* Question text */}
            <div className="text-lg">
              {exam.questions[currentQuestion].question}
            </div>

            {/* Answer input */}
            <div className="mt-6">
              {renderQuestion(exam.questions[currentQuestion])}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(prev => prev - 1)}
                disabled={currentQuestion === 0}
              >
                <ArrowLeft className="mr-2" size={20} />
                Previous
              </Button>

              {currentQuestion === exam.questions.length - 1 ? (
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                >
                  Submit Exam
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestion(prev => prev + 1)}
                >
                  Next
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ExamPage;
