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
    
    // OpenWeather API 호출 (실제 구현 필요)
    const apiUrl = `${WEATHER_API_BASE}/onecall?lat=${lat}&lon=${lon}&units=${units}&lang=${lang}&appid=${WEATHER_API_KEY}&exclude=minutely,current,daily,alerts`;
    
    // 실제 API 호출 대신 임시 데이터 생성 (실제 구현 시 수정 필요)
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