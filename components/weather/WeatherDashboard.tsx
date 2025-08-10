'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWeatherStore } from '@/lib/stores/weather';
import CurrentWeatherCard from '@/components/weather/CurrentWeatherCard';
import HourlyForecastCarousel from '@/components/weather/HourlyForecastCarousel';
import DailyForecastList from '@/components/weather/DailyForecastList';
import RegionSelector from '@/components/region/RegionSelector';
import UnitToggle from '@/components/weather/UnitToggle';
import SettingsCard from '@/components/weather/SettingsCard';

export default function WeatherDashboard() {
  const { selectedRegion } = useWeatherStore();
  
  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">날씨 정보</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* 왼쪽 사이드바 */}
        <div className="md:col-span-1 space-y-4">
          <RegionSelector />
          
          {/* 단위 전환 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">단위 설정</CardTitle>
            </CardHeader>
            <CardContent>
              <UnitToggle />
            </CardContent>
          </Card>
          
          {/* 고급 설정 */}
          <SettingsCard />
        </div>
        
        {/* 날씨 정보 영역 */}
        <div className="md:col-span-2">
          {selectedRegion ? (
            <div className="space-y-6">
              <CurrentWeatherCard 
                lat={selectedRegion.coordinates.lat} 
                lon={selectedRegion.coordinates.lon} 
              />
              
              <Tabs defaultValue="hourly" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="hourly">시간별 예보</TabsTrigger>
                  <TabsTrigger value="daily">일별 예보</TabsTrigger>
                </TabsList>
                <TabsContent value="hourly">
                  <HourlyForecastCarousel 
                    lat={selectedRegion.coordinates.lat} 
                    lon={selectedRegion.coordinates.lon} 
                  />
                </TabsContent>
                <TabsContent value="daily">
                  <DailyForecastList 
                    lat={selectedRegion.coordinates.lat} 
                    lon={selectedRegion.coordinates.lon} 
                  />
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>지역을 선택해주세요</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500" role="status" aria-live="polite">
                  왼쪽에서 지역을 선택하면 날씨 정보가 표시됩니다.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 