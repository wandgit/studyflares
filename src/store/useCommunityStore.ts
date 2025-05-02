import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PostAuthor {
  name: string;
  avatar?: string;
}

export interface PostComment {
  id?: string;
  author: PostAuthor;
  content: string;
  likes?: number;
  date?: string;
  liked?: boolean;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: PostAuthor;
  tags: string[];
  type: 'studyGuide' | 'question' | 'discussion';
  likes: number;
  comments: PostComment[];
  date: string;
  createdAt: string;
  liked?: boolean;
}

interface CreatePostData {
  title: string;
  content: string;
  author: PostAuthor;
  tags: string[];
  type: 'studyGuide' | 'question' | 'discussion';
}

interface CommunityState {
  posts: Post[];
  searchQuery: string;
  
  // Post management
  addPost: (data: CreatePostData) => void;
  updatePost: (id: string, updates: Partial<Post>) => void;
  deletePost: (id: string) => void;
  
  // Post interactions
  likePost: (id: string) => void;
  unlikePost: (id: string) => void;
  
  // Comment management
  addComment: (postId: string, comment: Omit<PostComment, 'id' | 'date' | 'likes' | 'liked'>) => void;
  likeComment: (postId: string, commentId: string) => void;
  unlikeComment: (postId: string, commentId: string) => void;
  deleteComment: (postId: string, commentId: string) => void;
  
  // Filtering and searching
  filterPostsByType: (type: string) => Post[];
  searchPosts: (query?: string) => Post[];
  setSearchQuery: (query: string) => void;
  
  // Getters
  getPostById: (id: string) => Post | undefined;
  getPopularTags: () => string[];
  popularTags: string[];
}

