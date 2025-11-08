import React from 'react';
import { SingleChoiceQuestion } from '../components/QuestionTypes/SingleChoiceQuestion';
import { AchievementsMatchQuestion } from '../components/QuestionTypes/AchievementsMatchQuestion';
import { BirthOrderQuestion } from '../components/QuestionTypes/BirthOrderQuestion';
import { ContemporariesQuestion } from '../components/QuestionTypes/ContemporariesQuestion';
import { GuessPersonQuestion } from '../components/QuestionTypes/GuessPersonQuestion';
import type { QuizQuestion, QuizPerson, QuizAnswer } from '../types';
import type { QuizQuestionWithoutAnswer } from 'shared/dto/quiz-types';
import type {
  SingleChoiceQuestionData,
  AchievementsMatchQuestionData,
  BirthOrderQuestionData,
  ContemporariesQuestionData,
  GuessPersonQuestionData,
} from '../types';

interface RenderQuestionProps {
  question: QuizQuestion | QuizQuestionWithoutAnswer;
  onAnswer: (answer: any) => void;
  showFeedback?: boolean;
  userAnswer?: QuizAnswer | null;
  onNext?: () => void;
  isLastQuestion?: boolean;
  onPersonInfoClick?: (person: QuizPerson) => void;
}

/**
 * Утилита для рендеринга вопросов по типу
 * Устраняет дублирование switch-блоков в QuizPage и SharedQuizPage
 */
export const renderQuestionByType = ({
  question,
  onAnswer,
  showFeedback = false,
  userAnswer,
  onNext,
  isLastQuestion = false,
  onPersonInfoClick,
}: RenderQuestionProps): JSX.Element | null => {
  switch (question.type) {
    case 'birthYear':
    case 'deathYear':
    case 'profession':
    case 'country':
      return (
        <SingleChoiceQuestion
          data={question.data as SingleChoiceQuestionData}
          onAnswer={onAnswer}
          showFeedback={showFeedback}
          userAnswer={userAnswer}
          onNext={onNext}
          isLastQuestion={isLastQuestion}
          onPersonInfoClick={onPersonInfoClick}
          questionType={question.type}
        />
      );

    case 'guessPerson':
      return (
        <GuessPersonQuestion
          data={question.data as GuessPersonQuestionData}
          onAnswer={onAnswer}
          showFeedback={showFeedback}
          userAnswer={userAnswer}
          onNext={onNext}
          isLastQuestion={isLastQuestion}
          onPersonInfoClick={onPersonInfoClick}
        />
      );

    case 'achievementsMatch':
      return (
        <AchievementsMatchQuestion
          data={question.data as AchievementsMatchQuestionData}
          onAnswer={onAnswer}
          showFeedback={showFeedback}
          userAnswer={userAnswer}
          onNext={onNext}
          isLastQuestion={isLastQuestion}
          onPersonInfoClick={onPersonInfoClick}
        />
      );

    case 'birthOrder':
      return (
        <BirthOrderQuestion
          data={question.data as BirthOrderQuestionData}
          onAnswer={onAnswer}
          showFeedback={showFeedback}
          userAnswer={userAnswer}
          onNext={onNext}
          isLastQuestion={isLastQuestion}
          onPersonInfoClick={onPersonInfoClick}
        />
      );

    case 'contemporaries':
      return (
        <ContemporariesQuestion
          data={question.data as ContemporariesQuestionData}
          onAnswer={onAnswer}
          showFeedback={showFeedback}
          userAnswer={userAnswer}
          onNext={onNext}
          isLastQuestion={isLastQuestion}
          onPersonInfoClick={onPersonInfoClick}
        />
      );

    default:
      return <div>Неподдерживаемый тип вопроса</div>;
  }
};





