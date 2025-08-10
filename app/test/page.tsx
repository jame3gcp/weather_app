'use client';

import { useState, useEffect } from 'react';
import { useWeatherStore } from '@/lib/stores/weather';
import { usePreferences } from '@/lib/stores/preferences';
import { findRegionById } from '@/lib/geo';
import { getCurrentWeather } from '@/lib/weather-client';
import { WeatherResponse } from '@/types/weather.types';

export default function TestPage() {
  const [apiResponse, setApiResponse] = useState<WeatherResponse | null>(null);
  const [hourlyResponse, setHourlyResponse] = useState<WeatherResponse | null>(null);
  const [dailyResponse, setDailyResponse] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { selectedRegion, setSelectedRegion } = useWeatherStore();
  const { recentRegions, addRecentRegion } = usePreferences();
  
  // 서울 지역 선택 (테스트용)
  useEffect(() => {
    const seoul = findRegionById('seoul');
    if (seoul) {
      setSelectedRegion(seoul);
      addRecentRegion('seoul');
    }
  }, [setSelectedRegion, addRecentRegion]);
  
  // 현재 날씨 API 테스트
  const testCurrentWeatherApi = async () => {
    if (!selectedRegion) {
      setError('선택된 지역이 없습니다.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `/api/weather/current?lat=${selectedRegion.coordinates.lat}&lon=${selectedRegion.coordinates.lon}`
      );
      
      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
      }
      
      const data = await response.json();
      setApiResponse(data as WeatherResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  // 시간별 날씨 API 테스트
  const testHourlyWeatherApi = async () => {
    if (!selectedRegion) {
      setError('선택된 지역이 없습니다.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `/api/weather/hourly?lat=${selectedRegion.coordinates.lat}&lon=${selectedRegion.coordinates.lon}&hours=12`
      );
      
      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
      }
      
      const data = await response.json();
      setHourlyResponse(data as WeatherResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  // 일별 날씨 API 테스트
  const testDailyWeatherApi = async () => {
    if (!selectedRegion) {
      setError('선택된 지역이 없습니다.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `/api/weather/daily?lat=${selectedRegion.coordinates.lat}&lon=${selectedRegion.coordinates.lon}&days=5`
      );
      
      if (!response.ok) {
        throw new Error(`API 오류: ${response.status}`);
      }
      
      const data = await response.json();
      setDailyResponse(data as WeatherResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">1단계 설정 테스트</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">상태 관리 테스트</h2>
        <div className="p-4 border rounded-md bg-gray-50">
          <p><strong>선택된 지역:</strong> {selectedRegion ? selectedRegion.fullName : '없음'}</p>
          <p><strong>최근 지역:</strong> {recentRegions.map(id => {
            const region = findRegionById(id);
            return region ? region.name : id;
          }).join(', ') || '없음'}</p>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">API 테스트</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={testCurrentWeatherApi}
            disabled={loading || !selectedRegion}
            className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300"
          >
            {loading ? '로딩 중...' : '현재 날씨 API 테스트'}
          </button>
          
          <button
            onClick={testHourlyWeatherApi}
            disabled={loading || !selectedRegion}
            className="px-4 py-2 bg-green-500 text-white rounded-md disabled:bg-gray-300"
          >
            {loading ? '로딩 중...' : '시간별 날씨 API 테스트'}
          </button>
          
          <button
            onClick={testDailyWeatherApi}
            disabled={loading || !selectedRegion}
            className="px-4 py-2 bg-purple-500 text-white rounded-md disabled:bg-gray-300"
          >
            {loading ? '로딩 중...' : '일별 날씨 API 테스트'}
          </button>
        </div>
        
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-md text-red-700">
            {error}
          </div>
        )}
        
        {apiResponse && (
          <div className="mt-4 p-4 border rounded-md bg-blue-50">
            <h3 className="font-semibold mb-2">현재 날씨 API 응답:</h3>
            <pre className="bg-white p-2 rounded overflow-auto max-h-80">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </div>
        )}
        
        {hourlyResponse && (
          <div className="mt-4 p-4 border rounded-md bg-green-50">
            <h3 className="font-semibold mb-2">시간별 날씨 API 응답:</h3>
            <pre className="bg-white p-2 rounded overflow-auto max-h-80">
              {JSON.stringify(hourlyResponse, null, 2)}
            </pre>
          </div>
        )}
        
        {dailyResponse && (
          <div className="mt-4 p-4 border rounded-md bg-purple-50">
            <h3 className="font-semibold mb-2">일별 날씨 API 응답:</h3>
            <pre className="bg-white p-2 rounded overflow-auto max-h-80">
              {JSON.stringify(dailyResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 