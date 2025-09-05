import React from 'react';
import { QuizSetupConfig } from '../types';
import { FilterDropdown } from '../../../shared/ui/FilterDropdown';

interface QuizSetupProps {
  setup: QuizSetupConfig;
  onSetupChange: (setup: QuizSetupConfig) => void;
  allCategories: string[];
  allCountries: string[];
  onStartQuiz: () => void;
  canStart: boolean;
}

const QUESTION_TYPES = [
  { value: 'birthYear', label: 'Угадай год рождения' },
  { value: 'achievementsMatch', label: 'Сопоставь достижения' },
  { value: 'birthOrder', label: 'Расставь по году рождения' }
];

const QUESTION_TYPE_LABELS: { [key: string]: string } = {
  'birthYear': 'Угадай год рождения',
  'achievementsMatch': 'Сопоставь достижения', 
  'birthOrder': 'Расставь по году рождения'
};

const QUESTION_COUNTS = [3, 5, 7, 10, 15, 20];

export const QuizSetup: React.FC<QuizSetupProps> = ({
  setup,
  onSetupChange,
  allCategories,
  allCountries,
  onStartQuiz,
  canStart
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

  return (
    <div className="quiz-setup">
      <div className="quiz-setup-header">
        <h2>Настройка игры</h2>
        <p>Выберите параметры для создания персонализированной викторины</p>
      </div>

      <div className="quiz-setup-content">
        <div className="quiz-setup-filters">
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
          </div>

          <div className="quiz-setup-filter-group">
            <h3>Настройки вопросов</h3>
            <div className="quiz-setup-questions-row">
              <div className="quiz-setup-question-types">
                <FilterDropdown
                  title="Типы вопросов"
                  items={QUESTION_TYPES.map(t => t.label)}
                  selectedItems={setup.questionTypes.map(type => QUESTION_TYPE_LABELS[type] || type)}
                  onSelectionChange={(selectedLabels) => {
                    const selectedValues = selectedLabels.map(label => 
                      Object.keys(QUESTION_TYPE_LABELS).find(key => QUESTION_TYPE_LABELS[key] === label) || label
                    );
                    handleQuestionTypesChange(selectedValues);
                  }}
                  icon="❓"
                  textLabel="Типы"
                />
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

        <div className="quiz-setup-summary">
          <h3>Сводка настроек</h3>
          <div className="quiz-summary-item">
            <span className="quiz-summary-label">Страны:</span>
            <span className="quiz-summary-value">
              {setup.selectedCountries.length === 0 ? 'Все' : `${setup.selectedCountries.length} выбрано`}
            </span>
          </div>
          <div className="quiz-summary-item">
            <span className="quiz-summary-label">Категории:</span>
            <span className="quiz-summary-value">
              {setup.selectedCategories.length === 0 ? 'Все' : `${setup.selectedCategories.length} выбрано`}
            </span>
          </div>
          <div className="quiz-summary-item">
            <span className="quiz-summary-label">Типы вопросов:</span>
            <span className="quiz-summary-value">
              {setup.questionTypes.length === 0 ? 'Все' : setup.questionTypes.map(type => QUESTION_TYPE_LABELS[type] || type).join(', ')}
            </span>
          </div>
          <div className="quiz-summary-item">
            <span className="quiz-summary-label">Количество вопросов:</span>
            <span className="quiz-summary-value">{setup.questionCount}</span>
          </div>
        </div>
      </div>

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
