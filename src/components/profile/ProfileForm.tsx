import { useState, useEffect } from 'react';
import { useProfile } from '../../hooks/useProfile';
import { ChangePassword } from './ChangePassword';

export const ProfileForm = () => {
  const { profile, updateProfile, uploadAvatar, isLoading } = useProfile();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [school, setSchool] = useState(profile?.school || '');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setSchool(profile.school || '');
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ full_name: fullName, school });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadAvatar(file);
    }
  };

  return (
    <div className="space-y-8">
      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto p-4">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <img
              src={profile?.avatar_url || '/default-avatar.png'}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover"
            />
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={isLoading}
              />
            </label>
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            disabled={isLoading}
          />
        </div>

        {/* School */}
        <div>
          <label htmlFor="school" className="block text-sm font-medium text-gray-700">
            School
          </label>
          <input
            id="school"
            type="text"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>

        {/* Change Password Button */}
        <button
          type="button"
          onClick={() => setShowPasswordForm(!showPasswordForm)}
          className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {showPasswordForm ? 'Hide Password Form' : 'Change Password'}
        </button>
      </form>

      {/* Password Change Form */}
      {showPasswordForm && (
        <div className="border-t border-gray-200 pt-8">
          <ChangePassword />
        </div>
      )}
    </div>
  );
};
