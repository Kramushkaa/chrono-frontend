import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuizData } from '../hooks/useQuizData'
import { useQuiz } from '../hooks/useQuiz'
import { QuizSetup } from '../components/QuizSetup'
import { QuizResults } from '../components/QuizResults'
import { QuizProgress } from '../components/QuizProgress'
import { SingleChoiceQuestion } from '../components/QuestionTypes/SingleChoiceQuestion'
import { AchievementsMatchQuestion } from '../components/QuestionTypes/AchievementsMatchQuestion'
import { BirthOrderQuestion } from '../components/QuestionTypes/BirthOrderQuestion'
import { ContemporariesQuestion } from '../components/QuestionTypes/ContemporariesQuestion'
import { GuessPersonQuestion } from '../components/QuestionTypes/GuessPersonQuestion'
import { SEO } from 'shared/ui/SEO'
import { AppHeader } from 'shared/layout/AppHeader'
import { ContactFooter } from 'shared/ui/ContactFooter'
import { getMinimalHeaderProps } from '../utils/headerProps'
import type { Person } from 'shared/types'
import { getGroupColor, getPersonGroup } from 'features/persons/utils/groupingUtils'
import { getCategoryColor } from 'shared/utils/categoryColors'
import { getPersonById } from 'shared/api/api'
import '../styles/quiz.css'

const PersonPanel = React.lazy(() => import('features/persons/components/PersonPanel').then(m => ({ default: m.PersonPanel })));

