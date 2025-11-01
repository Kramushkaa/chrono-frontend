import React from 'react'

type Props = {
  activeTab: 'persons' | 'achievements' | 'periods'
  setActiveTab: (tab: 'persons' | 'achievements' | 'periods') => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  isAuthenticated: boolean
  userEmailVerified?: boolean
  onAddClick?: () => void
}

export function DesktopTabs({ 
  activeTab, 
  setActiveTab, 
  sidebarCollapsed, 
  setSidebarCollapsed, 
  isAuthenticated, 
  userEmailVerified,
  onAddClick
}: Props) {

  return (
    <div className="manage-page__tabs" style={{ display: 'flex', gap: 12, margin: '8px 0 16px', alignItems: 'center', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }} role="tablist" aria-label="Вкладки управления">
      <button 
        className={`manage-page__tab ${activeTab === 'persons' ? 'manage-page__tab--active' : ''}`}
        id="manage-tab-persons"
        role="tab" 
        aria-selected={activeTab === 'persons'} 
        onClick={() => setActiveTab('persons')} 
        style={{ padding: '6px 12px' }}
      >
        Личности
      </button>
      <button 
        className={`manage-page__tab ${activeTab === 'achievements' ? 'manage-page__tab--active' : ''}`}
        id="manage-tab-achievements"
        role="tab" 
        aria-selected={activeTab === 'achievements'} 
        onClick={() => setActiveTab('achievements')} 
        style={{ padding: '6px 12px' }}
      >
        Достижения
      </button>
      <button 
        className={`manage-page__tab ${activeTab === 'periods' ? 'manage-page__tab--active' : ''}`}
        id="manage-tab-periods"
        role="tab" 
        aria-selected={activeTab === 'periods'} 
        onClick={() => setActiveTab('periods')} 
        style={{ padding: '6px 12px' }}
      >
        Периоды
      </button>
      
      {/* Collapse/Expand button */}
      <button
        className="manage-page__collapse-btn"
        id="manage-collapse-btn"
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        aria-pressed={sidebarCollapsed}
        aria-label={sidebarCollapsed ? 'Показать меню' : 'Скрыть меню'}
        title={sidebarCollapsed ? 'Показать меню' : 'Скрыть меню'}
      >
        {sidebarCollapsed ? '⟩' : '⟨'}
      </button>
      
      <div style={{ marginLeft: 'auto' }} />
      <button
        className="manage-page__add-button"
        onClick={onAddClick}
        disabled={!isAuthenticated || !userEmailVerified}
        title={!isAuthenticated ? 'Требуется вход' : !userEmailVerified ? 'Подтвердите email' : 'Добавить'}
      >
        Добавить
      </button>

    </div>
  )
}



