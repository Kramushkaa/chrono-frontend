import React, { useState, useEffect, useCallback } from 'react'

interface ScrollToEdgeButtonsProps {
  timelineRef: React.RefObject<HTMLDivElement>
}

export const ScrollToEdgeButtons: React.FC<ScrollToEdgeButtonsProps> = ({ timelineRef }) => {
  const [showStart, setShowStart] = useState(false)
  const [showEnd, setShowEnd] = useState(false)
  const SCROLL_THRESHOLD = 100 // Порог в пикселях для показа кнопок

  // Проверка положения скролла
  const checkScrollPosition = useCallback(() => {
    const el = timelineRef.current
    if (!el) return

    const scrollLeft = el.scrollLeft
    const scrollWidth = el.scrollWidth
    const clientWidth = el.clientWidth

    // Показываем кнопку "В начало" если пользователь прокрутил вправо
    setShowStart(scrollLeft > SCROLL_THRESHOLD)

    // Показываем кнопку "В конец" если не находимся в конце
    setShowEnd(scrollLeft < scrollWidth - clientWidth - SCROLL_THRESHOLD)
  }, [timelineRef])

  // Следим за изменениями скролла
  useEffect(() => {
    const el = timelineRef.current
    if (!el) return

    // Проверяем начальную позицию после небольшой задержки,
    // чтобы дать время для рендеринга контента
    const initialCheck = setTimeout(() => {
      checkScrollPosition()
    }, 100)

    // Добавляем слушатель скролла
    el.addEventListener('scroll', checkScrollPosition, { passive: true })

    // Следим за изменениями размера окна
    window.addEventListener('resize', checkScrollPosition)

    return () => {
      clearTimeout(initialCheck)
      el.removeEventListener('scroll', checkScrollPosition)
      window.removeEventListener('resize', checkScrollPosition)
    }
  }, [timelineRef, checkScrollPosition])

  // Дополнительная проверка при изменении размеров таймлайна
  useEffect(() => {
    const el = timelineRef.current
    if (!el) return

    const observer = new ResizeObserver(() => {
      checkScrollPosition()
    })

    observer.observe(el)

    return () => {
      observer.disconnect()
    }
  }, [timelineRef, checkScrollPosition])

  // Прокрутка к началу
  const scrollToStart = () => {
    const el = timelineRef.current
    if (!el) return

    el.scrollTo({
      left: 0,
      behavior: 'smooth'
    })
  }

  // Прокрутка к концу
  const scrollToEnd = () => {
    const el = timelineRef.current
    if (!el) return

    el.scrollTo({
      left: el.scrollWidth - el.clientWidth,
      behavior: 'smooth'
    })
  }

  return (
    <>
      {/* Кнопка "В начало" */}
      {showStart && (
        <button
          className="scroll-to-edge-button scroll-to-start"
          onClick={scrollToStart}
          aria-label="Прокрутить к началу временной линии"
          title="Прокрутить к началу"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19 18L13 12L19 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {/* Кнопка "В конец" */}
      {showEnd && (
        <button
          className="scroll-to-edge-button scroll-to-end"
          onClick={scrollToEnd}
          aria-label="Прокрутить к концу временной линии"
          title="Прокрутить к концу"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 6L15 12L9 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5 6L11 12L5 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </>
  )
}

