import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StudyCard from '../components/ui/StudyCard';
import ChatInterface from '../components/ui/ChatInterface';
import { BookOpen, Book, HelpCircle, MessageSquare, Loader, Network, Trophy, PenTool, LibraryIcon } from 'lucide-react';
import ConceptMap from '../components/ui/ConceptMap';
import type { ConceptNode, ConceptEdge } from '../components/ui/ConceptMap';
import useContentStore from '../store/useContentStore';
import useProgressStore from '../store/useProgressStore';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import StudyTimer from '../components/ui/StudyTimer';
import TopicMasteryCard from '../components/ui/TopicMasteryCard';
import LevelProgressCard from '../components/ui/LevelProgressCard';
import Quiz from '../components/ui/Quiz';
import ExamTab from '../components/ui/ExamTab';
import SaveToLibraryButton from '../components/SaveToLibraryButton';
import { AuthTrigger } from '../components/auth/AuthTrigger';


type StudyTab = 'guides' | 'flashcards' | 'quizzes' | 'chat' | 'concept-map' | 'exam' | 'progress';

const StudyPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<StudyTab>('guides');
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  
  // Get content from our global stores
  const { 
    uploadedContent, 
    uploadedFileName,
    studyGuide, 
    flashcards, 
    quiz, 
    conceptMap,
    isProcessing,
    processingError,
    generateStudyMaterials,
    chatMessages,
    sendChatMessage,
    isChatLoading
  } = useContentStore();

  const { updateTopicProgress, addExperiencePoints } = useProgressStore();

  // Extract topic ID and name from the file name
  const topicId = uploadedFileName?.replace(/\.[^/.]+$/, '') || 'default-topic';
  const topicName = uploadedFileName?.replace(/\.[^/.]+$/, '').replace(/-/g, ' ') || 'Default Topic';
  
  // Set active tab based on URL query param
  useEffect(() => {
    const tab = searchParams.get('tab') as StudyTab | null;
    if (tab && ['guides', 'flashcards', 'quizzes', 'chat', 'concept-map', 'exam', 'progress'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  
  // Generate study materials if we have content but no study materials
  useEffect(() => {
    if (uploadedContent && !studyGuide && !isProcessing && !processingError) {
      generateStudyMaterials();
    }
  }, [uploadedContent, studyGuide, isProcessing, processingError, generateStudyMaterials]);
  
  // Update URL when tab changes
  const handleTabChange = (tab: StudyTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };
  
  // Handle flashcard navigation
  const handleNextFlashcard = () => {
    if (flashcards && currentFlashcardIndex < flashcards.length - 1) {
      setCurrentFlashcardIndex(currentFlashcardIndex + 1);
      setShowAnswer(false);
    }
  };
  
  const handlePreviousFlashcard = () => {
    if (currentFlashcardIndex > 0) {
      setCurrentFlashcardIndex(currentFlashcardIndex - 1);
      setShowAnswer(false);
    }
  };
  
  // Handle quiz completion
  const handleQuizComplete = (score: number, totalPoints: number) => {
    // Update topic progress and award XP
    updateTopicProgress(topicId, {
      id: topicId,
      name: topicName,
      quizzesTaken: 1,
      correctAnswers: score / 10, // Assuming each question is worth 10 points
      totalQuestions: quiz?.length || 0,
      lastStudied: new Date(),
    });

    // Award XP based on performance
    const baseXP = 50;
    const accuracyBonus = Math.floor((score / totalPoints) * 50);
    addExperiencePoints(baseXP + accuracyBonus);
  };

  // Handle study session completion
  const handleStudySessionComplete = () => {
    // Update topic progress
    updateTopicProgress(topicId, {
      id: topicId,
      name: topicName,
      lastStudied: new Date(),
    });
  };

  // Handle chat messages
  const handleSendMessage = async (message: string): Promise<string> => {
    await sendChatMessage(message);
    return message; // Return the original message as a string to satisfy the type requirement
  };

  // Render tab content
  const renderTabContent = () => {
    if (!uploadedContent) {
      return (
        <Card className="p-6 text-center">
          <p className="mb-4">No content uploaded. Please upload content first.</p>
          <AuthTrigger returnUrl="/upload">
            <Button variant="primary">
              Upload Content
            </Button>
          </AuthTrigger>
        </Card>
      );
    }

    if (isProcessing) {
      return (
        <Card className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Loader className="animate-spin" />
            <p>Generating study materials...</p>
          </div>
        </Card>
      );
    }

    if (processingError) {
      return (
        <Card className="p-6 text-center">
          <p className="text-red-500 mb-4">{processingError}</p>
          <Button variant="primary" onClick={generateStudyMaterials}>
            Try Again
          </Button>
        </Card>
      );
    }

    switch (activeTab) {
      case 'guides':
        if (!studyGuide) {
          return (
            <Card className="p-6 text-center">
              <p className="mb-4">No study guide available. Please upload content first.</p>
              <Button variant="primary" onClick={() => navigate('/upload')}>
                Upload Content
              </Button>
            </Card>
          );
        }
        
        return (
          <div className="space-y-6">
            <div className="flex justify-end">
              <div className="flex gap-4">
                <Button variant="secondary" onClick={() => navigate('/library')}>
                  <LibraryIcon className="h-4 w-4 mr-2" />
                  View Library
                </Button>
                <SaveToLibraryButton />
              </div>
            </div>
            <Card className="p-6">
              <div className="prose max-w-none">
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>{studyGuide}</ReactMarkdown>
              </div>
            </Card>
          </div>
        );

      case 'flashcards':
        if (!flashcards || flashcards.length === 0) {
          return (
            <Card className="p-6 text-center">
              <p className="mb-4">No flashcards available. Please upload content first.</p>
              <Button variant="primary" onClick={() => navigate('/upload')}>
                Upload Content
              </Button>
            </Card>
          );
        }
        
        return (
          <div className="space-y-6">
            <div className="flex justify-end">
              <SaveToLibraryButton />
            </div>
            <StudyCard
              question={flashcards[currentFlashcardIndex].question}
              answer={flashcards[currentFlashcardIndex].answer}
              showAnswer={showAnswer}
              onToggleAnswer={() => setShowAnswer(!showAnswer)}
              onNext={handleNextFlashcard}
              onPrevious={handlePreviousFlashcard}
              currentIndex={currentFlashcardIndex}
              totalCards={flashcards.length}
            />
          </div>
        );

      case 'quizzes':
        if (!quiz || quiz.length === 0) {
          return (
            <Card className="p-6 text-center">
              <p className="mb-4">No quiz available. Please upload content first.</p>
              <Button variant="primary" onClick={() => navigate('/upload')}>
                Upload Content
              </Button>
            </Card>
          );
        }
        
        return (
          <div className="space-y-6">
            <div className="flex justify-end">
              <SaveToLibraryButton />
            </div>
            <Quiz
              initialQuestions={quiz || []}
              content={uploadedContent || ''}
              topicId={topicId}
              topicName={topicName}
              onComplete={handleQuizComplete}
            />
          </div>
        );

      case 'chat':
        return (
          <div className="space-y-6">
            <div className="flex justify-end">
              <SaveToLibraryButton />
            </div>
            <ChatInterface
              onSendMessage={handleSendMessage}
              placeholder="Ask questions about your study materials..."
              messages={chatMessages}
              isLoading={isChatLoading}
            />
          </div>
        );

      case 'concept-map':
        if (!conceptMap) {
          return (
            <Card className="p-6 text-center">
              <p className="mb-4">No concept map available. Please upload content first.</p>
              <Button variant="primary" onClick={() => navigate('/upload')}>
                Upload Content
              </Button>
            </Card>
          );
        }
        
        return (
          <div className="h-[calc(100vh-200px)]">
            <div className="flex justify-end mb-4">
              <SaveToLibraryButton />
            </div>
            {conceptMap && (
              <ConceptMap
                concepts={{
                  nodes: conceptMap.nodes.map(node => ({
                    id: node.id,
                    label: node.label,
                    level: node.level,
                    category: 'General',
                    description: '',
                    examples: []
                  })) as ConceptNode[],
                  edges: conceptMap.edges.map(edge => ({
                    id: edge.id,
                    from: edge.from,
                    to: edge.to,
                    label: edge.label || '',
                    type: 'default'
                  })) as ConceptEdge[]
                }}
              />
            )}
          </div>
        );
        
      case 'exam':
        return (
          <div>
            <div className="flex justify-end mb-4">
              <SaveToLibraryButton />
            </div>
            <ExamTab />
          </div>
        );
        
      case 'progress':
        return (
          <div className="space-y-6">
            <TopicMasteryCard topicId={topicId} topicName={topicName} />
            <LevelProgressCard topicId={topicId} topicName={topicName} />
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="font-heading text-4xl">Study Materials</h1>
          <StudyTimer onComplete={handleStudySessionComplete} />
        </div>
        <p className="text-text dark:text-white opacity-70">
          {uploadedFileName ? `Generated from: ${uploadedFileName}` : 'Upload content to generate study materials'}
        </p>
      </div>
      
      <div className="flex mb-6 border-b border-secondary">
        <button
          className={`px-4 py-3 flex items-center gap-2 border-b-2 ${
            activeTab === 'guides' ? 'border-accent text-accent' : 'border-transparent'
          }`}
          onClick={() => handleTabChange('guides')}
        >
          <BookOpen size={20} />
          <span>Study Guide</span>
        </button>
        
        <button
          className={`px-4 py-3 flex items-center gap-2 border-b-2 ${
            activeTab === 'flashcards' ? 'border-accent text-accent' : 'border-transparent'
          }`}
          onClick={() => handleTabChange('flashcards')}
        >
          <Book size={20} />
          <span>Flashcards</span>
        </button>
        
        <button
          className={`px-4 py-3 flex items-center gap-2 border-b-2 ${
            activeTab === 'quizzes' ? 'border-accent text-accent' : 'border-transparent'
          }`}
          onClick={() => handleTabChange('quizzes')}
        >
          <HelpCircle size={20} />
          <span>Quizzes</span>
        </button>
        
        <button
          className={`px-4 py-3 flex items-center gap-2 border-b-2 ${
            activeTab === 'chat' ? 'border-accent text-accent' : 'border-transparent'
          }`}
          onClick={() => handleTabChange('chat')}
        >
          <MessageSquare size={20} />
          <span>AI Chat</span>
        </button>

        <button
          className={`px-4 py-3 flex items-center gap-2 border-b-2 ${
            activeTab === 'concept-map' ? 'border-accent text-accent' : 'border-transparent'
          }`}
          onClick={() => handleTabChange('concept-map')}
        >
          <Network size={20} />
          <span>Concept Map</span>
        </button>

        <button
          className={`px-4 py-3 flex items-center gap-2 border-b-2 ${
            activeTab === 'exam' ? 'border-accent text-accent' : 'border-transparent'
          }`}
          onClick={() => handleTabChange('exam')}
        >
          <PenTool size={20} />
          <span>Exam</span>
        </button>

        <button
          className={`px-4 py-3 flex items-center gap-2 border-b-2 ${
            activeTab === 'progress' ? 'border-accent text-accent' : 'border-transparent'
          }`}
          onClick={() => handleTabChange('progress')}
        >
          <Trophy size={20} />
          <span>Progress</span>
        </button>
      </div>
      
      <div className="flex-1">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default StudyPage;
