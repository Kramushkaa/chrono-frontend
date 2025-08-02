import React from 'react'

interface GroupingToggleProps {
  groupingType: 'category' | 'country' | 'none'
  onGroupingChange: (type: 'category' | 'country' | 'none') => void
}

export const GroupingToggle: React.FC<GroupingToggleProps> = ({ 
  groupingType, 
  onGroupingChange 
}) => {
  return (
    <div className="grouping-toggle" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.4rem',
      padding: '0.4rem 0.8rem'
    }}>
      {/* Изображения над переключателем */}
      <div style={{
        display: 'flex',
        gap: '0.3rem',
        alignItems: 'center',
        height: '14px'
      }}>
        {/* Иконка категорий */}
        <div 
          style={{
            width: '14px',
            height: '14px',
            background: groupingType === 'category' ? '#cd853f' : 'rgba(244, 228, 193, 0.2)',
            borderRadius: '3px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '9px',
            color: groupingType === 'category' ? '#2c1810' : 'rgba(44, 24, 16, 0.4)',
            transition: 'all 0.3s ease',
            opacity: groupingType === 'category' ? 1 : 0.6,
            cursor: 'pointer'
          }}
          onClick={() => onGroupingChange('category')}
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
          style={{
            width: '14px',
            height: '14px',
            background: groupingType === 'country' ? '#cd853f' : 'rgba(244, 228, 193, 0.2)',
            borderRadius: '3px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '9px',
            color: groupingType === 'country' ? '#2c1810' : 'rgba(44, 24, 16, 0.4)',
            transition: 'all 0.3s ease',
            opacity: groupingType === 'country' ? 1 : 0.6,
            cursor: 'pointer'
          }}
          onClick={() => onGroupingChange('country')}
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
          style={{
            width: '14px',
            height: '14px',
            background: groupingType === 'none' ? '#cd853f' : 'rgba(244, 228, 193, 0.2)',
            borderRadius: '3px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '9px',
            color: groupingType === 'none' ? '#2c1810' : 'rgba(44, 24, 16, 0.4)',
            transition: 'all 0.3s ease',
            opacity: groupingType === 'none' ? 1 : 0.6,
            cursor: 'pointer'
          }}
          onClick={() => onGroupingChange('none')}
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
      <div style={{
        position: 'relative',
        width: '64px',
        height: '22px',
        background: 'rgba(44, 24, 16, 0.9)',
        borderRadius: '11px',
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
        <div style={{
          position: 'absolute',
          top: '3px',
          left: groupingType === 'category' ? '3px' : groupingType === 'country' ? '23px' : '43px',
          width: '18px',
          height: '18px',
          background: 'linear-gradient(135deg, #cd853f 0%, #daa520 100%)',
          borderRadius: '50%',
          transition: 'left 0.3s ease',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.2)'
        }} />
        
        {/* Индикаторы позиций */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          gap: '10px',
          pointerEvents: 'none'
        }}>
          <div style={{
            width: '3px',
            height: '3px',
            borderRadius: '50%',
            background: groupingType === 'category' ? '#f4e4c1' : 'rgba(244, 228, 193, 0.2)',
            transition: 'background 0.3s ease'
          }} />
          <div style={{
            width: '3px',
            height: '3px',
            borderRadius: '50%',
            background: groupingType === 'country' ? '#f4e4c1' : 'rgba(244, 228, 193, 0.2)',
            transition: 'background 0.3s ease'
          }} />
          <div style={{
            width: '3px',
            height: '3px',
            borderRadius: '50%',
            background: groupingType === 'none' ? '#f4e4c1' : 'rgba(244, 228, 193, 0.2)',
            transition: 'background 0.3s ease'
          }} />
        </div>
      </div>
    </div>
  )
} 