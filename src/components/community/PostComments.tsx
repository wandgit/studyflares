import React, { useState } from 'react';
import { User, Heart } from 'lucide-react';
import Button from '../ui/Button';
import useCommunityStore, { PostComment } from '../../store/useCommunityStore';
import { formatDistanceToNow } from 'date-fns';

interface PostCommentsProps {
  postId: string;
  comments: PostComment[];
}

const PostComments: React.FC<PostCommentsProps> = ({ postId, comments }) => {
  const [newComment, setNewComment] = useState('');
  const { addComment, likeComment } = useCommunityStore();

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    addComment(postId, {
      author: {
        name: 'Demo User',
        avatar: undefined,
      },
      content: newComment.trim(),
    });

    setNewComment('');
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'recently';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'recently';
    }
  };

  return (
    <div className="mt-6">
      <h3 className="font-medium text-lg mb-4">{comments.length} Comments</h3>
      
      {/* Comment form */}
      <form onSubmit={handleSubmitComment} className="mb-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-leather text-white flex items-center justify-center shrink-0">
            <User size={16} />
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full p-3 rounded-lg border border-secondary bg-paper min-h-[80px]"
              required
            />
            <div className="flex justify-end mt-2">
              <Button type="submit" variant="primary" size="sm">
                Post Comment
              </Button>
            </div>
          </div>
        </div>
      </form>
      
      {/* Comments list */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="border-b border-secondary pb-4 last:border-0">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-leather text-white flex items-center justify-center shrink-0">
                {comment.author.avatar ? (
                  <img src={comment.author.avatar} alt={comment.author.name} className="w-full h-full rounded-full" />
                ) : (
                  <User size={16} />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{comment.author.name}</p>
                    <p className="text-xs text-text opacity-60">{formatDate(comment.date)}</p>
                  </div>
                </div>
                <p className="mt-2">{comment.content}</p>
                <div className="mt-2">
                  <button 
                    onClick={() => comment.id && likeComment(postId, comment.id)}
                    className="flex items-center text-text opacity-70 hover:text-leather"
                  >
                    <Heart size={14} className="mr-1" />
                    <span className="text-xs">{comment.likes}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {comments.length === 0 && (
          <div className="text-center py-6 text-text opacity-70">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostComments;
