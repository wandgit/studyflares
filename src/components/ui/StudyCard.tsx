import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from './Card';
import { ArrowRight, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

export interface StudyCardProps {
  question: string;
  answer: string;
  tags?: string[];
  onNext?: () => void;
  onPrevious?: () => void;
  onMarkKnown?: () => void;
  onMarkUnknown?: () => void;
  showAnswer?: boolean;
  onToggleAnswer?: () => void;
  currentIndex?: number;
  totalCards?: number;
}

const StudyCard = ({
  question,
  answer,
  tags = [],
  onNext,
  onPrevious,
  onMarkKnown,
  onMarkUnknown,
  showAnswer = false,
  onToggleAnswer,
  currentIndex,
  totalCards,
}: StudyCardProps) => {
  // Use internal state if no external control is provided
  const [internalShowAnswer, setInternalShowAnswer] = useState(false);
  
  // Determine if we're using controlled or uncontrolled behavior
  const isControlled = onToggleAnswer !== undefined;
  const isFlipped = isControlled ? showAnswer : internalShowAnswer;
  
  const handleFlip = () => {
    if (isControlled) {
      onToggleAnswer();
    } else {
      setInternalShowAnswer(!internalShowAnswer);
    }
  };
  
  return (
    <div className="w-full max-w-lg mx-auto">
      <div 
        className="relative w-full aspect-[3/2] [perspective:1000px]"
        onClick={handleFlip}
      >
        <AnimatePresence initial={false} mode="wait">
          {!isFlipped ? (
            <motion.div
              key="front"
              className="absolute w-full h-full"
              initial={{ rotateY: 180 }}
              animate={{ rotateY: 0 }}
              exit={{ rotateY: 180 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{ 
                backfaceVisibility: 'hidden',
                transformStyle: 'preserve-3d',
                WebkitBackfaceVisibility: 'hidden'
              }}
            >
              <Card className="w-full h-full flex flex-col p-4 justify-center items-center cursor-pointer select-none">
                <div className="absolute top-2 w-full px-2 flex justify-between">
                  <div className="flex gap-1">
                    {tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-2 py-0.5 text-xs rounded-full bg-accent bg-opacity-20 text-accent"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  {currentIndex !== undefined && totalCards !== undefined && (
                    <span className="text-sm text-text opacity-70 font-medium">
                      Card {currentIndex + 1} of {totalCards}
                    </span>
                  )}
                </div>
                
                <div className="flex-1 flex items-center justify-center py-2">
                  <h3 className="font-sans text-2xl text-center">{question}</h3>
                </div>
                
                <p className="text-text dark:text-white opacity-70 text-sm flex items-center">
                  Tap to see answer <ArrowRight size={16} className="ml-1" />
                </p>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="back"
              className="absolute w-full h-full"
              initial={{ rotateY: -180 }}
              animate={{ rotateY: 0 }}
              exit={{ rotateY: -180 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{ 
                backfaceVisibility: 'hidden',
                transformStyle: 'preserve-3d',
                WebkitBackfaceVisibility: 'hidden'
              }}
            >
              <Card className="w-full h-full flex flex-col p-4 justify-between cursor-pointer select-none">
                <div className="absolute top-2 right-2">
                  {currentIndex !== undefined && totalCards !== undefined && (
                    <span className="text-sm text-text dark:text-white opacity-70 font-medium">
                      Card {currentIndex + 1} of {totalCards}
                    </span>
                  )}
                </div>
                
                <div className="flex-1 flex flex-col justify-center items-center py-2">
                  <p className="font-medium text-center">{answer}</p>
                </div>
                
                <p className="text-text dark:text-white opacity-70 text-sm flex items-center justify-center">
                  Tap to see question <RefreshCw size={16} className="ml-1" />
                </p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <button 
          onClick={onPrevious}
          disabled={!onPrevious}
          className="p-2 rounded-full hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous card"
        >
          <ChevronLeft size={24} />
        </button>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={onMarkUnknown}
            disabled={!onMarkUnknown}
          >
            Need to Review
          </Button>
          
          <Button 
            variant="primary" 
            onClick={onMarkKnown}
            disabled={!onMarkKnown}
          >
            I Know This
          </Button>
        </div>
        
        <button 
          onClick={onNext}
          disabled={!onNext}
          className="p-2 rounded-full hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Next card"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default StudyCard;