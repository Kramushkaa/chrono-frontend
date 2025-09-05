import React from 'react';
import { QuizSetupConfig } from '../types';

interface QuizSetupProps {
  setup: QuizSetupConfig;
  onSetupChange: (setup: QuizSetupConfig) => void;
  allCategories: string[];
  allCountries: string[];
  onStartQuiz: () => void;
  canStart: boolean;
}

export const QuizSetup: React.FC<QuizSetupProps> = ({
  setup,
  onSetupChange,
  allCategories,
  allCountries,
  onStartQuiz,
  canStart
}) => {
  const handleCountryToggle = (country: string) => {
    const newCountries = setup.selectedCountries.includes(country)
      ? setup.selectedCountries.filter(c => c !== country)
      : [...setup.selectedCountries, country];
    
    onSetupChange({
      ...setup,
      selectedCountries: newCountries
    });
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = setup.selectedCategories.includes(category)
      ? setup.selectedCategories.filter(c => c !== category)
      : [...setup.selectedCategories, category];
    
    onSetupChange({
      ...setup,
      selectedCategories: newCategories
    });
  };

  const selectAllCountries = () => {
    onSetupChange({
      ...setup,
      selectedCountries: allCountries
    });
  };

  const selectAllCategories = () => {
    onSetupChange({
      ...setup,
      selectedCategories: allCategories
    });
  };

  const clearAllCountries = () => {
    onSetupChange({
      ...setup,
      selectedCountries: []
    });
  };

  const clearAllCategories = () => {
    onSetupChange({
      ...setup,
      selectedCategories: []
    });
  };

  return (
    <div className="quiz-setup">
      <div className="quiz-setup-header">
        <h2>Настройка игры</h2>
        <p>Выберите страны и категории для вопросов</p>
      </div>

      <div className="quiz-setup-content">
        <div className="quiz-setup-section">
          <div className="quiz-setup-section-header">
            <h3>Страны</h3>
            <div className="quiz-setup-controls">
              <button 
                type="button" 
                onClick={selectAllCountries}
                className="quiz-setup-button"
              >
                Все
              </button>
              <button 
                type="button" 
                onClick={clearAllCountries}
                className="quiz-setup-button"
              >
                Очистить
              </button>
            </div>
          </div>
          <div className="quiz-setup-options">
            {allCountries.map(country => (
              <label key={country} className="quiz-setup-option">
                <input
                  type="checkbox"
                  checked={setup.selectedCountries.includes(country)}
                  onChange={() => handleCountryToggle(country)}
                />
                <span>{country}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="quiz-setup-section">
          <div className="quiz-setup-section-header">
            <h3>Категории</h3>
            <div className="quiz-setup-controls">
              <button 
                type="button" 
                onClick={selectAllCategories}
                className="quiz-setup-button"
              >
                Все
              </button>
              <button 
                type="button" 
                onClick={clearAllCategories}
                className="quiz-setup-button"
              >
                Очистить
              </button>
            </div>
          </div>
          <div className="quiz-setup-options">
            {allCategories.map(category => (
              <label key={category} className="quiz-setup-option">
                <input
                  type="checkbox"
                  checked={setup.selectedCategories.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                />
                <span>{category}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="quiz-setup-footer">
        <button 
          onClick={onStartQuiz}
          disabled={!canStart}
          className="quiz-start-button"
        >
          Начать игру
        </button>
      </div>
    </div>
  );
};
