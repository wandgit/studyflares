import { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { User, MessageSquare, Heart, Share2, Search } from 'lucide-react';
import useCommunityStore, { Post } from '../store/useCommunityStore';
import CreatePostModal from '../components/community/CreatePostModal';
import PostDetail from '../components/community/PostDetail';
import RecommendedCommunities from '../components/community/RecommendedCommunities';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const CommunityPage = () => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  
  const { 
    popularTags, 
    filterPostsByType, 
    searchPosts,
    likePost,
    unlikePost,
    setSearchQuery: storeSetSearchQuery
  } = useCommunityStore();
  
  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    storeSetSearchQuery(e.target.value);
  };
  
  // Handle post filtering by type
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setActiveTag(null);
  };
  
  // Handle post filtering by tag
  const handleTagClick = (tag: string) => {
    setActiveTag(tag === activeTag ? null : tag);
    setActiveFilter('all');
  };
  
  // Get filtered posts based on active filter and tag
  const filteredPosts = activeTag 
    ? searchPosts().filter(post => post.tags.includes(activeTag))
    : filterPostsByType(activeFilter);
  
  // Handle post selection for detailed view
  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
  };
  
  // Handle post like/unlike
  const handleLike = (postId: string, liked: boolean | undefined) => {
    if (liked) {
      unlikePost(postId);
    } else {
      likePost(postId);
      toast.success('Post liked!');
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main content */}
        <div className="flex-1">
          {selectedPost ? (
            <PostDetail 
              post={selectedPost} 
              onBack={() => setSelectedPost(null)} 
            />
          ) : (
            <>
              {/* Search and filter bar */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-text opacity-50" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search posts..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-secondary bg-paper"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
                <Button
                  variant="primary"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  Create Post
                </Button>
              </div>
              
              {/* Category filters */}
              <div className="flex flex-wrap gap-2 mb-6">
                <Button
                  variant={activeFilter === 'all' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange('all')}
                >
                  All Posts
                </Button>
                <Button
                  variant={activeFilter === 'studyGuide' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange('studyGuide')}
                >
                  Study Guides
                </Button>
                <Button
                  variant={activeFilter === 'question' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange('question')}
                >
                  Questions
                </Button>
                <Button
                  variant={activeFilter === 'discussion' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange('discussion')}
                >
                  Discussions
                </Button>
                <Button
                  variant={activeFilter === 'popular' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterChange('popular')}
                >
                  Popular
                </Button>
              </div>
              
              {/* Posts list */}
              <div className="space-y-4">
                {filteredPosts.length === 0 ? (
                  <Card className="p-6 text-center">
                    <p>No posts found. Try a different search or filter.</p>
                  </Card>
                ) : (
                  filteredPosts.map((post) => (
                    <Card key={post.id} className="p-0 overflow-hidden">
                      <div className="flex">
                        <div className="p-6 flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                              <User size={16} />
                            </div>
                            <div>
                              <p className="font-medium">{post.author.name}</p>
                              <p className="text-xs text-text opacity-70">
                                {formatDistanceToNow(new Date(post.date), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                          
                          <div>
                            <h3 
                              className="text-lg font-medium mb-1 cursor-pointer hover:text-leather"
                              onClick={() => handlePostClick(post)}
                            >
                              {post.title}
                            </h3>
                            <span className="text-xs px-2 py-1 rounded bg-secondary">
                              {post.type === 'studyGuide' ? 'Study Guide' : 
                               post.type === 'question' ? 'Question' : 'Discussion'}
                            </span>
                          </div>
                          
                          <p className="my-3">
                            {post.content.length > 200 
                              ? `${post.content.substring(0, 200)}...` 
                              : post.content
                            }
                          </p>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.map((tag, index) => (
                              <span 
                                key={index} 
                                className={`text-xs px-2 py-1 rounded cursor-pointer ${activeTag === tag ? 'bg-leather text-white' : 'bg-secondary hover:bg-opacity-70'}`}
                                onClick={() => handleTagClick(tag)}
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <button 
                              className="flex items-center gap-1 text-sm text-text opacity-70 hover:opacity-100"
                              onClick={() => handlePostClick(post)}
                            >
                              <MessageSquare size={16} />
                              {post.comments.length}
                            </button>
                            
                            <button 
                              className={`flex items-center gap-1 text-sm ${post.liked ? 'text-red-500' : 'text-text opacity-70 hover:opacity-100'}`}
                              onClick={() => handleLike(post.id, post.liked)}
                            >
                              <Heart size={16} />
                              {post.likes}
                            </button>
                            
                            <button className="flex items-center gap-1 text-sm text-text opacity-70 hover:opacity-100">
                              <Share2 size={16} />
                              Share
                            </button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="lg:w-80 shrink-0 space-y-6">
          {/* Recommended Communities */}
          <RecommendedCommunities />
          
          {/* Popular tags */}
          <Card className="p-6">
            <h3 className="font-handwriting text-xl mb-4">Popular Tags</h3>
            
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag, index) => (
                <span 
                  key={index} 
                  className={`text-sm px-3 py-1 rounded-full cursor-pointer ${activeTag === tag ? 'bg-leather text-white' : 'bg-secondary hover:bg-opacity-70'}`}
                  onClick={() => handleTagClick(tag)}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </Card>
          
          {/* Community guidelines */}
          <Card className="p-6">
            <h3 className="font-handwriting text-xl mb-4">Community Guidelines</h3>
            
            <ul className="space-y-2 text-sm">
              <li>Be respectful and supportive of others</li>
              <li>Share quality educational content</li>
              <li>Properly cite sources when sharing material</li>
              <li>Ask clear, specific questions</li>
              <li>Help others by providing thoughtful answers</li>
            </ul>
          </Card>
        </div>
      </div>
      
      {/* Create post modal */}
      <CreatePostModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
};

export default CommunityPage;
