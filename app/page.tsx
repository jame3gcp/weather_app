'use client';

import RegionInitializer from '@/components/region/RegionInitializer';
import WeatherDashboard from '@/components/weather/WeatherDashboard';

export default function Home() {
  return (
    <RegionInitializer>
      <WeatherDashboard />
    </RegionInitializer>
  );
}
