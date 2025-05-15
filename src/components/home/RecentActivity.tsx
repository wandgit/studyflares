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
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-heading text-2xl">Recent Activity</h2>
        {showViewAll && (
          <a 
            href="/activity" 
            className="text-primary hover:text-primary/80 font-medium"
          >
            View All
          </a>
        )}
      </div>
      <div className="grid gap-4">
        {activities.map((activity) => {
          const date = new Date(activity.created_at);
          const formattedDate = new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
          }).format(date);

          return (
            <div
              key={activity.id}
              className="bg-card hover:bg-card/80 transition-colors rounded-lg p-4 shadow-sm border border-border"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-lg truncate">
                    {activity.study_material_id?.title || 'Untitled Material'}
                  </h3>
                  <p className="text-sm text-text/70 mb-2">{formattedDate}</p>
                  {activity.metadata && (
                    <p className="text-sm text-text/80 line-clamp-2">
                      {typeof activity.metadata === 'object'
                        ? activity.metadata.description || JSON.stringify(activity.metadata)
                        : activity.metadata}
                    </p>
                  )}
                </div>
                <span className="shrink-0 px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                  {activity.type}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;
