import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SEO } from 'shared/ui/SEO';
import { AppHeader } from 'shared/layout/AppHeader';
import { ContactFooter } from 'shared/ui/ContactFooter';
import { useSharedQuiz } from '../hooks/useSharedQuiz';
import { AuthPrompt } from '../components/AuthPrompt';
import { SharedQuizLeaderboard } from '../components/SharedQuizLeaderboard';
import { SingleChoiceQuestion } from '../components/QuestionTypes/SingleChoiceQuestion';
import { AchievementsMatchQuestion } from '../components/QuestionTypes/AchievementsMatchQuestion';
import { BirthOrderQuestion } from '../components/QuestionTypes/BirthOrderQuestion';
import { ContemporariesQuestion } from '../components/QuestionTypes/ContemporariesQuestion';
import { getMinimalHeaderProps } from '../utils/headerProps';
import { useAuthUser } from 'shared/context/AuthContext';
import { getPersonById } from 'shared/api/api';
import { getCategoryColor } from 'shared/utils/categoryColors';
import { getGroupColor, getPersonGroup } from 'features/persons/utils/groupingUtils';
import { PersonPanel } from 'features/persons/components/PersonPanel';
import type {
  SingleChoiceQuestionData,
  AchievementsMatchQuestionData,
  BirthOrderQuestionData,
  ContemporariesQuestionData,
  QuizPerson,
} from '../types';
import type { DetailedQuestionResult } from 'shared/dto/quiz-types';
import type { Person } from 'shared/types';
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
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

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

  const handlePersonInfoClick = async (person: QuizPerson) => {
    try {
      const fullPerson = await getPersonById(person.id);
      if (fullPerson) {
        setSelectedPerson(fullPerson);
      } else {
        setSelectedPerson(person as unknown as Person);
      }
    } catch (error) {
      console.error('Ошибка загрузки информации о личности:', error);
      setSelectedPerson(person as unknown as Person);
    }
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}м ${remainingSeconds}с` : `${remainingSeconds}с`;
  };

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
    if (!question || question.type !== 'achievementsMatch') return null;

    const data = question.data as any;
    const userAnswerArray = result.userAnswer as string[];
    const correctAnswerArray = result.correctAnswer as string[];
    
    return (
      <div className="quiz-matching-table">
        <table>
          <thead>
            <tr>
              <th>Личность</th>
              <th>Ваш ответ</th>
              <th>Правильный ответ</th>
            </tr>
          </thead>
          <tbody>
            {data.persons.map((person: any, index: number) => {
              const userAns = userAnswerArray[index] || '—';
              const correctAns = correctAnswerArray[index] || '—';
              const isCorrect = userAns === correctAns;
              
              return (
                <tr key={`${result.questionId}-${person.id}-${index}`} className={isCorrect ? 'match-correct' : 'match-incorrect'}>
                  <td className="person-name">
                    {person.name}
                    <button
                      className="quiz-person-info-button-inline"
                      onClick={() => handlePersonInfoClick(person)}
                      title="Подробная информация"
                      aria-label={`Подробная информация о ${person.name}`}
                    >
                      ℹ️
                    </button>
                  </td>
                  <td className="achievement-text user-answer">{userAns}</td>
                  <td className="achievement-text correct-answer">{correctAns}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderBirthOrderList = (result: DetailedQuestionResult) => {
    if (!quiz) return null;
    
    const question = quiz.questions.find(q => q.id === result.questionId);
    if (!question || question.type !== 'birthOrder') return null;

    const data = question.data as any;
    const userOrder = result.userAnswer as string[];
    const correctOrder = result.correctAnswer as string[];
    
    const getPersonById = (personId: string) => {
      return data.persons.find((p: any) => p.id === personId);
    };

    const renderPersonItem = (personId: string) => {
      const person = getPersonById(personId);
      if (!person) return personId;
      
      return (
        <>
          {person.name} ({person.birthYear})
          <button
            className="quiz-person-info-button-inline"
            onClick={() => handlePersonInfoClick(person)}
            title="Подробная информация"
            aria-label={`Подробная информация о ${person.name}`}
          >
            ℹ️
          </button>
        </>
      );
    };

    return (
      <div className="quiz-order-comparison">
        <div className="quiz-order-column">
          <strong>Ваш порядок:</strong>
          <ol className="quiz-order-list">
            {userOrder.map((personId, idx) => {
              const correctPosition = correctOrder.indexOf(personId);
              const isCorrect = correctPosition === idx;
              return (
                <li key={`user-${personId}-${idx}`} className={isCorrect ? 'order-correct' : 'order-incorrect'}>
                  {renderPersonItem(personId)}
                </li>
              );
            })}
          </ol>
        </div>
        <div className="quiz-order-column">
          <strong>Правильный порядок:</strong>
          <ol className="quiz-order-list correct-order">
            {correctOrder.map((personId, idx) => (
              <li key={`correct-${personId}-${idx}`}>
                {renderPersonItem(personId)}
              </li>
            ))}
          </ol>
        </div>
      </div>
    );
  };

  const renderContemporariesGroups = (result: DetailedQuestionResult) => {
    if (!quiz) return null;
    
    const question = quiz.questions.find(q => q.id === result.questionId);
    if (!question || question.type !== 'contemporaries') return null;

    const data = question.data as any;
    const userGroups = result.userAnswer as string[][];
    const correctGroups = result.correctAnswer as string[][];
    
    const getPersonById = (personId: string) => {
      return data.persons.find((p: any) => p.id === personId);
    };

    const renderPersonItem = (personId: string) => {
      const person = getPersonById(personId);
      if (!person) return personId;
      
      return (
        <>
          {person.name} ({person.birthYear}-{person.deathYear || 'н.в.'})
          <button
            className="quiz-person-info-button-inline"
            onClick={() => handlePersonInfoClick(person)}
            title="Подробная информация"
            aria-label={`Подробная информация о ${person.name}`}
          >
            ℹ️
          </button>
        </>
      );
    };

    return (
      <div className="quiz-groups-comparison">
        <div className="quiz-groups-column">
          <strong>Ваши группы:</strong>
          <div className="quiz-groups-list">
            {userGroups.map((group, groupIdx) => (
              <div key={`user-group-${groupIdx}`} className="quiz-group-box">
                <div className="quiz-group-header">Группа {groupIdx + 1}</div>
                <ul className="quiz-group-members">
                  {group.map((personId, personIdx) => (
                    <li key={`user-${personId}-${personIdx}`}>{renderPersonItem(personId)}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="quiz-groups-column">
          <strong>Правильные группы:</strong>
          <div className="quiz-groups-list">
            {correctGroups.map((group, groupIdx) => (
              <div key={`correct-group-${groupIdx}`} className="quiz-group-box correct-group">
                <div className="quiz-group-header">Группа {groupIdx + 1}</div>
                <ul className="quiz-group-members">
                  {group.map((personId, personIdx) => (
                    <li key={`correct-${personId}-${personIdx}`}>{renderPersonItem(personId)}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const getQuestion = (questionId: string) => {
    if (!quiz) return null;
    return quiz.questions.find(q => q.id === questionId) || null;
  };

  const renderGuessPersonDetails = (result: DetailedQuestionResult) => {
    const question = getQuestion(result.questionId);
    if (!question || question.type !== 'guessPerson') return null;

    const data = question.data as any;
    const correctPerson = data.correctPerson;
    const userPersonId = result.userAnswer as string;
    const userPerson = data.availablePersons?.find((p: any) => p.id === userPersonId);
    const isCorrect = result.isCorrect;

    return (
      <div className="quiz-guess-person-details">
        <div className="quiz-guess-clues">
          <strong>Информация о загадываемой личности:</strong>
          <div className="quiz-clue-list">
            <div className="quiz-clue-item">
              <span className="clue-label">Годы жизни:</span>
              <span className="clue-value">
                {correctPerson.birthYear} — {correctPerson.deathYear || 'н.в.'}
              </span>
            </div>
            <div className="quiz-clue-item">
              <span className="clue-label">Страна:</span>
              <span className="clue-value">
                {Array.isArray(correctPerson.country) 
                  ? correctPerson.country.join(', ') 
                  : correctPerson.country}
              </span>
            </div>
            <div className="quiz-clue-item">
              <span className="clue-label">Род деятельности:</span>
              <span className="clue-value">{correctPerson.category}</span>
            </div>
            {correctPerson.description && (
              <div className="quiz-clue-item">
                <span className="clue-label">Описание:</span>
                <span className="clue-value">{correctPerson.description}</span>
              </div>
            )}
          </div>
        </div>

        <div className="quiz-guess-answers">
          {!isCorrect && userPerson && (
            <p className="quiz-answer-user">
              <strong>Ваш ответ:</strong> {userPerson.name}
              <button
                className="quiz-person-info-button-inline"
                onClick={() => handlePersonInfoClick(userPerson)}
                title="Подробная информация"
                aria-label={`Подробная информация о ${userPerson.name}`}
              >
                ℹ️
              </button>
            </p>
          )}
          
          <p className="quiz-answer-correct">
            <strong>Правильный ответ:</strong> {correctPerson.name}
            <button
              className="quiz-person-info-button-inline"
              onClick={() => handlePersonInfoClick(correctPerson)}
              title="Подробная информация"
              aria-label={`Подробная информация о ${correctPerson.name}`}
            >
              ℹ️
            </button>
          </p>
        </div>
      </div>
    );
  };

  const formatAnswer = (ans: any): string => {
    if (Array.isArray(ans)) {
      if (ans.length === 0) return 'Не дан ответ';
      if (Array.isArray(ans[0])) {
        return ans.map((group: string[], idx: number) => 
          `Группа ${idx + 1}: ${group.join(', ')}`
        ).join(' | ');
      }
      return ans.join(', ');
    }
    return String(ans || 'Не дан ответ');
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
                {(() => {
                  const question = quiz.questions[currentQuestionIndex];

                  switch (question.type) {
                    case 'birthYear':
                    case 'deathYear':
                    case 'profession':
                    case 'country':
                    case 'guessPerson':
                      return (
                        <SingleChoiceQuestion
                          data={question.data as SingleChoiceQuestionData}
                          onAnswer={handleAnswerQuestion}
                          showFeedback={false}
                        />
                      );

                    case 'achievementsMatch':
                      return (
                        <AchievementsMatchQuestion
                          data={question.data as AchievementsMatchQuestionData}
                          onAnswer={handleAnswerQuestion}
                          showFeedback={false}
                        />
                      );

                    case 'birthOrder':
                      return (
                        <BirthOrderQuestion
                          data={question.data as BirthOrderQuestionData}
                          onAnswer={handleAnswerQuestion}
                          showFeedback={false}
                        />
                      );

                    case 'contemporaries':
                      return (
                        <ContemporariesQuestion
                          data={question.data as ContemporariesQuestionData}
                          onAnswer={handleAnswerQuestion}
                          showFeedback={false}
                        />
                      );

                    default:
                      return <div>Неподдерживаемый тип вопроса: {question.type}</div>;
                  }
                })()}
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
        {selectedPerson && (
          <PersonPanel
            selectedPerson={selectedPerson}
            onClose={() => setSelectedPerson(null)}
            getGroupColor={getGroupColor}
            getPersonGroup={(person) => getPersonGroup(person, 'none')}
            getCategoryColor={getCategoryColor}
          />
        )}
      </div>
    );
};

export default SharedQuizPage;

