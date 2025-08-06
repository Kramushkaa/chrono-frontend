import React from 'react'

interface YearRangeSliderProps {
  yearInputs: { start: string; end: string }
  setYearInputs: (inputs: { start: string; end: string } | ((prev: { start: string; end: string }) => { start: string; end: string })) => void
  applyYearFilter: (field: 'start' | 'end', value: string) => void
  handleYearKeyPress: (field: 'start' | 'end', e: React.KeyboardEvent<HTMLInputElement>) => void
  handleSliderMouseDown: (e: React.MouseEvent | React.TouchEvent, handle: 'start' | 'end') => void
  handleSliderMouseMove: (e: MouseEvent | TouchEvent, yearInputs: { start: string; end: string }, applyYearFilter: (field: 'start' | 'end', value: string) => void, setYearInputs: (inputs: { start: string; end: string } | ((prev: { start: string; end: string }) => { start: string; end: string })) => void) => void
  handleSliderMouseUp: () => void
  isDraggingSlider: boolean
  isMobile?: boolean
}

export const YearRangeSlider: React.FC<YearRangeSliderProps> = ({
  yearInputs,
  setYearInputs,
  applyYearFilter,
  handleYearKeyPress,
  handleSliderMouseDown,
  handleSliderMouseMove,
  handleSliderMouseUp,
  isDraggingSlider,
  isMobile = false
}) => {
  // Вспомогательная функция для корректной обработки значений годов
  const parseYearValue = (value: string, defaultValue: number): number => {
    const parsed = parseInt(value);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  return (
    <div className="year-range-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.2rem'
    }}>
      {/* Поля ввода годов */}
      <div style={{
        display: 'flex',
        gap: '0.3rem',
        alignItems: 'center',
        fontSize: isMobile ? '0.8rem' : '0.7rem'
      }}>
        <input
          type="text"
          value={yearInputs.start}
          onChange={(e) => setYearInputs(prev => ({ ...prev, start: e.target.value }))}
          onBlur={() => applyYearFilter('start', yearInputs.start)}
          onKeyPress={(e) => handleYearKeyPress('start', e)}
          style={{
            width: isMobile ? '60px' : '50px',
            padding: '0.2rem 0.3rem',
            background: 'rgba(44, 24, 16, 0.8)',
            border: '1px solid rgba(244, 228, 193, 0.3)',
            borderRadius: '3px',
            color: '#f4e4c1',
            fontSize: 'inherit',
            textAlign: 'center'
          }}
          aria-label="Год начала"
        />
        <span style={{ color: '#f4e4c1', fontSize: 'inherit' }}>-</span>
        <input
          type="text"
          value={yearInputs.end}
          onChange={(e) => setYearInputs(prev => ({ ...prev, end: e.target.value }))}
          onBlur={() => applyYearFilter('end', yearInputs.end)}
          onKeyPress={(e) => handleYearKeyPress('end', e)}
          style={{
            width: isMobile ? '60px' : '50px',
            padding: '0.2rem 0.3rem',
            background: 'rgba(44, 24, 16, 0.8)',
            border: '1px solid rgba(244, 228, 193, 0.3)',
            borderRadius: '3px',
            color: '#f4e4c1',
            fontSize: 'inherit',
            textAlign: 'center'
          }}
          aria-label="Год окончания"
        />
      </div>
      
      {/* Интерактивная полоска диапазона */}
      <div 
        className="year-range-slider"
        style={{
          position: 'relative',
          width: isMobile ? '120px' : '100px',
          height: isMobile ? '8px' : '6px',
          background: 'rgba(44, 24, 16, 0.6)',
          borderRadius: isMobile ? '4px' : '3px',
          cursor: 'pointer',
          marginTop: '0.2rem'
        }}
        role="slider"
        aria-label="Диапазон годов"
        aria-valuemin={-800}
        aria-valuemax={2000}
        aria-valuenow={parseYearValue(yearInputs.start, -800)}
        aria-valuetext={`Диапазон: ${yearInputs.start} - ${yearInputs.end}`}
        tabIndex={0}
        onMouseDown={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const percentage = (x / rect.width) * 100;
          
          // Определяем, какую ручку перетаскивать в зависимости от позиции клика
          const startPercentage = Math.max(0, Math.min(100, ((parseYearValue(yearInputs.start, -800) + 800) / 2800 * 100)));
          const endPercentage = Math.max(0, Math.min(100, ((parseYearValue(yearInputs.end, 2000) + 800) / 2800 * 100)));
          
          // Если клик ближе к началу диапазона, перетаскиваем начало
          // Если клик ближе к концу диапазона, перетаскиваем конец
          const startDistance = Math.abs(percentage - startPercentage);
          const endDistance = Math.abs(percentage - endPercentage);
          
          const handleToDrag = startDistance < endDistance ? 'start' : 'end';
          handleSliderMouseDown(e, handleToDrag);
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.touches[0].clientX - rect.left;
          const percentage = (x / rect.width) * 100;
          
          // Определяем, какую ручку перетаскивать в зависимости от позиции клика
          const startPercentage = Math.max(0, Math.min(100, ((parseYearValue(yearInputs.start, -800) + 800) / 2800 * 100)));
          const endPercentage = Math.max(0, Math.min(100, ((parseYearValue(yearInputs.end, 2000) + 800) / 2800 * 100)));
          
          // Если клик ближе к началу диапазона, перетаскиваем начало
          // Если клик ближе к концу диапазона, перетаскиваем конец
          const startDistance = Math.abs(percentage - startPercentage);
          const endDistance = Math.abs(percentage - endPercentage);
          
          const handleToDrag = startDistance < endDistance ? 'start' : 'end';
          handleSliderMouseDown(e, handleToDrag);
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            const currentStart = parseYearValue(yearInputs.start, -800);
            const currentEnd = parseYearValue(yearInputs.end, 2000);
            const step = e.shiftKey ? 100 : 10;
            let newStart = currentStart;
            
            if (e.key === 'ArrowLeft') {
              newStart = Math.max(-800, currentStart - step);
            } else {
              newStart = Math.min(currentEnd - 100, currentStart + step);
            }
            
            setYearInputs(prev => ({ ...prev, start: newStart.toString() }));
            applyYearFilter('start', newStart.toString());
          }
        }}
      >
        {/* Активная область полоски */}
        <div 
          className="year-range-slider-track"
          id="year-range-slider-track"
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #cd853f 0%, #daa520 100%)',
            borderRadius: isMobile ? '4px' : '3px',
            position: 'absolute',
            left: `${Math.max(0, Math.min(100, ((parseYearValue(yearInputs.start, -800) + 800) / 2800 * 100)))}%`,
            width: `${Math.max(0, Math.min(100, ((parseYearValue(yearInputs.end, 2000) - parseYearValue(yearInputs.start, -800)) / 2800 * 100)))}%`,
            transition: isDraggingSlider ? 'none' : 'all 0.3s ease'
          }}
        />
        
        {/* Ручка начала диапазона */}
        <div 
          className="year-range-slider-handle year-range-slider-handle-start"
          id="year-range-slider-handle-start"
          role="slider"
          aria-label="Начало диапазона"
          aria-valuenow={parseYearValue(yearInputs.start, -800)}
          aria-valuemin={-800}
          aria-valuemax={2000}
          aria-valuetext={`Год начала: ${yearInputs.start}`}
          tabIndex={0}
          onMouseDown={(e) => {
            e.stopPropagation();
            handleSliderMouseDown(e, 'start');
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSliderMouseDown(e, 'start');
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
              e.preventDefault();
              const currentStart = parseYearValue(yearInputs.start, -800);
              const currentEnd = parseYearValue(yearInputs.end, 2000);
              const step = e.shiftKey ? 100 : 10;
              let newStart = currentStart;
              
              if (e.key === 'ArrowLeft') {
                newStart = Math.max(-800, currentStart - step);
              } else {
                newStart = Math.min(currentEnd - 100, currentStart + step);
              }
              
              setYearInputs(prev => ({ ...prev, start: newStart.toString() }));
              applyYearFilter('start', newStart.toString());
            }
          }}
          style={{
            position: 'absolute',
            top: '-2px',
            left: `${Math.max(0, Math.min(100, ((parseYearValue(yearInputs.start, -800) + 800) / 2800 * 100)))}%`,
            width: '12px',
            height: '12px',
            background: '#cd853f',
            border: '2px solid #f4e4c1',
            borderRadius: '50%',
            cursor: 'grab',
            transform: 'translateX(-50%)',
            transition: isDraggingSlider ? 'none' : 'all 0.2s ease',
            zIndex: 2
          }}
        />
        
        {/* Невидимая touch область для ручки начала */}
        <div 
          className="year-range-slider-touch-area year-range-slider-touch-area-start"
          id="year-range-slider-touch-area-start"
          onMouseDown={(e) => {
            e.stopPropagation();
            handleSliderMouseDown(e, 'start');
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSliderMouseDown(e, 'start');
          }}
          style={{
            position: 'absolute',
            top: '-16px',
            left: `${Math.max(0, Math.min(100, ((parseYearValue(yearInputs.start, -800) + 800) / 2800 * 100)))}%`,
            width: '44px',
            height: '44px',
            background: 'transparent',
            borderRadius: '50%',
            transform: 'translateX(-50%)',
            zIndex: 3,
            pointerEvents: 'auto'
          }}
        />
        
        {/* Ручка конца диапазона */}
        <div 
          className="year-range-slider-handle year-range-slider-handle-end"
          id="year-range-slider-handle-end"
          role="slider"
          aria-label="Конец диапазона"
          aria-valuenow={parseYearValue(yearInputs.end, 2000)}
          aria-valuemin={-800}
          aria-valuemax={2000}
          aria-valuetext={`Год окончания: ${yearInputs.end}`}
          tabIndex={0}
          onMouseDown={(e) => {
            e.stopPropagation();
            handleSliderMouseDown(e, 'end');
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSliderMouseDown(e, 'end');
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
              e.preventDefault();
              const currentStart = parseYearValue(yearInputs.start, -800);
              const currentEnd = parseYearValue(yearInputs.end, 2000);
              const step = e.shiftKey ? 100 : 10;
              let newEnd = currentEnd;
              
              if (e.key === 'ArrowLeft') {
                newEnd = Math.max(currentStart + 100, currentEnd - step);
              } else {
                newEnd = Math.min(2000, currentEnd + step);
              }
              
              setYearInputs(prev => ({ ...prev, end: newEnd.toString() }));
              applyYearFilter('end', newEnd.toString());
            }
          }}
          style={{
            position: 'absolute',
            top: '-2px',
            left: `${Math.max(0, Math.min(100, ((parseYearValue(yearInputs.end, 2000) + 800) / 2800 * 100)))}%`,
            width: '12px',
            height: '12px',
            background: '#daa520',
            border: '2px solid #f4e4c1',
            borderRadius: '50%',
            cursor: 'grab',
            transform: 'translateX(-50%)',
            transition: isDraggingSlider ? 'none' : 'all 0.2s ease',
            zIndex: 2
          }}
        />
        
        {/* Невидимая touch область для ручки конца */}
        <div 
          className="year-range-slider-touch-area year-range-slider-touch-area-end"
          id="year-range-slider-touch-area-end"
          onMouseDown={(e) => {
            e.stopPropagation();
            handleSliderMouseDown(e, 'end');
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSliderMouseDown(e, 'end');
          }}
          style={{
            position: 'absolute',
            top: '-16px',
            left: `${Math.max(0, Math.min(100, ((parseYearValue(yearInputs.end, 2000) + 800) / 2800 * 100)))}%`,
            width: '44px',
            height: '44px',
            background: 'transparent',
            borderRadius: '50%',
            transform: 'translateX(-50%)',
            zIndex: 3,
            pointerEvents: 'auto'
          }}
        />
      </div>
    </div>
  );
}; 