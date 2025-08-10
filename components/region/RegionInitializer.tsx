'use client';

import { useEffect } from 'react';
import { useWeatherStore } from '@/lib/stores/weather';
import { usePreferences } from '@/lib/stores/preferences';
import { findRegionById } from '@/lib/geo';

interface RegionInitializerProps {
  children: React.ReactNode;
}

export default function RegionInitializer({ children }: RegionInitializerProps) {
  const { selectedRegion, setSelectedRegion } = useWeatherStore();
  const { recentRegions } = usePreferences();
  
  // 앱 초기화 시 최근 지역 중 첫 번째 지역을 선택
  useEffect(() => {
    if (!selectedRegion && recentRegions.length > 0) {
      const mostRecentRegionId = recentRegions[0];
      const region = findRegionById(mostRecentRegionId);
      
      if (region) {
        setSelectedRegion(region);
      }
    }
  }, [selectedRegion, recentRegions, setSelectedRegion]);
  
  return <>{children}</>;
} 