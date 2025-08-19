import { NextRequest, NextResponse } from 'next/server';
import { createCacheKey, memoryCache } from '@/lib/cache';
import { envConfig } from '@/lib/env';

// 환경 변수 (직접 파일 읽기 방식)
const WEATHER_API_BASE = envConfig.WEATHER_API_BASE;
const WEATHER_API_KEY = envConfig.WEATHER_API_KEY;
const CACHE_TTL_SECONDS = envConfig.CACHE_TTL_SECONDS;

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
    
    // API 키 확인
    if (!WEATHER_API_KEY || WEATHER_API_KEY.length < 10) {
      console.warn('OpenWeatherMap API 키가 설정되지 않았습니다. Mock 데이터를 반환합니다.');
      
      // API 키가 없을 때 임시 데이터 반환 (개발용)
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
    }
    
    try {
      // Current Weather API 호출
      const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&lang=${lang}&appid=${WEATHER_API_KEY}`;
      
      console.log(`OpenWeatherMap API 호출: ${apiUrl.replace(WEATHER_API_KEY, 'API_KEY_HIDDEN')}`);
      
      const apiResponse = await fetch(apiUrl);
      
      if (!apiResponse.ok) {
        throw new Error(`OpenWeatherMap API 오류: ${apiResponse.status} ${apiResponse.statusText}`);
      }
      
      const apiData = await apiResponse.json();
      
      // API 응답을 우리 형식으로 변환
      const transformedResponse = {
        location: {
          name: apiData.name || 'Seoul',
          lat: parseFloat(lat),
          lon: parseFloat(lon)
        },
        updatedAt: new Date().toISOString(),
        data: {
          temp: apiData.main.temp,
          feelsLike: apiData.main.feels_like,
          humidity: apiData.main.humidity,
          windSpeed: apiData.wind.speed,
          windDeg: apiData.wind.deg,
          condition: apiData.weather[0].main,
          icon: apiData.weather[0].icon,
          pressure: apiData.main.pressure,
          visibility: apiData.visibility || 10000,
          updatedAt: new Date().toISOString()
        }
      };
      
      // 캐시에 저장
      memoryCache.set(cacheKey, transformedResponse, CACHE_TTL_SECONDS);
      
      return NextResponse.json(transformedResponse);
      
    } catch (apiError) {
      console.error('OpenWeatherMap API 호출 실패:', apiError);
      
      // API 호출 실패 시 에러 응답
      return NextResponse.json(
        { 
          code: 'API_ERROR', 
          message: 'OpenWeatherMap API 호출에 실패했습니다. API 키를 확인해주세요.',
          error: apiError instanceof Error ? apiError.message : 'Unknown error'
        },
        { status: 502 }
      );
    }
    
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