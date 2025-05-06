import React from 'react';
import { Loader } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-paper z-50">
      <div className="text-center">
        <Loader size={48} className="text-leather animate-spin mb-4" />
        <p className="text-lg font-medium">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
