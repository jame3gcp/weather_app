import { NextRequest, NextResponse } from 'next/server';
import { createCacheKey, memoryCache } from '@/lib/cache';
import { envConfig } from '@/lib/env';

// 환경 변수 (직접 파일 읽기 방식)
const WEATHER_API_KEY = envConfig.WEATHER_API_KEY;
const CACHE_TTL_SECONDS = envConfig.CACHE_TTL_SECONDS;

interface DailyDataItem {
  date: string;
  min: number;
  max: number;
  temps: number[];
  pops: number[];
  icons: string[];
  conditions: string[];
  humidities: number[];
}

interface ForecastItem {
  dt_txt: string;
  main: {
    temp: number;
    humidity: number;
  };
  pop: number;
  weather: Array<{
    icon: string;
    main: string;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const days = parseInt(searchParams.get('days') || '7', 10);
    const units = searchParams.get('units') || 'metric';
    const lang = searchParams.get('lang') || 'ko';
    
    // 필수 파라미터 검증
    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Missing required parameters: lat, lon' },
        { status: 400 }
      );
    }
    
    // 일수 제한
    const validDays = Math.min(Math.max(1, days), 7);
    
    // 캐시 키 생성
    const cacheKey = createCacheKey('/api/weather/daily', { lat, lon, days: validDays, units, lang });
    
    // 캐시 확인
    const cachedData = memoryCache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }
    
    // API 키 확인
    if (!WEATHER_API_KEY || WEATHER_API_KEY.length < 10) {
      console.warn('OpenWeatherMap API 키가 설정되지 않았습니다. Mock 데이터를 반환합니다.');
      
      // API 키가 없을 때 임시 데이터 반환 (개발용)
      const mockData = Array.from({ length: validDays }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        
        const minTemp = 15 + Math.random() * 5; // 15~20도 사이 랜덤 최저 기온
        const maxTemp = 25 + Math.random() * 5; // 25~30도 사이 랜덤 최고 기온
        
        // 일출, 일몰 시간 설정
        const sunrise = new Date(date);
        sunrise.setHours(6, Math.floor(Math.random() * 30), 0);
        
        const sunset = new Date(date);
        sunset.setHours(19, Math.floor(Math.random() * 30), 0);
        
        return {
          date: date.toISOString().split('T')[0],
          min: minTemp,
          max: maxTemp,
          pop: Math.random() * 0.7, // 0~70% 강수확률
          icon: ['01d', '02d', '03d', '04d', '10d'][Math.floor(Math.random() * 5)], // 랜덤 아이콘
          condition: ['맑음', '구름 조금', '구름 많음', '흐림', '비'][Math.floor(Math.random() * 5)], // 랜덤 날씨 상태
          sunrise: sunrise.toISOString(),
          sunset: sunset.toISOString(),
          humidity: 40 + Math.floor(Math.random() * 40) // 40~80% 습도
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
      // 5 Day / 3 Hour Forecast API 사용하여 일별 데이터 추출
      const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&lang=${lang}&appid=${WEATHER_API_KEY}`;
      
      console.log(`OpenWeatherMap Daily API 호출: ${apiUrl.replace(WEATHER_API_KEY, 'API_KEY_HIDDEN')}`);
      
      const apiResponse = await fetch(apiUrl);
      
      if (!apiResponse.ok) {
        throw new Error(`OpenWeatherMap API 오류: ${apiResponse.status} ${apiResponse.statusText}`);
      }
      
      const apiData = await apiResponse.json();
      
      // 3시간 간격 데이터를 일별로 그룹화하여 최고/최저 기온 계산
      const dailyData: Record<string, DailyDataItem> = {};
      const list: ForecastItem[] = apiData.list || [];
      
      list.forEach((item: ForecastItem) => {
        const date = item.dt_txt.split(' ')[0]; // YYYY-MM-DD 형식
        const temp = item.main.temp;
        const pop = item.pop;
        const icon = item.weather[0].icon;
        const condition = item.weather[0].main;
        const humidity = item.main.humidity;
        
        if (!dailyData[date]) {
          dailyData[date] = {
            date: date,
            min: temp,
            max: temp,
            temps: [temp],
            pops: [pop],
            icons: [icon],
            conditions: [condition],
            humidities: [humidity]
          };
        } else {
          dailyData[date].temps.push(temp);
          dailyData[date].pops.push(pop);
          dailyData[date].icons.push(icon);
          dailyData[date].conditions.push(condition);
          dailyData[date].humidities.push(humidity);
          
          dailyData[date].min = Math.min(dailyData[date].min, temp);
          dailyData[date].max = Math.max(dailyData[date].max, temp);
        }
      });
      
      // 일별 데이터를 배열로 변환하고 날짜순으로 정렬
      const transformedData = Object.values(dailyData)
        .sort((a: DailyDataItem, b: DailyDataItem) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, validDays)
        .map((day: DailyDataItem) => ({
          date: day.date,
          min: day.min,
          max: day.max,
          pop: Math.max(...day.pops), // 해당 날의 최대 강수확률
          icon: day.icons[Math.floor(day.icons.length / 2)], // 중간 시간대 아이콘
          condition: day.conditions[Math.floor(day.conditions.length / 2)], // 중간 시간대 날씨 상태
          sunrise: new Date().toISOString(), // API에서 제공하지 않으므로 현재 시간 사용
          sunset: new Date().toISOString(), // API에서 제공하지 않으므로 현재 시간 사용
          humidity: Math.round(day.humidities.reduce((a: number, b: number) => a + b, 0) / day.humidities.length) // 평균 습도
        }));
      
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
      console.error('OpenWeatherMap Daily API 호출 실패:', apiError);
      
      // API 호출 실패 시 에러 응답
      return NextResponse.json(
        { 
          code: 'API_ERROR', 
          message: 'OpenWeatherMap Daily API 호출에 실패했습니다. API 키를 확인해주세요.',
          error: apiError instanceof Error ? apiError.message : 'Unknown error'
        },
        { status: 502 }
      );
    }
    
  } catch (error) {
    console.error('일별 예보 조회 오류:', error);
    
    return NextResponse.json(
      { 
        code: 'SERVER_ERROR', 
        message: '일별 예보를 가져오는 중 오류가 발생했습니다.',
        traceId: Date.now().toString()
      },
      { status: 500 }
    );
  }
} 