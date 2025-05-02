import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { BookOpen, FileText, HelpCircle, Network, ArrowRight, Clock } from 'lucide-react';

// Define activity types
export type ActivityType = 'study' | 'quiz' | 'flashcard' | 'concept-map' | 'exam';

// Define activity item interface
export interface ActivityItem {
  id: string;
  title: string;
  type: ActivityType;
  subject: string;
  tags: string[];
  lastAccessed: Date;
  progress: number;
  path: string;
}

// Mock data generator
export const generateMockActivities = (): ActivityItem[] => {
  const now = new Date();
  
  return [
    {
      id: '1',
      title: 'Physics: Mechanics and Motion',
      type: 'study',
      subject: 'Physics',
      tags: ['Mechanics', 'Chapter 3'],
      lastAccessed: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      progress: 85,
      path: '/study'
    },
    {
      id: '2',
      title: 'Cell Biology Quiz',
      type: 'quiz',
      subject: 'Biology',
      tags: ['Cells', 'Quiz'],
      lastAccessed: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      progress: 60,
      path: '/study'
    },
    {
      id: '3',
      title: 'Organic Chemistry Concepts',
      type: 'concept-map',
      subject: 'Chemistry',
      tags: ['Organic', 'Concepts'],
      lastAccessed: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
      progress: 30,
      path: '/study'
    },
    {
      id: '4',
      title: 'World History Flashcards',
      type: 'flashcard',
      subject: 'History',
      tags: ['World War II', 'Modern'],
      lastAccessed: new Date(now.getTime() - 12 * 60 * 60 * 1000), // 12 hours ago
      progress: 45,
      path: '/study'
    },
    {
      id: '5',
      title: 'Calculus Practice Exam',
      type: 'exam',
      subject: 'Mathematics',
      tags: ['Calculus', 'Exam Prep'],
      lastAccessed: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      progress: 0,
      path: '/exam'
    },
  ];
};

// Helper function to get icon based on activity type
const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case 'study':
      return <BookOpen className="text-leather" size={32} />;
    case 'quiz':
      return <HelpCircle className="text-purple-500" size={32} />;
    case 'flashcard':
      return <FileText className="text-blue-500" size={32} />;
    case 'concept-map':
      return <Network className="text-green-500" size={32} />;
    case 'exam':
      return <FileText className="text-red-500" size={32} />;
    default:
      return <BookOpen className="text-leather" size={32} />;
  }
};

// Helper function to format relative time
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
};

interface RecentActivityProps {
  maxItems?: number;
  showViewAll?: boolean;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ 
  maxItems = 3,
  showViewAll = true 
}) => {
  const navigate = useNavigate();
  const activities = generateMockActivities().slice(0, maxItems);
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-handwriting text-2xl md:text-3xl">Recent Activity</h2>
        {showViewAll && (
          <Button 
            variant="outline"
            rightIcon={<ArrowRight size={16} />}
            onClick={() => navigate('/library')}
            size="sm"
            className="text-sm"
          >
            View All
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {activities.map((activity) => (
          <Card 
            key={activity.id} 
            className="p-4 md:p-6 h-full" 
            interactive 
            onClick={() => navigate(activity.path)}
          >
            <div className="flex items-start h-full">
              <div className="flex-1">
                <h3 className="font-handwriting text-lg md:text-xl mb-2 line-clamp-2">{activity.title}</h3>
                <div className="flex items-center text-sm text-text opacity-70 mb-3">
                  <Clock size={14} className="mr-1" />
                  <span>{formatRelativeTime(activity.lastAccessed)}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 text-xs rounded-full bg-leather bg-opacity-20 text-leather">
                    {activity.subject}
                  </span>
                  {activity.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 text-xs rounded-full bg-leather bg-opacity-20 text-leather">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="w-12 h-12 md:w-16 md:h-16 bg-leather bg-opacity-10 rounded-lg flex items-center justify-center ml-2">
                {getActivityIcon(activity.type)}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-secondary">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full ${activity.progress > 0 ? 'bg-green-500' : 'bg-gray-300'} mr-2`}></div>
                  <span className="text-xs">{activity.progress > 0 ? `${activity.progress}% complete` : 'Not started'}</span>
                </div>
                <Button variant="outline" size="sm" className="text-xs py-1 px-2 h-auto">
                  {activity.progress > 0 ? 'Continue' : 'Start'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
