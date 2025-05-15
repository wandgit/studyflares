import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activityService } from '../services/database';
// DBActivity is used in function signatures and return types

type ActivityType = 'document_upload' | 'material_creation' | 'exam_attempt' | 'study_session';
type ReferenceType = 'document' | 'study_material' | 'exam' | 'exam_attempt' | null;

export const useActivityService = (userId: string | null) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<Error | null>(null);

  // Get recent activities
  const {
    data: recentActivities,
    isLoading: isLoadingActivities,
    refetch: refetchActivities
  } = useQuery({
    queryKey: ['recent-activities', userId],
    queryFn: async () => {
      if (!userId) return [];
      try {
        return await activityService.getRecentActivities(userId);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch recent activities'));
        return [];
      }
    },
    enabled: !!userId
  });

  // Log an activity
  const {
    mutateAsync: logActivity,
    isPending: isLoggingActivity
  } = useMutation({
    mutationFn: async ({
      activityType,
      referenceId,
      referenceType,
      metadata
    }: {
      activityType: ActivityType;
      referenceId?: string | null;
      referenceType?: ReferenceType;
      metadata?: Record<string, any>;
    }) => {
      if (!userId) throw new Error('User not authenticated');
      return await activityService.logActivity(
        userId,
        activityType,
        referenceId || null,
        referenceType || null,
        metadata
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-activities', userId] });
    },
    onError: (err) => {
      setError(err instanceof Error ? err : new Error('Failed to log activity'));
    }
  });

  // Get activities by type
  const getActivitiesByType = (activityType: ActivityType) => {
    return useQuery({
      queryKey: ['activities', userId, 'type', activityType],
      queryFn: async () => {
        if (!userId) return [];
        try {
          return await activityService.getActivitiesByType(userId, activityType);
        } catch (err) {
          setError(err instanceof Error ? err : new Error(`Failed to fetch ${activityType} activities`));
          return [];
        }
      },
      enabled: !!userId
    });
  };

  // Get activities for a reference
  const getReferenceActivities = (referenceId: string, referenceType: Exclude<ReferenceType, null>) => {
    return useQuery({
      queryKey: ['activities', 'reference', referenceId, referenceType],
      queryFn: async () => {
        try {
          return await activityService.getReferenceActivities(referenceId, referenceType);
        } catch (err) {
          setError(err instanceof Error ? err : new Error('Failed to fetch reference activities'));
          return [];
        }
      },
      enabled: !!referenceId && !!referenceType
    });
  };

  // Clear old activities
  const {
    mutateAsync: clearOldActivities,
    isPending: isClearingActivities
  } = useMutation({
    mutationFn: async (olderThan: Date) => {
      if (!userId) throw new Error('User not authenticated');
      return await activityService.clearOldActivities(userId, olderThan);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-activities', userId] });
      queryClient.invalidateQueries({ queryKey: ['activities', userId] });
    },
    onError: (err) => {
      setError(err instanceof Error ? err : new Error('Failed to clear old activities'));
    }
  });

  // Delete an activity
  const {
    mutateAsync: deleteActivity,
    isPending: isDeletingActivity
  } = useMutation({
    mutationFn: async (activityId: string) => {
      return await activityService.deleteActivity(activityId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-activities', userId] });
      queryClient.invalidateQueries({ queryKey: ['activities', userId] });
    },
    onError: (err) => {
      setError(err instanceof Error ? err : new Error('Failed to delete activity'));
    }
  });

  return {
    recentActivities,
    isLoadingActivities,
    refetchActivities,
    logActivity,
    isLoggingActivity,
    getActivitiesByType,
    getReferenceActivities,
    clearOldActivities,
    isClearingActivities,
    deleteActivity,
    isDeletingActivity,
    error,
    clearError: () => setError(null)
  };
};
