'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { usePreferences } from '@/lib/stores/preferences';
import { UnitSystem, UnitPreferences } from '@/types/preferences.types';

export default function UnitToggle() {
  const { units, unitPreferences, setUnits, setUnitPreferences } = usePreferences();
  
  // 단위 시스템 전환 (미터법/영국식)
  const handleUnitSystemChange = (system: UnitSystem) => {
    setUnits(system);
    
    // 단위 시스템에 따라 기본 단위 설정
    if (system === 'metric') {
      setUnitPreferences({
        temperature: 'celsius',
        windSpeed: 'ms',
        precipitation: 'mm'
      });
    } else {
      setUnitPreferences({
        temperature: 'fahrenheit',
        windSpeed: 'mph',
        precipitation: 'in'
      });
    }
  };
  
  // 개별 단위 전환
  const handleTemperatureUnitChange = (unit: 'celsius' | 'fahrenheit') => {
    setUnitPreferences({ temperature: unit });
  };
  
  const handleWindSpeedUnitChange = (unit: 'ms' | 'kmh' | 'mph') => {
    setUnitPreferences({ windSpeed: unit });
  };
  
  const handlePrecipitationUnitChange = (unit: 'mm' | 'in') => {
    setUnitPreferences({ precipitation: unit });
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* 단위 시스템 */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium whitespace-nowrap">단위 시스템</span>
          <div className="flex gap-2">
            <Button
              variant={units === 'metric' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleUnitSystemChange('metric')}
            >
              미터법 (°C, m/s)
            </Button>
            <Button
              variant={units === 'imperial' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleUnitSystemChange('imperial')}
            >
              영국식 (°F, mph)
            </Button>
          </div>
        </div>

        {/* 온도 */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium whitespace-nowrap">온도</span>
          <div className="flex gap-2">
            <Button
              variant={unitPreferences.temperature === 'celsius' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTemperatureUnitChange('celsius')}
            >
              섭씨 (°C)
            </Button>
            <Button
              variant={unitPreferences.temperature === 'fahrenheit' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleTemperatureUnitChange('fahrenheit')}
            >
              화씨 (°F)
            </Button>
          </div>
        </div>

        {/* 풍속 */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium whitespace-nowrap">풍속</span>
          <div className="flex gap-2">
            <Button
              variant={unitPreferences.windSpeed === 'ms' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleWindSpeedUnitChange('ms')}
            >
              m/s
            </Button>
            <Button
              variant={unitPreferences.windSpeed === 'kmh' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleWindSpeedUnitChange('kmh')}
            >
              km/h
            </Button>
            <Button
              variant={unitPreferences.windSpeed === 'mph' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleWindSpeedUnitChange('mph')}
            >
              mph
            </Button>
          </div>
        </div>

        {/* 강수량 */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium whitespace-nowrap">강수량</span>
          <div className="flex gap-2">
            <Button
              variant={unitPreferences.precipitation === 'mm' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePrecipitationUnitChange('mm')}
            >
              mm
            </Button>
            <Button
              variant={unitPreferences.precipitation === 'in' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePrecipitationUnitChange('in')}
            >
              in
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 