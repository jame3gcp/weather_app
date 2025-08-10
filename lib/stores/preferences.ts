import { create } from 'zustand';
import { UserPreferences, UnitPreferences, UnitSystem } from '@/types/preferences.types';

interface PreferencesState extends UserPreferences {
  addRecentRegion: (regionId: string) => void;
  toggleFavoriteRegion: (regionId: string) => void;
  setUnits: (units: UnitSystem) => void;
  setUnitPreferences: (preferences: Partial<UnitPreferences>) => void;
  setLanguage: (language: string) => void;
  rehydrateFromStorage: () => void;
  hasHydrated: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  units: 'metric',
  unitPreferences: {
    temperature: 'celsius',
    windSpeed: 'ms',
    precipitation: 'mm'
  },
  language: 'ko',
  recentRegions: [],
  favoriteRegions: []
};

function loadPreferencesFromLocalStorage(): UserPreferences {
  try {
    const raw = window.localStorage.getItem('weather-preferences');
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<UserPreferences>;
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      unitPreferences: {
        ...DEFAULT_PREFERENCES.unitPreferences,
        ...(parsed.unitPreferences ?? {}),
      },
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function persistPreferencesToLocalStorage(state: PreferencesState) {
  const preferencesOnly: UserPreferences = {
    units: state.units,
    language: state.language,
    unitPreferences: state.unitPreferences,
    recentRegions: state.recentRegions,
    favoriteRegions: state.favoriteRegions,
  };
  try {
    window.localStorage.setItem('weather-preferences', JSON.stringify(preferencesOnly));
  } catch {
    // ignore write errors
  }
}

export const usePreferences = create<PreferencesState>((set, get) => {
  // Always start from server-safe defaults to avoid hydration mismatch
  return {
    ...DEFAULT_PREFERENCES,
    hasHydrated: false,

    rehydrateFromStorage: () => {
      if (typeof window === 'undefined') return;
      const loaded = loadPreferencesFromLocalStorage();
      set({ ...loaded, hasHydrated: true });
    },

    addRecentRegion: (regionId: string) => {
      set((state) => {
        const filteredRegions = state.recentRegions.filter((id) => id !== regionId);
        const newRecentRegions = [regionId, ...filteredRegions].slice(0, 5);
        const nextState = { ...state, recentRegions: newRecentRegions } as PreferencesState;
        persistPreferencesToLocalStorage(nextState);
        return { recentRegions: newRecentRegions };
      });
    },

    toggleFavoriteRegion: (regionId: string) => {
      set((state) => {
        const isFavorite = state.favoriteRegions.includes(regionId);
        let nextFavorites: string[];
        if (isFavorite) {
          nextFavorites = state.favoriteRegions.filter((id) => id !== regionId);
        } else {
          nextFavorites = [...state.favoriteRegions, regionId];
        }
        const nextState = { ...state, favoriteRegions: nextFavorites } as PreferencesState;
        persistPreferencesToLocalStorage(nextState);
        return { favoriteRegions: nextFavorites };
      });
    },

    setUnits: (units: UnitSystem) => {
      set((state) => {
        const nextState = { ...state, units } as PreferencesState;
        persistPreferencesToLocalStorage(nextState);
        return { units };
      });
    },

    setUnitPreferences: (preferences: Partial<UnitPreferences>) => {
      set((state) => {
        const merged = { ...state.unitPreferences, ...preferences };
        const nextState = { ...state, unitPreferences: merged } as PreferencesState;
        persistPreferencesToLocalStorage(nextState);
        return { unitPreferences: merged };
      });
    },

    setLanguage: (language: string) => {
      set((state) => {
        const nextState = { ...state, language } as PreferencesState;
        persistPreferencesToLocalStorage(nextState);
        return { language };
      });
    },
  };
});