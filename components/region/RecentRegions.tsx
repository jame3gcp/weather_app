'use client';

import { Badge } from '@/components/ui/badge';
import { usePreferences } from '@/lib/stores/preferences';
import { findRegionById } from '@/lib/geo';
import { useWeatherStore } from '@/lib/stores/weather';

export default function RecentRegions() {
  const { recentRegions, language } = usePreferences();
  const { setSelectedRegion } = useWeatherStore();
  
  // 최근 선택 지역이 없는 경우
  if (recentRegions.length === 0) {
    return (
      <div className="text-sm text-gray-500" aria-live="polite">
        최근 선택한 지역이 없습니다.
      </div>
    );
  }
  
  // 지역 선택 핸들러
  const handleSelectRegion = (regionId: string) => {
    const region = findRegionById(regionId);
    if (region) {
      setSelectedRegion(region);
    }
  };
  
  // 한국어 라벨 매핑 (표시 전용)
  const koLabelById: Record<string, string> = {
    seoul: '서울',
    busan: '부산',
    incheon: '인천',
    daegu: '대구',
    daejeon: '대전',
    gwangju: '광주',
    ulsan: '울산',
    sejong: '세종',
    gyeonggi: '경기',
    gangwon: '강원',
    chungbuk: '충북',
    chungnam: '충남',
    jeonbuk: '전북',
    jeonnam: '전남',
    gyeongbuk: '경북',
    gyeongnam: '경남',
    jeju: '제주',
  };

  const getDisplayName = (id: string, fallback: string) => {
    return language === 'ko' ? (koLabelById[id] || fallback) : fallback;
  };

  return (
    <div className="flex flex-wrap gap-2" role="list" aria-label="최근 선택한 지역 목록">
      {recentRegions.map((regionId) => {
        const region = findRegionById(regionId);
        if (!region) return null;
        const label = getDisplayName(region.id, region.name);
        return (
          <Badge 
            key={region.id}
            variant="secondary"
            className="cursor-pointer hover:bg-secondary/80"
            onClick={() => handleSelectRegion(region.id)}
            role="listitem"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSelectRegion(region.id);
              }
            }}
            aria-label={`${label} 선택`}
          >
            {label}
          </Badge>
        );
      })}
    </div>
  );
} 