import React, { useState } from 'react';
import { User, MessageSquare, Heart, Share2, ArrowLeft } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import PostComments from './PostComments';
import useCommunityStore, { Post } from '../../store/useCommunityStore';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';

interface PostDetailProps {
  post: Post;
  onBack: () => void;
}

const PostDetail: React.FC<PostDetailProps> = ({ post, onBack }) => {
  const [showComments, setShowComments] = useState(true);
  const { likePost, unlikePost } = useCommunityStore();

  const handleLike = () => {
    if (post.liked) {
      unlikePost(post.id);
    } else {
      likePost(post.id);
      toast.success('Post liked!');
    }
  };

  const handleShare = () => {
    // In a real app, this would use the Web Share API or copy to clipboard
    navigator.clipboard.writeText(
      `Check out this post on EduAI Companion: ${post.title}`
    );
    toast.success('Link copied to clipboard!');
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'recently';
    }
  };

  return (
    <div className="space-y-4">
      <Button 
        variant="secondary" 
        size="sm" 
        leftIcon={<ArrowLeft size={16} />}
        onClick={onBack}
      >
        Back to Community
      </Button>
      
      <Card className="p-6">
        <div className="flex items-start mb-4">
          <div className="w-10 h-10 rounded-full bg-leather text-white flex items-center justify-center mr-3">
            {post.author.avatar ? (
              <img src={post.author.avatar} alt={post.author.name} className="w-full h-full rounded-full" />
            ) : (
              <User size={18} />
            )}
          </div>
          <div>
            <p className="font-medium">{post.author.name}</p>
            <p className="text-sm text-text opacity-60">
              {formatDate(post.date)}
            </p>
          </div>
        </div>
        
        <h2 className="font-handwriting text-2xl mb-2">{post.title}</h2>
        
        <p className="mb-4 text-text whitespace-pre-line">{post.content}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 text-xs rounded-full bg-leather bg-opacity-20 text-leather"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-secondary">
          <div className="flex space-x-4">
            <button 
              className={`flex items-center ${post.liked ? 'text-leather' : 'text-text opacity-70 hover:text-leather'}`}
              onClick={handleLike}
            >
              <Heart size={16} className="mr-1" fill={post.liked ? 'currentColor' : 'none'} />
              <span>{post.likes}</span>
            </button>
            <button 
              className="flex items-center text-text opacity-70 hover:text-leather"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageSquare size={16} className="mr-1" />
              <span>{post.comments.length}</span>
            </button>
          </div>
          
          <button 
            className="flex items-center text-text opacity-70 hover:text-leather"
            onClick={handleShare}
          >
            <Share2 size={16} className="mr-1" />
            <span className="text-sm">Share</span>
          </button>
        </div>
        
        {showComments && (
          <PostComments postId={post.id} comments={post.comments} />
        )}
      </Card>
    </div>
  );
};

export default PostDetail;
