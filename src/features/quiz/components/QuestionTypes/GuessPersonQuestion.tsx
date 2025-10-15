import React, { useState, useRef, useEffect } from 'react';
import { GuessPersonQuestionData, QuizAnswer, QuizPerson } from '../../types';

interface GuessPersonQuestionProps {
  data: GuessPersonQuestionData;
  onAnswer: (answer: string) => void;
  showFeedback?: boolean;
  userAnswer?: QuizAnswer | null;
  onNext?: () => void;
  isLastQuestion?: boolean;
  onPersonInfoClick?: (person: QuizPerson) => void;
}

export const GuessPersonQuestion: React.FC<GuessPersonQuestionProps> = ({ 
  data, 
  onAnswer, 
  showFeedback = false, 
  userAnswer = null, 
  onNext,
  isLastQuestion = false,
  onPersonInfoClick
}) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [selectedPerson, setSelectedPerson] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Сбрасываем поля при смене вопроса
  useEffect(() => {
    if (!showFeedback) {
      setInputValue('');
      setSelectedPerson('');
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  }, [data.correctPerson.id, showFeedback]);

  // Фильтруем предложения на основе ввода (минимум 3 символа)
  const filteredSuggestions = inputValue.length >= 3
    ? data.availablePersons.filter(person =>
        person.name.toLowerCase().includes(inputValue.toLowerCase())
      )
    : [];

  useEffect(() => {
    // Сброс индекса при изменении списка предложений
    setHighlightedIndex(-1);
  }, [inputValue]);

  useEffect(() => {
    // Обработчик клика вне компонента
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setShowSuggestions(true);
    setSelectedPerson('');
  };

  const handleSuggestionClick = (personId: string, personName: string) => {
    setInputValue(personName);
    setSelectedPerson(personId);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  };

  const handleSubmit = () => {
    if (selectedPerson && !showFeedback) {
      onAnswer(selectedPerson);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showFeedback) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredSuggestions.length) {
        const suggestion = filteredSuggestions[highlightedIndex];
        handleSuggestionClick(suggestion.id, suggestion.name);
      } else if (selectedPerson) {
        handleSubmit();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  };

  const formatCountry = (country: string | string[]): string => {
    if (Array.isArray(country)) {
      return country.join(', ');
    }
    return country;
  };

  const formatYears = (birthYear: number, deathYear?: number | null): string => {
    if (deathYear) {
      return `${birthYear}–${deathYear}`;
    }
    return `${birthYear}–н.в.`;
  };

  return (
    <div className="quiz-question guess-person-question">
      <div className="quiz-question-content">
        {!showFeedback && (
          <div className="guess-person-clues">
            <h3>Угадайте, о ком идёт речь:</h3>
            <div className="clue-item">
              <strong>Годы жизни:</strong> {formatYears(data.correctPerson.birthYear, data.correctPerson.deathYear)}
            </div>
            <div className="clue-item">
              <strong>Род деятельности:</strong> {data.correctPerson.category}
            </div>
            <div className="clue-item">
              <strong>Страна:</strong> {formatCountry(data.correctPerson.country)}
            </div>
            {data.correctPerson.description && (
              <div className="clue-item clue-description">
                <strong>Описание:</strong> {data.correctPerson.description}
              </div>
            )}

            <div className="guess-person-input-container">
              <div className="autocomplete-wrapper">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Начните вводить имя (минимум 3 символа)..."
                  className="guess-person-input"
                  disabled={showFeedback}
                  autoComplete="off"
                />
                {showSuggestions && filteredSuggestions.length > 0 && inputValue.length >= 3 && (
                  <div ref={suggestionsRef} className="autocomplete-suggestions">
                    {filteredSuggestions.map((person, index) => (
                      <div
                        key={person.id}
                        className={`autocomplete-suggestion-item ${
                          index === highlightedIndex ? 'highlighted' : ''
                        }`}
                        onClick={() => handleSuggestionClick(person.id, person.name)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                      >
                        {person.name}
                      </div>
                    ))}
                  </div>
                )}
                {showSuggestions && inputValue.length >= 3 && filteredSuggestions.length === 0 && (
                  <div ref={suggestionsRef} className="autocomplete-suggestions">
                    <div className="autocomplete-no-results">
                      Личность не найдена
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={handleSubmit}
                disabled={!selectedPerson || showFeedback}
                className="guess-person-submit-button"
              >
                Ответить
              </button>
            </div>
          </div>
        )}

        {showFeedback && userAnswer && (
          <div className="question-feedback">
            <div className="quiz-question-person">
              {data.correctPerson.imageUrl && (
                <img 
                  src={data.correctPerson.imageUrl} 
                  alt={data.correctPerson.name}
                  loading="lazy"
                  decoding="async"
                  className="quiz-question-image"
                />
              )}
              <div className="quiz-question-person-info">
                <div className="quiz-question-person-header">
                  <h3>{data.correctPerson.name}</h3>
                  {onPersonInfoClick && (
                    <button
                      className="quiz-person-info-button"
                      onClick={() => onPersonInfoClick(data.correctPerson)}
                      title="Подробная информация"
                      aria-label={`Подробная информация о ${data.correctPerson.name}`}
                    >
                      i
                    </button>
                  )}
                </div>
                {data.correctPerson.description && <p>{data.correctPerson.description}</p>}
                <p className="person-details">
                  {formatYears(data.correctPerson.birthYear, data.correctPerson.deathYear)} • {data.correctPerson.category} • {formatCountry(data.correctPerson.country)}
                </p>
              </div>
            </div>

            <div className={`feedback-status ${userAnswer.isCorrect ? 'correct' : 'incorrect'}`}>
              <div className="feedback-icon">
                {userAnswer.isCorrect ? '✓' : '✗'}
              </div>
              <div className="feedback-text">
                {userAnswer.isCorrect ? 'Правильно!' : 'Неправильно'}
              </div>
            </div>
            
            <div className="feedback-details">
              {!userAnswer.isCorrect && (
                <>
                  <p><strong>Ваш ответ:</strong> {
                    data.availablePersons.find(p => p.id === userAnswer.answer)?.name || 'Не выбрано'
                  }</p>
                  <p><strong>Правильный ответ:</strong> {data.correctPerson.name}</p>
                </>
              )}
              <p><strong>Время:</strong> {Math.round(userAnswer.timeSpent / 1000)}с</p>
            </div>

            {onNext && (
              <div className="feedback-actions">
                <button onClick={onNext} className="feedback-next-button">
                  {isLastQuestion ? 'Завершить игру' : 'Далее'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

