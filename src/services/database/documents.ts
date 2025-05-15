import { DatabaseService } from './base';
import { DBDocument } from '../../types/database.types';

export class DocumentService extends DatabaseService {
  /**
   * Upload a new document to the database
   */
  async uploadDocument(
    userId: string,
    title: string,
    filePath: string,
    fileType: string,
    metadata: Record<string, any> = {}
  ): Promise<DBDocument> {
    try {
      const { data, error } = await this.supabase
        .from('documents')
        .insert({
          user_id: userId,
          title,
          file_path: filePath,
          file_type: fileType,
          status: 'processing',
          metadata
        })
        .select('*')
        .single();

      if (error) {
        return this.handleError(error);
      }

      return data as DBDocument;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update a document's status
   */
  async updateDocumentStatus(
    documentId: string,
    status: 'processing' | 'completed' | 'error',
    metadata: Record<string, any> = {}
  ): Promise<DBDocument> {
    try {
      const { data, error } = await this.supabase
        .from('documents')
        .update({
          status,
          metadata: {
            ...metadata,
            updated_at: new Date().toISOString()
          }
        })
        .eq('id', documentId)
        .select('*')
        .single();

      if (error) {
        return this.handleError(error);
      }

      return data as DBDocument;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get all documents for a user
   */
  async getDocuments(userId: string): Promise<DBDocument[]> {
    try {
      const { data, error } = await this.supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return this.handleError(error);
      }

      return data as DBDocument[];
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get a single document by ID
   */
  async getDocument(documentId: string): Promise<DBDocument> {
    try {
      const { data, error } = await this.supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error) {
        return this.handleError(error);
      }

      return data as DBDocument;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete a document
   */
  async deleteDocument(documentId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) {
        return this.handleError(error);
      }
    } catch (error) {
      return this.handleError(error);
    }
  }
}
