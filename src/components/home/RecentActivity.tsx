import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';

interface StudyMaterial {
  title: string;
}

interface Activity {
  id: string;
  type: string;
  created_at: string;
  metadata: any;
  study_material_id: StudyMaterial | null;
}

export interface RecentActivityProps {
  userId?: string;
  maxItems?: number;
  showViewAll?: boolean;
}

const RecentActivity = ({ userId, maxItems = 5, showViewAll = false }: RecentActivityProps) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('activities')
          .select(`
            id,
            type,
            created_at,
            metadata,
            study_material_id (
              title
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(maxItems);

        if (error) throw error;

        // Transform raw data to match our Activity interface
        const transformedData: Activity[] = (data || []).map(item => ({
          id: item.id,
          type: item.type,
          created_at: item.created_at,
          metadata: item.metadata,
          study_material_id: item.study_material_id?.[0] || null
        }));

        setActivities(transformedData);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [userId, maxItems]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="mb-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No recent activity</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Recent Activity</h2>
        {showViewAll && (
          <a href="/activity" className="text-blue-600 hover:text-blue-700">
            View All
          </a>
        )}
      </div>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start p-4 bg-white rounded-lg shadow-sm"
          >
            <div className="flex-1">
              <h3 className="font-medium">
                {activity.study_material_id?.title || 'Untitled Material'}
              </h3>
              <p className="text-sm text-gray-500">
                {new Date(activity.created_at).toLocaleDateString()}
              </p>
              {activity.metadata && (
                <p className="text-sm text-gray-600 mt-1">
                  {typeof activity.metadata === 'object'
                    ? JSON.stringify(activity.metadata)
                    : activity.metadata}
                </p>
              )}
            </div>
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
              {activity.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
