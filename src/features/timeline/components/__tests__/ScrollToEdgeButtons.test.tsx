import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { ScrollToEdgeButtons } from '../ScrollToEdgeButtons'
import { vi, describe, it, expect, beforeEach } from 'vitest'

describe('ScrollToEdgeButtons', () => {
  let mockTimelineRef: React.RefObject<HTMLDivElement>
  let mockElement: HTMLDivElement

  beforeEach(() => {
    // Создаем мок элемента с методами прокрутки
    mockElement = document.createElement('div')
    Object.defineProperty(mockElement, 'scrollLeft', {
      writable: true,
      value: 0
    })
    Object.defineProperty(mockElement, 'scrollWidth', {
      writable: true,
      value: 2000
    })
    Object.defineProperty(mockElement, 'clientWidth', {
      writable: true,
      value: 800
    })
    mockElement.scrollTo = vi.fn()

    mockTimelineRef = {
      current: mockElement
    }
  })

  it('не показывает кнопки когда находимся в начале', () => {
    mockElement.scrollLeft = 0
    render(<ScrollToEdgeButtons timelineRef={mockTimelineRef} />)

    // Кнопка "В начало" не должна отображаться
    expect(screen.queryByLabelText('Прокрутить к началу временной линии')).not.toBeInTheDocument()
  })

  it('показывает кнопку "В конец" когда находимся в начале', async () => {
    mockElement.scrollLeft = 0
    
    await act(async () => {
      render(<ScrollToEdgeButtons timelineRef={mockTimelineRef} />)
    })

    // Ждём выполнения начальной проверки (setTimeout)
    await waitFor(() => {
      expect(screen.getByLabelText('Прокрутить к концу временной линии')).toBeInTheDocument()
    }, { timeout: 500 })
  })

  it('показывает кнопку "В начало" когда прокрутили от начала', async () => {
    mockElement.scrollLeft = 500
    
    await act(async () => {
      render(<ScrollToEdgeButtons timelineRef={mockTimelineRef} />)
    })

    await waitFor(() => {
      expect(screen.getByLabelText('Прокрутить к началу временной линии')).toBeInTheDocument()
    }, { timeout: 500 })
  })

  it('не показывает кнопку "В конец" когда находимся в конце', async () => {
    // scrollLeft = scrollWidth - clientWidth
    mockElement.scrollLeft = 1200
    
    await act(async () => {
      render(<ScrollToEdgeButtons timelineRef={mockTimelineRef} />)
    })

    await waitFor(() => {
      expect(screen.queryByLabelText('Прокрутить к концу временной линии')).not.toBeInTheDocument()
    }, { timeout: 500 })
  })

  it('прокручивает к началу при клике на кнопку', async () => {
    mockElement.scrollLeft = 500
    
    await act(async () => {
      render(<ScrollToEdgeButtons timelineRef={mockTimelineRef} />)
    })

    await waitFor(() => {
      expect(screen.getByLabelText('Прокрутить к началу временной линии')).toBeInTheDocument()
    }, { timeout: 500 })

    const startButton = screen.getByLabelText('Прокрутить к началу временной линии')
    fireEvent.click(startButton)

    expect(mockElement.scrollTo).toHaveBeenCalledWith({
      left: 0,
      behavior: 'smooth'
    })
  })

  it('прокручивает к концу при клике на кнопку', async () => {
    mockElement.scrollLeft = 0
    
    await act(async () => {
      render(<ScrollToEdgeButtons timelineRef={mockTimelineRef} />)
    })

    await waitFor(() => {
      expect(screen.getByLabelText('Прокрутить к концу временной линии')).toBeInTheDocument()
    }, { timeout: 500 })

    const endButton = screen.getByLabelText('Прокрутить к концу временной линии')
    fireEvent.click(endButton)

    expect(mockElement.scrollTo).toHaveBeenCalledWith({
      left: 1200, // scrollWidth - clientWidth
      behavior: 'smooth'
    })
  })

  it('не падает если timelineRef.current === null', () => {
    const nullRef = { current: null }
    expect(() => {
      render(<ScrollToEdgeButtons timelineRef={nullRef} />)
    }).not.toThrow()
  })
})

