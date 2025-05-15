import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../config/supabase';

interface Document {
  id: string;
  title: string;
  description?: string;
  file_path: string;
  file_type: string;
  status: 'processing' | 'completed' | 'error';
  created_at: string;
  metadata: Record<string, any>;
}

export function useDocuments(userId: string) {
  const queryClient = useQueryClient();

  // Fetch documents
  const { data: documents, isLoading, error } = useQuery({
    queryKey: ['documents', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Document[];
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });

  // Upload document
  const uploadMutation = useMutation({
    mutationFn: async ({ file, title, description }: { file: File; title: string; description?: string }) => {
      // First, upload the file to storage
      const filePath = `${userId}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Then create the document record
      const { data, error } = await supabase
        .from('documents')
        .insert([{
          user_id: userId,
          title,
          description,
          file_path: filePath,
          file_type: file.type,
          status: 'processing',
          metadata: {
            size: file.size,
            type: file.type,
          },
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['documents', userId] });
    },
  });

  // Update document status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, metadata }: { id: string; status: Document['status']; metadata?: Record<string, any> }) => {
      const { data, error } = await supabase
        .from('documents')
        .update({ status, ...(metadata ? { metadata } : {}) })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data: Document) => {
      // Update the cache optimistically
      queryClient.setQueryData(['documents', userId], (old: Document[] | undefined) => {
        if (!old) return [data];
        return old.map((item) => (item.id === data.id ? data : item));
      });
    },
  });

  // Delete document
  const deleteMutation = useMutation({
    mutationFn: async (document: Document) => {
      // First delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path]);

      if (storageError) throw storageError;

      // Then delete the record
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', document.id);

      if (error) throw error;
      return document.id;
    },
    onSuccess: (id: string) => {
      // Update the cache optimistically
      queryClient.setQueryData(['documents', userId], (old: Document[] | undefined) => {
        if (!old) return [];
        return old.filter((item) => item.id !== id);
      });
    },
  });

  return {
    documents,
    isLoading,
    error,
    uploadDocument: uploadMutation.mutate,
    updateDocumentStatus: updateStatusMutation.mutate,
    deleteDocument: deleteMutation.mutate,
    isUploading: uploadMutation.isPending,
    isUpdating: updateStatusMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
