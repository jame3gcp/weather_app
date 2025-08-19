import dotenv from 'dotenv';

// .env 파일 로드
dotenv.config();

interface EnvConfig {
  WEATHER_API_BASE: string;
  WEATHER_API_KEY: string;
  CACHE_TTL_SECONDS: number;
  DEFAULT_LOCALE: string;
}

function loadEnvConfig(): EnvConfig {
  return {
    WEATHER_API_BASE: process.env.WEATHER_API_BASE || 'https://api.openweathermap.org/data/2.5',
    WEATHER_API_KEY: process.env.WEATHER_API_KEY || '',
    CACHE_TTL_SECONDS: parseInt(process.env.CACHE_TTL_SECONDS || '600', 10),
    DEFAULT_LOCALE: process.env.DEFAULT_LOCALE || 'ko'
  };
}

export const envConfig = loadEnvConfig(); 