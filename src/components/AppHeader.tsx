import React from 'react'
import { AchievementMarker } from './AchievementMarker'
import { FilterDropdown } from './FilterDropdown'
import { GroupingToggle } from './GroupingToggle'

interface AppHeaderProps {
  isScrolled: boolean
  showControls: boolean
  setShowControls: (show: boolean) => void
  filters: {
    showAchievements: boolean
    hideEmptyCenturies: boolean
    categories: string[]
    countries: string[]
  }
  setFilters: (filters: any) => void
  groupingType: 'category' | 'country' | 'none'
  setGroupingType: (type: 'category' | 'country' | 'none') => void
  allCategories: string[]
  allCountries: string[]
  yearInputs: { start: string; end: string }
  setYearInputs: (inputs: { start: string; end: string } | ((prev: { start: string; end: string }) => { start: string; end: string })) => void
  applyYearFilter: (field: 'start' | 'end', value: string) => void
  handleYearKeyPress: (field: 'start' | 'end', e: React.KeyboardEvent<HTMLInputElement>) => void
  resetAllFilters: () => void
  getCategoryColor: (category: string) => string
  sortedData: any[]
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  isScrolled,
  showControls,
  setShowControls,
  filters,
  setFilters,
  groupingType,
  setGroupingType,
  allCategories,
  allCountries,
  yearInputs,
  setYearInputs,
  applyYearFilter,
  handleYearKeyPress,
  resetAllFilters,
  getCategoryColor,
  sortedData
}) => {
  // Вспомогательная функция для корректной обработки значений годов
  const parseYearValue = (value: string, defaultValue: number): number => {
    const parsed = parseInt(value);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  // Функция для определения пустых веков на основе отфильтрованных данных
  const getEmptyCenturies = () => {
    if (!sortedData || sortedData.length === 0) return new Set();
    
    // Используем отфильтрованные данные для определения диапазона
    const minYear = Math.min(...sortedData.map(p => p.birthYear));
    const maxYear = Math.max(...sortedData.map(p => p.deathYear));
    
    const startCentury = Math.floor(minYear / 100) * 100;
    const endCentury = Math.ceil(maxYear / 100) * 100;
    
    const emptyCenturies = new Set<number>();
    
    for (let centuryStart = startCentury; centuryStart <= endCentury; centuryStart += 100) {
      const centuryEnd = centuryStart + 99;
      const hasDataInCentury = sortedData.some(person => 
        (person.birthYear <= centuryEnd && person.deathYear >= centuryStart)
      );
      
      if (!hasDataInCentury) {
        emptyCenturies.add(centuryStart);
      }
    }
    
    return emptyCenturies;
  };

  return (
    <header 
      className={`app-header ${isScrolled ? 'scrolled' : ''}`}
      style={{
        padding: isScrolled ? '0.5rem 1rem' : '0.75rem 1rem',
        transition: 'all 0.3s ease'
      }}
    >
      <div className="header-row">
        <h1 className="header-title" style={{ 
          fontSize: isScrolled ? '1.5rem' : '1.8rem',
          margin: 0,
          transition: 'font-size 0.3s ease',
          fontWeight: 'bold',
          color: '#f4e4c1',
          flexShrink: 0
        }}>
          Chronoline
        </h1>
        
        {/* Кнопка-шестерёнка только на мобильных */}
        <button
          className="filters-toggle-btn"
          onClick={() => setShowControls(!showControls)}
          style={{
            padding: '0.3rem 0.6rem',
            background: 'rgba(139, 69, 19, 0.1)',
            border: '1px solid rgba(139, 69, 19, 0.3)',
            borderRadius: '4px',
            color: '#f4e4c1',
            fontSize: '0.7rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          title={showControls ? 'Скрыть фильтры' : 'Показать фильтры'}
        >
          ⚙️
        </button>

        {/* Фильтры для больших экранов - в одной строке с заголовком */}
        <div className="header-controls-desktop">
          <div className="header-controls-inner">
            <div className="header-marker-toggle" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: filters.showAchievements ? '#cd853f' : 'rgba(244, 228, 193, 0.2)',
              border: `1px solid ${filters.showAchievements ? 'rgba(205, 133, 63, 0.4)' : 'rgba(244, 228, 193, 0.3)'}`,
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              opacity: filters.showAchievements ? 1 : 0.6
            }}
            onClick={() => setFilters((prev: any) => ({ ...prev, showAchievements: !prev.showAchievements }))}
            title={filters.showAchievements ? 'Скрыть маркеры достижений' : 'Показать маркеры достижений'}
            onMouseEnter={(e) => {
              if (!filters.showAchievements) {
                e.currentTarget.style.background = 'rgba(205, 133, 63, 0.4)';
                e.currentTarget.style.opacity = '0.8';
              }
            }}
            onMouseLeave={(e) => {
              if (!filters.showAchievements) {
                e.currentTarget.style.background = 'rgba(244, 228, 193, 0.2)';
                e.currentTarget.style.opacity = '0.6';
              }
            }}
            >
              <AchievementMarker isActive={filters.showAchievements} />
            </div>
            
            {/* Кнопка "Скрывать века" */}
            <div className="header-century-toggle" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: '40px',
              height: '32px',
              borderRadius: '6px',
              background: filters.hideEmptyCenturies ? '#cd853f' : 'rgba(244, 228, 193, 0.2)',
              border: `1px solid ${filters.hideEmptyCenturies ? 'rgba(205, 133, 63, 0.4)' : 'rgba(244, 228, 193, 0.3)'}`,
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              opacity: filters.hideEmptyCenturies ? 1 : 0.6
            }}
            onClick={() => setFilters((prev: any) => ({ ...prev, hideEmptyCenturies: !prev.hideEmptyCenturies }))}
            title={filters.hideEmptyCenturies ? 'Показать все века' : 'Скрыть пустые века'}
            onMouseEnter={(e) => {
              if (!filters.hideEmptyCenturies) {
                e.currentTarget.style.background = 'rgba(205, 133, 63, 0.4)';
                e.currentTarget.style.opacity = '0.8';
              }
            }}
            onMouseLeave={(e) => {
              if (!filters.hideEmptyCenturies) {
                e.currentTarget.style.background = 'rgba(244, 228, 193, 0.2)';
                e.currentTarget.style.opacity = '0.6';
              }
            }}
            >
              <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                {filters.hideEmptyCenturies ? '<||>' : '>|<'}
              </span>
            </div>
            
            <GroupingToggle 
              groupingType={groupingType}
              onGroupingChange={setGroupingType}
            />
            
            <div className="header-filters-group" style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <FilterDropdown
                title="🎭"
                items={allCategories}
                selectedItems={filters.categories}
                onSelectionChange={(categories) => setFilters((prev: any) => ({ ...prev, categories }))}
                getItemColor={getCategoryColor}
                textLabel="Род деятельности"
              />
              <FilterDropdown
                title="🌍"
                items={allCountries}
                selectedItems={filters.countries}
                onSelectionChange={(countries) => setFilters((prev: any) => ({ ...prev, countries }))}
                textLabel="Страна"
              />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                <div style={{ display: 'flex', gap: '0.2rem', alignItems: 'center' }}>
                  <input
                    type="number"
                    value={yearInputs.start}
                    onChange={(e) => setYearInputs((prev: any) => ({ ...prev, start: e.target.value }))}
                    onBlur={(e) => applyYearFilter('start', e.target.value)}
                    onKeyPress={(e) => handleYearKeyPress('start', e)}
                    placeholder="От"
                    style={{
                      width: '50px',
                      padding: '0.2rem 0.3rem',
                      border: '1px solid rgba(139, 69, 19, 0.3)',
                      borderRadius: '3px',
                      background: 'rgba(44, 24, 16, 0.8)',
                      color: '#f4e4c1',
                      fontSize: '0.6rem',
                      textAlign: 'center',
                      WebkitAppearance: 'none',
                      MozAppearance: 'textfield'
                    }}
                  />
                  <span style={{ fontSize: '0.6rem', color: '#f4e4c1' }}>-</span>
                  <input
                    type="number"
                    value={yearInputs.end}
                    onChange={(e) => setYearInputs((prev: any) => ({ ...prev, end: e.target.value }))}
                    onBlur={(e) => applyYearFilter('end', e.target.value)}
                    onKeyPress={(e) => handleYearKeyPress('end', e)}
                    placeholder="До"
                    style={{
                      width: '50px',
                      padding: '0.2rem 0.3rem',
                      border: '1px solid rgba(139, 69, 19, 0.3)',
                      borderRadius: '3px',
                      background: 'rgba(44, 24, 16, 0.8)',
                      color: '#f4e4c1',
                      fontSize: '0.6rem',
                      textAlign: 'center',
                      WebkitAppearance: 'none',
                      MozAppearance: 'textfield'
                    }}
                  />
                </div>
                
                {/* Визуальное отображение выбранного диапазона */}
                <div style={{ 
                  width: '120px', 
                  height: '4px', 
                  background: 'rgba(244, 228, 193, 0.2)', 
                  borderRadius: '2px', 
                  position: 'relative'
                }}>
                  <div 
                    style={{
                      height: '100%',
                      background: 'linear-gradient(90deg, #cd853f 0%, #daa520 100%)',
                      borderRadius: '2px',
                      position: 'absolute',
                      left: `${Math.max(0, Math.min(100, ((parseYearValue(yearInputs.start, -800) + 800) / 2800 * 100)))}%`,
                      width: `${Math.max(0, Math.min(100, ((parseYearValue(yearInputs.end, 2000) - parseYearValue(yearInputs.start, -800)) / 2800 * 100)))}%`,
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>
              </div>
              
              {(filters.categories.length > 0 || filters.countries.length > 0 || yearInputs.start !== '-800' || yearInputs.end !== '2000') && (
                <button
                  onClick={resetAllFilters}
                  style={{
                    padding: '0.2rem 0.4rem',
                    background: 'rgba(231, 76, 60, 0.2)',
                    border: '1px solid rgba(231, 76, 60, 0.4)',
                    borderRadius: '3px',
                    color: '#e74c3c',
                    fontSize: '0.6rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  title="Сбросить все фильтры"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Фильтры для мобильных - под заголовком */}
      <div className={`header-controls-mobile${showControls ? ' visible' : ''}`}>
        <div className="header-controls-inner">
          {/* Группа кнопок - в одной строке */}
          <div className="header-filters-group" style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="header-marker-toggle" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: filters.showAchievements ? '#cd853f' : 'rgba(244, 228, 193, 0.2)',
              border: `1px solid ${filters.showAchievements ? 'rgba(205, 133, 63, 0.4)' : 'rgba(244, 228, 193, 0.3)'}`,
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              opacity: filters.showAchievements ? 1 : 0.6
            }}
            onClick={() => setFilters((prev: any) => ({ ...prev, showAchievements: !prev.showAchievements }))}
            title={filters.showAchievements ? 'Скрыть маркеры достижений' : 'Показать маркеры достижений'}
            onMouseEnter={(e) => {
              if (!filters.showAchievements) {
                e.currentTarget.style.background = 'rgba(205, 133, 63, 0.4)';
                e.currentTarget.style.opacity = '0.8';
              }
            }}
            onMouseLeave={(e) => {
              if (!filters.showAchievements) {
                e.currentTarget.style.background = 'rgba(244, 228, 193, 0.2)';
                e.currentTarget.style.opacity = '0.6';
              }
            }}
            >
              <AchievementMarker isActive={filters.showAchievements} />
            </div>
            
            {/* Кнопка "Скрывать века" для мобильных */}
            <div className="header-century-toggle" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: '40px',
              height: '32px',
              borderRadius: '6px',
              background: filters.hideEmptyCenturies ? '#cd853f' : 'rgba(244, 228, 193, 0.2)',
              border: `1px solid ${filters.hideEmptyCenturies ? 'rgba(205, 133, 63, 0.4)' : 'rgba(244, 228, 193, 0.3)'}`,
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              opacity: filters.hideEmptyCenturies ? 1 : 0.6
            }}
            onClick={() => setFilters((prev: any) => ({ ...prev, hideEmptyCenturies: !prev.hideEmptyCenturies }))}
            title={filters.hideEmptyCenturies ? 'Показать все века' : 'Скрыть пустые века'}
            onMouseEnter={(e) => {
              if (!filters.hideEmptyCenturies) {
                e.currentTarget.style.background = 'rgba(205, 133, 63, 0.4)';
                e.currentTarget.style.opacity = '0.8';
              }
            }}
            onMouseLeave={(e) => {
              if (!filters.hideEmptyCenturies) {
                e.currentTarget.style.background = 'rgba(244, 228, 193, 0.2)';
                e.currentTarget.style.opacity = '0.6';
              }
            }}
            >
              <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                {filters.hideEmptyCenturies ? '<||>' : '>|<'}
              </span>
            </div>
            
            <GroupingToggle 
              groupingType={groupingType}
              onGroupingChange={setGroupingType}
            />
            
            <FilterDropdown
              title="🎭"
              items={allCategories}
              selectedItems={filters.categories}
              onSelectionChange={(categories) => setFilters((prev: any) => ({ ...prev, categories }))}
              getItemColor={getCategoryColor}
              textLabel="Род деятельности"
            />
            <FilterDropdown
              title="🌍"
              items={allCountries}
              selectedItems={filters.countries}
              onSelectionChange={(countries) => setFilters((prev: any) => ({ ...prev, countries }))}
              textLabel="Страна"
            />
          </div>
          
          {/* Временной промежуток - на отдельной строке */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
            <div style={{ display: 'flex', gap: '0.2rem', alignItems: 'center' }}>
              <input
                type="number"
                value={yearInputs.start}
                onChange={(e) => setYearInputs((prev: any) => ({ ...prev, start: e.target.value }))}
                onBlur={(e) => applyYearFilter('start', e.target.value)}
                onKeyPress={(e) => handleYearKeyPress('start', e)}
                placeholder="От"
                style={{
                  width: '50px',
                  padding: '0.2rem 0.3rem',
                  border: '1px solid rgba(139, 69, 19, 0.3)',
                  borderRadius: '3px',
                  background: 'rgba(44, 24, 16, 0.8)',
                  color: '#f4e4c1',
                  fontSize: '0.6rem',
                  textAlign: 'center',
                  WebkitAppearance: 'none',
                  MozAppearance: 'textfield'
                }}
              />
              <span style={{ fontSize: '0.6rem', color: '#f4e4c1' }}>-</span>
              <input
                type="number"
                value={yearInputs.end}
                onChange={(e) => setYearInputs((prev: any) => ({ ...prev, end: e.target.value }))}
                onBlur={(e) => applyYearFilter('end', e.target.value)}
                onKeyPress={(e) => handleYearKeyPress('end', e)}
                placeholder="До"
                style={{
                  width: '50px',
                  padding: '0.2rem 0.3rem',
                  border: '1px solid rgba(139, 69, 19, 0.3)',
                  borderRadius: '3px',
                  background: 'rgba(44, 24, 16, 0.8)',
                  color: '#f4e4c1',
                  fontSize: '0.6rem',
                  textAlign: 'center',
                  WebkitAppearance: 'none',
                  MozAppearance: 'textfield'
                }}
              />
            </div>
            
            {/* Визуальное отображение выбранного диапазона */}
            <div style={{ 
              width: '120px', 
              height: '4px', 
              background: 'rgba(244, 228, 193, 0.2)', 
              borderRadius: '2px', 
              position: 'relative'
            }}>
              <div 
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #cd853f 0%, #daa520 100%)',
                  borderRadius: '2px',
                  position: 'absolute',
                  left: `${Math.max(0, Math.min(100, ((parseYearValue(yearInputs.start, -800) + 800) / 2800 * 100)))}%`,
                  width: `${Math.max(0, Math.min(100, ((parseYearValue(yearInputs.end, 2000) - parseYearValue(yearInputs.start, -800)) / 2800 * 100)))}%`,
                  transition: 'all 0.3s ease'
                }}
              />
            </div>
          </div>
          
          {/* Кнопка сброса - отдельно */}
          {(filters.categories.length > 0 || filters.countries.length > 0 || yearInputs.start !== '-800' || yearInputs.end !== '2000') && (
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <button
                onClick={resetAllFilters}
                style={{
                  padding: '0.2rem 0.4rem',
                  background: 'rgba(231, 76, 60, 0.2)',
                  border: '1px solid rgba(231, 76, 60, 0.4)',
                  borderRadius: '3px',
                  color: '#e74c3c',
                  fontSize: '0.6rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                title="Сбросить все фильтры"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
} 