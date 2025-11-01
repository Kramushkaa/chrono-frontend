import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { QuizSetupConfig } from '../types';
import { FilterDropdown } from '../../../shared/ui/FilterDropdown';

interface QuizSetupProps {
  setup: QuizSetupConfig;
  onSetupChange: (setup: QuizSetupConfig) => void;
  allCategories: string[];
  allCountries: string[];
  onStartQuiz: () => void;
  canStart: boolean;
  checkStrictFilters: (setup: QuizSetupConfig, allCategories: string[], allCountries: string[]) => string[];
  isLoading?: boolean;
  onViewHistory?: () => void;
}

const QUESTION_TYPES = [
  { value: 'birthYear', label: 'Угадай год рождения' },
  { value: 'deathYear', label: 'Угадай год смерти' },
  { value: 'profession', label: 'Угадай род деятельности' },
  { value: 'country', label: 'Угадай страну рождения' },
  { value: 'achievementsMatch', label: 'Сопоставь достижения' },
  { value: 'birthOrder', label: 'Расставь по году рождения' },
  { value: 'contemporaries', label: 'Раздели на группы современников' },
  { value: 'guessPerson', label: 'Угадай личность по характеристикам' }
];


const QUESTION_COUNTS = [3, 5, 7, 10, 15, 20];

