import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { examService } from '../services/database';
import { DBExam, DBExamQuestion, DBExamAttempt } from '../types/database.types';

export const useExamService = (userId: string | null) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<Error | null>(null);

  // Get all exams for a user
  const {
    data: exams,
    isLoading: isLoadingExams,
    refetch: refetchExams
  } = useQuery({
    queryKey: ['exams', userId],
    queryFn: async () => {
      if (!userId) return [];
      try {
        return await examService.getExams(userId);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch exams'));
        return [];
      }
    },
    enabled: !!userId
  });

  // Create an exam
  const {
    mutateAsync: createExam,
    isPending: isCreatingExam
  } = useMutation({
    mutationFn: async ({
      title,
      description,
      durationMinutes,
      questionCount,
      passingScore,
      metadata
    }: {
      title: string;
      description: string;
      durationMinutes: number;
      questionCount: number;
      passingScore: number;
      metadata?: Record<string, any>;
    }) => {
      if (!userId) throw new Error('User not authenticated');
      return await examService.createExam(
        userId,
        title,
        description,
        durationMinutes,
        questionCount,
        passingScore,
        metadata
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams', userId] });
    },
    onError: (err) => {
      setError(err instanceof Error ? err : new Error('Failed to create exam'));
    }
  });

  // Get a single exam
  const getExam = async (examId: string): Promise<DBExam | null> => {
    try {
      return await examService.getExam(examId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to get exam'));
      return null;
    }
  };

  // Update an exam
  const {
    mutateAsync: updateExam,
    isPending: isUpdatingExam
  } = useMutation({
    mutationFn: async ({
      examId,
      updates
    }: {
      examId: string;
      updates: Partial<Omit<DBExam, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
    }) => {
      return await examService.updateExam(examId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams', userId] });
    },
    onError: (err) => {
      setError(err instanceof Error ? err : new Error('Failed to update exam'));
    }
  });

  // Delete an exam
  const {
    mutateAsync: deleteExam,
    isPending: isDeletingExam
  } = useMutation({
    mutationFn: async (examId: string) => {
      return await examService.deleteExam(examId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams', userId] });
    },
    onError: (err) => {
      setError(err instanceof Error ? err : new Error('Failed to delete exam'));
    }
  });

  // Add a question to an exam
  const {
    mutateAsync: addQuestion,
    isPending: isAddingQuestion
  } = useMutation({
    mutationFn: async ({
      examId,
      questionText,
      questionType,
      options,
      correctAnswer,
      points,
      metadata
    }: {
      examId: string;
      questionText: string;
      questionType: 'multiple_choice' | 'true_false' | 'short_answer';
      options: string[];
      correctAnswer: string | string[];
      points: number;
      metadata?: Record<string, any>;
    }) => {
      return await examService.addQuestion(
        examId,
        questionText,
        questionType,
        options,
        correctAnswer,
        points,
        metadata
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['exam-questions', data.exam_id] });
    },
    onError: (err) => {
      setError(err instanceof Error ? err : new Error('Failed to add question'));
    }
  });

  // Get questions for an exam
  const getExamQuestions = (examId: string | null) => {
    return useQuery({
      queryKey: ['exam-questions', examId],
      queryFn: async () => {
        if (!examId) return [];
        try {
          return await examService.getQuestions(examId);
        } catch (err) {
          setError(err instanceof Error ? err : new Error('Failed to fetch exam questions'));
          return [];
        }
      },
      enabled: !!examId
    });
  };

  // Start an exam attempt
  const {
    mutateAsync: startExamAttempt,
    isPending: isStartingAttempt
  } = useMutation({
    mutationFn: async ({
      examId,
      metadata
    }: {
      examId: string;
      metadata?: Record<string, any>;
    }) => {
      if (!userId) throw new Error('User not authenticated');
      return await examService.startExamAttempt(userId, examId, metadata);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['exam-attempts', userId] });
      queryClient.invalidateQueries({ queryKey: ['exam-attempts', 'exam', data.exam_id] });
    },
    onError: (err) => {
      setError(err instanceof Error ? err : new Error('Failed to start exam attempt'));
    }
  });

  // Submit an exam attempt
  const {
    mutateAsync: submitExamAttempt,
    isPending: isSubmittingAttempt
  } = useMutation({
    mutationFn: async ({
      attemptId,
      answers,
      score,
      passed,
      metadata
    }: {
      attemptId: string;
      answers: Record<string, any>[];
      score: number;
      passed: boolean;
      metadata?: Record<string, any>;
    }) => {
      return await examService.submitExamAttempt(attemptId, answers, score, passed, metadata);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['exam-attempts', userId] });
      queryClient.invalidateQueries({ queryKey: ['exam-attempts', 'exam', data.exam_id] });
    },
    onError: (err) => {
      setError(err instanceof Error ? err : new Error('Failed to submit exam attempt'));
    }
  });

  // Get user exam attempts
  const getUserAttempts = () => {
    return useQuery({
      queryKey: ['exam-attempts', userId],
      queryFn: async () => {
        if (!userId) return [];
        try {
          return await examService.getUserAttempts(userId);
        } catch (err) {
          setError(err instanceof Error ? err : new Error('Failed to fetch user exam attempts'));
          return [];
        }
      },
      enabled: !!userId
    });
  };

  // Get exam attempts for a specific exam
  const getExamAttempts = (examId: string | null) => {
    return useQuery({
      queryKey: ['exam-attempts', 'exam', examId],
      queryFn: async () => {
        if (!examId) return [];
        try {
          return await examService.getExamAttempts(examId);
        } catch (err) {
          setError(err instanceof Error ? err : new Error('Failed to fetch exam attempts'));
          return [];
        }
      },
      enabled: !!examId
    });
  };

  return {
    exams,
    isLoadingExams,
    refetchExams,
    createExam,
    isCreatingExam,
    getExam,
    updateExam,
    isUpdatingExam,
    deleteExam,
    isDeletingExam,
    addQuestion,
    isAddingQuestion,
    getExamQuestions,
    startExamAttempt,
    isStartingAttempt,
    submitExamAttempt,
    isSubmittingAttempt,
    getUserAttempts,
    getExamAttempts,
    error,
    clearError: () => setError(null)
  };
};
