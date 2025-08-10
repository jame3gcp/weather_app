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
import UnitToggle from '@/components/weather/UnitToggle';
import SettingsCard from '@/components/weather/SettingsCard';
import OptimizedImage from '@/components/ui/optimized-image';

export default function TestAllContent() {
  const [activeTab, setActiveTab] = useState('stage1');
  const { selectedRegion } = useWeatherStore();
  const { recentRegions } = usePreferences();
  
  const mostRecentRegion = recentRegions[0] ? findRegionById(recentRegions[0]) : null;
  
  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">날씨 앱 테스트 페이지</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="stage1">1단계: 프로젝트 구조</TabsTrigger>
          <TabsTrigger value="stage2">2단계: 지역 선택</TabsTrigger>
          <TabsTrigger value="stage3">3단계: 날씨 컴포넌트</TabsTrigger>
          <TabsTrigger value="stage5">5단계: 단위 전환</TabsTrigger>
          <TabsTrigger value="stage6">6단계: 접근성/성능</TabsTrigger>
        </TabsList>
        
        {/* 1단계: 프로젝트 구조 테스트 */}
        <TabsContent value="stage1">
          <Card>
            <CardHeader>
              <CardTitle>1단계: 프로젝트 구조 설정 및 의존성 설치</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">API 엔드포인트 테스트</h3>
                  <p>아래 버튼을 클릭하여 각 API 엔드포인트를 테스트합니다.</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button 
                      className="px-4 py-2 bg-blue-500 text-white rounded-md"
                      onClick={async () => {
                        try {
                          const res = await fetch('/api/weather/current?lat=37.5665&lon=126.978');
                          const data = await res.json();
                          console.log('현재 날씨 API 응답:', data);
                          alert('현재 날씨 API 응답이 콘솔에 출력되었습니다.');
                        } catch (err) {
                          console.error('API 호출 오류:', err);
                          alert('API 호출 오류: ' + err);
                        }
                      }}
                    >
                      현재 날씨 API 테스트
                    </button>
                    
                    <button 
                      className="px-4 py-2 bg-blue-500 text-white rounded-md"
                      onClick={async () => {
                        try {
                          const res = await fetch('/api/weather/hourly?lat=37.5665&lon=126.978&hours=12');
                          const data = await res.json();
                          console.log('시간별 예보 API 응답:', data);
                          alert('시간별 예보 API 응답이 콘솔에 출력되었습니다.');
                        } catch (err) {
                          console.error('API 호출 오류:', err);
                          alert('API 호출 오류: ' + err);
                        }
                      }}
                    >
                      시간별 예보 API 테스트
                    </button>
                    
                    <button 
                      className="px-4 py-2 bg-blue-500 text-white rounded-md"
                      onClick={async () => {
                        try {
                          const res = await fetch('/api/weather/daily?lat=37.5665&lon=126.978&days=5');
                          const data = await res.json();
                          console.log('일별 예보 API 응답:', data);
                          alert('일별 예보 API 응답이 콘솔에 출력되었습니다.');
                        } catch (err) {
                          console.error('API 호출 오류:', err);
                          alert('API 호출 오류: ' + err);
                        }
                      }}
                    >
                      일별 예보 API 테스트
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* 2단계: 지역 선택 테스트 */}
        <TabsContent value="stage2">
          <Card>
            <CardHeader>
              <CardTitle>2단계: 지역 선택 기능 구현</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">지역 선택 컴포넌트</h3>
                  <div className="border p-4 rounded-md">
                    <RegionPicker />
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">현재 위치 버튼</h3>
                  <div className="border p-4 rounded-md">
                    <LocationButton />
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">최근 선택 지역</h3>
                  <div className="border p-4 rounded-md">
                    <RecentRegions />
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">즐겨찾기 버튼</h3>
                  <div className="border p-4 rounded-md flex items-center gap-2">
                    {mostRecentRegion && (
                      <>
                        <span>{mostRecentRegion.name}</span>
                        <FavoriteButton regionId={mostRecentRegion.id} />
                      </>
                    )}
                    {!mostRecentRegion && <span>최근 선택한 지역이 없습니다.</span>}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">현재 선택된 지역</h3>
                  <div className="border p-4 rounded-md">
                    {selectedRegion ? (
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(selectedRegion, null, 2)}
                      </pre>
                    ) : (
                      <p>선택된 지역이 없습니다.</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* 3단계: 날씨 컴포넌트 테스트 */}
        <TabsContent value="stage3">
          <Card>
            <CardHeader>
              <CardTitle>3단계: 날씨 컴포넌트 구현</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {selectedRegion ? (
                  <>
                    <div>
                      <h3 className="font-medium mb-2">현재 날씨 카드</h3>
                      <CurrentWeatherCard 
                        lat={selectedRegion.coordinates.lat} 
                        lon={selectedRegion.coordinates.lon} 
                      />
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">시간별 예보 캐러셀</h3>
                      <HourlyForecastCarousel 
                        lat={selectedRegion.coordinates.lat} 
                        lon={selectedRegion.coordinates.lon} 
                        hours={12}
                      />
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">일별 예보 리스트</h3>
                      <DailyForecastList 
                        lat={selectedRegion.coordinates.lat} 
                        lon={selectedRegion.coordinates.lon} 
                        days={5}
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-center p-8 border rounded-md">
                    <p>날씨 컴포넌트를 테스트하려면 먼저 지역을 선택해주세요.</p>
                    <p className="text-sm text-gray-500 mt-2">
                      &quot;2단계: 지역 선택&quot; 탭에서 지역을 선택할 수 있습니다.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* 5단계: 단위 전환 테스트 */}
        <TabsContent value="stage5">
          <Card>
            <CardHeader>
              <CardTitle>5단계: 단위 전환 및 사용자 설정 구현</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">단위 전환 컴포넌트</h3>
                  <div className="border p-4 rounded-md">
                    <UnitToggle />
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">고급 설정 컴포넌트</h3>
                  <div className="border p-4 rounded-md">
                    <SettingsCard />
                  </div>
                </div>
                
                {selectedRegion ? (
                  <>
                    <div>
                      <h3 className="font-medium mb-2">단위 전환 적용 테스트 - 현재 날씨</h3>
                      <CurrentWeatherCard 
                        lat={selectedRegion.coordinates.lat} 
                        lon={selectedRegion.coordinates.lon} 
                      />
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">단위 전환 적용 테스트 - 시간별 예보</h3>
                      <HourlyForecastCarousel 
                        lat={selectedRegion.coordinates.lat} 
                        lon={selectedRegion.coordinates.lon} 
                        hours={12}
                      />
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">단위 전환 적용 테스트 - 일별 예보</h3>
                      <DailyForecastList 
                        lat={selectedRegion.coordinates.lat} 
                        lon={selectedRegion.coordinates.lon} 
                        days={5}
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-center p-8 border rounded-md">
                    <p>단위 전환 적용을 테스트하려면 먼저 지역을 선택해주세요.</p>
                    <p className="text-sm text-gray-500 mt-2">
                      &quot;2단계: 지역 선택&quot; 탭에서 지역을 선택할 수 있습니다.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* 6단계: 접근성/성능 테스트 */}
        <TabsContent value="stage6">
          <Card>
            <CardHeader>
              <CardTitle>6단계: 접근성 및 성능 최적화</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">접근성 기능</h3>
                  <div className="border p-4 rounded-md">
                    <p className="mb-2">키보드 포커스 테스트:</p>
                    <div className="flex flex-wrap gap-2">
                      <button className="px-4 py-2 bg-blue-500 text-white rounded-md">
                        포커스 테스트 버튼 1
                      </button>
                      <button className="px-4 py-2 bg-blue-500 text-white rounded-md">
                        포커스 테스트 버튼 2
                      </button>
                      <button className="px-4 py-2 bg-blue-500 text-white rounded-md">
                        포커스 테스트 버튼 3
                      </button>
                    </div>
                    <p className="mt-4 mb-2">스크린 리더 지원:</p>
                    <div className="flex items-center gap-2">
                      <span className="sr-only">스크린 리더 사용자에게만 보이는 텍스트</span>
                      <button 
                        className="px-4 py-2 bg-blue-500 text-white rounded-md"
                        aria-label="스크린 리더 테스트 버튼"
                      >
                        <span className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                          접근성 버튼
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">이미지 최적화</h3>
                  <div className="border p-4 rounded-md">
                    <div className="flex flex-wrap gap-4">
                      <div>
                        <p className="mb-2">일반 이미지:</p>
                        <img 
                          src="https://openweathermap.org/img/wn/01d.png" 
                          alt="날씨 아이콘" 
                          width="50" 
                          height="50"
                        />
                      </div>
                      <div>
                        <p className="mb-2">최적화된 이미지:</p>
                        <OptimizedImage 
                          src="https://openweathermap.org/img/wn/01d.png" 
                          alt="최적화된 날씨 아이콘" 
                          width={50} 
                          height={50}
                          priority={true}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">스켈레톤 로딩 애니메이션</h3>
                  <div className="border p-4 rounded-md">
                    <div className="space-y-2">
                      <div className="skeleton h-8 w-3/4 rounded-md"></div>
                      <div className="skeleton h-4 w-full rounded-md"></div>
                      <div className="skeleton h-4 w-2/3 rounded-md"></div>
                      <div className="skeleton h-4 w-1/2 rounded-md"></div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">모바일 터치 최적화</h3>
                  <div className="border p-4 rounded-md">
                    <p className="mb-2">모바일 화면에서 터치 영역이 충분히 크게 조정됩니다:</p>
                    <div className="flex flex-wrap gap-2">
                      <button className="px-4 py-2 bg-blue-500 text-white rounded-md">
                        모바일 버튼 1
                      </button>
                      <button className="px-4 py-2 bg-blue-500 text-white rounded-md">
                        모바일 버튼 2
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 