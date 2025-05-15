import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../components/auth/AuthProvider';
import { useToast } from '../hooks/use-toast';
import { UserCircle, Award, BookOpen, Clock } from 'lucide-react';
import useProgressStore from '../store/useProgressStore';
import { formatStudyTime } from '../utils/formatters';

export default function ProfilePage() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userLevel, topics } = useProgressStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleEditProfile = () => {
    navigate('/profile/setup');
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut();
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="font-heading text-4xl mb-6">Your Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          {/* Profile Summary Card */}
          <Card className="p-6 mb-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-leather rounded-full flex items-center justify-center text-paper mb-4">
                <UserCircle size={64} />
              </div>
              
              <h2 className="text-2xl font-semibold">{profile?.full_name || 'User'}</h2>
              <p className="text-gray-600 mb-2">{user?.email}</p>
              
              <div className="bg-secondary rounded-full px-4 py-1 mb-4">
                <div className="flex items-center gap-1">
                  <Award size={16} className="text-leather" />
                  <span>Level {userLevel.currentLevel}</span>
                </div>
              </div>
              
              <div className="flex gap-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleEditProfile}
                >
                  Edit Profile
                </Button>
                
                <Button 
                  variant="outline"
                  size="sm"
                  isLoading={isLoading}
                  onClick={handleLogout}
                >
                  Log Out
                </Button>
              </div>
            </div>
          </Card>
          
          {/* School Info Card */}
          <Card className="p-6">
            <h3 className="font-heading text-xl mb-4">School Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">School</p>
                <p className="font-medium">{profile?.school || 'Not set'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Joined</p>
                <p className="font-medium">
                  {user?.created_at 
                    ? new Date(user.created_at).toLocaleDateString() 
                    : 'Unknown'}
                </p>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          {/* Stats Overview */}
          <Card className="p-6 mb-6">
            <h3 className="font-heading text-xl mb-4">Learning Progress</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-secondary bg-opacity-30 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Current XP</p>
                    <p className="text-xl font-bold">{userLevel.currentXP}</p>
                  </div>
                  <Award size={24} className="text-leather" />
                </div>
              </div>
              
              <div className="bg-secondary bg-opacity-30 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Topics Studied</p>
                    <p className="text-xl font-bold">{Object.keys(useProgressStore.getState().topics).length}</p>
                  </div>
                  <BookOpen size={24} className="text-leather" />
                </div>
              </div>
              
              <div className="bg-secondary bg-opacity-30 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Study Time</p>
                    <p className="text-xl font-bold">{formatStudyTime(Object.values(topics).reduce((total, topic) => {
                      const studyTime = topic.quizzesTaken * 10 + topic.examsTaken * 30;
                      return total + studyTime;
                    }, 0))}</p>
                  </div>
                  <Clock size={24} className="text-leather" />
                </div>
              </div>
            </div>
            
            {/* Level Progress */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Level {userLevel.currentLevel}</span>
                <span>{userLevel.currentXP} / {userLevel.xpToNextLevel} XP</span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-leather transition-all duration-500" 
                  style={{ width: `${(userLevel.currentXP / userLevel.xpToNextLevel) * 100}%` }}
                />
              </div>
            </div>
          </Card>
          
          {/* Recent Activity */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-xl">Recent Activity</h3>
              <Button 
                variant="ghost"
                className="text-accent"
                onClick={() => navigate('/library')}
              >
                View All
              </Button>
            </div>
            
            {Object.keys(useProgressStore.getState().topics).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(useProgressStore.getState().topics).slice(0, 3).map(([id, topic]) => (
                  <div key={id} className="flex items-center p-3 bg-secondary bg-opacity-20 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{topic.name}</p>
                      <p className="text-sm text-gray-600">
                        Last studied: {topic.lastStudied 
                          ? new Date(topic.lastStudied).toLocaleDateString() 
                          : 'Never'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{useProgressStore.getState().calculateMasteryLevel(id)}%</div>
                      <div className="text-xs text-gray-600">Mastery</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No study activity yet.</p>
                <p className="mt-2">Upload content to start studying!</p>
                <Button 
                  variant="primary" 
                  className="mt-4"
                  onClick={() => navigate('/upload')}
                >
                  Upload Materials
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
