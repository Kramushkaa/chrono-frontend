import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SEO } from 'shared/ui/SEO';
import { AppHeader } from 'shared/layout/AppHeader';
import { ContactFooter } from 'shared/ui/ContactFooter';
import { useSharedQuiz } from '../hooks/useSharedQuiz';
import { usePersonPanel } from '../hooks/usePersonPanel';
import { AuthPrompt } from '../components/AuthPrompt';
import { SharedQuizLeaderboard } from '../components/SharedQuizLeaderboard';
import { QuizPersonPanel } from '../components/QuizPersonPanel';
import { renderQuestionByType } from '../utils/questionRenderer';
import { getMinimalHeaderProps } from '../utils/headerProps';
import { useAuthUser } from 'shared/context/AuthContext';
import { formatTime } from '../utils/formatters';
import {
  renderMatchingTable as renderMatchingTableUtil,
  renderBirthOrderList as renderBirthOrderListUtil,
  renderContemporariesGroups as renderContemporariesGroupsUtil,
  renderGuessPersonDetails as renderGuessPersonDetailsUtil,
  formatAnswer,
} from '../utils/answerRenderers';
import type { DetailedQuestionResult } from 'shared/dto/quiz-types';
import '../styles/quiz.css';

type QuizPhase = 'loading' | 'auth-prompt' | 'ready' | 'playing' | 'finished' | 'leaderboard';

