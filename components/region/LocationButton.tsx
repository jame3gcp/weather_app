'use client';

import { useState } from 'react';
import { useWeatherStore } from '@/lib/stores/weather';
import { findNearestRegion } from '@/lib/geo';
import { usePreferences } from '@/lib/stores/preferences';
import { Coordinates } from '@/types/coordinates.types';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

export default function LocationButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setSelectedRegion } = useWeatherStore();
  const { addRecentRegion } = usePreferences();
  
  const handleGetLocation = () => {
    setIsLoading(true);
    setError(null);
    
    // 브라우저 Geolocation API 지원 확인
    if (!navigator.geolocation) {
      setError('이 브라우저에서는 위치 기능을 지원하지 않습니다.');
      setIsLoading(false);
      return;
    }
    
    // 현재 위치 가져오기
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates: Coordinates = {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        };
        
        // 가장 가까운 지역 찾기
        const nearestRegion = findNearestRegion(coordinates);
        
        // 지역 설정 및 최근 목록에 추가
        setSelectedRegion(nearestRegion);
        addRecentRegion(nearestRegion.id);
        setIsLoading(false);
      },
      (error) => {
        // 위치 가져오기 실패 처리
        let errorMessage = '위치 정보를 가져오는데 실패했습니다.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '위치 접근 권한이 거부되었습니다. 브라우저 설정에서 권한을 확인해주세요.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '현재 위치 정보를 사용할 수 없습니다.';
            break;
          case error.TIMEOUT:
            errorMessage = '위치 정보 요청 시간이 초과되었습니다.';
            break;
        }
        
        setError(errorMessage);
        setIsLoading(false);
      },
      // 옵션: 정확도 높음, 5초 타임아웃
      {
        enableHighAccuracy: true,
        timeout: 5000
      }
    );
  };
  
  return (
    <div>
      <Button
        className="w-full mt-2"
        onClick={handleGetLocation}
        disabled={isLoading}
        aria-label="현재 위치 사용하여 날씨 정보 가져오기"
      >
        <MapPin className="mr-2 h-4 w-4" aria-hidden="true" />
        현재 위치 사용
      </Button>
      {error && (
        <p className="text-sm text-red-500 mt-1" role="alert" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
} 