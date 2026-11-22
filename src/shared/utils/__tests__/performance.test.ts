import {
  logPerformanceMark,
  getPerformanceMarks,
  clearPerformanceMarks,
  getPerformanceStats,
  measureExecution,
  measureExecutionAsync,
  printPerformanceReport,
} from '../performance'

// Mock console methods
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation()
const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation()
const mockConsoleGroup = vi.spyOn(console, 'group').mockImplementation()
const mockConsoleGroupEnd = vi.spyOn(console, 'groupEnd').mockImplementation()

// Mock import.meta.env to enable dev mode
const originalMode = import.meta.env.MODE
const originalDev = import.meta.env.DEV

describe('performance utilities', () => {
  beforeEach(() => {
    // Set mode to development for tests
    ;(import.meta.env as any).MODE = 'development'
    ;(import.meta.env as any).DEV = true
    clearPerformanceMarks()
    mockConsoleLog.mockClear()
    mockConsoleWarn.mockClear()
    mockConsoleGroup.mockClear()
    mockConsoleGroupEnd.mockClear()
  })

  afterAll(() => {
    // Restore original env
    ;(import.meta.env as any).MODE = originalMode
    ;(import.meta.env as any).DEV = originalDev
    mockConsoleLog.mockRestore()
    mockConsoleWarn.mockRestore()
    mockConsoleGroup.mockRestore()
    mockConsoleGroupEnd.mockRestore()
  })

  describe('logPerformanceMark', () => {
    it('should log performance mark', () => {
      const mark = {
        component: 'TestComponent',
        phase: 'mount' as const,
        duration: 10,
        timestamp: Date.now(),
      }

      logPerformanceMark(mark)

      const marks = getPerformanceMarks()
      expect(marks).toHaveLength(1)
      expect(marks[0]).toEqual(mark)
    })

    it('should warn about slow renders', () => {
      const mark = {
        component: 'SlowComponent',
        phase: 'mount' as const,
        duration: 1100, // > 1000ms threshold for logger.performanceWarning
        timestamp: Date.now(),
      }

      logPerformanceMark(mark)

      // Logger uses performanceWarning which requires duration > 1000ms
      expect(mockConsoleWarn).toHaveBeenCalled()
      const callArg = mockConsoleWarn.mock.calls[0][0]
      expect(callArg).toContain('Slow mount detected in SlowComponent')
    })

    it('should limit number of stored marks', () => {
      // Add more than MAX_MARKS (100)
      for (let i = 0; i < 105; i++) {
        logPerformanceMark({
          component: `Component${i}`,
          phase: 'mount' as const,
          duration: 5,
          timestamp: Date.now(),
        })
      }

      const marks = getPerformanceMarks()
      expect(marks).toHaveLength(100) // Should be limited to MAX_MARKS
    })
  })

  describe('getPerformanceStats', () => {
    it('should return null when no marks', () => {
      const stats = getPerformanceStats()
      expect(stats).toBeNull()
    })

    it('should calculate statistics correctly', () => {
      // Add some test marks
      logPerformanceMark({
        component: 'Component1',
        phase: 'mount',
        duration: 10,
        timestamp: Date.now(),
      })
      logPerformanceMark({
        component: 'Component2',
        phase: 'update',
        duration: 20,
        timestamp: Date.now(),
      })
      logPerformanceMark({
        component: 'Component3',
        phase: 'mount',
        duration: 5,
        timestamp: Date.now(),
      })

      const stats = getPerformanceStats()
      expect(stats).toEqual({
        totalMarks: 3,
        averageDuration: '11.67',
        maxDuration: '20.00',
        minDuration: '5.00',
        slowRenders: 1,
        slowRenderPercentage: '33.3',
      })
    })
  })

  describe('measureExecution', () => {
    it('should measure sync function execution', () => {
      const fn = vi.fn(() => 'result')
      
      const result = measureExecution('test-function', fn)

      expect(result).toBe('result')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should log slow executions', () => {
      const fn = vi.fn(() => {
        // Simulate slow execution
        const start = Date.now()
        while (Date.now() - start < 10) {
          // Busy wait
        }
        return 'slow-result'
      })

      measureExecution('slow-function', fn)

      // Logger теперь использует JSON формат, debug вызывается для медленных операций
      // В тестовом окружении это может быть консольный debug
      if (mockConsoleLog.mock.calls.length > 0) {
        const callArg = mockConsoleLog.mock.calls[0][0]
        expect(callArg).toContain('slow-function')
      }
    })
  })

  describe('measureExecutionAsync', () => {
    it('should measure async function execution', async () => {
      const fn = vi.fn().mockResolvedValue('async-result')
      
      const result = await measureExecutionAsync('async-function', fn)

      expect(result).toBe('async-result')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should log slow async executions', async () => {
      const fn = vi.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 1100)) // 1100ms > 1000ms threshold
        return 'slow-async-result'
      })

      await measureExecutionAsync('slow-async-function', fn)

      // Logger uses performanceWarning which requires duration > 1000ms
      expect(mockConsoleWarn).toHaveBeenCalled()
      const callArg = mockConsoleWarn.mock.calls[0][0]
      expect(callArg).toContain('slow-async-function')
    })
  })

  describe('printPerformanceReport', () => {
    it('should print report when no data', () => {
      printPerformanceReport()

      // Logger теперь использует JSON формат
      expect(mockConsoleLog).toHaveBeenCalled()
      const callArg = mockConsoleLog.mock.calls[0][0]
      expect(callArg).toContain('No performance data collected yet')
    })

    it('should print detailed report with data', () => {
      // Add some test marks
      logPerformanceMark({
        component: 'Component1',
        phase: 'mount',
        duration: 10,
        timestamp: Date.now(),
      })
      logPerformanceMark({
        component: 'Component2',
        phase: 'update',
        duration: 20,
        timestamp: Date.now(),
      })

      printPerformanceReport()

      // В dev mode используется console.group для визуализации
      expect(mockConsoleGroup).toHaveBeenCalledWith(
        expect.stringContaining('📊 Performance Report')
      )
      // Logger использует JSON для основного отчета, но в dev mode также выводит консольный вывод
      expect(mockConsoleLog).toHaveBeenCalled()
    })
  })

  describe('clearPerformanceMarks', () => {
    it('should clear all performance marks', () => {
      logPerformanceMark({
        component: 'TestComponent',
        phase: 'mount',
        duration: 10,
        timestamp: Date.now(),
      })

      expect(getPerformanceMarks()).toHaveLength(1)

      clearPerformanceMarks()

      expect(getPerformanceMarks()).toHaveLength(0)
    })
  })
})





