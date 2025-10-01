import React from 'react';
import { CountryQuestionData, QuizAnswer } from '../../types';
import { SingleChoiceQuestion } from './SingleChoiceQuestion';
import { Person } from 'shared/types';

interface CountryQuestionProps {
  data: CountryQuestionData;
  onAnswer: (answer: string) => void;
  showFeedback?: boolean;
  userAnswer?: QuizAnswer | null;
  onNext?: () => void;
  isLastQuestion?: boolean;
  onPersonInfoClick?: (person: Person) => void;
}

export const CountryQuestion: React.FC<CountryQuestionProps> = ({ 
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
    correctAnswer: data.correctCountry,
    questionText: `В какой стране родился ${data.person.name}?`,
    answerLabel: data.correctCountry,
    // Скрываем описание до показа фидбека
    person: {
      ...data.person,
      description: showFeedback ? data.person.description : ''
    }
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
