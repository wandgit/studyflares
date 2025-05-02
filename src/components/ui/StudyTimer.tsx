import React, { useState, useEffect } from 'react';
import { Timer, ChevronUp, ChevronDown } from 'lucide-react';
import Button from './Button';
import useProgressStore from '../../store/useProgressStore';

interface StudyTimerProps {
  topic?: string;
  onSessionEnd?: () => void;
  onComplete?: () => void;
  defaultMinutes?: number;
}

const StudyTimer: React.FC<StudyTimerProps> = ({ 
  topic = 'General', 
  onSessionEnd, 
  onComplete,
  defaultMinutes = 25 
}) => {
  const [minutes, setMinutes] = useState<number>(defaultMinutes);
  const [timeLeft, setTimeLeft] = useState<number>(minutes * 60); // Convert minutes to seconds
  const [isRunning, setIsRunning] = useState(false);
  const { startStudySession, endStudySession } = useProgressStore();

  // Update timeLeft when minutes change
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(minutes * 60);
    }
  }, [minutes, isRunning]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionEnd();
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
    startStudySession(topic, minutes, false);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(minutes * 60);
  };

  const increaseMinutes = () => {
    if (!isRunning && minutes < 60) {
      setMinutes(prev => prev + 5);
    }
  };

  const decreaseMinutes = () => {
    if (!isRunning && minutes > 5) {
      setMinutes(prev => prev - 5);
    }
  };

  const handleSessionEnd = () => {
    setIsRunning(false);
    endStudySession(true);
    if (onSessionEnd) onSessionEnd();
    if (onComplete) onComplete();
    
    // Play sound notification
    const audio = new Audio('/notification.mp3');
    audio.play();
  };

  return (
    <div className="flex flex-col space-y-2 bg-secondary rounded-lg px-3 py-2">
      <div className="flex items-center space-x-3">
        <Timer size={18} className="text-primary" />
        <div className="text-lg font-medium">{formatTime(timeLeft)}</div>
        
        {!isRunning && (
          <div className="flex flex-col">
            <button 
              onClick={increaseMinutes}
              className="text-primary hover:text-primary-dark focus:outline-none"
              aria-label="Increase time"
            >
              <ChevronUp size={16} />
            </button>
            <button 
              onClick={decreaseMinutes}
              className="text-primary hover:text-primary-dark focus:outline-none"
              aria-label="Decrease time"
            >
              <ChevronDown size={16} />
            </button>
          </div>
        )}
        
        <div className="flex space-x-1">
          {!isRunning ? (
            <Button 
              onClick={handleStart} 
              className="bg-green-500 hover:bg-green-600 px-2 py-1 text-xs h-auto"
            >
              Start
            </Button>
          ) : (
            <Button 
              onClick={handlePause} 
              className="bg-yellow-500 hover:bg-yellow-600 px-2 py-1 text-xs h-auto"
            >
              Pause
            </Button>
          )}
          <Button 
            onClick={handleReset} 
            className="bg-red-500 hover:bg-red-600 px-2 py-1 text-xs h-auto"
          >
            Reset
          </Button>
        </div>
      </div>
      {!isRunning && (
        <div className="text-xs text-center text-text opacity-70">
          Study time: {minutes} minutes
        </div>
      )}
    </div>
  );
};

export default StudyTimer;