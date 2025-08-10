# 지역 선택 기반 날씨 정보 웹서비스 – 기능 명세서

## 1. 목적/범위
- **목적**: 사용자가 지역(도/시·군·구)을 선택하면 실시간(또는 최신) 날씨 정보(현재/시간별/일별 요약)를 제공.
- **범위**: 웹 클라이언트(모바일 우선) + 간단한 서버 프록시(API 키 보호) + 설정/로그/모니터링.
- **비범위(Out of Scope)**: 실측 IoT 센서 연동, 장기 예보(10일+), 알림/푸시, 사용자 계정.

## 2. 대상/플랫폼
- 대상: 일반 사용자(빠른 지역 선택 → 즉시 날씨 확인).
- 플랫폼: 최신 브라우저(모바일/데스크톱), PWA는 선택.

## 3. 주요 기능 요구사항
### 3.1 필수
1) **지역 선택**
   - 2단계(광역 → 기초) 혹은 검색형 자동완성.
   - 최근 선택 지역 **최대 5개** 저장(로컬 스토리지).
2) **현재 날씨 카드**
   - 기온, 체감, 습도, 풍속/풍향, 강수확률, 날씨 아이콘, 관측/발표 시각.
3) **시간별 예보(24시간)**
4) **일별 예보(최대 7일)**
5) **단위 전환**: 섭씨/화씨, 풍속(m/s, km/h), 강수(mm).
6) **기본 접근성**: 키보드 포커스, 명도 대비, 스크린리더 라벨.
7) **에러/로딩 상태**: 스켈레톤, 재시도 버튼, 친절한 오류 메시지.

### 3.2 선택(우선순위 낮음)
- 현재 위치(GPS)로 빠른 조회(동의 팝업).
- 즐겨찾기 지역 **핀 고정** 및 별칭.
- 다국어(i18n): ko → en 확장.

## 4. 사용자 흐름(핵심 시나리오)
1) 첫 방문 → 지역 선택 모달/패널 표시.  
2) 지역 선택 또는 검색 → 결과 클릭 → 대시보드에 현재/시간별/일별 섹션 렌더.  
3) 단위 전환/즐겨찾기/최근 지역 선택 → 즉시 반영/저장.  
4) 지역 변경 시 서버 호출 최소화(캐시 5~10분).

## 5. 정보구조(IA) & 화면 구성
- **/ (Home)**: 상단 검색/지역 선택 → 현재 날씨 카드 → 시간별 슬라이더 → 일별 리스트.  
- **컴포넌트(예)**  
  - `RegionPicker`(검색/카스케이드 선택, shadcn `Command`, `Popover`)  
  - `CurrentWeatherCard`(아이콘+지표 그리드)  
  - `HourlyForecastCarousel`(스크롤/슬라이더)  
  - `DailyForecastList`(아코디언 상세)  
  - `UnitToggle`(Segmented control)  
  - `ErrorState`, `LoadingSkeleton`  
  - `EmptyState`(지역 미선택 안내)

## 6. UI/디자인 원칙
- **모바일 우선**, Tailwind 유틸리티(반응형 sm/md/lg), 다크모드 준비.  
- shadcn UI 컴포넌트 활용(버튼, 카드, 스켈레톤, 커맨드 팔레트 등).  
- 색/아이콘은 의미 중심(맑음/비/눈 등) + 명도 대비 WCAG AA 이상.

## 7. 데이터 소스 & 서버 연동
- 외부 **Weather API**(예: OpenWeather/WeatherAPI 등) – 구체 공급자는 .env로 주입.  
- API 키 보호를 위해 **서버 프록시** 사용(클라이언트에서 직접 키 노출 금지).
- **캐시 정책**: 서버 5~10분, 클라이언트 SWR(선택)/단순 메모리 캐시.

### 7.1 내부 API 계약(예시)
- `GET /api/weather/current?lat={lat}&lon={lon}&units=metric|imperial&lang=ko`
- `GET /api/weather/hourly?lat={lat}&lon={lon}&hours=24`
- `GET /api/weather/daily?lat={lat}&lon={lon}&days=7`
- 공통 응답:  
  ```json
  {
    "location": {"name":"Seoul","lat":37.57,"lon":126.98},
    "updatedAt":"2025-08-10T08:00:00Z",
    "data": { ... }
  }
  ```
- 에러 응답:  
  ```json
  { "code":"UPSTREAM_ERROR", "message":"Weather provider unavailable", "traceId":"..." }
  ```

## 8. 환경변수(.env)
- `WEATHER_API_BASE`  
- `WEATHER_API_KEY`  
- `DEFAULT_LOCALE=ko`  
- `CACHE_TTL_SECONDS=600`

## 9. 비기능 요구사항
- **성능**: LCP < 2.5s(3G Fast 기준), 이미지 lazy, 아이콘 스프라이트/WebP.  
- **접근성**: 폼 라벨/aria, 포커스 트랩, 키보드 네비.  
- **보안**: API 키 서버 보관, CORS 제한(도메인 화이트리스트), 속도 제한(선택).  
- **로그/모니터링**: 요청 실패율, 외부 API 지연, 사용자 선택 이벤트(익명).

