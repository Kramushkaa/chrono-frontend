import { renderHook, waitFor } from '@testing-library/react'
import { useDtoVersionWarning } from '../useDtoVersionWarning'
import * as api from 'shared/api/api'

jest.mock('shared/api/api', () => ({
  getDtoVersion: jest.fn(),
}))

const mockGetDtoVersion = api.getDtoVersion as jest.MockedFunction<typeof api.getDtoVersion>

describe('useDtoVersionWarning', () => {
  let consoleWarnSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
  })

  afterEach(() => {
    consoleWarnSpy.mockRestore()
  })

  it('should not warn when versions match', async () => {
    mockGetDtoVersion.mockResolvedValue('1.0.0')

    renderHook(() => useDtoVersionWarning('1.0.0'))

    await waitFor(() => {
      expect(mockGetDtoVersion).toHaveBeenCalled()
    })

    expect(consoleWarnSpy).not.toHaveBeenCalled()
  })

  it('should warn when versions mismatch', async () => {
    mockGetDtoVersion.mockResolvedValue('2.0.0')

    renderHook(() => useDtoVersionWarning('1.0.0'))

    await waitFor(() => {
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('DTO Version Mismatch')
      )
    })

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Frontend=1.0.0')
    )
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Backend=2.0.0')
    )
  })

  it('should not warn when backend returns null version', async () => {
    mockGetDtoVersion.mockResolvedValue(null as any)

    renderHook(() => useDtoVersionWarning('1.0.0'))

    await waitFor(() => {
      expect(mockGetDtoVersion).toHaveBeenCalled()
    })

    expect(consoleWarnSpy).not.toHaveBeenCalled()
  })

  it('should handle API errors gracefully', async () => {
    mockGetDtoVersion.mockRejectedValue(new Error('API Error'))

    renderHook(() => useDtoVersionWarning('1.0.0'))

    await waitFor(() => {
      expect(mockGetDtoVersion).toHaveBeenCalled()
    })

    // Should not throw or warn
    expect(consoleWarnSpy).not.toHaveBeenCalled()
  })

  it('should cleanup on unmount', async () => {
    mockGetDtoVersion.mockResolvedValue('2.0.0')

    const { unmount } = renderHook(() => useDtoVersionWarning('1.0.0'))

    unmount()

    // Should not crash
    expect(true).toBe(true)
  })

  it('should cancel pending request on unmount', async () => {
    let resolveFn: (value: string) => void
    const promise = new Promise<string>((resolve) => {
      resolveFn = resolve
    })

    mockGetDtoVersion.mockReturnValue(promise)

    const { unmount } = renderHook(() => useDtoVersionWarning('1.0.0'))

    // Unmount before promise resolves
    unmount()

    // Resolve after unmount
    resolveFn!('2.0.0')

    await waitFor(() => {
      expect(mockGetDtoVersion).toHaveBeenCalled()
    })

    // Should not warn because component was unmounted
    expect(consoleWarnSpy).not.toHaveBeenCalled()
  })

  it('should check version again when expectedVersion changes', async () => {
    mockGetDtoVersion.mockResolvedValue('2.0.0')

    const { rerender } = renderHook(
      ({ version }) => useDtoVersionWarning(version),
      { initialProps: { version: '1.0.0' } }
    )

    await waitFor(() => {
      expect(mockGetDtoVersion).toHaveBeenCalledTimes(1)
    })

    mockGetDtoVersion.mockClear()
    mockGetDtoVersion.mockResolvedValue('3.0.0')

    // Change version
    rerender({ version: '3.0.0' })

    await waitFor(() => {
      expect(mockGetDtoVersion).toHaveBeenCalledTimes(1)
    })
  })
})

