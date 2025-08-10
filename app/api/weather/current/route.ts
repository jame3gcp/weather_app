import { NextRequest, NextResponse } from 'next/server';
import { createCacheKey, memoryCache } from '@/lib/cache';

// 환경 변수 (실제 구현 시 .env 파일에서 가져와야 함)
const WEATHER_API_BASE = process.env.WEATHER_API_BASE || 'https://api.openweathermap.org/data/3.0';
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || 'YOUR_API_KEY';
const CACHE_TTL_SECONDS = parseInt(process.env.CACHE_TTL_SECONDS || '600', 10);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const units = searchParams.get('units') || 'metric';
    const lang = searchParams.get('lang') || 'ko';
    
    // 필수 파라미터 검증
    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Missing required parameters: lat, lon' },
        { status: 400 }
      );
    }
    
    // 캐시 키 생성
    const cacheKey = createCacheKey('/api/weather/current', { lat, lon, units, lang });
    
    // 캐시 확인
    const cachedData = memoryCache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }
    
    // OpenWeather API 호출 (실제 구현 필요)
    const apiUrl = `${WEATHER_API_BASE}/onecall?lat=${lat}&lon=${lon}&units=${units}&lang=${lang}&appid=${WEATHER_API_KEY}&exclude=minutely,hourly,daily,alerts`;
    
    // 실제 API 호출 대신 임시 데이터 반환 (실제 구현 시 수정 필요)
    const mockResponse = {
      location: {
        name: 'Seoul',
        lat: parseFloat(lat),
        lon: parseFloat(lon)
      },
      updatedAt: new Date().toISOString(),
      data: {
        temp: 22.5,
        feelsLike: 23.1,
        humidity: 65,
        windSpeed: 2.1,
        windDeg: 120,
        condition: 'Clear',
        icon: '01d',
        pressure: 1012,
        visibility: 10000,
        updatedAt: new Date().toISOString()
      }
    };
    
    // 캐시에 저장
    memoryCache.set(cacheKey, mockResponse, CACHE_TTL_SECONDS);
    
    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('현재 날씨 조회 오류:', error);
    
    return NextResponse.json(
      { 
        code: 'SERVER_ERROR', 
        message: '날씨 정보를 가져오는 중 오류가 발생했습니다.',
        traceId: Date.now().toString()
      },
      { status: 500 }
    );
  }
} 