'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { searchRegions, findRegionById, koreanCities } from '@/lib/geo';
import { useWeatherStore } from '@/lib/stores/weather';
import { usePreferences } from '@/lib/stores/preferences';
import { Region } from '@/types/region.types';

export default function RegionPicker() {
  const { selectedRegion, setSelectedRegion } = useWeatherStore();
  const { addRecentRegion, language } = usePreferences();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);

  // 한국어 표기 매핑 (UI 표시용)
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

  const getDisplayName = (region: Region): string => {
    if (language === 'ko') {
      return koLabelById[region.id] || region.name;
    }
    return region.name;
  };
  
  // 지역 선택 핸들러
  const handleSelect = (regionId: string) => {
    const region = findRegionById(regionId);
    if (region) {
      setSelectedRegion(region);
      addRecentRegion(region.id);
      setOpen(false);
    }
  };
  
  // 팝오버가 열리면 검색창에 포커스
  useEffect(() => {
    if (open) {
      const id = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(id);
    }
  }, [open]);
  
  return (
    <div className="w-full max-w-sm">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            aria-label="지역 선택"
            type="button"
          >
            {selectedRegion ? getDisplayName(selectedRegion) : '지역을 선택하세요'}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ml-2 h-4 w-4 shrink-0 opacity-50"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[300px] p-0"
          align="start"
          onOpenAutoFocus={(e) => {
            // Radix가 기본 포커스를 가로채지 않도록 방지 후 직접 포커싱
            e.preventDefault();
            setTimeout(() => inputRef.current?.focus(), 10);
          }}
        >
          <Command>
            <CommandInput placeholder="지역 검색..." ref={inputRef} aria-label="지역 검색" />
            <CommandList>
              <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
              <CommandGroup heading="도시">
                {koreanCities.map((region) => (
                  <CommandItem
                    key={region.id}
                    value={getDisplayName(region)}
                    onSelect={() => handleSelect(region.id)}
                    aria-label={`${getDisplayName(region)} 선택`}
                  >
                    {getDisplayName(region)}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
} 