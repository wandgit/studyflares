import React from 'react';

const GradingLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-xl font-semibold text-gray-800">Grading Exam...</div>
        <div className="text-sm text-gray-600 mt-2">Please wait while the AI evaluates your answers</div>
      </div>
    </div>
  );
};

export default GradingLoader;
