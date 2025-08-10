'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DailyItem } from '@/types/weather.types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { usePreferences } from '@/lib/stores/preferences';
import { 
  formatTemperature, 
  formatProbability, 
  formatDate, 
  formatTime 
} from '@/lib/utils/format';

interface DailyForecastProps {
  lat: number;
  lon: number;
  days?: number;
}

export default function DailyForecastList({ lat, lon, days = 7 }: DailyForecastProps) {
  const [forecast, setForecast] = useState<DailyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { units, unitPreferences, language } = usePreferences();
  
  // 일별 예보 데이터 가져오기
  useEffect(() => {
    const fetchDailyForecast = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/weather/daily?lat=${lat}&lon=${lon}&days=${days}&units=${units}&lang=${language}`);
        
        if (!response.ok) {
          throw new Error(`일별 예보를 가져오는데 실패했습니다. (${response.status})`);
        }
        
        const data = await response.json();
        setForecast(data.data as DailyItem[]);
      } catch (err) {
        console.error('일별 예보 데이터 가져오기 오류:', err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDailyForecast();
  }, [lat, lon, days, units, language]);
  
  // 로딩 상태 표시
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton className="h-5 w-20" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-10" />
                  <Skeleton className="h-5 w-10" />
                </div>
              </div>
            ))}
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
          <CardTitle className="text-red-500">일별 예보를 가져올 수 없습니다</CardTitle>
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
  
  // 예보 데이터가 없는 경우
  if (!forecast || forecast.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>일별 예보 없음</CardTitle>
        </CardHeader>
        <CardContent>
          <p role="status">일별 예보 정보를 찾을 수 없습니다.</p>
        </CardContent>
      </Card>
    );
  }
  
  // 날씨 아이콘 매핑
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
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>일별 예보</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {forecast.map((day, index) => (
            <AccordionItem key={index} value={`day-${index}`}>
              <AccordionTrigger className="hover:no-underline" aria-label={`${formatDate(day.date, language)} 날씨 상세 정보 보기`}>
                <div className="flex justify-between items-center w-full pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl" role="img" aria-label={day.condition}>
                      {getWeatherIcon(day.icon)}
                    </span>
                    <span>{formatDate(day.date, language)}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-blue-500">
                      {formatTemperature(day.min, unitPreferences.temperature).replace('°C', '°').replace('°F', '°')}
                    </span>
                    <span className="text-red-500">
                      {formatTemperature(day.max, unitPreferences.temperature).replace('°C', '°').replace('°F', '°')}
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 gap-4 py-2">
                  <div>
                    <p className="text-sm text-gray-500">상태</p>
                    <p>{day.condition}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">강수확률</p>
                    <p>{formatProbability(day.pop)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">습도</p>
                    <p>{day.humidity}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">일출/일몰</p>
                    <p>{formatTime(day.sunrise, language)} / {formatTime(day.sunset, language)}</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
} 