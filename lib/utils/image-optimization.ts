// 이미지 최적화를 위한 유틸리티 함수

// 이미지 지연 로딩을 위한 Observer 설정
export function setupLazyLoading() {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return;
  }
  
  const lazyImages = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        observer.unobserve(img);
      }
    });
  });
  
  lazyImages.forEach(img => {
    imageObserver.observe(img);
  });
}

// 이미지 최적화 함수
export function optimizeImageUrl(url: string, width: number = 100): string {
  // 이미 최적화된 URL인 경우 그대로 반환
  if (url.includes('w=' + width)) {
    return url;
  }
  
  // OpenWeatherMap 아이콘 최적화
  if (url.includes('openweathermap.org/img/wn/')) {
    // 이미 @2x가 포함된 경우 그대로 반환
    if (url.includes('@2x')) {
      return url;
    }
    // 아이콘 크기 지정
    return url.replace('.png', '@2x.png');
  }
  
  // 일반 이미지 URL에 width 파라미터 추가
  if (url.includes('?')) {
    return `${url}&w=${width}`;
  } else {
    return `${url}?w=${width}`;
  }
}

// 이미지 미리 로딩
export function preloadImages(urls: string[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  urls.forEach(url => {
    const img = new Image();
    img.src = url;
  });
}

// WebP 지원 여부 확인
export async function supportsWebP(): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false;
  }
  
  if ('createImageBitmap' in window && 'avif' in window) {
    return true; // 최신 브라우저는 WebP를 지원함
  }
  
  // 레거시 브라우저에서 WebP 지원 확인
  return new Promise(resolve => {
    const webP = new Image();
    webP.onload = () => resolve(webP.width > 0 && webP.height > 0);
    webP.onerror = () => resolve(false);
    webP.src = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
  });
}

// WebP 이미지 URL 생성
export function getWebPUrl(url: string): string {
  if (url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png')) {
    return url.substring(0, url.lastIndexOf('.')) + '.webp';
  }
  return url;
} 