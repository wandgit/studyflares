import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService } from '../services/database';
import { DBDocument } from '../types/database.types';

export const useDocumentService = (userId: string | null) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<Error | null>(null);

  // Get all documents for a user
  const {
    data: documents,
    isLoading: isLoadingDocuments,
    refetch: refetchDocuments
  } = useQuery({
    queryKey: ['documents', userId],
    queryFn: async () => {
      if (!userId) return [];
      try {
        return await documentService.getDocuments(userId);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch documents'));
        return [];
      }
    },
    enabled: !!userId
  });

  // Upload a document
  const {
    mutateAsync: uploadDocument,
    isPending: isUploading
  } = useMutation({
    mutationFn: async ({
      title,
      filePath,
      fileType,
      metadata
    }: {
      title: string;
      filePath: string;
      fileType: string;
      metadata?: Record<string, any>;
    }) => {
      if (!userId) throw new Error('User not authenticated');
      return await documentService.uploadDocument(
        userId,
        title,
        filePath,
        fileType,
        metadata
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', userId] });
    },
    onError: (err) => {
      setError(err instanceof Error ? err : new Error('Failed to upload document'));
    }
  });

  // Update document status
  const {
    mutateAsync: updateDocumentStatus,
    isPending: isUpdatingStatus
  } = useMutation({
    mutationFn: async ({
      documentId,
      status,
      metadata
    }: {
      documentId: string;
      status: 'processing' | 'completed' | 'error';
      metadata?: Record<string, any>;
    }) => {
      return await documentService.updateDocumentStatus(
        documentId,
        status,
        metadata
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', userId] });
    },
    onError: (err) => {
      setError(err instanceof Error ? err : new Error('Failed to update document status'));
    }
  });

  // Delete a document
  const {
    mutateAsync: deleteDocument,
    isPending: isDeleting
  } = useMutation({
    mutationFn: async (documentId: string) => {
      return await documentService.deleteDocument(documentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', userId] });
    },
    onError: (err) => {
      setError(err instanceof Error ? err : new Error('Failed to delete document'));
    }
  });

  // Get a single document
  const getDocument = async (documentId: string): Promise<DBDocument | null> => {
    try {
      return await documentService.getDocument(documentId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to get document'));
      return null;
    }
  };

  return {
    documents,
    isLoadingDocuments,
    refetchDocuments,
    uploadDocument,
    isUploading,
    updateDocumentStatus,
    isUpdatingStatus,
    deleteDocument,
    isDeleting,
    getDocument,
    error,
    clearError: () => setError(null)
  };
};