## 10. 예외 처리(표준)
- 서버: 외부 API 실패(4xx/5xx) → **429/502/504 매핑**, 재시도 전 지수 백오프.  
- 클라이언트: 네트워크 오류/타임아웃 → 에러 카드 + 재시도.  
- 지역 데이터 없음 → 빈 상태(가이드 텍스트 + 지역 선택 유도).

## 11. 테스트 전략
- **단위**: 포맷터, 매핑 함수, 캐시 유틸.  
- **컴포넌트**: 접근성(키보드), 조건부 렌더링, 로딩/에러.  
- **통합**: `/api/weather/*` 라우트 – 외부 API 모킹.  
- **E2E(선택)**: 지역 선택 → 현재/시간별/일별 표시 플로우.

## 12. 작업 분해/우선순위
1) 스캐폴드/의존성 설치(shadcn, Tailwind)  
2) 지역 선택/최근 지역 저장  
3) 서버 프록시 `/api/weather/*` + 캐시  
4) 현재/시간별/일별 섹션  
5) 단위 전환/다국어(선택)  
6) 접근성·성능 튜닝/테스트

## 13. 디렉터리 구조(Next.js App Router 가정)
```
src/
  app/
    page.tsx
    api/
      weather/
        current/route.ts
        hourly/route.ts
        daily/route.ts
  components/
    region/RegionPicker.tsx
    weather/CurrentWeatherCard.tsx
    weather/HourlyForecastCarousel.tsx
    weather/DailyForecastList.tsx
    ui/*
  lib/
    weather-client.ts
    cache.ts
    geo.ts
  types/
    weather.types.ts
```

## 14. 타입 스키마(요약 예시)
```ts
export interface Coordinates { lat: number; lon: number; }
export interface CurrentWeather {
  temp: number; feelsLike: number; humidity: number;
  windSpeed: number; windDeg: number; condition: string; icon: string;
}
export interface HourlyItem { time: string; temp: number; pop: number; icon: string; }
export interface DailyItem { date: string; min: number; max: number; pop: number; icon: string; }
```

## 15. 수용 기준(DoD)
- 지정 지역 선택 후 2초 이내 현재/시간별/일별 데이터 표시.  
- 네트워크 오류 시 에러 카드와 재시도 버튼 제공.  
- 최근 선택 지역 1개 이상 저장되고 재방문 시 기본 적용.  
- Lighthouse 접근성 90+, 성능 85+ (모바일).

## 16. 개발 구현 단계

### 1단계: 프로젝트 구조 설정 및 의존성 설치
- 디렉터리 구조 생성 (13번 항목 참고)
  - `app/api/weather/` 라우트 구조 생성
  - `components/region`, `components/weather`, `components/ui` 폴더 생성
  - `lib`, `types` 폴더 생성
- 필요한 의존성 설치
  - shadcn UI 컴포넌트 라이브러리
  - 상태 관리 라이브러리 (Zustand/Jotai)
  - SWR 또는 React Query (데이터 페칭)
  - 날짜/시간 라이브러리 (date-fns)

### 2단계: 지역 선택 기능 구현
- 지역 데이터 구조 정의 (types/geo.types.ts)
- 지역 선택 컴포넌트 (RegionPicker) 구현
  - 2단계 선택 UI (광역 → 기초) 또는 검색형 자동완성
- 로컬 스토리지 활용 최근 선택 지역 저장 (최대 5개)
- 지역 선택 관련 상태 관리 구현

### 3단계: 서버 프록시 API 구현
- 환경 변수 설정 (.env)
  - WEATHER_API_BASE, WEATHER_API_KEY 등
- 서버 API 라우트 구현
  - `/api/weather/current`
  - `/api/weather/hourly`
  - `/api/weather/daily`
- 캐싱 메커니즘 구현 (서버 5~10분)
- 에러 처리 및 응답 포맷 표준화

### 4단계: 날씨 컴포넌트 구현
- 타입 정의 (types/weather.types.ts)
- 현재 날씨 카드 (CurrentWeatherCard) 구현
  - 기온, 체감, 습도, 풍속/풍향, 강수확률, 날씨 아이콘 등 표시
- 시간별 예보 캐러셀 (HourlyForecastCarousel) 구현 (24시간)
- 일별 예보 리스트 (DailyForecastList) 구현 (최대 7일)
- 로딩 상태 및 에러 처리 컴포넌트 구현

### 5단계: 단위 전환 및 사용자 설정 구현
- 단위 전환 기능 구현
  - 섭씨/화씨
  - 풍속 단위 (m/s, km/h)
  - 강수량 단위 (mm)
- 사용자 설정 저장 (로컬 스토리지)
- 다국어 지원 (선택 사항)

### 6단계: 접근성 및 성능 최적화
- 키보드 포커스, 명도 대비, 스크린리더 라벨 등 접근성 개선
- 성능 최적화
  - 이미지 최적화 (아이콘 스프라이트/WebP)
  - 코드 스플리팅
  - 캐싱 전략 개선

### 7단계: 테스트 및 배포
- 단위 테스트 작성 (포맷터, 매핑 함수, 캐시 유틸)
- 컴포넌트 테스트 작성 (접근성, 조건부 렌더링, 로딩/에러)
- 통합 테스트 작성 (/api/weather/* 라우트)
- E2E 테스트 작성 (선택 사항)
- 배포 준비 및 최종 점검
