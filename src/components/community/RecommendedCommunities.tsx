import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Users } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

// Mock community data by school
const schoolCommunities: Record<string, Array<{ id: string; name: string; members: number; description: string }>> = {
  'Stanford University': [
    { id: 'c1', name: 'Stanford Physics Club', members: 128, description: 'For physics enthusiasts at Stanford' },
    { id: 'c2', name: 'Stanford CS Study Group', members: 245, description: 'Computer Science study group for Stanford students' },
    { id: 'c3', name: 'Stanford Math Wizards', members: 87, description: 'Advanced mathematics discussions and problem solving' },
  ],
  'MIT': [
    { id: 'c4', name: 'MIT Engineering Hub', members: 312, description: 'For all engineering disciplines at MIT' },
    { id: 'c5', name: 'MIT AI Research Group', members: 156, description: 'Discussions on latest AI research and applications' },
    { id: 'c6', name: 'MIT Quantum Computing', members: 78, description: 'Exploring quantum computing concepts and research' },
  ],
  'Harvard University': [
    { id: 'c7', name: 'Harvard Pre-Med Society', members: 203, description: 'For Harvard pre-med students' },
    { id: 'c8', name: 'Harvard Law Study Group', members: 189, description: 'Law students helping each other succeed' },
    { id: 'c9', name: 'Harvard Business Club', members: 267, description: 'Networking and case studies for business students' },
  ],
  'University of California, Berkeley': [
    { id: 'c10', name: 'Berkeley CS Undergrads', members: 342, description: 'Computer Science community at Berkeley' },
    { id: 'c11', name: 'Berkeley Physics Lab', members: 124, description: 'Physics lab discussions and help' },
    { id: 'c12', name: 'Berkeley Environmental Science', members: 156, description: 'For environmental science students at Berkeley' },
  ],
};

// Default communities for schools not in our database
const defaultCommunities = [
  { id: 'd1', name: 'Physics Study Group', members: 523, description: 'General physics discussions and problem solving' },
  { id: 'd2', name: 'Computer Science Hub', members: 789, description: 'Programming, algorithms, and CS theory' },
  { id: 'd3', name: 'Mathematics Community', members: 456, description: 'Math problems, concepts, and study resources' },
  { id: 'd4', name: 'Pre-Med Students', members: 612, description: 'For aspiring medical professionals' },
];

const RecommendedCommunities: React.FC = () => {
  const { currentUser } = useAuthStore();
  
  if (!currentUser) return null;
  
  // Get communities based on user's school
  const userSchool = currentUser.school;
  const recommendations = schoolCommunities[userSchool] || defaultCommunities;
  
  return (
    <Card className="p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-handwriting text-xl">
          {schoolCommunities[userSchool] 
            ? `${userSchool} Communities` 
            : 'Recommended Communities'}
        </h3>
      </div>
      
      <div className="space-y-4">
        {recommendations.slice(0, 3).map((community) => (
          <div 
            key={community.id}
            className="p-4 border border-secondary rounded-lg hover:bg-secondary transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-leather text-white flex items-center justify-center shrink-0">
                <Users size={20} />
              </div>
              
              <div className="flex-1">
                <h4 className="font-medium">{community.name}</h4>
                <p className="text-sm text-text opacity-70 mb-2">
                  {community.members} members
                </p>
                <p className="text-sm mb-3">{community.description}</p>
                <Button size="sm">Join Community</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <Button 
        variant="outline" 
        className="w-full mt-4"
      >
        View All Communities
      </Button>
    </Card>
  );
};

export default RecommendedCommunities;
