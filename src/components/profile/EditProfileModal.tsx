import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import { X } from 'lucide-react';
import { Profile } from '../../types/profile';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: { full_name?: string; avatar_url?: string }) => Promise<void>;
  profile: Profile;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, onSubmit, profile }) => {
  const [formData, setFormData] = useState<Partial<Profile>>({ full_name: '', school: '' });

  useEffect(() => {
    if (profile && isOpen) {
      // Initialize form with current profile data
      setFormData({
        full_name: profile.full_name || '',
        school: profile.school || '',
      });
    }
  }, [profile, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: Partial<Profile>) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      await onSubmit({
        full_name: formData.full_name || undefined,
        avatar_url: formData.avatar_url || undefined
      });
    }
    onClose();
  };

  if (!isOpen || !profile) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-paper rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-text opacity-70 hover:opacity-100"
        >
          <X size={20} />
        </button>
        
        <h2 className="font-heading text-2xl mb-6">Edit Profile</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input 
                type="text" 
                name="full_name"
                value={formData.full_name || ''}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-secondary bg-paper"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">School</label>
              <input 
                type="text" 
                name="school"
                value={formData.school || ''}
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
