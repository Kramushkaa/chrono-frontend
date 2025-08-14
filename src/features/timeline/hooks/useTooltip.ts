import { useState, useRef, useCallback, useEffect } from 'react'
import { Person } from 'shared/types'

export const useTooltip = () => {
  const [hoveredPerson, setHoveredPerson] = useState<Person | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [showTooltip, setShowTooltip] = useState(false)
  const [hoveredAchievement, setHoveredAchievement] = useState<{ person: Person; year: number; index: number } | null>(null)
  const [achievementTooltipPosition, setAchievementTooltipPosition] = useState({ x: 0, y: 0 })
  const [showAchievementTooltip, setShowAchievementTooltip] = useState(false)
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Очищаем таймер при размонтировании компонента
  useEffect(() => {
    return () => {
      const timer = hoverTimerRef.current;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, []);

  const handlePersonHover = useCallback((person: Person | null, x: number, y: number) => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }

    if (person) {
      setHoveredPerson(person);
      setMousePosition({ x, y });
      setShowTooltip(true);
    } else {
      hoverTimerRef.current = setTimeout(() => {
        setShowTooltip(false);
        setHoveredPerson(null);
      }, 200);
    }
  }, [])

  const handleAchievementHover = useCallback((achievement: { person: Person; year: number; index: number } | null, x: number, y: number) => {
    if (achievement) {
      setHoveredAchievement(achievement);
      setAchievementTooltipPosition({ x, y });
      setShowAchievementTooltip(true);
    } else {
      setShowAchievementTooltip(false);
      setHoveredAchievement(null);
    }
  }, [])

  return {
    hoveredPerson,
    mousePosition,
    showTooltip,
    hoveredAchievement,
    achievementTooltipPosition,
    showAchievementTooltip,
    hoverTimerRef,
    handlePersonHover,
    handleAchievementHover
  }
} 