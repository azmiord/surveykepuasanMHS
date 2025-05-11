// components/ProgressIndicator.jsx
import React from 'react';

const ProgressIndicator = ({ activeIndex, total }) => {
  const progressPercent = (activeIndex / total) * 100;

  return (
    <div className="mb-6">
      <div className="text-sm font-medium text-blue-700 text-center">
        Pertanyaan {activeIndex} dari {total}
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressIndicator;
