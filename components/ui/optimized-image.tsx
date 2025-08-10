'use client';

import React from 'react';
import { optimizeImageUrl, getWebPUrl } from '@/lib/utils/image-optimization';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  loading = 'lazy'
}: OptimizedImageProps) {
  // 이미지 URL 최적화
  const optimizedSrc = optimizeImageUrl(src, width);
  const webPSrc = getWebPUrl(optimizedSrc);
  
  // 접근성 및 성능 속성 설정
  const imgProps: React.ImgHTMLAttributes<HTMLImageElement> = {
    alt,
    className,
    width,
    height,
    loading: priority ? 'eager' : loading,
    decoding: 'async',
    style: { height: 'auto' }
  };
  
  // 우선순위가 높은 이미지는 바로 로드
  if (priority) {
    return (
      <picture>
        <source srcSet={webPSrc} type="image/webp" />
        <img src={optimizedSrc} {...imgProps} />
      </picture>
    );
  }
  
  // 지연 로딩 적용
  return (
    <picture>
      <source data-srcset={webPSrc} type="image/webp" />
      <img data-src={optimizedSrc} {...imgProps} />
    </picture>
  );
} 