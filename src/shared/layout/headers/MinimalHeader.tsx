import React from 'react'
import { BrandTitle } from 'shared/ui/BrandTitle'
import { UserMenu } from 'shared/ui/UserMenu'

interface MinimalHeaderProps {
  onBackToMenu?: () => void
  extraRightControls?: React.ReactNode
  title?: string
}

/**
 * Minimal header for simple pages (Quiz, Profile, Register)
 * Only shows logo, optional title, and user menu
 */
export const MinimalHeader: React.FC<MinimalHeaderProps> = ({ onBackToMenu, extraRightControls, title }) => {
  return (
    <header className="app-header app-header--minimal">
      <div className="app-header__container">
        <div className="app-header__left">
          {onBackToMenu && (
            <button className="app-header__back-button" onClick={onBackToMenu} title="Вернуться в меню">
              ← Меню
            </button>
          )}
          <h1 className="app-header__brand">
            <BrandTitle />
          </h1>
          {title && <span className="app-header__title">{title}</span>}
        </div>

        <div className="app-header__right">
          {extraRightControls}
          <UserMenu />
        </div>
      </div>
    </header>
  )
}

