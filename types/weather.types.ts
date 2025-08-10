import { Coordinates } from "./coordinates.types";

export interface CurrentWeather {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDeg: number;
  condition: string;
  icon: string;
  pressure: number;
  visibility: number;
  updatedAt: string;
}

export interface HourlyItem {
  time: string;
  temp: number;
  pop: number; // 강수확률 (Probability of Precipitation)
  icon: string;
  condition: string;
}

export interface DailyItem {
  date: string;
  min: number;
  max: number;
  pop: number; // 강수확률
  icon: string;
  condition: string;
  sunrise: string;
  sunset: string;
  humidity: number;
}

export interface WeatherResponse {
  location: {
    name: string;
    lat: number;
    lon: number;
  };
  updatedAt: string;
  data: CurrentWeather | HourlyItem[] | DailyItem[];
}

export interface WeatherError {
  code: string;
  message: string;
  traceId?: string;
} 