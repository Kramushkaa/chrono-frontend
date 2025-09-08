import { useEffect } from 'react'

export function useAchievementTooltipDismiss(showAchievementTooltip: boolean, handleAchievementHover: (a: any, x: number, y: number) => void) {
  useEffect(() => {
    const handleCloseAchievementTooltip = () => {
      handleAchievementHover(null, 0, 0);
    };

    const handleClickOutside = (event: Event) => {
      const target = event.target as Element;
      const tooltip = document.getElementById('achievement-tooltip');
      const isClickInsideTooltip = tooltip?.contains(target);
      const isClickOnMarker = (target as any)?.closest?.('.achievement-marker');
      
      if (!isClickInsideTooltip && !isClickOnMarker && showAchievementTooltip) {
        if (event.type === 'touchstart') {
          setTimeout(() => {
            handleAchievementHover(null, 0, 0);
          }, 100);
        } else {
          handleAchievementHover(null, 0, 0);
        }
      }
    };

    window.addEventListener('closeAchievementTooltip', handleCloseAchievementTooltip);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      window.removeEventListener('closeAchievementTooltip', handleCloseAchievementTooltip);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [handleAchievementHover, showAchievementTooltip])
}


