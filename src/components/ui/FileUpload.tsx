import { useCallback, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X } from 'lucide-react';
import Button from './Button';
import Card from './Card';

interface FileUploadProps {
  onFileUpload: (files: File[]) => void;
  maxFiles?: number;
  acceptedFileTypes?: string[];
  maxSize?: number;
  isAuthenticated?: boolean;
  onAuthRequired?: () => void;
}

const FileUpload = ({
  onFileUpload,
  maxFiles = 5,
  acceptedFileTypes = ['.pdf', '.docx', '.txt', '.jpg', '.png'],
  maxSize = 10 * 1024 * 1024, // 10MB default
  isAuthenticated = false,
  onAuthRequired
}: FileUploadProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    console.log('[FileUpload] onDrop called:', { isAuthenticated, acceptedFiles, rejectedFiles });
    // Check auth first
    if (!isAuthenticated) {
      console.log('[FileUpload] Not authenticated, calling onAuthRequired');
      onAuthRequired?.();
      return;
    }
    setError(null);
    
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejectionReasons = rejectedFiles.map(rejection => {
        const errors = rejection.errors.map((e: any) => e.message).join(', ');
        return `"${rejection.file.name}": ${errors}`;
      }).join('; ');
      
      setError(`Some files were rejected: ${rejectionReasons}`);
      return;
    }
    
    // Check max files limit
    if (uploadedFiles.length + acceptedFiles.length > maxFiles) {
      setError(`You can only upload a maximum of ${maxFiles} files.`);
      return;
    }
    
    // Update uploaded files
    const newFiles = [...uploadedFiles, ...acceptedFiles];
    setUploadedFiles(newFiles);
    onFileUpload(newFiles);
  }, [uploadedFiles, maxFiles, onFileUpload]);
  
  const removeFile = (index: number) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
    onFileUpload(newFiles);
  };
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    disabled: !isAuthenticated,
    onDropRejected: () => {
      if (!isAuthenticated) {
        onAuthRequired?.();
      }
    },
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => {
      // Create an object with MIME types as required by react-dropzone v14+
      if (type === '.pdf') acc['application/pdf'] = [];
      else if (type === '.docx') acc['application/vnd.openxmlformats-officedocument.wordprocessingml.document'] = [];
      else if (type === '.txt') acc['text/plain'] = [];
      else if (type === '.jpg' || type === '.jpeg') acc['image/jpeg'] = [];
      else if (type === '.png') acc['image/png'] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize,
    multiple: maxFiles > 1,
  });
  
  return (
    <div className="w-full">
      <div 
        {...getRootProps()} 
        onClick={(e) => {
          console.log('[FileUpload] Upload area clicked');
          if (!isAuthenticated) {
            console.log('[FileUpload] Click intercepted, not authenticated');
            e.preventDefault();
            onAuthRequired?.();
            return;
          }
          // Manually trigger file input click
          if (fileInputRef.current) {
            fileInputRef.current.click();
          }
          console.log('[FileUpload] Click allowed, user is authenticated');
        }}
        className={`
          neu-card p-8 border-2 border-dashed 
          ${isDragActive ? 'border-leather' : 'border-secondary'}
          ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-leather'}
          transition-all duration-300 flex flex-col items-center justify-center
        `}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        
        <div className="text-center">
          <Upload 
            size={48} 
            className={`mx-auto mb-4 ${isDragActive ? 'text-accent' : 'text-text opacity-60'}`} 
          />
          
          <h3 className="font-sans text-xl mb-2">
            {isDragActive ? 'Drop your files here' : 'Upload your study materials'}
          </h3>
          
          <p className="text-text opacity-70 mb-4">
            Drag & drop your files here, or click to select
          </p>
          
          <Button 
            variant="primary" 
            className="mx-auto"
            leftIcon={<File size={16} />}
            disabled={!isAuthenticated}
            onClick={(e) => {
              e.stopPropagation(); // Prevent dropzone handler from intercepting
              if (fileInputRef.current) {
                fileInputRef.current.click();
              }
            }}
          >
            Select Files
          </Button>
          
          <p className="mt-4 text-sm text-text opacity-50">
            {!isAuthenticated ? (
              'Please sign in to upload files'
            ) : (
              `Accepted file types: ${acceptedFileTypes.join(', ')} (Max: ${maxFiles} files, ${maxSize / (1024 * 1024)}MB each)`
            )}
          </p>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h4 className="font-sans text-lg mb-3">Uploaded Files</h4>
          <div className="space-y-3">
            {uploadedFiles.map((file, index) => (
              <Card key={index} className="flex items-center justify-between p-3">
                <div className="flex items-center">
                  <File size={20} className="mr-3" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-text opacity-60">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-2 hover:bg-secondary rounded-full"
                  aria-label="Remove file"
                >
                  <X size={16} />
                </button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
