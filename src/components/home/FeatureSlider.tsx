import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const features = [
  {
    id: 1,
    description: "Transform your study materials into comprehensive study guides with key concepts, summaries, and detailed explanations - all powered by AI."
  },
  {
    id: 2,
    description: "Master concepts with smart flashcards that adapt to your learning style and help you focus on what matters most."
  },
  {
    id: 3,
    description: "Challenge yourself with dynamic quizzes that provide instant feedback and detailed explanations for every answer."
  },
  {
    id: 4,
    description: "Visualize and connect ideas with interactive concept maps that make complex topics easier to understand."
  },
  {
    id: 5,
    description: "Track your progress with detailed analytics, topic mastery scores, and personalized study recommendations."
  }
];

const FeatureSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % features.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-20 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.p
          key={currentIndex}
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 200 }}
          className="text-base md:text-lg text-text dark:text-white opacity-80 absolute w-full"
        >
          {features[currentIndex].description}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};

export default FeatureSlider;
