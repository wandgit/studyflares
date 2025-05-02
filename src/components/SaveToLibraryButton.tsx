import React from 'react';
import Button from '../components/ui/Button';
import { useToast } from '../hooks/use-toast';
import useContentStore from '../store/useContentStore';
import useStudyLibraryStore from '../store/useStudyLibraryStore';
import { SaveIcon } from 'lucide-react';

export default function SaveToLibraryButton() {
  const { toast } = useToast();
  const { uploadedFileName, studyGuide, flashcards, quiz, conceptMap } = useContentStore();
  const { addMaterial, savedMaterials } = useStudyLibraryStore();

  const handleSave = () => {
    if (!studyGuide || !flashcards || !quiz || !conceptMap) {
      toast({
        title: 'Cannot Save',
        description: 'Please wait for all study materials to be generated first.',
        variant: 'destructive',
      });
      return;
    }

    // Check if material is already saved
    const isDuplicate = savedMaterials.some(
      (material) => material.fileName === uploadedFileName
    );

    if (isDuplicate) {
      toast({
        title: 'Already Saved',
        description: 'This study material has already been saved to your library.',
        variant: 'destructive',
      });
      return;
    }

    try {
      addMaterial({
        fileName: uploadedFileName,
        studyGuide,
        flashcards,
        quiz,
        conceptMap,
      });

      toast({
        title: 'Saved Successfully',
        description: 'Study materials have been added to your library.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save study materials. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button
      onClick={handleSave}
      className="flex items-center gap-2"
      variant="secondary"
    >
      <SaveIcon className="h-4 w-4" />
      Save to Library
    </Button>
  );
}
