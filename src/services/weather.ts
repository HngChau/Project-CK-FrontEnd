import type { City, WeatherInfo } from '../types';

const STORAGE_KEY = 'dantri_selected_city';

// Open-Meteo: API miễn phí, không cần key, hỗ trợ CORS.
export const CITIES: City[] = [
  { name: 'Hà Nội', lat: 21.03, lon: 105.85 },
  { name: 'TP.HCM', lat: 10.82, lon: 106.63 },
  { name: 'Đà Nẵng', lat: 16.05, lon: 108.22 },
  { name: 'Hải Phòng', lat: 20.84, lon: 106.68 },
  { name: 'Cần Thơ', lat: 10.04, lon: 105.78 },
  { name: 'Huế', lat: 16.46, lon: 107.59 },
  { name: 'Nha Trang', lat: 12.23, lon: 109.19 },
  { name: 'Đà Lạt', lat: 11.94, lon: 108.45 },
  { name: 'Vũng Tàu', lat: 10.34, lon: 107.08 },
  { name: 'Quy Nhơn', lat: 13.78, lon: 109.22 },
  { name: 'Vinh', lat: 18.67, lon: 105.68 },
  { name: 'Buôn Ma Thuột', lat: 12.66, lon: 108.03 },
  { name: 'Biên Hòa', lat: 10.95, lon: 106.82 },
  { name: 'Cà Mau', lat: 9.17, lon: 105.15 },
];


//tim thanh pho
const removeAccents = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

export function searchCities(keyword: string): City[] {
  const query = removeAccents(keyword);
  return CITIES.filter((city) => removeAccents(city.name).includes(query));
}


//lưu thành phố gần nhất
export function saveSelectedCity(cityName: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, cityName);
  } catch {
  }
}

export function getSavedCity(): City {
  try {
    const savedName = localStorage.getItem(STORAGE_KEY);
    if (savedName) {
      const found = CITIES.find((c) => c.name === savedName);
      if (found) return found;
    }
  } catch {
  }
  return CITIES[0];
}

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
