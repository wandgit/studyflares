import { useState } from 'react';
import Button from './Button';
import Card from './Card';
import { generateExam } from '../../services/geminiService';
import { useNavigate } from 'react-router-dom';
import { Clock, FileText, List } from 'lucide-react';
import useContentStore from '../../store/useContentStore';

const TIMER_OPTIONS = [
  { value: 30, label: '30 minutes' },
  { value: 60, label: '60 minutes' },
  { value: 90, label: '90 minutes' },
  { value: 120, label: '120 minutes' }
];

const EXAM_STRUCTURE = [
  { type: 'Multiple Choice', count: 10, points: 1 },
  { type: 'Short Answer', count: 10, points: 2 },
  { type: 'Problem Solving', count: 5, points: 5 },
  { type: 'Essay', count: 5, points: 5 }
];

const ExamTab = () => {
  const navigate = useNavigate();
  const { uploadedContent } = useContentStore();
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleStartExam = async () => {
    if (!uploadedContent) {
      alert('Please upload study materials before starting an exam.');
      return;
    }

    setIsGenerating(true);
    try {
      const exam = await generateExam(uploadedContent, selectedDuration);
      navigate('/exam', { state: { exam } });
    } catch (error) {
      console.error('Failed to generate exam:', error);
      alert('Failed to generate exam. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const totalPoints = EXAM_STRUCTURE.reduce((sum, section) => sum + section.count * section.points, 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Exam Information */}
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-medium flex items-center gap-2">
                <FileText size={20} />
                Exam Structure
              </h3>
              <p className="text-text opacity-70 mt-1">
                The exam consists of {EXAM_STRUCTURE.reduce((sum, section) => sum + section.count, 0)} questions
              </p>
            </div>

            <div className="space-y-4">
              {EXAM_STRUCTURE.map(section => (
                <div key={section.type} className="flex justify-between items-center p-3 bg-secondary/60 dark:bg-secondary/40 rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <List size={16} className="text-text/70" />
                    <span>{section.type}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">{section.count}</span> questions,{' '}
                    <span className="text-primary">{section.points} points</span> each
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <div className="text-sm text-text opacity-70">Total Points Available</div>
              <div className="text-2xl font-medium text-accent">{totalPoints} points</div>
            </div>
          </div>
        </Card>

        {/* Timer Selection and Start */}
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-medium flex items-center gap-2">
                <Clock size={20} />
                Select Duration
              </h3>
              <p className="text-text opacity-70 mt-1">
                Choose how long you need to complete the exam
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {TIMER_OPTIONS.map(option => (
                <button
                  key={option.value}
                  onClick={() => setSelectedDuration(option.value)}
                  className={`p-4 rounded-lg border transition-colors ${
                    selectedDuration === option.value
                      ? 'border-primary bg-primary/5 dark:bg-primary/10'
                      : 'border-border bg-secondary/60 dark:bg-secondary/40'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <Button
              variant="primary"
              className="w-full"
              onClick={handleStartExam}
              disabled={isGenerating || !uploadedContent}
            >
              {isGenerating ? 'Generating Exam...' : 'Start Exam'}
            </Button>

            <p className="text-sm text-text opacity-70 text-center">
              {uploadedContent 
                ? 'The exam will be generated based on your uploaded study materials'
                : 'Please upload study materials before starting an exam'}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ExamTab;
