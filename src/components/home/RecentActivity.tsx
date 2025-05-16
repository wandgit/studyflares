import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

export interface RecentActivityProps {
  userId?: string;
  maxItems?: number;
}

const RecentActivity = ({ userId, maxItems = 5 }: RecentActivityProps) => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);



  useEffect(() => {
    const fetchMaterials = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('study_materials')
          .select('id, title, description, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(maxItems);

        if (error) throw error;

        setMaterials(data || []);
      } catch (error) {
        console.error('Error fetching study materials:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaterials();
  }, [userId, maxItems]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-heading">Recent Activity</h2>
        <button 
          onClick={() => navigate('/library')}
          className="text-accent hover:text-accent-dark font-medium text-sm"
        >
          View All →
        </button>
      </div>

      {isLoading ? (
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-72 h-32 bg-secondary rounded-lg flex-shrink-0"></div>
          ))}
        </div>
      ) : materials.length === 0 ? (
        <p className="text-text-secondary">No study materials yet</p>
      ) : (
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {materials.map((material) => (
            <div 
              key={material.id} 
              onClick={() => navigate(`/library?material=${material.id}`)}
              className="w-72 bg-white dark:bg-secondary rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex-shrink-0"
            >
              <div className="space-y-2">
                <h3 className="font-medium text-lg truncate">{material.title}</h3>
                <p className="text-sm text-text-secondary line-clamp-2">
                  {material.description}
                </p>
                <p className="text-xs text-text-secondary">
                  {formatDistanceToNow(new Date(material.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
