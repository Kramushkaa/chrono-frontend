import React, { useEffect } from 'react'
import { useMobile } from '../hooks/useMobile'

interface GroupingToggleProps {
  groupingType: 'category' | 'country' | 'none'
  onGroupingChange: (type: 'category' | 'country' | 'none') => void
}

export const GroupingToggle: React.FC<GroupingToggleProps> = React.memo(({ 
  groupingType, 
  onGroupingChange 
}) => {
  const isMobile = useMobile()

  // Component state tracking

  // Принудительное обновление стилей ползунка
  useEffect(() => {
    const slider = document.querySelector('.grouping-toggle .slider') as HTMLElement
    if (slider) {
      const offset = isMobile
        ? groupingType === 'category'
          ? '0px'
          : groupingType === 'country'
            ? '19px'
            : '38px'
        : groupingType === 'category'
          ? '3px'
          : groupingType === 'country'
            ? '23px'
            : '43px'
      slider.style.transform = `translateX(${offset})`
    }
  }, [groupingType, isMobile])

  return (
    <div className="grouping-toggle" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: isMobile ? '0.6rem' : '0.4rem',
      padding: isMobile ? '0.6rem 1rem' : '0.4rem 0.8rem'
    }}>
      {/* Изображения над переключателем */}
      <div style={{
        display: 'flex',
        gap: isMobile ? '0.4rem' : '0.3rem',
        alignItems: 'center',
        height: isMobile ? '18px' : '14px'
      }}>
        {/* Иконка категорий */}
        <div 
          role="button"
          tabIndex={0}
          aria-label="Группировать по роду деятельности"
          aria-pressed={groupingType === 'category'}
          style={{
            width: isMobile ? '24px' : '14px',
            height: isMobile ? '24px' : '14px',
            background: groupingType === 'category' ? '#cd853f' : 'rgba(244, 228, 193, 0.2)',
            borderRadius: '3px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isMobile ? '16px' : '9px',
            color: groupingType === 'category' ? '#2c1810' : 'rgba(44, 24, 16, 0.4)',
            transition: 'all 0.3s ease',
            opacity: groupingType === 'category' ? 1 : 0.6,
            cursor: 'pointer'
          }}
          onClick={() => onGroupingChange('category')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onGroupingChange('category');
            }
          }}
          title="Группировать по роду деятельности"
          onMouseEnter={(e) => {
            if (groupingType !== 'category') {
              e.currentTarget.style.background = 'rgba(205, 133, 63, 0.4)';
              e.currentTarget.style.opacity = '0.8';
            }
          }}
          onMouseLeave={(e) => {
            if (groupingType !== 'category') {
              e.currentTarget.style.background = 'rgba(244, 228, 193, 0.2)';
              e.currentTarget.style.opacity = '0.6';
            }
          }}
        >
          🎭
        </div>
        
        {/* Иконка стран */}
        <div 
          role="button"
          tabIndex={0}
          aria-label="Группировать по странам"
          aria-pressed={groupingType === 'country'}
          style={{
            width: isMobile ? '24px' : '14px',
            height: isMobile ? '24px' : '14px',
            background: groupingType === 'country' ? '#cd853f' : 'rgba(244, 228, 193, 0.2)',
            borderRadius: '3px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isMobile ? '16px' : '9px',
            color: groupingType === 'country' ? '#2c1810' : 'rgba(44, 24, 16, 0.4)',
            transition: 'all 0.3s ease',
            opacity: groupingType === 'country' ? 1 : 0.6,
            cursor: 'pointer'
          }}
          onClick={() => onGroupingChange('country')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onGroupingChange('country');
            }
          }}
          title="Группировать по странам"
          onMouseEnter={(e) => {
            if (groupingType !== 'country') {
              e.currentTarget.style.background = 'rgba(205, 133, 63, 0.4)';
              e.currentTarget.style.opacity = '0.8';
            }
          }}
          onMouseLeave={(e) => {
            if (groupingType !== 'country') {
              e.currentTarget.style.background = 'rgba(244, 228, 193, 0.2)';
              e.currentTarget.style.opacity = '0.6';
            }
          }}
        >
          🌍
        </div>
        
        {/* Иконка без группировки */}
        <div 
          role="button"
          tabIndex={0}
          aria-label="Без группировки"
          aria-pressed={groupingType === 'none'}
          style={{
            width: isMobile ? '24px' : '14px',
            height: isMobile ? '24px' : '14px',
            background: groupingType === 'none' ? '#cd853f' : 'rgba(244, 228, 193, 0.2)',
            borderRadius: '3px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isMobile ? '16px' : '9px',
            color: groupingType === 'none' ? '#2c1810' : 'rgba(44, 24, 16, 0.4)',
            transition: 'all 0.3s ease',
            opacity: groupingType === 'none' ? 1 : 0.6,
            cursor: 'pointer'
          }}
          onClick={() => onGroupingChange('none')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onGroupingChange('none');
            }
          }}
          title="Без группировки"
          onMouseEnter={(e) => {
            if (groupingType !== 'none') {
              e.currentTarget.style.background = 'rgba(205, 133, 63, 0.4)';
              e.currentTarget.style.opacity = '0.8';
            }
          }}
          onMouseLeave={(e) => {
            if (groupingType !== 'none') {
              e.currentTarget.style.background = 'rgba(244, 228, 193, 0.2)';
              e.currentTarget.style.opacity = '0.6';
            }
          }}
        >
          📊
        </div>
      </div>
      
      {/* Переключатель в виде слайдера */}
      <div 
        key={`toggle-${groupingType}-${isMobile}`} // Принудительный перерендер
        style={{
          position: 'relative',
          width: isMobile ? '90px' : '64px',
          height: isMobile ? '28px' : '22px',
          background: 'rgba(44, 24, 16, 0.9)',
          borderRadius: isMobile ? '14px' : '11px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)'
        }}
        onClick={() => {
          const options: ('category' | 'country' | 'none')[] = ['category', 'country', 'none']
          const currentIndex = options.indexOf(groupingType)
          const nextIndex = (currentIndex + 1) % options.length
          onGroupingChange(options[nextIndex])
        }}
      >
        {/* Ползунок */}
        <div 
          className="slider"
          key={`slider-${groupingType}-${isMobile}`} // Принудительное обновление при изменении
          style={{
            position: 'absolute',
            top: isMobile ? '2px' : '3px',
            left: '0px', // Фиксированная позиция слева
            width: isMobile ? '24px' : '18px',
            height: isMobile ? '24px' : '18px',
            background: 'linear-gradient(135deg, #cd853f 0%, #daa520 100%)',
            borderRadius: '50%',
            transition: 'transform 0.3s ease', // Переход для transform
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
            // Отладочная информация
            border: 'none',
            // Позиционирование через transform
            transform: `translateX(${(() => {
              const offset = isMobile
                ? groupingType === 'category'
                  ? '0px'
                  : groupingType === 'country'
                    ? '33px'
                    : '66px'
                : groupingType === 'category'
                  ? '3px'
                  : groupingType === 'country'
                    ? '23px'
                    : '43px'
              return offset
            })()})`
          }} 
        />
        

      </div>
    </div>
  )
})
