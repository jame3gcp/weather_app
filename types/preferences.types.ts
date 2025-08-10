export type UnitSystem = "metric" | "imperial";

export interface UnitPreferences {
  temperature: "celsius" | "fahrenheit";
  windSpeed: "ms" | "kmh" | "mph";
  precipitation: "mm" | "in";
}

export interface UserPreferences {
  units: UnitSystem;
  unitPreferences: UnitPreferences;
  language: string;
  recentRegions: string[]; // 최근 선택한 지역 ID 목록 (최대 5개)
  favoriteRegions: string[]; // 즐겨찾기한 지역 ID 목록
} 