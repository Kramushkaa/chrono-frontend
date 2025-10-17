import { renderHook, act, waitFor } from '@testing-library/react'
import { usePersonPanel } from '../usePersonPanel'
import * as api from '../../../../shared/api/api'

jest.mock('../../../../shared/api/api', () => ({
  getPersonById: jest.fn(),
}))

const mockGetPersonById = api.getPersonById as jest.MockedFunction<typeof api.getPersonById>

describe('usePersonPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    (console.error as jest.Mock).mockRestore()
  })

  it('should initialize with null selectedPerson', () => {
    const { result } = renderHook(() => usePersonPanel())

    expect(result.current.selectedPerson).toBeNull()
  })

  it('should load full person data on handlePersonInfoClick', async () => {
    const mockFullPerson = {
      id: 'person-1',
      name: 'Test Person',
      birthYear: 1900,
      deathYear: 1950,
      category: 'Test',
      country: 'Russia',
      description: 'Full description',
      achievements: ['Achievement 1'],
    }

    mockGetPersonById.mockResolvedValue(mockFullPerson as any)

    const { result } = renderHook(() => usePersonPanel())

    await act(async () => {
      await result.current.handlePersonInfoClick({
        id: 'person-1',
        name: 'Test Person',
        birthYear: 1900,
        deathYear: 1950,
      } as any)
    })

    await waitFor(() => {
      expect(result.current.selectedPerson).toEqual(mockFullPerson)
    })

    expect(mockGetPersonById).toHaveBeenCalledWith('person-1')
  })

  it('should handle error when person not found', async () => {
    mockGetPersonById.mockResolvedValue(null)

    const { result } = renderHook(() => usePersonPanel())

    await act(async () => {
      await result.current.handlePersonInfoClick({
        id: 'non-existent',
        name: 'Test',
        birthYear: 1900,
        deathYear: 1950,
      } as any)
    })

    expect(console.error).toHaveBeenCalledWith('Person not found:', 'non-existent')
    expect(result.current.selectedPerson).toBeNull()
  })

  it('should handle API error', async () => {
    mockGetPersonById.mockRejectedValue(new Error('API Error'))

    const { result } = renderHook(() => usePersonPanel())

    await act(async () => {
      await result.current.handlePersonInfoClick({
        id: 'person-1',
        name: 'Test',
        birthYear: 1900,
        deathYear: 1950,
      } as any)
    })

    expect(console.error).toHaveBeenCalledWith('Failed to load person:', expect.any(Error))
    expect(result.current.selectedPerson).toBeNull()
  })

  it('should close person panel', () => {
    const mockPerson = {
      id: 'person-1',
      name: 'Test',
      birthYear: 1900,
      deathYear: 1950,
    }

    const { result } = renderHook(() => usePersonPanel())

    // Set a person first
    act(() => {
      result.current.setSelectedPerson(mockPerson as any)
    })

    expect(result.current.selectedPerson).toEqual(mockPerson)

    // Close panel
    act(() => {
      result.current.closePersonPanel()
    })

    expect(result.current.selectedPerson).toBeNull()
  })

  it('should allow direct setSelectedPerson', () => {
    const mockPerson = {
      id: 'person-1',
      name: 'Test',
      birthYear: 1900,
      deathYear: 1950,
    }

    const { result } = renderHook(() => usePersonPanel())

    act(() => {
      result.current.setSelectedPerson(mockPerson as any)
    })

    expect(result.current.selectedPerson).toEqual(mockPerson)
  })
})

