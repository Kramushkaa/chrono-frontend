import { useState, useCallback } from 'react'

export const useSlider = () => {
  const [isDraggingSlider, setIsDraggingSlider] = useState(false)
  const [draggedHandle, setDraggedHandle] = useState<'start' | 'end' | null>(null)
  const [sliderRect, setSliderRect] = useState<DOMRect | null>(null)

  const handleSliderMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent, handle: 'start' | 'end') => {
    e.preventDefault()
    setIsDraggingSlider(true)
    setDraggedHandle(handle)
    
    // Всегда ищем элемент слайдера по классу
    const sliderElement = e.currentTarget.closest('.year-range-slider') as Element
    if (sliderElement) {
      setSliderRect(sliderElement.getBoundingClientRect())
    }
  }, [])

  const handleSliderMouseMove = useCallback((e: MouseEvent | TouchEvent, yearInputs: { start: string; end: string }, applyYearFilter: (field: 'start' | 'end', value: string) => void, setYearInputs: (inputs: { start: string; end: string } | ((prev: { start: string; end: string }) => { start: string; end: string })) => void) => {
    if (!isDraggingSlider || !draggedHandle) return

    // Получаем актуальные координаты слайдера
    // Ищем активный слайдер (тот, который видим на экране)
    const sliderElements = document.querySelectorAll('.year-range-slider')
    let sliderElement: Element | null = null
    
    // Находим видимый слайдер
    Array.from(sliderElements).forEach((element) => {
      const rect = element.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0 && !sliderElement) {
        sliderElement = element
      }
    })
    
    if (!sliderElement) return
    
    const rect = (sliderElement as Element).getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    
    // Преобразуем процент в год (от -800 до 2000)
    const totalRange = 2800 // 2000 - (-800)
    const year = Math.round(-800 + (percentage / 100) * totalRange)
    
    // Ограничиваем значения
    const startYear = parseInt(yearInputs.start) || -800
    const endYear = parseInt(yearInputs.end) || 2000
    
    let newYear = year
    if (draggedHandle === 'start') {
      newYear = Math.max(-800, Math.min(endYear - 100, year))
      setYearInputs(prev => ({ ...prev, start: newYear.toString() }))
      applyYearFilter('start', newYear.toString())
    } else {
      newYear = Math.max(startYear + 100, Math.min(2000, year))
      setYearInputs(prev => ({ ...prev, end: newYear.toString() }))
      applyYearFilter('end', newYear.toString())
    }
  }, [isDraggingSlider, draggedHandle])

  const handleSliderMouseUp = useCallback(() => {
    setIsDraggingSlider(false)
    setDraggedHandle(null)
    setSliderRect(null)
  }, [])

  return {
    isDraggingSlider,
    draggedHandle,
    sliderRect,
    handleSliderMouseDown,
    handleSliderMouseMove,
    handleSliderMouseUp
  }
} 


