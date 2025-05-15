import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { statisticsService } from '../services/database';
// DBUserStatistics is used in function signatures and return types

export const useStatisticsService = (userId: string | null) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<Error | null>(null);

  // Get user statistics
  const {
    data: statistics,
    isLoading: isLoadingStatistics,
    refetch: refetchStatistics
  } = useQuery({
    queryKey: ['user-statistics', userId],
    queryFn: async () => {
      if (!userId) return null;
      try {
        return await statisticsService.getOrCreateStatistics(userId);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch user statistics'));
        return null;
      }
    },
    enabled: !!userId
  });

  // Update study time
  const {
    mutateAsync: updateStudyTime,
    isPending: isUpdatingStudyTime
  } = useMutation({
    mutationFn: async (additionalMinutes: number) => {
      if (!userId) throw new Error('User not authenticated');
      return await statisticsService.updateStudyTime(userId, additionalMinutes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-statistics', userId] });
    },
    onError: (err) => {
      setError(err instanceof Error ? err : new Error('Failed to update study time'));
    }
  });

  // Update exam statistics
  const {
    mutateAsync: updateExamStats,
    isPending: isUpdatingExamStats
  } = useMutation({
    mutationFn: async (passed: boolean) => {
      if (!userId) throw new Error('User not authenticated');
      return await statisticsService.updateExamStats(userId, passed);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-statistics', userId] });
    },
    onError: (err) => {
      setError(err instanceof Error ? err : new Error('Failed to update exam statistics'));
    }
  });

  // Increment materials created count
  const {
    mutateAsync: incrementMaterialsCreated,
    isPending: isIncrementingMaterials
  } = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('User not authenticated');
      return await statisticsService.incrementMaterialsCreated(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-statistics', userId] });
    },
    onError: (err) => {
      setError(err instanceof Error ? err : new Error('Failed to increment materials created'));
    }
  });

  // Track progress on a material
  const {
    mutateAsync: trackProgress,
    isPending: isTrackingProgress
  } = useMutation({
    mutationFn: async ({
      materialId,
      progressPercentage,
      metadata
    }: {
      materialId: string;
      progressPercentage: number;
      metadata?: Record<string, any>;
    }) => {
      if (!userId) throw new Error('User not authenticated');
      return await statisticsService.trackProgress(
        userId,
        materialId,
        progressPercentage,
        metadata
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-progress', userId] });
      queryClient.invalidateQueries({ queryKey: ['material-progress', userId, variables.materialId] });
    },
    onError: (err) => {
      setError(err instanceof Error ? err : new Error('Failed to track progress'));
    }
  });

  // Get user progress for all materials
  const getUserProgress = () => {
    return useQuery({
      queryKey: ['user-progress', userId],
      queryFn: async () => {
        if (!userId) return [];
        try {
          return await statisticsService.getUserProgress(userId);
        } catch (err) {
          setError(err instanceof Error ? err : new Error('Failed to fetch user progress'));
          return [];
        }
      },
      enabled: !!userId
    });
  };

  // Get progress for a specific material
  const getMaterialProgress = (materialId: string | null) => {
    return useQuery({
      queryKey: ['material-progress', userId, materialId],
      queryFn: async () => {
        if (!userId || !materialId) return { progress_percentage: 0 };
        try {
          return await statisticsService.getMaterialProgress(userId, materialId);
        } catch (err) {
          setError(err instanceof Error ? err : new Error('Failed to fetch material progress'));
          return { progress_percentage: 0 };
        }
      },
      enabled: !!userId && !!materialId
    });
  };

  return {
    statistics,
    isLoadingStatistics,
    refetchStatistics,
    updateStudyTime,
    isUpdatingStudyTime,
    updateExamStats,
    isUpdatingExamStats,
    incrementMaterialsCreated,
    isIncrementingMaterials,
    trackProgress,
    isTrackingProgress,
    getUserProgress,
    getMaterialProgress,
    error,
    clearError: () => setError(null)
  };
};
