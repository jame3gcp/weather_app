import { 
  formatTemperature, 
  formatWindSpeed, 
  getWindDirection, 
  formatTime,
  formatPrecipitation 
} from '@/lib/utils/format'

describe('Format Utilities', () => {
  describe('formatTemperature', () => {
    it('should format celsius temperature correctly', () => {
      expect(formatTemperature(25, 'celsius')).toBe('25°C')
      expect(formatTemperature(0, 'celsius')).toBe('0°C')
      expect(formatTemperature(-10, 'celsius')).toBe('-10°C')
      expect(formatTemperature(37.5, 'celsius')).toBe('37.5°C')
    })

    it('should format fahrenheit temperature correctly', () => {
      expect(formatTemperature(25, 'fahrenheit')).toBe('77°F')
      expect(formatTemperature(0, 'fahrenheit')).toBe('32°F')
      expect(formatTemperature(-10, 'fahrenheit')).toBe('14°F')
      expect(formatTemperature(37.5, 'fahrenheit')).toBe('99.5°F')
    })

    it('should handle decimal precision', () => {
      expect(formatTemperature(25.123, 'celsius')).toBe('25.1°C')
      expect(formatTemperature(25.678, 'fahrenheit')).toBe('78.2°F')
    })

    it('should handle extreme temperatures', () => {
      expect(formatTemperature(100, 'celsius')).toBe('100°C')
      expect(formatTemperature(-50, 'celsius')).toBe('-50°C')
      expect(formatTemperature(100, 'fahrenheit')).toBe('212°F')
      expect(formatTemperature(-50, 'fahrenheit')).toBe('-58°F')
    })
  })

  describe('formatWindSpeed', () => {
    it('should format m/s correctly', () => {
      expect(formatWindSpeed(5, 'ms')).toBe('5 m/s')
      expect(formatWindSpeed(0, 'ms')).toBe('0 m/s')
      expect(formatWindSpeed(25.5, 'ms')).toBe('25.5 m/s')
    })

    it('should format km/h correctly', () => {
      expect(formatWindSpeed(5, 'kmh')).toBe('18 km/h')
      expect(formatWindSpeed(0, 'kmh')).toBe('0 km/h')
      expect(formatWindSpeed(25.5, 'kmh')).toBe('91.8 km/h')
    })

    it('should format mph correctly', () => {
      expect(formatWindSpeed(5, 'mph')).toBe('11.2 mph')
      expect(formatWindSpeed(0, 'mph')).toBe('0 mph')
      expect(formatWindSpeed(25.5, 'mph')).toBe('57.0 mph')
    })

    it('should handle decimal precision', () => {
      expect(formatWindSpeed(5.123, 'ms')).toBe('5.1 m/s')
      expect(formatWindSpeed(5.678, 'kmh')).toBe('20.4 km/h')
      expect(formatWindSpeed(5.789, 'mph')).toBe('12.9 mph')
    })

    it('should handle zero and negative values', () => {
      expect(formatWindSpeed(0, 'ms')).toBe('0 m/s')
      expect(formatWindSpeed(-5, 'ms')).toBe('0 m/s') // Should clamp to 0
    })
  })

  describe('getWindDirection', () => {
    it('should return correct cardinal directions', () => {
      expect(getWindDirection(0)).toBe('N')    // North
      expect(getWindDirection(90)).toBe('E')   // East
      expect(getWindDirection(180)).toBe('S')  // South
      expect(getWindDirection(270)).toBe('W')  // West
    })

    it('should return correct intercardinal directions', () => {
      expect(getWindDirection(45)).toBe('NE')  // Northeast
      expect(getWindDirection(135)).toBe('SE') // Southeast
      expect(getWindDirection(225)).toBe('SW') // Southwest
      expect(getWindDirection(315)).toBe('NW') // Northwest
    })

    it('should handle edge cases', () => {
      expect(getWindDirection(22.5)).toBe('N')
      expect(getWindDirection(67.5)).toBe('NE')
      expect(getWindDirection(112.5)).toBe('E')
      expect(getWindDirection(157.5)).toBe('SE')
      expect(getWindDirection(202.5)).toBe('S')
      expect(getWindDirection(247.5)).toBe('SW')
      expect(getWindDirection(292.5)).toBe('W')
      expect(getWindDirection(337.5)).toBe('NW')
    })

    it('should handle negative degrees', () => {
      expect(getWindDirection(-45)).toBe('NW')
      expect(getWindDirection(-90)).toBe('W')
      expect(getWindDirection(-180)).toBe('S')
    })

    it('should handle degrees above 360', () => {
      expect(getWindDirection(405)).toBe('NE')
      expect(getWindDirection(720)).toBe('N')
    })
  })

  describe('formatTime', () => {
    const testDate = new Date('2024-01-15T14:30:00Z')

    it('should format time in Korean locale', () => {
      const result = formatTime(testDate.toISOString(), 'ko')
      expect(result).toMatch(/\d{1,2}:\d{2}/) // Should contain time format
    })

    it('should format time in English locale', () => {
      const result = formatTime(testDate.toISOString(), 'en')
      expect(result).toMatch(/\d{1,2}:\d{2}/) // Should contain time format
    })

    it('should handle different date formats', () => {
      const isoString = '2024-01-15T14:30:00.000Z'
      const dateString = '2024-01-15T14:30:00'
      
      expect(formatTime(isoString, 'ko')).toBeDefined()
      expect(formatTime(dateString, 'ko')).toBeDefined()
    })

    it('should handle invalid date strings gracefully', () => {
      expect(() => formatTime('invalid-date', 'ko')).not.toThrow()
      expect(formatTime('invalid-date', 'ko')).toBe('Invalid Date')
    })

    it('should handle empty string', () => {
      expect(() => formatTime('', 'ko')).not.toThrow()
      expect(formatTime('', 'ko')).toBe('Invalid Date')
    })
  })

  describe('formatPrecipitation', () => {
    it('should format mm correctly', () => {
      expect(formatPrecipitation(5, 'mm')).toBe('5 mm')
      expect(formatPrecipitation(0, 'mm')).toBe('0 mm')
      expect(formatPrecipitation(25.5, 'mm')).toBe('25.5 mm')
    })

    it('should format inches correctly', () => {
      expect(formatPrecipitation(5, 'in')).toBe('0.2 in')
      expect(formatPrecipitation(0, 'in')).toBe('0 in')
      expect(formatPrecipitation(25.5, 'in')).toBe('1.0 in')
    })

    it('should handle decimal precision', () => {
      expect(formatPrecipitation(5.123, 'mm')).toBe('5.1 mm')
      expect(formatPrecipitation(5.678, 'in')).toBe('0.2 in')
    })

    it('should handle zero and negative values', () => {
      expect(formatPrecipitation(0, 'mm')).toBe('0 mm')
      expect(formatPrecipitation(-5, 'mm')).toBe('0 mm') // Should clamp to 0
    })

    it('should handle large values', () => {
      expect(formatPrecipitation(1000, 'mm')).toBe('1000 mm')
      expect(formatPrecipitation(1000, 'in')).toBe('39.4 in')
    })
  })
})
