import React from 'react'
import { useMobile } from '../hooks/useMobile'
import './MainMenu.css'

interface MainMenuProps {
  onOpenTimeline: () => void
}

export const MainMenu: React.FC<MainMenuProps> = ({ onOpenTimeline }) => {
  const isMobile = useMobile()

  return (
    <div className="main-menu">
      <div className="main-menu-container">
        {/* Заголовок */}
        <div className="main-menu-header">
          <h1 className="main-menu-title">
            <span>Хр</span>
            <img src="/logo.png" alt="логотип" style={{ width: '1em', height: '1em', verticalAlign: 'middle', margin: '0 0.1em' }} />
            <span> ниндзя</span>
          </h1>
          <p className="main-menu-subtitle">Историческая временная линия</p>
        </div>

        {/* Плиточки меню */}
        <div className="main-menu-grid">
          <div 
            className="main-menu-item"
            onClick={onOpenTimeline}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onOpenTimeline()
              }
            }}
          >
            <div className="main-menu-item-icon">
              📅
            </div>
            <div className="main-menu-item-content">
              <h3 className="main-menu-item-title">Открыть линию времени</h3>
              <p className="main-menu-item-description">
                Исследуйте исторические события и личности на интерактивной временной линии
              </p>
            </div>
          </div>
        </div>

        {/* Футер */}
        <div className="main-menu-footer">
          <p className="main-menu-footer-text">
            Исследуйте историю через призму времени
          </p>
        </div>
      </div>
    </div>
  )
} 