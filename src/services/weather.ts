import type { City, WeatherInfo } from '../types';

const STORAGE_KEY = 'dantri_selected_city';

// Open-Meteo: API miễn phí, không cần key, hỗ trợ CORS.
export const CITIES: City[] = [
  { name: 'Hà Nội', lat: 21.0285, lon: 105.8542 },
  { name: 'TP.HCM', lat: 10.8231, lon: 106.6297 },
  { name: 'Hải Phòng', lat: 20.8449, lon: 106.6881 },
  { name: 'Đà Nẵng', lat: 16.0544, lon: 108.2022 },
  { name: 'Cần Thơ', lat: 10.0452, lon: 105.7469 },
  { name: 'Huế', lat: 16.4637, lon: 107.5909 },

  { name: 'An Giang', lat: 10.5255, lon: 105.4249 },
  { name: 'Bắc Ninh', lat: 21.1861, lon: 106.0763 },
  { name: 'Cà Mau', lat: 9.1760, lon: 105.1524 },
  { name: 'Cao Bằng', lat: 22.6667, lon: 106.2500 },
  { name: 'Đắk Lắk', lat: 12.6667, lon: 108.0382 },
  { name: 'Điện Biên', lat: 21.3867, lon: 103.0232 },
  { name: 'Đồng Nai', lat: 10.9574, lon: 106.8427 },
  { name: 'Đồng Tháp', lat: 10.4579, lon: 105.6889 },
  { name: 'Gia Lai', lat: 13.9833, lon: 108.0000 },
  { name: 'Hà Tĩnh', lat: 18.3431, lon: 105.9055 },
  { name: 'Hưng Yên', lat: 20.6464, lon: 106.0511 },
  { name: 'Khánh Hòa', lat: 12.2530, lon: 109.1967 },
  { name: 'Lai Châu', lat: 22.3862, lon: 103.4703 },
  { name: 'Lâm Đồng', lat: 11.9404, lon: 108.4583 },
  { name: 'Lạng Sơn', lat: 21.8537, lon: 106.7615 },
  { name: 'Lào Cai', lat: 22.4809, lon: 103.9755 },
  { name: 'Nghệ An', lat: 18.6733, lon: 105.6922 },
  { name: 'Ninh Bình', lat: 20.2506, lon: 105.9745 },
  { name: 'Phú Thọ', lat: 21.3227, lon: 105.4020 },
  { name: 'Quảng Ngãi', lat: 15.1214, lon: 108.8044 },
  { name: 'Quảng Ninh', lat: 21.0064, lon: 107.2925 },
  { name: 'Quảng Trị', lat: 16.7504, lon: 107.1856 },
  { name: 'Sơn La', lat: 21.3256, lon: 103.9188 },
  { name: 'Tây Ninh', lat: 11.3352, lon: 106.1099 },
  { name: 'Thái Nguyên', lat: 21.5672, lon: 105.8252 },
  { name: 'Thanh Hóa', lat: 19.8067, lon: 105.7852 },
  { name: 'Tuyên Quang', lat: 21.8236, lon: 105.2142 },
  { name: 'Vĩnh Long', lat: 10.2537, lon: 105.9722 },
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
