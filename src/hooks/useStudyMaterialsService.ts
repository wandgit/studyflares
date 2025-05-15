import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studyMaterialsService } from '../services/database';
import { DBStudyMaterial } from '../types/database.types';

type MaterialType = 'study_guide' | 'flashcards' | 'quiz' | 'concept_map' | 'exam' | 'practice_exam';

export const useStudyMaterialsService = (userId: string | null) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<Error | null>(null);

  // Get all study materials for a user
  const {
    data: materials,
    isLoading: isLoadingMaterials,
    refetch: refetchMaterials
  } = useQuery({
    queryKey: ['study-materials', userId],
    queryFn: async () => {
      if (!userId) return [];
      try {
        return await studyMaterialsService.getMaterials(userId);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch study materials'));
        return [];
      }
    },
    enabled: !!userId
  });

  // Get materials by type
  const getMaterialsByType = (type: MaterialType) => {
    return useQuery({
      queryKey: ['study-materials', userId, type],
      queryFn: async () => {
        if (!userId) return [];
        try {
          return await studyMaterialsService.getMaterials(userId, type);
        } catch (err) {
          setError(err instanceof Error ? err : new Error(`Failed to fetch ${type} materials`));
          return [];
        }
      },
      enabled: !!userId
    });
  };

  // Get materials by document
  const getMaterialsByDocument = (documentId: string) => {
    return useQuery({
      queryKey: ['study-materials', userId, 'document', documentId],
      queryFn: async () => {
        if (!userId) return [];
        try {
          return await studyMaterialsService.getMaterials(userId, undefined, documentId);
        } catch (err) {
          setError(err instanceof Error ? err : new Error('Failed to fetch materials for document'));
          return [];
        }
      },
      enabled: !!userId && !!documentId
    });
  };

  // Create a study material
  const {
    mutateAsync: createMaterial,
    isPending: isCreating
  } = useMutation({
    mutationFn: async ({
      title,
      type,
      content,
      documentId,
      isPublic,
      metadata
    }: {
      title: string;
      type: MaterialType;
      content: Record<string, any>;
      documentId?: string | null;
      isPublic?: boolean;
      metadata?: Record<string, any>;
    }) => {
      if (!userId) throw new Error('User not authenticated');
      return await studyMaterialsService.createMaterial(
        userId,
        title,
        type,
        content,
        documentId || null,
        isPublic,
        metadata
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['study-materials', userId] });
      if (data.document_id) {
        queryClient.invalidateQueries({ 
          queryKey: ['study-materials', userId, 'document', data.document_id] 
        });
      }
      queryClient.invalidateQueries({ 
        queryKey: ['study-materials', userId, data.type] 
      });
    },
    onError: (err) => {
      setError(err instanceof Error ? err : new Error('Failed to create study material'));
    }
  });

  // Update a study material
  const {
    mutateAsync: updateMaterial,
    isPending: isUpdating
  } = useMutation({
    mutationFn: async ({
      materialId,
      updates
    }: {
      materialId: string;
      updates: Partial<Omit<DBStudyMaterial, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
    }) => {
      return await studyMaterialsService.updateMaterial(materialId, updates);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['study-materials', userId] });
      if (data.document_id) {
        queryClient.invalidateQueries({ 
          queryKey: ['study-materials', userId, 'document', data.document_id] 
        });
      }
      queryClient.invalidateQueries({ 
        queryKey: ['study-materials', userId, data.type] 
      });
    },
    onError: (err) => {
      setError(err instanceof Error ? err : new Error('Failed to update study material'));
    }
  });

  // Delete a study material
  const {
    mutateAsync: deleteMaterial,
    isPending: isDeleting
  } = useMutation({
    mutationFn: async (materialId: string) => {
      return await studyMaterialsService.deleteMaterial(materialId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-materials', userId] });
    },
    onError: (err) => {
      setError(err instanceof Error ? err : new Error('Failed to delete study material'));
    }
  });

  // Get a single study material
  const getMaterial = async (materialId: string): Promise<DBStudyMaterial | null> => {
    try {
      return await studyMaterialsService.getMaterial(materialId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to get study material'));
      return null;
    }
  };

  // Get public study materials
  const getPublicMaterials = (type?: MaterialType) => {
    return useQuery({
      queryKey: ['public-study-materials', type],
      queryFn: async () => {
        try {
          return await studyMaterialsService.getPublicMaterials(type);
        } catch (err) {
          setError(err instanceof Error ? err : new Error('Failed to fetch public materials'));
          return [];
        }
      }
    });
  };

  return {
    materials,
    isLoadingMaterials,
    refetchMaterials,
    getMaterialsByType,
    getMaterialsByDocument,
    createMaterial,
    isCreating,
    updateMaterial,
    isUpdating,
    deleteMaterial,
    isDeleting,
    getMaterial,
    getPublicMaterials,
    error,
    clearError: () => setError(null)
  };
};
