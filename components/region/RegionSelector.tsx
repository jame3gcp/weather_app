'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import RegionPicker from '@/components/region/RegionPicker';
import FavoriteButton from '@/components/region/FavoriteButton';
import LocationButton from '@/components/region/LocationButton';
import RecentRegions from '@/components/region/RecentRegions';
import { useWeatherStore } from '@/lib/stores/weather';

export default function RegionSelector() {
  const { selectedRegion } = useWeatherStore();
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">지역 선택</CardTitle>
        {selectedRegion && (
          <FavoriteButton regionId={selectedRegion.id} />
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
          <RegionPicker />
          <LocationButton />
          <RecentRegions />
        </div>
      </CardContent>
    </Card>
  );
} 