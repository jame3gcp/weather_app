import { Coordinates } from "./coordinates.types";

export interface Region {
  id: string;
  name: string;
  fullName: string;
  level: "province" | "city";
  parentId?: string;
  coordinates: Coordinates;
}

export interface RecentRegion extends Region {
  timestamp: number; // 선택한 시간 (정렬용)
} 