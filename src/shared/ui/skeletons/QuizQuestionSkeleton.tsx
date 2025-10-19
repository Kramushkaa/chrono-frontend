import React from 'react';
import Skeleton from '../Skeleton';
import './QuizQuestionSkeleton.css';

const QuizQuestionSkeleton: React.FC = () => {
  return (
    <div className="quiz-question-skeleton">
      {/* Question header */}
      <div className="quiz-question-skeleton__header">
        <Skeleton variant="text" height="24px" width="100%" />
        <Skeleton variant="text" height="18px" width="80%" />
      </div>

      {/* Question content */}
      <div className="quiz-question-skeleton__content">
        {/* Question text */}
        <div className="quiz-question-skeleton__question">
          <Skeleton variant="text" lines={3} />
        </div>

        {/* Options */}
        <div className="quiz-question-skeleton__options">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="quiz-question-skeleton__option">
              <Skeleton variant="rectangle" height="48px" />
            </div>
          ))}
        </div>

        {/* Additional content (person info, images, etc.) */}
        <div className="quiz-question-skeleton__additional">
          <Skeleton variant="circle" height="80px" width="80px" />
          <div className="quiz-question-skeleton__additional-text">
            <Skeleton variant="text" lines={2} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizQuestionSkeleton;
