import React from 'react'

type Props = {
  activeTab: 'persons' | 'achievements' | 'periods'
  setActiveTab: (tab: 'persons' | 'achievements' | 'periods') => void
  isAuthenticated: boolean
  userEmailVerified?: boolean
}

export function MobileTabs({ 
  activeTab, 
  setActiveTab, 
  isAuthenticated, 
  userEmailVerified
}: Props) {

  return (
    <div className="mobile-tabs">
      <div className="mobile-tabs__container">
        <button 
          className={`mobile-tabs__tab ${activeTab === 'persons' ? 'mobile-tabs__tab--active' : ''}`}
          onClick={() => setActiveTab('persons')}
        >
          Личности
        </button>
        <button 
          className={`mobile-tabs__tab ${activeTab === 'achievements' ? 'mobile-tabs__tab--active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          Достижения
        </button>
        <button 
          className={`mobile-tabs__tab ${activeTab === 'periods' ? 'mobile-tabs__tab--active' : ''}`}
          onClick={() => setActiveTab('periods')}
        >
          Периоды
        </button>
      </div>
      

    </div>
  )
}



