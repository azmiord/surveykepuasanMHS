// components/NavigationButtons.jsx
import React from 'react';

const NavigationButtons = ({ activeIndex, maxIndex, handleNavigation, disableNext }) => {
  const isLast = activeIndex === maxIndex - 1; // Adjusted for zero-indexing of questions
  const isFirst = activeIndex === 0;
  const isSubmitPage = activeIndex === maxIndex;

  if (isSubmitPage) return null;

  return (
    <div className="flex justify-between mt-8">
      <button
        className="px-6 py-3 bg-gradient-to-r from-gray-300 to-gray-400 text-white rounded-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50"
        onClick={() => handleNavigation('prev')}
        disabled={isFirst}
      >
        Previous
      </button>
      <button
        className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50"
        onClick={() => handleNavigation('next')}
        disabled={disableNext}
      >
        {isLast ? 'Submit' : 'Next'}
      </button>
    </div>
  );
};

export default NavigationButtons;