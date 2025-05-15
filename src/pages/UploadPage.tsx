import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import FileUpload from '../components/ui/FileUpload';
import { Check, AlertCircle, FileText } from 'lucide-react';
import useContentStore from '../store/useContentStore';
import { extractTextFromFile, getTextPreview } from '../utils/fileUtils';

import { useAuth } from '../components/auth/AuthProvider';

const UploadPage = () => {
  console.log('[UploadPage] Rendering UploadPageContent');
  const { state } = useAuth();
  console.log('[UploadPage] Current auth state:', state.status);
  const navigate = useNavigate();
  const { setUploadedContent, uploadedContent, uploadedFileName } = useContentStore();

  
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [textPreview, setTextPreview] = useState<string | null>(null);

  const handleFileUpload = async (uploadedFiles: File[]) => {
    if (uploadedFiles.length === 0) return;

    // Auth is already checked by RequireAuth component
    
    setFiles(uploadedFiles);
    setIsComplete(false);
    setError(null);
    
    try {
      // Extract text from the first file
      const file = uploadedFiles[0];
      const text = await extractTextFromFile(file);
      
      // Set the preview
      setTextPreview(getTextPreview(text));
      
      // Store the content in our global store
      setUploadedContent(text, file.name);

      // Scroll to the generate button
      setTimeout(() => {
        document.getElementById('generate-button')?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing your file.');
    }
  };

  const handleProcessFiles = async () => {
    if (files.length === 0) {
      setError('Please upload at least one file to process.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // We've already extracted the text in handleFileUpload
      // Now we just need to navigate to the study page
      setIsComplete(true);
      
      // Wait a moment to show the success message before navigating
      setTimeout(() => {
        navigate('/study');
      }, 1500);
    } catch (err) {
      setError('An error occurred while processing your files. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="font-heading text-4xl mb-6">Upload Study Materials</h1>
      
      <div className="mb-8">
        <p className="text-lg text-text dark:text-white opacity-70 mb-8">
          Upload your PDFs, digital textbooks, lecture notes, or images. 
          Our AI will process them and create personalized study materials for you.
        </p>
        
        <div className="flex flex-wrap gap-4 mb-8">
          <Card className="p-4 flex-1 min-w-[200px]">
            <div className="text-center">
              <h3 className="font-heading text-xl mb-2">Study Guides</h3>
              <p className="text-text dark:text-white opacity-70 mb-8">
                Concise summaries and structured breakdowns of key concepts
              </p>
            </div>
          </Card>
          
          <Card className="p-4 flex-1 min-w-[200px]">
            <div className="text-center">
              <h3 className="font-heading text-xl mb-2">Flashcards</h3>
              <p className="text-text dark:text-white opacity-70 mb-8">
                Question-answer pairs for efficient memorization
              </p>
            </div>
          </Card>
          
          <Card className="p-4 flex-1 min-w-[200px]">
            <div className="text-center">
              <h3 className="font-heading text-xl mb-2">Quizzes</h3>
              <p className="text-text dark:text-white opacity-70 mb-8">
                Interactive tests with explanations to assess your knowledge
              </p>
            </div>
          </Card>
        </div>
        
        <FileUpload 
          onFileUpload={handleFileUpload}
          isAuthenticated={state.status === 'complete'}
        />
        
        {textPreview && (
          <Card className="mt-6 p-4">
            <h3 className="font-heading text-xl mb-2 flex items-center">
              <FileText size={20} className="mr-2" />
              {uploadedFileName || 'Uploaded Content'}
            </h3>
            <p className="text-text/70 text-sm mb-4">
              We're extracting text from your document to create personalized study materials. This may take a moment...
            </p>
            <div className="bg-secondary bg-opacity-20 p-4 rounded-lg max-h-40 overflow-y-auto">
              <p className="whitespace-pre-wrap text-sm">{textPreview}</p>
            </div>
          </Card>
        )}
        
        {error && (
          <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center">
            <AlertCircle size={20} className="mr-2" />
            <p>{error}</p>
          </div>
        )}
        
        {isComplete && (
          <div className="mt-6 p-4 bg-green-100 text-green-700 rounded-lg flex items-center">
            <Check size={20} className="mr-2" />
            <p>Your files have been successfully processed! Redirecting to your study materials...</p>
          </div>
        )}
        
        <div id="generate-button" className="mt-6 flex justify-end">
          <Button
            variant="primary"
            size="lg"
            onClick={handleProcessFiles}
            isLoading={isProcessing}
            disabled={!uploadedContent || isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Generate Study Materials'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
