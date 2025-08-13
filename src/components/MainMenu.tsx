import React from 'react'
import './MainMenu.css'
import { UserMenu } from './UserMenu'
import { BrandTitle } from './BrandTitle'
import { SEO } from './SEO'

interface MainMenuProps {
  onOpenTimeline: () => void
}

export const MainMenu: React.FC<MainMenuProps> = ({ onOpenTimeline }) => {

  return (
    <div className="main-menu">
      <SEO
        title="Хронониндзя — Историческая временная линия"
        description="Интерактивная временная линия: личности, события, достижения. Исследуйте историю с Хронониндзя."
        canonical={typeof window !== 'undefined' ? window.location.origin + '/menu' : undefined}
        image={typeof window !== 'undefined' ? window.location.origin + '/og-image.jpg' : undefined}
      />
      {/* JSON-LD Organization */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Хронониндзя',
          url: typeof window !== 'undefined' ? window.location.origin : undefined,
          logo: typeof window !== 'undefined' ? window.location.origin + '/logo192.png' : undefined
        })}
      </script>
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 100 }}>
        <UserMenu />
      </div>
      <div className="main-menu-container">
        {/* Заголовок */}
        <div className="main-menu-header">
          <h1 className="main-menu-title">
            <BrandTitle />
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
          <div 
            className="main-menu-item"
            onClick={() => window.location.assign('/manage')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                window.location.assign('/manage')
              }
            }}
          >
            <div className="main-menu-item-icon">🛠️</div>
            <div className="main-menu-item-content">
              <h3 className="main-menu-item-title">Управление</h3>
              <p className="main-menu-item-description">Страница управления: личности и достижения</p>
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