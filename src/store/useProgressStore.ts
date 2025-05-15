import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TopicProgress {
  id: string;
  name: string;
  masteryLevel: number; // 0-100
  quizzesTaken: number;
  correctAnswers: number;
  totalQuestions: number;
  lastStudied: Date;
  examsTaken: number;
  examScores: number[];
  averageExamScore: number;
  lastExamDate: Date | null;
}

export interface StudySession {
  id: string;
  startTime: Date;
  duration: number; // in minutes
  topic: string;
  completed: boolean;
  focusModeEnabled: boolean;
  interruptions: number;
}

export interface UserProgress {
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  totalStudyTime: number; // in minutes
  totalExamsTaken: number;
  averageExamScore: number;
}

interface ProgressState {
  topics: Record<string, TopicProgress>;
  studySessions: StudySession[];
  userProgress: UserProgress;
  activeSession: StudySession | null;
  userLevel: {
    currentLevel: number;
    currentXP: number;
    xpToNextLevel: number;
  };
  
  updateTopicProgress: (topicId: string, progress: Partial<TopicProgress>) => void;
  calculateMasteryLevel: (topicId: string) => number;
  
  startStudySession: (topic: string, duration: number, focusMode: boolean) => void;
  endStudySession: (completed: boolean) => void;
  recordInterruption: () => void;
  
  addExperiencePoints: (points: number) => void;
  checkLevelUp: () => boolean;
  recordExamResult: (topicId: string, topicName: string, score: number) => void;
}

const calculateXPForLevel = (level: number): number => Math.floor(100 * Math.pow(1.5, level - 1));

const useProgressStore = create<ProgressState>()(persist<ProgressState>(
    (set, get) => ({
      topics: {},
      studySessions: [],
      userProgress: {
        currentLevel: 1,
        currentXP: 0,
        xpToNextLevel: calculateXPForLevel(1),
        totalStudyTime: 0,
        totalExamsTaken: 0,
        averageExamScore: 0,
      },
      userLevel: {
        currentLevel: 1,
        currentXP: 0,
        xpToNextLevel: calculateXPForLevel(1),
      },
      activeSession: null,

      updateTopicProgress: (topicId, progress) => {
        set((state) => ({
          topics: {
            ...state.topics,
            [topicId]: {
              ...state.topics[topicId],
              ...progress,
              lastStudied: new Date(),
            },
          },
        }));
      },

      calculateMasteryLevel: (topicId) => {
        const topic = get().topics[topicId];
        if (!topic) return 0;

        const quizAccuracy = topic.totalQuestions > 0 ? 
          (topic.correctAnswers / topic.totalQuestions) : 0;
        const quizWeight = Math.min(topic.quizzesTaken / 5, 1); // Max weight after 5 quizzes
        const quizComponent = quizAccuracy * 40 * quizWeight;
        
        let examComponent = 0;
        if (topic.examsTaken > 0) {
          examComponent = (topic.averageExamScore / 100) * 60;
        }
        
        const totalScore = topic.examsTaken > 0 ? 
          quizComponent + examComponent : 
          quizComponent * (100/40); // Scale quiz component to 100% if no exams
          
        // Cap at 100 and floor the value
        const masteryScore = Math.floor(totalScore);
        
        // If score is already at Expert level (80+), cap at 100
        if (masteryScore >= 80) {
          // Consider mastery complete at 80+
          return Math.min(masteryScore, 100);
        }
          
        return masteryScore;
      },

      startStudySession: (topic, duration, focusMode) => {
        const session: StudySession = {
          id: `session-${Date.now()}`,
          startTime: new Date(),
          duration,
          topic,
          completed: false,
          focusModeEnabled: focusMode,
          interruptions: 0,
        };
        set({ activeSession: session });
      },

      endStudySession: (completed) => {
        const { activeSession, studySessions } = get();
        if (!activeSession) return;

        const endedSession = {
          ...activeSession,
          completed,
        };

        set({
          studySessions: [...studySessions, endedSession],
          activeSession: null,
        });

        if (completed) {
          const baseXP = 50;
          const focusBonus = activeSession.focusModeEnabled ? 20 : 0;
          const interruptionPenalty = Math.max(0, 30 - activeSession.interruptions * 5);
          get().addExperiencePoints(baseXP + focusBonus + interruptionPenalty);
        }
      },

      recordInterruption: () => {
        set((state) => ({
          activeSession: state.activeSession
            ? {
                ...state.activeSession,
                interruptions: state.activeSession.interruptions + 1,
              }
            : null,
        }));
      },

      addExperiencePoints: (points) => {
        set((state) => {
          const currentLevel = state.userProgress.currentLevel;
          const currentXP = state.userProgress.currentXP + points;
          const xpToNextLevel = state.userProgress.xpToNextLevel;
          
          // Check if we've leveled up
          if (currentXP >= xpToNextLevel) {
            const newLevel = currentLevel + 1;
            return {
              userProgress: {
                ...state.userProgress,
                currentLevel: newLevel,
                currentXP: currentXP - xpToNextLevel,
                xpToNextLevel: calculateXPForLevel(newLevel),
              },
              userLevel: {
                currentLevel: newLevel,
                currentXP: currentXP - xpToNextLevel,
                xpToNextLevel: calculateXPForLevel(newLevel),
              }
            };
          }
          
          // No level up, just update XP
          return {
            userProgress: {
              ...state.userProgress,
              currentXP,
            },
            userLevel: {
              ...state.userLevel,
              currentXP,
            }
          };
        });
      },

      checkLevelUp: () => {
        const progress = get().userProgress;
        return progress.currentXP >= progress.xpToNextLevel;
      },

      recordExamResult: (topicId, topicName, score) => {
        set((state) => {
          // Get or initialize topic progress
          const existingTopic = state.topics[topicId] || {
            id: topicId,
            name: topicName,
            masteryLevel: 0,
            quizzesTaken: 0,
            correctAnswers: 0,
            totalQuestions: 0,
            lastStudied: new Date(),
            examsTaken: 0,
            examScores: [],
            averageExamScore: 0,
            lastExamDate: null,
          };

          // Update exam-related fields
          const newExamScores = [...existingTopic.examScores, score];
          const averageScore = newExamScores.reduce((a, b) => a + b, 0) / newExamScores.length;

          const updatedTopic = {
            ...existingTopic,
            examsTaken: existingTopic.examsTaken + 1,
            examScores: newExamScores,
            averageExamScore: Math.round(averageScore),
            lastExamDate: new Date(),
          };

          // Update user progress
          const totalExams = state.userProgress.totalExamsTaken + 1;
          const newAverageScore = (
            (state.userProgress.averageExamScore * state.userProgress.totalExamsTaken + score) / totalExams
          );

          // Add experience points based on score
          const xpGained = Math.round(score / 2); // Half of score percentage as XP

          return {
            topics: {
              ...state.topics,
              [topicId]: updatedTopic,
            },
            userProgress: {
              ...state.userProgress,
              totalExamsTaken: totalExams,
              averageExamScore: Math.round(newAverageScore),
              currentXP: state.userProgress.currentXP + xpGained,
            },
          };
        });
      }
    }),
    {
      name: 'progress-store',
    }
  )
);

export default useProgressStore;