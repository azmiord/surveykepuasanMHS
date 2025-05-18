import React from 'react';

const CategoryQuestions = ({ category, questions, handleAnswerChange, currentAnswers = {}, categoryIndex }) => {
  // Determine which options to use based on the category index
  // For slides 1,2,3,4,5,6,9 (which maps to indices 0,1,2,3,4,5,8) use "Sesuai" options
  const useSesuaiOptions = [0, 1, 2, 3, 4, 5, 8].includes(categoryIndex);
  
  const options = useSesuaiOptions 
    ? ['Sangat Kurang Sesuai', 'Kurang Sesuai', 'Sesuai', 'Sangat Sesuai']
    : ['Sangat Kurang Baik', 'Kurang Baik', 'Baik', 'Sangat Baik'];

  return (
    <div className="space-y-10 pb-16">
      <h2 className="text-xl md:text-2xl font-semibold text-black text-center mb-6">
        {category}
      </h2>

      {questions.map((question, qIdx) => (
        <div
          key={qIdx}
          className="space-y-4 border border-blue-100 rounded-xl p-4 shadow-sm bg-white"
        >
          {/* Question Text */}
          <h3 className="text-sm sm:text-base font-medium text-gray-800">
            {question}
          </h3>

          {/* Likert Options in row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs sm:text-sm">
            {options.map((option, optIdx) => (
              <label
                key={optIdx}
                className={`flex items-center justify-start gap-2 ${
                  currentAnswers[question] === option 
                    ? 'bg-blue-200 border border-blue-400' 
                    : 'bg-blue-50'
                } px-2 py-2 rounded-lg hover:bg-blue-100 transition-colors`}
              >
                <input
                  type="radio"
                  name={`${category}-${question}`}
                  value={option}
                  checked={currentAnswers[question] === option}
                  onChange={(e) =>
                    handleAnswerChange(category, question, e.target.value)
                  }
                  className="form-radio text-blue-600 focus:ring-blue-500"
                />
                <span className="whitespace-normal">{option}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoryQuestions;