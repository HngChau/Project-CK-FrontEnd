import type { City, WeatherInfo } from '../types';

// Open-Meteo: API miễn phí, không cần key, hỗ trợ CORS.
export const CITIES: City[] = [
  { name: 'Hà Nội', lat: 21.03, lon: 105.85 },
  { name: 'TP.HCM', lat: 10.82, lon: 106.63 },
  { name: 'Đà Nẵng', lat: 16.05, lon: 108.22 },
];

interface OpenMeteoResponse {
  current: { temperature_2m: number; weather_code: number };
}

export async function getWeather(city: City): Promise<WeatherInfo> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}` +
    '&current=temperature_2m,weather_code&timezone=Asia%2FBangkok';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Không lấy được thời tiết');
  const { current } = (await res.json()) as OpenMeteoResponse;
  return { temp: Math.round(current.temperature_2m), code: current.weather_code };
}

export function describeCode(code: number): string {
  if (code === 0) return 'Trời quang';
  if (code <= 3) return 'Có mây';
  if (code <= 48) return 'Sương mù';
  if (code <= 67) return 'Mưa';
  if (code <= 77) return 'Tuyết';
  if (code <= 82) return 'Mưa rào';
  return 'Dông';
}