const SharedQuizPage: React.FC = () => {
  const { shareCode } = useParams<{ shareCode: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthUser();
  const {
    quiz,
    loading,
    error,
    loadSharedQuiz,
    startSession,
    checkAnswer,
    finishQuiz,
  } = useSharedQuiz();

  const [phase, setPhase] = useState<QuizPhase>('loading');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Array<{ questionId: string; answer: any; isCorrect: boolean; timeSpent: number }>>([]);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [showInstantFeedback, setShowInstantFeedback] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);
  const [detailedResults, setDetailedResults] = useState<DetailedQuestionResult[]>([]);
  const [expandedAnswers, setExpandedAnswers] = useState<Set<string>>(new Set());
  const { selectedPerson, handlePersonInfoClick, closePersonPanel } = usePersonPanel();

  // Load quiz on mount
  useEffect(() => {
    if (shareCode) {
      loadSharedQuiz(shareCode).then((success) => {
        if (success) {
          // Show auth prompt if user is not logged in
          setPhase(isAuthenticated ? 'ready' : 'auth-prompt');
        }
      });
    }
  }, [shareCode, loadSharedQuiz, isAuthenticated]);

  const handleContinueAsGuest = () => {
    setPhase('ready');
  };

  const handleStartQuiz = async () => {
    if (!shareCode) return;

    const success = await startSession(shareCode);
    if (success) {
      setPhase('playing');
      setCurrentQuestionIndex(0);
      setAnswers([]);
      setQuestionStartTime(Date.now());
    }
  };

  const handleFinishQuiz = useCallback(async () => {
    if (!shareCode) return;

    const result = await finishQuiz(shareCode);
    if (result && result.detailedResults) {
      setDetailedResults(result.detailedResults);
      setPhase('finished');
    }
  }, [shareCode, finishQuiz]);

  const handleAnswerQuestion = useCallback(
    async (answer: string | string[] | string[][]) => {
      if (!shareCode || !quiz || showInstantFeedback) return;

      const timeSpent = Date.now() - questionStartTime;
      const currentQuestion = quiz.questions[currentQuestionIndex];

      const result = await checkAnswer(shareCode, currentQuestion.id, answer, timeSpent);

      if (result) {
        setAnswers((prev) => [...prev, { questionId: currentQuestion.id, answer, isCorrect: result.isCorrect, timeSpent }]);
        setLastAnswerCorrect(result.isCorrect);
        setShowInstantFeedback(true);
        
        // Automatically move to next question after 1.5 seconds
        setTimeout(() => {
          setShowInstantFeedback(false);
          setLastAnswerCorrect(null);
          
          if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            setQuestionStartTime(Date.now());
          } else {
            // Quiz finished, get results
            handleFinishQuiz();
          }
        }, 1500);
      }
    },
    [shareCode, quiz, currentQuestionIndex, questionStartTime, checkAnswer, handleFinishQuiz, showInstantFeedback]
  );

  const handleViewLeaderboard = useCallback(() => {
    setPhase('leaderboard');
  }, []);

  const toggleAnswer = (questionId: string) => {
    setExpandedAnswers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const renderMatchingTable = (result: DetailedQuestionResult) => {
    if (!quiz) return null;
    const question = quiz.questions.find(q => q.id === result.questionId);
    if (!question) return null;
    
    // Create question object with correctAnswer from result
    const questionWithAnswer = { ...question, correctAnswer: result.correctAnswer };
    
    return renderMatchingTableUtil(
      result.questionId,
      questionWithAnswer,
      result.userAnswer,
      handlePersonInfoClick
    );
  };

  const renderBirthOrderList = (result: DetailedQuestionResult) => {
    if (!quiz) return null;
    const question = quiz.questions.find(q => q.id === result.questionId);
    if (!question) return null;
    
    const questionWithAnswer = { ...question, correctAnswer: result.correctAnswer };
    
    return renderBirthOrderListUtil(
      result.questionId,
      questionWithAnswer,
      result.userAnswer,
      handlePersonInfoClick
    );
  };

  const renderContemporariesGroups = (result: DetailedQuestionResult) => {
    if (!quiz) return null;
    const question = quiz.questions.find(q => q.id === result.questionId);
    if (!question) return null;
    
    const questionWithAnswer = { ...question, correctAnswer: result.correctAnswer };
    
    return renderContemporariesGroupsUtil(
      result.questionId,
      questionWithAnswer,
      result.userAnswer,
      handlePersonInfoClick
    );
  };

  const getQuestion = (questionId: string) => {
    if (!quiz) return null;
    return quiz.questions.find(q => q.id === questionId) || null;
  };

  const renderGuessPersonDetails = (result: DetailedQuestionResult) => {
    const question = getQuestion(result.questionId);
    if (!question) return null;
    
    const questionWithAnswer = { ...question, correctAnswer: result.correctAnswer };
    
    return renderGuessPersonDetailsUtil(
      result.questionId,
      questionWithAnswer,
      result.userAnswer,
      handlePersonInfoClick
    );
  };


  if (loading || phase === 'loading') {
    return (
      <div className="quiz-page">
        <SEO
          title="Загрузка квиза | Хронониндзя"
          description="Загрузка квиза..."
        />
        <AppHeader {...getMinimalHeaderProps({ onBackToMenu: () => navigate('/quiz') })} />
        <div className="quiz-content">
          <div className="quiz-loading">Загрузка квиза...</div>
        </div>
        <ContactFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-page">
        <SEO
          title="Ошибка | Хронониндзя"
          description="Ошибка загрузки квиза"
        />
        <AppHeader {...getMinimalHeaderProps({ onBackToMenu: () => navigate('/quiz') })} />
        <div className="quiz-content">
          <div className="quiz-error">
            <h2>Ошибка</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/quiz')} className="quiz-button quiz-button-primary">
              Вернуться к квизам
            </button>
          </div>
        </div>
        <ContactFooter />
      </div>
    );
  }

  if (!quiz) {
    return null;
  }

  return (
    <div className="quiz-page">
      <SEO
        title={`${quiz.title} | Хронониндзя`}
        description={quiz.description || 'Поделенный квиз - проверьте свои знания истории!'}
      />

      <AppHeader {...getMinimalHeaderProps({ onBackToMenu: () => navigate('/quiz') })} />

      <div className="quiz-content">
          {phase === 'auth-prompt' && <AuthPrompt onContinueAsGuest={handleContinueAsGuest} />}

          {phase === 'ready' && (
            <div className="shared-quiz-intro">
              <h1>{quiz.title}</h1>
              {quiz.description && <p className="quiz-description">{quiz.description}</p>}
              <div className="quiz-info">
                <p>
                  <strong>Автор:</strong> {quiz.creatorUsername}
                </p>
                <p>
                  <strong>Вопросов:</strong> {quiz.questions.length}
                </p>
              </div>
              <button onClick={handleStartQuiz} className="quiz-button quiz-button-primary">
                Начать квиз
              </button>
              <button
                onClick={handleViewLeaderboard}
                className="quiz-button quiz-button-secondary"
              >
                Посмотреть лидерборд
              </button>
            </div>
          )}

          {phase === 'playing' && quiz.questions[currentQuestionIndex] && (
            <>
              <div className="shared-quiz-progress">
                <p>Вопрос {currentQuestionIndex + 1} из {quiz.questions.length}</p>
                <p>Правильных ответов: {answers.filter((a) => a.isCorrect).length}</p>
              </div>

              {showInstantFeedback && (
                <div className={`shared-quiz-feedback ${lastAnswerCorrect ? 'correct' : 'incorrect'}`}>
                  {lastAnswerCorrect ? '✓ Правильно!' : '✗ Неправильно'}
                </div>
              )}

              <div className="quiz-question-container">
                {renderQuestionByType({
                  question: quiz.questions[currentQuestionIndex],
                  onAnswer: handleAnswerQuestion,
                  showFeedback: false,
                })}
              </div>
            </>
          )}

          {phase === 'finished' && (
            <div className="quiz-results">
              <h2>Квиз завершен!</h2>
              <div className="quiz-results-stats">
                <div className="quiz-stat">
                  <span className="quiz-stat-label">Правильных ответов:</span>
                  <span className="quiz-stat-value">
                    {answers.filter((a) => a.isCorrect).length} из {quiz.questions.length}
                  </span>
                </div>
                <div className="quiz-stat">
                  <span className="quiz-stat-label">Общее время:</span>
                  <span className="quiz-stat-value">
                    {formatTime(answers.reduce((sum, a) => sum + a.timeSpent, 0))}
                  </span>
                </div>
              </div>

              <div className="quiz-results-actions">
                <button
                  onClick={handleViewLeaderboard}
                  className="quiz-button quiz-button-primary"
                >
                  Посмотреть лидерборд
                </button>
                <button onClick={() => navigate('/quiz')} className="quiz-button quiz-button-secondary">
                  Другие квизы
                </button>
              </div>

              <div className="quiz-results-answers">
                <h3>Детали ответов:</h3>
                <div className="quiz-answers-list">
                  {detailedResults.map((result, index) => {
                    const isExpanded = expandedAnswers.has(result.questionId);

                    return (
                      <div 
                        key={`answer-${index}-${result.questionId}`} 
                        className={`quiz-answer-item ${result.isCorrect ? 'correct' : 'incorrect'} ${isExpanded ? 'expanded' : ''}`}
                      >
                        <div 
                          className="quiz-answer-header"
                          onClick={() => toggleAnswer(result.questionId)}
                          style={{ cursor: 'pointer' }}
                        >
                          <span className="quiz-answer-number">Вопрос {index + 1}</span>
                          <span className="quiz-answer-time">{formatTime(result.timeSpent)}</span>
                          <span className="quiz-answer-status">
                            {result.isCorrect ? '✓ Правильно' : '✗ Неправильно'}
                          </span>
                          <span className="quiz-answer-toggle">{isExpanded ? '▼' : '▶'}</span>
                        </div>
                        
                        {isExpanded && (
                          <div className="quiz-answer-body">
                            <p className="quiz-answer-question">
                              <strong>Вопрос:</strong> {result.question}
                            </p>
                            
                            {(() => {
                              const question = getQuestion(result.questionId);
                              
                              if (question?.type === 'achievementsMatch') {
                                return (
                                  <div className="quiz-answer-section">
                                    {renderMatchingTable(result)}
                                  </div>
                                );
                              }
                              
                              if (question?.type === 'birthOrder') {
                                return (
                                  <div className="quiz-answer-section">
                                    {renderBirthOrderList(result)}
                                  </div>
                                );
                              }
                              
                              if (question?.type === 'contemporaries') {
                                return (
                                  <div className="quiz-answer-section">
                                    {renderContemporariesGroups(result)}
                                  </div>
                                );
                              }
                              
                              if (question?.type === 'guessPerson') {
                                return (
                                  <div className="quiz-answer-section">
                                    {renderGuessPersonDetails(result)}
                                  </div>
                                );
                              }

                              // Простые вопросы (birthYear, deathYear, profession, country)
                              const isSimpleQuestion = question?.type === 'birthYear' || question?.type === 'deathYear' || question?.type === 'profession' || question?.type === 'country';
                              
                              return (
                                <>
                                  {/* Показываем информацию о личности для простых вопросов */}
                                  {isSimpleQuestion && question && (
                                    <p className="quiz-answer-person-info">
                                      <strong>Личность:</strong> {(question.data as any).person?.name}
                                      {(question.data as any).person && (
                                        <button
                                          className="quiz-person-info-button-inline"
                                          onClick={() => handlePersonInfoClick((question.data as any).person)}
                                          title="Подробная информация"
                                          aria-label={`Подробная информация о ${(question.data as any).person.name}`}
                                        >
                                          ℹ️
                                        </button>
                                      )}
                                    </p>
                                  )}
                                  
                                  {!result.isCorrect && (
                                    <p className="quiz-answer-user">
                                      <strong>Ваш ответ:</strong> {formatAnswer(result.userAnswer)}
                                    </p>
                                  )}
                                  
                                  <p className="quiz-answer-correct">
                                    <strong>Правильный ответ:</strong> {formatAnswer(result.correctAnswer)}
                                  </p>
                                </>
                              );
                            })()}
                            
                            {result.explanation && (
                              <p className="quiz-answer-explanation">
                                <strong>Пояснение:</strong> {result.explanation}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {phase === 'leaderboard' && shareCode && (
            <>
              <SharedQuizLeaderboard shareCode={shareCode} />
              <div className="leaderboard-actions">
                <button onClick={() => setPhase('ready')} className="quiz-button quiz-button-primary">
                  Пройти квиз
                </button>
                <button onClick={() => navigate('/quiz')} className="quiz-button quiz-button-secondary">
                  Другие квизы
                </button>
              </div>
            </>
          )}
        </div>
        
        <ContactFooter />
        
        {/* PersonPanel для показа информации о личности */}
        <QuizPersonPanel selectedPerson={selectedPerson} onClose={closePersonPanel} />
      </div>
    );
};

export default SharedQuizPage;

