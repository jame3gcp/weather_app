import axios from 'axios';
import { WeatherResponse, WeatherError } from '@/types/weather.types';
import { Coordinates } from '@/types/coordinates.types';
import { UnitSystem } from '@/types/preferences.types';

const API_BASE_URL = '/api/weather';

export async function getCurrentWeather(
  coordinates: Coordinates, 
  units: UnitSystem = 'metric',
  lang: string = 'ko'
): Promise<WeatherResponse> {
  try {
    const { lat, lon } = coordinates;
    const response = await axios.get<WeatherResponse>(
      `${API_BASE_URL}/current?lat=${lat}&lon=${lon}&units=${units}&lang=${lang}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data) {
      throw error.response.data as WeatherError;
    }
    throw {
      code: 'UNKNOWN_ERROR',
      message: '날씨 정보를 가져오는 중 오류가 발생했습니다.'
    };
  }
}

export async function getHourlyForecast(
  coordinates: Coordinates,
  hours: number = 24,
  units: UnitSystem = 'metric',
  lang: string = 'ko'
): Promise<WeatherResponse> {
  try {
    const { lat, lon } = coordinates;
    const response = await axios.get<WeatherResponse>(
      `${API_BASE_URL}/hourly?lat=${lat}&lon=${lon}&hours=${hours}&units=${units}&lang=${lang}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data) {
      throw error.response.data as WeatherError;
    }
    throw {
      code: 'UNKNOWN_ERROR',
      message: '시간별 예보를 가져오는 중 오류가 발생했습니다.'
    };
  }
}

export async function getDailyForecast(
  coordinates: Coordinates,
  days: number = 7,
  units: UnitSystem = 'metric',
  lang: string = 'ko'
): Promise<WeatherResponse> {
  try {
    const { lat, lon } = coordinates;
    const response = await axios.get<WeatherResponse>(
      `${API_BASE_URL}/daily?lat=${lat}&lon=${lon}&days=${days}&units=${units}&lang=${lang}`
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data) {
      throw error.response.data as WeatherError;
    }
    throw {
      code: 'UNKNOWN_ERROR',
      message: '일별 예보를 가져오는 중 오류가 발생했습니다.'
    };
  }
} 