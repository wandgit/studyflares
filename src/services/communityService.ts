import { supabase } from '../config/supabase';
import { Database } from '../types/supabase';

type CommunityPost = Database['public']['Tables']['community_posts']['Row'];
type CommunityPostInsert = Database['public']['Tables']['community_posts']['Insert'];
type CommunityPostUpdate = Database['public']['Tables']['community_posts']['Update'];
type Comment = Database['public']['Tables']['comments']['Row'];
type CommentInsert = Database['public']['Tables']['comments']['Insert'];

class CommunityService {
  // Posts
  async createPost(data: Omit<CommunityPostInsert, 'id' | 'created_at' | 'updated_at' | 'likes' | 'comments_count'>) {
    const { data: post, error } = await supabase
      .from('community_posts')
      .insert({ ...data, likes: 0, comments_count: 0 })
      .select()
      .single();

    if (error) throw this.handleError(error);
    return post;
  }

  async updatePost(id: string, data: CommunityPostUpdate) {
    const { data: post, error } = await supabase
      .from('community_posts')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw this.handleError(error);
    return post;
  }

  async getPost(id: string) {
    const { data: post, error } = await supabase
      .from('community_posts')
      .select(`
        *,
        profiles (
          name,
          avatar_url
        ),
        study_materials (
          title,
          subject,
          type
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw this.handleError(error);
    return post;
  }

  async getPosts(options: { tag?: string; userId?: string; studyMaterialId?: string } = {}) {
    let query = supabase
      .from('community_posts')
      .select(`
        *,
        profiles (
          name,
          avatar_url
        ),
        study_materials (
          title,
          subject,
          type
        )
      `)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (options.tag) {
      query = query.contains('tags', [options.tag]);
    }

    if (options.userId) {
      query = query.eq('user_id', options.userId);
    }

    if (options.studyMaterialId) {
      query = query.eq('study_material_id', options.studyMaterialId);
    }

    const { data: posts, error } = await query;

    if (error) throw this.handleError(error);
    return posts;
  }

  async deletePost(id: string) {
    const { error } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', id);

    if (error) throw this.handleError(error);
  }

  async likePost(id: string) {
    const { error } = await supabase.rpc('increment_post_likes', { post_id: id });
    if (error) throw this.handleError(error);
  }

  async unlikePost(id: string) {
    const { error } = await supabase.rpc('decrement_post_likes', { post_id: id });
    if (error) throw this.handleError(error);
  }

  // Comments
  async createComment(data: Omit<CommentInsert, 'id' | 'created_at' | 'updated_at' | 'likes'>) {
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({ ...data, likes: 0 })
      .select()
      .single();

    if (error) throw this.handleError(error);

    // Increment the post's comment count
    await this.incrementCommentCount(data.post_id);

    return comment;
  }

  async getComments(postId: string) {
    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles (
          name,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw this.handleError(error);
    return comments;
  }

  async deleteComment(id: string, postId: string) {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (error) throw this.handleError(error);

    // Decrement the post's comment count
    await this.decrementCommentCount(postId);
  }

  async likeComment(id: string) {
    const { error } = await supabase.rpc('increment_comment_likes', { comment_id: id });
    if (error) throw this.handleError(error);
  }

  async unlikeComment(id: string) {
    const { error } = await supabase.rpc('decrement_comment_likes', { comment_id: id });
    if (error) throw this.handleError(error);
  }

  private async incrementCommentCount(postId: string) {
    const { error } = await supabase.rpc('increment_post_comments', { post_id: postId });
    if (error) throw this.handleError(error);
  }

  private async decrementCommentCount(postId: string) {
    const { error } = await supabase.rpc('decrement_post_comments', { post_id: postId });
    if (error) throw this.handleError(error);
  }

  private handleError(error: any): Error {
    console.error('Community service error:', error);
    return new Error(error.message || 'An error occurred in the community service');
  }
}

export const communityService = new CommunityService();
