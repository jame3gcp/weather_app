'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RegionPicker from '@/components/region/RegionPicker';
import FavoriteButton from '@/components/region/FavoriteButton';
import LocationButton from '@/components/region/LocationButton';
import RecentRegions from '@/components/region/RecentRegions';
import { useWeatherStore } from '@/lib/stores/weather';
import { findRegionById } from '@/lib/geo';
import { usePreferences } from '@/lib/stores/preferences';

export default function RegionTester() {
  const { selectedRegion, setSelectedRegion } = useWeatherStore();
  const { recentRegions, favoriteRegions, addRecentRegion, toggleFavoriteRegion } = usePreferences();
  
  // 지역 선택 테스트
  const testRegionSelection = () => {
    // 서울 지역 선택
    const seoul = findRegionById('seoul');
    if (seoul) {
      setSelectedRegion(seoul);
      addRecentRegion('seoul');
      alert(`지역이 선택되었습니다: ${seoul.fullName}`);
    }
  };
  
  // 즐겨찾기 테스트
  const testFavoriteToggle = () => {
    if (!selectedRegion) {
      alert('먼저 지역을 선택해주세요.');
      return;
    }
    
    toggleFavoriteRegion(selectedRegion.id);
    const isFavorite = !favoriteRegions.includes(selectedRegion.id);
    alert(`${selectedRegion.fullName}이(가) ${isFavorite ? '즐겨찾기에 추가' : '즐겨찾기에서 제거'}되었습니다.`);
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">지역 선택 기능 테스트</h1>
      
      <Tabs defaultValue="component">
        <TabsList>
          <TabsTrigger value="component">컴포넌트 테스트</TabsTrigger>
          <TabsTrigger value="api">API 테스트</TabsTrigger>
        </TabsList>
        
        <TabsContent value="component" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>RegionSelector 컴포넌트</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-sm">
                <RegionPicker />
                <LocationButton />
                <RecentRegions />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>상태 확인</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
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
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>수동 테스트</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-2">
                <Button onClick={testRegionSelection}>
                  서울 지역 선택 테스트
                </Button>
                <Button onClick={testFavoriteToggle}>
                  즐겨찾기 토글 테스트
                </Button>
                {selectedRegion && (
                  <div className="flex items-center space-x-2 mt-2">
                    <span>즐겨찾기:</span>
                    <FavoriteButton regionId={selectedRegion.id} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API 테스트 결과</CardTitle>
            </CardHeader>
            <CardContent>
              <p>API 테스트는 /test 페이지에서 확인할 수 있습니다.</p>
              <Button asChild className="mt-2">
                <a href="/test" target="_blank" rel="noopener noreferrer">
                  API 테스트 페이지로 이동
                </a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 