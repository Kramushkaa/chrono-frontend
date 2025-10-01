import React, { useMemo, useState } from 'react';
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
}

const QUESTION_TYPES = [
  { value: 'birthYear', label: 'Угадай год рождения' },
  { value: 'deathYear', label: 'Угадай год смерти' },
  { value: 'profession', label: 'Угадай род деятельности' },
  { value: 'country', label: 'Угадай страну рождения' },
  { value: 'achievementsMatch', label: 'Сопоставь достижения' },
  { value: 'birthOrder', label: 'Расставь по году рождения' },
  { value: 'contemporaries', label: 'Раздели на группы современников' }
];

const QUESTION_TYPE_LABELS: { [key: string]: string } = {
  'birthYear': 'Угадай год рождения',
  'deathYear': 'Угадай год смерти',
  'profession': 'Угадай род деятельности',
  'country': 'Угадай страну рождения',
  'achievementsMatch': 'Сопоставь достижения', 
  'birthOrder': 'Расставь по году рождения',
  'contemporaries': 'Раздели на группы современников'
};

const QUESTION_COUNTS = [3, 5, 7, 10, 15, 20];

export const QuizSetup: React.FC<QuizSetupProps> = ({
  setup,
  onSetupChange,
  allCategories,
  allCountries,
  onStartQuiz,
  canStart,
  checkStrictFilters
}) => {
  const handleCountriesChange = (countries: string[]) => {
    onSetupChange({
      ...setup,
      selectedCountries: countries
    });
  };

  const handleCategoriesChange = (categories: string[]) => {
    onSetupChange({
      ...setup,
      selectedCategories: categories
    });
  };

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

  // Локальное состояние для полей ввода временного периода
  const [localTimeRange, setLocalTimeRange] = useState({
    start: setup.timeRange.start,
    end: setup.timeRange.end
  });

  // Синхронизируем локальное состояние с глобальным при изменении setup
  React.useEffect(() => {
    setLocalTimeRange({
      start: setup.timeRange.start,
      end: setup.timeRange.end
    });
  }, [setup.timeRange.start, setup.timeRange.end]);

  // Проверяем строгость фильтров
  const filterWarnings = useMemo(() => {
    return checkStrictFilters(setup, allCategories, allCountries);
  }, [setup, allCategories, allCountries, checkStrictFilters]);

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
                selectedItems={setup.selectedCountries}
                onSelectionChange={handleCountriesChange}
                icon="🌍"
              />
              <FilterDropdown
                title="Категории"
                items={allCategories}
                selectedItems={setup.selectedCategories}
                onSelectionChange={handleCategoriesChange}
                icon="📚"
              />
            </div>
            <div className="quiz-setup-time-filter">
              <label className="quiz-time-label">Временной период:</label>
              <div className="quiz-time-inputs">
                <input
                  type="number"
                  value={localTimeRange.start}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || -800;
                    setLocalTimeRange(prev => ({ ...prev, start: value }));
                  }}
                  onBlur={(e) => {
                    const value = parseInt(e.target.value) || -800;
                    if (value !== setup.timeRange.start) {
                      onSetupChange({
                        ...setup,
                        timeRange: { ...setup.timeRange, start: value }
                      });
                    }
                  }}
                  className="quiz-time-input"
                  placeholder="От года"
                />
                <span className="quiz-time-separator">—</span>
                <input
                  type="number"
                  value={localTimeRange.end}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 2000;
                    setLocalTimeRange(prev => ({ ...prev, end: value }));
                  }}
                  onBlur={(e) => {
                    const value = parseInt(e.target.value) || 2000;
                    if (value !== setup.timeRange.end) {
                      onSetupChange({
                        ...setup,
                        timeRange: { ...setup.timeRange, end: value }
                      });
                    }
                  }}
                  className="quiz-time-input"
                  placeholder="До года"
                />
              </div>
              <div className="quiz-time-presets">
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
                    onClick={() => {
                      setLocalTimeRange({ start: preset.start, end: preset.end });
                      onSetupChange({
                        ...setup,
                        timeRange: { start: preset.start, end: preset.end }
                      });
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
              <h3>Настройки вопросов</h3>
              <div className="quiz-setup-questions-row">
                <div className="quiz-setup-question-types">
                  <label className="quiz-types-label">Типы вопросов:</label>
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
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleQuestionTypesChange([...setup.questionTypes, questionType.value]);
                              } else {
                                handleQuestionTypesChange(setup.questionTypes.filter(type => type !== questionType.value));
                              }
                            }}
                            className="quiz-type-checkbox"
                          />
                          <span className="quiz-type-checkbox-text">{questionType.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div className="quiz-setup-question-count">
                  <label className="quiz-count-label">Количество:</label>
                  <div className="quiz-setup-count-selector">
                    {QUESTION_COUNTS.map(count => (
                      <button
                        key={count}
                        className={`quiz-count-button ${setup.questionCount === count ? 'selected' : ''}`}
                        onClick={() => handleQuestionCountChange(count)}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {filterWarnings.length > 0 && (
        <div className="quiz-fallback-warning">
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
          disabled={!canStart}
          className="quiz-start-button"
        >
          Начать игру ({setup.questionCount} вопросов)
        </button>
      </div>
    </div>
  );
};
