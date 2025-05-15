import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useActivityService } from '../../hooks';
import { useAuth } from '../auth/AuthProvider';
import { DBActivity } from '../../types/database.types';

const ActivityIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'document_upload':
      return <span className="text-blue-500">ud83dudcc4</span>;
    case 'material_creation':
      return <span className="text-green-500">ud83dudcda</span>;
    case 'exam_attempt':
      return <span className="text-purple-500">ud83dudcdd</span>;
    case 'study_session':
      return <span className="text-amber-500">u23f1ufe0f</span>;
    default:
      return <span className="text-gray-500">ud83dudd04</span>;
  }
};

const ActivityTitle = ({ activity }: { activity: DBActivity }) => {
  const { activity_type, metadata } = activity;
  
  switch (activity_type) {
    case 'document_upload':
      return <span>Uploaded document <strong>{metadata?.title || 'Untitled'}</strong></span>;
    case 'material_creation':
      return <span>Created {metadata?.type || 'study material'} <strong>{metadata?.title || 'Untitled'}</strong></span>;
    case 'exam_attempt':
      return <span>Attempted exam <strong>{metadata?.title || 'Untitled'}</strong> {metadata?.passed ? '(Passed)' : ''}</span>;
    case 'study_session':
      return <span>Studied <strong>{metadata?.title || 'Untitled'}</strong> for {metadata?.duration_minutes || '?'} minutes</span>;
    default:
      return <span>Unknown activity</span>;
  }
};

const RecentActivity = () => {
  const { user } = useAuth();
  const { recentActivities, isLoadingActivities, error } = useActivityService(user?.id || null);
  const [activities, setActivities] = useState<DBActivity[]>([]);

  useEffect(() => {
    if (recentActivities) {
      setActivities(recentActivities);
    }
  }, [recentActivities]);

  if (isLoadingActivities) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="text-center text-red-500 py-4">
          Failed to load activities
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
      
      {activities.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <p>No recent activity</p>
          <p className="text-sm mt-2">Your learning activities will appear here</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {activities.map((activity) => (
            <li key={activity.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-md">
              <div className="mt-1">
                <ActivityIcon type={activity.activity_type} />
              </div>
              <div className="flex-1">
                <div className="text-sm">
                  <ActivityTitle activity={activity} />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {format(new Date(activity.created_at), 'MMM d, yyyy h:mm a')}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentActivity;
