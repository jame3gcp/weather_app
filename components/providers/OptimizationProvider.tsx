'use client';

import { useEffect } from 'react';
import { setupLazyLoading } from '@/lib/utils/image-optimization';

interface OptimizationProviderProps {
  children: React.ReactNode;
}

export default function OptimizationProvider({ children }: OptimizationProviderProps) {
  useEffect(() => {
    // 페이지 로드 후 이미지 지연 로딩 설정
    setupLazyLoading();
    
    // 페이지 이동 시 이미지 지연 로딩 재설정
    const handleRouteChange = () => {
      setTimeout(() => {
        setupLazyLoading();
      }, 100);
    };
    
    document.addEventListener('routeChangeComplete', handleRouteChange);
    
    return () => {
      document.removeEventListener('routeChangeComplete', handleRouteChange);
    };
  }, []);
  
  return <>{children}</>;
} 