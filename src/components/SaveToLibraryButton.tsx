import Button from '../components/ui/Button';
import { useToast } from '../hooks/use-toast';
import useContentStore from '../store/useContentStore';
import useStudyLibraryStore from '../store/useStudyLibraryStore';
import { SaveIcon, Loader2 } from 'lucide-react';
import { useAuth } from '../components/auth/AuthProvider';
import { studyMaterialsService } from '../services/database';
import { useState } from 'react';

export default function SaveToLibraryButton() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const { uploadedFileName, studyGuide, flashcards, quiz, conceptMap } = useContentStore();
  const { addMaterial, savedMaterials } = useStudyLibraryStore();

  const handleSave = async () => {
    console.log('Save button clicked');
    console.log('User auth state:', user);
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

    setIsSaving(true);

    try {
      // First save to local store for immediate feedback
      addMaterial({
        fileName: uploadedFileName,
        studyGuide,
        flashcards,
        quiz,
        conceptMap,
      });

      // Then save to Supabase if user is authenticated
      if (!user?.id) {
        console.error('No authenticated user found');
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to save materials to your library.',
          variant: 'destructive',
        });
        return;
      }

      console.log('Attempting to save to Supabase for user:', user.id);
      try {
        const savedMaterial = await studyMaterialsService.saveMaterialFromLibrary(user.id, {
          fileName: uploadedFileName,
          studyGuide,
          flashcards,
          quiz,
          conceptMap,
        });
        console.log('Successfully saved to Supabase:', savedMaterial);
      } catch (supabaseError) {
        console.error('Failed to save to Supabase:', supabaseError);
        toast({
          title: 'Database Error',
          description: 'Failed to save to cloud storage. Your materials are still saved locally.',
          variant: 'destructive',
        });
      }

      toast({
        title: 'Saved Successfully',
        description: 'Study materials have been added to your library.',
      });
    } catch (error) {
      console.error('Error saving study materials:', error);
      toast({
        title: 'Error',
        description: 'Failed to save study materials. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Button
      onClick={handleSave}
      className="flex items-center gap-2"
      variant="secondary"
      disabled={isSaving}
    >
      {isSaving ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <SaveIcon className="h-4 w-4" />
      )}
      {isSaving ? 'Saving...' : 'Save to Library'}
    </Button>
  );
}
