import React from 'react';
import { ProfessionQuestionData, QuizAnswer } from '../../types';
import { SingleChoiceQuestion } from './SingleChoiceQuestion';

interface ProfessionQuestionProps {
  data: ProfessionQuestionData;
  onAnswer: (answer: string) => void;
  showFeedback?: boolean;
  userAnswer?: QuizAnswer | null;
  onNext?: () => void;
  isLastQuestion?: boolean;
  onPersonInfoClick?: (person: any) => void;
}

export const ProfessionQuestion: React.FC<ProfessionQuestionProps> = ({ 
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
    correctAnswer: data.correctProfession,
    questionText: `К какой области деятельности относится ${data.person.name}?`,
    answerLabel: data.correctProfession,
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
