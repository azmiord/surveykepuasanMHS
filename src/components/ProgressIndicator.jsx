import React from 'react';

const ProgressIndicator = ({ activeIndex, total }) => {
  // Add 1 to activeIndex for display purposes (1-indexed for users)
  const displayIndex = activeIndex + 1;
  const progressPercent = (activeIndex / (total - 1)) * 100;

  return (
    <div className="mb-6">
      <div className="text-sm font-medium text-center" style={{ color: '#1d4ed8' }}>
        Pertanyaan {displayIndex} dari {total}
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%`, backgroundColor: '#FFE600' }}
        />
      </div>
    </div>
  );
};

export default ProgressIndicator;