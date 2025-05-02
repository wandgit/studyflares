import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import { X } from 'lucide-react';
import { User } from '../../store/useUserStore';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: { name?: string; avatarUrl?: string }) => Promise<void>;
  currentUser: User;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, onSubmit, currentUser }) => {
  const [formData, setFormData] = useState<Partial<User>>({});

  useEffect(() => {
    if (currentUser && isOpen) {
      // Initialize form with current user data
      setFormData({
        name: currentUser.name,
        email: currentUser.email,
      });
    }
  }, [currentUser, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      await onSubmit({
        name: formData.name,
        avatarUrl: formData.avatarUrl
      });
    }
    onClose();
  };

  if (!isOpen || !currentUser) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-paper rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-text opacity-70 hover:opacity-100"
        >
          <X size={20} />
        </button>
        
        <h2 className="font-handwriting text-2xl mb-6">Edit Profile</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input 
                type="text" 
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-secondary bg-paper"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input 
                type="email" 
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-secondary bg-paper"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              type="button" 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
