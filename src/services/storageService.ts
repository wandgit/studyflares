import { supabase } from '../config/supabase';

class StorageService {
  private readonly BUCKET_NAME = 'study-materials';

  async uploadFile(file: File, userId: string): Promise<string> {
    try {
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file);

      if (error) throw error;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      console.error('Storage service error:', error);
      throw new Error(error.message || 'Failed to upload file');
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) throw error;
    } catch (error: any) {
      console.error('Storage service error:', error);
      throw new Error(error.message || 'Failed to delete file');
    }
  }
}

export const storageService = new StorageService();
