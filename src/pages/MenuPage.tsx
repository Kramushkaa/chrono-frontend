import React from 'react'
import { useNavigate } from 'react-router-dom'
import { MainMenu } from 'shared/ui/MainMenu'

export default function MenuPage() {
  const navigate = useNavigate()

  const handleOpenTimeline = () => navigate('/timeline')

  return (
    <div className="app" id="chrononinja-app" role="main" aria-label="Хронониндзя — Главное меню">
      <MainMenu onOpenTimeline={handleOpenTimeline} />
    </div>
  )
}


