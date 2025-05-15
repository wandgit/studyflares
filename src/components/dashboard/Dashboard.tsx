import { useAuth } from '../auth/AuthProvider';
import { useStatisticsService } from '../../hooks';
import RecentActivity from './RecentActivity';

const StatCard = ({ title, value, icon }: { title: string; value: string | number; icon: string }) => {
  return (
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
};

const Dashboard = () => {
  const { user } = useAuth();
  const { statistics, isLoadingStatistics } = useStatisticsService(user?.id || null);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Study Progress</h2>
            {/* Progress visualization would go here */}
            <div className="h-64 flex items-center justify-center text-gray-500">
              Study progress visualization will be displayed here
            </div>
          </div>
        </div>
        
        <div>
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
