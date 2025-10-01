import React from 'react';
import { DeathYearQuestionData, QuizAnswer } from '../../types';
import { SingleChoiceQuestion } from './SingleChoiceQuestion';

interface DeathYearQuestionProps {
  data: DeathYearQuestionData;
  onAnswer: (answer: string) => void;
  showFeedback?: boolean;
  userAnswer?: QuizAnswer | null;
  onNext?: () => void;
  isLastQuestion?: boolean;
  onPersonInfoClick?: (person: any) => void;
}

export const DeathYearQuestion: React.FC<DeathYearQuestionProps> = ({ 
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
    correctAnswer: data.correctDeathYear,
    questionText: `В каком году умер ${data.person.name}?`,
    answerLabel: `${data.correctDeathYear}`
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
