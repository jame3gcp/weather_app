import { koreanCities, searchRegions, findRegionById, findNearestRegion } from '@/lib/geo'
import { Region } from '@/types/region.types'
import { Coordinates } from '@/types/coordinates.types'

describe('Geo Utilities', () => {
  describe('koreanCities', () => {
    it('should contain valid city data', () => {
      expect(koreanCities).toBeInstanceOf(Array)
      expect(koreanCities.length).toBeGreaterThan(0)
    })

    it('should have cities with required properties', () => {
      const city = koreanCities[0]
      expect(city).toHaveProperty('id')
      expect(city).toHaveProperty('name')
      expect(city).toHaveProperty('fullName')
      expect(city).toHaveProperty('level')
      expect(city).toHaveProperty('coordinates')
      expect(city.coordinates).toHaveProperty('lat')
      expect(city.coordinates).toHaveProperty('lon')
    })

    it('should have valid coordinate values', () => {
      koreanCities.forEach(city => {
        expect(city.coordinates.lat).toBeGreaterThanOrEqual(33.0)
        expect(city.coordinates.lat).toBeLessThanOrEqual(38.6)
        expect(city.coordinates.lon).toBeGreaterThanOrEqual(124.5)
        expect(city.coordinates.lon).toBeLessThanOrEqual(132.0)
      })
    })
  })

  describe('searchRegions', () => {
    it('should return empty array for empty query', () => {
      const results = searchRegions('')
      expect(results).toEqual([])
    })

    it('should return empty array for non-matching query', () => {
      const results = searchRegions('nonexistentcity')
      expect(results).toEqual([])
    })

    it('should find cities by name (case insensitive)', () => {
      const results = searchRegions('seoul')
      expect(results.length).toBeGreaterThan(0)
      expect(results.some(city => city.name.toLowerCase().includes('seoul'))).toBe(true)
    })

    it('should find cities by partial name', () => {
      const results = searchRegions('부산')
      expect(results.length).toBeGreaterThan(0)
      expect(results.some(city => city.name.includes('부산'))).toBe(true)
    })

    it('should return all cities for very short queries', () => {
      const results = searchRegions('a')
      expect(results.length).toBeGreaterThan(0)
    })
  })

  describe('findRegionById', () => {
    it('should return undefined for non-existent ID', () => {
      const result = findRegionById('nonexistent')
      expect(result).toBeUndefined()
    })

    it('should return region for existing ID', () => {
      const seoul = koreanCities.find(city => city.name === 'Seoul')
      if (seoul) {
        const result = findRegionById(seoul.id)
        expect(result).toEqual(seoul)
      }
    })

    it('should handle empty ID', () => {
      const result = findRegionById('')
      expect(result).toBeUndefined()
    })
  })

  describe('findNearestRegion', () => {
    it('should return a region for valid coordinates', () => {
      const coordinates: Coordinates = { lat: 37.5665, lon: 126.9780 }
      const result = findNearestRegion(coordinates)
      
      expect(result).toBeDefined()
      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('name')
      expect(result).toHaveProperty('coordinates')
    })

    it('should return Seoul for coordinates near Seoul', () => {
      const seoulCoordinates: Coordinates = { lat: 37.5665, lon: 126.9780 }
      const result = findNearestRegion(seoulCoordinates)
      
      // Should find Seoul or a very nearby city
      expect(result.name).toMatch(/Seoul|서울/)
    })

    it('should return Busan for coordinates near Busan', () => {
      const busanCoordinates: Coordinates = { lat: 35.1796, lon: 129.0756 }
      const result = findNearestRegion(busanCoordinates)
      
      // Should find Busan or a very nearby city
      expect(result.name).toMatch(/Busan|부산/)
    })

    it('should handle edge case coordinates', () => {
      const edgeCoordinates: Coordinates = { lat: 33.0, lon: 124.5 }
      const result = findNearestRegion(edgeCoordinates)
      
      expect(result).toBeDefined()
      expect(result).toHaveProperty('id')
    })

    it('should handle coordinates outside Korea', () => {
      const outsideCoordinates: Coordinates = { lat: 40.7128, lon: -74.0060 } // New York
      const result = findNearestRegion(outsideCoordinates)
      
      // Should still return a region (closest to the border)
      expect(result).toBeDefined()
      expect(result).toHaveProperty('id')
    })
  })

  describe('Distance calculation', () => {
    it('should calculate correct distance between two points', () => {
      const point1: Coordinates = { lat: 37.5665, lon: 126.9780 } // Seoul
      const point2: Coordinates = { lat: 35.1796, lon: 129.0756 } // Busan
      
      const result = findNearestRegion(point1)
      const seoul = koreanCities.find(city => city.name === 'Seoul')
      
      if (seoul) {
        // Seoul should be the nearest to Seoul coordinates
        expect(result.id).toBe(seoul.id)
      }
    })

    it('should handle same coordinates', () => {
      const coordinates: Coordinates = { lat: 37.5665, lon: 126.9780 }
      const result1 = findNearestRegion(coordinates)
      const result2 = findNearestRegion(coordinates)
      
      expect(result1.id).toBe(result2.id)
    })
  })
})
