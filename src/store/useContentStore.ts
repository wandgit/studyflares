import { create } from 'zustand';
import { 
  generateStudyGuide, 
  generateFlashcards, 
  generateQuiz, 
  generateConceptMap,
  chatWithAI,
  type ChatMessage,
  type QuizQuestion,
  QuestionDifficulty
} from '../services/geminiService';
import { toast } from 'react-hot-toast';

interface ContentState {
  // Uploaded content
  uploadedContent: string;
  uploadedFileName: string;
  isProcessing: boolean;
  processingError: string | null;
  
  // Generated study materials
  studyGuide: string | null;
  flashcards: Array<{ question: string; answer: string }> | null;
  quiz: QuizQuestion[] | null;
  conceptMap: {
    nodes: Array<{ id: number; label: string; level: number }>;
    edges: Array<{ id: number; from: number; to: number; label?: string }>;
  } | null;
  
  // Chat functionality
  chatMessages: ChatMessage[];
  isChatLoading: boolean;
  
  // Actions
  setUploadedContent: (content: string, fileName: string) => void;
  clearContent: () => void;
  
  // AI generation functions
  generateStudyMaterials: () => Promise<void>;
  sendChatMessage: (message: string) => Promise<void>;
}

const useContentStore = create<ContentState>((set, get) => ({
  // Initial state
  uploadedContent: '',
  uploadedFileName: '',
  isProcessing: false,
  processingError: null,
  
  studyGuide: null,
  flashcards: null,
  quiz: null,
  conceptMap: null,
  
  chatMessages: [],
  isChatLoading: false,
  
  // Actions
  setUploadedContent: (content, fileName) => {
    set({ 
      uploadedContent: content, 
      uploadedFileName: fileName,
      processingError: null
    });
  },
  
  clearContent: () => {
    set({
      uploadedContent: '',
      uploadedFileName: '',
      studyGuide: null,
      flashcards: null,
      quiz: null,
      chatMessages: [],
      processingError: null
    });
  },
  
  // Generate all study materials at once
  generateStudyMaterials: async () => {
    const { uploadedContent } = get();
    if (!uploadedContent) return;

    set({ isProcessing: true, processingError: null });

    try {
      // Generate all materials in parallel
      const [
        studyGuide,
        flashcards,
        quiz,
        conceptMap
      ] = await Promise.all([
        generateStudyGuide(uploadedContent),
        generateFlashcards(uploadedContent),
        generateQuiz(uploadedContent),
        generateConceptMap(uploadedContent)
      ]);

      set({
        studyGuide,
        flashcards,
        quiz,
        conceptMap,
        isProcessing: false
      });

      toast.success('Study materials generated successfully!');
    } catch (error) {
      console.error('Error generating study materials:', error);
      set({
        processingError: error instanceof Error ? error.message : 'Failed to generate study materials',
        isProcessing: false
      });
      toast.error('Failed to generate study materials');
    }
  },
  
  // Send a message to the AI chat
  sendChatMessage: async (message) => {
    const { chatMessages, uploadedContent } = get();
    
    if (!uploadedContent) {
      set({ processingError: 'No content uploaded. Please upload content first.' });
      return;
    }
    
    // Add user message to chat
    const newUserMessage: ChatMessage = { role: 'user', content: message };
    const newMessages = [...chatMessages, newUserMessage];
    
    set({ chatMessages: newMessages, isChatLoading: true });
    
    try {
      // Get AI response
      const response = await chatWithAI(newMessages, uploadedContent);
      
      // Add AI response to chat
      const aiMessage: ChatMessage = { role: 'model', content: response };
      set({ 
        chatMessages: [...newMessages, aiMessage],
        isChatLoading: false 
      });
    } catch (error) {
      console.error('Error sending chat message:', error);
      set({ 
        processingError: error instanceof Error ? error.message : 'An unknown error occurred',
        isChatLoading: false 
      });
    }
  }
}));

export default useContentStore;