const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Состояние для PersonPanel
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  

  // Отдельное состояние для API фильтров с debouncing
  const [apiFilters, setApiFilters] = useState<{
    categories: string[];
    countries: string[];
    timeRange: { start: number; end: number };
    showAchievements: boolean;
  }>({
    categories: [],
    countries: [],
    timeRange: { start: -800, end: 2000 },
    showAchievements: true
  });

  const { persons, allCategories, allCountries, isLoading } = useQuizData(apiFilters, true);
  
  const {
    setup,
    setSetup,
    questions,
    currentQuestionIndex,
    answers,
    isQuizActive,
    filteredPersons,
    startQuiz,
    answerQuestion,
    nextQuestion,
    getResults,
    resetQuiz,
    showAnswer,
    lastAnswer,
    allCategories: quizCategories,
    allCountries: quizCountries,
    checkStrictFilters
  } = useQuiz(persons, allCategories, allCountries);

  // Обновляем API фильтры при изменении настроек квиза с debouncing
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      setApiFilters({
        categories: setup.selectedCategories,
        countries: setup.selectedCountries,
        timeRange: { start: -800, end: 2000 }, // Всегда загружаем все данные по времени
        showAchievements: true
      });
    }, 300); // 300ms debouncing для API фильтров

    return () => clearTimeout(timeoutId);
  }, [setup.selectedCategories, setup.selectedCountries]);


  const currentQuestion = questions[currentQuestionIndex];
  const canStart = filteredPersons.length > 0 && 
    setup.questionTypes.length > 0 && 
    setup.questionCount > 0;

  const handleBackToMenu = () => {
    navigate('/menu');
  };

  const handleRestart = () => {
    resetQuiz();
  };

  const handleAnswer = (answer: string | string[] | string[][]) => {
    answerQuestion(answer);
  };

  const handlePersonInfoClick = async (person: Person) => {
    try {
      // Получаем полную информацию о личности из API
      const fullPerson = await getPersonById(person.id);
      if (fullPerson) {
        setSelectedPerson(fullPerson);
      } else {
        // Fallback на данные из вопроса, если API не вернул данные
        setSelectedPerson(person);
      }
    } catch (error) {
      console.error('Ошибка загрузки информации о личности:', error);
      // Fallback на данные из вопроса
      setSelectedPerson(person);
    }
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    // Показываем вопрос с встроенной обратной связью
    switch (currentQuestion.type) {
      case 'birthYear':
      case 'deathYear':
      case 'profession':
      case 'country':
        // Все простые вопросы с выбором ответа используют SingleChoiceQuestion
        return (
          <SingleChoiceQuestion
            data={currentQuestion.data}
            onAnswer={handleAnswer}
            showFeedback={showAnswer}
            userAnswer={lastAnswer}
            onNext={nextQuestion}
            isLastQuestion={currentQuestionIndex === questions.length - 1}
            onPersonInfoClick={handlePersonInfoClick}
          />
        );
      case 'achievementsMatch':
        return (
          <AchievementsMatchQuestion
            data={currentQuestion.data}
            onAnswer={handleAnswer}
            showFeedback={showAnswer}
            userAnswer={lastAnswer}
            onNext={nextQuestion}
            isLastQuestion={currentQuestionIndex === questions.length - 1}
            onPersonInfoClick={handlePersonInfoClick}
          />
        );
      case 'birthOrder':
        return (
          <BirthOrderQuestion
            data={currentQuestion.data}
            onAnswer={handleAnswer}
            showFeedback={showAnswer}
            userAnswer={lastAnswer}
            onNext={nextQuestion}
            isLastQuestion={currentQuestionIndex === questions.length - 1}
            onPersonInfoClick={handlePersonInfoClick}
          />
        );
      case 'contemporaries':
        return (
          <ContemporariesQuestion
            data={currentQuestion.data}
            onAnswer={handleAnswer}
            showFeedback={showAnswer}
            userAnswer={lastAnswer}
            onNext={nextQuestion}
            isLastQuestion={currentQuestionIndex === questions.length - 1}
            onPersonInfoClick={handlePersonInfoClick}
          />
        );
      case 'guessPerson':
        return (
          <GuessPersonQuestion
            data={currentQuestion.data}
            onAnswer={handleAnswer}
            showFeedback={showAnswer}
            userAnswer={lastAnswer}
            onNext={nextQuestion}
            isLastQuestion={currentQuestionIndex === questions.length - 1}
            onPersonInfoClick={handlePersonInfoClick}
          />
        );
      default:
        return null;
    }
  };

  // Убираем полноэкранный лоадер: страница доступна всегда, индикатор будет на кнопке "Начать"

  if (!isQuizActive && answers.length === 0) {
    return (
      <div className="quiz-page">
        <SEO
          title="Игра на проверку знаний — Хронониндзя"
          description="Проверьте свои знания исторических личностей в увлекательной игре с вопросами разных типов."
        />
        <AppHeader {...getMinimalHeaderProps({ onBackToMenu: handleBackToMenu, extraRightControls: null })} />
        <div className="quiz-content">
        <QuizSetup
          setup={setup}
          onSetupChange={setSetup}
          allCategories={quizCategories}
          allCountries={quizCountries}
          onStartQuiz={startQuiz}
          canStart={canStart}
          checkStrictFilters={checkStrictFilters}
          isLoading={isLoading}
        />
          <ContactFooter />
        </div>
        
        {/* PersonPanel для показа информации о личности */}
        {selectedPerson && (
          <React.Suspense fallback={<div>Загрузка...</div>}>
            <PersonPanel
              selectedPerson={selectedPerson}
              onClose={() => setSelectedPerson(null)}
              getGroupColor={getGroupColor}
              getPersonGroup={(person) => getPersonGroup(person, 'none')}
              getCategoryColor={getCategoryColor}
            />
          </React.Suspense>
        )}
      </div>
    );
  }

  if (!isQuizActive && answers.length > 0) {
    return (
      <div className="quiz-page">
        <SEO
          title="Результаты игры — Хронониндзя"
          description="Посмотрите результаты вашей игры на проверку знаний."
        />
        <AppHeader
          {...getMinimalHeaderProps({
            onBackToMenu: handleBackToMenu,
            extraRightControls: (
              <div
                style={{
                  padding: '0.4rem 0.8rem',
                  background: 'rgba(139, 69, 19, 0.2)',
                  border: '1px solid rgba(139, 69, 19, 0.4)',
                  borderRadius: '6px',
                  color: '#f4e4c1',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                }}
              >
                Результаты
              </div>
            ),
          })}
        />
        <div className="quiz-content">
          <QuizResults
            result={getResults()}
            onRestart={handleRestart}
            onBackToMenu={handleBackToMenu}
          />
          <ContactFooter />
        </div>
        
        {/* PersonPanel для показа информации о личности */}
        {selectedPerson && (
          <React.Suspense fallback={<div>Загрузка...</div>}>
            <PersonPanel
              selectedPerson={selectedPerson}
              onClose={() => setSelectedPerson(null)}
              getGroupColor={getGroupColor}
              getPersonGroup={(person) => getPersonGroup(person, 'none')}
              getCategoryColor={getCategoryColor}
            />
          </React.Suspense>
        )}
      </div>
    );
  }

  // Активная игра
  if (isQuizActive) {
    return (
      <div className="quiz-page">
        <SEO
          title="Игра на проверку знаний — Хронониндзя"
          description="Проверьте свои знания исторических личностей в увлекательной игре с вопросами разных типов."
        />
        <AppHeader
          {...getMinimalHeaderProps({
            onBackToMenu: handleBackToMenu,
            extraRightControls: (
              <QuizProgress
                currentQuestion={currentQuestionIndex + 1}
                totalQuestions={questions.length}
                isQuizActive={isQuizActive}
              />
            ),
          })}
        />
        
        <div className="quiz-content">
          <div className="quiz-question-container">
            {renderQuestion()}
          </div>
          <ContactFooter />
        </div>
        
        {/* PersonPanel для показа информации о личности */}
        {selectedPerson && (
          <React.Suspense fallback={<div>Загрузка...</div>}>
            <PersonPanel
              selectedPerson={selectedPerson}
              onClose={() => setSelectedPerson(null)}
              getGroupColor={getGroupColor}
              getPersonGroup={(person) => getPersonGroup(person, 'none')}
              getCategoryColor={getCategoryColor}
            />
          </React.Suspense>
        )}
      </div>
    );
  }

  // Fallback - не должно происходить
  return (
    <div className="quiz-page">
      <SEO
        title="Игра на проверку знаний — Хронониндзя"
        description="Проверьте свои знания исторических личностей в увлекательной игре с вопросами разных типов."
      />
      <AppHeader
        {...getMinimalHeaderProps({
          onBackToMenu: handleBackToMenu,
          extraRightControls: (
            <div
              style={{
                padding: '0.4rem 0.8rem',
                background: 'rgba(139, 69, 19, 0.2)',
                border: '1px solid rgba(139, 69, 19, 0.4)',
                borderRadius: '6px',
                color: '#f4e4c1',
                fontSize: '0.9rem',
                fontWeight: '600',
              }}
            >
              Ошибка
            </div>
          ),
        })}
      />
      
      <div className="quiz-content">
        <div className="quiz-question-container">
          <p>Произошла ошибка. Пожалуйста, обновите страницу.</p>
        </div>
        
        {/* PersonPanel для показа информации о личности */}
        {selectedPerson && (
          <React.Suspense fallback={<div>Загрузка...</div>}>
            <PersonPanel
              selectedPerson={selectedPerson}
              onClose={() => setSelectedPerson(null)}
              getGroupColor={getGroupColor}
              getPersonGroup={(person) => getPersonGroup(person, 'none')}
              getCategoryColor={getCategoryColor}
            />
          </React.Suspense>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
