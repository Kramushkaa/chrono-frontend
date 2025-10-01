import React from 'react';
import { BirthYearQuestionData, QuizAnswer } from '../../types';
import { SingleChoiceQuestion } from './SingleChoiceQuestion';

interface BirthYearQuestionProps {
  data: BirthYearQuestionData;
  onAnswer: (answer: string) => void;
  showFeedback?: boolean;
  userAnswer?: QuizAnswer | null;
  onNext?: () => void;
  isLastQuestion?: boolean;
  onPersonInfoClick?: (person: any) => void;
}

export const BirthYearQuestion: React.FC<BirthYearQuestionProps> = ({ 
  data, 
  onAnswer, 
  showFeedback = false, 
  userAnswer = null, 
  onNext,
  isLastQuestion = false,
  onPersonInfoClick
}) => {
  // Преобразуем данные в формат SingleChoiceQuestionData
  const singleChoiceData = {
    ...data,
    correctAnswer: data.correctBirthYear,
    questionText: `В каком году родился ${data.person.name}?`,
    answerLabel: `${data.correctBirthYear}`
  };

  return (
    <SingleChoiceQuestion
      data={singleChoiceData}
      onAnswer={onAnswer}
      showFeedback={showFeedback}
      userAnswer={userAnswer}
      onNext={onNext}
      isLastQuestion={isLastQuestion}
      onPersonInfoClick={onPersonInfoClick}
    />
  );
};
