import { useAuth } from '../auth/AuthProvider';
import { ProfileForm } from '../components/profile/ProfileForm';

const ProfilePage = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Profile Settings</h1>
        <div className="bg-white rounded-lg shadow">
          <ProfileForm />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
