import React from 'react';
import Button from '../ui/Button';
import { X } from 'lucide-react';
import useUserStore from '../../store/useUserStore';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const { 
    passwordData, 
    updatePasswordField, 
    changePassword 
  } = useUserStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    changePassword();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-paper rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-text opacity-70 hover:opacity-100"
        >
          <X size={20} />
        </button>
        
        <h2 className="font-handwriting text-2xl mb-6">Change Password</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Current Password</label>
              <input 
                type="password" 
                value={passwordData.currentPassword}
                onChange={(e) => updatePasswordField('currentPassword', e.target.value)}
                className="w-full p-3 rounded-lg border border-secondary bg-paper"
                placeholder="Enter your current password"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input 
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => updatePasswordField('newPassword', e.target.value)}
                className="w-full p-3 rounded-lg border border-secondary bg-paper"
                placeholder="Enter new password"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Confirm New Password</label>
              <input 
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => updatePasswordField('confirmPassword', e.target.value)}
                className="w-full p-3 rounded-lg border border-secondary bg-paper"
                placeholder="Confirm new password"
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
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
