import { createCacheKey, memoryCache } from '@/lib/cache'

describe('Cache Utilities', () => {
  beforeEach(() => {
    memoryCache.clear()
  })

  describe('createCacheKey', () => {
    it('should create consistent cache keys for same parameters', () => {
      const params1 = { lat: 37.5665, lon: 126.9780, units: 'metric' }
      const params2 = { lat: 37.5665, lon: 126.9780, units: 'metric' }
      
      const key1 = createCacheKey('/api/weather/current', params1)
      const key2 = createCacheKey('/api/weather/current', params2)
      
      expect(key1).toBe(key2)
    })

    it('should create different keys for different parameters', () => {
      const params1 = { lat: 37.5665, lon: 126.9780, units: 'metric' }
      const params2 = { lat: 37.5665, lon: 126.9780, units: 'imperial' }
      
      const key1 = createCacheKey('/api/weather/current', params1)
      const key2 = createCacheKey('/api/weather/current', params2)
      
      expect(key1).not.toBe(key2)
    })

    it('should handle empty parameters', () => {
      const key = createCacheKey('/api/weather/current', {})
      expect(key).toBe('/api/weather/current?')
    })

    it('should sort parameters alphabetically', () => {
      const params = { lon: 126.9780, lat: 37.5665, units: 'metric' }
      const key = createCacheKey('/api/weather/current', params)
      
      expect(key).toBe('/api/weather/current?lat=37.5665&lon=126.978&units=metric')
    })
  })

  describe('MemoryCache', () => {
    it('should store and retrieve data', () => {
      const testData = { temperature: 25, condition: 'sunny' }
      const key = 'test-key'
      
      memoryCache.set(key, testData, 60)
      const retrieved = memoryCache.get(key)
      
      expect(retrieved).toEqual(testData)
    })

    it('should return null for non-existent keys', () => {
      const retrieved = memoryCache.get('non-existent')
      expect(retrieved).toBeNull()
    })

    it('should handle data expiration', () => {
      const testData = { temperature: 25 }
      const key = 'expire-test'
      
      // Set with 1 second TTL
      memoryCache.set(key, testData, 1)
      
      // Should still exist immediately
      expect(memoryCache.get(key)).toEqual(testData)
      
      // Wait for expiration
      setTimeout(() => {
        expect(memoryCache.get(key)).toBeNull()
      }, 1100)
    })

    it('should delete specific keys', () => {
      const key1 = 'key1'
      const key2 = 'key2'
      
      memoryCache.set(key1, 'data1', 60)
      memoryCache.set(key2, 'data2', 60)
      
      memoryCache.delete(key1)
      
      expect(memoryCache.get(key1)).toBeNull()
      expect(memoryCache.get(key2)).toEqual('data2')
    })

    it('should clear all cached data', () => {
      memoryCache.set('key1', 'data1', 60)
      memoryCache.set('key2', 'data2', 60)
      
      memoryCache.clear()
      
      expect(memoryCache.get('key1')).toBeNull()
      expect(memoryCache.get('key2')).toBeNull()
    })

    it('should handle different data types', () => {
      const stringData = 'string data'
      const numberData = 42
      const objectData = { key: 'value' }
      const arrayData = [1, 2, 3]
      
      memoryCache.set('string', stringData, 60)
      memoryCache.set('number', numberData, 60)
      memoryCache.set('object', objectData, 60)
      memoryCache.set('array', arrayData, 60)
      
      expect(memoryCache.get('string')).toBe(stringData)
      expect(memoryCache.get('number')).toBe(numberData)
      expect(memoryCache.get('object')).toEqual(objectData)
      expect(memoryCache.get('array')).toEqual(arrayData)
    })
  })
})
