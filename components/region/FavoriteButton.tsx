'use client';

import { useState } from 'react';
import { Star, StarOff } from 'lucide-react';
import { usePreferences } from '@/lib/stores/preferences';
import { Button } from '@/components/ui/button';

interface FavoriteButtonProps {
  regionId: string;
  className?: string;
}

export default function FavoriteButton({ regionId, className = '' }: FavoriteButtonProps) {
  const { favoriteRegions, toggleFavoriteRegion } = usePreferences();
  const [isAnimating, setIsAnimating] = useState(false);
  
  const isFavorite = favoriteRegions.includes(regionId);
  
  const handleToggleFavorite = () => {
    setIsAnimating(true);
    toggleFavoriteRegion(regionId);
    
    // 애니메이션 종료 후 상태 초기화
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggleFavorite}
      className={`transition-all ${isAnimating ? 'scale-125' : ''} ${className}`}
      aria-label={isFavorite ? '즐겨찾기에서 제거' : '즐겨찾기에 추가'}
      aria-pressed={isFavorite}
    >
      {isFavorite ? (
        <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" aria-hidden="true" />
      ) : (
        <StarOff className="h-5 w-5" aria-hidden="true" />
      )}
    </Button>
  );
} 