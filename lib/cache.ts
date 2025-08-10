// 캐시 키 생성 유틸리티
export function createCacheKey(path: string, params: Record<string, unknown>): string {
  const sortedParams = Object.entries(params)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
    
  return `${path}?${sortedParams}`;
}

// 메모리 캐시 구현
type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

class MemoryCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // 만료 확인
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }
  
  set<T>(key: string, data: T, ttlSeconds: number): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { data, expiresAt });
  }
  
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
}

// 싱글톤 인스턴스
export const memoryCache = new MemoryCache(); 