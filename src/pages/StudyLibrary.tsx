import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Card from '../components/ui/Card';
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/Card';
import Button from '../components/ui/Button';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { ScrollArea } from '../components/ui/ScrollArea';
import useStudyLibraryStore, { SavedStudyMaterial } from '../store/useStudyLibraryStore';
import { Trash2Icon, FileTextIcon, BookOpen, Book, HelpCircle, MessageSquare, Network, PenTool, Trophy } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { generateQuiz, generateExam, type QuizQuestion, type Exam, type ChatMessage } from '../services/geminiService';
import StudyCard from '../components/ui/StudyCard';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import ConceptMap from '../components/ui/ConceptMap';
import Quiz from '../components/ui/Quiz';
import ChatInterface from '../components/ui/ChatInterface';
import StudyTimer from '../components/ui/StudyTimer';
import TopicMasteryCard from '../components/ui/TopicMasteryCard';
import LevelProgressCard from '../components/ui/LevelProgressCard';

type StudyTab = 'guides' | 'flashcards' | 'quizzes' | 'chat' | 'concept-map' | 'exam' | 'progress';

export default function StudyLibrary() {
  const { savedMaterials, removeMaterial } = useStudyLibraryStore();
  const { toast } = useToast();
  const [selectedMaterial, setSelectedMaterial] = useState<SavedStudyMaterial | null>(null);
  const [activeTab, setActiveTab] = useState<StudyTab>('guides');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Reset flashcard index when selecting a new material
  useEffect(() => {
    setCurrentFlashcardIndex(0);
    setShowAnswer(false);
  }, [selectedMaterial]);

  const handleDelete = (id: string) => {
    removeMaterial(id);
    if (selectedMaterial?.id === id) {
      setSelectedMaterial(null);
    }
    toast({
      title: 'Deleted',
      description: 'Study material has been removed from your library.',
    });
  };

  const generateNewQuiz = async () => {
    if (!selectedMaterial) return;
    
    setIsGenerating(true);
    try {
      const newQuiz = await generateQuiz(selectedMaterial.studyGuide);
      setSelectedMaterial({
        ...selectedMaterial,
        quiz: newQuiz,
      });
      toast({
        title: 'Success',
        description: 'New quiz has been generated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate new quiz. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateNewExam = async () => {
    if (!selectedMaterial) return;
    
    setIsGenerating(true);
    try {
      const newExam = await generateExam(selectedMaterial.studyGuide, 60); // 60 minutes duration
      setSelectedMaterial({
        ...selectedMaterial,
        exam: newExam,
      });
      toast({
        title: 'Success',
        description: 'New exam has been generated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate new exam. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle flashcard navigation
  const handleNextFlashcard = () => {
    if (selectedMaterial?.flashcards && currentFlashcardIndex < selectedMaterial.flashcards.length - 1) {
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

  // Mock function for chat - in a real implementation, you would integrate with your AI service
  const handleSendMessage = async (message: string) => {
    // This is a placeholder - in a real implementation, you would call your AI service
    setIsChatLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Add user message and a mock response
    setChatMessages(prev => [
      ...prev, 
      { role: 'user', content: message },
      { role: 'model', content: `This is a placeholder response. In a real implementation, this would be a response from your AI about the content: "${selectedMaterial?.fileName}"` }
    ]);
    
    setIsChatLoading(false);
    return "Message sent";
  };

  // Handle study session completion - placeholder
  const handleStudySessionComplete = () => {
    toast({
      title: 'Study Session Complete',
      description: 'Great job! You have completed your study session.',
    });
  };

  // Render tab content based on active tab
  const renderTabContent = () => {
    if (!selectedMaterial) return null;

    switch (activeTab) {
      case 'guides':
        return (
          <Card>
            <CardContent className="p-6">
              <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                {selectedMaterial.studyGuide}
              </ReactMarkdown>
            </CardContent>
          </Card>
        );

      case 'flashcards':
        if (!selectedMaterial.flashcards || selectedMaterial.flashcards.length === 0) {
          return (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground mb-4">No flashcards available for this material.</p>
              </CardContent>
            </Card>
          );
        }
        
        return (
          <div className="space-y-6">
            <StudyCard
              question={selectedMaterial.flashcards[currentFlashcardIndex].question}
              answer={selectedMaterial.flashcards[currentFlashcardIndex].answer}
              showAnswer={showAnswer}
              onToggleAnswer={() => setShowAnswer(!showAnswer)}
              onNext={handleNextFlashcard}
              onPrevious={handlePreviousFlashcard}
              currentIndex={currentFlashcardIndex}
              totalCards={selectedMaterial.flashcards.length}
            />
          </div>
        );

      case 'quizzes':
        if (!selectedMaterial.quiz || selectedMaterial.quiz.length === 0) {
          return (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground mb-4">No quiz available for this material.</p>
                <Button onClick={generateNewQuiz} disabled={isGenerating}>
                  {isGenerating ? 'Generating...' : 'Generate Quiz'}
                </Button>
              </CardContent>
            </Card>
          );
        }
        
        // Extract topic ID and name from the file name for Quiz component
        const quizTopicId = selectedMaterial.fileName.replace(/\.[^/.]+$/, '');
        const quizTopicName = selectedMaterial.fileName.replace(/\.[^/.]+$/, '').replace(/-/g, ' ');
        
        return (
          <Quiz 
            questions={selectedMaterial.quiz} 
            topicId={quizTopicId}
            topicName={quizTopicName}
          />
        );

      case 'chat':
        return (
          <ChatInterface 
            messages={chatMessages} 
            onSendMessage={handleSendMessage} 
            isLoading={isChatLoading} 
          />
        );

      case 'concept-map':
        if (!selectedMaterial.conceptMap) {
          return (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No concept map available for this material.</p>
              </CardContent>
            </Card>
          );
        }
        
        return (
          <div className="h-[calc(100vh-200px)]">
            <ConceptMap concepts={selectedMaterial.conceptMap} />
          </div>
        );

      case 'exam':
        if (!selectedMaterial.exam) {
          return (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground mb-4">No exam available for this material.</p>
                <Button onClick={generateNewExam} disabled={isGenerating}>
                  {isGenerating ? 'Generating...' : 'Generate Exam'}
                </Button>
              </CardContent>
            </Card>
          );
        }
        
        return (
          <div>
            {/* Render the exam data directly since ExamTab might expect different props */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Exam ({selectedMaterial.exam.duration} minutes)
                </h3>
                {selectedMaterial.exam.questions.map((question, index) => (
                  <div key={question.id} className="mb-6 last:mb-0">
                    <h4 className="font-semibold mb-2">
                      Question {index + 1} ({question.points} points):
                    </h4>
                    <p className="mb-2">{question.question}</p>
                    {question.type === 'multipleChoice' && question.options && (
                      <ul className="list-disc list-inside space-y-1 mb-2">
                        {question.options.map((option, optIndex) => (
                          <li key={optIndex} className={optIndex === question.correctOption ? 'text-green-600 font-medium' : ''}>
                            {option}
                          </li>
                        ))}
                      </ul>
                    )}
                    <p className="text-sm text-muted-foreground">Rubric: {question.rubric}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        );

      case 'progress':
        // Extract topic ID and name from the file name
        const topicId = selectedMaterial.fileName.replace(/\.[^/.]+$/, '');
        const topicName = selectedMaterial.fileName.replace(/\.[^/.]+$/, '').replace(/-/g, ' ');
        
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
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="font-handwriting text-4xl">Study Library</h1>
        <p className="text-text opacity-70">
          Access your saved study materials
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Library List */}
        <div className="col-span-12 md:col-span-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Saved Materials</CardTitle>
              <CardDescription>Select a document to view study materials</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-20rem)]">
                {savedMaterials.length === 0 ? (
                  <p className="text-muted-foreground text-center p-4">
                    Your study library is empty. Save some study materials to get started!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {savedMaterials.map((material) => (
                      <div
                        key={material.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors flex justify-between items-center ${
                          selectedMaterial?.id === material.id ? 'bg-leather bg-opacity-20' : 'hover:bg-secondary'
                        }`}
                        onClick={() => setSelectedMaterial(material)}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <FileTextIcon className="h-4 w-4" />
                            <p className="font-medium">{material.fileName}</p>
                          </div>
                          <p className="text-xs text-text opacity-70">
                            Added: {format(new Date(material.dateAdded), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(material.id);
                          }}
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Study Material Content */}
        <div className="col-span-12 md:col-span-8">
          {selectedMaterial ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">{selectedMaterial.fileName}</h2>
                <StudyTimer onComplete={handleStudySessionComplete} />
              </div>

              {/* Tabs similar to StudyPage */}
              <div className="flex mb-6 border-b border-secondary overflow-x-auto">
                <button
                  className={`px-4 py-3 flex items-center gap-2 border-b-2 whitespace-nowrap ${
                    activeTab === 'guides' ? 'border-leather text-leather' : 'border-transparent'
                  }`}
                  onClick={() => setActiveTab('guides')}
                >
                  <BookOpen size={20} />
                  <span>Study Guide</span>
                </button>
                
                <button
                  className={`px-4 py-3 flex items-center gap-2 border-b-2 whitespace-nowrap ${
                    activeTab === 'flashcards' ? 'border-leather text-leather' : 'border-transparent'
                  }`}
                  onClick={() => setActiveTab('flashcards')}
                >
                  <Book size={20} />
                  <span>Flashcards</span>
                </button>
                
                <button
                  className={`px-4 py-3 flex items-center gap-2 border-b-2 whitespace-nowrap ${
                    activeTab === 'quizzes' ? 'border-leather text-leather' : 'border-transparent'
                  }`}
                  onClick={() => setActiveTab('quizzes')}
                >
                  <HelpCircle size={20} />
                  <span>Quizzes</span>
                </button>
                
                <button
                  className={`px-4 py-3 flex items-center gap-2 border-b-2 whitespace-nowrap ${
                    activeTab === 'chat' ? 'border-leather text-leather' : 'border-transparent'
                  }`}
                  onClick={() => setActiveTab('chat')}
                >
                  <MessageSquare size={20} />
                  <span>AI Chat</span>
                </button>

                <button
                  className={`px-4 py-3 flex items-center gap-2 border-b-2 whitespace-nowrap ${
                    activeTab === 'concept-map' ? 'border-leather text-leather' : 'border-transparent'
                  }`}
                  onClick={() => setActiveTab('concept-map')}
                >
                  <Network size={20} />
                  <span>Concept Map</span>
                </button>

                <button
                  className={`px-4 py-3 flex items-center gap-2 border-b-2 whitespace-nowrap ${
                    activeTab === 'exam' ? 'border-leather text-leather' : 'border-transparent'
                  }`}
                  onClick={() => setActiveTab('exam')}
                >
                  <PenTool size={20} />
                  <span>Exam</span>
                </button>

                <button
                  className={`px-4 py-3 flex items-center gap-2 border-b-2 whitespace-nowrap ${
                    activeTab === 'progress' ? 'border-leather text-leather' : 'border-transparent'
                  }`}
                  onClick={() => setActiveTab('progress')}
                >
                  <Trophy size={20} />
                  <span>Progress</span>
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1">
                {renderTabContent()}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground text-center">
                  Select a study material from your library to view its contents.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
