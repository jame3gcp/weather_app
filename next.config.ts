import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverRuntimeConfig: {
    WEATHER_API_BASE: process.env.WEATHER_API_BASE || 'https://api.openweathermap.org/data/2.5',
    WEATHER_API_KEY: process.env.WEATHER_API_KEY,
    CACHE_TTL_SECONDS: process.env.CACHE_TTL_SECONDS || '600',
    DEFAULT_LOCALE: process.env.DEFAULT_LOCALE || 'ko',
  },
};

export default nextConfig;
