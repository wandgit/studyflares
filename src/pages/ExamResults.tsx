import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Exam, ExamReport, gradeExam } from '../services/geminiService';
import { ArrowLeft, Check, X } from 'lucide-react';
import GradingLoader from '../components/ui/GradingLoader';
import useProgressStore from '../store/useProgressStore';
import { toast } from 'react-hot-toast';

interface ExamResultsProps {
  exam: Exam;
  answers: Record<string, string>;
}

const ExamResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [report, setReport] = useState<ExamReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressUpdated, setProgressUpdated] = useState(false);
  
  // Get progress store methods
  const { recordExamResult } = useProgressStore();

  // Get exam data from state or session storage
  const getExamData = () => {
    // Try to get from location state first
    if (location.state?.exam && location.state?.answers) {
      console.log('Got exam data from location state:', location.state);
      return location.state as ExamResultsProps;
    }

    // Try to get from session storage as fallback
    const storedData = sessionStorage.getItem('examData');
    if (storedData) {
      console.log('Got exam data from session storage');
      return JSON.parse(storedData) as ExamResultsProps;
    }

    console.error('No exam data found in state or storage');
    return null;
  };

  useEffect(() => {
    const examData = getExamData();
    
    if (!examData) {
      setError('No exam data available. Please try again.');
      setIsLoading(false);
      return;
    }

    // Store in session storage as backup
    sessionStorage.setItem('examData', JSON.stringify(examData));

    const loadResults = async () => {
      try {
        console.log('Starting exam grading...');
        const examReport = await gradeExam(examData.exam, examData.answers);
        console.log('Received exam report:', examReport);
        setReport(examReport);
      } catch (error: any) {
        console.error('Failed to grade exam:', error);
        setError(`Failed to generate exam results: ${error?.message || 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadResults();
  }, [location.state]);

  // Update progress tracking when report is available
  useEffect(() => {
    if (report && !progressUpdated) {
      const examData = getExamData();
      if (!examData?.exam) return;
      
      // Extract topic ID and name from the filename
      const uploadedFileName = sessionStorage.getItem('uploadedFileName') || 'unknown-document';
      const topicId = uploadedFileName.replace(/\.[^/.]+$/, '') || 'default-topic';
      const topicName = uploadedFileName.replace(/\.[^/.]+$/, '').replace(/-/g, ' ') || 'Default Topic';
      
      // Record the exam result in progress tracking
      recordExamResult(topicId, topicName, report.score);
      
      // Show a toast notification
      toast.success('Progress updated based on exam performance');
      
      // Prevent duplicate updates
      setProgressUpdated(true);
    }
  }, [report, progressUpdated, recordExamResult]);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-medium mb-4">Error</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <Button variant="outline" onClick={() => navigate('/study?tab=exam')}>
            <ArrowLeft className="mr-2" size={20} />
            Back to Exam
          </Button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <GradingLoader />;
  }

  if (!report) return null;

  const examData = getExamData();
  if (!examData?.exam || !examData?.answers) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-medium mb-4">Error</h2>
          <p className="text-red-600 mb-6">Missing exam data</p>
          <Button variant="outline" onClick={() => navigate('/study?tab=exam')}>
            <ArrowLeft className="mr-2" size={20} />
            Back to Exam
          </Button>
        </Card>
      </div>
    );
  }

  const { exam, answers } = examData;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Overall Score */}
        <Card className="p-8">
          <div className="text-center">
            <h1 className="text-4xl font-medium mb-2">Exam Results</h1>
            <div className="text-6xl font-bold text-leather my-6">
              {Math.round(report.score)}%
            </div>
            <p className="text-lg mb-6">
              {report.score >= 90 ? 'Excellent work! You have mastered this material.' :
               report.score >= 80 ? 'Great job! You have a strong understanding of the material.' :
               report.score >= 70 ? 'Good work! You understand most of the material.' :
               report.score >= 60 ? 'You have a basic understanding of the material, but there are areas to improve.' :
               'You should review this material more thoroughly before moving on.'}
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => navigate('/study?tab=progress')}>
                View Progress
              </Button>
              <Button variant="primary" onClick={() => navigate('/study?tab=exam')}>
                New Exam
              </Button>
            </div>
          </div>
        </Card>

        {/* Question Breakdown */}
        <div className="space-y-6">
          <h2 className="text-2xl font-medium">Question Breakdown</h2>
          {exam.questions.map((question, index) => (
            <Card key={question.id} className="p-6">
              <div className="space-y-4">
                {/* Question header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-medium">Question {index + 1}</h3>
                    <p className="text-text opacity-70 capitalize">{question.type}</p>
                  </div>
                  <div className="flex items-center">
                    {report.questionScores[question.id] === question.points ? (
                      <div className="flex items-center text-green-600">
                        <Check className="text-green-500" />
                        <span className="text-sm">{report.questionScores[question.id]} / {question.points} points</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600">
                        <X className="text-red-500" />
                        <span className="text-sm">{report.questionScores[question.id]} / {question.points} points</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Question content */}
                <div>
                  <div key={question.id} className="mb-8 last:mb-0">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <h3 className="text-lg font-medium flex-grow">{question.question}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${report.questionScores[question.id] === question.points ? 'text-green-500' : 'text-red-500'}`}>
                          {report.questionScores[question.id]} / {question.points} points
                        </span>
                        {report.questionScores[question.id] === question.points ? (
                          <Check className="text-green-500" />
                        ) : (
                          <X className="text-red-500" />
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-sm font-medium mb-2">Your Answer:</div>
                      <div className="bg-secondary p-3 rounded">
                        {answers[question.id] || <span className="text-red-500">No answer provided</span>}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-sm font-medium mb-2">Feedback:</div>
                      <div className="bg-secondary p-3 rounded prose prose-sm max-w-none" 
                        dangerouslySetInnerHTML={{ 
                          __html: report.feedback[question.id]
                            .replace(/&lt;/g, '<')
                            .replace(/&gt;/g, '>')
                        }} 
                      />
                    </div>

                    <div className="mb-4">
                      <div className="text-sm font-medium mb-2">Areas for Improvement:</div>
                      <ul className="list-disc list-inside bg-secondary p-3 rounded space-y-1">
                        {report.improvements[question.id].map((improvement, i) => (
                          <li key={i} className="text-yellow-500">{improvement}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="text-sm font-medium mb-2">Key Concepts to Review:</div>
                      <ul className="list-disc list-inside bg-secondary p-3 rounded space-y-1">
                        {report.keyConcepts[question.id].slice(0, 4).map((concept, i) => (
                          <li key={i} className="text-blue-500">{concept}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Feedback */}
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium mb-2">Feedback</h4>
                  <p className="text-text opacity-70 whitespace-pre-line">
                    {report.feedback[question.id]}
                  </p>
                  {report.improvements[question.id] && (
                    <>
                      <h4 className="font-medium mt-4 mb-2">Areas for Improvement</h4>
                      <ul className="list-disc list-inside text-text opacity-70">
                        {report.improvements[question.id].map((item: string, i: number) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Overall Report */}
        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-medium mb-4">Teacher's Remarks</h2>
          <div 
            className="mb-6" 
            dangerouslySetInnerHTML={{ __html: report.overallFeedback }}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div>
              <h3 className="text-lg font-medium mb-3 text-green-600">Areas of Strength</h3>
              <ul className="space-y-2">
                {report.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div>
              <h3 className="text-lg font-medium mb-3 text-yellow-600">Areas for Improvement</h3>
              <ul className="space-y-2">
                {report.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    {weakness}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => navigate('/study?tab=exam')}>
            <ArrowLeft className="mr-2" size={20} />
            Back to Exam
          </Button>
          <Button variant="primary" onClick={() => navigate('/study?tab=progress')}>
            View Progress
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExamResults;
