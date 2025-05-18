import React from 'react';

const ProgressIndicator = ({ activeIndex, total }) => {
  const progressPercent = (activeIndex / total) * 100;

  return (
    <div className="mb-6">
      <div className="text-sm font-medium text-center" style={{ color: '#1d4ed8' }}>
        Pertanyaan {activeIndex} dari {total}
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