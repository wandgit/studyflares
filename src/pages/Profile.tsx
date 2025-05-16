import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthProvider';
import { useStatisticsService } from '../hooks';
import Card from '../components/ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const StatCard = ({ title, value, icon }: { title: string; value: string | number; icon: string }) => (
  <div className="bg-white p-4 rounded-lg shadow flex items-center">
    <div className="bg-primary bg-opacity-10 p-3 rounded-full mr-4">
      <span className="text-xl">{icon}</span>
    </div>
    <div>
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  </div>
);

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { statistics, isLoadingStatistics } = useStatisticsService(user?.id || null);

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
    <div className="max-w-6xl mx-auto p-4 space-y-6">
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

      <Card className="p-6">
        <h2 className="text-xl font-heading mb-6">Learning Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="Study Time" 
            value={isLoadingStatistics ? '...' : `${statistics?.study_time_minutes || 0} mins`}
            icon="⏱️"
          />
          <StatCard 
            title="Materials Created" 
            value={isLoadingStatistics ? '...' : statistics?.materials_created || 0}
            icon="📚"
          />
          <StatCard 
            title="Exams Taken" 
            value={isLoadingStatistics ? '...' : statistics?.exams_taken || 0}
            icon="📝"
          />
          <StatCard 
            title="Exams Passed" 
            value={isLoadingStatistics ? '...' : statistics?.exams_passed || 0}
            icon="🏆"
          />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-heading mb-6">Study Progress</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Progress Chart */}
          <div className="bg-secondary p-4 rounded">
            <h3 className="text-lg font-semibold mb-4">Weekly Study Time</h3>
            <div className="h-[300px]">
              <ResponsiveContainer>
                <BarChart data={statistics?.weekly_study_time || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => [`${value} mins`, 'Study Time']}
                  />
                  <Bar dataKey="minutes" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subject Performance Chart */}
          <div className="bg-secondary p-4 rounded">
            <h3 className="text-lg font-semibold mb-4">Subject Performance</h3>
            <div className="h-[300px]">
              <ResponsiveContainer>
                <LineChart data={statistics?.subject_performance || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, 'Score']}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    dot={{ fill: '#4f46e5' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