const useCommunityStore = create<CommunityState>()(persist(
  (set, get) => ({
    posts: [
      {
        id: 'post-1',
        title: "Understanding Quantum Mechanics: A Beginner's Guide",
        content: 'Quantum mechanics is a fundamental theory in physics that describes nature at the smallest scales of energy levels of atoms and subatomic particles. Here are some key concepts to understand...',
        author: {
          name: 'Alex Johnson',
          avatar: undefined,
        },
        tags: ['physics', 'quantum', 'science'],
        type: 'studyGuide',
        likes: 24,
        comments: [
          {
            id: 'comment-1',
            author: {
              name: 'Jamie Smith',
              avatar: undefined,
            },
            content: 'This is really helpful! Could you elaborate more on quantum entanglement?',
            likes: 5,
            date: '2025-03-20T14:30:00Z',
            liked: false,
          },
        ],
        date: '2025-03-18T09:15:00Z',
        createdAt: '2025-03-18T09:15:00Z',
        liked: false,
      },
      {
        id: 'post-2',
        title: 'Need help with calculus problem',
        content: "I'm struggling with this integration by parts problem. Can someone explain how to solve ∫x*ln(x)dx?",
        author: {
          name: 'Taylor Wong',
          avatar: undefined,
        },
        tags: ['math', 'calculus', 'homework'],
        type: 'question',
        likes: 8,
        comments: [
          {
            id: 'comment-2',
            author: {
              name: 'Alex Johnson',
              avatar: undefined,
            },
            content: "For integration by parts, use the formula ∫u*dv = u*v - ∫v*du. Let u=ln(x) and dv=x*dx...",
            likes: 12,
            date: '2025-03-21T10:45:00Z',
            liked: true,
          },
        ],
        date: '2025-03-21T08:30:00Z',
        createdAt: '2025-03-21T08:30:00Z',
        liked: true,
      },
      {
        id: 'post-3',
        title: 'Discussion: Is AI replacing traditional education?',
        content: "With the rise of AI-powered learning tools, I'm curious about everyone's thoughts on how this might change traditional education methods. Will classrooms look completely different in 10 years?",
        author: {
          name: 'Jordan Rivera',
          avatar: undefined,
        },
        tags: ['education', 'AI', 'future', 'technology'],
        type: 'discussion',
        likes: 32,
        comments: [
          {
            id: 'comment-3',
            author: {
              name: 'Casey Kim',
              avatar: undefined,
            },
            content: 'I think AI will enhance education rather than replace it. Teachers will use AI tools to personalize learning experiences.',
            likes: 8,
            date: '2025-03-22T16:20:00Z',
            liked: false,
          },
          {
            id: 'comment-4',
            author: {
              name: 'Taylor Wong',
              avatar: undefined,
            },
            content: "There's definitely going to be a shift, but human connection in education remains important. Hybrid models will likely become the norm.",
            likes: 6,
            date: '2025-03-22T18:05:00Z',
            liked: false,
          },
        ],
        date: '2025-03-22T14:10:00Z',
        createdAt: '2025-03-22T14:10:00Z',
        liked: false,
      },
    ],
    searchQuery: '',
    
    addPost: (data) => {
      const newPost: Post = {
        id: `post-${Date.now()}`,
        ...data,
        likes: 0,
        comments: [],
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        liked: false,
      };
      
      set((state) => ({
        posts: [newPost, ...state.posts],
      }));
      
      return newPost.id;
    },
    
    updatePost: (id, updates) => {
      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === id ? { ...post, ...updates } : post
        ),
      }));
    },
    
    deletePost: (id) => {
      set((state) => ({
        posts: state.posts.filter((post) => post.id !== id),
      }));
    },
    
    likePost: (id) => {
      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === id
            ? { ...post, likes: post.likes + 1, liked: true }
            : post
        ),
      }));
    },
    
    unlikePost: (id) => {
      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === id && post.likes > 0
            ? { ...post, likes: post.likes - 1, liked: false }
            : post
        ),
      }));
    },
    
    addComment: (postId, comment) => {
      const newComment: PostComment = {
        id: `comment-${Date.now()}`,
        ...comment,
        likes: 0,
        date: new Date().toISOString(),
        liked: false,
      };
      
      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === postId
            ? { ...post, comments: [newComment, ...post.comments] }
            : post
        ),
      }));
    },
    
    likeComment: (postId, commentId) => {
      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: post.comments.map((comment) =>
                  comment.id === commentId
                    ? { ...comment, likes: (comment.likes || 0) + 1, liked: true }
                    : comment
                ),
              }
            : post
        ),
      }));
    },
    
    unlikeComment: (postId, commentId) => {
      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: post.comments.map((comment) =>
                  comment.id === commentId && (comment.likes || 0) > 0
                    ? { ...comment, likes: (comment.likes || 0) - 1, liked: false }
                    : comment
                ),
              }
            : post
        ),
      }));
    },
    
    deleteComment: (postId, commentId) => {
      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: post.comments.filter(
                  (comment) => comment.id !== commentId
                ),
              }
            : post
        ),
      }));
    },
    
    filterPostsByType: (type) => {
      const { posts } = get();
      
      if (type === 'all') {
        return posts;
      }
      
      if (type === 'popular') {
        return [...posts].sort((a, b) => b.likes - a.likes);
      }
      
      return posts.filter((post) => post.type === type);
    },
    
    searchPosts: (query) => {
      const { posts } = get();
      const searchTerm = query || get().searchQuery;
      
      if (!searchTerm) {
        return posts;
      }
      
      const lowercaseQuery = searchTerm.toLowerCase();
      
      return posts.filter(
        (post) =>
          post.title.toLowerCase().includes(lowercaseQuery) ||
          post.content.toLowerCase().includes(lowercaseQuery) ||
          post.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
      );
    },
    
    setSearchQuery: (query) => {
      set({ searchQuery: query });
    },
    
    getPostById: (id) => {
      return get().posts.find((post) => post.id === id);
    },
    
    getPopularTags: () => {
      const { posts } = get();
      const tagCounts: Record<string, number> = {};
      
      posts.forEach((post) => {
        post.tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });
      
      return Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([tag]) => tag);
    },
    
    get popularTags() {
      return get().getPopularTags();
    },
  }),
  {
    name: 'community-store',
  }
));

export default useCommunityStore;
