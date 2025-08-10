import { renderHook, act } from '@testing-library/react'
import { usePreferences } from '@/lib/stores/preferences'
import { UnitSystem } from '@/types/preferences.types'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('Preferences Store', () => {
  beforeEach(() => {
    localStorageMock.clear()
    // Reset store to initial state
    const { result } = renderHook(() => usePreferences())
    act(() => {
      result.current.setUnits('metric')
      result.current.setLanguage('ko')
      result.current.setUnitPreferences({
        temperature: 'celsius',
        windSpeed: 'ms',
        precipitation: 'mm'
      })
    })
  })

  describe('Initial State', () => {
    it('should have default preferences', () => {
      const { result } = renderHook(() => usePreferences())
      
      expect(result.current.units).toBe('metric')
      expect(result.current.language).toBe('ko')
      expect(result.current.unitPreferences.temperature).toBe('celsius')
      expect(result.current.unitPreferences.windSpeed).toBe('ms')
      expect(result.current.unitPreferences.precipitation).toBe('mm')
      expect(result.current.recentRegions).toEqual([])
      expect(result.current.favoriteRegions).toEqual([])
    })
  })

  describe('setUnits', () => {
    it('should update units correctly', () => {
      const { result } = renderHook(() => usePreferences())
      
      act(() => {
        result.current.setUnits('imperial')
      })
      
      expect(result.current.units).toBe('imperial')
    })

    it('should persist units to localStorage', () => {
      const { result } = renderHook(() => usePreferences())
      
      act(() => {
        result.current.setUnits('imperial')
      })
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'weather-preferences',
        expect.stringContaining('"units":"imperial"')
      )
    })
  })

  describe('setLanguage', () => {
    it('should update language correctly', () => {
      const { result } = renderHook(() => usePreferences())
      
      act(() => {
        result.current.setLanguage('en')
      })
      
      expect(result.current.language).toBe('en')
    })

    it('should persist language to localStorage', () => {
      const { result } = renderHook(() => usePreferences())
      
      act(() => {
        result.current.setLanguage('en')
      })
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'weather-preferences',
        expect.stringContaining('"language":"en"')
      )
    })
  })

  describe('setUnitPreferences', () => {
    it('should update unit preferences correctly', () => {
      const { result } = renderHook(() => usePreferences())
      
      act(() => {
        result.current.setUnitPreferences({
          temperature: 'fahrenheit',
          windSpeed: 'mph'
        })
      })
      
      expect(result.current.unitPreferences.temperature).toBe('fahrenheit')
      expect(result.current.unitPreferences.windSpeed).toBe('mph')
      expect(result.current.unitPreferences.precipitation).toBe('mm') // Should remain unchanged
    })

    it('should handle partial updates', () => {
      const { result } = renderHook(() => usePreferences())
      
      act(() => {
        result.current.setUnitPreferences({
          precipitation: 'in'
        })
      })
      
      expect(result.current.unitPreferences.temperature).toBe('celsius') // Should remain unchanged
      expect(result.current.unitPreferences.windSpeed).toBe('ms') // Should remain unchanged
      expect(result.current.unitPreferences.precipitation).toBe('in')
    })
  })

  describe('addRecentRegion', () => {
    it('should add region to recent regions', () => {
      const { result } = renderHook(() => usePreferences())
      
      act(() => {
        result.current.addRecentRegion('seoul')
      })
      
      expect(result.current.recentRegions).toContain('seoul')
    })

    it('should add region to the beginning of the list', () => {
      const { result } = renderHook(() => usePreferences())
      
      act(() => {
        result.current.addRecentRegion('seoul')
        result.current.addRecentRegion('busan')
      })
      
      expect(result.current.recentRegions[0]).toBe('busan')
      expect(result.current.recentRegions[1]).toBe('seoul')
    })

    it('should move existing region to the beginning', () => {
      const { result } = renderHook(() => usePreferences())
      
      act(() => {
        result.current.addRecentRegion('seoul')
        result.current.addRecentRegion('busan')
        result.current.addRecentRegion('seoul') // Add Seoul again
      })
      
      expect(result.current.recentRegions[0]).toBe('seoul')
      expect(result.current.recentRegions[1]).toBe('busan')
      expect(result.current.recentRegions).toHaveLength(2) // Should not duplicate
    })

    it('should limit recent regions to maximum 5', () => {
      const { result } = renderHook(() => usePreferences())
      
      act(() => {
        result.current.addRecentRegion('region1')
        result.current.addRecentRegion('region2')
        result.current.addRecentRegion('region3')
        result.current.addRecentRegion('region4')
        result.current.addRecentRegion('region5')
        result.current.addRecentRegion('region6')
      })
      
      expect(result.current.recentRegions).toHaveLength(5)
      expect(result.current.recentRegions[0]).toBe('region6')
      expect(result.current.recentRegions[4]).toBe('region2')
    })
  })

  describe('toggleFavoriteRegion', () => {
    it('should add region to favorites when not present', () => {
      const { result } = renderHook(() => usePreferences())
      
      act(() => {
        result.current.toggleFavoriteRegion('seoul')
      })
      
      expect(result.current.favoriteRegions).toContain('seoul')
    })

    it('should remove region from favorites when already present', () => {
      const { result } = renderHook(() => usePreferences())
      
      act(() => {
        result.current.toggleFavoriteRegion('seoul')
        result.current.toggleFavoriteRegion('seoul') // Toggle again
      })
      
      expect(result.current.favoriteRegions).not.toContain('seoul')
    })

    it('should handle multiple favorite regions', () => {
      const { result } = renderHook(() => usePreferences())
      
      act(() => {
        result.current.toggleFavoriteRegion('seoul')
        result.current.toggleFavoriteRegion('busan')
        result.current.toggleFavoriteRegion('daegu')
      })
      
      expect(result.current.favoriteRegions).toContain('seoul')
      expect(result.current.favoriteRegions).toContain('busan')
      expect(result.current.favoriteRegions).toContain('daegu')
      expect(result.current.favoriteRegions).toHaveLength(3)
    })

    it('should persist favorites to localStorage', () => {
      const { result } = renderHook(() => usePreferences())
      
      act(() => {
        result.current.toggleFavoriteRegion('seoul')
      })
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'weather-preferences',
        expect.stringContaining('"favoriteRegions":["seoul"]')
      )
    })
  })

  describe('Persistence', () => {
    it('should load preferences from localStorage on initialization', () => {
      const savedPreferences = {
        units: 'imperial' as UnitSystem,
        language: 'en',
        unitPreferences: {
          temperature: 'fahrenheit' as const,
          windSpeed: 'mph' as const,
          precipitation: 'in' as const
        },
        recentRegions: ['seoul', 'busan'],
        favoriteRegions: ['seoul']
      }
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedPreferences))
      
      const { result } = renderHook(() => usePreferences())
      
      expect(result.current.units).toBe('imperial')
      expect(result.current.language).toBe('en')
      expect(result.current.unitPreferences.temperature).toBe('fahrenheit')
      expect(result.current.recentRegions).toEqual(['seoul', 'busan'])
      expect(result.current.favoriteRegions).toEqual(['seoul'])
    })

    it('should handle corrupted localStorage data gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json')
      
      const { result } = renderHook(() => usePreferences())
      
      // Should fall back to defaults
      expect(result.current.units).toBe('metric')
      expect(result.current.language).toBe('ko')
    })
  })
})
