import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../lib/supabaseClient';
import { Profile } from '../auth/types';

export const useProfile = () => {
  const { user, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Error updating profile');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Upload image
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile
      await updateProfile({ avatar_url: publicUrl });
    } catch (error) {
      toast.error('Error uploading avatar');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateProfile,
    uploadAvatar,
    isLoading,
    profile: user?.profile
  };
};
