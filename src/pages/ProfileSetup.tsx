import { useState } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../components/auth/AuthProvider';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useToast } from '../hooks/use-toast';

export default function ProfileSetup() {
  const { user, profile } = useAuth();

  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    school: profile?.school || '',
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to complete your profile.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: formData.full_name,
          email: user.email,
          school: formData.school || null,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Wait briefly for the profile to be updated
      await new Promise(resolve => setTimeout(resolve, 500));

      toast({
        title: 'Success',
        description: 'Your profile has been updated.',
      });

      // Get return URL from localStorage or default to home
      const returnUrl = localStorage.getItem('returnTo') || '/';
      localStorage.removeItem('returnTo');
      
      // Use window.location for full page reload
      window.location.href = returnUrl;
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-lg mx-auto p-4">
      <div className="bg-card rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Complete Your Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium mb-1">
              Full Name
            </label>
            <Input
              id="full_name"
              type="text"
              placeholder="Enter your full name"
              value={formData.full_name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev) => ({ ...prev, full_name: e.target.value }))
              }
              required
            />
          </div>

          <div>
            <label htmlFor="school" className="block text-sm font-medium mb-1">
              School
            </label>
            <Input
              id="school"
              type="text"
              placeholder="Enter your school"
              value={formData.school}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev) => ({ ...prev, school: e.target.value }))
              }
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Complete Profile'}
          </Button>
        </form>
      </div>
    </div>
  );
}
