import React, { useState, useEffect } from 'react'
import { FilterPanelProps, FilterOptions } from '../types'
import { Filter, X } from 'lucide-react'
import './FilterPanel.css'

const FilterPanel: React.FC<FilterPanelProps> = ({ data, filters, onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters)

  // Получаем уникальные категории и страны из данных
  const categories = Array.from(new Set(data.map(person => person.category))).sort()
  const countries = Array.from(new Set(data.map(person => person.country))).sort()

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked 
      ? [...localFilters.categories, category]
      : localFilters.categories.filter(c => c !== category)
    
    setLocalFilters(prev => ({
      ...prev,
      categories: newCategories
    }))
  }

  const handleCountryChange = (country: string, checked: boolean) => {
    const newCountries = checked 
      ? [...localFilters.countries, country]
      : localFilters.countries.filter(c => c !== country)
    
    setLocalFilters(prev => ({
      ...prev,
      countries: newCountries
    }))
  }

  const handleTimeRangeChange = (field: 'start' | 'end', value: number) => {
    setLocalFilters(prev => ({
      ...prev,
      timeRange: {
        ...prev.timeRange,
        [field]: value
      }
    }))
  }

  const applyFilters = () => {
    onFilterChange(localFilters)
    setIsOpen(false)
  }

  const clearFilters = () => {
    const clearedFilters: FilterOptions = {
      categories: [],
      countries: [],
      timeRange: { start: -500, end: 2024 }
    }
    setLocalFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  const activeFiltersCount = 
    localFilters.categories.length + 
    localFilters.countries.length + 
    (localFilters.timeRange.start !== -500 || localFilters.timeRange.end !== 2024 ? 1 : 0)

  return (
    <div className="filter-panel">
      <button 
        className="filter-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Filter size={20} />
        <span>Фильтры</span>
        {activeFiltersCount > 0 && (
          <span className="filter-badge">{activeFiltersCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="filter-content">
          <div className="filter-header">
            <h3>Настройки фильтров</h3>
            <button 
              className="close-button"
              onClick={() => setIsOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Фильтр по категориям */}
          <div className="filter-section">
            <h4>Категории</h4>
            <div className="filter-options">
              {categories.map(category => (
                <label key={category} className="filter-option">
                  <input
                    type="checkbox"
                    checked={localFilters.categories.includes(category)}
                    onChange={(e) => handleCategoryChange(category, e.target.checked)}
                  />
                  <span>{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Фильтр по странам */}
          <div className="filter-section">
            <h4>Страны</h4>
            <div className="filter-options">
              {countries.map(country => (
                <label key={country} className="filter-option">
                  <input
                    type="checkbox"
                    checked={localFilters.countries.includes(country)}
                    onChange={(e) => handleCountryChange(country, e.target.checked)}
                  />
                  <span>{country}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Фильтр по временному диапазону */}
          <div className="filter-section">
            <h4>Временной диапазон</h4>
            <div className="time-range-inputs">
              <div className="time-input">
                <label>От:</label>
                <input
                  type="number"
                  value={localFilters.timeRange.start}
                  onChange={(e) => handleTimeRangeChange('start', parseInt(e.target.value) || 0)}
                  min="-3000"
                  max="2024"
                />
              </div>
              <div className="time-input">
                <label>До:</label>
                <input
                  type="number"
                  value={localFilters.timeRange.end}
                  onChange={(e) => handleTimeRangeChange('end', parseInt(e.target.value) || 2024)}
                  min="-3000"
                  max="2024"
                />
              </div>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="filter-actions">
            <button className="btn-secondary" onClick={clearFilters}>
              Очистить
            </button>
            <button className="btn-primary" onClick={applyFilters}>
              Применить
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default FilterPanel 