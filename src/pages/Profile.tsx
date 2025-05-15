import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthProvider';
import Card from '../components/ui/Card';

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  useEffect(() => {
    // Redirect to profile setup if no profile
    if (!profile) {
      navigate('/profile/setup');
    }
  }, [profile, navigate]);

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="p-6">
        <h1 className="text-2xl font-heading mb-6">Your Profile</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <p className="text-lg">{profile.full_name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <p className="text-lg">{profile.email}</p>
          </div>

          {profile.school && (
            <div>
              <label className="block text-sm font-medium mb-1">School</label>
              <p className="text-lg">{profile.school}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