export const QuizSetup: React.FC<QuizSetupProps> = ({
  setup,
  onSetupChange,
  allCategories,
  allCountries,
  onStartQuiz,
  canStart,
  checkStrictFilters,
  isLoading,
  onViewHistory,
}) => {
  // Локальное состояние для фильтров (стран и категорий)
  const [localCountries, setLocalCountries] = useState(setup.selectedCountries);
  const [localCategories, setLocalCategories] = useState(setup.selectedCategories);
  
  // Синхронизируем локальное состояние с props при изменении
  useEffect(() => {
    setLocalCountries(setup.selectedCountries);
  }, [setup.selectedCountries]);
  
  useEffect(() => {
    setLocalCategories(setup.selectedCategories);
  }, [setup.selectedCategories]);
  
  const handleCountriesChange = useCallback((countries: string[]) => {
    setLocalCountries(countries); // Мгновенно обновляем локальное состояние
    onSetupChange({
      ...setup,
      selectedCountries: countries
    });
  }, [onSetupChange, setup]);

  const handleCategoriesChange = useCallback((categories: string[]) => {
    setLocalCategories(categories); // Мгновенно обновляем локальное состояние
    onSetupChange({
      ...setup,
      selectedCategories: categories
    });
  }, [onSetupChange, setup]);

  const handleQuestionTypesChange = (types: string[]) => {
    onSetupChange({
      ...setup,
      questionTypes: types
    });
  };

  const handleQuestionCountChange = (count: number) => {
    onSetupChange({
      ...setup,
      questionCount: count
    });
  };


  // Локальное состояние для полей ввода временного периода (строки для placeholder)
  const [localTimeRange, setLocalTimeRange] = useState({
    start: setup.timeRange.start === -800 ? '' : String(setup.timeRange.start),
    end: setup.timeRange.end === 2000 ? '' : String(setup.timeRange.end)
  });

  // Синхронизируем локальное состояние с глобальным при изменении setup
  React.useEffect(() => {
    setLocalTimeRange({
      start: setup.timeRange.start === -800 ? '' : String(setup.timeRange.start),
      end: setup.timeRange.end === 2000 ? '' : String(setup.timeRange.end)
    });
  }, [setup.timeRange.start, setup.timeRange.end]);

  // Проверяем строгость фильтров
  const filterWarnings = useMemo(() => {
    // Используем локальное состояние для предупреждений
    const currentSetup = {
      ...setup,
      selectedCountries: localCountries,
      selectedCategories: localCategories
    };
    return checkStrictFilters(currentSetup, allCategories, allCountries);
  }, [checkStrictFilters, setup, localCountries, localCategories, allCategories, allCountries]);

  return (
    <div className="quiz-setup">
      <div className="quiz-setup-header">
        <h2 className="visually-hidden">Настройка игры</h2>
        <p>Выберите параметры для создания персонализированной викторины</p>
      </div>

      <div className="quiz-setup-content">
        <div className="quiz-setup-columns">
          <div className="quiz-setup-col">
            <div className="quiz-setup-filter-group">
            <h3>Фильтры</h3>
            <div className="quiz-setup-filters-row">
              <FilterDropdown
                title="Страны"
                items={allCountries}
                selectedItems={localCountries}
                onSelectionChange={handleCountriesChange}
                icon="🌍"
              />
              <FilterDropdown
                title="Категории"
                items={allCategories}
                selectedItems={localCategories}
                onSelectionChange={handleCategoriesChange}
                icon="📚"
              />
            </div>
            <div className="quiz-setup-time-filter">
              <label className="quiz-time-label" id="quiz-time-range-label">Временной период:</label>
              <div className="quiz-time-inputs">
                <input
                  type="text"
                  inputMode="numeric"
                  value={localTimeRange.start}
                  aria-label="От года"
                  aria-labelledby="quiz-time-range-label"
                  onChange={(e) => {
                    setLocalTimeRange(prev => ({ ...prev, start: e.target.value }));
                  }}
                  onBlur={(e) => {
                    const value = e.target.value.trim() === '' ? -800 : parseInt(e.target.value);
                    if (!isNaN(value) && value !== setup.timeRange.start) {
                      onSetupChange({
                        ...setup,
                        timeRange: { ...setup.timeRange, start: value }
                      });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const value = e.currentTarget.value.trim() === '' ? -800 : parseInt(e.currentTarget.value);
                      if (!isNaN(value) && value !== setup.timeRange.start) {
                        onSetupChange({
                          ...setup,
                          timeRange: { ...setup.timeRange, start: value }
                        });
                      }
                      e.currentTarget.blur();
                    }
                  }}
                  className="quiz-time-input"
                  placeholder="-800"
                />
                <span className="quiz-time-separator">—</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={localTimeRange.end}
                  aria-label="До года"
                  aria-labelledby="quiz-time-range-label"
                  onChange={(e) => {
                    setLocalTimeRange(prev => ({ ...prev, end: e.target.value }));
                  }}
                  onBlur={(e) => {
                    const value = e.target.value.trim() === '' ? 2000 : parseInt(e.target.value);
                    if (!isNaN(value) && value !== setup.timeRange.end) {
                      onSetupChange({
                        ...setup,
                        timeRange: { ...setup.timeRange, end: value }
                      });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const value = e.currentTarget.value.trim() === '' ? 2000 : parseInt(e.currentTarget.value);
                      if (!isNaN(value) && value !== setup.timeRange.end) {
                        onSetupChange({
                          ...setup,
                          timeRange: { ...setup.timeRange, end: value }
                        });
                      }
                      e.currentTarget.blur();
                    }
                  }}
                  className="quiz-time-input"
                  placeholder="2000"
                />
              </div>
              <div className="quiz-time-presets" role="toolbar" aria-label="Выбор временного периода">
                {[
                  { label: 'Античность', start: -800, end: 500 },
                  { label: 'Средневековье', start: 500, end: 1500 },
                  { label: 'Новое время', start: 1500, end: 1900 },
                  { label: 'XX век', start: 1900, end: 2000 },
                  { label: 'Все эпохи', start: -800, end: 2000 }
                ].map(preset => (
                  <button
                    key={preset.label}
                    className={`quiz-time-preset ${setup.timeRange.start === preset.start && setup.timeRange.end === preset.end ? 'active' : ''}`}
                    aria-pressed={setup.timeRange.start === preset.start && setup.timeRange.end === preset.end}
                    onClick={() => {
                      // Для дефолтных значений показываем placeholder
                      setLocalTimeRange({
                        start: preset.start === -800 ? '' : String(preset.start),
                        end: preset.end === 2000 ? '' : String(preset.end)
                      });
                      onSetupChange({
                        ...setup,
                        timeRange: { start: preset.start, end: preset.end }
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                        const container = e.currentTarget.parentElement;
                        if (!container) return;
                        const buttons = Array.from(container.querySelectorAll('button')) as HTMLButtonElement[];
                        const idx = buttons.indexOf(e.currentTarget as HTMLButtonElement);
                        if (idx === -1) return;
                        const nextIdx = e.key === 'ArrowRight' ? (idx + 1) % buttons.length : (idx - 1 + buttons.length) % buttons.length;
                        buttons[nextIdx].focus();
                        e.preventDefault();
                      }
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            </div>
          </div>

          <div className="quiz-setup-col">
            <div className="quiz-setup-filter-group">
              <div className="quiz-setup-questions-row">
                <fieldset className="quiz-setup-question-types">
                  <legend className="quiz-types-label">Типы вопросов:</legend>
                  <div className="quiz-types-controls">
                    <button
                      type="button"
                      className="quiz-types-control-btn"
                      onClick={() => handleQuestionTypesChange(QUESTION_TYPES.map(t => t.value))}
                    >
                      Выбрать все
                    </button>
                    <button
                      type="button"
                      className="quiz-types-control-btn"
                      onClick={() => handleQuestionTypesChange([])}
                    >
                      Снять все
                    </button>
                  </div>
                  <div className="quiz-types-checkboxes">
                    {QUESTION_TYPES.map((questionType) => {
                      const isSelected = setup.questionTypes.includes(questionType.value);
                      return (
                        <label key={questionType.value} className="quiz-type-checkbox-label">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            aria-checked={isSelected}
                            aria-label={questionType.label}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleQuestionTypesChange([...setup.questionTypes, questionType.value]);
                              } else {
                                handleQuestionTypesChange(setup.questionTypes.filter(type => type !== questionType.value));
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                // Переключаем состояние чекбокса
                                if (isSelected) {
                                  handleQuestionTypesChange(setup.questionTypes.filter(type => type !== questionType.value));
                                } else {
                                  handleQuestionTypesChange([...setup.questionTypes, questionType.value]);
                                }
                              }
                            }}
                            className="quiz-type-checkbox"
                          />
                          <span className="quiz-type-checkbox-text">{questionType.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
                <div className="quiz-setup-question-count">
                  <fieldset className="quiz-setup-question-count">
                    <legend className="quiz-count-label">Количество:</legend>
                  <div className="quiz-setup-count-selector">
                    {QUESTION_COUNTS.map(count => (
                      <button
                        key={count}
                        className={`quiz-count-button ${setup.questionCount === count ? 'selected' : ''}`}
                        aria-pressed={setup.questionCount === count}
                        onClick={() => handleQuestionCountChange(count)}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                  </fieldset>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {filterWarnings.length > 0 && (
        <div className="quiz-fallback-warning" role="status" aria-live="polite">
          <div className="quiz-warning-icon">ℹ️</div>
          <div className="quiz-warning-content">
            <div className="quiz-warning-text">
              Выбранные фильтры:
              <ul className="quiz-warning-list">
                {filterWarnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
              Некоторые типы вопросов, вероятно, не смогут сформироваться и будут заменены вопросами с выбором ответа.
            </div>
          </div>
        </div>
      )}

      <div className="quiz-setup-footer">
        <button 
          onClick={onStartQuiz}
          disabled={!canStart || !!isLoading}
          className="quiz-start-button"
        >
          {isLoading ? 'Загрузка…' : 'Начать игру'}
        </button>
        
        <div className="quiz-setup-links">
          {onViewHistory && (
            <button 
              onClick={onViewHistory}
              className="quiz-link-button"
            >
              📊 История игр
            </button>
          )}
        </div>
      </div>
    </div>
  );
};



