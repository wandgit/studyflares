import React from 'react';
import { Star, Trophy, Award } from 'lucide-react';
import Card from './Card';
import useProgressStore from '../../store/useProgressStore';

interface LevelProgressCardProps {
  topicId?: string;
  topicName?: string;
}

const LevelProgressCard: React.FC<LevelProgressCardProps> = ({ topicId, topicName }) => {
  const { userProgress, topics } = useProgressStore();
  const topic = topicId ? topics[topicId] : null;

  const getProgressBarColor = (level: number): string => {
    if (level < 5) return 'bg-blue-500';
    if (level < 10) return 'bg-green-500';
    if (level < 15) return 'bg-purple-500';
    return 'bg-leather';
  };

  const getAchievementIcon = (level: number) => {
    if (level < 5) return <Star className="text-blue-500" size={24} />;
    if (level < 10) return <Award className="text-green-500" size={24} />;
    if (level < 15) return <Trophy className="text-purple-500" size={24} />;
    return <Trophy className="text-leather" size={24} />;
  };

  const progressPercentage = Math.min(
    (userProgress.currentXP / userProgress.xpToNextLevel) * 100,
    100
  );

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold">Level {userProgress.currentLevel}</h3>
          <p className="text-sm text-gray-600">
            {userProgress.currentLevel < 5 ? 'Beginner Scholar' :
             userProgress.currentLevel < 10 ? 'Intermediate Scholar' :
             userProgress.currentLevel < 15 ? 'Advanced Scholar' : 'Master Scholar'}
          </p>
        </div>
        <div className="w-12 h-12 rounded-full bg-leather bg-opacity-10 flex items-center justify-center">
          {getAchievementIcon(userProgress.currentLevel)}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm mb-1">
          <span>{userProgress.currentXP} XP</span>
          <span>{userProgress.xpToNextLevel} XP needed for Level {userProgress.currentLevel + 1}</span>
        </div>
        <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
          <div
            className={`h-full bg-leather transition-all duration-500`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
      {/* Topic-specific stats if a topic is provided */}
      {topic && (
        <div className="border-t border-secondary pt-4 mt-4">
          <h4 className="font-medium mb-3">Topic Stats: {topicName}</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary p-3 rounded-lg">
              <div className="text-sm text-gray-600">Exams Taken</div>
              <div className="text-xl font-bold">{topic.examsTaken || 0}</div>
            </div>
            <div className="bg-secondary p-3 rounded-lg">
              <div className="text-sm text-gray-600">Quizzes Taken</div>
              <div className="text-xl font-bold">{topic.quizzesTaken || 0}</div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default LevelProgressCard;