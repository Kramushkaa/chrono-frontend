import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizData } from '../hooks/useQuizData';
import { useQuiz } from '../hooks/useQuiz';
import { QuizSetup } from '../components/QuizSetup';
import { QuizResults } from '../components/QuizResults';
import { QuizProgress } from '../components/QuizProgress';
import { BirthYearQuestion } from '../components/QuestionTypes/BirthYearQuestion';
import { AchievementsMatchQuestion } from '../components/QuestionTypes/AchievementsMatchQuestion';
import { BirthOrderQuestion } from '../components/QuestionTypes/BirthOrderQuestion';
import { SEO } from 'shared/ui/SEO';
import { AppHeader } from 'shared/layout/AppHeader';
import '../styles/quiz.css';

const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Создаем стабильный объект фильтров
  const filters = useMemo(() => ({
    categories: [],
    countries: [],
    timeRange: { start: -800, end: 2000 },
    showAchievements: true
  }), []);

  const { persons, allCategories, allCountries, isLoading } = useQuizData(filters, true);
  
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
    allCountries: quizCountries
  } = useQuiz(persons, allCategories, allCountries);

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

  const handleAnswer = (answer: string | string[]) => {
    answerQuestion(answer);
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    // Показываем вопрос с встроенной обратной связью
    switch (currentQuestion.type) {
      case 'birthYear':
        return (
          <BirthYearQuestion
            data={currentQuestion.data}
            onAnswer={handleAnswer}
            showFeedback={showAnswer}
            userAnswer={lastAnswer}
            onNext={nextQuestion}
            isLastQuestion={currentQuestionIndex === questions.length - 1}
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
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="quiz-page">
        <SEO
          title="Игра на проверку знаний — Хронониндзя"
          description="Проверьте свои знания исторических личностей в увлекательной игре с вопросами разных типов."
        />
        <AppHeader
          isScrolled={false}
          showControls={false}
          setShowControls={() => {}}
          mode="minimal"
          filters={{ categories: [], countries: [], showAchievements: true, hideEmptyCenturies: false }}
          setFilters={() => {}}
          groupingType="none"
          setGroupingType={() => {}}
          allCategories={[]}
          allCountries={[]}
          yearInputs={{ start: "-800", end: "2000" }}
          setYearInputs={() => {}}
          applyYearFilter={() => {}}
          handleYearKeyPress={() => {}}
          resetAllFilters={() => {}}
          getCategoryColor={() => ""}
          sortedData={[]}
          handleSliderMouseDown={() => {}}
          handleSliderMouseMove={() => {}}
          handleSliderMouseUp={() => {}}
          isDraggingSlider={false}
          onBackToMenu={handleBackToMenu}
          extraRightControls={
            <div style={{
              padding: '0.4rem 0.8rem',
              background: 'rgba(139, 69, 19, 0.2)',
              border: '1px solid rgba(139, 69, 19, 0.4)',
              borderRadius: '6px',
              color: '#f4e4c1',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}>
              Загрузка...
            </div>
          }
        />
        <div className="quiz-loading">
          <div className="spinner"></div>
          <p>Загрузка данных...</p>
        </div>
      </div>
    );
  }

  if (!isQuizActive && answers.length === 0) {
    return (
      <div className="quiz-page">
        <SEO
          title="Игра на проверку знаний — Хронониндзя"
          description="Проверьте свои знания исторических личностей в увлекательной игре с вопросами разных типов."
        />
        <AppHeader
          isScrolled={false}
          showControls={false}
          setShowControls={() => {}}
          mode="minimal"
          filters={{ categories: [], countries: [], showAchievements: true, hideEmptyCenturies: false }}
          setFilters={() => {}}
          groupingType="none"
          setGroupingType={() => {}}
          allCategories={[]}
          allCountries={[]}
          yearInputs={{ start: "-800", end: "2000" }}
          setYearInputs={() => {}}
          applyYearFilter={() => {}}
          handleYearKeyPress={() => {}}
          resetAllFilters={() => {}}
          getCategoryColor={() => ""}
          sortedData={[]}
          handleSliderMouseDown={() => {}}
          handleSliderMouseMove={() => {}}
          handleSliderMouseUp={() => {}}
          isDraggingSlider={false}
          onBackToMenu={handleBackToMenu}
          extraRightControls={null}
        />
        <div className="quiz-content">
          <QuizSetup
            setup={setup}
            onSetupChange={setSetup}
            allCategories={quizCategories}
            allCountries={quizCountries}
            onStartQuiz={startQuiz}
            canStart={canStart}
          />
        </div>
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
          isScrolled={false}
          showControls={false}
          setShowControls={() => {}}
          mode="minimal"
          filters={{ categories: [], countries: [], showAchievements: true, hideEmptyCenturies: false }}
          setFilters={() => {}}
          groupingType="none"
          setGroupingType={() => {}}
          allCategories={[]}
          allCountries={[]}
          yearInputs={{ start: "-800", end: "2000" }}
          setYearInputs={() => {}}
          applyYearFilter={() => {}}
          handleYearKeyPress={() => {}}
          resetAllFilters={() => {}}
          getCategoryColor={() => ""}
          sortedData={[]}
          handleSliderMouseDown={() => {}}
          handleSliderMouseMove={() => {}}
          handleSliderMouseUp={() => {}}
          isDraggingSlider={false}
          onBackToMenu={handleBackToMenu}
          extraRightControls={
            <div style={{
              padding: '0.4rem 0.8rem',
              background: 'rgba(139, 69, 19, 0.2)',
              border: '1px solid rgba(139, 69, 19, 0.4)',
              borderRadius: '6px',
              color: '#f4e4c1',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}>
              Результаты
            </div>
          }
        />
        <div className="quiz-content">
          <QuizResults
            result={getResults()}
            onRestart={handleRestart}
            onBackToMenu={handleBackToMenu}
          />
        </div>
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
          isScrolled={false}
          showControls={false}
          setShowControls={() => {}}
          mode="minimal"
          filters={{ categories: [], countries: [], showAchievements: true, hideEmptyCenturies: false }}
          setFilters={() => {}}
          groupingType="none"
          setGroupingType={() => {}}
          allCategories={[]}
          allCountries={[]}
          yearInputs={{ start: "-800", end: "2000" }}
          setYearInputs={() => {}}
          applyYearFilter={() => {}}
          handleYearKeyPress={() => {}}
          resetAllFilters={() => {}}
          getCategoryColor={() => ""}
          sortedData={[]}
          handleSliderMouseDown={() => {}}
          handleSliderMouseMove={() => {}}
          handleSliderMouseUp={() => {}}
          isDraggingSlider={false}
          onBackToMenu={handleBackToMenu}
          extraRightControls={
            <QuizProgress
              currentQuestion={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              isQuizActive={isQuizActive}
            />
          }
        />
        
        <div className="quiz-content">
          <div className="quiz-question-container">
            {renderQuestion()}
          </div>
        </div>
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
        isScrolled={false}
        showControls={false}
        setShowControls={() => {}}
        mode="minimal"
        filters={{ categories: [], countries: [], showAchievements: true, hideEmptyCenturies: false }}
        setFilters={() => {}}
        groupingType="none"
        setGroupingType={() => {}}
        allCategories={[]}
        allCountries={[]}
        yearInputs={{ start: "-800", end: "2000" }}
        setYearInputs={() => {}}
        applyYearFilter={() => {}}
        handleYearKeyPress={() => {}}
        resetAllFilters={() => {}}
        getCategoryColor={() => ""}
        sortedData={[]}
        handleSliderMouseDown={() => {}}
        handleSliderMouseMove={() => {}}
        handleSliderMouseUp={() => {}}
        isDraggingSlider={false}
        onBackToMenu={handleBackToMenu}
        extraRightControls={
          <div style={{
            padding: '0.4rem 0.8rem',
            background: 'rgba(139, 69, 19, 0.2)',
            border: '1px solid rgba(139, 69, 19, 0.4)',
            borderRadius: '6px',
            color: '#f4e4c1',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            Ошибка
          </div>
        }
      />
      
      <div className="quiz-content">
        <div className="quiz-question-container">
          <p>Произошла ошибка. Пожалуйста, обновите страницу.</p>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
