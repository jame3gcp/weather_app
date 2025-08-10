'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useWeatherStore } from '@/lib/stores/weather';
import { getCurrentWeather } from '@/lib/weather-client';
import { CurrentWeather } from '@/types/weather.types';
import { usePreferences } from '@/lib/stores/preferences';
import { 
  formatTemperature, 
  formatWindSpeed, 
  getWindDirection, 
  formatTime 
} from '@/lib/utils/format';

interface CurrentWeatherCardProps {
  lat: number;
  lon: number;
}

export default function CurrentWeatherCard({ lat, lon }: CurrentWeatherCardProps) {
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { units, unitPreferences, language } = usePreferences();
  
  // 현재 날씨 데이터 가져오기
  useEffect(() => {
    const fetchWeather = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/weather/current?lat=${lat}&lon=${lon}&units=${units}&lang=${language}`);
        
        if (!response.ok) {
          throw new Error(`날씨 정보를 가져오는데 실패했습니다. (${response.status})`);
        }
        
        const data = await response.json();
        setWeather(data.data as CurrentWeather);
      } catch (err) {
        console.error('현재 날씨 데이터 가져오기 오류:', err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWeather();
  }, [lat, lon, units, language]);
  
  // 로딩 상태 표시
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // 오류 상태 표시
  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-500">날씨 정보를 가져올 수 없습니다</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500" role="alert">{error}</p>
          <button 
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded-md"
            onClick={() => window.location.reload()}
            aria-label="다시 시도하기"
          >
            다시 시도
          </button>
        </CardContent>
      </Card>
    );
  }
  
  // 날씨 정보가 없는 경우
  if (!weather) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>날씨 정보 없음</CardTitle>
        </CardHeader>
        <CardContent>
          <p role="status">날씨 정보를 찾을 수 없습니다.</p>
        </CardContent>
      </Card>
    );
  }
  
  // 날씨 아이콘 매핑 (간단한 구현)
  const getWeatherIcon = (iconCode: string) => {
    const iconMap: Record<string, string> = {
      '01d': '☀️', // 맑음 (낮)
      '01n': '🌙', // 맑음 (밤)
      '02d': '🌤️', // 구름 조금 (낮)
      '02n': '☁️', // 구름 조금 (밤)
      '03d': '☁️', // 구름 많음
      '03n': '☁️',
      '04d': '☁️', // 흐림
      '04n': '☁️',
      '09d': '🌧️', // 소나기
      '09n': '🌧️',
      '10d': '🌦️', // 비 (낮)
      '10n': '🌧️', // 비 (밤)
      '11d': '⛈️', // 천둥번개
      '11n': '⛈️',
      '13d': '❄️', // 눈
      '13n': '❄️',
      '50d': '🌫️', // 안개
      '50n': '🌫️',
    };
    
    return iconMap[iconCode] || '🌡️';
  };
  
  // 날씨 테마 색상 매핑 (배경 그라데이션)
  const getThemeGradient = (iconCode: string, condition: string) => {
    // 대표 색상: 맑음(하늘/해), 흐림(그레이), 비(블루), 눈(라이트 블루), 천둥(퍼플), 안개(중성)
    const map: Record<string, { from: string; to: string }> = {
      clear: { from: '#FDE68A', to: '#60A5FA' }, // sunny yellow → sky blue
      clouds: { from: '#CBD5E1', to: '#94A3B8' }, // slate grays
      rain: { from: '#60A5FA', to: '#2563EB' }, // blues
      drizzle: { from: '#93C5FD', to: '#3B82F6' },
      thunder: { from: '#A78BFA', to: '#4F46E5' }, // purple/indigo
      snow: { from: '#E0F2FE', to: '#93C5FD' }, // light blue
      mist: { from: '#E5E7EB', to: '#9CA3AF' }, // gray
    };
    const i = iconCode || '';
    const c = (condition || '').toLowerCase();
    const key =
      c.includes('snow') || i.startsWith('13')
        ? 'snow'
        : c.includes('thunder') || i.startsWith('11')
        ? 'thunder'
        : c.includes('drizzle')
        ? 'drizzle'
        : c.includes('rain') || i.startsWith('09') || i.startsWith('10')
        ? 'rain'
        : c.includes('cloud') || i.startsWith('02') || i.startsWith('03') || i.startsWith('04')
        ? 'clouds'
        : c.includes('mist') || c.includes('fog') || i.startsWith('50')
        ? 'mist'
        : 'clear';
    const g = map[key];
    return `linear-gradient(135deg, ${g.from}, ${g.to})`;
  };
  
  return (
    <Card className="relative overflow-hidden">
      {/* 동적 날씨 배경 그라데이션 */}
      <div
        className="absolute inset-0 opacity-60 pointer-events-none"
        style={{ background: getThemeGradient(weather.icon, weather.condition) }}
        aria-hidden
      />
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center justify-between">
          <span>현재 날씨</span>
          <span className="text-2xl" role="img" aria-label={weather.condition}>
            {getWeatherIcon(weather.icon)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="grid grid-cols-2 gap-4 bg-white/70 backdrop-blur-sm rounded-lg p-4">
          <div>
            <p className="text-4xl font-bold">
              {formatTemperature(weather.temp, unitPreferences.temperature)}
            </p>
            <p className="text-lg text-gray-600">{weather.condition}</p>
          </div>
          <div className="space-y-1">
            <p>
              <span className="text-gray-600">체감:</span>
              {formatTemperature(weather.feelsLike, unitPreferences.temperature)}
            </p>
            <p>
              <span className="text-gray-600">습도:</span> {weather.humidity}%
            </p>
            <p>
              <span className="text-gray-600">바람:</span>
              {getWindDirection(weather.windDeg)} {formatWindSpeed(weather.windSpeed, unitPreferences.windSpeed)}
            </p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t text-sm text-gray-600">
          <p>마지막 업데이트: {formatTime(weather.updatedAt, language)}</p>
        </div>
      </CardContent>
    </Card>
  );
} 