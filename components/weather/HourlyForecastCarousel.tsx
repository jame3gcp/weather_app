'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { HourlyItem } from '@/types/weather.types';
import { usePreferences } from '@/lib/stores/preferences';
import { formatTemperature, formatProbability, formatTime } from '@/lib/utils/format';

interface HourlyForecastProps {
  lat: number;
  lon: number;
  hours?: number;
}

export default function HourlyForecastCarousel({ lat, lon, hours = 24 }: HourlyForecastProps) {
  const [forecast, setForecast] = useState<HourlyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { units, unitPreferences, language } = usePreferences();
  
  // 시간별 예보 데이터 가져오기
  useEffect(() => {
    const fetchHourlyForecast = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/weather/hourly?lat=${lat}&lon=${lon}&hours=${hours}&units=${units}&lang=${language}`);
        
        if (!response.ok) {
          throw new Error(`시간별 예보를 가져오는데 실패했습니다. (${response.status})`);
        }
        
        const data = await response.json();
        setForecast(data.data as HourlyItem[]);
      } catch (err) {
        console.error('시간별 예보 데이터 가져오기 오류:', err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHourlyForecast();
  }, [lat, lon, hours, units, language]);
  
  // 로딩 상태 표시
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-20">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-16 w-full mb-2" />
                <Skeleton className="h-4 w-full" />
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
          <CardTitle className="text-red-500">시간별 예보를 가져올 수 없습니다</CardTitle>
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
          <CardTitle>시간별 예보 없음</CardTitle>
        </CardHeader>
        <CardContent>
          <p role="status">시간별 예보 정보를 찾을 수 없습니다.</p>
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
  
  // 데이터를 시간순으로 정렬하고 그래프용 데이터 준비
  const sortedForecast = [...forecast].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  const labels = sortedForecast.map((h) => formatTime(h.time, language));
  const temps = sortedForecast.map((h) => h.temp);
  const pops = sortedForecast.map((h) => Math.round(h.pop * 100));
  
  // 온도 범위 계산 (더 넓은 범위로 설정)
  const maxTemp = Math.max(...temps);
  const minTemp = Math.min(...temps);
  const tempRange = Math.max(5, maxTemp - minTemp); // 최소 5도 범위 보장
  
  // 그래프 설정
  const width = 680;
  const height = 220;
  const chartPad = 28;
  const chartW = width - chartPad * 2;
  const chartH = height - chartPad * 2;
  
  // X축 라벨을 균등하게 배치 (더 많은 라벨 표시)
  const xLabels = labels.map((label, i) => ({
    label,
    x: chartPad + (i / (labels.length - 1)) * chartW,
    show: i % 2 === 0 || i === labels.length - 1 // 2개마다 표시하되 마지막은 항상 표시
  }));
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>시간별 예보</CardTitle>
      </CardHeader>
      <CardContent>
        {/* 간단한 꺾은선 그래프 (SVG) */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[680px]">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[220px]">
              {/* 배경 그리드 */}
              {[0, 0.25, 0.5, 0.75, 1].map((r, i) => (
                <line
                  key={i}
                  x1={chartPad}
                  x2={chartPad + chartW}
                  y1={chartPad + chartH - r * chartH}
                  y2={chartPad + chartH - r * chartH}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                />
              ))}

              {/* 좌측 Y축(온도) */}
              <line x1={chartPad} x2={chartPad} y1={chartPad} y2={chartPad + chartH} stroke="#94a3b8" strokeWidth={1} />
              {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
                const t = minTemp + r * tempRange;
                const y = chartPad + chartH - r * chartH;
                return (
                  <text key={i} x={chartPad - 8} y={y + 3} fontSize="10" textAnchor="end" fill="#64748b">
                    {Math.round(t)}°
                  </text>
                );
              })}

              {/* 우측 Y축(강수확률 %) */}
              <line x1={chartPad + chartW} x2={chartPad + chartW} y1={chartPad} y2={chartPad + chartH} stroke="#94a3b8" strokeWidth={1} />
              {[0, 25, 50, 75, 100].map((p, i) => {
                const y = chartPad + chartH - (p / 100) * chartH;
                return (
                  <text key={i} x={chartPad + chartW + 8} y={y + 3} fontSize="10" textAnchor="start" fill="#64748b">
                    {p}%
                  </text>
                );
              })}

              {/* 범례 */}
              <rect x={chartPad} y={8} width={10} height={2} fill="hsl(199 89% 48%)" />
              <text x={chartPad + 14} y={11} fontSize="10" fill="#0f172a">온도</text>
              <line x1={chartPad + 50} x2={chartPad + 60} y1={10} y2={10} stroke="hsl(210 80% 60%)" strokeDasharray="4 3" strokeWidth={2} />
              <text x={chartPad + 64} y={11} fontSize="10" fill="#0f172a">강수확률</text>

              {/* 온도 선 */}
              <polyline
                fill="none"
                stroke="hsl(199 89% 48%)"
                strokeWidth="2"
                points={temps
                  .map((t, i) => {
                    const x = chartPad + (i / (temps.length - 1)) * chartW;
                    const y = chartPad + chartH - ((t - minTemp) / tempRange) * chartH;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />
              
              {/* 강수확률 선 */}
              <polyline
                fill="none"
                stroke="hsl(210 80% 60%)"
                strokeDasharray="4 3"
                strokeWidth="2"
                points={pops
                  .map((p, i) => {
                    const x = chartPad + (i / (pops.length - 1)) * chartW;
                    const y = chartPad + chartH - (p / 100) * chartH;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />
              
              {/* X축 라벨 (균등하게 배치) */}
              {xLabels.map((item, i) => {
                if (!item.show) return null;
                return (
                  <text key={i} x={item.x} y={height - 8} fontSize="10" textAnchor="middle" fill="#64748b">
                    {item.label}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>

        {/* 카드식 상세 목록 (기존 UI 유지) */}
        <ScrollArea className="w-full whitespace-nowrap mt-4" aria-label="시간별 날씨 예보 슬라이더">
          <div className="flex w-max space-x-4 p-1" role="list">
            {sortedForecast.map((hour, index) => (
              <div
                key={index}
                className="flex flex-col items-center w-[80px] text-center"
                role="listitem"
                aria-label={`${formatTime(hour.time, language)}, ${hour.condition}, 기온 ${formatTemperature(hour.temp, unitPreferences.temperature)}, 강수확률 ${formatProbability(hour.pop)}`}
              >
                <p className="text-sm font-medium">{formatTime(hour.time, language)}</p>
                <div className="my-2 text-3xl" role="img" aria-hidden="true">
                  {getWeatherIcon(hour.icon)}
                </div>
                <p className="font-bold">{formatTemperature(hour.temp, unitPreferences.temperature)}</p>
                <p className="text-xs text-gray-500">{formatProbability(hour.pop)}</p>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 