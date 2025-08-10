import { create } from 'zustand';
import { Region } from '@/types/region.types';
import { Coordinates } from '@/types/coordinates.types';

interface WeatherState {
  selectedRegion: Region | null;
  isLoading: {
    current: boolean;
    hourly: boolean;
    daily: boolean;
  };
  error: {
    current: string | null;
    hourly: string | null;
    daily: string | null;
  };
  setSelectedRegion: (region: Region | null) => void;
  setLoading: (type: 'current' | 'hourly' | 'daily', isLoading: boolean) => void;
  setError: (type: 'current' | 'hourly' | 'daily', error: string | null) => void;
}

export const useWeatherStore = create<WeatherState>((set) => ({
  selectedRegion: null,
  isLoading: {
    current: false,
    hourly: false,
    daily: false
  },
  error: {
    current: null,
    hourly: null,
    daily: null
  },
  
  setSelectedRegion: (region: Region | null) => set({ selectedRegion: region }),
  
  setLoading: (type: 'current' | 'hourly' | 'daily', isLoading: boolean) => 
    set((state) => ({
      isLoading: {
        ...state.isLoading,
        [type]: isLoading
      }
    })),
  
  setError: (type: 'current' | 'hourly' | 'daily', error: string | null) => 
    set((state) => ({
      error: {
        ...state.error,
        [type]: error
      }
    }))
})); 