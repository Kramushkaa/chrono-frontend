import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuizData } from '../hooks/useQuizData'
import { useQuiz } from '../hooks/useQuiz'
import { usePersonPanel } from '../hooks/usePersonPanel'
import { QuizSetup } from '../components/QuizSetup'
import { QuizResults } from '../components/QuizResults'
import { QuizProgress } from '../components/QuizProgress'
import { QuizStructuredData } from '../components/QuizStructuredData'
import { QuizPersonPanel } from '../components/QuizPersonPanel'
import { renderQuestionByType } from '../utils/questionRenderer'
import { SEO } from 'shared/ui/SEO'
import { AppHeader } from 'shared/layout/AppHeader'
import { ContactFooter } from 'shared/ui/ContactFooter'
import { getMinimalHeaderProps } from '../utils/headerProps'
import '../styles/quiz.css'

const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedPerson, handlePersonInfoClick, closePersonPanel } = usePersonPanel();

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
    checkStrictFilters,
    ratingPoints,
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

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    return renderQuestionByType({
      question: currentQuestion,
      onAnswer: handleAnswer,
      showFeedback: showAnswer,
      userAnswer: lastAnswer,
      onNext: nextQuestion,
      isLastQuestion: currentQuestionIndex === questions.length - 1,
      onPersonInfoClick: handlePersonInfoClick,
    });
  };

  // Убираем полноэкранный лоадер: страница доступна всегда, индикатор будет на кнопке "Начать"

  if (!isQuizActive && answers.length === 0) {
    return (
      <div className="quiz-page">
        <SEO
          title="Игра на проверку знаний — Хронониндзя"
          description="Проверьте свои знания исторических личностей в увлекательной игре с вопросами разных типов."
        />
        <QuizStructuredData />
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
          onViewLeaderboard={() => navigate('/quiz/leaderboard')}
          onViewHistory={() => navigate('/quiz/history')}
        />
          <ContactFooter />
        </div>
        
        {/* PersonPanel для показа информации о личности */}
        {selectedPerson && (
          <QuizPersonPanel selectedPerson={selectedPerson} onClose={closePersonPanel} />
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
            ratingPoints={ratingPoints}
            questions={questions}
            config={setup}
            onPersonInfoClick={handlePersonInfoClick}
          />
          <ContactFooter />
        </div>
        
        {/* PersonPanel для показа информации о личности */}
        {selectedPerson && (
          <QuizPersonPanel selectedPerson={selectedPerson} onClose={closePersonPanel} />
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
          <QuizPersonPanel selectedPerson={selectedPerson} onClose={closePersonPanel} />
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
          <QuizPersonPanel selectedPerson={selectedPerson} onClose={closePersonPanel} />
        )}
      </div>
    </div>
  );
};

export default QuizPage;
