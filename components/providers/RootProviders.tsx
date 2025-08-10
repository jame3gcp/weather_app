'use client';

import { useEffect } from 'react';
import RegionInitializer from '@/components/region/RegionInitializer';
import OptimizationProvider from '@/components/providers/OptimizationProvider';
import { usePreferences } from '@/lib/stores/preferences';

export default function RootProviders({ children }: { children: React.ReactNode }) {
  const { rehydrateFromStorage, hasHydrated } = usePreferences();
  // 접근성: 키보드 포커스 표시 관리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-user');
      }
    };
    
    const handleMouseDown = () => {
      document.body.classList.remove('keyboard-user');
    };
    
    // 키보드 사용자와 마우스 사용자 구분
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    
    // 클라이언트에서 스토리지 값 동기화 (SSR/CSR 불일치 방지)
    rehydrateFromStorage();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);
  
  if (!hasHydrated) {
    // 클라이언트 재수화 전까지는 비워서 SSR/CSR 불일치 방지
    return null;
  }

  return (
    <RegionInitializer>
      <OptimizationProvider>
        {children}
      </OptimizationProvider>
    </RegionInitializer>
  );
} 