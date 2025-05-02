import React, { useState } from 'react';
import Button from '../ui/Button';
import { X } from 'lucide-react';
import useCommunityStore from '../../store/useCommunityStore';
import { toast } from 'react-hot-toast';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'question' | 'studyGuide' | 'discussion'>('discussion');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  const { addPost } = useCommunityStore();
  
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (tags.length === 0) {
      toast.error('Please add at least one tag');
      return;
    }
    
    addPost({
      title: title.trim(),
      content: content.trim(),
      author: {
        name: 'Demo User',
        avatar: undefined,
      },
      tags,
      type,
    });
    
    toast.success('Post created successfully!');
    resetForm();
    onClose();
  };
  
  const resetForm = () => {
    setTitle('');
    setContent('');
    setType('discussion');
    setTags([]);
    setTagInput('');
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-paper rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-secondary">
          <h2 className="font-handwriting text-2xl">Create a New Post</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-secondary transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block mb-2 font-medium">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 rounded-lg border border-secondary bg-paper"
              placeholder="Enter a descriptive title"
              required
            />
          </div>
          
          <div>
            <label htmlFor="content" className="block mb-2 font-medium">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 rounded-lg border border-secondary bg-paper min-h-[150px]"
              placeholder="Share your thoughts, questions, or study materials..."
              required
            />
          </div>
          
          <div>
            <label htmlFor="type" className="block mb-2 font-medium">
              Post Type <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full p-2 rounded-lg border border-secondary bg-paper"
            >
              <option value="discussion">Discussion</option>
              <option value="question">Question</option>
              <option value="studyGuide">Study Guide</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="tags" className="block mb-2 font-medium">
              Tags <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <input
                id="tags"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="flex-1 p-2 rounded-l-lg border border-secondary bg-paper"
                placeholder="Add a tag (e.g., Math, Physics)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-leather text-white rounded-r-lg"
              >
                Add
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map((tag, index) => (
                <div 
                  key={index} 
                  className="px-3 py-1 bg-leather bg-opacity-20 text-leather rounded-full flex items-center"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-leather hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-secondary">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => {
                resetForm();
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Post
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
