'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWeatherStore } from '@/lib/stores/weather';
import { usePreferences } from '@/lib/stores/preferences';
import { findRegionById } from '@/lib/geo';
import RegionPicker from '@/components/region/RegionPicker';
import FavoriteButton from '@/components/region/FavoriteButton';
import LocationButton from '@/components/region/LocationButton';
import RecentRegions from '@/components/region/RecentRegions';
import CurrentWeatherCard from '@/components/weather/CurrentWeatherCard';
import HourlyForecastCarousel from '@/components/weather/HourlyForecastCarousel';
import DailyForecastList from '@/components/weather/DailyForecastList';

export default function TestPage() {
  const { selectedRegion } = useWeatherStore();
  const { recentRegions, favoriteRegions } = usePreferences();
  
  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">구현 테스트</h1>
      
      <Tabs defaultValue="stage1" className="w-full">
        <TabsList>
          <TabsTrigger value="stage1">1단계: 프로젝트 구조</TabsTrigger>
          <TabsTrigger value="stage2">2단계: 지역 선택</TabsTrigger>
          <TabsTrigger value="stage3">3단계: 날씨 컴포넌트</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stage1" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>1단계: 프로젝트 구조 설정 및 의존성 설치</CardTitle>
            </CardHeader>
            <CardContent>
              <p>프로젝트 구조가 성공적으로 설정되었습니다.</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>디렉토리 구조 생성 완료</li>
                <li>필요한 의존성 설치 완료</li>
                <li>타입 정의 완료</li>
                <li>서버 프록시 API 구현 완료</li>
              </ul>
              <div className="mt-4">
                <a 
                  href="/test" 
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  API 테스트 페이지로 이동
                </a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stage2" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>2단계: 지역 선택 기능</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">지역 선택 컴포넌트</h3>
                  <div className="max-w-sm">
                    <RegionPicker />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">현재 위치 사용</h3>
                  <div className="max-w-sm">
                    <LocationButton />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">최근 선택한 지역</h3>
                  <RecentRegions />
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">즐겨찾기 기능</h3>
                  {selectedRegion ? (
                    <div className="flex items-center gap-2">
                      <span>{selectedRegion.fullName}</span>
                      <FavoriteButton regionId={selectedRegion.id} />
                    </div>
                  ) : (
                    <p className="text-gray-500">지역을 선택하면 즐겨찾기 기능을 테스트할 수 있습니다.</p>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">상태 확인</h3>
                  <div className="p-4 border rounded-md bg-gray-50">
                    <p><strong>선택된 지역:</strong> {selectedRegion ? selectedRegion.fullName : '없음'}</p>
                    <p><strong>최근 지역:</strong> {recentRegions.map(id => {
                      const region = findRegionById(id);
                      return region ? region.name : id;
                    }).join(', ') || '없음'}</p>
                    <p><strong>즐겨찾기:</strong> {favoriteRegions.map(id => {
                      const region = findRegionById(id);
                      return region ? region.name : id;
                    }).join(', ') || '없음'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stage3" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>3단계: 날씨 컴포넌트</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedRegion ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">현재 날씨 카드</h3>
                    <CurrentWeatherCard 
                      lat={selectedRegion.coordinates.lat} 
                      lon={selectedRegion.coordinates.lon} 
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">시간별 예보</h3>
                    <HourlyForecastCarousel 
                      lat={selectedRegion.coordinates.lat} 
                      lon={selectedRegion.coordinates.lon} 
                      hours={12}
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">일별 예보</h3>
                    <DailyForecastList 
                      lat={selectedRegion.coordinates.lat} 
                      lon={selectedRegion.coordinates.lon} 
                      days={5}
                    />
                  </div>
                  
                  <div className="mt-4">
                    <a 
                      href="/" 
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      메인 페이지로 이동
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-lg text-gray-500 mb-4">지역을 선택하면 날씨 컴포넌트를 테스트할 수 있습니다.</p>
                  <div className="max-w-sm mx-auto">
                    <RegionPicker />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 