import { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { User, Edit, Book, Calendar, Clock, ArrowRight, ChevronRight } from 'lucide-react';
import useUserStore, { User as UserType } from '../store/useUserStore';
import useAuthStore from '../store/useAuthStore';
import EditProfileModal from '../components/profile/EditProfileModal';
import ChangePasswordModal from '../components/profile/ChangePasswordModal';
import { toast } from 'react-hot-toast';
import { supabase } from '../config/supabase';

interface ActivityItem {
  id: string;
  title: string;
  type: 'study' | 'quiz' | 'upload';
  date: string;
  progress?: number;
}

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'settings'>('overview');
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { 
    currentUser, 
    loading: userLoading,
    updateProfile, 
    updateNotificationPreferences,
    initializeUser
  } = useUserStore();

  // Re-initialize user if we're authenticated but have no user data
  useEffect(() => {
    if (isAuthenticated && !userLoading && !currentUser) {
      console.log('No user data found, re-initializing...');
      initializeUser().catch(error => {
        console.error('Failed to re-initialize user:', error);
        toast.error('Failed to load profile data');
      });
    }
  }, [isAuthenticated, userLoading, currentUser, initializeUser]);

  // Show loading state while either auth or user data is loading
  if (authLoading || userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show sign-in message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-xl font-semibold">Please sign in</div>
        <p className="text-muted-foreground">You need to sign in to view your profile</p>
      </div>
    );
  }

  // Show error state if we're authenticated but have no user data
  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-xl font-semibold">Profile not found</div>
        <p className="text-muted-foreground">There was a problem loading your profile data</p>
        <Button onClick={() => initializeUser()}>Retry</Button>
      </div>
    );
  }

  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const fetchActivity = async () => {
      const { data: activities, error } = await supabase
        .from('activity_history')
        .select(`
          id,
          created_at,
          activity_type,
          study_material_id,
          exam_result_id,
          metadata,
          study_materials(title)
        `)
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching activity:', error);
        return;
      }

      setRecentActivity(
        activities.map((activity: any) => ({
          id: activity.id,
          title: activity.study_materials?.title || 'Deleted material',
          type: activity.activity_type,
          date: activity.created_at,
          progress: activity.metadata?.progress || 0,
        }))
      );
    };

    fetchActivity();
  }, [currentUser.id]);

  // Render activity icon based on type
  const renderActivityIcon = (type: string) => {
    switch (type) {
      case 'study':
        return <Book size={16} />;
      case 'quiz':
        return <Calendar size={16} />;
      case 'upload':
        return <ArrowRight size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const handleProfileUpdate = async (data: { name?: string; avatarUrl?: string }) => {
    try {
      await updateProfile(data);
      toast.success('Profile updated successfully');
      setIsEditProfileModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handleEditProfile = () => {
    setIsEditProfileModalOpen(true);
  };

  const handleChangePassword = () => {
    setIsChangePasswordModalOpen(true);
  };

  const handleToggleNotification = (preference: 'emailNotifications' | 'studyReminders' | 'weeklyProgressReports') => {
    updateNotificationPreferences({ [preference]: !currentUser?.notificationPreferences[preference] });
    toast.success('Notification preference updated');
  };

  const handleSaveSettings = () => {
    // In a real app, this would save all settings at once
    // For this demo, we'll just show a success message since individual settings are saved immediately
    toast.success('All settings saved successfully');
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Profile sidebar */}
        <div className="lg:w-80 shrink-0">
          <Card className="p-6 mb-6">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-leather text-white flex items-center justify-center mb-4">
                <User size={48} />
              </div>

              <h2 className="font-handwriting text-2xl">{currentUser.name}</h2>
              <p className="text-text opacity-70 mb-4">{currentUser.email}</p>

              <Button
                variant="outline"
                size="sm"
                leftIcon={<Edit size={16} />}
                className="mb-4"
                onClick={handleEditProfile}
              >
                Edit Profile
              </Button>

              <div className="w-full pt-4 border-t border-secondary space-y-4">
                <div className="flex justify-between mb-2">
                  <span className="text-text opacity-70">Joined</span>
                  <span>{new Date(currentUser.joinDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-text opacity-70">Study Time</span>
                  <span>{currentUser.studyTime}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-text opacity-70">Completed</span>
                  <span>{currentUser.completedItems} items</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-text opacity-70">Daily Streak</span>
                  <span>🔥 {currentUser.dailyStreak} days</span>
                </div>
                {currentUser.lastStudyDate && (
                  <div className="flex justify-between">
                    <span className="text-text opacity-70">Last Study</span>
                    <span>{new Date(currentUser.lastStudyDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-handwriting text-xl mb-4">Your Subjects</h3>

            <div className="space-y-4">
              {currentUser.subjects.map((subject, index) => {
                const stats = currentUser.studyStats[subject] || {
                  quizzesTaken: 0,
                  averageScore: 0,
                  totalStudyTime: 0,
                  lastStudied: null
                };
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{subject}</span>
                        {stats.lastStudied && (
                          <span className="text-sm text-muted-foreground">
                            Last: {new Date(stats.lastStudied).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <div className="text-muted-foreground">Quizzes</div>
                          <div>{stats.quizzesTaken}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Avg Score</div>
                          <div>{Math.round(stats.averageScore)}%</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Study Time</div>
                          <div>{Math.round(stats.totalStudyTime / 60)}h</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Main content */}
        <div className="flex-1">
          {/* Tabs */}
          <div className="mb-6 border-b border-secondary">
            <div className="flex flex-wrap -mb-px">
              <button
                key="overview"
                className={`inline-flex items-center pb-4 px-6 border-b-2 text-sm font-medium ${
                  activeTab === 'overview' 
                    ? 'border-leather text-leather' 
                    : 'border-transparent hover:border-secondary hover:text-text'
                }`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                key="activity"
                className={`inline-flex items-center pb-4 px-6 border-b-2 text-sm font-medium ${
                  activeTab === 'activity' 
                    ? 'border-leather text-leather' 
                    : 'border-transparent hover:border-secondary hover:text-text'
                }`}
                onClick={() => setActiveTab('activity')}
              >
                Activity
              </button>
              <button
                key="settings"
                className={`inline-flex items-center pb-4 px-6 border-b-2 text-sm font-medium ${
                  activeTab === 'settings' 
                    ? 'border-leather text-leather' 
                    : 'border-transparent hover:border-secondary hover:text-text'
                }`}
                onClick={() => setActiveTab('settings')}
              >
                Settings
              </button>
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <Card className="p-6">
                  <h3 className="font-handwriting text-xl mb-2">Study Progress</h3>
                  <p className="text-text opacity-70 mb-4">You're doing great! Keep up the good work.</p>

                  <div className="mt-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Weekly Goal</span>
                      <span className="text-sm text-leather">70%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2.5">
                      <div className="bg-leather h-2.5 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-handwriting text-xl mb-2">Study Streak</h3>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-leather">12</span>
                    <span className="ml-2 text-text opacity-70">days</span>
                  </div>
                  <p className="text-text opacity-70 mt-2">Your longest streak is 21 days</p>
                </Card>
              </div>

              <Card className="p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-handwriting text-xl">Recent Activity</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab('activity')}
                  >
                    View All
                  </Button>
                </div>

                <div className="space-y-4">
                  {recentActivity.slice(0, 3).map((activity) => (
                    <div key={activity.id} className="flex items-start">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${
                        activity.type === 'study' ? 'bg-green-100 text-green-800' :
                        activity.type === 'quiz' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {renderActivityIcon(activity.type)}
                      </div>

                      <div className="flex-1">
                        <h4 className="font-medium">{activity.title}</h4>
                        <p className="text-sm text-text opacity-70">
                          {new Date(activity.date).toLocaleDateString()}
                        </p>
                      </div>

                      {activity.progress !== undefined && (
                        <div className="text-right">
                          <span className="text-sm font-medium">{activity.progress}%</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-handwriting text-xl mb-4">Recommendations</h3>

                <div className="space-y-4">
                  <div className="p-4 border border-secondary rounded-lg hover:bg-secondary transition-colors">
                    <h4 className="font-medium mb-1">Quantum Mechanics Deep Dive</h4>
                    <p className="text-sm text-text opacity-70 mb-2">
                      Based on your recent study patterns, you might enjoy this advanced guide.
                    </p>
                    <Button size="sm">View Guide</Button>
                  </div>

                  <div className="p-4 border border-secondary rounded-lg hover:bg-secondary transition-colors">
                    <h4 className="font-medium mb-1">Join Physics Study Group</h4>
                    <p className="text-sm text-text opacity-70 mb-2">
                      Connect with peers who are studying similar topics.
                    </p>
                    <Button size="sm">Join Group</Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <Card className="p-6">
              <h3 className="font-handwriting text-xl mb-6">Your Activity</h3>

              <div className="space-y-6">
                {recentActivity.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="p-4 border border-secondary rounded-lg hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-start">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${
                        activity.type === 'study' ? 'bg-green-100 text-green-800' :
                        activity.type === 'quiz' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {renderActivityIcon(activity.type)}
                      </div>

                      <div className="flex-1">
                        <h4 className="font-medium">{activity.title}</h4>
                        <p className="text-sm text-text opacity-70 mb-3">
                          {new Date(activity.date).toLocaleDateString()}
                        </p>

                        {activity.progress !== undefined && (
                          <div className="mt-2">
                            <div className="flex justify-between mb-1">
                              <span className="text-xs">Progress</span>
                              <span className="text-xs">{activity.progress}%</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-1.5">
                              <div 
                                className="bg-leather h-1.5 rounded-full" 
                                style={{ width: `${activity.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <Card className="p-6">
              <h3 className="font-handwriting text-xl mb-6">Account Settings</h3>

              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-4">Personal Information</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Name</label>
                      <input 
                        type="text" 
                        defaultValue={currentUser.name} 
                        className="w-full p-3 rounded-lg border border-secondary bg-paper"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input 
                        type="email" 
                        defaultValue={currentUser.email} 
                        className="w-full p-3 rounded-lg border border-secondary bg-paper"
                        disabled
                      />
                    </div>
                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEditProfile}
                      >
                        Edit Profile Information
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-secondary">
                  <h4 className="font-medium mb-4">Notification Preferences</h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span>Email Notifications</span>
                      <div 
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${currentUser.notificationPreferences.emailNotifications ? 'bg-leather' : 'bg-secondary'} cursor-pointer`}
                        onClick={() => handleToggleNotification('emailNotifications')}
                      >
                        <span 
                          className={`${currentUser.notificationPreferences.emailNotifications ? 'translate-x-5' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-paper transition`}
                        ></span>
                      </div>
                    </label>
                    <label className="flex items-center justify-between">
                      <span>Study Reminders</span>
                      <div 
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${currentUser.notificationPreferences.studyReminders ? 'bg-leather' : 'bg-secondary'} cursor-pointer`}
                        onClick={() => handleToggleNotification('studyReminders')}
                      >
                        <span 
                          className={`${currentUser.notificationPreferences.studyReminders ? 'translate-x-5' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-paper transition`}
                        ></span>
                      </div>
                    </label>
                    <label className="flex items-center justify-between">
                      <span>Weekly Progress Reports</span>
                      <div 
                        className={`relative inline-flex h-6 w-11 items-center rounded-full ${currentUser.notificationPreferences.weeklyProgressReports ? 'bg-leather' : 'bg-secondary'} cursor-pointer`}
                        onClick={() => handleToggleNotification('weeklyProgressReports')}
                      >
                        <span 
                          className={`${currentUser.notificationPreferences.weeklyProgressReports ? 'translate-x-5' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-paper transition`}
                        ></span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pt-6 border-t border-secondary">
                  <h4 className="font-medium mb-4">Security</h4>
                  <Button onClick={handleChangePassword}>Change Password</Button>
                </div>

                <div className="flex justify-end pt-6 border-t border-secondary">
                  <Button variant="primary" onClick={handleSaveSettings}>Save Changes</Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Modals */}
      <EditProfileModal 
        isOpen={isEditProfileModalOpen} 
        onClose={() => setIsEditProfileModalOpen(false)}
        onSubmit={handleProfileUpdate}
        currentUser={currentUser}
      />
      
      <ChangePasswordModal 
        isOpen={isChangePasswordModalOpen} 
        onClose={() => setIsChangePasswordModalOpen(false)} 
      />
    </div>
  );
};

export default ProfilePage;
