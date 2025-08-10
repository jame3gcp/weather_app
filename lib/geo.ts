import { Region } from '@/types/region.types';
import { Coordinates } from '@/types/coordinates.types';

// 한국 주요 도시 데이터 (실제 구현 시 더 많은 도시 데이터 추가 필요)
export const koreanCities: Region[] = [
  {
    id: 'seoul',
    name: 'Seoul',
    fullName: 'Seoul, South Korea',
    level: 'province',
    coordinates: { lat: 37.5665, lon: 126.9780 }
  },
  {
    id: 'busan',
    name: 'Busan',
    fullName: 'Busan, South Korea',
    level: 'province',
    coordinates: { lat: 35.1796, lon: 129.0756 }
  },
  {
    id: 'incheon',
    name: 'Incheon',
    fullName: 'Incheon, South Korea',
    level: 'province',
    coordinates: { lat: 37.4563, lon: 126.7052 }
  },
  {
    id: 'daegu',
    name: 'Daegu',
    fullName: 'Daegu, South Korea',
    level: 'province',
    coordinates: { lat: 35.8714, lon: 128.6014 }
  },
  {
    id: 'daejeon',
    name: 'Daejeon',
    fullName: 'Daejeon, South Korea',
    level: 'province',
    coordinates: { lat: 36.3504, lon: 127.3845 }
  },
  {
    id: 'gwangju',
    name: 'Gwangju',
    fullName: 'Gwangju, South Korea',
    level: 'province',
    coordinates: { lat: 35.1595, lon: 126.8526 }
  },
  {
    id: 'ulsan',
    name: 'Ulsan',
    fullName: 'Ulsan, South Korea',
    level: 'province',
    coordinates: { lat: 35.5384, lon: 129.3114 }
  },
  {
    id: 'sejong',
    name: 'Sejong',
    fullName: 'Sejong, South Korea',
    level: 'province',
    coordinates: { lat: 36.4800, lon: 127.2890 }
  },
  {
    id: 'gyeonggi',
    name: 'Gyeonggi',
    fullName: 'Gyeonggi-do, South Korea',
    level: 'province',
    coordinates: { lat: 37.4138, lon: 127.5183 }
  },
  {
    id: 'gangwon',
    name: 'Gangwon',
    fullName: 'Gangwon Special Self-Governing Province, South Korea',
    level: 'province',
    coordinates: { lat: 37.8228, lon: 128.1555 }
  },
  {
    id: 'chungbuk',
    name: 'Chungbuk',
    fullName: 'Chungcheongbuk-do, South Korea',
    level: 'province',
    coordinates: { lat: 36.6357, lon: 127.4912 }
  },
  {
    id: 'chungnam',
    name: 'Chungnam',
    fullName: 'Chungcheongnam-do, South Korea',
    level: 'province',
    coordinates: { lat: 36.6588, lon: 126.6728 }
  },
  {
    id: 'jeonbuk',
    name: 'Jeonbuk',
    fullName: 'Jeollabuk-do, South Korea',
    level: 'province',
    coordinates: { lat: 35.8202, lon: 127.1089 }
  },
  {
    id: 'jeonnam',
    name: 'Jeonnam',
    fullName: 'Jeollanam-do, South Korea',
    level: 'province',
    coordinates: { lat: 34.8679, lon: 126.9910 }
  },
  {
    id: 'gyeongbuk',
    name: 'Gyeongbuk',
    fullName: 'Gyeongsangbuk-do, South Korea',
    level: 'province',
    coordinates: { lat: 36.4919, lon: 128.8889 }
  },
  {
    id: 'gyeongnam',
    name: 'Gyeongnam',
    fullName: 'Gyeongsangnam-do, South Korea',
    level: 'province',
    coordinates: { lat: 35.4606, lon: 128.2132 }
  },
  {
    id: 'jeju',
    name: 'Jeju',
    fullName: 'Jeju Special Self-Governing Province, South Korea',
    level: 'province',
    coordinates: { lat: 33.4996, lon: 126.5312 }
  }
];

// 지역 검색 함수
export function searchRegions(query: string): Region[] {
  const q = (query || '').trim().toLowerCase();
  if (q.length === 0) return [];
  if (q.length < 2) return koreanCities;
  // Support Korean queries by mapping known Korean names
  const koreanAlias: Record<string, string[]> = {
    seoul: ['서울'],
    busan: ['부산'],
    incheon: ['인천'],
    daegu: ['대구'],
    daejeon: ['대전'],
    gwangju: ['광주'],
    ulsan: ['울산'],
    sejong: ['세종'],
    gyeonggi: ['경기', '경기도'],
    gangwon: ['강원'],
    chungbuk: ['충북'],
    chungnam: ['충남'],
    jeonbuk: ['전북'],
    jeonnam: ['전남'],
    gyeongbuk: ['경북'],
    gyeongnam: ['경남'],
    jeju: ['제주'],
  };

  return koreanCities.filter((city) => {
    const nameMatch = city.name.toLowerCase().includes(q) || city.fullName.toLowerCase().includes(q);
    const aliases = koreanAlias[city.id as keyof typeof koreanAlias] || [];
    const aliasMatch = aliases.some((k) => k.includes(query));
    return nameMatch || aliasMatch;
  });
}

// ID로 지역 찾기
export function findRegionById(id: string): Region | undefined {
  return koreanCities.find(city => city.id === id);
}

// 좌표로 가장 가까운 지역 찾기 (간단 구현)
export function findNearestRegion(coordinates: Coordinates): Region {
  const { lat, lon } = coordinates;
  
  let minDistance = Number.MAX_VALUE;
  let nearestRegion = koreanCities[0];
  
  for (const city of koreanCities) {
    const distance = calculateDistance(
      lat, lon, 
      city.coordinates.lat, city.coordinates.lon
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestRegion = city;
    }
  }
  
  return nearestRegion;
}

// 두 좌표 간 거리 계산 (Haversine 공식)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // 지구 반경 (km)
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
} 