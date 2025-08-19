import { NextRequest, NextResponse } from 'next/server';
import { createCacheKey, memoryCache } from '@/lib/cache';
import { envConfig } from '@/lib/env';

// 환경 변수 (직접 파일 읽기 방식)
const WEATHER_API_KEY = envConfig.WEATHER_API_KEY;
const CACHE_TTL_SECONDS = envConfig.CACHE_TTL_SECONDS;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const hours = parseInt(searchParams.get('hours') || '24', 10);
    const units = searchParams.get('units') || 'metric';
    const lang = searchParams.get('lang') || 'ko';
    
    // 필수 파라미터 검증
    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Missing required parameters: lat, lon' },
        { status: 400 }
      );
    }
    
    // 시간 제한
    const validHours = Math.min(Math.max(1, hours), 48);
    
    // 캐시 키 생성
    const cacheKey = createCacheKey('/api/weather/hourly', { lat, lon, hours: validHours, units, lang });
    
    // 캐시 확인
    const cachedData = memoryCache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }
    
    // API 키 확인
    if (!WEATHER_API_KEY || WEATHER_API_KEY.length < 10) {
      console.warn('OpenWeatherMap API 키가 설정되지 않았습니다. Mock 데이터를 반환합니다.');
      
      // API 키가 없을 때 임시 데이터 반환 (개발용)
      const mockData = Array.from({ length: validHours }, (_, i) => {
        const time = new Date();
        time.setHours(time.getHours() + i);
        
        return {
          time: time.toISOString(),
          temp: 20 + Math.random() * 10, // 20~30도 사이 랜덤 온도
          pop: Math.random() * 0.5, // 0~50% 강수확률
          icon: ['01d', '02d', '03d', '04d', '10d'][Math.floor(Math.random() * 5)], // 랜덤 아이콘
          condition: ['맑음', '구름 조금', '구름 많음', '흐림', '비'][Math.floor(Math.random() * 5)] // 랜덤 날씨 상태
        };
      });
      
      const mockResponse = {
        location: {
          name: 'Seoul',
          lat: parseFloat(lat),
          lon: parseFloat(lon)
        },
        updatedAt: new Date().toISOString(),
        data: mockData
      };
      
      // 캐시에 저장
      memoryCache.set(cacheKey, mockResponse, CACHE_TTL_SECONDS);
      return NextResponse.json(mockResponse);
    }
    
    try {
      // 5 Day / 3 Hour Forecast API 사용
      const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&lang=${lang}&appid=${WEATHER_API_KEY}`;
      
      console.log(`OpenWeatherMap Hourly API 호출: ${apiUrl.replace(WEATHER_API_KEY, 'API_KEY_HIDDEN')}`);
      
      const apiResponse = await fetch(apiUrl);
      
      if (!apiResponse.ok) {
        throw new Error(`OpenWeatherMap API 오류: ${apiResponse.status} ${apiResponse.statusText}`);
      }
      
      const apiData = await apiResponse.json();
      
      // API 응답을 우리 형식으로 변환 (3시간 간격 데이터를 1시간 간격으로 보간)
      const transformedData = [];
      const list = apiData.list || [];
      
      for (let i = 0; i < Math.min(validHours, list.length); i++) {
        const item = list[i];
        transformedData.push({
          time: item.dt_txt,
          temp: item.main.temp,
          pop: item.pop, // 강수확률 (0~1)
          icon: item.weather[0].icon,
          condition: item.weather[0].main
        });
      }
      
      const transformedResponse = {
        location: {
          name: apiData.city?.name || 'Seoul',
          lat: parseFloat(lat),
          lon: parseFloat(lon)
        },
        updatedAt: new Date().toISOString(),
        data: transformedData
      };
      
      // 캐시에 저장
      memoryCache.set(cacheKey, transformedResponse, CACHE_TTL_SECONDS);
      
      return NextResponse.json(transformedResponse);
      
    } catch (apiError) {
      console.error('OpenWeatherMap Hourly API 호출 실패:', apiError);
      
      // API 호출 실패 시 에러 응답
      return NextResponse.json(
        { 
          code: 'API_ERROR', 
          message: 'OpenWeatherMap Hourly API 호출에 실패했습니다. API 키를 확인해주세요.',
          error: apiError instanceof Error ? apiError.message : 'Unknown error'
        },
        { status: 502 }
      );
    }
    
  } catch (error) {
    console.error('시간별 예보 조회 오류:', error);
    
    return NextResponse.json(
      { 
        code: 'SERVER_ERROR', 
        message: '시간별 예보를 가져오는 중 오류가 발생했습니다.',
        traceId: Date.now().toString()
      },
      { status: 500 }
    );
  }
} 