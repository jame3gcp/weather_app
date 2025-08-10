function formatDecimal(value: number, decimals: number): string {
  const rounded = Number(value.toFixed(decimals));
  // 정수라면 소수점 제거
  if (Number.isInteger(rounded)) return String(rounded);
  return rounded.toFixed(decimals);
}

export function formatTemperature(temp: number, unit: 'celsius' | 'fahrenheit'): string {
  if (unit === 'fahrenheit') {
    const fahrenheit = (temp * 9) / 5 + 32;
    return `${formatDecimal(fahrenheit, 1)}°F`;
  }
  return `${formatDecimal(temp, 1)}°C`;
}

export function formatWindSpeed(speed: number, unit: 'ms' | 'kmh' | 'mph'): string {
  const safe = Math.max(0, speed);
  switch (unit) {
    case 'kmh': {
      const kmh = safe * 3.6;
      return `${formatDecimal(kmh, 1)} km/h`;
    }
    case 'mph': {
      const mph = safe * 2.237;
      const text = formatDecimal(mph, 1);
      return `${text} mph`;
    }
    default: {
      // m/s
      const text = formatDecimal(safe, 1);
      // 정수면 소수 제거: formatDecimal이 처리
      return `${text} m/s`;
    }
  }
}

export function formatPrecipitation(amount: number, unit: 'mm' | 'in'): string {
  const safe = Math.max(0, amount);
  if (unit === 'in') {
    const inches = safe / 25.4;
    return `${formatDecimal(inches, 1)} in`;
  }
  // mm: 정수는 정수로, 소수는 1자리
  const text = formatDecimal(safe, 1);
  return `${text} mm`;
}

export function formatProbability(probability: number): string {
  return `${Math.round(probability * 100)}%`;
}

export function formatDate(dateStr: string, locale: string = 'ko'): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatTime(dateStr: string, locale: string = 'ko'): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: 'numeric',
    hour12: locale === 'ko' ? false : true,
  }).format(date);
}

export function getWindDirection(degrees: number): string {
  // 8방위: N, NE, E, SE, S, SW, W, NW
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;
  const normalized = ((degrees % 360) + 360) % 360; // 0..359
  const index = Math.round(normalized / 45) % 8;
  return dirs[index];
}

export function getWeatherIconUrl(icon: string): string {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
} 