import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../config/supabase';

interface StudyMaterial {
  id: string;
  title: string;
  content: string;
  type: 'study_guide' | 'flashcards' | 'quiz' | 'concept_map';
  created_at: string;
}

export function useStudyMaterials(userId: string) {
  const queryClient = useQueryClient();

  // Fetch study materials
  const { data: materials, isLoading, error } = useQuery({
    queryKey: ['study-materials', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('study_materials')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as StudyMaterial[];
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });

  // Create study material
  const createMutation = useMutation({
    mutationFn: async (newMaterial: Omit<StudyMaterial, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('study_materials')
        .insert([{ ...newMaterial, user_id: userId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['study-materials', userId] });
    },
  });

  // Update study material
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<StudyMaterial> & { id: string }) => {
      const { data, error } = await supabase
        .from('study_materials')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data: StudyMaterial) => {
      // Update the cache optimistically
      queryClient.setQueryData(['study-materials', userId], (old: StudyMaterial[] | undefined) => {
        if (!old) return [data];
        return old.map((item) => (item.id === data.id ? data : item));
      });
    },
  });

  // Delete study material
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('study_materials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: (id: string) => {
      // Update the cache optimistically
      queryClient.setQueryData(['study-materials', userId], (old: StudyMaterial[] | undefined) => {
        if (!old) return [];
        return old.filter((item) => item.id !== id);
      });
    },
  });

  return {
    materials,
    isLoading,
    error,
    createMaterial: createMutation.mutate,
    updateMaterial: updateMutation.mutate,
    deleteMaterial: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
