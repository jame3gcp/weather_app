import { GET } from '@/app/api/weather/current/route'

// Mock environment variables
const originalEnv = process.env

beforeEach(() => {
  jest.resetModules()
  process.env = { ...originalEnv }
  process.env.WEATHER_API_BASE = 'https://api.openweathermap.org/data/3.0'
  process.env.WEATHER_API_KEY = 'test-api-key'
  process.env.CACHE_TTL_SECONDS = '600'
})

afterEach(() => {
  process.env = originalEnv
})

describe('GET /api/weather/current', () => {
  it('should return 400 for missing lat parameter', async () => {
    const request = new NextRequest('http://localhost:3000/api/weather/current?lon=126.9780')
    
    const response = await GET(request)
    
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Missing required parameters: lat, lon')
  })

  it('should return 400 for missing lon parameter', async () => {
    const request = new NextRequest('http://localhost:3000/api/weather/current?lat=37.5665')
    
    const response = await GET(request)
    
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Missing required parameters: lat, lon')
  })

  it('should return 400 for missing both lat and lon parameters', async () => {
    const request = new NextRequest('http://localhost:3000/api/weather/current')
    
    const response = await GET(request)
    
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Missing required parameters: lat, lon')
  })

  it('should return 200 with weather data for valid coordinates', async () => {
    const request = new NextRequest('http://localhost:3000/api/weather/current?lat=37.5665&lon=126.9780')
    
    const response = await GET(request)
    
    expect(response.status).toBe(200)
    const data = await response.json()
    
    expect(data).toHaveProperty('location')
    expect(data).toHaveProperty('updatedAt')
    expect(data).toHaveProperty('data')
    
    expect(data.location).toHaveProperty('name')
    expect(data.location).toHaveProperty('lat')
    expect(data.location).toHaveProperty('lon')
    
    expect(data.data).toHaveProperty('temp')
    expect(data.data).toHaveProperty('feelsLike')
    expect(data.data).toHaveProperty('humidity')
    expect(data.data).toHaveProperty('windSpeed')
    expect(data.data).toHaveProperty('windDeg')
    expect(data.data).toHaveProperty('condition')
    expect(data.data).toHaveProperty('icon')
    expect(data.data).toHaveProperty('pressure')
    expect(data.data).toHaveProperty('visibility')
    expect(data.data).toHaveProperty('updatedAt')
  })

  it('should use default units when not specified', async () => {
    const request = new NextRequest('http://localhost:3000/api/weather/current?lat=37.5665&lon=126.9780')
    
    const response = await GET(request)
    
    expect(response.status).toBe(200)
    const data = await response.json()
    
    // Should use metric units by default
    expect(data.data.temp).toBeGreaterThanOrEqual(-50)
    expect(data.data.temp).toBeLessThanOrEqual(50)
  })

  it('should use specified units parameter', async () => {
    const request = new NextRequest('http://localhost:3000/api/weather/current?lat=37.5665&lon=126.9780&units=imperial')
    
    const response = await GET(request)
    
    expect(response.status).toBe(200)
    const data = await response.json()
    
    // Should use imperial units
    expect(data.data.temp).toBeGreaterThanOrEqual(-58)
    expect(data.data.temp).toBeLessThanOrEqual(122)
  })

  it('should use default language when not specified', async () => {
    const request = new NextRequest('http://localhost:3000/api/weather/current?lat=37.5665&lon=126.9780')
    
    const response = await GET(request)
    
    expect(response.status).toBe(200)
    const data = await response.json()
    
    // Should use Korean language by default
    expect(data.data.condition).toBeDefined()
  })

  it('should use specified language parameter', async () => {
    const request = new NextRequest('http://localhost:3000/api/weather/current?lat=37.5665&lon=126.9780&lang=en')
    
    const response = await GET(request)
    
    expect(response.status).toBe(200)
    const data = await response.json()
    
    // Should use English language
    expect(data.data.condition).toBeDefined()
  })

  it('should return valid coordinate values', async () => {
    const lat = 37.5665
    const lon = 126.9780
    const request = new NextRequest(`http://localhost:3000/api/weather/current?lat=${lat}&lon=${lon}`)
    
    const response = await GET(request)
    
    expect(response.status).toBe(200)
    const data = await response.json()
    
    expect(data.location.lat).toBe(lat)
    expect(data.location.lon).toBe(lon)
  })

  it('should return valid temperature range', async () => {
    const request = new NextRequest('http://localhost:3000/api/weather/current?lat=37.5665&lon=126.9780')
    
    const response = await GET(request)
    
    expect(response.status).toBe(200)
    const data = await response.json()
    
    // Temperature should be in reasonable range for Earth
    expect(data.data.temp).toBeGreaterThanOrEqual(-90)
    expect(data.data.temp).toBeLessThanOrEqual(60)
  })

  it('should return valid humidity range', async () => {
    const request = new NextRequest('http://localhost:3000/api/weather/current?lat=37.5665&lon=126.9780')
    
    const response = await GET(request)
    
    expect(response.status).toBe(200)
    const data = await response.json()
    
    // Humidity should be between 0 and 100
    expect(data.data.humidity).toBeGreaterThanOrEqual(0)
    expect(data.data.humidity).toBeLessThanOrEqual(100)
  })

  it('should return valid wind speed range', async () => {
    const request = new NextRequest('http://localhost:3000/api/weather/current?lat=37.5665&lon=126.9780')
    
    const response = await GET(request)
    
    expect(response.status).toBe(200)
    const data = await response.json()
    
    // Wind speed should be reasonable
    expect(data.data.windSpeed).toBeGreaterThanOrEqual(0)
    expect(data.data.windSpeed).toBeLessThanOrEqual(200)
  })

  it('should return valid wind direction range', async () => {
    const request = new NextRequest('http://localhost:3000/api/weather/current?lat=37.5665&lon=126.9780')
    
    const response = await GET(request)
    
    expect(response.status).toBe(200)
    const data = await response.json()
    
    // Wind direction should be between 0 and 360 degrees
    expect(data.data.windDeg).toBeGreaterThanOrEqual(0)
    expect(data.data.windDeg).toBeLessThanOrEqual(360)
  })

  it('should return valid pressure range', async () => {
    const request = new NextRequest('http://localhost:3000/api/weather/current?lat=37.5665&lon=126.9780')
    
    const response = await GET(request)
    
    expect(response.status).toBe(200)
    const data = await response.json()
    
    // Pressure should be reasonable atmospheric pressure
    expect(data.data.pressure).toBeGreaterThanOrEqual(800)
    expect(data.data.pressure).toBeLessThanOrEqual(1200)
  })

  it('should return valid visibility range', async () => {
    const request = new NextRequest('http://localhost:3000/api/weather/current?lat=37.5665&lon=126.9780')
    
    const response = await GET(request)
    
    expect(response.status).toBe(200)
    const data = await response.json()
    
    // Visibility should be reasonable
    expect(data.data.visibility).toBeGreaterThanOrEqual(0)
    expect(data.data.visibility).toBeLessThanOrEqual(10000)
  })

  it('should return valid updatedAt timestamp', async () => {
    const request = new NextRequest('http://localhost:3000/api/weather/current?lat=37.5665&lon=126.9780')
    
    const response = await GET(request)
    
    expect(response.status).toBe(200)
    const data = await response.json()
    
    // updatedAt should be a valid date string
    expect(() => new Date(data.data.updatedAt)).not.toThrow()
    expect(new Date(data.data.updatedAt).getTime()).toBeGreaterThan(0)
  })

  it('should handle decimal coordinates', async () => {
    const lat = 37.123456
    const lon = 126.789012
    const request = new NextRequest(`http://localhost:3000/api/weather/current?lat=${lat}&lon=${lon}`)
    
    const response = await GET(request)
    
    expect(response.status).toBe(200)
    const data = await response.json()
    
    expect(data.location.lat).toBe(lat)
    expect(data.location.lon).toBe(lon)
  })

  it('should handle negative coordinates', async () => {
    const lat = -37.5665
    const lon = -126.9780
    const request = new NextRequest(`http://localhost:3000/api/weather/current?lat=${lat}&lon=${lon}`)
    
    const response = await GET(request)
    
    expect(response.status).toBe(200)
    const data = await response.json()
    
    expect(data.location.lat).toBe(lat)
    expect(data.location.lon).toBe(lon)
  })
})
