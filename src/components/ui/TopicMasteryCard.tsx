import React from 'react';
import { Trophy, Star, Award, BookOpen, PenTool, BarChart2 } from 'lucide-react';
import Card from './Card';
import useProgressStore from '../../store/useProgressStore';

interface TopicMasteryCardProps {
  topicId: string;
  topicName: string;
}

const TopicMasteryCard: React.FC<TopicMasteryCardProps> = ({ topicId, topicName }) => {
  const { topics, userLevel, calculateMasteryLevel } = useProgressStore();
  const topic = topics[topicId];
  const masteryLevel = calculateMasteryLevel(topicId);

  const getMasteryLabel = (level: number): string => {
    if (level < 20) return 'Beginner';
    if (level < 40) return 'Novice';
    if (level < 60) return 'Intermediate';
    if (level < 80) return 'Advanced';
    return 'Expert';
  };

  const getMasteryColor = (level: number): string => {
    if (level < 20) return 'bg-gray-200';
    if (level < 40) return 'bg-blue-200';
    if (level < 60) return 'bg-green-200';
    if (level < 80) return 'bg-purple-200';
    return 'bg-yellow-200';
  };

  // Format date for display
  const formatDate = (date: Date | null | undefined): string => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString();
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold">{topicName}</h3>
          <p className="text-sm text-gray-600">{getMasteryLabel(masteryLevel)} Level</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-leather bg-opacity-10 flex items-center justify-center">
            <Trophy
              size={24}
              className={`${masteryLevel >= 80 ? 'text-leather' : 'text-gray-400'}`}
            />
          </div>
          <div className="text-2xl font-bold">{masteryLevel}%</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full h-4 bg-secondary rounded-full overflow-hidden">
          <div
            className={`h-full bg-leather transition-all duration-500`}
            style={{ width: `${masteryLevel}%` }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1 text-gray-500">
          <span>Beginner</span>
          <span>Novice</span>
          <span>Intermediate</span>
          <span>Advanced</span>
          <span>Expert</span>
        </div>
      </div>

      {/* Mastery Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Exam Performance */}
        <div className="bg-secondary p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <PenTool size={18} className="text-leather" />
            <h4 className="font-medium">Exam Performance (60%)</h4>
          </div>
          
          {topic?.examsTaken ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Average Score:</span>
                <span className="font-semibold">{Math.round(topic.averageExamScore)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Exams Taken:</span>
                <span className="font-semibold">{topic.examsTaken}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Last Exam:</span>
                <span className="font-semibold">{formatDate(topic.lastExamDate)}</span>
              </div>
              
              {/* Mini progress bar for exam scores */}
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-leather transition-all duration-500"
                  style={{ width: `${topic.averageExamScore}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="text-sm italic text-gray-500 py-2">
              No exams taken yet. Take an exam to improve your mastery level significantly.
            </div>
          )}
        </div>
        
        {/* Quiz Performance */}
        <div className="bg-secondary p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={18} className="text-leather" />
            <h4 className="font-medium">Quiz Performance (40%)</h4>
          </div>
          
          {topic?.quizzesTaken ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Accuracy:</span>
                <span className="font-semibold">
                  {topic.totalQuestions > 0 ? Math.round((topic.correctAnswers / topic.totalQuestions) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Quizzes Taken:</span>
                <span className="font-semibold">{topic.quizzesTaken}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Questions Answered:</span>
                <span className="font-semibold">{topic.totalQuestions}</span>
              </div>
              
              {/* Mini progress bar for quiz accuracy */}
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{
                    width: `${topic.totalQuestions > 0 ? (topic.correctAnswers / topic.totalQuestions) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="text-sm italic text-gray-500 py-2">
              No quizzes taken yet. Take quizzes to build your foundation.
            </div>
          )}
        </div>
      </div>

      {/* Study History */}
      <div className="border-t border-secondary pt-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 size={18} className="text-leather" />
          <h4 className="font-medium">Study History</h4>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Last Studied</p>
            <p className="font-semibold">{formatDate(topic?.lastStudied)}</p>
          </div>
          <div>
            <p className="text-gray-600">XP Earned</p>
            <p className="font-semibold">{userLevel.currentXP} / {userLevel.xpToNextLevel}</p>
          </div>
        </div>
        
        {/* XP Progress Bar */}
        <div className="mt-2">
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-leather transition-all duration-500"
              style={{
                width: `${(userLevel.currentXP / userLevel.xpToNextLevel) * 100}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span>Level {userLevel.currentLevel}</span>
            <span>Level {userLevel.currentLevel + 1}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TopicMasteryCard;